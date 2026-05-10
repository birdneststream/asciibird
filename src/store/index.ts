// Pinia store for ASCIIBIRD
// Converted from Vuex — mutations become actions using `this` instead of `state`
//
// Toolbar state extracted to useToolbarStore (store/toolbar.ts).
// This store manages: tabs, layers, undo/redo, ASCII blocks, options.

import { defineStore } from 'pinia';
import {
  mergeLayers,
} from '../ascii';
import {
  compressLayers,
  decompressLayers,
  createEmptyLayer,
  compressData,
  decompressData,
} from '../utils/layers';
import type { RootState } from '../types/store';
import type {
  Block,
  Layer,
  Options,
  AsciibirdMeta,
} from '../types';

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
    updateOptions(payload: Options) {
      this.options = { ...payload };
    },
    changeTab(payload: number) {
      this.tab = payload;
      document.title = `asciibird - ${this.asciibirdMeta[payload].title}`;
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
    newAsciibirdMeta(payload: AsciibirdMeta) {
      this.asciibirdMeta.push(payload);
      this.tab = this.asciibirdMeta.length - 1;
      document.title = `asciibird - ${
        this.asciibirdMeta[this.tab].title
      }`;
    },
    updateAsciiBlocks(
      payload: {
        diff: { new: Block[]; old: Block[] };
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

    // LAYERS
    addLayer() {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      const newLayer = createEmptyLayer(
        tempLayers[0].width,
        tempLayers[0].height,
        'Layer ' + Number.parseInt(String(tempLayers.length)),
      );

      tempLayers.push(newLayer);

      this.asciibirdMeta[this.tab].layers =
        compressLayers(tempLayers);

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: compressData({ new: tempLayers, old: oldLayer }),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;

      this.asciibirdMeta[this.tab].selectedLayer =
        Number.parseInt(String(tempLayers.length)) - 1;
    },
    mergeAllLayers() {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      const width = tempLayers[0].width;
      const height = tempLayers[0].height;
      const label =
        tempLayers[this.asciibirdMeta[this.tab].selectedLayer].label;

      const mergedLayersData = mergeLayers();
      const merged: Layer[] = [{
        visible: true,
        width,
        height,
        label,
        data: mergedLayersData,
      }];

      this.asciibirdMeta[this.tab].selectedLayer = 0;
      this.asciibirdMeta[this.tab].layers =
        compressLayers(merged);

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: compressData({ new: merged, old: oldLayer }),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;
    },
    changeLayer(payload: number) {
      this.asciibirdMeta[this.tab].selectedLayer = payload;
    },
    toggleLayer(payload: number) {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      tempLayers[payload].visible = !tempLayers[payload].visible;

      this.asciibirdMeta[this.tab].layers =
        compressLayers(tempLayers);

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: compressData({ new: tempLayers, old: oldLayer }),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;
    },
    removeLayer(payload: number) {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      if (tempLayers.length > 1) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        const wasSelectedLayer =
          payload === this.asciibirdMeta[this.tab].selectedLayer;

        tempLayers.splice(payload, 1);

        if (wasSelectedLayer) {
          let selectedLayer = Math.min(
            payload,
            tempLayers.length - 1,
          );

          if (!tempLayers[selectedLayer]?.visible) {
            let found = -1;
            for (let i = selectedLayer; i < tempLayers.length; i++) {
              if (tempLayers[i].visible) {
                found = i;
                break;
              }
            }
            if (found === -1) {
              for (let i = selectedLayer - 1; i >= 0; i--) {
                if (tempLayers[i].visible) {
                  found = i;
                  break;
                }
              }
            }
            if (found !== -1) {
              selectedLayer = found;
            }
          }

          this.asciibirdMeta[this.tab].selectedLayer = selectedLayer;
        } else if (payload < this.asciibirdMeta[this.tab].selectedLayer) {
          this.asciibirdMeta[this.tab].selectedLayer--;
        }

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: compressData({ new: tempLayers, old: oldLayer }),
        });

        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;
      }
    },
    downLayer(payload: number) {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      if (tempLayers[payload + 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload + 1];
        const swap = tempLayers[payload];

        tempLayers[payload + 1] = swap;
        tempLayers[payload] = swap1;

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: compressData({ new: tempLayers, old: oldLayer }),
        });
        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;

        this.asciibirdMeta[this.tab].selectedLayer = payload + 1;
      }
    },
    upLayer(payload: number) {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      if (tempLayers[payload - 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload - 1];
        const swap = tempLayers[payload];

        tempLayers[payload - 1] = swap;
        tempLayers[payload] = swap1;

        this.asciibirdMeta[this.tab].layers =
          compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: compressData({ new: tempLayers, old: oldLayer }),
        });
        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;

        this.asciibirdMeta[this.tab].selectedLayer = payload - 1;
      }
    },
    updateLayerName(payload: { key: number; label: string }) {
      const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

      if (tempLayers[payload.key]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        tempLayers[payload.key].label = payload.label;
        const newLayers = compressLayers(tempLayers);

        this.asciibirdMeta[this.tab].layers = newLayers;

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: compressData({ new: tempLayers, old: oldLayer }),
        });

        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;
      }
    },
    updateAsciiTitle(payload: string) {
      this.asciibirdMeta[this.tab].title = payload;
    },

    // BLOCKS — undo/redo
    undoBlocks() {
      const historyIndex =
        this.asciibirdMeta[this.tab].historyIndex;

      if (this.asciibirdMeta[this.tab].history[historyIndex - 1]) {
        const prev =
          this.asciibirdMeta[this.tab].history[historyIndex - 1];

        if (
          (prev as { t: string }).t !== undefined &&
          (prev as { t: string }).t === 'l'
        ) {
          const data = decompressData((prev as { d: string }).d);

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

        const prevData = decompressData(
          this.asciibirdMeta[this.tab].history[
            historyIndex - 1
          ] as string,
        );

        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        if (prevData.old) {
          for (const change in prevData.old) {
            const data = prevData.old[change];
            if (tempLayers[prevData.l] !== undefined) {
              tempLayers[prevData.l].data[data.y][data.x] = {
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

      let prev: any;

      if (this.asciibirdMeta[this.tab].history[historyIndex]) {
        prev = this.asciibirdMeta[this.tab].history[historyIndex];

        if (
          (prev as { t: string }).t !== undefined &&
          (prev as { t: string }).t === 'l'
        ) {
          const data = decompressData((prev as { d: string }).d);

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

        prev = decompressData(
          this.asciibirdMeta[this.tab].history[
            historyIndex
          ] as string,
        );

        const tempLayers: Layer[] = decompressLayers(
          this.asciibirdMeta[this.tab].layers,
        );

        if (prev.new && prev.l !== undefined) {
          for (const change in prev.new) {
            if (tempLayers[prev.l] !== undefined) {
              const data = prev.new[change];
              tempLayers[prev.l].data[data.y][data.x] = {
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

      if (this.asciibirdMeta.length) {
        document.title = `asciibird - ${
          this.asciibirdMeta[this.tab].title
        }`;
      } else {
        document.title = 'asciibird';
      }
    },
    updateAsciiBlocksAsync(
      data: {
        diff: { new: Block[]; old: Block[] };
        blocks: Block[][];
      },
    ) {
      this.updateAsciiBlocks(data);
      return Promise.resolve();
    },
  },
  persist: {
    key: 'vuex',
    storage: localStorage,
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
