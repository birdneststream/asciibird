// Text alignment utilities for ASCIIBIRD.
//
// Provides pure functions to align block rows within a selection width.
// Used by the context menu to center, left-justify, or right-justify
// content within a selection rectangle.

import { isEmptyBlock } from '../ascii';
import type { Block } from '../types';

/** A single empty block */
const emptyBlock: Block = {};

/**
 * Find the index of the first non-empty block in a row.
 * Returns -1 if the entire row is empty.
 */
function findContentStart(row: Block[]): number {
  for (let x = 0; x < row.length; x++) {
    if (!isEmptyBlock(row[x])) return x;
  }
  return -1;
}

/**
 * Find the index of the last non-empty block in a row.
 * Returns -1 if the entire row is empty.
 */
function findContentEnd(row: Block[]): number {
  for (let x = row.length - 1; x >= 0; x--) {
    if (!isEmptyBlock(row[x])) return x;
  }
  return -1;
}

/**
 * Align a block row to the center within the given width.
 * Content is shifted so it's horizontally centered.
 * Returns a new array of the specified width.
 *
 * @param row - The block row to align (may be shorter or longer than width)
 * @param width - The target width (selection width)
 * @returns A new array of `width` blocks with content centered
 */
export function alignCenter(row: Block[], width: number): Block[] {
  if (width <= 0) return [];

  // Build a row padded to width with empty blocks
  const padded: Block[] = [];
  for (let x = 0; x < width; x++) {
    padded[x] = x < row.length ? row[x] : { ...emptyBlock };
  }

  const start = findContentStart(padded);
  if (start === -1) return padded; // all empty, nothing to center

  const end = findContentEnd(padded);
  const contentWidth = end - start + 1;
  const offset = Math.floor((width - contentWidth) / 2) - start;

  if (offset === 0) return padded; // already centered

  // Create new row with content shifted by offset
  const result: Block[] = Array.from({ length: width }, () => ({ ...emptyBlock }));
  for (let x = start; x <= end; x++) {
    const nx = x + offset;
    if (nx >= 0 && nx < width) {
      result[nx] = padded[x];
    }
  }

  return result;
}

/**
 * Align a block row to the left within the given width.
 * Strips leading empty blocks and shifts content to the left edge.
 * Returns a new array of the specified width.
 *
 * @param row - The block row to align
 * @param width - The target width (selection width)
 * @returns A new array of `width` blocks with content left-aligned
 */
export function alignLeft(row: Block[], width: number): Block[] {
  if (width <= 0) return [];

  const start = findContentStart(row);
  if (start === -1) {
    // All empty
    return Array.from({ length: width }, () => ({ ...emptyBlock }));
  }

  if (start === 0) {
    // Already left-aligned, just ensure width
    const result: Block[] = [];
    for (let x = 0; x < width; x++) {
      result[x] = x < row.length ? row[x] : { ...emptyBlock };
    }
    return result;
  }

  // Shift content left by `start` positions
  const result: Block[] = Array.from({ length: width }, () => ({ ...emptyBlock }));
  for (let x = start; x < row.length && (x - start) < width; x++) {
    result[x - start] = row[x];
  }

  return result;
}

/**
 * Align a block row to the right within the given width.
 * Strips trailing empty blocks and shifts content to the right edge.
 * Returns a new array of the specified width.
 *
 * @param row - The block row to align
 * @param width - The target width (selection width)
 * @returns A new array of `width` blocks with content right-aligned
 */
export function alignRight(row: Block[], width: number): Block[] {
  if (width <= 0) return [];

  const end = findContentEnd(row);
  if (end === -1) {
    // All empty
    return Array.from({ length: width }, () => ({ ...emptyBlock }));
  }

  // Calculate the offset to push content to the right edge
  const contentWidth = end + 1;
  const offset = width - contentWidth;

  if (offset < 0) {
    // Content exceeds width — keep the trailing (rightmost) characters
    const shift = -offset;
    const result: Block[] = Array.from(
      { length: width }, () => ({ ...emptyBlock }),
    );
    for (let x = shift; x < row.length && (x - shift) < width; x++) {
      result[x - shift] = row[x];
    }
    return result;
  }

  if (offset === 0) {
    // Content exactly fills width
    const result: Block[] = [];
    for (let x = 0; x < width; x++) {
      result[x] = x < row.length ? row[x] : { ...emptyBlock };
    }
    return result;
  }

  // Shift content right by `offset` positions
  const result: Block[] = Array.from({ length: width }, () => ({ ...emptyBlock }));
  for (let x = 0; x <= end && x + offset < width; x++) {
    result[x + offset] = row[x];
  }

  return result;
}

/**
 * Apply an alignment to a 2D block selection.
 * Each row is independently aligned within the selection width.
 *
 * @param blocks - 2D array of blocks (the selection)
 * @param alignment - 'center', 'left', or 'right'
 * @returns New 2D array with each row aligned
 */
export function alignSelection(
  blocks: Block[][],
  alignment: 'center' | 'left' | 'right',
): Block[][] {
  if (!blocks.length) return blocks;

  const width = blocks[0].length;
  const alignFn = alignment === 'center' ? alignCenter
    : alignment === 'right' ? alignRight
    : alignLeft;

  return blocks.map(row => alignFn(row, width));
}
