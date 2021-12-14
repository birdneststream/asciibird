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
  mergeLayers
} from "../ascii";

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

export default new Vuex.Store({

  state: {
    modalState: {
      newAscii: false,
      editAscii: false,
      pasteAscii: false,
      options: false,
      overlay: false,
    },
    isKeyboardDisabled: false,
    // The various options of ASCIIBIRD will eventually
    // end up in its own modal I guess
    options: {
      defaultBg: 1,
      defaultFg: 0,
      renderOffScreen: true,
      undoLimit: 50,
      brushLimit: 50,
      tabLimit: 12,
      fps: 50,
    },
    // Current tab user is viewing
    tab: 0,
    // asciibirdMeta holds all of the ASCII information for all the tabs
    asciibirdMeta: [],
    toolbarState: {
      currentColourFg: 0,
      currentColourBg: 1,
      isChoosingFg: false,
      isChoosingBg: false,
      isChoosingChar: false,
      brushSizeWidth: 1,
      brushSizeHeight: 1,
      // square, circle, cross
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
    },
    debugPanelState: {
      x: blockWidth * 40,
      y: blockHeight * 20,
      h: blockHeight * 20,
      w: blockWidth * 40,
      visible: false,
    },
    blockSizeMultiplier: 1,
    brushBlocks: [],
    brushHistory: [],
    selectBlocks: [],
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
    changeState(state, payload) {
      Object.assign(state, payload);
    },
    updateOptions(state, payload) {
      state.options = { ... payload};
    },
    changeTab(state, payload) {
      state.tab = payload;
      document.title = `asciibird - ${state.asciibirdMeta[payload].title}`;
    },
    updateImageOverlay(state, payload) {
      state.asciibirdMeta[state.tab].imageOverlay = payload;
    },
    changeDebugPanelState(state, payload) {
      state.debugPanelState = payload;
    },
    toggleDebugPanel(state, payload) {
      state.debugPanelState.visible = payload;
    },
    changeBrushLibraryState(state, payload) {
      state.brushLibraryState = payload;
    },
    changeBrushPreviewState(state, payload) {
      state.brushPreviewState = payload;
    },
    toggleBrushLibrary(state, payload) {
      state.brushLibraryState.visible = payload;
    },
    changeToolBarState(state, payload) {
      state.toolbarState.x = payload.x;
      state.toolbarState.y = payload.y;
      state.toolbarState.w = payload.w;
      state.toolbarState.h = payload.h;
    },
    changeToolBarDraggable(state, payload) {
      state.toolbarState.draggable = payload;
    },
    changeLayersLibraryState(state, payload) {
      state.layersLibraryState = payload;
    },
    changeAsciiWidthHeight(state, payload) {
      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
        payload.layers));
    },
    changeAsciiCanvasState(state, payload) {
      state.asciibirdMeta[state.tab].x = payload.x;
      state.asciibirdMeta[state.tab].y = payload.y;
    },
    changeColourFg(state, payload) {
      state.toolbarState.currentColourFg = payload;
      state.toolbarState.isUpdating = false;
      state.toolbarState.isChoosingFg = false;
    },
    changeColourBg(state, payload) {
      state.toolbarState.currentColourBg = payload;
      state.toolbarState.isUpdating = false;
      state.toolbarState.isChoosingBg = false;
    },
    changeChar(state, payload) {
      state.toolbarState.selectedChar = payload;
      state.toolbarState.isUpdating = false;
      state.toolbarState.isChoosingChar = false;
    },
    changeTool(state, payload) {
      state.toolbarState.currentTool = payload;
    },
    changeIsUpdatingFg(state, payload) {
      state.toolbarState.isChoosingFg = payload;
    },
    changeIsUpdatingBg(state, payload) {
      state.toolbarState.isChoosingBg = payload;
    },
    changeIsUpdatingChar(state, payload) {
      state.toolbarState.isChoosingChar = payload;
    },
    changeTargetingFg(state, payload) {
      state.toolbarState.targetingFg = payload;
    },
    changeTargetingBg(state, payload) {
      state.toolbarState.targetingBg = payload;
    },
    changeTargetingChar(state, payload) {
      state.toolbarState.targetingChar = payload;
    },
    newAsciibirdMeta(state, payload) {
      state.asciibirdMeta.push(payload);
      state.tab = state.asciibirdMeta.length - 1;
      document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
    },
    updateToolBarState(state, payload) {
      state.toolbarState = payload;
    },
    updateMirror(state, payload) {
      state.toolbarState.mirrorX = payload.x;
      state.toolbarState.mirrorY = payload.y;
    },
    updateAsciiBlocks(state, payload, skipUndo = false) {
      if (state.asciibirdMeta[state.tab].history.length >= state.options.undoLimit) {
        state.asciibirdMeta[state.tab].history.shift()
      }

      if (!skipUndo) {
        state.asciibirdMeta[state.tab].history.push(state.asciibirdMeta[state.tab].blocks);
      }

      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))
      tempLayers[state.asciibirdMeta[state.tab].selectedLayer].data = payload

      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
        tempLayers));
      state.asciibirdMeta[state.tab].redo = [];
    },

    //
    // LAYERS
    //
    addLayer(state) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      let width = tempLayers[0].width;
      let height = tempLayers[0].height;

      let newBlocksArray = create2DArray(height);

      // Push all the default ASCII blocks
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          newBlocksArray[y].push({
            ...emptyBlock,
          });
        }
      }

      tempLayers.push({
        label: 'Layer ' + Number.parseInt(tempLayers.length),
        visible: true,
        data: [...newBlocksArray],
        width: width,
        height: height
      })

      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
        tempLayers));
    },
    mergeAllLayers(state) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      let width = tempLayers[0].width;
      let height = tempLayers[0].height;
      let label = tempLayers[state.asciibirdMeta[state.tab].selectedLayer].label;

      let mergedLayers = [{
        visible: true,
        width: width,
        height: height,
        label: label,
        data: mergeLayers()
      }];

      state.asciibirdMeta[state.tab].selectedLayer = 0;
      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
        mergedLayers));
    },
    changeLayer(state, payload) {
      state.asciibirdMeta[state.tab].selectedLayer = payload
    },
    toggleLayer(state, payload) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      tempLayers[payload].visible = !tempLayers[payload].visible

      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
        tempLayers));
    },
    removeLayer(state, payload) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      if (tempLayers.length > 1) {
        tempLayers.splice(payload, 1)

        // Automatically select the next best layer to avoid bugs
        if (tempLayers[payload + 1]) {
          state.asciibirdMeta[state.tab].selectedLayer = payload + 1
        } else if (tempLayers[payload - 1]) {
          state.asciibirdMeta[state.tab].selectedLayer = payload - 1
        } else if (tempLayers[0]) {
          state.asciibirdMeta[state.tab].selectedLayer = 0
        }

        state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
          tempLayers));
      }

    },
    downLayer(state, payload) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      if (tempLayers[payload + 1]) {
        let swap1 = tempLayers[payload + 1];
        let swap = tempLayers[payload];

        tempLayers[payload + 1] = swap
        tempLayers[payload] = swap1

        state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
          tempLayers));
      }

    },
    upLayer(state, payload) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      if (tempLayers[payload - 1]) {
        let swap1 = tempLayers[payload - 1];
        let swap = tempLayers[payload];

        tempLayers[payload - 1] = swap
        tempLayers[payload] = swap1

        state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
          tempLayers));
      }

    },
    updateLayerName(state, payload) {
      let tempLayers = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab]
        .blocks))

      if (tempLayers[payload.key]) {
        tempLayers[payload.key].label = payload.label;
        state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(
          tempLayers));
      }

    },

    // ASCII
    updateAscii(state, payload) {
      state.asciibirdMeta[state.tab] = payload;
    },

    // BLOCKS
    undoBlocks(state) {
      if (state.asciibirdMeta[state.tab].history.length > 1) {

        state.asciibirdMeta[state.tab].blocks = state.asciibirdMeta[state.tab].history.pop();
        state.asciibirdMeta[state.tab].redo.push(state.asciibirdMeta[state.tab].blocks);

      }
    },
    redoBlocks(state) {
      if (state.asciibirdMeta[state.tab].redo.length) {
        const next = state.asciibirdMeta[state.tab].redo.pop();
        state.asciibirdMeta[state.tab].blocks = next;
        state.asciibirdMeta[state.tab].history.push(next);
      }
    },

    //
    // Toolbar
    //
    updateBrushSize(state, payload) {
      state.toolbarState.brushSizeHeight = payload.brushSizeHeight;
      state.toolbarState.brushSizeWidth = payload.brushSizeWidth;
      state.toolbarState.brushSizeType = payload.brushSizeType;
    },
    brushBlocks(state, payload) {
      state.brushBlocks = LZString.compressToUTF16(JSON.stringify(payload));
    },
    selectBlocks(state, payload) {
      state.selectBlocks = LZString.compressToUTF16(JSON.stringify(payload));
    },
    toggleGridView(state, payload) {
      state.toolbarState.gridView = payload;
    },
    toggleUpdateBrush(state, payload) {
      state.toolbarState.updateBrush = payload;
    },

    flipRotateBlocks(state, payload) {
      let tempBlocks = JSON.parse(LZString.decompressFromUTF16(state.brushBlocks))
      let parsedBlocks = [];
      let x = 0;
      let y = 0;

      switch (payload.type) {
        case 'flip':
          tempBlocks = tempBlocks.reverse()
          for (y = 0; y < tempBlocks.length; y++) {
            parsedBlocks[y] = tempBlocks[y];

            for (x = 0; x < getBlocksWidth(tempBlocks); x++) {
              parsedBlocks[y][x] = tempBlocks[y][x];
            }
          }

          break;

        case 'rotate':
          for (y = 0; y < tempBlocks.length; y++) {
            parsedBlocks[y] = tempBlocks[y].reverse();

            for (x = 0; x < getBlocksWidth(tempBlocks); x++) {
              parsedBlocks[y][x] = tempBlocks[y][x];
            }
          }
          break;

      }

      state.brushBlocks = LZString.compressToUTF16(JSON.stringify(parsedBlocks));
    },

    // Brush Library
    pushBrushHistory(state, payload) {
      // Check and remove duplicate brushes based on hash value  
      if (state.brushHistory.length >= state.options.brushLimit) {
        state.brushHistory.pop();
      }

      let hashValue = cyrb53(JSON.stringify(payload))
      state.brushHistory = state.brushHistory.filter(obj => obj.hash !== hashValue);

      state.brushHistory.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue
      });
    },
    pushBrushLibrary(state, payload) {
      // Check and remove duplicate brushes based on hash value
      let hashValue = cyrb53(JSON.stringify(payload))
      state.brushLibrary = state.brushLibrary.filter(obj => obj.hash !== hashValue);

      state.brushLibrary.unshift({
        blocks: LZString.compressToUTF16(JSON.stringify(payload)),
        hash: hashValue
      });
    },
    removeBrushLibrary(state, payload) {
      let hashValue = cyrb53(JSON.stringify(payload))

      state.brushLibrary = state.brushLibrary.filter(function (item) {
        return item.hash !== hashValue
      });
    },
    removeBrushHistory(state, payload) {
      let hashValue = cyrb53(JSON.stringify(payload))

      state.brushHistory = state.brushHistory.filter(function (item) {
        return item.hash !== hashValue
      });
    },
    toggleDisableKeyboard(state, payload = null) {
      state.isKeyboardDisabled = (payload === null ? !state.isKeyboardDisabled : payload);
    },
    // Modals / Tabs
    openModal(state, type) {
      
      switch (type) {
        case 'new-ascii':
          state.modalState.newAscii = true;
          state.isKeyboardDiasbled = true;
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
      }
    },
    closeModal(state, type) {
      
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
      }
    },
    closeTab(state, tab) {
      state.asciibirdMeta.splice(tab, 1);

      // If we closed the tab we are viewing jump to the end tab
      if (tab === state.tab) {
        state.tab = state.asciibirdMeta.length - 1
      }

      if (state.asciibirdMeta.length) {
        document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
      } else {
        document.title = `asciibird`
      }

    },
  },
  getters: {
    state: (state) => state,
    modalState: (state) => state.modalState,
    options: (state) => state.options,
    toolbarState: (state) => state.toolbarState,
    debugPanel: (state) => state.debugPanelState,
    currentTool: (state) => state.toolbarState.currentTool,
    isTargettingBg: (state) => state.toolbarState.targetingBg,
    isTargettingFg: (state) => state.toolbarState.targetingFg,
    isTargettingChar: (state) => state.toolbarState.targetingChar,
    currentFg: (state) => state.toolbarState.currentColourFg,
    currentBg: (state) => state.toolbarState.currentColourBg,
    currentChar: (state) => state.toolbarState.selectedChar,
    currentTab: (state) => state.tab,
    currentAscii: (state) => state.asciibirdMeta[state.tab] ?? false,
    currentAsciiBlocks: (state) => {
      let blocks = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[
        state.tab].blocks)) || [];

      return blocks[state.asciibirdMeta[state.tab].selectedLayer].data || []
    },
    currentAsciiLayers: (state) => {
      let blocks = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[
        state.tab].blocks));

      return blocks
    },
    currentAsciiLayersWidthHeight: (state) => {
      let blocks = JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[
        state.tab].blocks));

      return {
        width: blocks[0].width,
        height: blocks[0].height,
      }
    },
    selectedLayer: (state) => state.asciibirdMeta[state.tab].selectedLayer,
    imageOverlay: (state) => state.asciibirdMeta[state.tab].imageOverlay,
    asciibirdMeta: (state) => state.asciibirdMeta,
    nextTabValue: (state) => state.asciibirdMeta.length,
    brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
    brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
    brushSizeType: (state) => state.toolbarState.brushSizeType,
    blockSizeMultiplier: (state) => state.blockSizeMultiplier,
    brushHistory: (state) => state.brushHistory,
    brushLibrary: (state) => state.brushLibrary,
    brushLibraryState: (state) => state.brushLibraryState,
    brushPreviewState: (state) => state.brushPreviewState,
    layersLibraryState: (state) => state.layersLibraryState,
    isKeyboardDisabled: (state) => state.isKeyboardDisabled,
    brushBlocks: (state) => JSON.parse(LZString.decompressFromUTF16(state.brushBlocks)) || [],
    selectBlocks: (state) => JSON.parse(LZString.decompressFromUTF16(state.selectBlocks)) || [],
    isModalOpen: (state) => {
      for (const modalState in state.modalState) {
        if (state.modalState[modalState] === true)
          return true
      }
      return false
    },
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin],
});
