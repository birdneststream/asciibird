// Pinia store for ASCIIBIRD
//
// Manages: tabs, layers, undo/redo, ASCII blocks, options.
// Toolbar state lives in useToolbarStore (store/toolbar.ts).

import { defineStore } from 'pinia';
import {
  mergeLayers,
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
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import type { RootState } from '../types/store';
import type {
  Block,
  BlockDiff,
  Layer,
  Options,
  AsciibirdMeta,
  HistoryDiff,
  LayerHistoryData,
  HistoryEntry,
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
      this.asciibirdMeta[this.tab].imageOverlay = payload;
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
    newAsciibirdMeta(payload: AsciibirdMeta) {
      this.asciibirdMeta.push(payload);
      this.tab = this.asciibirdMeta.length - 1;
      this.updateDocumentTitle();
    },
    updateAsciiBlocks(
      payload: {
        diff: { new: BlockDiff[]; old: BlockDiff[] };
        blocks: Block[][];
      },
    ) {
      if (payload.diff && payload.diff.new && payload.diff.new.length) {
        if (
          this.asciibirdMeta[this.tab].history.length
          >= this.options.undoLimit
        ) {
          this.asciibirdMeta[this.tab].history.shift();
        }

        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        tempLayers[this.asciibirdMeta[this.tab].selectedLayer].data =
          payload.blocks;

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        const historyIndex =
          this.asciibirdMeta[this.tab].historyIndex;

        if (
          this.asciibirdMeta[this.tab].history.length !== historyIndex
        ) {
          this.asciibirdMeta[this.tab].history.splice(
            historyIndex,
            this.asciibirdMeta[this.tab].history.length,
          );
        }

        this.asciibirdMeta[this.tab].history.push(
          compressData(payload.diff),
        );

        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;

        if (
          historyIndex > this.asciibirdMeta[this.tab].history.length
        ) {
          this.asciibirdMeta[this.tab].historyIndex =
            this.asciibirdMeta[this.tab].history.length;
        }
      }
    },

    // ── Private helpers ──────────────────────────────────────────

    /** Set document.title to match current tab */
    updateDocumentTitle() {
      const meta = this.asciibirdMeta[this.tab];
      document.title = meta
        ? `asciibird - ${meta.title}`
        : 'asciibird';
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
    changeLayer(payload: number) {
      this.asciibirdMeta[this.tab].selectedLayer = payload;
    },
    toggleLayer(payload: number) {
      const wasVisible = decompressLayers(
        this.asciibirdMeta[this.tab].layers,
      )[payload].visible;
      const wasSelectedLayer =
        payload === this.asciibirdMeta[this.tab].selectedLayer;

      this.withLayerMutation(
        (layers) => {
          layers[payload].visible = !layers[payload].visible;
        },
        () => {
          if (wasVisible && wasSelectedLayer) {
            const layers = decompressLayers(
              this.asciibirdMeta[this.tab].layers,
            );
            const next = findNextVisibleLayer(layers, payload);
            if (next !== -1) {
              this.asciibirdMeta[this.tab].selectedLayer = next;
            }
          }
        },
      );
    },
    removeLayer(payload: number) {
      const tempLayers = decompressLayers(
        this.asciibirdMeta[this.tab].layers,
      );
      if (tempLayers.length <= 1) return;

      const wasSelectedLayer =
        payload === this.asciibirdMeta[this.tab].selectedLayer;

      this.withLayerMutation(
        (layers) => {
          layers.splice(payload, 1);
        },
        () => {
          const layers = decompressLayers(
            this.asciibirdMeta[this.tab].layers,
          );
          if (wasSelectedLayer) {
            const searchFrom = Math.min(payload, layers.length - 1);
            const next = findNextVisibleLayer(layers, searchFrom);
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

    // BLOCKS — undo/redo
    undoBlocks() {
      const historyIndex =
        this.asciibirdMeta[this.tab].historyIndex;

      if (this.asciibirdMeta[this.tab].history[historyIndex - 1]) {
        const prev: HistoryEntry =
          this.asciibirdMeta[this.tab].history[historyIndex - 1];

        if (isLayerHistoryEntry(prev)) {
          const data = decompressData<LayerHistoryData>(prev.d);

          this.asciibirdMeta[this.tab].layers =
            compressLayers(data.old);

          this.asciibirdMeta[this.tab].historyIndex--;

          const selectedLayer =
            this.asciibirdMeta[this.tab].selectedLayer;

          if (data.old[selectedLayer + 1]) {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer + 1;
          } else if (data.old[selectedLayer - 1]) {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer - 1;
          } else {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer;
          }
          return;
        }

        const prevData = decompressData<HistoryDiff>(
          prev,
        );

        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        if (prevData.old) {
          for (const change in prevData.old) {
            const data = prevData.old[change];
            if (tempLayers[prevData.l!] !== undefined) {
              tempLayers[prevData.l!].data[data.y][data.x] = {
                ...data.b,
              };
            }
          }
        }

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].historyIndex--;

        if (
          this.asciibirdMeta[this.tab].historyIndex >
          this.asciibirdMeta[this.tab].history.length
        ) {
          this.asciibirdMeta[this.tab].historyIndex =
            this.asciibirdMeta[this.tab].history.length;
        }
      }
    },
    redoBlocks() {
      const historyIndex =
        this.asciibirdMeta[this.tab].historyIndex;

      if (this.asciibirdMeta[this.tab].history[historyIndex]) {
        const prev: HistoryEntry =
          this.asciibirdMeta[this.tab].history[historyIndex];

        if (isLayerHistoryEntry(prev)) {
          const data = decompressData<LayerHistoryData>(prev.d);

          this.asciibirdMeta[this.tab].layers =
            compressLayers(data.new);

          this.asciibirdMeta[this.tab].historyIndex++;

          const selectedLayer =
            this.asciibirdMeta[this.tab].selectedLayer;

          if (data.new[selectedLayer + 1]) {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer + 1;
          } else if (data.new[selectedLayer - 1]) {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer - 1;
          } else {
            this.asciibirdMeta[this.tab].selectedLayer =
              selectedLayer;
          }
          return;
        }

        const redoData = decompressData<HistoryDiff>(
          prev,
        );

        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        if (redoData.new && redoData.l !== undefined) {
          for (const change in redoData.new) {
            if (tempLayers[redoData.l] !== undefined) {
              const data = redoData.new[change];
              tempLayers[redoData.l].data[data.y][data.x] = {
                ...data.b,
              };
            }
          }
        }

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].historyIndex++;

        if (
          this.asciibirdMeta[this.tab].historyIndex >
          this.asciibirdMeta[this.tab].history.length
        ) {
          this.asciibirdMeta[this.tab].historyIndex =
            this.asciibirdMeta[this.tab].history.length;
        }
      }
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
