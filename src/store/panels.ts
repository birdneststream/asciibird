/**
 * Panel Store — manages visibility, position, and minimize state of UI panels.
 *
 * Extracted from the monolithic useAsciiBirdStore to isolate panel state
 * and allow independent persistence.
 */
import { defineStore } from 'pinia';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import type { PanelState, BrushLibraryState } from '../types';

/** Default canvas X position (left column 220px + 8px padding + 8px gap) */
const CANVAS_DEFAULT_X = 236;
/** Default top Y position (below menu bar + tab bar) */
const CANVAS_DEFAULT_Y = 56;
/** Default left column X position */
const LEFT_X = 8;
/** Default panel top Y position */
const TOP_Y = 56;
/** Gap between stacked panels */
const GAP = 8;
/** Panel width for left column panels */
const LEFT_PANEL_W = 220;
/** Panel width for right column panels */
const RIGHT_PANEL_W = 280;

/** Initial panel positions using screen-relative pixel values */
function initialPanelStates() {
  const vpWidth = window?.innerWidth ?? 1280;
  const RIGHT_X = vpWidth - RIGHT_PANEL_W - GAP;
  return {
    debugPanel: {
      x: LEFT_X,
      y: TOP_Y + 600 + GAP,
      h: 200,
      w: LEFT_PANEL_W,
      visible: false,
      minimized: false,
    } as PanelState,
    brushLibrary: {
      x: RIGHT_X,
      y: TOP_Y + 300 + GAP,
      h: 300,
      w: RIGHT_PANEL_W,
      visible: true,
      minimized: false,
      tab: 0,
    } as BrushLibraryState,
    brushPreview: {
      x: LEFT_X,
      y: TOP_Y,
      h: 300,
      w: LEFT_PANEL_W,
      visible: true,
      minimized: false,
    } as PanelState,
    layersLibrary: {
      x: RIGHT_X,
      y: TOP_Y,
      h: 300,
      w: RIGHT_PANEL_W,
      visible: true,
      minimized: false,
    } as PanelState,
  };
}

export {
  CANVAS_DEFAULT_X,
  CANVAS_DEFAULT_Y,
  LEFT_X,
  TOP_Y,
  LEFT_PANEL_W,
};

export type PanelStates = ReturnType<typeof initialPanelStates>;

export type PanelKey = keyof PanelStates;

interface PanelStoreState extends PanelStates {
  /** Ephemeral z-index counter — NOT persisted */
  zCounter: number;
  /** Ephemeral z-index map per panel — NOT persisted */
  zIndices: Record<string, number>;
}

export const usePanelStore = defineStore('panel', {
  state: (): PanelStoreState => {
    const defaults = initialPanelStates();
    // Ensure backward compat: if persisted state is missing `minimized`,
    // fill it in with false. This handles migration from pre-taskbar builds.
    for (const key of Object.keys(defaults) as PanelKey[]) {
      if ((defaults[key] as PanelState).minimized === undefined) {
        (defaults[key] as PanelState).minimized = false;
      }
    }
    return { ...defaults, zCounter: 100, zIndices: {} };
  },

  getters: {
    /** Get the current z-index for a panel (default 100) */
    panelZIndex: (state) => (key: string): number => {
      return state.zIndices[key] ?? 100;
    },
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

    /** Reset a single panel position to initial defaults */
    resetPanelPosition(key: PanelKey) {
      const defaults = initialPanelStates();
      const panel = this[key] as PanelState;
      const def = defaults[key] as PanelState;
      if (panel && def) {
        panel.x = def.x;
        panel.y = def.y;
      }
    },

    /** Reset all panel positions to initial defaults */
    resetAllPanelPositions() {
      const defaults = initialPanelStates();
      for (const key of Object.keys(defaults) as PanelKey[]) {
        const panel = this[key] as PanelState;
        const def = defaults[key] as PanelState;
        if (panel && def) {
          panel.x = def.x;
          panel.y = def.y;
        }
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

    /** Bring a panel to the front of the z-index stack (capped at 8999) */
    bringToFront(key: string) {
      this.zCounter = Math.min(this.zCounter + 1, 8999);
      this.zIndices[key] = this.zCounter;
    },
  },

  persist: {
    key: 'asciibird-panel',
    storage: idbPersistAdapter,
    // Ephemeral z-index state is meaningless across sessions
    omit: ['zCounter', 'zIndices'],
  },
});
