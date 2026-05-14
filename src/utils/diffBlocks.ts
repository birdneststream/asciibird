// Shared diff/undo utilities for ASCIIBIRD
// Used by both Dashboard.vue and Editor.vue to track block changes for undo

import type { Block } from '../types';

/** Shape of a diff accumulation object used during editing */
export interface DiffBlocks {
  l: number;
  old: Array<Array<{ x: number; y: number; b: Block } | undefined>>;
  new: Array<Array<{ x: number; y: number; b: Block } | undefined>>;
}

/**
 * Store a diff block for undo tracking.
 * If the position already has an entry, it is not overwritten (first write wins).
 * This is important: during a single brush stroke, we want the ORIGINAL block as "old",
 * not an intermediate state.
 */
export function storeDiffBlocks(
  diffBlocks: DiffBlocks,
  x: number,
  y: number,
  oldBlock: Block,
  newBlock: Block,
): void {
  if (!diffBlocks.old[y]) {
    diffBlocks.old[y] = [];
  }

  if (!diffBlocks.old[y][x]) {
    diffBlocks.old[y][x] = {
      x: x,
      y: y,
      b: { ...oldBlock },
    };
  }

  if (!diffBlocks.new[y]) {
    diffBlocks.new[y] = [];
  }

  if (!diffBlocks.new[y][x]) {
    diffBlocks.new[y][x] = {
      x: x,
      y: y,
      b: { ...newBlock },
    };
  }
}


