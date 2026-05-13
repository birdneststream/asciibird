import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import Dashboard from './Dashboard.vue';
import { setStore, setModalStore } from './ascii';
import { useAsciiBirdStore } from './store';
import { useModalStore } from './store/modal';
import { useDesktopStore } from './store/desktop';
import { usePanelStore } from './store/panels';
import { idbPersistAdapter } from './utils/idbPersistAdapter';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import 'material-icons/iconfont/material-icons.css';
import './style.scss';

// ── Bootstrap ─────────────────────────────────────────────────────────
// 1. Sync: Legacy Vuex → Pinia localStorage migration
// 2. Await: IndexedDB adapter init (preload cache, migrate LS → IDB)
// 3. Sync: Create Pinia, instantiate stores, mount app

async function bootstrap() {
  // ── Step 1: Legacy Vuex localStorage → Pinia stores ─────────────
  // Migrates user data from old Vue 2 / Vuex localStorage format to
  // separate Pinia persisted-state keys. Idempotent; safe for upgrades.
  if (localStorage.getItem('vuex')) {
    try {
      const asciiCache = JSON.parse(
        localStorage.getItem('vuex') || '{}',
      );

      // Remove unversioned old cache
      if (asciiCache && asciiCache.ver === undefined) {
        localStorage.removeItem('vuex');
        window.location.reload();
        return; // unreachable, but clarifies intent
      }

      // Migrate extracted state to separate localStorage keys.
      // Idempotent — only writes if the target key doesn't exist.
      if (!localStorage.getItem('asciibird-modal')) {
        if (asciiCache.modalState) {
          localStorage.setItem(
            'asciibird-modal',
            JSON.stringify({
              modalState: asciiCache.modalState,
              isKeyboardDisabled:
                asciiCache.isKeyboardDisabled ?? false,
            }),
          );
        }
      }

      if (!localStorage.getItem('asciibird-desktop')) {
        if (asciiCache.desktopState) {
          localStorage.setItem(
            'asciibird-desktop',
            JSON.stringify({
              desktopState: asciiCache.desktopState,
            }),
          );
        }
      }

      if (!localStorage.getItem('asciibird-panel')) {
        const hasPanelData =
          asciiCache.debugPanelState ||
          asciiCache.brushLibraryState ||
          asciiCache.brushPreviewState ||
          asciiCache.layersLibraryState;

        if (hasPanelData) {
          localStorage.setItem(
            'asciibird-panel',
            JSON.stringify({
              debugPanel: asciiCache.debugPanelState,
              brushLibrary: asciiCache.brushLibraryState,
              brushPreview: asciiCache.brushPreviewState,
              layersLibrary: asciiCache.layersLibraryState,
            }),
          );
        }
      }
    } catch {
      localStorage.removeItem('vuex');
      window.location.reload();
      return;
    }
  }

  // ── Step 2: Init IndexedDB adapter ───────────────────────────────
  // Preloads IDB data into in-memory cache for sync reads.
  // Migrates localStorage → IndexedDB for large stores (non-destructive).
  try {
    await idbPersistAdapter.init();
    // Recover any write-ahead log entries from a previous tab close
    await idbPersistAdapter.recoverWAL();
  } catch (e) {
    console.warn(
      '[main] IndexedDB init failed, continuing with fallback:',
      e,
    );
  }

  // ── Step 3: Create Pinia, stores, and mount ──────────────────────
  const pinia = createPinia();
  pinia.use(createPersistedState());

  const app = createApp(Dashboard);
  app.use(pinia);

  // Break circular dependency: set store references in ascii module
  const store = useAsciiBirdStore();
  setStore(store);

  const modalStore = useModalStore();
  setModalStore(modalStore);

  // Initialize desktop + panel stores (needed for lazy registration)
  useDesktopStore();
  usePanelStore();

  app.mount('#app');
}

bootstrap();
