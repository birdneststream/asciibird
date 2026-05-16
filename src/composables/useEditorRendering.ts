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

export function useEditorRendering(
  state: EditorState & {
    /** yOffset from Editor props — not part of EditorState */
    yOffset: ComputedRef<number>;
  },
  deps: {
    canvasRef: Ref<HTMLCanvasElement | null>;
    canvastoolsRef: Ref<HTMLCanvasElement | null>;
    renderBlock: typeof renderBlockFn;
    clearMainCanvas: typeof clearMainCanvasFn;
    drawHighlights: MatchHighlightState['drawHighlights'];
  },
) {
  // Canvas contexts — set in onMounted, not reactive for performance
  let ctx: CanvasRenderingContext2D | null = null;
  let toolCtx: CanvasRenderingContext2D | null = null;

  /** Initialize canvas 2D contexts. Call from onMounted. */
  function initContexts() {
    const canvas = deps.canvasRef.value;
    if (canvas) {
      ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) ctx.font = getCanvasFont(state.blockSizeMultiplier.value);
    }
    const tools = deps.canvastoolsRef.value;
    if (tools) {
      toolCtx = tools.getContext('2d', { willReadFrequently: true });
    }
  }

  /** Dispose canvas contexts. Call from onUnmounted. */
  function disposeContexts() {
    ctx = null;
    toolCtx = null;
  }

  /** Re-init canvas font after zoom change */
  function updateCanvasFont() {
    if (ctx) {
      ctx.font = getCanvasFont(state.blockSizeMultiplier.value);
    }
  }

  function checkVisibleFn(topVal: number) {
    return checkVisible(topVal, topVal - state.blockHeightComp.value);
  }

  /** Merge layers helper (delegates to ascii.ts) */
  function mergeLayersFn() {
    return mergeLayers();
  }

  /**
   * Render only changed blocks from the diff buffer.
   * Skips blocks covered by higher layers.
   */
  function redrawDiffBlocks(
    bw: number, bh: number,
  ): void {
    for (const row of state.diffBlocks.new) {
      if (!row) continue;
      diffRow: for (const entry of row) {
        if (!entry) continue;

        // Skip if a higher layer covers this block
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
          ctx!,
          { ...entry.b } as Block,
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
    state.canvasHash.value = cyrb53(JSON.stringify(mergeLayersFn()));
  }

  /**
   * Full canvas redraw from merged layer data.
   * Skips off-screen rows when renderOffScreen is enabled.
   */
  function redrawFullCanvas(
    bw: number, bh: number, merged: Block[][],
  ): void {
    deps.clearMainCanvas(
      ctx!,
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
        && !checkVisibleFn(
          state.top.value + canvasYVal - state.yOffset.value,
        )
      ) {
        continue;
      }

      for (let cx = 0; cx < state.currentAsciiWidth.value + 1; cx++) {
        deps.renderBlock(
          ctx!,
          { ...merged[cy][cx] },
          bw * cx,
          canvasYVal,
          bw, bh,
          mircColours99,
        );
      }
    }
  }

  /** Check if diff-based rendering is appropriate right now */
  function canUseDiffRendering(): boolean {
    return !!(
      state.diffBlocks.new.length
      && !state.canTool.value
      && !state.isTextEditing.value
      && !state.isFill.value
      && !state.isBrushing.value
    );
  }

  /**
   * Full canvas redraw with diff optimization.
   * If force=false and hash unchanged, skips full repaint.
   * If diffs exist, paints only changed blocks.
   */
  async function redrawCanvas(force = false) {
    if (!ctx || !state.currentAsciiLayers.value.length) {
      drawMatchHighlightsOnCanvas();
      return;
    }

    const bw = state.blockWidthComp.value;
    const bh = state.blockHeightComp.value;

    if (canUseDiffRendering()) {
      redrawDiffBlocks(bw, bh);
    } else {
      const merged = mergeLayersFn();
      const tempHash = cyrb53(JSON.stringify(merged));

      if (tempHash === state.canvasHash.value && !force) {
        drawMatchHighlightsOnCanvas();
        return;
      }

      state.canvasHash.value = tempHash;
      redrawFullCanvas(bw, bh, merged);
    }

    drawMatchHighlightsOnCanvas();
  }

  /** Draw Find & Replace match highlights on the tool canvas */
  function drawMatchHighlightsOnCanvas() {
    if (toolCtx && deps.canvastoolsRef.value) {
      deps.drawHighlights(
        toolCtx,
        0,
        0,
        deps.canvastoolsRef.value.width,
        deps.canvastoolsRef.value.height,
        state.blockWidthComp.value,
        state.blockHeightComp.value,
      );
    }
  }

  /**
   * Clear the tool overlay canvas and redraw grid if enabled.
   * Also resets the canvas width to clear all content.
   */
  async function clearToolCanvas() {
    if (toolCtx) {
      toolCtx.clearRect(
        0,
        0,
        state.canvasSize.width,
        state.canvasSize.height,
      );
      const tools = deps.canvastoolsRef.value;
      if (tools) {
        // eslint-disable-next-line no-self-assign
        tools.width = tools.width;
      }
      if (state.gridView.value) {
        await drawGrid();
      }
    }
  }

  /** Draw grid overlay lines on the tool canvas */
  function drawGrid() {
    if (!toolCtx) return;
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

  /** Draw a single block indicator rectangle at grid position */
  function drawRectangleBlock(rx: number, ry: number) {
    if (!toolCtx) return;
    const bw = state.blockWidthComp.value;
    const bh = state.blockHeightComp.value;
    const block = state.asciiBlockAtXy.value;
    const indicatorColour = (block && (block.bg === 0 || block.bg === 8))
      ? 1 : 0;

    // Half-block mode: draw half-height indicator
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

  /** Draw cursor indicator at current x/y with mirror positions */
  function drawIndicator() {
    const positions = getMirrorPositions(
      state.x.value,
      state.y.value,
      state.currentAsciiWidth.value,
      state.currentAsciiHeight.value,
      state.mirrorX.value && state.isTextEditing.value,
      state.mirrorY.value && state.isTextEditing.value,
    );
    for (const pos of positions) {
      drawRectangleBlock(pos.x, pos.y);
    }
  }

  /** Draw text editing cursor indicator at textEditing position */
  function drawTextIndicator() {
    const tx = state.textEditing.value.startX;
    const ty = state.textEditing.value.startY;
    if (tx === null || ty === null) return;

    const positions = getMirrorPositions(
      tx,
      ty,
      state.currentAsciiWidth.value,
      state.currentAsciiHeight.value,
      state.mirrorX.value,
      state.mirrorY.value,
    );
    for (const pos of positions) {
      drawRectangleBlock(pos.x, pos.y);
    }
  }

  /** Draw selection rectangle on the tool canvas */
  async function redrawSelect() {
    if (
      state.currentAsciiLayerBlocks.value.length
      && state.isSelected.value
      && toolCtx
    ) {
      await clearToolCanvas();
      toolCtx.fillStyle = mircColours99[0];

      toolCtx.fillRect(
        state.selecting.value.startX!,
        state.selecting.value.startY!,
        state.selecting.value.endX! - state.selecting.value.startX!,
        state.selecting.value.endY! - state.selecting.value.startY!,
      );

      toolCtx.setLineDash([6]);
      toolCtx.strokeRect(
        state.selecting.value.startX!,
        state.selecting.value.startY!,
        state.selecting.value.endX! - state.selecting.value.startX!,
        state.selecting.value.endY! - state.selecting.value.startY!,
      );
    }
  }

  return {
    // Context management
    initContexts,
    disposeContexts,
    updateCanvasFont,
    getCtx: () => ctx,
    getToolCtx: () => toolCtx,

    // Canvas rendering
    redrawCanvas,
    clearToolCanvas,
    drawGrid,
    drawIndicator,
    drawTextIndicator,
    drawRectangleBlock,
    redrawSelect,
    checkVisibleFn,
    mergeLayersFn,
    drawMatchHighlightsOnCanvas,
  };
}
