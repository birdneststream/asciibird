import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

export default new Vuex.Store({
  state: {
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
    toolbar: [
      {
        name: 'select',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>'
      },
      {
        name: 'text',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
      },
      {
        name: 'fill',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>'
      },
      {
        name: 'brush',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>'
      },
    ],
    toolbarState: {
      currentColor: 0,
      currentTool : null,
    }
  },
  mutations: {
    changeTab(state, payload) {
      state.tab = payload;
    },
    changeColor(state, payload) {
      state.toolbarState.currentColor = payload;
    },
    changeTool(state, payload) {
      state.toolbarState.currentTool = payload;
    },
    newAsciibirdMeta(state, payload) {
      state.asciibirdMeta.push(payload);
    },
  },
  getters: {
    getColor: state => state.toolbarState.currentColor,
    getTool: state => state.toolbarState.currentTool,
    currentTab: state => state.tab,
    charCodes: state => state.charCodes,
    mircColors: state => state.mircColors,
    currentAscii: state => state.asciibirdMeta[state.tab] ?? false,
    asciibirdMeta: state => state.asciibirdMeta,
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin],
});

