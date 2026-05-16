// Layer merging utilities for ASCIIBIRD.
//
// Pure functions for merging layer block data. The main `mergeLayerStack`
// function accepts layers as a parameter — callers inject the store data.
// `mergeTwoLayers` merges an upper layer over a lower layer.

import { isEmptyBlock } from '../ascii';
import type { Block, Layer } from '../types';

/** Sentinel empty block — shared to avoid creating new objects */
const EMPTY: Block = {};

/**
 * Merge two block grids (upper over lower).
 * For each cell: if the upper block has any property set, use it;
 * otherwise fall through to the lower block.
 * Returns a new 2D array (does not mutate inputs).
 */
export function mergeTwoLayers(
  upper: Block[][],
  lower: Block[][],
): Block[][] {
  const result: Block[][] = [];
  const rows = Math.max(upper.length, lower.length);

  for (let y = 0; y < rows; y++) {
    result[y] = [];
    const upperRow = upper[y] || [];
    const lowerRow = lower[y] || [];
    const cols = Math.max(upperRow.length, lowerRow.length);

    for (let x = 0; x < cols; x++) {
      const u = upperRow[x];
      const l = lowerRow[x];

      if (u && !isEmptyBlock(u)) {
        result[y][x] = { ...u };
      } else if (l) {
        result[y][x] = { ...l };
      } else {
        result[y][x] = { ...EMPTY };
      }
    }
  }

  return result;
}

/**
 * Merge a single property from source to current if not already set.
 * Returns undefined if srcVal is null, otherwise returns srcVal.
 */
function mergeProperty<T>(
  curVal: T | undefined,
  srcVal: T | null,
): T | undefined {
  return curVal === undefined
    ? (srcVal !== null ? srcVal : undefined)
    : curVal;
}

/**
 * Merge all visible layers into a single flat block grid.
 * Layers are composited back-to-front: the topmost visible layer's
 * non-empty blocks take precedence.
 *
 * This is a pure function — callers pass the layer array directly,
 * avoiding the lazy store getter anti-pattern.
 *
 * @param layers - Array of layers to merge (typically from the current ASCII)
 * @returns Merged 2D block grid
 */
export const mergeLayerStack = (layers: Layer[]): Block[][] => {
  if (!layers || layers.length === 0) return [];

  const mergedLayers: Block[][] = [];
  const firstLayer = layers[0];

  // Use the first layer's dimensions as the grid size (all layers
  // share the same dimensions enforced by fillNullBlocks)
  const height = firstLayer.height + 1;
  const width = firstLayer.width + 1;

  for (let y = 0; y < height; y++) {
    if (!mergedLayers[y]) {
      mergedLayers[y] = [];
    }

    for (let x = 0; x < width; x++) {
      const curBlock: Block = { ...EMPTY };

      // Loop layers (back to front)
      for (let z = layers.length - 1; z >= 0; z--) {
        if (layers[z].visible === false) continue;

        const srcBlock = layers[z]?.data?.[y]?.[x];
        if (!srcBlock) continue;

        curBlock.bg = mergeProperty(curBlock.bg, srcBlock.bg);
        curBlock.fg = mergeProperty(curBlock.fg, srcBlock.fg);
        curBlock.char = mergeProperty(curBlock.char, srcBlock.char);
      }

      mergedLayers[y][x] = { ...curBlock };
    }
  }

  return mergedLayers;
};
