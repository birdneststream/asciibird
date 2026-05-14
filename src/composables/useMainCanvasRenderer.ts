import type { Block } from '../types';
import { getCanvasFont } from '../utils/canvasFont';

export interface RenderBlockOptions {
  /** Whether to draw the background fill (default: true) */
  canBg?: boolean;
  /** Whether to use the block's foreground color (default: true) */
  canFg?: boolean;
  /** Whether to draw the character text (default: true) */
  canText?: boolean;
  /** Character to draw when canText is false (default: ' ') */
  fallbackChar?: string;
}

/**
 * Render a single ASCII block onto a canvas context.
 *
 * Pure function — no external state, no side effects beyond the
 * supplied CanvasRenderingContext2D.
 */
export function renderBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  canvasX: number,
  canvasY: number,
  blockWidth: number,
  blockHeight: number,
  colours: string[],
  options?: RenderBlockOptions,
): void {
  const {
    canBg = true,
    canFg = true,
    canText = true,
    fallbackChar = ' ',
  } = options ?? {};

  if (canBg && block.bg !== undefined && block.bg !== null) {
    ctx.fillStyle = colours[block.bg];
    ctx.fillRect(canvasX, canvasY, blockWidth, blockHeight);
  }

  if (block.char !== undefined && block.char !== null) {
    const charToDraw = canText ? block.char : fallbackChar;
    if (charToDraw) {
      if (canFg && block.fg !== undefined && block.fg !== null) {
        ctx.fillStyle = colours[block.fg];
      } else {
        ctx.fillStyle = '#FFFFFF';
      }
      ctx.fillText(charToDraw, canvasX, canvasY + blockHeight - 3);
    }
  }
}

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
