/**
 * Content-Preserving Canvas Resize — resizes all layers to new dimensions.
 *
 * Blocks are NEVER lost when shrinking. The data array is preserved at its
 * full size — only the `width`/`height` metadata changes to control which
 * portion is rendered. When you grow back, the original blocks reappear.
 *
 * - **Growing**: preserves all data, pads empty blocks at edges if needed
 * - **Shrinking**: preserves all data, only reduces visible dimensions
 *
 * The function is **pure**: no store access, no mutation of input.
 * Each block is shallow-cloned (Block properties are primitive values).
 * Layer metadata (label, visible) is preserved.
 */

import type { Block, Layer } from '../types';

/** Shallow-clone a block (safe because Block properties are primitive values) */
function cloneBlock(block: Block | undefined): Block {
  if (!block) return {};
  return { ...block };
}

/**
 * Resize all layers to the specified dimensions.
 *
 * @param layers - Current layer array
 * @param newWidth - New visible width in blocks (columns)
 * @param newHeight - New visible height in blocks (rows)
 * @returns New layers array with resized dimensions. Original layers are not mutated.
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
    const oldData = layer.data;
    const oldHeight = oldData.length;
    const oldWidth = oldData[0]?.length ?? 0;

    // Determine the actual data dimensions needed.
    // We keep all original data, so the data array is the MAX of old/new.
    const dataHeight = Math.max(oldHeight, newHeight);
    const dataWidth = Math.max(oldWidth, newWidth);

    const newData: Block[][] = [];

    for (let y = 0; y < dataHeight; y++) {
      const newRow: Block[] = [];
      const srcRow = oldData[y];

      for (let x = 0; x < dataWidth; x++) {
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
