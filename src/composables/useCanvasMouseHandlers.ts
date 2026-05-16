// Canvas Mouse Handlers composable — extracted from Editor.vue.
//
// Encapsulates mouse event handlers and interpolateStroke helper.
// Handles all tool-specific mouse interactions: brush, eraser, fill,
// dropper, selection, gradient, shapes, replace-color, paste, text.

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
  state: EditorState;
  tools: {
    pasteMode: {
      isPasteMode: { value: boolean };
      confirmPaste: (x: number, y: number) => void;
      drawPastePreview: (
        ctx: CanvasRenderingContext2D,
        x: number, y: number, bw: number, bh: number,
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
      applyGradient: (x: number, y: number, blocks: Block[][]) => void;
    };
    shapeTool: {
      isShapePicking: { value: boolean };
      shapeStart: { value: { x: number; y: number } | null };
      setShapeStart: (x: number, y: number) => void;
      applyShape: (x: number, y: number, blocks: Block[][]) => void;
    };
    toolApp: {
      drawBrush: (isEraser?: boolean) => Promise<void>;
      eraser: () => Promise<void>;
      fill: (isEraser?: boolean) => void;
    };
  };
  rendering: {
    getToolCtx: () => CanvasRenderingContext2D | null;
    clearToolCanvas: () => Promise<void>;
    drawIndicator: () => Promise<void>;
    drawTextIndicator: () => Promise<void>;
    delayRedrawCanvas: (force?: boolean) => Promise<void>;
    redrawSelect: () => Promise<void>;
  };
  callbacks: {
    dispatchBlocks: (clearDiff?: boolean) => Promise<void>;
    processSelect: () => Promise<void>;
    getSelectionBounds: () => {
      x: number; y: number; w: number; h: number;
    } | null;
  };
  emit: MouseEmit;
}

// ─── Internal deps bundle (avoids passing each dep separately) ──

interface InternalDeps {
  s: EditorState;
  tools: MouseHandlerDeps['tools'];
  r: MouseHandlerDeps['rendering'];
  cb: MouseHandlerDeps['callbacks'];
  emit: MouseEmit;
  toolbarStore: ReturnType<typeof useToolbarStore>;
  toastShow: (msg: string, opts?: Record<string, unknown>) => void;
}

// ─── Module-level helpers ───────────────────────────────────────

function showHalfBlockError(
  toastShow: InternalDeps['toastShow'], toolName: string,
): void {
  toastShow(`${toolName} is not available in half-block mode`, { type: 'error' });
}

function updateLastBrushPos(s: EditorState): void {
  s.lastBrushX.value = s.x.value;
  s.lastBrushY.value = s.y.value;
  s.lastIsTopHalf.value = s.isTopHalf.value;
}

function updateGridCoords(
  s: EditorState, e: MouseEvent, lastX: number, lastY: number,
): boolean {
  if (e.offsetX >= 0) s.x.value = e.offsetX;
  if (e.offsetY >= 0) {
    s.y.value = e.offsetY;
    s.isTopHalf.value = Math.floor(
      e.offsetY / (s.blockHeightComp.value / 2),
    ) % 2 === 0;
  }
  s.x.value = Math.floor(s.x.value / s.blockWidthComp.value);
  s.y.value = Math.floor(s.y.value / s.blockHeightComp.value);
  return s.x.value !== lastX || s.y.value !== lastY
    || s.halfBlockEditing.value;
}

async function interpolateStroke(
  s: EditorState,
  applyFn: () => Promise<void>,
): Promise<void> {
  if (
    !s.canTool.value
    || s.lastBrushX.value < 0
    || s.lastBrushY.value < 0
    || (s.lastBrushX.value === s.x.value && s.lastBrushY.value === s.y.value)
  ) return;

  const savedIsTopHalf = s.isTopHalf.value;

  if (s.halfBlockEditing.value) {
    const lastHalfY = s.lastBrushY.value * 2 + (s.lastIsTopHalf.value ? 0 : 1);
    const curHalfY = s.y.value * 2 + (savedIsTopHalf ? 0 : 1);
    const points = bresenhamLine(s.lastBrushX.value, lastHalfY, s.x.value, curHalfY);
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
    const points = bresenhamLine(s.lastBrushX.value, s.lastBrushY.value, s.x.value, s.y.value);
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

function doHandleDropper(d: InternalDeps, targetBlock: Block): void {
  const { s, toolbarStore } = d;
  if (s.toolbarState.value.halfBlockEditing) {
    const halfY = s.y.value * 2 + (s.isTopHalf.value ? 0 : 1);
    const grid = new HalfBlockGrid(s.currentAsciiLayerBlocks.value);
    const sampledColour = grid.getColour(s.x.value, halfY);
    if (s.canFg.value) toolbarStore.changeColourFg(sampledColour);
    else if (s.canBg.value) toolbarStore.changeColourBg(sampledColour);
  } else {
    if (s.canFg.value) toolbarStore.changeColourFg(targetBlock.fg ?? s.currentFg.value);
    if (s.canBg.value) toolbarStore.changeColourBg(targetBlock.bg ?? s.currentBg.value);
    if (s.canText.value) toolbarStore.changeChar(targetBlock.char ?? s.currentChar.value);
  }
  toolbarStore.changeTool(0);
}

function doHandleReplaceColor(d: InternalDeps, targetBlock: Block): void {
  if (!d.tools.colorReplace.isReplacePicking.value) {
    d.tools.colorReplace.pickSource(targetBlock);
  } else {
    const selection = d.cb.getSelectionBounds();
    d.tools.colorReplace.applyReplace(selection ?? undefined);
  }
}

/**
 * Shared handler for two-click tools (gradient, shapes).
 * First click sets start point, second click applies the tool.
 */
async function handleTwoClickTool(
  d: InternalDeps,
  opts: {
    isPicking: { value: boolean };
    setStart: (x: number, y: number) => void;
    apply: (x: number, y: number, blocks: Block[][]) => void;
  },
): Promise<void> {
  if (!opts.isPicking.value) {
    opts.setStart(d.s.x.value, d.s.y.value);
  } else {
    opts.apply(d.s.x.value, d.s.y.value, d.s.currentAsciiLayerBlocks.value);
    d.s.canTool.value = false;
    await d.cb.dispatchBlocks(true);
    await d.r.delayRedrawCanvas(true);
  }
}

async function doHandleGradient(d: InternalDeps): Promise<void> {
  await handleTwoClickTool(d, {
    isPicking: d.tools.gradientTool.isGradientPicking,
    setStart: d.tools.gradientTool.setStartPoint,
    apply: d.tools.gradientTool.applyGradient,
  });
}

async function doHandleShapes(d: InternalDeps): Promise<void> {
  await handleTwoClickTool(d, {
    isPicking: d.tools.shapeTool.isShapePicking,
    setStart: d.tools.shapeTool.setShapeStart,
    apply: d.tools.shapeTool.applyShape,
  });
}

function drawReplaceColorPreview(
  toolCtx: CanvasRenderingContext2D, d: InternalDeps,
): void {
  const source = d.tools.colorReplace.replaceColorSource.value;
  if (!source) return;
  const bw = d.s.blockWidthComp.value;
  if (source.fg !== null) {
    toolCtx.fillStyle = mircColours99[source.fg];
    toolCtx.fillRect(d.s.canvasX.value, d.s.canvasY.value - 6, bw / 2, 4);
  }
  if (source.bg !== null) {
    toolCtx.fillStyle = mircColours99[source.bg];
    toolCtx.fillRect(d.s.canvasX.value + bw / 2, d.s.canvasY.value - 6, bw / 2, 4);
  }
}

function drawGradientPreview(
  toolCtx: CanvasRenderingContext2D, d: InternalDeps,
): void {
  const start = d.tools.gradientTool.gradientStart.value;
  if (!start) return;
  const bw = d.s.blockWidthComp.value;
  const bh = d.s.blockHeightComp.value;
  const sx = start.x * bw;
  const sy = start.y * bh;
  toolCtx.strokeStyle = mircColours99[d.toolbarStore.currentFg];
  toolCtx.lineWidth = 2;
  toolCtx.setLineDash([4, 4]);
  toolCtx.strokeRect(
    Math.min(sx, d.s.canvasX.value), Math.min(sy, d.s.canvasY.value),
    Math.abs(d.s.canvasX.value - sx) + bw,
    Math.abs(d.s.canvasY.value - sy) + bh,
  );
  toolCtx.fillStyle = mircColours99[d.toolbarStore.currentFg];
  toolCtx.fillRect(sx, sy, bw, bh);
  toolCtx.fillStyle = mircColours99[d.toolbarStore.currentBg];
  toolCtx.fillRect(d.s.canvasX.value, d.s.canvasY.value, bw, bh);
}

async function doMouseUp(d: InternalDeps): Promise<void> {
  const { s, cb } = d;
  if (s.isDefault.value) return;
  switch (s.currentTool.value.name) {
    case 'brush':
    case 'eraser':
      if (!s.canTool.value) return;
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
      if (!s.selecting.value.canSelect) return;
      s.selecting.value.canSelect = false;
      await cb.processSelect();
      break;
    case 'text':
      s.textEditing.value.startX = s.x.value;
      s.textEditing.value.startY = s.y.value;
      break;
  }
}

async function doMouseDown(d: InternalDeps): Promise<void> {
  const { s, tools, r, cb } = d;
  if (tools.pasteMode.isPasteMode.value) {
    tools.pasteMode.confirmPaste(s.x.value, s.y.value);
    await r.delayRedrawCanvas(true);
    return;
  }
  if (s.isDefault.value) return;
  if (!s.asciiBlockAtXy.value || !s.currentTool.value) return;
  const targetBlock = s.asciiBlockAtXy.value;

  switch (s.currentTool.value.name) {
    case 'select':
      s.selecting.value.startX = s.canvasX.value;
      s.selecting.value.startY = s.halfBlockEditing.value
        ? s.canvasY.value + (s.isTopHalf.value ? 0 : s.blockHeightComp.value / 2)
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
      updateLastBrushPos(s);
      await tools.toolApp.drawBrush();
      break;
    case 'eraser':
      s.canTool.value = true;
      updateLastBrushPos(s);
      await tools.toolApp.eraser();
      break;
    case 'dropper':
      doHandleDropper(d, targetBlock);
      break;
    case 'replace-color':
      if (d.s.toolbarState.value.halfBlockEditing) {
        showHalfBlockError(d.toastShow, 'Color replace');
        break;
      }
      doHandleReplaceColor(d, targetBlock);
      break;
    case 'gradient':
      if (d.s.toolbarState.value.halfBlockEditing) {
        showHalfBlockError(d.toastShow, 'Gradient fill');
        break;
      }
      await doHandleGradient(d);
      break;
    case 'shapes':
      if (d.s.toolbarState.value.halfBlockEditing) {
        showHalfBlockError(d.toastShow, 'Shape tools');
        break;
      }
      await doHandleShapes(d);
      break;
  }
}

// eslint-disable-next-line complexity -- tool switch dispatch inherently has many branches
async function doMouseMove(d: InternalDeps, e: MouseEvent): Promise<void> {
  const { s, tools, r, emit } = d;
  const lastX = s.x.value;
  const lastY = s.y.value;
  const moved = updateGridCoords(s, e, lastX, lastY);

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
  if (s.isDefault.value || !moved) return;
  emit.coords({ x: s.x.value, y: s.y.value });
  if (!s.asciiBlockAtXy.value) return;

  const toolCtx = r.getToolCtx();

  switch (s.currentTool.value.name) {
    case 'brush':
      await interpolateStroke(s, tools.toolApp.drawBrush);
      await r.clearToolCanvas();
      await tools.toolApp.drawBrush();
      await r.delayRedrawCanvas();
      updateLastBrushPos(s);
      break;
    case 'eraser':
      await r.clearToolCanvas();
      await interpolateStroke(s, tools.toolApp.eraser);
      await tools.toolApp.drawBrush(true);
      await r.delayRedrawCanvas();
      await tools.toolApp.eraser();
      updateLastBrushPos(s);
      break;
    case 'select':
      if (s.selecting.value.canSelect) {
        s.selecting.value.endX = s.canvasX.value + s.blockWidthComp.value;
        s.selecting.value.endY = s.halfBlockEditing.value
          ? s.canvasY.value + (s.isTopHalf.value ? 0 : s.blockHeightComp.value / 2) + s.blockHeightComp.value / 2
          : s.canvasY.value + s.blockHeightComp.value;
        await r.redrawSelect();
      }
      if (!s.isSelected.value) await r.redrawSelect();
      break;
    case 'text':
      await r.clearToolCanvas();
      await r.drawIndicator();
      if (s.isTextEditingValues.value) await r.drawTextIndicator();
      break;
    case 'dropper':
    case 'fill':
    case 'fill-eraser':
      await r.clearToolCanvas();
      await r.drawIndicator();
      break;
    case 'replace-color':
      await r.clearToolCanvas();
      await r.drawIndicator();
      if (tools.colorReplace.isReplacePicking.value && tools.colorReplace.replaceColorSource.value && toolCtx) {
        drawReplaceColorPreview(toolCtx, d);
      }
      break;
    case 'gradient':
      await r.clearToolCanvas();
      await r.drawIndicator();
      if (tools.gradientTool.isGradientPicking.value && tools.gradientTool.gradientStart.value && toolCtx) {
        drawGradientPreview(toolCtx, d);
      }
      break;
    case 'shapes':
      await r.clearToolCanvas();
      await r.drawIndicator();
      if (tools.shapeTool.isShapePicking.value && tools.shapeTool.shapeStart.value && toolCtx) {
        drawShapePreview({
          ctx: toolCtx,
          shapeType: d.toolbarStore.toolbarState.shapeType,
          startX: tools.shapeTool.shapeStart.value.x,
          startY: tools.shapeTool.shapeStart.value.y,
          endX: s.x.value, endY: s.y.value,
          blockWidth: s.blockWidthComp.value,
          blockHeight: s.blockHeightComp.value,
          strokeColor: mircColours99[d.toolbarStore.currentFg],
        });
      }
      break;
  }
}

// ─── Composable ─────────────────────────────────────────────────

export function useCanvasMouseHandlers(deps: MouseHandlerDeps) {
  const d: InternalDeps = {
    s: deps.state,
    tools: deps.tools,
    r: deps.rendering,
    cb: deps.callbacks,
    emit: deps.emit,
    toolbarStore: useToolbarStore(),
    toastShow: useToast().show,
  };

  return {
    canvasMouseDown: () => doMouseDown(d),
    canvasMouseUp: () => doMouseUp(d),
    canvasMouseMove: (e: MouseEvent) => doMouseMove(d, e),
  };
}
