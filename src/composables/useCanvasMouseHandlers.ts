// Canvas Mouse Handlers composable — extracted from Editor.vue.
//
// Encapsulates mouse event handlers and interpolateStroke helper.
// Handles all tool-specific mouse interactions: brush, eraser, fill,
// dropper, selection, gradient, shapes, replace-color, paste, text.

import { reactive, watch } from 'vue';
import { mircColours99 } from '../ascii';
import { HalfBlockGrid, EMPTY_COLOUR } from '../utils/halfBlockGrid';
import { bresenhamLine } from '../utils/bresenham';
import { drawShapePreview } from '../utils/shapePreview';
import { drawGradientPreview as drawGradientGhost } from '../utils/gradientPreview';
import {
  gradientDirectionFor,
  halfBlockToolLabel,
  toolbarIcons,
} from '../utils/uiConstants';
import {
  constrainShapeCoords,
  modifiersFromEvent,
  type ShapeModifiers,
} from '../utils/shapeConstraints';
import type { ShapeStart } from './useShapeTool';
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
      applyReplaceFromBlock: (
        block: Block,
        selection?: { x: number; y: number; w: number; h: number },
      ) => number;
    };
    gradientTool: {
      isGradientPicking: { value: boolean };
      gradientStart: { value: { x: number; y: number } | null };
      /** FG colour captured when the pick started (ghost start colour) */
      gradientStartColor: { value: number };
      setStartPoint: (x: number, y: number) => void;
      applyGradient: (x: number, y: number, blocks: Block[][]) => void;
    };
    shapeTool: {
      isShapePicking: { value: boolean };
      shapeStart: { value: ShapeStart | null };
      setShapeStart: (x: number, y: number, halfY?: number) => void;
      applyShape: (
        x: number,
        y: number,
        blocks: Block[][],
        halfY?: number,
        modifiers?: Readonly<ShapeModifiers>,
      ) => void;
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
  /** Held alternate shape-modifier keys (A → center, Z → 1:1) */
  shapeAltKeys: { alt: boolean; shift: boolean };
}

// ─── Module-level helpers ───────────────────────────────────────

/**
 * Update held alternate-key state (A → center/alt, Z → 1:1/shift) from a
 * keydown/keyup event. Pure state mutation of `held` — returns true when
 * the event was an alternate-key update.
 *
 * Guards: key repeats (state unchanged), non-shapes-tool contexts (the
 * keys must not interfere with typing or other tools), Ctrl/Cmd combos
 * (Ctrl+Z undo and Ctrl+A must not latch constraint flags), and editable
 * targets — INPUT/TEXTAREA or contenteditable (typing "a" into the
 * brush-size field must not latch the center constraint).
 */
export function updateShapeAltKeys(
  held: { alt: boolean; shift: boolean },
  e: KeyboardEvent,
  shapesToolActive: boolean,
): boolean {
  if (e.repeat) return false;
  if (e.ctrlKey || e.metaKey) return false;
  if (!shapesToolActive) return false;
  const target = e.target as HTMLElement | null;
  if (
    target
    && (target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.isContentEditable)
  ) {
    return false;
  }
  const key = e.key.toLowerCase();
  if (key === 'a') held.alt = e.type === 'keydown';
  else if (key === 'z') held.shift = e.type === 'keydown';
  else return false;
  return true;
}

function showHalfBlockError(
  toastShow: InternalDeps['toastShow'], toolName: string,
): void {
  toastShow(
    `${toolName} is not available in half-block editing mode`,
    { type: 'error' },
  );
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
    // EMPTY_COLOUR (99) means transparent — not a real palette index.
    // Keep the current selection instead of writing an unrenderable
    // colour into palette state.
    const colour = sampledColour !== EMPTY_COLOUR
      ? sampledColour
      : (s.canFg.value ? s.currentFg.value : s.currentBg.value);
    if (s.canFg.value) toolbarStore.changeColourFg(colour);
    else if (s.canBg.value) toolbarStore.changeColourBg(colour);
  } else {
    if (s.canFg.value) toolbarStore.changeColourFg(targetBlock.fg ?? s.currentFg.value);
    if (s.canBg.value) toolbarStore.changeColourBg(targetBlock.bg ?? s.currentBg.value);
    if (s.canText.value) toolbarStore.changeChar(targetBlock.char ?? s.currentChar.value);
  }
  toolbarStore.changeTool(0);
}

function doHandleReplaceColor(d: InternalDeps, targetBlock: Block): void {
  const selection = d.cb.getSelectionBounds();
  d.tools.colorReplace.applyReplaceFromBlock(
    targetBlock,
    selection ?? undefined,
  );
}

/**
 * Shared handler for two-click tools (gradient, shapes).
 * First click sets start point, second click applies the tool.
 * `halfY` carries the half-block Y for half-block shape mode; gradient
 * (blocked in half-block mode) ignores it.
 */
async function handleTwoClickTool(
  d: InternalDeps,
  opts: {
    isPicking: { value: boolean };
    setStart: (x: number, y: number, halfY?: number) => void;
    apply: (x: number, y: number, blocks: Block[][], halfY?: number) => void;
  },
): Promise<void> {
  const halfY = d.s.y.value * 2 + (d.s.isTopHalf.value ? 0 : 1);
  if (!opts.isPicking.value) {
    opts.setStart(d.s.x.value, d.s.y.value, halfY);
  } else {
    opts.apply(d.s.x.value, d.s.y.value, d.s.currentAsciiLayerBlocks.value, halfY);
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

async function doHandleShapes(
  d: InternalDeps,
  modifiers: Readonly<ShapeModifiers>,
): Promise<void> {
  await handleTwoClickTool(d, {
    isPicking: d.tools.shapeTool.isShapePicking,
    setStart: d.tools.shapeTool.setShapeStart,
    // Modifiers (Shift/Alt) constrain the committed shape; the plain
    // gradient-style apply signature stays intact for the shared handler
    apply: (x, y, blocks, halfY) =>
      d.tools.shapeTool.applyShape(x, y, blocks, halfY, modifiers),
  });
}

/**
 * Draw the block-accurate gradient ghost on the tools canvas: the
 * committed look (interpolated bg + existing chars) from the pick
 * point to the cursor, along the active gradient tool's locked
 * direction. Uses the pick-start colour (not the live FG) so the
 * preview matches what applyGradient will commit.
 */
function drawGradientPreview(
  toolCtx: CanvasRenderingContext2D, d: InternalDeps,
): void {
  const start = d.tools.gradientTool.gradientStart.value;
  if (!start) return;
  const direction = gradientDirectionFor(
    toolbarIcons[d.toolbarStore.currentTool]?.name,
  );
  if (!direction) return;

  drawGradientGhost({
    ctx: toolCtx,
    startX: start.x,
    startY: start.y,
    endX: d.s.x.value,
    endY: d.s.y.value,
    blockWidth: d.s.blockWidthComp.value,
    blockHeight: d.s.blockHeightComp.value,
    blockSizeMultiplier: d.s.blockSizeMultiplier.value,
    colours: mircColours99,
    direction,
    startColorIdx: d.tools.gradientTool.gradientStartColor.value,
    endColorIdx: d.toolbarStore.currentBg,
    layerBlocks: d.s.currentAsciiLayerBlocks.value,
  });
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

async function doMouseDown(d: InternalDeps, e?: MouseEvent | TouchEvent): Promise<void> {
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
        showHalfBlockError(
          d.toastShow,
          halfBlockToolLabel(d.s.currentTool.value.name),
        );
        break;
      }
      doHandleReplaceColor(d, targetBlock);
      break;
    case 'gradient-vertical':
    case 'gradient-horizontal':
    case 'gradient-corner':
      if (d.s.toolbarState.value.halfBlockEditing) {
        showHalfBlockError(
          d.toastShow,
          halfBlockToolLabel(d.s.currentTool.value.name),
        );
        break;
      }
      await doHandleGradient(d);
      break;
    case 'shapes':
      // Merge physical Shift/Alt with held A/Z alternates
      await doHandleShapes(d, modifiersFromEvent(e, d.shapeAltKeys));
      break;
  }
}

/**
 * Clear the tool canvas, redraw the cursor indicator, and draw the shape
 * pick preview with modifier constraints applied. Runs its own guards —
 * the modifier-key refresh path bypasses the mousemove early-returns
 * (moved / asciiBlockAtXy) so every entry point re-checks them.
 */
async function refreshShapesPreview(
  d: InternalDeps,
  modifiers: Readonly<ShapeModifiers>,
): Promise<void> {
  const { s, tools, r } = d;
  await r.clearToolCanvas();
  await r.drawIndicator();
  if (!tools.shapeTool.isShapePicking.value) return;

  const start = tools.shapeTool.shapeStart.value;
  if (!start || !s.asciiBlockAtXy.value) return;
  const toolCtx = r.getToolCtx();
  if (!toolCtx) return;

  const halfMode = s.halfBlockEditing.value;
  const shapeType = d.toolbarStore.toolbarState.shapeType;
  const endY = halfMode
    ? s.y.value * 2 + (s.isTopHalf.value ? 0 : 1)
    : s.y.value;

  // Constrain in the active mode's coordinate space (cells / half-rows)
  const constrained = constrainShapeCoords(
    shapeType,
    {
      startX: start.x,
      startY: halfMode ? start.halfY : start.y,
      endX: s.x.value,
      endY,
    },
    modifiers,
  );

  drawShapePreview({
    ctx: toolCtx,
    shapeType,
    startX: constrained.startX,
    startY: constrained.startY,
    endX: constrained.endX,
    endY: constrained.endY,
    blockWidth: s.blockWidthComp.value,
    blockHeight: s.blockHeightComp.value,
    blockSizeMultiplier: s.blockSizeMultiplier.value,
    colours: mircColours99,
    fg: d.toolbarStore.currentFg,
    bg: d.toolbarStore.currentBg,
    char: d.toolbarStore.currentChar,
    halfBlock: halfMode,
  });
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
    case 'replace-color':
    case 'dropper':
    case 'fill':
    case 'fill-eraser':
      await r.clearToolCanvas();
      await r.drawIndicator();
      break;
    case 'gradient-vertical':
    case 'gradient-horizontal':
    case 'gradient-corner':
      await r.clearToolCanvas();
      await r.drawIndicator();
      if (tools.gradientTool.isGradientPicking.value && tools.gradientTool.gradientStart.value && toolCtx) {
        drawGradientPreview(toolCtx, d);
      }
      break;
    case 'shapes':
      await refreshShapesPreview(d, modifiersFromEvent(e, d.shapeAltKeys));
      break;
  }
}

// ─── Composable ─────────────────────────────────────────────────

export function useCanvasMouseHandlers(deps: MouseHandlerDeps) {
  /** Held alternate-key state (A → alt/center, Z → shift/1:1) */
  const shapeAltKeys = reactive({ alt: false, shift: false });

  const d: InternalDeps = {
    s: deps.state,
    tools: deps.tools,
    r: deps.rendering,
    cb: deps.callbacks,
    emit: deps.emit,
    toolbarStore: useToolbarStore(),
    toastShow: useToast().show,
    shapeAltKeys,
  };

  /** Reset held alternate keys (tool switch, window blur) */
  function resetShapeAltKeys(): void {
    shapeAltKeys.alt = false;
    shapeAltKeys.shift = false;
  }

  // Held alternate keys reset when the tool switches away. They are
  // deliberately NOT reset when a pick ends: a key held across
  // consecutive shapes must keep constraining (parity with physical
  // Alt/Shift, which are read fresh from each mouse event). Latch
  // safety comes from keyup (processed without the picking guard),
  // the tool-switch watcher, and the window-blur reset in Editor.vue.
  watch(
    () => d.s.currentTool.value?.name,
    () => resetShapeAltKeys(),
  );

  /**
   * Redraw the shape preview after a Shift/Alt (or A/Z alternate) keydown
   * or keyup — the preview otherwise only refreshes when the cursor moves
   * between cells. Key-repeat events are ignored (state has not changed).
   * Fire-and-forget like the template mouse handlers: preview redraws
   * never block input.
   */
  function canvasModifierKeyChange(e: KeyboardEvent): void {
    const { s } = d;
    if (e.repeat) return;
    const shapesActive = s.currentTool.value?.name === 'shapes';
    // Track alternate keys whenever the shapes tool is active — keyup is
    // processed even after the pick ends so a released key never stays
    // latched (matches Alt/Shift, which are read from the mouse event)
    updateShapeAltKeys(shapeAltKeys, e, shapesActive);
    if (!shapesActive) return;
    if (!d.tools.shapeTool.isShapePicking.value) return;
    void refreshShapesPreview(d, modifiersFromEvent(e, shapeAltKeys));
  }

  return {
    canvasMouseDown: (e?: MouseEvent | TouchEvent) => doMouseDown(d, e),
    canvasMouseUp: () => doMouseUp(d),
    canvasMouseMove: (e: MouseEvent) => doMouseMove(d, e),
    canvasModifierKeyChange,
    resetShapeAltKeys,
  };
}
