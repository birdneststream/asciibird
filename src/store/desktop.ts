// Desktop store — manages menu bar and tab bar visibility
// Extracted from monolithic useAsciiBirdStore for separation of concerns

import { defineStore } from 'pinia';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import type { DesktopState } from '../types';

export const useDesktopStore = defineStore('desktop', {
  state: () => ({
    desktopState: {
      menuBarVisible: true,
      tabsVisible: true,
    } as DesktopState,
  }),

  getters: {
    menuBarVisible: (state): boolean => state.desktopState.menuBarVisible,
    tabsVisible: (state): boolean => state.desktopState.tabsVisible,
  },

  actions: {
    changeMenuBarVisible(payload: boolean) {
      this.desktopState.menuBarVisible = payload;
    },
    changeTabsVisible(payload: boolean) {
      this.desktopState.tabsVisible = payload;
    },
  },

  persist: {
    key: 'asciibird-desktop',
    storage: idbPersistAdapter,
  },
});
