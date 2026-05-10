/**
 * Panel Store — manages visibility and position of UI panels.
 *
 * Extracted from the monolithic useAsciiBirdStore to isolate panel state
 * and allow independent persistence.
 */
import { defineStore } from 'pinia';
import {
  blockWidth,
  blockHeight,
} from '../ascii';
import type { PanelState, BrushLibraryState } from '../types';

/** Initial panel positions derived from block dimensions */
function initialPanelStates() {
  return {
    debugPanel: {
      x: blockWidth * 40,
      y: blockHeight * 20,
      h: blockHeight * 20,
      w: blockWidth * 40,
      visible: false,
    } as PanelState,
    brushLibrary: {
      x: blockWidth * 130,
      y: blockHeight * 23,
      h: blockHeight * 25,
      w: blockWidth * 35,
      visible: true,
      tab: 0,
    } as BrushLibraryState,
    brushPreview: {
      x: blockWidth * 2,
      y: blockHeight * 22,
      h: blockHeight * 19,
      w: blockWidth * 25,
      visible: true,
    } as PanelState,
    layersLibrary: {
      x: blockWidth * 130,
      y: blockHeight * 2,
      h: blockHeight * 19,
      w: blockWidth * 35,
      visible: true,
    } as PanelState,
  };
}

export type PanelStates = ReturnType<typeof initialPanelStates>;

export const usePanelStore = defineStore('panel', {
  state: (): PanelStates => initialPanelStates(),

  actions: {
    changeDebugPanelState(payload: PanelState) {
      this.debugPanel = payload;
    },
    toggleDebugPanel(payload: boolean) {
      this.debugPanel.visible = payload;
    },
    changeBrushLibraryState(payload: BrushLibraryState) {
      this.brushLibrary = payload;
    },
    changeBrushPreviewState(payload: PanelState) {
      this.brushPreview = payload;
    },
    toggleBrushLibrary(payload: boolean) {
      this.brushLibrary.visible = payload;
    },
    changeLayersLibraryState(payload: PanelState) {
      this.layersLibrary = payload;
    },
  },

  persist: {
    key: 'asciibird-panel',
    storage: localStorage,
  },
});
