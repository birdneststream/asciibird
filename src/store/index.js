import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

export default new Vuex.Store({
  state: {

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

    mircColors: [
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
    charCodes: ['*', '-', '=', '+', '^', '#'],
    // Current tab user is viewing
    tab: 0,
    // asciibirdMeta holds all of the ASCII information for all the tabs
    asciibirdMeta: [],
    toolbar: [{
        name: 'default',
        icon: 'mouse-pointer',
        fa: 'fas',
      },
      {
        name: 'select',
        icon: 'square',
        fa: 'far',
      },
      {
        name: 'text',
        icon: 'font',
        fa: 'fas',
      },
      {
        name: 'fill',
        icon: 'fill-drip',
        fa: 'fas',
      },
      {
        name: 'brush',
        icon: 'paint-brush',
        fa: 'fas',
      },
      {
        name: 'dropper',
        icon: 'eye-dropper',
        fa: 'fas',
      },
      {
        name: 'eraser',
        icon: 'eraser',
        fa: 'fas',
      },
    ],
    toolbarState: {
      currentColorFg: 0,
      currentColorBg: 1,
      isChoosingFg: false,
      isChoosingBg: false,
      selectedFg: 0,
      selectedBg: 1,
      isUpdating: false,
      currentTool: 'default',
      targetingFg: false,
      targetingBg: true,
      targetingText: false,
    },
    blockSizeMultiplier: 1,
  },
  mutations: {
    changeTab(state, payload) {
      state.tab = payload;
    },
    changeColorFg(state, payload) {
      state.toolbarState.currentColorFg = payload;
      state.toolbarState.isUpdating = false
    },
    changeColorBg(state, payload) {
      state.toolbarState.currentColorBg = payload;
      state.toolbarState.isUpdating = false
    },
    changeTool(state, payload) {
      state.toolbarState.currentTool = payload;
    },
    changeTargetingFg(state, payload) {
      state.toolbarState.targetingFg = payload;
    },
    changeTargetingBg(state, payload) {
      state.toolbarState.targetingBg = payload;
    },
    changeTargetingText(state, payload) {
      state.toolbarState.targetingText = payload;
    },
    newAsciibirdMeta(state, payload) {
      state.asciibirdMeta.push(payload);
    },
    updateToolBarState(state, payload) {
      state.toolbarState = payload
    }
  },
  getters: {
    getToolbarState: state => state.toolbarState,
    getCurrentTool: state => state.toolbarState.currentTool,
    getTargetingBg: state => state.toolbarState.targetingBg,
    getTargetingFg: state => state.toolbarState.targetingFg,
    getTargetingText: state => state.toolbarState.targetingText,
    getFgColor: state => state.toolbarState.currentColorFg,
    getBgColor: state => state.toolbarState.currentColorBg,
    currentTab: state => state.tab,
    charCodes: state => state.charCodes,
    mircColors: state => state.mircColors,
    currentAscii: state => state.asciibirdMeta[state.tab] ?? false,
    asciibirdMeta: state => state.asciibirdMeta,
    nextTabValue: state => state.asciibirdMeta.length,
    blockSizeMultiplier: state => state.blockSizeMultiplier,
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin],
});
