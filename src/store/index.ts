// Pinia store for ASCIIBIRD
// Converted from Vuex — mutations become actions using `this` instead of `state`

import { defineStore } from 'pinia';
import LZString from 'lz-string';
import {
  blockWidth,
  blockHeight,
  cyrb53,
  getBlocksWidth,
  create2DArray,
  emptyBlock,
  mergeLayers,
} from '../ascii';
import type { RootState } from '../types/store';
import type {
  Block,
  Layer,
  Options,
  ModalState,
  ToolbarState,
  PanelState,
  BrushLibraryState,
  AsciibirdMeta,
} from '../types';

export const useAsciiBirdStore = defineStore('asciibird', {
  state: (): RootState => ({
    ver: 1,
    modalState: {
      newAscii: false,
      editAscii: false,
      pasteAscii: false,
      options: false,
      overlay: false,
      about: false,
      help: false,
    },
    isKeyboardDisabled: false,
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
    desktopState: {
      menuBarVisible: true,
      tabsVisible: true,
    },
    asciibirdMeta: [] as AsciibirdMeta[],
    toolbarState: {
      currentColourFg: 0,
      currentColourBg: 1,
      isChoosingFg: false,
      isChoosingBg: false,
      isChoosingChar: false,
      persistCharPanel: false,
      brushSizeWidth: 1,
      brushSizeHeight: 1,
      brushSizeType: 'square',
      selectedFg: 0,
      selectedBg: 1,
      selectedChar: ' ',
      isUpdating: false,
      currentTool: 0,
      targetingFg: true,
      targetingBg: true,
      targetingChar: true,
      mirrorX: false,
      mirrorY: false,
      x: blockWidth * 2,
      y: blockHeight * 2,
      h: blockHeight * 19,
      w: blockWidth * 25,
      draggable: true,
      updateBrush: true,
      gridView: false,
      visible: true,
      halfBlockEditing: false,
    },
    debugPanelState: {
      x: blockWidth * 40,
      y: blockHeight * 20,
      h: blockHeight * 20,
      w: blockWidth * 40,
      visible: false,
    },
    blockSizeMultiplier: 1,
    _brushBlocks: '',
    brushHistory: [],
    _selectBlocks: '',
    brushLibrary: [],
    brushLibraryState: {
      x: blockWidth * 130,
      y: blockHeight * 23,
      h: blockHeight * 25,
      w: blockWidth * 35,
      visible: true,
      tab: 0,
    },
    brushPreviewState: {
      x: blockWidth * 2,
      y: blockHeight * 22,
      h: blockHeight * 19,
      w: blockWidth * 25,
      visible: true,
    },
    layersLibraryState: {
      x: blockWidth * 130,
      y: blockHeight * 2,
      h: blockHeight * 19,
      w: blockWidth * 35,
      visible: true,
    },
  }),

  getters: {
    state: (state): RootState => state,
    debugPanel: (state) => state.debugPanelState,
    tabsVisible: (state) => state.desktopState.tabsVisible,
    menuBarVisible: (state) => state.desktopState.menuBarVisible,
    currentTool: (state) => state.toolbarState.currentTool,
    isTargettingBg: (state) => state.toolbarState.targetingBg,
    isTargettingFg: (state) => state.toolbarState.targetingFg,
    isTargettingChar: (state) => state.toolbarState.targetingChar,
    currentFg: (state) => state.toolbarState.currentColourFg,
    currentBg: (state) => state.toolbarState.currentColourBg,
    currentChar: (state) => state.toolbarState.selectedChar,
    currentTab: (state) => state.tab,
    currentAscii: (state) => state.asciibirdMeta[state.tab] ?? false,
    currentAsciiLayers: (state): Layer[] => {
      const meta = state.asciibirdMeta[state.tab];
      if (!meta) return [];
      return JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      );
    },
    currentAsciiLayersWidthHeight: (state) => {
      const meta = state.asciibirdMeta[state.tab];
      if (!meta) return { width: 0, height: 0 };
      const blocks = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      );
      return {
        width: blocks[0].width,
        height: blocks[0].height,
      };
    },
    selectedLayer: (state) =>
      state.asciibirdMeta[state.tab]?.selectedLayer ?? 0,
    imageOverlay: (state) =>
      state.asciibirdMeta[state.tab]?.imageOverlay,
    brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
    brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
    brushSizeType: (state) => state.toolbarState.brushSizeType,
    // Decompressing getters — access compressed data as arrays
    brushBlocks: (state): Block[] =>
      JSON.parse(
        LZString.decompressFromUTF16(state._brushBlocks),
      ) || [],
    selectBlocks: (state): Block[] =>
      JSON.parse(
        LZString.decompressFromUTF16(state._selectBlocks),
      ) || [],
    isModalOpen: (state): boolean => {
      const keys = Object.keys(
        state.modalState,
      ) as (keyof ModalState)[];
      return keys.some(key => state.modalState[key]);
    },
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
    changeDebugPanelState(payload: PanelState) {
      this.debugPanelState = payload;
    },
    toggleDebugPanel(payload: boolean) {
      this.debugPanelState.visible = payload;
    },
    changeBrushLibraryState(payload: BrushLibraryState) {
      this.brushLibraryState = payload;
    },
    changeBrushPreviewState(payload: PanelState) {
      this.brushPreviewState = payload;
    },
    toggleBrushLibrary(payload: boolean) {
      this.brushLibraryState.visible = payload;
    },
    changeToolBarState(
      payload: PanelState & { draggable?: boolean },
    ) {
      this.toolbarState.x = payload.x;
      this.toolbarState.y = payload.y;
      this.toolbarState.w = payload.w;
      this.toolbarState.h = payload.h;
      this.toolbarState.visible = payload.visible;
    },
    changeToolBarDraggable(payload: boolean) {
      this.toolbarState.draggable = payload;
    },
    changeLayersLibraryState(payload: PanelState) {
      this.layersLibraryState = payload;
    },
    changeAsciiWidthHeight(payload: { layers: Layer[] }) {
      this.asciibirdMeta[this.tab].layers =
        LZString.compressToUTF16(
          JSON.stringify(payload.layers),
        );
    },
    changeAsciiCanvasState(payload: { x: number; y: number }) {
      this.asciibirdMeta[this.tab].x = payload.x;
      this.asciibirdMeta[this.tab].y = payload.y;
    },
    changeColourFg(payload: number) {
      this.toolbarState.currentColourFg = payload;
      this.toolbarState.isUpdating = false;
      this.toolbarState.isChoosingFg = false;
    },
    changeColourBg(payload: number) {
      this.toolbarState.currentColourBg = payload;
      this.toolbarState.isUpdating = false;
      this.toolbarState.isChoosingBg = false;
    },
    changeChar(payload: string) {
      this.toolbarState.selectedChar = payload;
      this.toolbarState.isUpdating = false;

      if (!this.toolbarState.persistCharPanel) {
        this.toolbarState.isChoosingChar = false;
      }
    },
    changeTool(payload: number) {
      this.toolbarState.currentTool = payload;
    },
    persistCharPanel(payload: boolean) {
      this.toolbarState.persistCharPanel = payload;
    },
    changeIsUpdatingFg(payload: boolean) {
      this.toolbarState.isChoosingFg = payload;
    },
    changeIsUpdatingBg(payload: boolean) {
      this.toolbarState.isChoosingBg = payload;
    },
    changeIsUpdatingChar(payload: boolean) {
      this.toolbarState.isChoosingChar = payload;
    },
    changeTargetingFg(payload: boolean) {
      this.toolbarState.targetingFg = payload;
    },
    changeTargetingBg(payload: boolean) {
      this.toolbarState.targetingBg = payload;
    },
    changeTargetingChar(payload: boolean) {
      this.toolbarState.targetingChar = payload;
    },
    changeMenuBarVisible(payload: boolean) {
      this.desktopState.menuBarVisible = payload;
    },
    changeTabsVisible(payload: boolean) {
      this.desktopState.tabsVisible = payload;
    },
    newAsciibirdMeta(payload: AsciibirdMeta) {
      this.asciibirdMeta.push(payload);
      this.tab = this.asciibirdMeta.length - 1;
      document.title = `asciibird - ${
        this.asciibirdMeta[this.tab].title
      }`;
    },
    updateToolBarState(payload: ToolbarState) {
      this.toolbarState = payload;
    },
    updateMirror(payload: { x: boolean; y: boolean }) {
      this.toolbarState.mirrorX = payload.x;
      this.toolbarState.mirrorY = payload.y;
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

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(
            this.asciibirdMeta[this.tab].layers,
          ),
        );

        tempLayers[this.asciibirdMeta[this.tab].selectedLayer].data =
          payload.blocks;

        this.asciibirdMeta[this.tab].layers =
          LZString.compressToUTF16(JSON.stringify(tempLayers));

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
          LZString.compressToUTF16(JSON.stringify(payload.diff)),
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
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
      );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      const width = tempLayers[0].width;
      const height = tempLayers[0].height;

      const newBlocksArray: Block[][] = create2DArray(height);

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          newBlocksArray[y].push({ ...emptyBlock });
        }
      }

      tempLayers.push({
        label: 'Layer ' + Number.parseInt(String(tempLayers.length)),
        visible: true,
        data: [...newBlocksArray],
        width,
        height,
      });

      this.asciibirdMeta[this.tab].layers =
        LZString.compressToUTF16(JSON.stringify(tempLayers));

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(
          JSON.stringify({ new: tempLayers, old: oldLayer }),
        ),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;

      this.asciibirdMeta[this.tab].selectedLayer =
        Number.parseInt(String(tempLayers.length)) - 1;
    },
    mergeAllLayers() {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
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
        LZString.compressToUTF16(JSON.stringify(merged));

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(
          JSON.stringify({ new: merged, old: oldLayer }),
        ),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;
    },
    changeLayer(payload: number) {
      this.asciibirdMeta[this.tab].selectedLayer = payload;
    },
    toggleLayer(payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
      );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      tempLayers[payload].visible = !tempLayers[payload].visible;

      this.asciibirdMeta[this.tab].layers =
        LZString.compressToUTF16(JSON.stringify(tempLayers));

      this.asciibirdMeta[this.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(
          JSON.stringify({ new: tempLayers, old: oldLayer }),
        ),
      });

      this.asciibirdMeta[this.tab].historyIndex =
        this.asciibirdMeta[this.tab].history.length;
    },
    removeLayer(payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
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
          LZString.compressToUTF16(JSON.stringify(tempLayers));

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(
            JSON.stringify({ new: tempLayers, old: oldLayer }),
          ),
        });

        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;
      }
    },
    upBrush(key: number) {
      const tempBrushLibrary = [...this.brushLibrary];

      if (tempBrushLibrary[key - 1] && tempBrushLibrary[key]) {
        const swap1 = tempBrushLibrary[key - 1];
        const swap = tempBrushLibrary[key];

        tempBrushLibrary[key - 1] = swap;
        tempBrushLibrary[key] = swap1;

        this.brushLibrary = tempBrushLibrary;
      }
    },
    downBrush(key: number) {
      const tempBrushLibrary = [...this.brushLibrary];

      if (tempBrushLibrary[key + 1] && tempBrushLibrary[key]) {
        const swap1 = tempBrushLibrary[key + 1];
        const swap = tempBrushLibrary[key];

        tempBrushLibrary[key + 1] = swap;
        tempBrushLibrary[key] = swap1;

        this.brushLibrary = tempBrushLibrary;
      }
    },
    downLayer(payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
      );

      if (tempLayers[payload + 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload + 1];
        const swap = tempLayers[payload];

        tempLayers[payload + 1] = swap;
        tempLayers[payload] = swap1;

        this.asciibirdMeta[this.tab].layers =
          LZString.compressToUTF16(JSON.stringify(tempLayers));

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(
            JSON.stringify({ new: tempLayers, old: oldLayer }),
          ),
        });
        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;

        this.asciibirdMeta[this.tab].selectedLayer = payload + 1;
      }
    },
    upLayer(payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
      );

      if (tempLayers[payload - 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload - 1];
        const swap = tempLayers[payload];

        tempLayers[payload - 1] = swap;
        tempLayers[payload] = swap1;

        this.asciibirdMeta[this.tab].layers =
          LZString.compressToUTF16(JSON.stringify(tempLayers));

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(
            JSON.stringify({ new: tempLayers, old: oldLayer }),
          ),
        });
        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;

        this.asciibirdMeta[this.tab].selectedLayer = payload - 1;
      }
    },
    updateLayerName(payload: { key: number; label: string }) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(
          this.asciibirdMeta[this.tab].layers,
        ),
      );

      if (tempLayers[payload.key]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        tempLayers[payload.key].label = payload.label;
        const newLayers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        this.asciibirdMeta[this.tab].layers = newLayers;

        this.asciibirdMeta[this.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(
            JSON.stringify({ new: tempLayers, old: oldLayer }),
          ),
        });

        this.asciibirdMeta[this.tab].historyIndex =
          this.asciibirdMeta[this.tab].history.length;
      }
    },
    updateAsciiTitle(payload: string) {
      this.asciibirdMeta[this.tab].title = payload;
    },

    // BLOCKS
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
          const data = JSON.parse(
            LZString.decompressFromUTF16(
              (prev as { d: string }).d,
            ),
          );

          this.asciibirdMeta[this.tab].layers =
            LZString.compressToUTF16(JSON.stringify(data.old));

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

        const prevData = JSON.parse(
          LZString.decompressFromUTF16(
            this.asciibirdMeta[this.tab].history[
              historyIndex - 1
            ] as string,
          ),
        );

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(
            this.asciibirdMeta[this.tab].layers,
          ),
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
          LZString.compressToUTF16(JSON.stringify(tempLayers));

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
          const data = JSON.parse(
            LZString.decompressFromUTF16(
              (prev as { d: string }).d,
            ),
          );

          this.asciibirdMeta[this.tab].layers =
            LZString.compressToUTF16(JSON.stringify(data.new));

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

        prev = JSON.parse(
          LZString.decompressFromUTF16(
            this.asciibirdMeta[this.tab].history[
              historyIndex
            ] as string,
          ),
        );

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(
            this.asciibirdMeta[this.tab].layers,
          ),
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
          LZString.compressToUTF16(JSON.stringify(tempLayers));

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

    // Toolbar
    updateBrushSize(
      payload: {
        brushSizeHeight: number;
        brushSizeWidth: number;
        brushSizeType: ToolbarState['brushSizeType'];
      },
    ) {
      this.toolbarState.brushSizeHeight = payload.brushSizeHeight;
      this.toolbarState.brushSizeWidth = payload.brushSizeWidth;
      this.toolbarState.brushSizeType = payload.brushSizeType;
    },
    setBrushBlocks(payload: Block[][]) {
      this._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(payload),
      );
    },
    setSelectBlocks(payload: Block[][]) {
      this._selectBlocks = LZString.compressToUTF16(
        JSON.stringify(payload),
      );
    },
    toggleGridView(payload: boolean) {
      this.toolbarState.gridView = payload;
    },
    toggleHalfBlockEditing(payload: boolean) {
      this.toolbarState.halfBlockEditing = payload;
    },
    toggleUpdateBrush(payload: boolean) {
      this.toolbarState.updateBrush = payload;
    },

    flipRotateBlocks(payload: { type: string }) {
      let tempBlocks: Block[][] = JSON.parse(
        LZString.decompressFromUTF16(this._brushBlocks),
      );
      const parsedBlocks: Block[][] = [];

      switch (payload.type) {
        case 'flip':
          tempBlocks = tempBlocks.reverse();
          for (let y = 0; y < tempBlocks.length; y++) {
            parsedBlocks[y] = tempBlocks[y];

            for (let x = 0; x < getBlocksWidth(tempBlocks); x++) {
              parsedBlocks[y][x] = tempBlocks[y][x];
            }
          }
          break;

        case 'rotate':
          for (let y = 0; y < tempBlocks.length; y++) {
            parsedBlocks[y] = tempBlocks[y].reverse();

            for (let x = 0; x < getBlocksWidth(tempBlocks); x++) {
              parsedBlocks[y][x] = tempBlocks[y][x];
            }
          }
          break;
      }

      this._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(parsedBlocks),
      );
    },

    // Brush Library
    pushBrushHistory(payload: Block[][]) {
      if (this.brushHistory.length >= this.options.brushLimit) {
        this.brushHistory.pop();
      }

      const hashValue = cyrb53(JSON.stringify(payload));
      this.brushHistory = this.brushHistory.filter(
        obj => obj.hash !== hashValue,
      );

      this.brushHistory.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue,
      });
    },
    pushBrushLibrary(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));
      this.brushLibrary = this.brushLibrary.filter(
        obj => obj.hash !== hashValue,
      );

      this.brushLibrary.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue,
      });
    },
    removeBrushLibrary(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      this.brushLibrary = this.brushLibrary.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    removeBrushHistory(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      this.brushHistory = this.brushHistory.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    toggleDisableKeyboard(payload: boolean | null = null) {
      this.isKeyboardDisabled =
        payload === null
          ? !this.isKeyboardDisabled
          : payload;
    },

    // Modals / Tabs
    openModal(type: string) {
      switch (type) {
        case 'new-ascii':
          this.modalState.newAscii = true;
          break;

        case 'edit-ascii':
          this.modalState.editAscii = true;
          break;

        case 'paste-ascii':
          this.modalState.pasteAscii = true;
          break;

        case 'options':
          this.modalState.options = true;
          break;

        case 'overlay':
          this.modalState.overlay = true;
          break;

        case 'about':
          this.modalState.about = true;
          break;

        case 'help':
          this.modalState.help = true;
          break;
      }
    },
    closeModal(type: string) {
      switch (type) {
        case 'new-ascii':
          this.modalState.newAscii = false;
          break;

        case 'edit-ascii':
          this.modalState.editAscii = false;
          break;

        case 'paste-ascii':
          this.modalState.pasteAscii = false;
          break;

        case 'options':
          this.modalState.options = false;
          break;

        case 'overlay':
          this.modalState.overlay = false;
          break;

        case 'about':
          this.modalState.about = false;
          break;

        case 'help':
          this.modalState.help = false;
          break;
      }
    },
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
    // Map old state keys to new names for backward compatibility
    // Old Vuex store had brushBlocks/selectBlocks as state,
    // now they're _brushBlocks/_selectBlocks (getters use the old names)
    serializer: {
      serialize: (value: Record<string, unknown>) => {
        // Rename _brushBlocks → brushBlocks, _selectBlocks → selectBlocks
        const out: Record<string, unknown> = { ...value };
        if ('_brushBlocks' in out) {
          out.brushBlocks = out._brushBlocks;
          delete out._brushBlocks;
        }
        if ('_selectBlocks' in out) {
          out.selectBlocks = out._selectBlocks;
          delete out._selectBlocks;
        }
        return JSON.stringify(out);
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        // Rename old keys to new names
        if ('brushBlocks' in parsed) {
          parsed._brushBlocks = parsed.brushBlocks;
          delete parsed.brushBlocks;
        }
        if ('selectBlocks' in parsed) {
          parsed._selectBlocks = parsed.selectBlocks;
          delete parsed.selectBlocks;
        }
        return parsed;
      },
    },
  },
});
