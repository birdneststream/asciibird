/**
 * Panel Store — manages visibility, position, and minimize state of UI panels.
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
      minimized: false,
    } as PanelState,
    brushLibrary: {
      x: blockWidth * 130,
      y: blockHeight * 23,
      h: blockHeight * 25,
      w: blockWidth * 35,
      visible: true,
      minimized: false,
      tab: 0,
    } as BrushLibraryState,
    brushPreview: {
      x: blockWidth * 2,
      y: blockHeight * 22,
      h: blockHeight * 19,
      w: blockWidth * 25,
      visible: true,
      minimized: false,
    } as PanelState,
    layersLibrary: {
      x: blockWidth * 130,
      y: blockHeight * 2,
      h: blockHeight * 19,
      w: blockWidth * 35,
      visible: true,
      minimized: false,
    } as PanelState,
  };
}

export type PanelStates = ReturnType<typeof initialPanelStates>;

export type PanelKey = keyof PanelStates;

export const usePanelStore = defineStore('panel', {
  state: (): PanelStates => {
    const defaults = initialPanelStates();
    // Ensure backward compat: if persisted state is missing `minimized`,
    // fill it in with false. This handles migration from pre-taskbar builds.
    for (const key of Object.keys(defaults) as PanelKey[]) {
      if ((defaults[key] as PanelState).minimized === undefined) {
        (defaults[key] as PanelState).minimized = false;
      }
    }
    return defaults;
  },

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

    /** Minimize a panel — hides from canvas but keeps in task bar */
    minimizePanel(key: PanelKey) {
      const panel = this[key] as PanelState;
      if (panel) {
        panel.minimized = true;
        panel.visible = true; // minimized != hidden
      }
    },

    /** Restore a minimized panel — shows on canvas again */
    restorePanel(key: PanelKey) {
      const panel = this[key] as PanelState;
      if (panel) {
        panel.minimized = false;
        panel.visible = true;
      }
    },

    /** Reset panel position to initial defaults */
    resetPanelPosition(key: PanelKey) {
      const defaults = initialPanelStates();
      const panel = this[key] as PanelState;
      const def = defaults[key] as PanelState;
      if (panel && def) {
        panel.x = def.x;
        panel.y = def.y;
      }
    },

    /** Toggle between minimized and restored */
    togglePanelMinimize(key: PanelKey) {
      const panel = this[key] as PanelState;
      if (!panel) return;
      if (panel.minimized) {
        panel.minimized = false;
      } else if (panel.visible) {
        panel.minimized = true;
      } else {
        // Hidden panel — restore to visible
        panel.visible = true;
        panel.minimized = false;
      }
    },
  },

  persist: {
    key: 'asciibird-panel',
    storage: localStorage,
  },
});
