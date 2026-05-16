// Editor Watchers composable — registers all Editor.vue reactive watchers.
//
// Extracted from Editor.vue to reduce its file size. Vue 3 automatically
// stops watchers when the component unmounts — no cleanup return needed.
// Must be called synchronously from <script setup>.

import { watch } from 'vue';
import type { EditorState } from './useEditorState';
import type { Ref } from 'vue';

// ─── Types ──────────────────────────────────────────────────────

/** Canvas rendering methods needed by watchers */
export interface WatcherRenderingDeps {
  clearToolCanvas: () => Promise<void>;
  delayRedrawCanvas: (force?: boolean) => Promise<void>;
  drawBrush: (plain?: boolean) => Promise<void>;
  drawGrid: () => void;
  drawTextIndicator: () => Promise<void>;
  drawIndicator: () => Promise<void>;
  updateCanvasFont: () => void;
}

/** Canvas panel methods needed by watchers */
export interface WatcherCanvasPanelDeps {
  setPosition: (x: number, y: number) => void;
  setDimensions: (w: number, h: number) => void;
}

/** Callback functions defined in Editor.vue */
export interface WatcherCallbacks {
  resetSelectTool: () => Promise<void>;
  warnInvisibleLayer: () => void;
  dispatchBlocks: (clearDiff?: boolean) => Promise<void>;
}

/** Props-derived refs needed by watchers */
export interface WatcherProps {
  resetSelect: Ref<boolean>;
  updateCanvas: Ref<boolean>;
  yOffset: Ref<number>;
}

/** Emit functions needed by watchers */
export interface WatcherEmits {
  textediting: (val: { startX: number | null; startY: number | null }) => void;
  selecting: (val: Record<string, unknown>) => void;
}

/** Options for useEditorWatchers */
export interface EditorWatcherOptions {
  state: EditorState;
  rendering: WatcherRenderingDeps;
  canvasPanel: WatcherCanvasPanelDeps;
  callbacks: WatcherCallbacks;
  props: WatcherProps;
  emit: WatcherEmits;
  toastShow: (msg: string, opts?: Record<string, unknown>) => void;
}

// ─── Composable ─────────────────────────────────────────────────

// eslint-disable-next-line max-lines-per-function -- watcher registration: 12 watch() calls must run in composable scope
export function useEditorWatchers(opts: EditorWatcherOptions): void {
  const s = opts.state;
  const r = opts.rendering;
  const cp = opts.canvasPanel;
  const cb = opts.callbacks;
  const pr = opts.props;

  /** Recalculate canvas dimensions from current ASCII size and zoom */
  function recalcCanvasSize() {
    s.canvasSize.width = s.currentAsciiWidth.value * s.blockWidthComp.value;
    s.canvasSize.height = s.currentAsciiHeight.value * s.blockHeightComp.value;
  }

  // ─── Canvas Dimension Watchers ────────────────────────────────

  watch(s.currentAsciiHeight, (val) => {
    s.canvasSize.height = val * s.blockHeightComp.value;
  });

  watch(s.currentAsciiWidth, (val) => {
    s.canvasSize.width = val * s.blockWidthComp.value;
  });

  watch(() => s.store.tab, (newTab) => {
    const meta = s.store.asciibirdMeta[newTab];
    if (!meta) return;

    recalcCanvasSize();

    cp.setPosition(meta.x ?? 0, meta.y ?? 0);
    cp.setDimensions(
      s.currentAsciiWidth.value * s.blockWidthComp.value,
      s.currentAsciiHeight.value * s.blockHeightComp.value,
    );
  });

  watch(s.blockSizeMultiplier, () => {
    recalcCanvasSize();
    cp.setDimensions(
      s.currentAsciiWidth.value * s.blockWidthComp.value,
      s.currentAsciiHeight.value * s.blockHeightComp.value,
    );
    r.updateCanvasFont();
    r.delayRedrawCanvas(true);
  });

  // ─── Tool State Watchers ──────────────────────────────────────

  watch(s.currentTool, async () => {
    cb.warnInvisibleLayer();

    if (s.halfBlockEditing.value) {
      if (s.currentTool.value.name === 'text') {
        opts.toastShow(
          'Text mode is not available in half-block editing mode',
        );
        s.toolbarStore.changeTool(0);
        return;
      }
      if (s.currentTool.value.name === 'gradient') {
        opts.toastShow(
          'Gradient fill is not available in half-block editing mode',
        );
        s.toolbarStore.changeTool(0);
        return;
      }
      if (s.currentTool.value.name === 'shapes') {
        opts.toastShow(
          'Shape tools are not available in half-block editing mode',
        );
        s.toolbarStore.changeTool(0);
        return;
      }
    }

    switch (s.currentTool.value.name) {
      case 'default':
        s.textEditing.value.startX = null;
        s.textEditing.value.startY = null;
        await cb.resetSelectTool();
        await r.clearToolCanvas();
        break;

      case 'text':
        s.textEditing.value.startX = s.x.value;
        s.textEditing.value.startY = s.y.value;
        break;
    }
  });

  // When mouse leaves canvas: clear visual indicators and commit
  // pending changes. For brush/eraser, preserve canTool so the stroke
  // can resume if the mouse re-enters while the button is held.
  // Other tools (fill, dropper, text, etc.) deactivate on leave.
  // See: Gitea issues #83, #84.
  watch(s.isMouseOnCanvas, async (val, old) => {
    if (val !== old) {
      if (!s.isSelecting.value) {
        if (!s.isBrushing.value && !s.isErasing.value) {
          s.canTool.value = false;
        }
        await r.clearToolCanvas();
        await cb.dispatchBlocks(true);
        await r.delayRedrawCanvas();
      }
    }
  });

  watch(s.gridView, async (val, old) => {
    if (val !== old) {
      await r.clearToolCanvas();
    }
  });

  watch(s.brushBlocks, async () => {
    await r.clearToolCanvas();
    if (s.isMouseOnCanvas.value && s.isBrushing.value) {
      await r.drawBrush();
    }
  });

  watch(s.halfBlockEditing, async (active) => {
    if (active) {
      s.toolbarStore.updateBrushSize({
        brushSizeWidth: 1,
        brushSizeHeight: 1,
        brushSizeType: 'square',
      });

      if (s.currentTool.value.name === 'text') {
        s.toolbarStore.changeTool(0);
        s.textEditing.value.startX = null;
        s.textEditing.value.startY = null;
      }

      if (s.currentTool.value.name === 'select') {
        s.toolbarStore.changeTool(0);
        await cb.resetSelectTool();
      }

      if (!s.canFg.value) {
        s.toolbarStore.changeTargetingFg(true);
      }
    }

    if (s.gridView.value) {
      await r.clearToolCanvas();
      r.drawGrid();
    }
  });

  // ─── Sync & Emit Watchers ─────────────────────────────────────

  watch(s.currentSelectedLayer, (val) => {
    if (val && val.visible) {
      cb.warnInvisibleLayer();
    }
  });

  watch(s.currentAsciiLayerBlocks, async () => {
    await r.delayRedrawCanvas();
  });

  watch(s.isTextEditing, async (val) => {
    if (val === false) {
      await cb.dispatchBlocks(true);
    }
  });

  watch(s.textEditing, (val) => {
    opts.emit.textediting(val);
  }, { deep: true });

  watch(s.selecting, (val) => {
    opts.emit.selecting(val);
  }, { deep: true });

  watch(s.selectedLayerIndex, (val, old) => {
    if (val !== old) {
      s.diffBlocks.l = val;
    }
  });

  watch(s.currentAsciiLayers, async () => {
    await r.delayRedrawCanvas(true);
  });

  // ─── Prop Watchers ────────────────────────────────────────────

  watch(() => pr.resetSelect.value, async () => {
    await cb.resetSelectTool();
  });

  watch(() => pr.updateCanvas.value, async () => {
    await r.clearToolCanvas();
    await r.drawTextIndicator();
    await r.drawIndicator();
    await r.delayRedrawCanvas();
  });

  watch(() => pr.yOffset.value, async () => {
    await r.delayRedrawCanvas(true);
  });
}
