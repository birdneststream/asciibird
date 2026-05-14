// IndexedDB persistence adapter for pinia-plugin-persistedstate
//
// Bridges pinia-plugin-persistedstate's synchronous StorageLike interface
// with async IndexedDB via an in-memory cache and microtask write queue.
//
// Lifecycle:
//   1. await idbPersistAdapter.init()  — preload cache, migrate LS → IDB
//   2. Stores use idbPersistAdapter as `persist.storage`
//   3. getItem() reads synchronously from cache
//   4. setItem() updates cache + queues async IDB write via microtask
//   5. beforeunload writes pending data to localStorage as safety net
//
// NOTE: Multi-tab sync is NOT supported. With localStorage, the `storage`
// event notifies other tabs of changes. IDB has no equivalent broadcast.
// If two tabs edit the same store, the last tab to flush wins silently.

import {
  set,
  del,
  setMany,
  entries,
  createStore,
  clear,
} from 'idb-keyval';
import type { UseStore } from 'idb-keyval';
import type { StorageLike } from 'pinia-plugin-persistedstate';

// ── Custom IDB store to avoid key collisions with other apps ──────────
const customStore: UseStore = createStore('asciibird', 'persist');

/**
 * Keys persisted through this adapter.
 * IMPORTANT: When adding a new Pinia store with IDB persistence, its
 * persist key MUST be added here so it's preloaded during init().
 */
const PERSISTED_KEYS = [
  'vuex',
  'asciibird-toolbar',
  'asciibird-panel',
  'asciibird-desktop',
  'asciibird-modal',
];

/** IDB schema version for future migration detection */
const SCHEMA_VERSION_KEY = '_idbSchemaVersion';
const SCHEMA_VERSION = 1;

/** WAL tombstone value — marks a key as deleted */
const WAL_DELETED = '__IDB_DELETED__';

/**
 * Buffered IndexedDB storage adapter compatible with
 * pinia-plugin-persistedstate's synchronous `StorageLike` interface.
 *
 * - In-memory cache enables synchronous `getItem()`
 * - Microtask write queue coalesces rapid mutations (e.g. 50 FPS drawing)
 *   into batched IDB writes, minimizing data-loss window to ~1 event loop tick
 * - Non-destructive migration: localStorage data is preserved as backup
 * - Falls back to localStorage if IndexedDB is unavailable
 */
class IdbPersistAdapter implements StorageLike {
  private cache = new Map<string, string>();
  private writeQueue = new Map<string, string>();
  private deleteQueue = new Set<string>();
  private writeScheduled = false;
  private initialized = false;
  private useFallback = false;
  private boundBeforeUnload: (() => void) | null = null;

  /** Whether the adapter has completed initialization */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /** Whether the adapter fell back to localStorage */
  get isFallback(): boolean {
    return this.useFallback;
  }

  /**
   * Initialize the adapter — MUST be awaited before Pinia store creation.
   *
   * 1. Attempts IDB access; falls back to localStorage if unavailable
   * 2. Preloads ALL keys from IDB into in-memory cache (not just known
   *    keys — prevents data loss if new stores are added)
   * 3. Migrates localStorage data to IDB (non-destructive)
   * 4. Sets schema version marker
   * 5. Registers beforeunload safety net
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Probe IDB availability and load ALL existing entries
      const allEntries = await entries(customStore);

      for (const [key, value] of allEntries) {
        if (typeof key === 'string' && typeof value === 'string') {
          this.cache.set(key, value);
        }
      }

      // Per-key migration: migrate any PERSISTED_KEYS that are in
      // localStorage but not yet in IDB. This handles the case where
      // some keys were migrated previously (e.g. 'vuex') while others
      // still only exist in localStorage (e.g. 'asciibird-panel').
      await this.migrateFromLocalStorage();

      // Set schema version (stored in IDB but not in cache — it's
      // metadata, not store data)
      await set(SCHEMA_VERSION_KEY, SCHEMA_VERSION, customStore);

      // Register beforeunload safety net
      this.boundBeforeUnload = this.handleBeforeUnload.bind(this);
      window.addEventListener('beforeunload', this.boundBeforeUnload);
    } catch {
      console.warn(
        '[idbPersistAdapter] IndexedDB unavailable, falling back to localStorage',
      );
      this.useFallback = true;
    }

    this.initialized = true;
  }

  /**
   * Migrate existing localStorage data to IndexedDB.
   * Non-destructive: does NOT remove localStorage data.
   * Also handles toolbar extraction from legacy Vuex store data.
   */
  private async migrateFromLocalStorage(): Promise<void> {
    const migratedEntries: [string, string][] = [];

    for (const key of PERSISTED_KEYS) {
      // Skip keys already present in IDB (loaded into cache in init)
      if (this.cache.has(key)) continue;
      const lsValue = localStorage.getItem(key);
      if (lsValue !== null) {
        this.cache.set(key, lsValue);
        migratedEntries.push([key, lsValue]);
      }
    }

    // Handle toolbar extraction from legacy Vuex data
    // (previously done in store serializer — consolidated here)
    const vuexRaw = this.cache.get('vuex');
    if (vuexRaw && !this.cache.has('asciibird-toolbar')) {
      try {
        const parsed = JSON.parse(vuexRaw);
        if (parsed?.toolbarState) {
          const toolbarData = {
            toolbarState: parsed.toolbarState,
            _brushBlocks: parsed._brushBlocks ?? parsed.brushBlocks ?? '',
            brushHistory: parsed.brushHistory ?? [],
            _selectBlocks: parsed._selectBlocks ?? parsed.selectBlocks ?? '',
            brushLibrary: parsed.brushLibrary ?? [],
          };
          const toolbarJson = JSON.stringify(toolbarData);
          this.cache.set('asciibird-toolbar', toolbarJson);
          migratedEntries.push(['asciibird-toolbar', toolbarJson]);
        }
      } catch {
        // Invalid JSON — skip toolbar extraction
      }
    }

    if (migratedEntries.length > 0) {
      await setMany(migratedEntries, customStore);
    }
  }

  /** Synchronous read from in-memory cache. */
  getItem(key: string): string | null {
    if (this.useFallback) {
      return localStorage.getItem(key);
    }
    return this.cache.get(key) ?? null;
  }

  /** Update cache immediately, queue async IDB write. */
  setItem(key: string, value: string): void {
    if (this.useFallback) {
      localStorage.setItem(key, value);
      return;
    }
    this.cache.set(key, value);
    this.deleteQueue.delete(key);
    this.writeQueue.set(key, value);
    this.scheduleWrite();
  }

  /** Remove from cache and schedule IDB deletion. */
  removeItem(key: string): void {
    if (this.useFallback) {
      localStorage.removeItem(key);
      return;
    }
    this.cache.delete(key);
    this.writeQueue.delete(key);
    this.deleteQueue.add(key);
    this.scheduleWrite();
  }

  /**
   * Force-drain pending writes to IndexedDB.
   * Useful for testing and explicit "save now" scenarios.
   */
  async flush(): Promise<void> {
    if (this.useFallback) return;
    if (!this.initialized) {
      // Not initialized — keep data in cache but don't attempt IDB writes.
      // Data is safe in memory and will be persisted once init() completes.
      return;
    }
    const writes = new Map(this.writeQueue);
    const deletes = new Set(this.deleteQueue);
    this.writeQueue.clear();
    this.deleteQueue.clear();
    this.writeScheduled = false;

    try {
      const ops: Promise<void>[] = [];
      for (const [key, value] of writes) {
        ops.push(set(key, value, customStore));
      }
      for (const key of deletes) {
        ops.push(del(key, customStore));
      }
      await Promise.all(ops);

      // Clear WAL entries for successfully flushed keys to prevent stale
      // WAL from overwriting fresh data on next session
      this.clearWALEntries(writes.keys(), deletes);
    } catch {
      // IDB write failed — data remains in cache for next retry
      // Re-queue the failed operations
      for (const [key, value] of writes) {
        if (!this.writeQueue.has(key)) {
          this.writeQueue.set(key, value);
        }
      }
      for (const key of deletes) {
        this.deleteQueue.add(key);
      }
      console.warn('[idbPersistAdapter] IDB flush failed, will retry');
    }
  }

  /**
   * Clean up event listeners. Call in test teardown.
   */
  destroy(): void {
    if (this.boundBeforeUnload) {
      window.removeEventListener('beforeunload', this.boundBeforeUnload);
      this.boundBeforeUnload = null;
    }
    this.cache.clear();
    this.writeQueue.clear();
    this.deleteQueue.clear();
    this.writeScheduled = false;
    this.initialized = false;
    this.useFallback = false;
  }

  /**
   * Clear all persisted data (cache + IDB + WAL).
   * Used by the "Clear and Reset ASCIIBIRD" action.
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    this.writeQueue.clear();
    this.deleteQueue.clear();
    this.writeScheduled = false;

    if (!this.useFallback) {
      try {
        await clear(customStore);
      } catch {
        // best effort
      }
    }

    for (const key of PERSISTED_KEYS) {
      localStorage.removeItem(`_idb_wal_${key}`);
    }
  }

  /** Schedule a microtask to drain the write queue. */
  private scheduleWrite(): void {
    if (this.writeScheduled) return;
    this.writeScheduled = true;
    queueMicrotask(() => {
      this.flush().catch(() => {
        // IDB write failed — data is safe in cache; will retry on next
        // setItem() or be written to localStorage WAL on tab close
      });
    });
  }

  /**
   * beforeunload handler — writes pending data to localStorage as a
   * safety net. Includes both write and delete operations.
   * The data may be too large for localStorage, but we attempt it
   * anyway for best-effort protection.
   */
  private handleBeforeUnload(): void {
    if (this.writeQueue.size === 0 && this.deleteQueue.size === 0) return;

    for (const [key, value] of this.writeQueue) {
      try {
        localStorage.setItem(`_idb_wal_${key}`, value);
      } catch {
        // localStorage quota exceeded — best effort
      }
    }
    for (const key of this.deleteQueue) {
      try {
        localStorage.setItem(`_idb_wal_${key}`, WAL_DELETED);
      } catch {
        // localStorage quota exceeded — best effort
      }
    }
  }

  /**
   * Recover write-ahead log entries from localStorage.
   * Called after init() to restore data from a previous tab close.
   * Safe in fallback mode — returns immediately.
   */
  async recoverWAL(): Promise<void> {
    if (this.useFallback) return;

    for (const key of PERSISTED_KEYS) {
      const walKey = `_idb_wal_${key}`;
      const walValue = localStorage.getItem(walKey);
      if (walValue !== null) {
        if (walValue === WAL_DELETED) {
          this.cache.delete(key);
          await del(key, customStore);
        } else {
          this.cache.set(key, walValue);
          await set(key, walValue, customStore);
        }
        localStorage.removeItem(walKey);
      }
    }
  }

  /**
   * Clear WAL entries for successfully flushed keys.
   * Prevents stale WAL from overwriting fresh IDB data on next session.
   */
  private clearWALEntries(
    writtenKeys: IterableIterator<string>,
    deletedKeys: Set<string>,
  ): void {
    for (const key of writtenKeys) {
      localStorage.removeItem(`_idb_wal_${key}`);
    }
    for (const key of deletedKeys) {
      localStorage.removeItem(`_idb_wal_${key}`);
    }
  }
}

/** Singleton adapter instance */
export const idbPersistAdapter = new IdbPersistAdapter();

export type { IdbPersistAdapter };
