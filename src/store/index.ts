import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import LZString from 'lz-string';
import {
  blockWidth,
  blockHeight,
  cyrb53,
  getBlocksWidth,
  create2DArray,
  emptyBlock,
  mergeLayers,
  setStore as setAsciiStore,
} from '../ascii';
import type {
  RootState,
} from '../types/store';
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

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

const store = new Vuex.Store<RootState>({
  state: {
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
    brushBlocks: '',
    brushHistory: [],
    selectBlocks: '',
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
  },
  mutations: {
    changeState(state, payload: Partial<RootState>) {
      Object.assign(state, payload);
    },
    updateOptions(state, payload: Options) {
      state.options = { ...payload };
    },
    changeTab(state, payload: number) {
      state.tab = payload;
      document.title = `asciibird - ${state.asciibirdMeta[payload].title}`;
    },
    updateImageOverlay(state, payload: AsciibirdMeta['imageOverlay']) {
      state.asciibirdMeta[state.tab].imageOverlay = payload;
    },
    changeDebugPanelState(state, payload: PanelState) {
      state.debugPanelState = payload;
    },
    toggleDebugPanel(state, payload: boolean) {
      state.debugPanelState.visible = payload;
    },
    changeBrushLibraryState(state, payload: BrushLibraryState) {
      state.brushLibraryState = payload;
    },
    changeBrushPreviewState(state, payload: PanelState) {
      state.brushPreviewState = payload;
    },
    toggleBrushLibrary(state, payload: boolean) {
      state.brushLibraryState.visible = payload;
    },
    changeToolBarState(state, payload: PanelState & { draggable?: boolean }) {
      state.toolbarState.x = payload.x;
      state.toolbarState.y = payload.y;
      state.toolbarState.w = payload.w;
      state.toolbarState.h = payload.h;
      state.toolbarState.visible = payload.visible;
    },
    changeToolBarDraggable(state, payload: boolean) {
      state.toolbarState.draggable = payload;
    },
    changeLayersLibraryState(state, payload: PanelState) {
      state.layersLibraryState = payload;
    },
    changeAsciiWidthHeight(state, payload: { layers: Layer[] }) {
      state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
        JSON.stringify(payload.layers),
      );
    },
    changeAsciiCanvasState(state, payload: { x: number; y: number }) {
      state.asciibirdMeta[state.tab].x = payload.x;
      state.asciibirdMeta[state.tab].y = payload.y;
    },
    changeColourFg(state, payload: number) {
      state.toolbarState.currentColourFg = payload;
      state.toolbarState.isUpdating = false;
      state.toolbarState.isChoosingFg = false;
    },
    changeColourBg(state, payload: number) {
      state.toolbarState.currentColourBg = payload;
      state.toolbarState.isUpdating = false;
      state.toolbarState.isChoosingBg = false;
    },
    changeChar(state, payload: string) {
      state.toolbarState.selectedChar = payload;
      state.toolbarState.isUpdating = false;

      if (!state.toolbarState.persistCharPanel) {
        state.toolbarState.isChoosingChar = false;
      }
    },
    changeTool(state, payload: number) {
      state.toolbarState.currentTool = payload;
    },
    persistCharPanel(state, payload: boolean) {
      state.toolbarState.persistCharPanel = payload;
    },
    changeIsUpdatingFg(state, payload: boolean) {
      state.toolbarState.isChoosingFg = payload;
    },
    changeIsUpdatingBg(state, payload: boolean) {
      state.toolbarState.isChoosingBg = payload;
    },
    changeIsUpdatingChar(state, payload: boolean) {
      state.toolbarState.isChoosingChar = payload;
    },
    changeTargetingFg(state, payload: boolean) {
      state.toolbarState.targetingFg = payload;
    },
    changeTargetingBg(state, payload: boolean) {
      state.toolbarState.targetingBg = payload;
    },
    changeTargetingChar(state, payload: boolean) {
      state.toolbarState.targetingChar = payload;
    },
    changeMenuBarVisible(state, payload: boolean) {
      state.desktopState.menuBarVisible = payload;
    },
    changeTabsVisible(state, payload: boolean) {
      state.desktopState.tabsVisible = payload;
    },
    newAsciibirdMeta(state, payload: AsciibirdMeta) {
      state.asciibirdMeta.push(payload);
      state.tab = state.asciibirdMeta.length - 1;
      document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
    },
    updateToolBarState(state, payload: ToolbarState) {
      state.toolbarState = payload;
    },
    updateMirror(state, payload: { x: boolean; y: boolean }) {
      state.toolbarState.mirrorX = payload.x;
      state.toolbarState.mirrorY = payload.y;
    },
    updateAsciiBlocks(state, payload: {
      diff: { new: Block[]; old: Block[] };
      blocks: Block[][];
    }) {
      if (payload.diff && payload.diff.new && payload.diff.new.length) {
        if (state.asciibirdMeta[state.tab].history.length >= state.options.undoLimit) {
          state.asciibirdMeta[state.tab].history.shift();
        }

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );

        tempLayers[state.asciibirdMeta[state.tab].selectedLayer].data = payload.blocks;

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        const historyIndex = state.asciibirdMeta[state.tab].historyIndex;

        if (state.asciibirdMeta[state.tab].history.length !== historyIndex) {
          state.asciibirdMeta[state.tab].history.splice(
            historyIndex,
            state.asciibirdMeta[state.tab].history.length,
          );
        }

        state.asciibirdMeta[state.tab].history.push(
          LZString.compressToUTF16(JSON.stringify(payload.diff)),
        );

        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;

        if (historyIndex > state.asciibirdMeta[state.tab].history.length) {
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
        }
      }
    },

    //
    // LAYERS
    //
    addLayer(state) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      const width = tempLayers[0].width;
      const height = tempLayers[0].height;

      const newBlocksArray: Block[][] = create2DArray(height);

      // Push all the default ASCII blocks
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          newBlocksArray[y].push({ ...emptyBlock });
        }
      }

      tempLayers.push({
        label: 'Layer ' + Number.parseInt(String(tempLayers.length)),
        visible: true,
        data: [...newBlocksArray],
        width: width,
        height: height,
      });

      state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
        JSON.stringify(tempLayers),
      );

      state.asciibirdMeta[state.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(JSON.stringify({
          new: tempLayers,
          old: oldLayer,
        })),
      });

      state.asciibirdMeta[state.tab].historyIndex =
        state.asciibirdMeta[state.tab].history.length;

      state.asciibirdMeta[state.tab].selectedLayer =
        Number.parseInt(String(tempLayers.length)) - 1;
    },
    mergeAllLayers(state) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      const width = tempLayers[0].width;
      const height = tempLayers[0].height;
      const label = tempLayers[state.asciibirdMeta[state.tab].selectedLayer].label;

      const mergedLayersData = mergeLayers();
      const merged: Layer[] = [{
        visible: true,
        width: width,
        height: height,
        label: label,
        data: mergedLayersData,
      }];

      state.asciibirdMeta[state.tab].selectedLayer = 0;
      state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
        JSON.stringify(merged),
      );

      state.asciibirdMeta[state.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(JSON.stringify({
          new: merged,
          old: oldLayer,
        })),
      });

      state.asciibirdMeta[state.tab].historyIndex =
        state.asciibirdMeta[state.tab].history.length;
    },
    changeLayer(state, payload: number) {
      state.asciibirdMeta[state.tab].selectedLayer = payload;
    },
    toggleLayer(state, payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      const oldLayer = JSON.parse(JSON.stringify(tempLayers));

      tempLayers[payload].visible = !tempLayers[payload].visible;

      state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
        JSON.stringify(tempLayers),
      );

      state.asciibirdMeta[state.tab].history.push({
        t: 'l',
        d: LZString.compressToUTF16(JSON.stringify({
          new: tempLayers,
          old: oldLayer,
        })),
      });

      state.asciibirdMeta[state.tab].historyIndex =
        state.asciibirdMeta[state.tab].history.length;
    },
    removeLayer(state, payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      if (tempLayers.length > 1) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        tempLayers.splice(payload, 1);

        // Automatically select the next best layer to avoid bugs
        let selectedLayer = state.asciibirdMeta[state.tab].selectedLayer;

        while (tempLayers[selectedLayer] === undefined && selectedLayer >= 0) {
          selectedLayer--;
        }

        state.asciibirdMeta[state.tab].selectedLayer = selectedLayer;

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });

        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;
      }
    },
    upBrush(state, key: number) {
      const tempBrushLibrary = [...state.brushLibrary];

      if (tempBrushLibrary[key - 1] && tempBrushLibrary[key]) {
        const swap1 = tempBrushLibrary[key - 1];
        const swap = tempBrushLibrary[key];

        tempBrushLibrary[key - 1] = swap;
        tempBrushLibrary[key] = swap1;

        state.brushLibrary = tempBrushLibrary;
      }
    },
    downBrush(state, key: number) {
      const tempBrushLibrary = [...state.brushLibrary];

      if (tempBrushLibrary[key + 1] && tempBrushLibrary[key]) {
        const swap1 = tempBrushLibrary[key + 1];
        const swap = tempBrushLibrary[key];

        tempBrushLibrary[key + 1] = swap;
        tempBrushLibrary[key] = swap1;

        state.brushLibrary = tempBrushLibrary;
      }
    },
    downLayer(state, payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      if (tempLayers[payload + 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload + 1];
        const swap = tempLayers[payload];

        tempLayers[payload + 1] = swap;
        tempLayers[payload] = swap1;

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });
        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;

        state.asciibirdMeta[state.tab].selectedLayer = payload + 1;
      }
    },
    upLayer(state, payload: number) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      if (tempLayers[payload - 1]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));

        const swap1 = tempLayers[payload - 1];
        const swap = tempLayers[payload];

        tempLayers[payload - 1] = swap;
        tempLayers[payload] = swap1;

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });
        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;

        state.asciibirdMeta[state.tab].selectedLayer = payload - 1;
      }
    },
    updateLayerName(state, payload: { key: number; label: string }) {
      const tempLayers: Layer[] = JSON.parse(
        LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
      );

      if (tempLayers[payload.key]) {
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        tempLayers[payload.key].label = payload.label;
        const newLayers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].layers = newLayers;

        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });

        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;
      }
    },
    // ASCII
    updateAsciiTitle(state, payload: string) {
      state.asciibirdMeta[state.tab].title = payload;
    },
    // BLOCKS
    undoBlocks(state) {
      const historyIndex = state.asciibirdMeta[state.tab].historyIndex;

      if (state.asciibirdMeta[state.tab].history[historyIndex - 1]) {
        const prev = state.asciibirdMeta[state.tab].history[historyIndex - 1];

        // Process layer chunks
        if (
          (prev as { t: string }).t !== undefined &&
          (prev as { t: string }).t === 'l'
        ) {
          const data = JSON.parse(
            LZString.decompressFromUTF16(
              (prev as { d: string }).d,
            ),
          );

          state.asciibirdMeta[state.tab].layers =
            LZString.compressToUTF16(JSON.stringify(data.old));

          state.asciibirdMeta[state.tab].historyIndex--;

          // Automatically select the next best layer to avoid bugs
          const selectedLayer = state.asciibirdMeta[state.tab].selectedLayer;

          if (data.old[selectedLayer + 1]) {
            state.asciibirdMeta[state.tab].selectedLayer = selectedLayer + 1;
          } else if (data.old[selectedLayer - 1]) {
            state.asciibirdMeta[state.tab].selectedLayer = selectedLayer - 1;
          } else {
            state.asciibirdMeta[state.tab].selectedLayer = selectedLayer;
          }
          return;
        }

        const prevData = JSON.parse(
          LZString.decompressFromUTF16(
            state.asciibirdMeta[state.tab].history[historyIndex - 1] as string,
          ),
        );

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );

        // Process block chunks
        if (prevData.old) {
          for (const change in prevData.old) {
            const data = prevData.old[change];
            if (tempLayers[prevData.l] !== undefined) {
              tempLayers[prevData.l].data[data.y][data.x] = { ...data.b };
            }
          }
        }

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].historyIndex--;

        if (state.asciibirdMeta[state.tab].historyIndex >
            state.asciibirdMeta[state.tab].history.length) {
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
        }
      }
    },
    redoBlocks(state) {
      const historyIndex = state.asciibirdMeta[state.tab].historyIndex;

      let prev: any;

      if (state.asciibirdMeta[state.tab].history[historyIndex]) {
        prev = state.asciibirdMeta[state.tab].history[historyIndex];

        // Process layer chunks
        if (
          (prev as { t: string }).t !== undefined &&
          (prev as { t: string }).t === 'l'
        ) {
          const data = JSON.parse(
            LZString.decompressFromUTF16((prev as { d: string }).d),
          );

          state.asciibirdMeta[state.tab].layers =
            LZString.compressToUTF16(JSON.stringify(data.old));

          state.asciibirdMeta[state.tab].historyIndex++;
          return;
        }

        prev = JSON.parse(
          LZString.decompressFromUTF16(
            state.asciibirdMeta[state.tab].history[historyIndex] as string,
          ),
        );

        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );

        // Process block chunks
        if (prev.new && prev.l !== undefined) {
          for (const change in prev.new) {
            if (tempLayers[prev.l] !== undefined) {
              const data = prev.new[change];
              tempLayers[prev.l].data[data.y][data.x] = { ...data.b };
            }
          }
        }

        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );

        state.asciibirdMeta[state.tab].historyIndex++;

        if (state.asciibirdMeta[state.tab].historyIndex >
            state.asciibirdMeta[state.tab].history.length) {
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
        }
      }
    },

    //
    // Toolbar
    //
    updateBrushSize(state, payload: {
      brushSizeHeight: number;
      brushSizeWidth: number;
      brushSizeType: ToolbarState['brushSizeType'];
    }) {
      state.toolbarState.brushSizeHeight = payload.brushSizeHeight;
      state.toolbarState.brushSizeWidth = payload.brushSizeWidth;
      state.toolbarState.brushSizeType = payload.brushSizeType;
    },
    brushBlocks(state, payload: Block[][]) {
      state.brushBlocks = LZString.compressToUTF16(JSON.stringify(payload));
    },
    selectBlocks(state, payload: Block[][]) {
      state.selectBlocks = LZString.compressToUTF16(JSON.stringify(payload));
    },
    toggleGridView(state, payload: boolean) {
      state.toolbarState.gridView = payload;
    },
    toggleHalfBlockEditing(state, payload: boolean) {
      state.toolbarState.halfBlockEditing = payload;
    },
    toggleUpdateBrush(state, payload: boolean) {
      state.toolbarState.updateBrush = payload;
    },

    flipRotateBlocks(state, payload: { type: string }) {
      let tempBlocks: Block[][] = JSON.parse(
        LZString.decompressFromUTF16(state.brushBlocks),
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

      state.brushBlocks = LZString.compressToUTF16(
        JSON.stringify(parsedBlocks),
      );
    },

    // Brush Library
    pushBrushHistory(state, payload: Block[][]) {
      // Check and remove duplicate brushes based on hash value
      if (state.brushHistory.length >= state.options.brushLimit) {
        state.brushHistory.pop();
      }

      const hashValue = cyrb53(JSON.stringify(payload));
      state.brushHistory = state.brushHistory.filter(
        obj => obj.hash !== hashValue,
      );

      state.brushHistory.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue,
      });
    },
    pushBrushLibrary(state, payload: Block[][]) {
      // Check and remove duplicate brushes based on hash value
      const hashValue = cyrb53(JSON.stringify(payload));
      state.brushLibrary = state.brushLibrary.filter(
        obj => obj.hash !== hashValue,
      );

      state.brushLibrary.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue,
      });
    },
    removeBrushLibrary(state, payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      state.brushLibrary = state.brushLibrary.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    removeBrushHistory(state, payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      state.brushHistory = state.brushHistory.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    toggleDisableKeyboard(state, payload: boolean | null = null) {
      state.isKeyboardDisabled = (
        payload === null ? !state.isKeyboardDisabled : payload
      );
    },
    // Modals / Tabs
    openModal(state, type: string) {
      switch (type) {
        case 'new-ascii':
          state.modalState.newAscii = true;
          state.isKeyboardDisabled = true;
          break;

        case 'edit-ascii':
          state.modalState.editAscii = true;
          state.isKeyboardDisabled = true;
          break;

        case 'paste-ascii':
          state.modalState.pasteAscii = true;
          state.isKeyboardDisabled = true;
          break;

        case 'options':
          state.modalState.options = true;
          state.isKeyboardDisabled = true;
          break;

        case 'overlay':
          state.modalState.overlay = true;
          state.isKeyboardDisabled = true;
          break;

        case 'about':
          state.modalState.about = true;
          state.isKeyboardDisabled = true;
          break;

        case 'help':
          state.modalState.help = true;
          state.isKeyboardDisabled = true;
          break;
      }
    },
    closeModal(state, type: string) {
      switch (type) {
        case 'new-ascii':
          state.modalState.newAscii = false;
          state.isKeyboardDisabled = false;
          break;

        case 'edit-ascii':
          state.modalState.editAscii = false;
          state.isKeyboardDisabled = false;
          break;

        case 'paste-ascii':
          state.modalState.pasteAscii = false;
          state.isKeyboardDisabled = false;
          break;

        case 'options':
          state.modalState.options = false;
          state.isKeyboardDisabled = false;
          break;

        case 'overlay':
          state.modalState.overlay = false;
          state.isKeyboardDisabled = false;
          break;

        case 'about':
          state.modalState.about = false;
          state.isKeyboardDisabled = false;
          break;

        case 'help':
          state.modalState.help = false;
          state.isKeyboardDisabled = false;
          break;
      }
    },
    closeTab(state, tab: number) {
      state.asciibirdMeta.splice(tab, 1);

      // If we closed the tab we are viewing jump to the end tab
      if (tab === state.tab) {
        state.tab = state.asciibirdMeta.length - 1;
      }

      if (state.asciibirdMeta.length) {
        document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
      } else {
        document.title = 'asciibird';
      }
    },
  },
  getters: {
    state: (state) => state,
    modalState: (state) => state.modalState,
    options: (state) => state.options,
    toolbarState: (state) => state.toolbarState,
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
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      );
      return layers;
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
    selectedLayer: (state) => state.asciibirdMeta[state.tab]?.selectedLayer ?? 0,
    imageOverlay: (state) => state.asciibirdMeta[state.tab]?.imageOverlay,
    asciibirdMeta: (state) => state.asciibirdMeta,
    brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
    brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
    brushSizeType: (state) => state.toolbarState.brushSizeType,
    persistCharPanel: (state) => state.toolbarState.persistCharPanel,
    blockSizeMultiplier: (state) => state.blockSizeMultiplier,
    brushHistory: (state) => state.brushHistory,
    brushLibrary: (state) => state.brushLibrary,
    brushLibraryState: (state) => state.brushLibraryState,
    brushPreviewState: (state) => state.brushPreviewState,
    layersLibraryState: (state) => state.layersLibraryState,
    isKeyboardDisabled: (state) => state.isKeyboardDisabled,
    brushBlocks: (state): Block[] =>
      JSON.parse(LZString.decompressFromUTF16(state.brushBlocks)) || [],
    selectBlocks: (state): Block[] =>
      JSON.parse(LZString.decompressFromUTF16(state.selectBlocks)) || [],
    isModalOpen: (state): boolean => {
      const keys = Object.keys(state.modalState) as (keyof ModalState)[];
      return keys.some(key => state.modalState[key]);
    },
  },
  actions: {
    updateAsciiBlocksAsync(
      { commit }: { commit: Function },
      data: {
        diff: { new: Block[]; old: Block[] };
        blocks: Block[][];
      },
    ) {
      return new Promise((resolve) => {
        commit('updateAsciiBlocks', data);
        resolve(undefined);
      });
    },
  },
  modules: {},
  plugins: [vuexLocal.plugin],
});

// Break circular dependency: set store reference in ascii module
setAsciiStore(store);

export default store;
