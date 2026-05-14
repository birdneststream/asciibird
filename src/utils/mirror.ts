// Mirror position utility for ASCIIBIRD
// Provides helpers to compute all positions affected by mirror X/Y editing

export interface Position {
  x: number;
  y: number;
}

/** Half-block position with double-Y resolution coordinate */
export interface HalfBlockPosition {
  x: number;
  halfY: number;
}

/**
 * Get all positions that should be affected by a mirror-aware operation.
 *
 * When mirrorX or mirrorY is enabled, an operation at position (x, y) also
 * applies to the mirrored positions. Returns an array of all unique positions.
 *
 * @param x - The original x position (0-indexed block coordinate)
 * @param y - The original y position (0-indexed block coordinate)
 * @param width - Total width of the ASCII canvas in blocks
 * @param height - Total height of the ASCII canvas in blocks
 * @param mirrorX - Whether horizontal mirroring is enabled
 * @param mirrorY - Whether vertical mirroring is enabled
 * @returns Array of positions to apply the operation to
 */
export function getMirrorPositions(
  x: number,
  y: number,
  width: number,
  height: number,
  mirrorX: boolean,
  mirrorY: boolean,
): Position[] {
  const positions: Position[] = [{ x, y }];

  if (mirrorX) {
    const mx = width - x;
    positions.push({ x: mx, y });
  }

  if (mirrorY) {
    const my = height - y;
    positions.push({ x, y: my });
  }

  if (mirrorX && mirrorY) {
    positions.push({ x: width - x, y: height - y });
  }

  // Deduplicate positions (center of even-width/height canvas)
  const seen = new Set<string>();
  return positions.filter(p => {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Apply a callback at all mirrored positions for a given grid coordinate.
 *
 * Unlike `getMirrorPositions`, this:
 * - Skips the original position (the caller handles it directly)
 * - Filters out-of-bounds mirror positions
 * - Early-returns when both mirrors are off (hot path optimization)
 *
 * The callback receives each valid mirror position as grid coordinates.
 * Bounds checking (0 <= mx < width, 0 <= my < height) is handled internally,
 * but the callback should still verify block data exists before mutating.
 *
 * @param x - Original x position (0-indexed grid coordinate)
 * @param y - Original y position (0-indexed grid coordinate)
 * @param width - Grid width in blocks
 * @param height - Grid height in blocks
 * @param mirrorX - Whether horizontal mirroring is enabled
 * @param mirrorY - Whether vertical mirroring is enabled
 * @param callback - Called with each valid mirror position (mx, my)
 */
export function applyMirrored(
  x: number,
  y: number,
  width: number,
  height: number,
  mirrorX: boolean,
  mirrorY: boolean,
  callback: (mx: number, my: number) => void,
): void {
  if (!mirrorX && !mirrorY) return;

  const positions: Position[] = [];

  if (mirrorX) {
    positions.push({ x: width - x, y });
  }
  if (mirrorY) {
    positions.push({ x, y: height - y });
  }
  if (mirrorX && mirrorY) {
    positions.push({ x: width - x, y: height - y });
  }

  const seen = new Set<string>();
  // Seed with original position to skip mirrors that coincide with it
  // (e.g., center of even-width/height canvas)
  seen.add(`${x},${y}`);
  for (const pos of positions) {
    // Bounds check: skip positions outside the grid
    if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) {
      continue;
    }
    // Dedup: center of even-width/height canvas
    const key = `${pos.x},${pos.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    callback(pos.x, pos.y);
  }
}

/**
 * Apply a callback at all mirrored positions for half-block coordinates.
 *
 * Works like `applyMirrored` but operates at double-Y resolution.
 * Mirror X reflects horizontally (same as full-block).
 * Mirror Y reflects vertically at half-block granularity:
 *   mirroredHalfY = (height * 2) - halfY - 1
 *
 * @param x - Original x position (0-indexed block coordinate)
 * @param halfY - Original half-Y position (0-indexed, double resolution)
 * @param width - Grid width in blocks
 * @param height - Grid height in blocks (full-block, NOT doubled)
 * @param mirrorX - Whether horizontal mirroring is enabled
 * @param mirrorY - Whether vertical mirroring is enabled
 * @param callback - Called with (mx, mHalfY, mBlockY) for each mirror
 */
export function applyMirroredHalfBlock(
  x: number,
  halfY: number,
  width: number,
  height: number,
  mirrorX: boolean,
  mirrorY: boolean,
  callback: (mx: number, mHalfY: number, mBlockY: number) => void,
): void {
  if (!mirrorX && !mirrorY) return;

  const halfHeight = height * 2;
  const positions: HalfBlockPosition[] = [];

  if (mirrorX) {
    positions.push({ x: width - x, halfY });
  }
  if (mirrorY) {
    positions.push({ x, halfY: halfHeight - halfY - 1 });
  }
  if (mirrorX && mirrorY) {
    positions.push({
      x: width - x,
      halfY: halfHeight - halfY - 1,
    });
  }

  const seen = new Set<string>();
  seen.add(`${x},${halfY}`);
  for (const pos of positions) {
    // Bounds check: x in [0, width), halfY in [0, halfHeight)
    if (pos.x < 0 || pos.x >= width || pos.halfY < 0 || pos.halfY >= halfHeight) {
      continue;
    }
    const key = `${pos.x},${pos.halfY}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const blockY = Math.floor(pos.halfY / 2);
    callback(pos.x, pos.halfY, blockY);
  }
}
