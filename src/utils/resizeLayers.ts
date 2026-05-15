/**
 * Content-Preserving Canvas Resize — resizes all layers to new dimensions.
 *
 * Unlike `fillNullBlocks` (which only adds empty blocks for growing),
 * this utility properly handles both directions:
 * - **Growing**: preserves existing blocks, adds empty blocks at edges
 * - **Shrinking**: truncates rows and columns beyond new dimensions
 *
 * The function is **pure**: no store access, no mutation of input.
 * Each block is shallow-cloned (Block properties are primitive values).
 * Layer metadata (label, visible) is preserved.
 */

import type { Block, Layer } from '../types';

/** Shallow-clone a block (safe because Block properties are primitives) */
function cloneBlock(block: Block | undefined): Block {
  if (!block) return {};
  return { ...block };
}

/**
 * Resize all layers to the specified dimensions.
 *
 * @param layers - Current layer array
 * @param newWidth - New width in blocks (columns)
 * @param newHeight - New height in blocks (rows)
 * @returns New layers array with resized data. Original layers are not mutated.
 * @throws {RangeError} If newWidth or newHeight is less than 1
 */
export function resizeLayers(
  layers: Layer[],
  newWidth: number,
  newHeight: number,
): Layer[] {
  if (newWidth < 1 || newHeight < 1) {
    throw new RangeError(
      `Resize dimensions must be >= 1, got ${newWidth}x${newHeight}`,
    );
  }

  return layers.map((layer) => {
    const newData: Block[][] = [];

    for (let y = 0; y < newHeight; y++) {
      const newRow: Block[] = [];
      const srcRow = layer.data[y];

      for (let x = 0; x < newWidth; x++) {
        if (srcRow && srcRow[x]) {
          newRow.push(cloneBlock(srcRow[x]));
        } else {
          newRow.push({});
        }
      }
      newData.push(newRow);
    }

    return {
      ...layer,
      data: newData,
      width: newWidth,
      height: newHeight,
    };
  });
}
