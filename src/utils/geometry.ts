// Geometry utilities for grid-based positioning and sizing

/**
 * Snap a pixel value to the nearest grid line.
 * Returns 0 when gridSize is 0 to avoid division by zero.
 */
export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value;
  // Round half-up (toward +Infinity) so 7→8 not 7→0, then avoid -0
  const result = Math.round(value / gridSize) * gridSize;
  return result === 0 ? 0 : result;
}

/**
 * Snap a pixel dimension to a grid size, enforcing a minimum of one grid unit.
 */
export function snapDimensionToGrid(
  value: number,
  gridSize: number,
  minUnits: number = 1,
): number {
  if (gridSize <= 0) return value;
  const snapped = Math.round(value / gridSize) * gridSize;
  return Math.max(gridSize * minUnits, snapped);
}

/** Positions for resize handles (all 8 directions) */
export type ResizeHandlePosition =
  | 'tl' | 'tm' | 'tr'
  | 'ml' | 'mr'
  | 'bl' | 'bm' | 'br';
