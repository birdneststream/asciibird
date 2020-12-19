import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // Object that is a single ASCII block
    defaultBlock: {
      x: 0,
      y: 0,
      bg: '#FFFFF',
      fg: '#00000',
      char: '*',
      bold: false,
      blinking: false,
    },
    asciibirdMeta: [{
      title: 'New ASCII',
      key: 1,
      ascii: {
        blocks: {},
        width: 80,
        height: 80,
      },
    }],
  },
  mutations: {
    newAsciibirdMeta(state, payload) {
      this.state.asciibirdMeta.push(payload);
    },
  },
  actions: {},
  modules: {},
});
