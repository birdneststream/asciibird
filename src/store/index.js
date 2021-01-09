import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default new Vuex.Store({
  state: {
    // Current tab user is viewing
    tab: 0,
    // Object that is a single ASCII block, used to clone and store data for each individual block
    defaultBlock: {
      x: 0,
      y: 0,
      bg: '#000000',
      fg: '#FFFFFF',
      char: '*',
      bold: false,
      blinking: false,
    },
    // asciibirdMeta holds all of the ASCII information for all the tabs
    asciibirdMeta: [],
  },
  mutations: {
    changeTab(state, payload) {
      this.state.asciibirdMeta.tab = payload;
    },
    newAsciibirdMeta(state, payload) {
      this.state.asciibirdMeta.push(payload);
    },
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin]
});
