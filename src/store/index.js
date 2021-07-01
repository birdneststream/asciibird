import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VuexPersistence from 'vuex-persist';
import LZString from 'lz-string';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

export default new Vuex.Store({

  state: {
    modalState: {
      newAscii: false,
      settingsModal: false,
    },
    // The various options of ASCIIBIRD will eventually
    // end up in its own modal I guess
    options: {
      canvasRedrawSpeed: 2,
      defaultBg: 1,
      defaultFg: 0,
      font: 'Hack',
    },

    // 0  => 'white',
    // 1  => 'black',
    // 2  => 'navy',
    // 3  => 'green',
    // 4  => 'red',
    // 5  => 'brown',
    // 6  => 'purple',
    // 7  => 'olive',
    // 8  => 'yellow',                  # dark yellow
    // 9  => 'lime',                  # ltgreen
    // 10 => 'teal',
    // 11 => 'cyan',
    // 12 => 'blue',                  # ltblue,
    // 13 => 'fuchsia',                  # pink
    // 14 => 'grey',
    // 15 => 'lightgrey',

    mircColours: [
      'rgb(255,255,255)',
      'rgb(0,0,0)',
      'rgb(0,0,127)',
      'rgb(0,147,0)',
      'rgb(255,0,0)',
      'rgb(127,0,0)',
      'rgb(156,0,156)',
      'rgb(252,127,0)',
      'rgb(255,255,0)',
      'rgb(0,252,0)',
      'rgb(0,147,147)',
      'rgb(0,255,255)',
      'rgb(0,0,252)',
      'rgb(255,0,255)',
      'rgb(127,127,127)',
      'rgb(210,210,210)',
    ],
    // White list of chars we want to accept, not at the moment
    // though, we just use this for random chars on new ascii
    charCodes: [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', 'Ç', 'ü', 'é', 'â', 'ä', 'à', 'å', 'ç', 'ê', 'ë', 'è', 'ï', 'î', 'ì', 'Ä', 'Å', 'É', 'æ', 'Æ', 'ô', 'ö', 'ò', 'û', 'ù', 'ÿ', 'Ö', 'Ü', 'ø', '£', 'Ø', '×', 'ƒ', 'á', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ª', 'º', '¿', '®', '¬', '½', '¼', '¡', '«', '»', '░', '▒', '▓', '│', '┤', 'Á', 'Â', 'À', '©', '╣', '║', '╗', '╝', '¢', '¥', '┐', '└', '┴', '┬', '├', '─', '┼', 'ã', 'Ã', '╚', '╔', '╩', '╦', '╠', '═', '╬', '¤', 'ð', 'Ð', 'Ê', 'Ë', 'È', 'ı', 'Í', 'Î', 'Ï', '┘', '┌', '█', '▄', '¦', 'Ì', '▀', 'Ó', 'ß', 'Ô', 'Ò', 'õ', 'Õ', 'µ', 'þ', 'Þ', 'Ú', 'Û', 'Ù', 'ý', 'Ý', '¯', '´', '≡', '±', '‗', '¾', '¶', '§', '÷', '¸', '°', '¨', '·', '¹', '³', '²'],
    // Current tab user is viewing
    tab: 0,
    // asciibirdMeta holds all of the ASCII information for all the tabs
    asciibirdMeta: [],
    toolbarIcons: [{
      name: 'default',
      icon: 'mouse-pointer',
      fa: 'fas',
      svgPath: 'assets/mouse-pointer-solid.svg',
    },
    {
      name: 'select',
      icon: 'square',
      fa: 'far',
      svgPath: 'assets/square-regular.svg',
    },
    {
      name: 'text',
      icon: 'font',
      fa: 'fas',
      svgPath: 'assets/font-solid.svg',
    },
    {
      name: 'fill',
      icon: 'fill-drip',
      fa: 'fas',
      svgPath: 'assets/fill-drip-solid.svg',
    },
    {
      name: 'brush',
      icon: 'paint-brush',
      fa: 'fas',
      svgPath: 'assets/paint-brush-solid.svg',
    },
    {
      name: 'dropper',
      icon: 'eye-dropper',
      fa: 'fas',
      svgPath: 'assets/eye-dropper-solid.svg',
    },
    {
      name: 'eraser',
      icon: 'eraser',
      fa: 'fas',
      svgPath: 'assets/eraser-solid.svg',
    },
    ],
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
      selectedChar: 'A',
      isUpdating: false,
      currentTool: 0,
      targetingFg: true,
      targetingBg: true,
      targetingChar: true,
      x: 8 * 2,
      y: 13 * 2,
      h: 13 * 39,
      w: 8 * 25,
    },
    debugPanelState: {
      x: 8 * 2,
      y: 13 * 60,
      h: 13 * 3,
      w: 8 * 150,
    },
    blockSizeMultiplier: 1,
    brushBlocks: [],
    selectBlocks: [],
  },
  mutations: {
    changeState(state, payload) {
      Object.assign(state, payload);
    },
    changeTab(state, payload) {
      state.tab = payload;
    },
    changeDebugPanelState(state, payload) {
      state.debugPanelState = payload;
    },
    changeToolBarState(state, payload) {
      state.toolbarState.x = payload.x;
      state.toolbarState.y = payload.y;
      state.toolbarState.w = payload.w;
      state.toolbarState.h = payload.h;
    },
    changeAsciiWidthHeight(state, payload) {
      state.asciibirdMeta[state.tab].width = payload.width;
      state.asciibirdMeta[state.tab].height = payload.height;
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
    },
    updateToolBarState(state, payload) {
      state.toolbarState = payload;
    },
    updateAsciiBlocks(state, payload, skipUndo = false) {
      // before - state.asciibirdMeta[state.tab].blocks
      // current - payload

      if (!skipUndo) {
        state.asciibirdMeta[state.tab].history.push(state.asciibirdMeta[state.tab].blocks);
      }

      state.asciibirdMeta[state.tab].blocks = LZString.compressToUTF16(JSON.stringify(payload));
      state.asciibirdMeta[state.tab].redo = [];
    },
    undoBlocks(state) {
      if (state.asciibirdMeta[state.tab].history.length > 0) {
        const previous = state.asciibirdMeta[state.tab].history.pop();
        state.asciibirdMeta[state.tab].blocks = previous;
        state.asciibirdMeta[state.tab].redo.push(previous);
      }
    },
    redoBlocks(state) {
      if (state.asciibirdMeta[state.tab].redo.length > 0) {
        const next = state.asciibirdMeta[state.tab].redo.pop();
        state.asciibirdMeta[state.tab].blocks = next;
        state.asciibirdMeta[state.tab].history.push(next);
      }
    },
    updateBrushSize(state, payload) {
      state.toolbarState.brushSizeHeight = payload.brushSizeHeight;
      state.toolbarState.brushSizeWidth = payload.brushSizeWidth;
      state.toolbarState.brushSizeType = payload.brushSizeType;
    },
    brushBlocks(state, payload) {
      state.brushBlocks = payload;
    },
    selectBlocks(state, payload) {
      state.selectBlocks = payload;
    },
    openModal(state, type) {
      switch (type) {
        case 'new-ascii':
          state.modalState.newAscii = !state.modalState.newAscii;
          break;
        case 'open-settings':
          console.log('HI');
          state.modalState.settingsModal = !state.modalState.settingsModal;
          break;
      }
    },
  },
  getters: {
    getState: (state) => state,
    modalState: (state) => state.modalState,
    getOptions: (state) => state.options,
    getToolbarIcons: (state) => state.toolbarIcons,
    getToolbarState: (state) => state.toolbarState,
    getDebugPanelState: (state) => state.debugPanelState,
    getCurrentTool: (state) => state.toolbarState.currentTool,
    getTargetingBg: (state) => state.toolbarState.targetingBg,
    getTargetingFg: (state) => state.toolbarState.targetingFg,
    getTargetingChar: (state) => state.toolbarState.targetingChar,
    getFgColour: (state) => state.toolbarState.currentColourFg,
    getBgColour: (state) => state.toolbarState.currentColourBg,
    getSelectedChar: (state) => state.toolbarState.selectedChar,
    currentTab: (state) => state.tab,
    charCodes: (state) => state.charCodes,
    mircColours: (state) => state.mircColours,
    currentAscii: (state) => state.asciibirdMeta[state.tab] ?? false,
    currentAsciiBlocks: (state) => JSON.parse(LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].blocks)),
    asciibirdMeta: (state) => state.asciibirdMeta,
    nextTabValue: (state) => state.asciibirdMeta.length,
    brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
    brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
    brushSizeType: (state) => state.toolbarState.brushSizeType,
    blockSizeMultiplier: (state) => state.blockSizeMultiplier,
    brushBlocks: (state) => state.brushBlocks,
    selectBlocks: (state) => state.selectBlocks,
    undoIndex: (state) => state.asciibirdMeta[state.tab].history.length - 1,
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin],
});
