// Block utility functions shared across components

import type { Block } from '../types';

/**
 * Return a new Block with only defined (non-null, non-undefined) properties.
 * Removes keys whose values are null or undefined.
 */
export function cleanBlock(block: Block): Block {
  const clean: Block = {};
  if (block.fg !== null && block.fg !== undefined) {
    clean.fg = block.fg;
  }
  if (block.bg !== null && block.bg !== undefined) {
    clean.bg = block.bg;
  }
  if (block.char !== null && block.char !== undefined) {
    clean.char = block.char;
  }
  return clean;
}

/**
 * Compute brush offset for centering the brush on the cursor.
 * Returns { dx, dy, xLength } where dx/dy are pixel offsets
 * and xLength is the width of the first non-empty brush row.
 */
export function getBrushOffset(
  blocks: (Block | null)[][],
  blockWidth: number,
  blockHeight: number,
): { dx: number; dy: number; xLength: number } {
  let dx = 0;
  let xLength = 0;

  for (let i = 0; i <= blocks.length; i++) {
    if (blocks[i] && xLength === 0) {
      dx = Math.floor(blocks[i]!.length / 2) * blockWidth;
      xLength = blocks[i]!.length;
      break;
    }
  }

  const dy = Math.floor(blocks.length / 2) * blockHeight;

  return { dx, dy, xLength };
}
