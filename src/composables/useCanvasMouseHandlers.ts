// Canvas Mouse Handlers composable — extracted from Editor.vue.
//
// Encapsulates the three mouse event handlers (canvasMouseDown,
// canvasMouseUp, canvasMouseMove) and the interpolateStroke helper.
// These handle all tool-specific mouse interactions on the canvas:
// brush drawing, eraser, fill, dropper, selection, gradient, shapes,
// replace-color, paste mode, and text editing.
//
// Dependencies are injected via a grouped options interface to keep
// the parameter count manageable. Each group corresponds to a logical
// concern: state, tool composables, rendering, callbacks, and emits.

import { mircColours99 } from '../ascii';
import { HalfBlockGrid } from '../utils/halfBlockGrid';
import { bresenhamLine } from '../utils/bresenham';
import { drawShapePreview } from '../utils/shapePreview';
import { useToolbarStore } from '../store/toolbar';
import { useToast } from './useToast';
import type { EditorState } from './useEditorState';
import type { Block } from '../types';

// ─── Types ──────────────────────────────────────────────────────

/** Emission callbacks for mouse handler events */
export interface MouseEmit {
  coords: (v: { x: number; y: number }) => void;
}

/** All dependencies injected from Editor.vue */
export interface MouseHandlerDeps {
  /** Shared reactive state from useEditorState */
  state: EditorState;
  /** Tool composables */
  tools: {
    pasteMode: {
      isPasteMode: { value: boolean };
      confirmPaste: (x: number, y: number) => void;
      drawPastePreview: (
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        bw: number, bh: number,
      ) => void;
    };
    colorReplace: {
      isReplacePicking: { value: boolean };
      replaceColorSource: { value: {
        fg: number | null; bg: number | null;
      } | null };
      pickSource: (block: Block) => void;
      applyReplace: (
        selection?: { x: number; y: number; w: number; h: number },
      ) => void;
    };
    gradientTool: {
      isGradientPicking: { value: boolean };
      gradientStart: { value: { x: number; y: number } | null };
      setStartPoint: (x: number, y: number) => void;
      applyGradient: (
        x: number, y: number, blocks: Block[][],
      ) => void;
    };
    shapeTool: {
      isShapePicking: { value: boolean };
      shapeStart: { value: { x: number; y: number } | null };
      setShapeStart: (x: number, y: number) => void;
      applyShape: (
        x: number, y: number, blocks: Block[][],
      ) => void;
    };
    toolApp: {
      drawBrush: (isEraser?: boolean) => Promise<void>;
      eraser: () => Promise<void>;
      fill: (isEraser?: boolean) => void;
    };
  };
  /** Canvas rendering functions */
  rendering: {
    getToolCtx: () => CanvasRenderingContext2D | null;
    clearToolCanvas: () => Promise<void>;
    drawIndicator: () => Promise<void>;
    drawTextIndicator: () => Promise<void>;
    delayRedrawCanvas: (force?: boolean) => Promise<void>;
    redrawSelect: () => Promise<void>;
  };
  /** Editor-local callback functions */
  callbacks: {
    dispatchBlocks: (clearDiff?: boolean) => Promise<void>;
    processSelect: () => Promise<void>;
    getSelectionBounds: () => {
      x: number; y: number; w: number; h: number;
    } | null;
  };
  /** Emission callbacks */
  emit: MouseEmit;
}

// ─── Composable ──────────────────────────────────────────────────

export function useCanvasMouseHandlers(deps: MouseHandlerDeps) {
  const toolbarStore = useToolbarStore();
  const { show: toastShow } = useToast();

  // Destructure for convenience
  const s = deps.state;
  const tools = deps.tools;
  const r = deps.rendering;
  const cb = deps.callbacks;
  const emit = deps.emit;

  // ─── Interpolate Stroke ────────────────────────────────────────

  /**
   * Interpolate between the last brush position and the current one
   * using Bresenham's line algorithm. Applies the given function at
   * each intermediate point for smooth brush strokes.
   *
   * Temporarily mutates x, y, isTopHalf and restores them after.
   */
  async function interpolateStroke(
    applyFn: () => Promise<void>,
  ): Promise<void> {
    if (
      !s.canTool.value
      || s.lastBrushX.value < 0
      || s.lastBrushY.value < 0
      || (s.lastBrushX.value === s.x.value
        && s.lastBrushY.value === s.y.value)
    ) {
      return;
    }

    const savedIsTopHalf = s.isTopHalf.value;

    if (s.halfBlockEditing.value) {
      const lastHalfY = s.lastBrushY.value * 2
        + (s.lastIsTopHalf.value ? 0 : 1);
      const curHalfY = s.y.value * 2
        + (savedIsTopHalf ? 0 : 1);

      const points = bresenhamLine(
        s.lastBrushX.value, lastHalfY,
        s.x.value, curHalfY,
      );

      for (let i = 1; i < points.length - 1; i++) {
        const savedX = s.x.value;
        const savedY = s.y.value;
        s.x.value = points[i].x;
        s.y.value = Math.floor(points[i].y / 2);
        s.isTopHalf.value = points[i].y % 2 === 0;
        await applyFn();
        s.x.value = savedX;
        s.y.value = savedY;
      }
    } else {
      const points = bresenhamLine(
        s.lastBrushX.value, s.lastBrushY.value,
        s.x.value, s.y.value,
      );

      for (let i = 1; i < points.length - 1; i++) {
        const savedX = s.x.value;
        const savedY = s.y.value;
        s.x.value = points[i].x;
        s.y.value = points[i].y;
        await applyFn();
        s.x.value = savedX;
        s.y.value = savedY;
      }
    }

    s.isTopHalf.value = savedIsTopHalf;
  }

  // ─── Mouse Up ──────────────────────────────────────────────────

  async function canvasMouseUp() {
    if (s.isDefault.value) return;

    switch (s.currentTool.value.name) {
      case 'brush':
      case 'eraser':
        s.canTool.value = false;
        s.lastBrushX.value = -1;
        s.lastBrushY.value = -1;
        s.lastIsTopHalf.value = true;
        await cb.dispatchBlocks(true);
        break;

      case 'fill-eraser':
      case 'fill':
        s.canTool.value = false;
        break;

      case 'select':
        s.selecting.value.canSelect = false;
        await cb.processSelect();
        break;

      case 'text':
        s.textEditing.value.startX = s.x.value;
        s.textEditing.value.startY = s.y.value;
        break;
    }
  }

  // ─── Mouse Down ────────────────────────────────────────────────

  async function canvasMouseDown() {
    // Paste mode: confirm paste at cursor position
    if (tools.pasteMode.isPasteMode.value) {
      tools.pasteMode.confirmPaste(s.x.value, s.y.value);
      await r.delayRedrawCanvas(true);
      return;
    }

    if (s.isDefault.value) return;

    if (s.asciiBlockAtXy.value && s.currentTool.value) {
      const targetBlock = s.asciiBlockAtXy.value;

      switch (s.currentTool.value.name) {
        case 'select':
          s.selecting.value.startX = s.canvasX.value;
          // In half-block mode, start Y at half-block precision
          s.selecting.value.startY = s.halfBlockEditing.value
            ? s.canvasY.value
              + (s.isTopHalf.value ? 0 : s.blockHeightComp.value / 2)
            : s.canvasY.value;
          s.selecting.value.canSelect = true;
          await r.clearToolCanvas();
          break;

        case 'fill':
          tools.toolApp.fill();
          s.canTool.value = false;
          await cb.dispatchBlocks(true);
          break;

        case 'fill-eraser':
          tools.toolApp.fill(true);
          await cb.dispatchBlocks(true);
          break;

        case 'brush':
          s.canTool.value = true;
          s.lastBrushX.value = s.x.value;
          s.lastBrushY.value = s.y.value;
          s.lastIsTopHalf.value = s.isTopHalf.value;
          await tools.toolApp.drawBrush();
          break;

        case 'eraser':
          s.canTool.value = true;
          s.lastBrushX.value = s.x.value;
          s.lastBrushY.value = s.y.value;
          s.lastIsTopHalf.value = s.isTopHalf.value;
          await tools.toolApp.eraser();
          break;

        case 'dropper':
          handleDropper(targetBlock);
          break;

        case 'replace-color':
          handleReplaceColor(targetBlock);
          break;

        case 'gradient':
          await handleGradient();
          break;

        case 'shapes':
          await handleShapes();
          break;
      }
    }
  }

  // ─── Tool-specific handlers (mouseDown) ────────────────────────

  function handleDropper(targetBlock: Block) {
    if (s.toolbarState.value.halfBlockEditing) {
      const halfY = s.y.value * 2 + (s.isTopHalf.value ? 0 : 1);
      const grid = new HalfBlockGrid(
        s.currentAsciiLayerBlocks.value,
      );
      const sampledColour = grid.getColour(s.x.value, halfY);
      if (s.canFg.value) {
        toolbarStore.changeColourFg(sampledColour);
      } else if (s.canBg.value) {
        toolbarStore.changeColourBg(sampledColour);
      }
    } else {
      if (s.canFg.value) {
        toolbarStore.changeColourFg(
          targetBlock.fg === undefined
            ? s.currentFg.value
            : targetBlock.fg,
        );
      }
      if (s.canBg.value) {
        toolbarStore.changeColourBg(
          targetBlock.bg === undefined
            ? s.currentBg.value
            : targetBlock.bg,
        );
      }
      if (s.canText.value) {
        toolbarStore.changeChar(
          targetBlock.char === undefined
            ? s.currentChar.value
            : targetBlock.char,
        );
      }
    }
    toolbarStore.changeTool(0);
  }

  function handleReplaceColor(targetBlock: Block) {
    if (s.toolbarState.value.halfBlockEditing) {
      toastShow(
        'Color replace is not available in half-block mode',
        { type: 'error' },
      );
      return;
    }
    if (!tools.colorReplace.isReplacePicking.value) {
      tools.colorReplace.pickSource(targetBlock);
    } else {
      const selection = cb.getSelectionBounds();
      tools.colorReplace.applyReplace(selection ?? undefined);
    }
  }

  async function handleGradient() {
    if (s.toolbarState.value.halfBlockEditing) {
      toastShow(
        'Gradient fill is not available in half-block mode',
        { type: 'error' },
      );
      return;
    }
    if (!tools.gradientTool.isGradientPicking.value) {
      tools.gradientTool.setStartPoint(s.x.value, s.y.value);
    } else {
      tools.gradientTool.applyGradient(
        s.x.value, s.y.value,
        s.currentAsciiLayerBlocks.value,
      );
      s.canTool.value = false;
      await cb.dispatchBlocks(true);
      await r.delayRedrawCanvas(true);
    }
  }

  async function handleShapes() {
    if (s.toolbarState.value.halfBlockEditing) {
      toastShow(
        'Shape tools are not available in half-block mode',
        { type: 'error' },
      );
      return;
    }
    if (!tools.shapeTool.isShapePicking.value) {
      tools.shapeTool.setShapeStart(s.x.value, s.y.value);
    } else {
      tools.shapeTool.applyShape(
        s.x.value, s.y.value,
        s.currentAsciiLayerBlocks.value,
      );
      s.canTool.value = false;
      await cb.dispatchBlocks(true);
      await r.delayRedrawCanvas(true);
    }
  }

  // ─── Mouse Move ────────────────────────────────────────────────

  async function canvasMouseMove(e: MouseEvent) {
    // Update coordinates regardless of mode
    const lastX = s.x.value;
    const lastY = s.y.value;

    if (e.offsetX >= 0) {
      s.x.value = e.offsetX;
    }
    if (e.offsetY >= 0) {
      s.y.value = e.offsetY;
      s.isTopHalf.value = Math.floor(
        e.offsetY / (s.blockHeightComp.value / 2),
      ) % 2 === 0;
    }

    s.x.value = Math.floor(s.x.value / s.blockWidthComp.value);
    s.y.value = Math.floor(s.y.value / s.blockHeightComp.value);

    if (tools.pasteMode.isPasteMode.value) {
      const toolCtx = r.getToolCtx();
      if (toolCtx) {
        await r.clearToolCanvas();
        tools.pasteMode.drawPastePreview(
          toolCtx, s.x.value, s.y.value,
          s.blockWidthComp.value, s.blockHeightComp.value,
        );
      }
      emit.coords({ x: s.x.value, y: s.y.value });
      return;
    }

    if (s.isDefault.value) return;

    if (s.x.value === lastX && s.y.value === lastY
      && !s.halfBlockEditing.value) {
      return;
    }

    emit.coords({ x: s.x.value, y: s.y.value });

    if (s.asciiBlockAtXy.value) {
      const toolCtx = r.getToolCtx();
      switch (s.currentTool.value.name) {
        case 'brush':
          if (s.isMouseOnCanvas.value) {
            await interpolateStroke(tools.toolApp.drawBrush);
            await r.clearToolCanvas();
            await tools.toolApp.drawBrush();
            await r.delayRedrawCanvas();
            s.lastBrushX.value = s.x.value;
            s.lastBrushY.value = s.y.value;
            s.lastIsTopHalf.value = s.isTopHalf.value;
          }
          break;

        case 'eraser':
          await r.clearToolCanvas();
          if (s.isMouseOnCanvas.value) {
            await interpolateStroke(tools.toolApp.eraser);
            await tools.toolApp.drawBrush(true);
            await r.delayRedrawCanvas();
            await tools.toolApp.eraser();
            s.lastBrushX.value = s.x.value;
            s.lastBrushY.value = s.y.value;
            s.lastIsTopHalf.value = s.isTopHalf.value;
          }
          break;

        case 'select':
          if (s.selecting.value.canSelect) {
            s.selecting.value.endX =
              s.canvasX.value + s.blockWidthComp.value;
            // In half-block mode, end Y at half-block precision
            s.selecting.value.endY = s.halfBlockEditing.value
              ? s.canvasY.value
                + (s.isTopHalf.value ? 0
                  : s.blockHeightComp.value / 2)
                + s.blockHeightComp.value / 2
              : s.canvasY.value + s.blockHeightComp.value;
            await r.redrawSelect();
          }
          if (!s.isSelected.value) {
            await r.redrawSelect();
          }
          break;

        case 'text':
          await r.clearToolCanvas();
          await r.drawIndicator();
          if (s.isTextEditingValues.value) {
            await r.drawTextIndicator();
          }
          break;

        case 'dropper':
          await r.clearToolCanvas();
          await r.drawIndicator();
          break;

        case 'fill':
        case 'fill-eraser':
          await r.clearToolCanvas();
          await r.drawIndicator();
          break;

        case 'replace-color':
          await r.clearToolCanvas();
          await r.drawIndicator();
          if (tools.colorReplace.isReplacePicking.value
            && tools.colorReplace.replaceColorSource.value
            && toolCtx) {
            drawReplaceColorPreview(toolCtx);
          }
          break;

        case 'gradient':
          await r.clearToolCanvas();
          await r.drawIndicator();
          if (tools.gradientTool.isGradientPicking.value
            && tools.gradientTool.gradientStart.value
            && toolCtx) {
            drawGradientPreview(toolCtx);
          }
          break;

        case 'shapes':
          await r.clearToolCanvas();
          await r.drawIndicator();
          if (tools.shapeTool.isShapePicking.value
            && tools.shapeTool.shapeStart.value
            && toolCtx) {
            drawShapePreview({
              ctx: toolCtx,
              shapeType: toolbarStore.toolbarState.shapeType,
              startX: tools.shapeTool.shapeStart.value.x,
              startY: tools.shapeTool.shapeStart.value.y,
              endX: s.x.value,
              endY: s.y.value,
              blockWidth: s.blockWidthComp.value,
              blockHeight: s.blockHeightComp.value,
              strokeColor: mircColours99[toolbarStore.currentFg],
            });
          }
          break;
      }
    }
  }

  // ─── Preview helpers (mouseMove sub-draws) ─────────────────────

  function drawReplaceColorPreview(toolCtx: CanvasRenderingContext2D) {
    const source = tools.colorReplace.replaceColorSource.value;
    if (!source) return;
    const bw = s.blockWidthComp.value;
    if (source.fg !== null) {
      toolCtx.fillStyle = mircColours99[source.fg];
      toolCtx.fillRect(
        s.canvasX.value, s.canvasY.value - 6,
        bw / 2, 4,
      );
    }
    if (source.bg !== null) {
      toolCtx.fillStyle = mircColours99[source.bg];
      toolCtx.fillRect(
        s.canvasX.value + bw / 2, s.canvasY.value - 6,
        bw / 2, 4,
      );
    }
  }

  function drawGradientPreview(toolCtx: CanvasRenderingContext2D) {
    const start = tools.gradientTool.gradientStart.value;
    if (!start) return;
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;
    const sx = start.x * bw;
    const sy = start.y * bh;
    toolCtx.strokeStyle = mircColours99[toolbarStore.currentFg];
    toolCtx.lineWidth = 2;
    toolCtx.setLineDash([4, 4]);
    toolCtx.strokeRect(
      Math.min(sx, s.canvasX.value),
      Math.min(sy, s.canvasY.value),
      Math.abs(s.canvasX.value - sx) + bw,
      Math.abs(s.canvasY.value - sy) + bh,
    );
    toolCtx.fillStyle = mircColours99[toolbarStore.currentFg];
    toolCtx.fillRect(sx, sy, bw, bh);
    toolCtx.fillStyle = mircColours99[toolbarStore.currentBg];
    toolCtx.fillRect(
      s.canvasX.value, s.canvasY.value, bw, bh,
    );
  }

  return {
    canvasMouseDown,
    canvasMouseUp,
    canvasMouseMove,
    interpolateStroke,
  };
}
