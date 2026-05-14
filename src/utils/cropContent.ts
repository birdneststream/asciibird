/**
 * Crop to Content Utility — trims empty borders from all canvas edges.
 *
 * Scans all layers for non-empty content and computes the bounding
 * rectangle. All layers are then uniformly trimmed to that rectangle,
 * preserving relative positions of content across layers.
 *
 * A block is considered "empty" when it has no foreground, no
 * background, and no meaningful character (space or undefined).
 */

import type { Block, Layer } from '../types';

/** Check if a block has no meaningful content */
function isEmptyBlock(block: Block | undefined): boolean {
  if (!block) return true;
  const hasFg = block.fg !== undefined && block.fg !== null;
  const hasBg = block.bg !== undefined && block.bg !== null;
  const hasChar = block.char !== undefined
    && block.char !== null
    && block.char !== ' '
    && block.char !== '';
  return !hasFg && !hasBg && !hasChar;
}

/** Bounding rectangle of non-empty content */
interface ContentBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Find the bounding rectangle of all non-empty content across all
 * layers. Returns null if the canvas is completely empty.
 */
export function findContentBounds(layers: Layer[]): ContentBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;

  for (const layer of layers) {
    for (let y = 0; y < layer.data.length; y++) {
      const row = layer.data[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) {
        if (!isEmptyBlock(row[x])) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  if (maxX < 0 || maxY < 0) {
    return null; // completely empty
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Crop all layers to the given content bounds.
 * Returns new layers with trimmed data and updated dimensions.
 * Preserves relative positions of content across layers.
 */
export function cropLayersToBounds(
  layers: Layer[],
  bounds: ContentBounds,
): Layer[] {
  const { minX, minY, maxX, maxY } = bounds;
  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;

  return layers.map(layer => {
    const newData: Block[][] = [];

    for (let y = minY; y <= maxY; y++) {
      const newRow: Block[] = [];
      const srcRow = layer.data[y];
      for (let x = minX; x <= maxX; x++) {
        newRow.push(srcRow?.[x] ? { ...srcRow[x] } : {});
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

/**
 * Crop all layers to their content bounds.
 * Returns the original layers array if there's nothing to crop
 * (empty canvas or content already at edges).
 *
 * @returns Cropped layers, or original if no crop needed
 */
export function cropToContent(layers: Layer[]): {
  layers: Layer[];
  cropped: boolean;
  bounds: ContentBounds | null;
} {
  const bounds = findContentBounds(layers);

  if (!bounds) {
    // Completely empty — nothing to crop
    return { layers, cropped: false, bounds: null };
  }

  // Check if content already fills edges (no crop needed)
  const currentWidth = layers[0]?.width ?? 0;
  const currentHeight = layers[0]?.height ?? 0;
  if (
    bounds.minX === 0
    && bounds.minY === 0
    && bounds.maxX === currentWidth - 1
    && bounds.maxY === currentHeight - 1
  ) {
    return { layers, cropped: false, bounds };
  }

  const croppedLayers = cropLayersToBounds(layers, bounds);
  return { layers: croppedLayers, cropped: true, bounds };
}
