/**
 * Panel Registry Composable — unified reactive access to all floating panels.
 *
 * Aggregates panel state from both `panels.ts` and `toolbar.ts` stores into
 * a single reactive array, providing a consistent API for the task bar and
 * other components that need to interact with all panels uniformly.
 */
import { computed } from 'vue';
import { usePanelStore, type PanelKey } from '../store/panels';
import { useToolbarStore } from '../store/toolbar';
import type { PanelState } from '../types';

/** Panel info exposed by the registry */
export interface PanelInfo {
  /** Unique panel identifier */
  id: string;
  /** Display name for tooltips */
  name: string;
  /** Material Icons icon name */
  icon: string;
  /** Whether panel is visible (not hidden via View menu) */
  visible: boolean;
  /** Whether panel is minimized (hidden from canvas, in task bar) */
  minimized: boolean;
  /** Whether panel is actually showing on canvas (visible && !minimized) */
  isShowing: boolean;
}

/** Panel registry entry definition */
interface PanelDef {
  id: string;
  name: string;
  icon: string;
  getState: () => PanelState;
  minimize: () => void;
  restore: () => void;
  toggleMinimize: () => void;
  resetPosition: () => void;
}

/** Get all panel definitions using lazy store access */
function getPanelDefs(): PanelDef[] {
  const panelStore = usePanelStore();
  const toolbarStore = useToolbarStore();

  return [
    {
      id: 'toolbar',
      name: 'Toolbar',
      icon: 'handyman',
      getState: () => ({
        x: toolbarStore.toolbarState.x,
        y: toolbarStore.toolbarState.y,
        h: toolbarStore.toolbarState.h,
        w: toolbarStore.toolbarState.w,
        visible: toolbarStore.toolbarState.visible,
        minimized: toolbarStore.toolbarState.minimized,
      }),
      minimize: () => toolbarStore.minimizeToolbar(),
      restore: () => toolbarStore.restoreToolbar(),
      toggleMinimize: () => toolbarStore.toggleToolbarMinimize(),
      resetPosition: () => toolbarStore.resetToolbarPosition(),
    },
    {
      id: 'debugPanel',
      name: 'Debug',
      icon: 'bug_report',
      getState: () => panelStore.debugPanel,
      minimize: () => panelStore.minimizePanel('debugPanel'),
      restore: () => panelStore.restorePanel('debugPanel'),
      toggleMinimize: () => panelStore.togglePanelMinimize('debugPanel'),
      resetPosition: () => panelStore.resetPanelPosition('debugPanel'),
    },
    {
      id: 'brushLibrary',
      name: 'Brushes',
      icon: 'palette',
      getState: () => panelStore.brushLibrary,
      minimize: () => panelStore.minimizePanel('brushLibrary'),
      restore: () => panelStore.restorePanel('brushLibrary'),
      toggleMinimize: () => panelStore.togglePanelMinimize('brushLibrary'),
      resetPosition: () => panelStore.resetPanelPosition('brushLibrary'),
    },
    {
      id: 'brushPreview',
      name: 'Brush',
      icon: 'brush',
      getState: () => panelStore.brushPreview,
      minimize: () => panelStore.minimizePanel('brushPreview'),
      restore: () => panelStore.restorePanel('brushPreview'),
      toggleMinimize: () => panelStore.togglePanelMinimize('brushPreview'),
      resetPosition: () => panelStore.resetPanelPosition('brushPreview'),
    },
    {
      id: 'layersLibrary',
      name: 'Layers',
      icon: 'layers',
      getState: () => panelStore.layersLibrary,
      minimize: () => panelStore.minimizePanel('layersLibrary'),
      restore: () => panelStore.restorePanel('layersLibrary'),
      toggleMinimize: () => panelStore.togglePanelMinimize('layersLibrary'),
      resetPosition: () => panelStore.resetPanelPosition('layersLibrary'),
    },
  ];
}

export function usePanelRegistry() {
  const panelStore = usePanelStore();
  const toolbarStore = useToolbarStore();

  /** Reactive list of all panel info */
  const panels = computed<PanelInfo[]>(() => {
    // Access reactive store properties to ensure re-computation triggers.
    // These reads create reactive dependencies on the panel store state.
    void panelStore.debugPanel.minimized;
    void panelStore.brushLibrary.minimized;
    void panelStore.brushPreview.minimized;
    void panelStore.layersLibrary.minimized;
    void toolbarStore.toolbarState.minimized;
    void panelStore.debugPanel.visible;
    void panelStore.brushLibrary.visible;
    void panelStore.brushPreview.visible;
    void panelStore.layersLibrary.visible;
    void toolbarStore.toolbarState.visible;

    return getPanelDefs().map((def) => {
      const state = def.getState();
      const visible = state.visible;
      const minimized = state.minimized ?? false;
      return {
        id: def.id,
        name: def.name,
        icon: def.icon,
        visible,
        minimized,
        isShowing: visible && !minimized,
      };
    });
  });

  /** Get a specific panel definition by ID */
  function getDef(id: string): PanelDef | undefined {
    return getPanelDefs().find((d) => d.id === id);
  }

  /** Toggle minimize/restore for a panel by ID */
  function toggle(id: string) {
    const def = getDef(id);
    if (def) def.toggleMinimize();
  }

  /** Minimize a panel by ID */
  function minimize(id: string) {
    const def = getDef(id);
    if (def) def.minimize();
  }

  /** Restore a minimized panel by ID */
  function restore(id: string) {
    const def = getDef(id);
    if (def) def.restore();
  }

  /** Reset a panel's position to defaults by ID */
  function resetPosition(id: string) {
    const def = getDef(id);
    if (def) def.resetPosition();
  }

  /** Hide a panel (set visible=false, distinct from minimize) */
  function hide(id: string) {
    const def = getDef(id);
    if (!def) return;
    const panelStore = usePanelStore();
    const toolbarStore = useToolbarStore();

    if (def.id === 'toolbar') {
      toolbarStore.toolbarState.visible = false;
      toolbarStore.toolbarState.minimized = false;
    } else {
      const key = def.id as PanelKey;
      panelStore[key].visible = false;
      panelStore[key].minimized = false;
    }
  }

  return {
    panels,
    toggle,
    minimize,
    restore,
    resetPosition,
    hide,
  };
}
