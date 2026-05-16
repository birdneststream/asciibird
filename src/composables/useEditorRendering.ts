import type { Ref, ComputedRef } from 'vue';
import { mircColours99, checkVisible, mergeLayers, cyrb53 } from '../ascii';
import { getCanvasFont } from '../utils/canvasFont';
import { getMirrorPositions } from '../utils/mirror';
import type { Block } from '../types';
import type { EditorState } from './useEditorState';
import type {
  renderBlock as renderBlockFn,
  clearMainCanvas as clearMainCanvasFn,
} from './useMainCanvasRenderer';
import type { MatchHighlightState } from './useMatchHighlight';

/** Mutable canvas context container — set in initContexts */
interface CanvasContexts {
  ctx: CanvasRenderingContext2D | null;
  toolCtx: CanvasRenderingContext2D | null;
}

/** Extended state including yOffset from Editor props */
type RenderState = EditorState & {
  yOffset: ComputedRef<number>;
};

/** Rendering deps from useEditorRendering */
interface RenderDeps {
  canvasRef: Ref<HTMLCanvasElement | null>;
  canvastoolsRef: Ref<HTMLCanvasElement | null>;
  renderBlock: typeof renderBlockFn;
  clearMainCanvas: typeof clearMainCanvasFn;
  drawHighlights: MatchHighlightState['drawHighlights'];
}

// ─── Module-level rendering helpers ──────────────────────────────

function checkVisibleFn(state: RenderState, topVal: number): boolean {
  return checkVisible(topVal, topVal - state.blockHeightComp.value);
}

function redrawDiffBlocks(
  contexts: CanvasContexts,
  state: EditorState,
  deps: RenderDeps,
  bw: number,
  bh: number,
): void {
  for (const row of state.diffBlocks.new) {
    if (!row) continue;
    diffRow: for (const entry of row) {
      if (!entry) continue;

      for (
        let j = state.currentAsciiLayers.value.length - 1;
        j >= state.diffBlocks.l;
        j--
      ) {
        const layer = state.currentAsciiLayers.value[j];
        if (layer.data[entry.y][entry.x] && j !== state.diffBlocks.l) {
          continue diffRow;
        }
      }

      deps.renderBlock(
        contexts.ctx!,
        { ...entry.b },
        bw * entry.x,
        bh * entry.y,
        bw, bh,
        mircColours99,
        {
          canBg: state.canBg.value,
          canFg: state.canFg.value,
          canText: state.canText.value,
          fallbackChar:
            state.currentAsciiLayerBlocks.value[entry.y][entry.x].char
              || ' ',
        },
      );
    }
  }

  state.diffBlocks.l = state.selectedLayerIndex.value;
  state.diffBlocks.new = [];
  state.diffBlocks.old = [];
  state.canvasHash.value = cyrb53(JSON.stringify(mergeLayers()));
}

function redrawFullCanvas(
  contexts: CanvasContexts,
  state: RenderState,
  deps: RenderDeps,
  bw: number,
  bh: number,
  merged: Block[][],
): void {
  deps.clearMainCanvas(
    contexts.ctx!,
    deps.canvasRef.value,
    state.canvasSize.width,
    state.canvasSize.height,
    state.blockSizeMultiplier.value,
  );

  for (let cy = 0; cy < state.currentAsciiHeight.value + 1; cy++) {
    const canvasYVal = bh * cy;

    if (
      state.options.value.renderOffScreen
      && state.top.value !== false
      && !checkVisibleFn(state, state.top.value + canvasYVal - state.yOffset.value)
    ) {
      continue;
    }

    for (let cx = 0; cx < state.currentAsciiWidth.value + 1; cx++) {
      deps.renderBlock(
        contexts.ctx!,
        { ...merged[cy][cx] },
        bw * cx,
        canvasYVal,
        bw, bh,
        mircColours99,
      );
    }
  }
}

function canUseDiffRendering(state: EditorState): boolean {
  return !!(
    state.diffBlocks.new.length
    && !state.canTool.value
    && !state.isTextEditing.value
    && !state.isFill.value
    && !state.isBrushing.value
  );
}

function drawGridFn(
  toolCtx: CanvasRenderingContext2D,
  state: EditorState,
): void {
  const bw = state.blockWidthComp.value;
  const bh = state.blockHeightComp.value;
  const w = state.canvasSize.width;
  const h = state.canvasSize.height;

  toolCtx.beginPath();
  for (let gx = 1; gx <= w; gx += bw) {
    toolCtx.moveTo(gx, 0);
    toolCtx.lineTo(gx, h);
  }
  toolCtx.strokeStyle = 'rgba(40, 40, 40, 1)';
  toolCtx.lineWidth = 1;
  toolCtx.setLineDash([1]);
  toolCtx.stroke();

  toolCtx.beginPath();
  for (
    let gy = 1;
    gy <= h;
    gy += state.halfBlockEditing.value ? (bh / 2) : bh
  ) {
    toolCtx.moveTo(0, gy);
    toolCtx.lineTo(w, gy);
  }
  toolCtx.stroke();
}

function drawRectangleBlockFn(
  toolCtx: CanvasRenderingContext2D,
  state: EditorState,
  rx: number,
  ry: number,
): void {
  const bw = state.blockWidthComp.value;
  const bh = state.blockHeightComp.value;
  const block = state.asciiBlockAtXy.value;
  const indicatorColour = (block && (block.bg === 0 || block.bg === 8))
    ? 1 : 0;

  if (state.toolbarState.value.halfBlockEditing) {
    const halfH = bh / 2;
    const yOff = state.isTopHalf.value ? 0 : halfH;
    toolCtx.fillStyle = mircColours99[indicatorColour];
    toolCtx.fillRect(rx * bw, ry * bh + yOff, bw, halfH);
    toolCtx.setLineDash([1, 2]);
    toolCtx.strokeRect(rx * bw, ry * bh + yOff, bw, halfH);
    return;
  }

  toolCtx.fillStyle = mircColours99[indicatorColour];
  toolCtx.fillRect(rx * bw, ry * bh, bw, bh);
  toolCtx.setLineDash([1, 2]);
  toolCtx.strokeRect(rx * bw, ry * bh, bw, bh);
}

function drawIndicatorFn(
  toolCtx: CanvasRenderingContext2D,
  state: EditorState,
): void {
  const positions = getMirrorPositions(
    state.x.value, state.y.value,
    state.currentAsciiWidth.value, state.currentAsciiHeight.value,
    state.mirrorX.value && state.isTextEditing.value,
    state.mirrorY.value && state.isTextEditing.value,
  );
  for (const pos of positions) {
    drawRectangleBlockFn(toolCtx, state, pos.x, pos.y);
  }
}

function drawTextIndicatorFn(
  toolCtx: CanvasRenderingContext2D,
  state: EditorState,
): void {
  const tx = state.textEditing.value.startX;
  const ty = state.textEditing.value.startY;
  if (tx === null || ty === null) return;
  const positions = getMirrorPositions(
    tx, ty,
    state.currentAsciiWidth.value, state.currentAsciiHeight.value,
    state.mirrorX.value, state.mirrorY.value,
  );
  for (const pos of positions) {
    drawRectangleBlockFn(toolCtx, state, pos.x, pos.y);
  }
}

function drawHighlights(
  contexts: CanvasContexts,
  deps: RenderDeps,
  state: EditorState,
): void {
  if (contexts.toolCtx && deps.canvastoolsRef.value) {
    deps.drawHighlights(
      contexts.toolCtx, 0, 0,
      deps.canvastoolsRef.value.width,
      deps.canvastoolsRef.value.height,
      state.blockWidthComp.value, state.blockHeightComp.value,
    );
  }
}

async function clearToolCanvasFn(
  contexts: CanvasContexts,
  deps: RenderDeps,
  state: EditorState,
): Promise<void> {
  if (!contexts.toolCtx) return;
  contexts.toolCtx.clearRect(
    0, 0, state.canvasSize.width, state.canvasSize.height,
  );
  const tools = deps.canvastoolsRef.value;
  if (tools) {
    // eslint-disable-next-line no-self-assign
    tools.width = tools.width;
  }
  if (state.gridView.value) {
    drawGridFn(contexts.toolCtx, state);
  }
}

async function redrawSelectFn(
  contexts: CanvasContexts,
  deps: RenderDeps,
  state: EditorState,
): Promise<void> {
  if (
    !state.currentAsciiLayerBlocks.value.length
    || !state.isSelected.value
    || !contexts.toolCtx
  ) return;

  await clearToolCanvasFn(contexts, deps, state);
  const sel = state.selecting.value;
  contexts.toolCtx.fillStyle = mircColours99[0];
  contexts.toolCtx.fillRect(
    sel.startX!, sel.startY!,
    sel.endX! - sel.startX!, sel.endY! - sel.startY!,
  );
  contexts.toolCtx.setLineDash([6]);
  contexts.toolCtx.strokeRect(
    sel.startX!, sel.startY!,
    sel.endX! - sel.startX!, sel.endY! - sel.startY!,
  );
}

// ─── Composable ─────────────────────────────────────────────────

export function useEditorRendering(
  state: RenderState,
  deps: RenderDeps,
) {
  const contexts: CanvasContexts = { ctx: null, toolCtx: null };

  function initContexts() {
    const canvas = deps.canvasRef.value;
    if (canvas) {
      contexts.ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (contexts.ctx) {
        contexts.ctx.font = getCanvasFont(state.blockSizeMultiplier.value);
      }
    }
    const tools = deps.canvastoolsRef.value;
    if (tools) {
      contexts.toolCtx = tools.getContext('2d', { willReadFrequently: true });
    }
  }

  function disposeContexts() {
    contexts.ctx = null;
    contexts.toolCtx = null;
  }

  function updateCanvasFont() {
    if (contexts.ctx) {
      contexts.ctx.font = getCanvasFont(state.blockSizeMultiplier.value);
    }
  }

  async function redrawCanvas(force = false) {
    if (!contexts.ctx || !state.currentAsciiLayers.value.length) {
      drawHighlights(contexts, deps, state);
      return;
    }
    const bw = state.blockWidthComp.value;
    const bh = state.blockHeightComp.value;

    if (canUseDiffRendering(state)) {
      redrawDiffBlocks(contexts, state, deps, bw, bh);
    } else {
      const merged = mergeLayers();
      const tempHash = cyrb53(JSON.stringify(merged));
      if (tempHash === state.canvasHash.value && !force) {
        drawHighlights(contexts, deps, state);
        return;
      }
      state.canvasHash.value = tempHash;
      redrawFullCanvas(contexts, state, deps, bw, bh, merged);
    }
    drawHighlights(contexts, deps, state);
  }

  async function clearToolCanvas() {
    return clearToolCanvasFn(contexts, deps, state);
  }

  function doDrawGrid() {
    if (contexts.toolCtx) drawGridFn(contexts.toolCtx, state);
  }

  function doDrawIndicator() {
    if (contexts.toolCtx) drawIndicatorFn(contexts.toolCtx, state);
  }

  function doDrawTextIndicator() {
    if (contexts.toolCtx) drawTextIndicatorFn(contexts.toolCtx, state);
  }

  function doDrawRectangleBlock(rx: number, ry: number) {
    if (contexts.toolCtx) drawRectangleBlockFn(contexts.toolCtx, state, rx, ry);
  }

  async function redrawSelect() {
    return redrawSelectFn(contexts, deps, state);
  }

  return {
    initContexts, disposeContexts, updateCanvasFont,
    getCtx: () => contexts.ctx,
    getToolCtx: () => contexts.toolCtx,
    redrawCanvas, clearToolCanvas,
    drawGrid: doDrawGrid,
    drawIndicator: doDrawIndicator,
    drawTextIndicator: doDrawTextIndicator,
    drawRectangleBlock: doDrawRectangleBlock,
    redrawSelect,
    checkVisibleFn: (topVal: number) => checkVisibleFn(state, topVal),
    mergeLayersFn: () => mergeLayers(),
    drawMatchHighlightsOnCanvas: () => drawHighlights(contexts, deps, state),
  };
}
