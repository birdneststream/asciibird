// Mirror position utility for ASCIIBIRD
// Provides helper to compute all positions affected by mirror X/Y editing

export interface Position {
  x: number;
  y: number;
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
