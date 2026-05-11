/**
 * Bresenham's line algorithm — generates grid points between two coordinates.
 *
 * Used for brush/eraser interpolation so fast mouse movement doesn't skip cells.
 * Returns ALL points on the line from (x0,y0) to (x1,y1) inclusive.
 */
export function bresenhamLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    points.push({ x: cx, y: cy });

    if (cx === x1 && cy === y1) break;

    const e2 = 2 * err;

    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }

    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }

  return points;
}
