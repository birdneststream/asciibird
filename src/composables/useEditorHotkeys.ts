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

// ─── Types ──────────────────────────────────────────────────────

/** Tool composables needed by hotkey handlers */
export interface HotkeyToolDeps {
  pasteMode: {
    isPasteMode: Ref<boolean>;
    cancelPasteMode: () => void;
    deleteSelection: () => void;
  };
  colorReplace: {
    isReplacePicking: Ref<boolean>;
    resetReplace: () => void;
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
  selectedBlocks: Ref<any[]>;
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

// ─── Composable ──────────────────────────────────────────────────

export function useEditorHotkeys(deps: HotkeyDeps) {
  const s = deps.state;
  const tools = deps.tools;
  const r = deps.rendering;
  const a = deps.actions;

  hotkeys('*', 'editor', async function (event) {
    // Skip modifier combos (Ctrl+Z, Ctrl+Y, Ctrl+C, etc.) — let
    // global shortcuts in scope 'all' handle them instead of routing
    // through canvasKeyDown which would type the raw character.
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    event.preventDefault();

    if (s.isTextEditing.value) {
      await a.canvasKeyDown(event.key);
      return;
    }

    if (
      event.shiftKey
      && s.isSelected.value
      && s.selectedBlocks.value.length > 0
    ) {
      switch (event.key) {
        case 'ArrowUp':
          await a.applyNudge(0, -1);
          return;
        case 'ArrowDown':
          await a.applyNudge(0, 1);
          return;
        case 'ArrowLeft':
          await a.applyNudge(-1, 0);
          return;
        case 'ArrowRight':
          await a.applyNudge(1, 0);
          return;
      }
    }

    if (event.key === 'Escape' && tools.colorReplace.isReplacePicking.value) {
      tools.colorReplace.resetReplace();
      return;
    }

    if (event.key === 'Escape'
      && tools.gradientTool.isGradientPicking.value) {
      tools.gradientTool.cancelGradient();
      await r.clearToolCanvas();
      return;
    }

    if (event.key === 'Escape'
      && tools.shapeTool.isShapePicking.value) {
      tools.shapeTool.cancelShape();
      await r.clearToolCanvas();
      return;
    }

    if (event.key === 'Escape'
      && tools.pasteMode.isPasteMode.value) {
      tools.pasteMode.cancelPasteMode();
      await r.clearToolCanvas();
      await r.delayRedrawCanvas();
      return;
    }

    // Delete key: clear selection contents
    if (event.key === 'Delete'
      && s.isSelecting.value
      && s.isSelected.value) {
      tools.pasteMode.deleteSelection();
      await r.delayRedrawCanvas(true);
      return;
    }

    if (s.isBrushing.value || s.isErasing.value) {
      switch (event.key) {
        case 'ArrowUp':
          s.y.value--;
          await a.drawBrush(s.isErasing.value);
          break;
        case 'ArrowDown':
          s.y.value++;
          await a.drawBrush(s.isErasing.value);
          break;
        case 'ArrowLeft':
          s.x.value--;
          await a.drawBrush(s.isErasing.value);
          break;
        case 'ArrowRight':
          s.x.value++;
          await a.drawBrush(s.isErasing.value);
          break;
        case ' ':
          s.canTool.value = true;
          if (s.isBrushing.value) {
            await a.drawBrush(false);
          } else {
            await a.eraser();
          }
          s.canTool.value = false;
          await a.dispatchBlocks(true);
          break;
      }
    }
  });

  /** Cleanup function — call in onUnmounted */
  function cleanup() {
    hotkeys.unbind('*', 'editor');
  }

  return { cleanup };
}
