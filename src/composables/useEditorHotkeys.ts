// Editor Hotkeys composable — extracted from Editor.vue.
//
// Registers hotkeys-js bindings in the 'editor' scope for canvas-level
// keyboard interactions: text editing, selection nudging, tool escape
// cancels, selection deletion, and brush/eraser arrow key drawing.
//
// The composable registers the hotkey handler on creation and returns
// a cleanup function that must be called in onUnmounted.

import hotkeys from 'hotkeys-js';
import type { Ref } from 'vue';
import type { Block } from '../types';

// ─── Types ──────────────────────────────────────────────────────

/** Tool composables needed by hotkey handlers */
export interface HotkeyToolDeps {
  pasteMode: {
    isPasteMode: Ref<boolean>;
    cancelPasteMode: () => void;
    deleteSelection: () => void;
  };
  gradientTool: {
    isGradientPicking: Ref<boolean>;
    cancelGradient: () => void;
  };
  shapeTool: {
    isShapePicking: Ref<boolean>;
    cancelShape: () => void;
  };
}

/** Editor state refs needed by hotkey handlers */
export interface HotkeyStateDeps {
  isTextEditing: Ref<boolean>;
  isSelected: Ref<boolean>;
  isSelecting: Ref<boolean>;
  isBrushing: Ref<boolean>;
  isErasing: Ref<boolean>;
  selectedBlocks: Ref<Block[][]>;
  canTool: Ref<boolean>;
  x: Ref<number>;
  y: Ref<number>;
}

/** Canvas rendering functions needed by hotkey handlers */
export interface HotkeyRenderingDeps {
  clearToolCanvas: () => Promise<void>;
  delayRedrawCanvas: (force?: boolean) => Promise<void>;
}

/** Action callbacks needed by hotkey handlers */
export interface HotkeyActionDeps {
  canvasKeyDown: (char: string) => Promise<void>;
  applyNudge: (dx: number, dy: number) => Promise<void>;
  drawBrush: (isEraser?: boolean) => Promise<void>;
  eraser: () => Promise<void>;
  dispatchBlocks: (clearDiff?: boolean) => Promise<void>;
}

/** All dependencies injected from Editor.vue */
export interface HotkeyDeps {
  state: HotkeyStateDeps;
  tools: HotkeyToolDeps;
  rendering: HotkeyRenderingDeps;
  actions: HotkeyActionDeps;
}

// ─── Handler helpers (module scope) ─────────────────────────────

/** Handle Escape key — cancels active tool picking/paste modes */
async function handleEscape(tools: HotkeyToolDeps['pasteMode']
  & HotkeyToolDeps['gradientTool']
  & HotkeyToolDeps['shapeTool'],
  clearToolCanvas: () => Promise<void>,
  delayRedrawCanvas: (force?: boolean) => Promise<void>,
): Promise<boolean> {
  if (tools.isGradientPicking.value) {
    tools.cancelGradient();
    await clearToolCanvas();
    return true;
  }
  if (tools.isShapePicking.value) {
    tools.cancelShape();
    await clearToolCanvas();
    return true;
  }
  if (tools.isPasteMode.value) {
    tools.cancelPasteMode();
    await clearToolCanvas();
    await delayRedrawCanvas();
    return true;
  }
  return false;
}

/** Nudge direction map for Shift+Arrow selection nudge */
const NUDGE_MAP: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

/** Brush move direction map for arrow key drawing */
const BRUSH_MOVE: Record<string, (s: HotkeyStateDeps) => void> = {
  ArrowUp: (s) => s.y.value--,
  ArrowDown: (s) => s.y.value++,
  ArrowLeft: (s) => s.x.value--,
  ArrowRight: (s) => s.x.value++,
};

// ─── Composable ──────────────────────────────────────────────────

export function useEditorHotkeys(deps: HotkeyDeps) {
  const s = deps.state;
  const tools = deps.tools;
  const r = deps.rendering;
  const a = deps.actions;

  hotkeys('*', 'editor', async function (event) {
    // Skip modifier combos (Ctrl+Z, Ctrl+Y, Ctrl+C, etc.) — let
    // global shortcuts in scope 'all' handle them instead.
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    event.preventDefault();

    if (s.isTextEditing.value) {
      await a.canvasKeyDown(event.key);
      return;
    }

    // Shift+Arrow: nudge selection
    if (event.shiftKey && s.isSelected.value
        && s.selectedBlocks.value.length > 0) {
      const delta = NUDGE_MAP[event.key];
      if (delta) {
        await a.applyNudge(delta[0], delta[1]);
        return;
      }
    }

    // Escape: cancel active tool
    if (event.key === 'Escape') {
      const handled = await handleEscape(
        { ...tools.pasteMode,
          ...tools.gradientTool, ...tools.shapeTool },
        r.clearToolCanvas, r.delayRedrawCanvas,
      );
      if (handled) return;
    }

    // Delete: clear selection contents
    if (event.key === 'Delete'
        && s.isSelecting.value && s.isSelected.value) {
      tools.pasteMode.deleteSelection();
      await r.delayRedrawCanvas(true);
      return;
    }

    // Arrow keys / Space: brush/eraser drawing
    if (s.isBrushing.value || s.isErasing.value) {
      const mover = BRUSH_MOVE[event.key];
      if (mover) {
        mover(s);
        await a.drawBrush(s.isErasing.value);
      } else if (event.key === ' ') {
        s.canTool.value = true;
        await (s.isBrushing.value
          ? a.drawBrush(false) : a.eraser());
        s.canTool.value = false;
        await a.dispatchBlocks(true);
      }
    }
  });

  /** Cleanup function — call in onUnmounted */
  function cleanup() {
    hotkeys.unbind('*', 'editor');
  }

  return { cleanup };
}
