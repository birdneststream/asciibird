// Pinia store for ASCIIBIRD
//
// Manages: tabs, layers, undo/redo, ASCII blocks, options.
// Toolbar state lives in useToolbarStore (store/toolbar.ts).

import { defineStore } from 'pinia';
import {
  mergeLayers,
  mergeTwoLayers,
} from '../ascii';
import {
  CANVAS_DEFAULT_X,
  CANVAS_DEFAULT_Y,
} from './panels';
import {
  compressLayers,
  decompressLayers,
  createEmptyLayer,
  compressData,
  decompressData,
  findNextVisibleLayer,
} from '../utils/layers';
import { cloneLayers } from '../utils/clone';
import { findMatches, replaceAtPositions } from '../utils/findReplace';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import { cropToContent as cropToContentUtil } from '../utils/cropContent';
import type { RootState } from '../types/store';
import type {
  Block,
  BlockDiff,
  Layer,
  Options,
  AsciibirdMeta,
  AsciibirdMetaBuilder,
  HistoryDiff,
  LayerHistoryData,
  HistoryEntry,
  FindCriteria,
  ReplaceSpec,
  MatchPosition,
} from '../types';
import { isLayerHistoryEntry } from '../types';

export const useAsciiBirdStore = defineStore('asciibird', {
  state: (): RootState => ({
    ver: 1,
    options: {
      defaultBg: 1,
      defaultFg: 0,
      renderOffScreen: false,
      undoLimit: 50,
      brushLimit: 50,
      tabLimit: 12,
      fps: 50,
    },
    tab: 0,
    asciibirdMeta: [] as AsciibirdMeta[],
    blockSizeMultiplier: 1,
  }),

  getters: {
    state: (state): RootState => state,
    currentTab: (state) => state.tab,
    currentAscii: (state) => state.asciibirdMeta[state.tab] ?? false,
    currentAsciiLayers: (state): Layer[] => {
      const meta = state.asciibirdMeta[state.tab];
      if (!meta) return [];
      return decompressLayers(meta.layers);
    },
    currentAsciiLayersWidthHeight: (state) => {
      const meta = state.asciibirdMeta[state.tab];
      if (!meta) return { width: 0, height: 0 };
      const layers = decompressLayers(meta.layers);
      return {
        width: layers[0].width,
        height: layers[0].height,
      };
    },
    selectedLayer: (state) =>
      state.asciibirdMeta[state.tab]?.selectedLayer ?? 0,
    imageOverlay: (state) =>
      state.asciibirdMeta[state.tab]?.imageOverlay,
  },

  actions: {
    changeState(payload: Partial<RootState>) {
      Object.assign(this, payload);
    },
    setBlockMultiplier(value: number) {
      this.blockSizeMultiplier = Math.max(0.5, Math.min(4, value));
    },
    updateOptions(payload: Options) {
      this.options = { ...payload };
    },
    changeTab(payload: number) {
      this.tab = payload;
      this.updateDocumentTitle();
    },
    updateImageOverlay(payload: AsciibirdMeta['imageOverlay']) {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return;
      meta.imageOverlay = payload;
    },
    changeAsciiWidthHeight(payload: { layers: Layer[] }) {
      this.asciibirdMeta[this.tab].layers =
        compressLayers(payload.layers);
    },
    changeAsciiCanvasState(payload: { x: number; y: number }) {
      this.asciibirdMeta[this.tab].x = payload.x;
      this.asciibirdMeta[this.tab].y = payload.y;
    },
    resetCanvasPosition() {
      const meta = this.asciibirdMeta[this.tab];
      if (meta) {
        meta.x = CANVAS_DEFAULT_X;
        meta.y = CANVAS_DEFAULT_Y;
      }
    },
    newAsciibirdMeta(payload: AsciibirdMetaBuilder) {
      // Compress layers if not already a string (supports both Layer[] and string)
      const layers = typeof payload.layers === 'string'
        ? payload.layers
        : compressLayers(payload.layers);
      const meta: AsciibirdMeta = { ...payload, layers };
      this.asciibirdMeta.push(meta);
      this.tab = this.asciibirdMeta.length - 1;
      this.updateDocumentTitle();
    },
    updateAsciiBlocks(
      payload: {
        diff: HistoryDiff;
        blocks: Block[][];
      },
    ) {
      if (payload.diff && payload.diff.new && payload.diff.new.length) {
        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        tempLayers[this.asciibirdMeta[this.tab].selectedLayer].data =
          payload.blocks;

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.pushHistoryDiff(payload.diff);
      }
    },

    /**
     * Replace colors across the active layer's canvas.
     * Iterates over target blocks, replaces matching fg/bg, records
     * a single undo diff for all changes.
     *
     * @returns Number of blocks changed
     */
    replaceColor(params: {
      sourceFg: number | null;
      sourceBg: number | null;
      targetFg: number;
      targetBg: number;
      replaceFg: boolean;
      replaceBg: boolean;
      selection?: { x: number; y: number; w: number; h: number };
    }): number {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return 0;

      const layers = decompressLayers(meta.layers);
      const layer = layers[meta.selectedLayer];
      if (!layer) return 0;

      const data = layer.data;
      const oldDiffs: BlockDiff[] = [];
      const newDiffs: BlockDiff[] = [];
      let changed = 0;

      const minY = params.selection?.y ?? 0;
      const maxY = params.selection
        ? Math.min(params.selection.y + params.selection.h, data.length)
        : data.length;

      for (let y = minY; y < maxY; y++) {
        const row = data[y];
        if (!row) continue;

        const minX = params.selection?.x ?? 0;
        const maxX = params.selection
          ? Math.min(params.selection.x + params.selection.w, row.length)
          : row.length;

        for (let x = minX; x < maxX; x++) {
          const block = row[x];
          if (!block) continue;

          let modified = false;
          const oldBlock = { ...block };

          if (params.replaceFg && params.sourceFg !== null) {
            if (block.fg === params.sourceFg) {
              block.fg = params.targetFg;
              modified = true;
            }
          }

          if (params.replaceBg && params.sourceBg !== null) {
            if (block.bg === params.sourceBg) {
              block.bg = params.targetBg;
              modified = true;
            }
          }

          if (modified) {
            oldDiffs.push({ x, y, b: oldBlock });
            newDiffs.push({ x, y, b: { ...block } });
            changed++;
          }
        }
      }

      if (changed > 0) {
        // Update layer data
        layers[meta.selectedLayer].data = data;
        meta.layers = compressLayers(layers);

        // Record single undo diff
        this.pushHistoryDiff({
          old: oldDiffs,
          new: newDiffs,
          l: meta.selectedLayer,
        });
      }

      return changed;
    },

    /**
     * Find and replace across the active layer's canvas.
     * Supports searching by character (literal/regex), fg, bg.
     * Returns match positions and count, with optional replace.
     *
     * When `replacement` is provided, applies replacement to matched
     * blocks and records a single undo diff for all changes.
     */
    findReplaceAction(params: {
      criteria: FindCriteria;
      replacement?: ReplaceSpec;
      scope?: MatchPosition[];
      errorOut?: { error?: { message: string; pattern: string } };
    }): { matches: MatchPosition[]; replaced: number } {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return { matches: [], replaced: 0 };

      const layers = decompressLayers(meta.layers);
      const layer = layers[meta.selectedLayer];
      if (!layer) return { matches: [], replaced: 0 };

      const data = layer.data;

      // Find matches (use provided scope or search all)
      const matches = params.scope
        ? params.scope
        : findMatches(data, params.criteria, params.errorOut);

      // If no replacement requested, just return matches
      if (!params.replacement || matches.length === 0) {
        return { matches, replaced: 0 };
      }

      // Apply replacement and get diffs
      const { oldDiffs, newDiffs } = replaceAtPositions(
        data,
        matches,
        params.replacement,
      );

      if (oldDiffs.length > 0) {
        // Update layer data
        layers[meta.selectedLayer].data = data;
        meta.layers = compressLayers(layers);

        // Record single undo diff
        this.pushHistoryDiff({
          old: oldDiffs,
          new: newDiffs,
          l: meta.selectedLayer,
        });
      }

      return { matches, replaced: oldDiffs.length };
    },

    // ── Private helpers ──────────────────────────────────────────

    /**
     * Apply a history diff in the given direction.
     * Shared logic for undoBlocks and redoBlocks.
     */
    applyHistoryDiff(direction: 'undo' | 'redo') {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return;

      const isUndo = direction === 'undo';
      const entryIndex = isUndo
        ? meta.historyIndex - 1
        : meta.historyIndex;

      const entry: HistoryEntry | undefined =
        meta.history[entryIndex];
      if (!entry) return;

      const indexDelta = isUndo ? -1 : 1;

      if (isLayerHistoryEntry(entry)) {
        const data = decompressData<LayerHistoryData>(entry.d);
        const layers = isUndo ? data.old : data.new;

        meta.layers = compressLayers(layers);
        meta.historyIndex += indexDelta;

        // Adjust selectedLayer to valid position in the restored state
        const selectedLayer = meta.selectedLayer;
        if (layers[selectedLayer + 1]) {
          meta.selectedLayer = selectedLayer + 1;
        } else if (layers[selectedLayer - 1]) {
          meta.selectedLayer = selectedLayer - 1;
        }
        return;
      }

      // Block-level diff
      const diff = decompressData<HistoryDiff>(entry);
      const diffs = isUndo ? diff.old : diff.new;
      const layerIndex = diff.l;
      if (!diffs || layerIndex === undefined) return;

      const tempLayers: Layer[] = decompressLayers(meta.layers);

      for (const change in diffs) {
        const d = diffs[change];
        if (tempLayers[layerIndex] !== undefined) {
          tempLayers[layerIndex].data[d.y][d.x] = { ...d.b };
        }
      }

      meta.layers = compressLayers(tempLayers);
      meta.historyIndex += indexDelta;
      this.clampHistoryIndex();
    },

    /** Set document.title to match current tab */
    updateDocumentTitle() {
      const meta = this.asciibirdMeta[this.tab];
      document.title = meta
        ? `asciibird - ${meta.title}`
        : 'asciibird';
    },

    /** Clamp historyIndex to valid range */
    clampHistoryIndex() {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return;
      if (meta.historyIndex > meta.history.length) {
        meta.historyIndex = meta.history.length;
      }
    },

    /**
     * Push a compressed HistoryDiff onto the undo stack.
     * Handles: undo limit enforcement, future history trimming,
     * push, and historyIndex update.
     */
    pushHistoryDiff(diff: HistoryDiff): void {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return;

      if (meta.history.length >= this.options.undoLimit) {
        meta.history.shift();
      }

      if (meta.history.length !== meta.historyIndex) {
        meta.history.splice(meta.historyIndex);
      }

      meta.history.push(compressData(diff));
      meta.historyIndex = meta.history.length;
    },

    /**
     * Decompress layers, clone for undo, apply mutation, compress,
     * and push to layer history.
     * @param mutate - modify layers in-place
     * @param afterCommit - optional callback after history is recorded
     *   (e.g. to update selectedLayer)
     */
    withLayerMutation(
      mutate: (layers: Layer[]) => void,
      afterCommit?: () => void,
    ): void {
      const layers = decompressLayers(
        this.asciibirdMeta[this.tab].layers,
      );
      const oldLayer = cloneLayers(layers);
      mutate(layers);
      this.asciibirdMeta[this.tab].layers =
        compressLayers(layers);
      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: compressData({ new: layers, old: oldLayer }),
      });
      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;
      afterCommit?.();
    },

    // ── Layers ──────────────────────────────────────────────────

    addLayer() {
      this.withLayerMutation(
        (layers) => {
          layers.push(createEmptyLayer(
            layers[0].width,
            layers[0].height,
            'Layer ' + layers.length,
          ));
        },
        () => {
          const layers = decompressLayers(
            this.asciibirdMeta[this.tab].layers,
          );
          this.asciibirdMeta[this.tab].selectedLayer =
            layers.length - 1;
        },
      );
    },
    mergeAllLayers() {
      this.withLayerMutation(
        (layers) => {
          const width = layers[0].width;
          const height = layers[0].height;
          const label =
            layers[this.asciibirdMeta[this.tab].selectedLayer].label;
          const mergedLayersData = mergeLayers();
          const merged: Layer[] = [{
            visible: true,
            width,
            height,
            label,
            data: mergedLayersData,
          }];
          layers.length = 0;
          layers.push(...merged);
        },
        () => {
          this.asciibirdMeta[this.tab].selectedLayer = 0;
        },
      );
    },
    /** Merge the selected layer into the layer below it. */
    mergeLayerDown() {
      const selectedLayer = this.asciibirdMeta[this.tab].selectedLayer;
      if (selectedLayer <= 0) return;

      this.withLayerMutation(
        (layers) => {
          const upper = layers[selectedLayer];
          const lower = layers[selectedLayer - 1];
          const mergedData = mergeTwoLayers(upper.data, lower.data);

          layers[selectedLayer - 1] = {
            ...lower,
            data: mergedData,
          };
          layers.splice(selectedLayer, 1);
        },
        () => {
          this.asciibirdMeta[this.tab].selectedLayer =
            Math.max(0, selectedLayer - 1);
        },
      );
    },
    /** Duplicate the selected layer (copy placed above). */
    duplicateLayer() {
      const selectedLayer = this.asciibirdMeta[this.tab].selectedLayer;

      this.withLayerMutation(
        (layers) => {
          const source = layers[selectedLayer];
          const copy: Layer = {
            label: `${source.label} (Copy)`,
            visible: source.visible,
            width: source.width,
            height: source.height,
            data: source.data.map(row =>
              row.map(block => ({ ...block })),
            ),
          };
          layers.splice(selectedLayer, 0, copy);
        },
        () => {
          // Select the new copy (same index, source shifted up)
          this.asciibirdMeta[this.tab].selectedLayer = selectedLayer;
        },
      );
    },
    changeLayer(payload: number) {
      this.asciibirdMeta[this.tab].selectedLayer = payload;
    },
    toggleLayer(payload: number) {
      const layers = decompressLayers(
        this.asciibirdMeta[this.tab].layers,
      );
      const wasVisible = layers[payload]?.visible ?? false;
      const wasSelectedLayer =
        payload === this.asciibirdMeta[this.tab].selectedLayer;

      this.withLayerMutation(
        (mutLayers) => {
          mutLayers[payload].visible = !mutLayers[payload].visible;
        },
        () => {
          if (wasVisible && wasSelectedLayer) {
            const currentLayers = decompressLayers(
              this.asciibirdMeta[this.tab].layers,
            );
            const next = findNextVisibleLayer(currentLayers, payload);
            if (next !== -1) {
              this.asciibirdMeta[this.tab].selectedLayer = next;
            }
          }
        },
      );
    },
    removeLayer(payload: number) {
      const layers = decompressLayers(
        this.asciibirdMeta[this.tab].layers,
      );
      if (layers.length <= 1) return;

      const wasSelectedLayer =
        payload === this.asciibirdMeta[this.tab].selectedLayer;

      this.withLayerMutation(
        (mutLayers) => {
          mutLayers.splice(payload, 1);
        },
        () => {
          const currentLayers = decompressLayers(
            this.asciibirdMeta[this.tab].layers,
          );
          if (wasSelectedLayer) {
            const searchFrom = Math.min(payload, currentLayers.length - 1);
            const next = findNextVisibleLayer(currentLayers, searchFrom);
            this.asciibirdMeta[this.tab].selectedLayer =
              next !== -1 ? next : searchFrom;
          } else if (payload < this.asciibirdMeta[this.tab].selectedLayer) {
            this.asciibirdMeta[this.tab].selectedLayer--;
          }
        },
      );
    },
    downLayer(payload: number) {
      this.withLayerMutation(
        (layers) => {
          if (!layers[payload + 1]) return;
          const swap = layers[payload + 1];
          layers[payload + 1] = layers[payload];
          layers[payload] = swap;
        },
        () => {
          this.asciibirdMeta[this.tab].selectedLayer = payload + 1;
        },
      );
    },
    upLayer(payload: number) {
      this.withLayerMutation(
        (layers) => {
          if (!layers[payload - 1]) return;
          const swap = layers[payload - 1];
          layers[payload - 1] = layers[payload];
          layers[payload] = swap;
        },
        () => {
          this.asciibirdMeta[this.tab].selectedLayer = payload - 1;
        },
      );
    },
    updateLayerName(payload: { key: number; label: string }) {
      this.withLayerMutation((layers) => {
        if (layers[payload.key]) {
          layers[payload.key].label = payload.label;
        }
      });
    },
    updateAsciiTitle(payload: string) {
      this.asciibirdMeta[this.tab].title = payload;
      this.updateDocumentTitle();
    },
    /**
     * Crop all layers to the bounding rectangle of non-empty content.
     * Uses withLayerMutation for proper undo support.
     * Resets canvas position after crop.
     */
    cropToContentAction(): boolean {
      const meta = this.asciibirdMeta[this.tab];
      if (!meta) return false;

      // Decompress and compute crop once — reuse result in mutation
      const layers = decompressLayers(meta.layers);
      const result = cropToContentUtil(layers);

      if (!result.cropped || !result.layers) return false;

      // Apply pre-computed crop with proper undo history
      this.withLayerMutation((originalLayers) => {
        originalLayers.length = 0;
        originalLayers.push(...result.layers!);
      });

      // Reset canvas position to defaults
      meta.x = CANVAS_DEFAULT_X;
      meta.y = CANVAS_DEFAULT_Y;

      return true;
    },

    // BLOCKS — undo/redo
    undoBlocks() {
      this.applyHistoryDiff('undo');
    },
    redoBlocks() {
      this.applyHistoryDiff('redo');
    },

    // Tabs
    closeTab(tab: number) {
      this.asciibirdMeta.splice(tab, 1);

      if (tab === this.tab) {
        this.tab = this.asciibirdMeta.length - 1;
      }

      this.updateDocumentTitle();
    },
  },
  persist: {
    key: 'vuex',
    storage: idbPersistAdapter,
    serializer: {
      serialize: (value: Record<string, unknown>) => {
        return JSON.stringify(value);
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        // Remove extracted state (now in separate stores)
        delete parsed.modalState;
        delete parsed.isKeyboardDisabled;
        delete parsed.desktopState;
        delete parsed.debugPanelState;
        delete parsed.brushLibraryState;
        delete parsed.brushPreviewState;
        delete parsed.layersLibraryState;
        // Remove toolbar state (now in useToolbarStore)
        delete parsed.toolbarState;
        delete parsed._brushBlocks;
        delete parsed._selectBlocks;
        delete parsed.brushHistory;
        delete parsed.brushLibrary;
        delete parsed.brushBlocks;
        delete parsed.selectBlocks;
        return parsed;
      },
    },
  },
});
