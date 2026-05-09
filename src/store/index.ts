import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import { setStore as setAsciiStore } from '../ascii';
import type { RootState } from '../types/store';
import {
  createInitialState,
  mutations,
  getters,
  actions,
} from './definitions';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

const store = new Vuex.Store<RootState>({
  state: createInitialState(),
  mutations,
  getters,
  actions,
  modules: {},
  plugins: [vuexLocal.plugin],
});

// Break circular dependency: set store reference in ascii module
setAsciiStore(store);

export default store;
