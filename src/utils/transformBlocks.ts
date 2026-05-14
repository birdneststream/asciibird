// Block array transform utilities for selection and brush operations.
//
// All functions are pure: they accept a Block[][] and return a new,
// deep-cloned, transformed Block[][] without mutating the input.
//
// Half-block character handling:
//   ▀ (U+2580, upper half) and ▄ (U+2584, lower half) swap on vertical
//   flips, and their fg/bg colours also swap because the rendering
//   semantics are position-dependent.
//   ▌ (U+258C, left half) and ▐ (U+2590, right half) swap on horizontal
//   flips.

import type { Block } from '../types';

/** Upper-half block character */
const UPPER_HALF = '\u2580'; // ▀
/** Lower-half block character */
const LOWER_HALF = '\u2584'; // ▄
/** Left-half block character */
const LEFT_HALF = '\u258C'; // ▌
/** Right-half block character */
const RIGHT_HALF = '\u2590'; // ▐
/** Full block character */
const FULL_BLOCK = '\u2588'; // █

/**
 * Deep-clone a Block[][] array.
 * Uses JSON round-trip to match existing codebase semantics
 * (undefined properties are dropped, which is correct for Block).
 */
export function cloneBlocks(blocks: Block[][]): Block[][] {
  return JSON.parse(JSON.stringify(blocks));
}

/**
 * Pad a potentially jagged Block[][] into a rectangular one.
 * Missing cells are filled with empty blocks `{}`.
 */
export function padToRect(blocks: Block[][]): Block[][] {
  if (blocks.length === 0) return [];
  const maxWidth = Math.max(...blocks.map(row => row.length));
  return blocks.map(row => {
    const padded = [...row];
    while (padded.length < maxWidth) {
      padded.push({});
    }
    return padded;
  });
}

/**
 * Swap fg/bg colours on a block that has a half-block character.
 * This is needed because ▀ renders fg on top and bg on bottom;
 * when flipped, the colour roles reverse.
 */
function swapHalfBlockColors(block: Block): void {
  const fg = block.fg;
  block.fg = block.bg;
  block.bg = fg;
}

/**
 * Swap vertical half-block characters and their colours.
 * ▀ ↔ ▄ with fg/bg swap.
 */
function swapVerticalHalfBlock(block: Block): void {
  if (block.char === UPPER_HALF) {
    block.char = LOWER_HALF;
    swapHalfBlockColors(block);
  } else if (block.char === LOWER_HALF) {
    block.char = UPPER_HALF;
    swapHalfBlockColors(block);
  }
}

/**
 * Swap horizontal half-block characters.
 * ▌ ↔ ▐ (no colour swap needed for horizontal).
 */
function swapHorizontalHalfBlock(block: Block): void {
  if (block.char === LEFT_HALF) {
    block.char = RIGHT_HALF;
  } else if (block.char === RIGHT_HALF) {
    block.char = LEFT_HALF;
  }
}

/** Transform type identifiers */
export type TransformType =
  | 'flip-h'
  | 'flip-v'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'rotate-180';

/**
 * Flip a block array horizontally (mirror left/right).
 * Each row is reversed. Horizontal half-block chars ▌↔▐ swap.
 */
export function flipHorizontal(blocks: Block[][]): Block[][] {
  const rect = padToRect(blocks);
  const result = cloneBlocks(rect);
  return result.map(row => {
    const reversed = row.reverse();
    // Swap ▌↔▐ characters after reversal
    for (const block of reversed) {
      swapHorizontalHalfBlock(block);
    }
    return reversed;
  });
}

/**
 * Flip a block array vertically (mirror top/bottom).
 * Row order is reversed. Vertical half-block chars ▀↔▄ swap
 * with fg/bg colour swap.
 */
export function flipVertical(blocks: Block[][]): Block[][] {
  const rect = padToRect(blocks);
  const result = cloneBlocks(rect);
  const reversed = result.reverse();
  // Swap ▀↔▄ and fg/bg after reversal
  for (const row of reversed) {
    for (const block of row) {
      swapVerticalHalfBlock(block);
    }
  }
  return reversed;
}

/**
 * Rotate a block array 90° clockwise.
 * Transpose then reverse each row.
 * Vertical half-block chars ▀↔▄ become horizontal ▌↔▐ (and vice versa).
 */
export function rotate90CW(blocks: Block[][]): Block[][] {
  const rect = padToRect(blocks);
  if (rect.length === 0) return [];

  const rows = rect.length;
  const cols = rect[0].length;

  // Transpose
  const transposed: Block[][] = [];
  for (let x = 0; x < cols; x++) {
    transposed[x] = [];
    for (let y = 0; y < rows; y++) {
      transposed[x].push({ ...rect[y][x] });
    }
  }

  // Reverse each row
  for (const row of transposed) {
    row.reverse();
    // Handle half-block orientation change:
    // Vertical half-blocks become horizontal after 90° rotation
    for (const block of row) {
      if (block.char === UPPER_HALF || block.char === LOWER_HALF) {
        // Vertical → horizontal half-block
        const isUpper = block.char === UPPER_HALF;
        block.char = isUpper ? LEFT_HALF : RIGHT_HALF;
        swapHalfBlockColors(block);
      } else if (block.char === LEFT_HALF || block.char === RIGHT_HALF) {
        // Horizontal → vertical half-block
        const isLeft = block.char === LEFT_HALF;
        block.char = isLeft ? UPPER_HALF : LOWER_HALF;
        swapHalfBlockColors(block);
      }
    }
  }

  return transposed;
}

/**
 * Rotate a block array 90° counter-clockwise.
 * Reverse each row then transpose.
 * Vertical half-block chars ▀↔▄ become horizontal ▌↔▐ (and vice versa).
 */
export function rotate90CCW(blocks: Block[][]): Block[][] {
  const rect = padToRect(blocks);
  if (rect.length === 0) return [];

  const rows = rect.length;
  const cols = rect[0].length;

  // Build rotated result directly: new[y][x] = old[x][rows-1-y]
  const result: Block[][] = [];
  for (let y = 0; y < cols; y++) {
    result[y] = [];
    for (let x = 0; x < rows; x++) {
      const block = { ...rect[x][cols - 1 - y] };
      // Handle half-block orientation change
      if (block.char === UPPER_HALF || block.char === LOWER_HALF) {
        const isUpper = block.char === UPPER_HALF;
        block.char = isUpper ? RIGHT_HALF : LEFT_HALF;
        swapHalfBlockColors(block);
      } else if (block.char === LEFT_HALF || block.char === RIGHT_HALF) {
        const isLeft = block.char === LEFT_HALF;
        block.char = isLeft ? LOWER_HALF : UPPER_HALF;
        swapHalfBlockColors(block);
      }
      result[y].push(block);
    }
  }

  return result;
}

/**
 * Rotate a block array 180°.
 * Equivalent to flip both axes. Vertical half-block chars ▀↔▄ swap
 * with fg/bg colour swap.
 */
export function rotate180(blocks: Block[][]): Block[][] {
  return flipVertical(flipHorizontal(blocks));
}

/**
 * Apply a named transform to a block array.
 * Returns a new, deep-cloned, transformed Block[][].
 */
export function transformBlocks(
  blocks: Block[][],
  type: TransformType,
): Block[][] {
  switch (type) {
    case 'flip-h':
      return flipHorizontal(blocks);
    case 'flip-v':
      return flipVertical(blocks);
    case 'rotate-cw':
      return rotate90CW(blocks);
    case 'rotate-ccw':
      return rotate90CCW(blocks);
    case 'rotate-180':
      return rotate180(blocks);
    default:
      return cloneBlocks(blocks);
  }
}

/**
 * Check if a block contains a half-block character that needs
 * special transform handling.
 */
export function isHalfBlockChar(char: string | null | undefined): boolean {
  return char === UPPER_HALF
    || char === LOWER_HALF
    || char === LEFT_HALF
    || char === RIGHT_HALF
    || char === FULL_BLOCK;
}
