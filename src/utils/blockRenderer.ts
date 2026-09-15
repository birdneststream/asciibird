// Block Renderer — pure canvas rendering of a single ASCII block.
//
// Extracted from composables/useMainCanvasRenderer.ts so utils (ghost
// previews) can render blocks identically to the main canvas without
// importing from the composables layer. No state, no store access —
// the caller supplies the context, colours and geometry.

import type { Block } from '../types';
import { hasColour } from './mircColors';
import { UPPER_HALF, LOWER_HALF } from './halfBlockChars';

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
 * Render a half-block character (▀ or ▄) as two coloured halves.
 * Pure function — no external state.
 */
function renderHalfBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  canvasX: number,
  canvasY: number,
  blockWidth: number,
  blockHeight: number,
  colours: string[],
  canBg: boolean,
): void {
  const halfH = blockHeight / 2;
  const isUpper = block.char === UPPER_HALF;
  const topColour = isUpper ? block.fg : block.bg;
  const bottomColour = isUpper ? block.bg : block.fg;

  if (canBg && hasColour(topColour, colours)) {
    ctx.fillStyle = colours[topColour];
    ctx.fillRect(canvasX, canvasY, blockWidth, halfH);
  }
  if (canBg && hasColour(bottomColour, colours)) {
    ctx.fillStyle = colours[bottomColour];
    ctx.fillRect(canvasX, canvasY + halfH, blockWidth, halfH);
  }
}

/**
 * Render the character glyph for a standard (non-half-block) block.
 * Pure function — no external state.
 */
function renderCharGlyph(
  ctx: CanvasRenderingContext2D,
  block: Block,
  canvasX: number,
  canvasY: number,
  blockWidth: number,
  blockHeight: number,
  colours: string[],
  canFg: boolean,
  canText: boolean,
  fallbackChar: string,
): void {
  if (block.char === undefined || block.char === null) return;

  const charToDraw = canText ? block.char : fallbackChar;
  if (!charToDraw) return;

  if (canFg && hasColour(block.fg, colours)) {
    ctx.fillStyle = colours[block.fg];
  } else {
    ctx.fillStyle = '#FFFFFF';
  }
  ctx.fillText(charToDraw, canvasX, canvasY + blockHeight - 3);
}

/**
 * Render a single ASCII block onto a canvas context.
 *
 * Pure function — no external state, no side effects beyond the
 * supplied CanvasRenderingContext2D. The caller controls the context
 * font (`getCanvasFont(multiplier)`) and any compositing such as
 * `globalAlpha` for ghost previews.
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

  // Half-block characters use two-colour split rendering
  if (block.char === UPPER_HALF || block.char === LOWER_HALF) {
    renderHalfBlock(
      ctx, block, canvasX, canvasY,
      blockWidth, blockHeight, colours, canBg,
    );
    return;
  }

  // Standard block rendering
  if (canBg && hasColour(block.bg, colours)) {
    ctx.fillStyle = colours[block.bg];
    ctx.fillRect(canvasX, canvasY, blockWidth, blockHeight);
  }

  renderCharGlyph(
    ctx, block, canvasX, canvasY,
    blockWidth, blockHeight, colours, canFg, canText, fallbackChar,
  );
}
