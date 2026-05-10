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
  diffBlocks: { l: number; old: any[]; new: any[] },
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

/**
 * Dispatch accumulated diff blocks to the store.
 * Flattens old/new arrays and commits/ dispatches the update.
 *
 * @param store - Pinia store instance
 * @param diffBlocks - The diff accumulation object
 * @param currentLayerBlocks - The current layer blocks data
 * @param selectedLayerIndex - Index of the selected layer
 * @param clearDiff - Whether to reset the diff after dispatching
 * @param useAsync - If true, uses dispatch (async action). If false, uses commit (sync mutation).
 */
export function dispatchBlocks(
  store: any,
  diffBlocks: { l: number; old: any[]; new: any[] },
  currentLayerBlocks: Block[][],
  selectedLayerIndex: number,
  clearDiff: boolean,
  useAsync: boolean,
): void {
  diffBlocks.old = diffBlocks.old.flat();
  diffBlocks.new = diffBlocks.new.flat();

  const data = {
    blocks: currentLayerBlocks,
    diff: { ...diffBlocks },
  };

  if (useAsync) {
    store.dispatch('updateAsciiBlocksAsync', data);
  } else {
    store.commit('updateAsciiBlocks', data);
  }

  if (clearDiff) {
    diffBlocks.l = selectedLayerIndex;
    diffBlocks.new = [];
    diffBlocks.old = [];
  }
}
