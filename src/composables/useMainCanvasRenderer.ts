// Main Canvas Renderer — context lifecycle for the main ASCII canvas.
//
// The pure per-block renderer lives in utils/blockRenderer.ts
// (re-exported here for existing consumers); this composable owns the
// canvas-reset + font behaviour that depends on the canvas element.

import { getCanvasFont } from '../utils/canvasFont';
import { renderBlock } from '../utils/blockRenderer';

export { renderBlock };

/**
 * Clear the main canvas and reset context state.
 *
 * Uses the `canvas.width = canvas.width` reset pattern to fully
 * clear the canvas and reset the 2D context, then re-applies the
 * font scaled by the block size multiplier.
 *
 * @param ctx - Canvas 2D context
 * @param canvas - Canvas element (or null)
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param blockSizeMultiplier - Zoom level for font scaling (default 1)
 */
export function clearMainCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  blockSizeMultiplier: number = 1,
): void {
  if (canvas) {
    // eslint-disable-next-line no-self-assign
    canvas.width = canvas.width;
  }
  ctx.clearRect(0, 0, width, height);
  ctx.font = getCanvasFont(blockSizeMultiplier);
}

/**
 * Composable wrapper for main-canvas ASCII rendering.
 *
 * Returns pure rendering functions that accept a CanvasRenderingContext2D
 * and block data. No store access, no reactive state — the caller
 * (Editor.vue) is responsible for supplying all inputs.
 */
export function useMainCanvasRenderer() {
  return {
    renderBlock,
    clearMainCanvas,
  };
}
