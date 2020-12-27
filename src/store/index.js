import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // Current tab user is viewing
    tab: 1,
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
    asciibirdMeta: [{
      title: 'New ASCII',
      key: 1,
      width: 5,
      height: 5,
      blockWidth: 8,
      blockHeight: 13,
      blocks: {},
    }],
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
});
