// Shape Drawing Utilities — line, rectangle, and ellipse drawing on block grids.
//
// All functions mutate the passed blocks array in-place and return FillChange[]
// for undo integration, matching the gradientFill.ts pattern.
//
// Shape types: line, rectOutline, rectFilled, ellipseOutline, ellipseFilled.
// Shapes operate in grid-space (character cells) with no aspect ratio correction.

import type { Block } from '../types';
import type { FillChange } from '../ascii';
import { bresenhamLine } from './bresenham';

// ─── Shape Type ──────────────────────────────────────────────────

/** Supported shape drawing types */
export type ShapeType =
  | 'line'
  | 'rectOutline'
  | 'rectFilled'
  | 'ellipseOutline'
  | 'ellipseFilled';

/** All shape types in cycle order */
export const SHAPE_TYPES: ShapeType[] = [
  'line',
  'rectOutline',
  'rectFilled',
  'ellipseOutline',
  'ellipseFilled',
];

/** Human-readable labels for shape types */
export const SHAPE_LABELS: Record<ShapeType, string> = {
  line: 'Line',
  rectOutline: 'Rect Outline',
  rectFilled: 'Rect Filled',
  ellipseOutline: 'Ellipse Outline',
  ellipseFilled: 'Ellipse Filled',
};

/** Material icons for shape types */
export const SHAPE_ICONS: Record<ShapeType, string> = {
  line: 'show_chart',
  rectOutline: 'crop_square',
  rectFilled: 'square',
  ellipseOutline: 'radio_button_unchecked',
  ellipseFilled: 'circle',
};

/** Validate a ShapeType value (e.g., from stale IDB). Returns fallback. */
export function validateShapeType(value: string): ShapeType {
  if (SHAPE_TYPES.includes(value as ShapeType)) {
    return value as ShapeType;
  }
  return 'line';
}

/** Get the next shape type in the cycle. */
export function nextShapeType(current: ShapeType): ShapeType {
  const idx = SHAPE_TYPES.indexOf(current);
  return SHAPE_TYPES[(idx + 1) % SHAPE_TYPES.length];
}

// ─── Shape Options ───────────────────────────────────────────────

export interface ShapeDrawOptions {
  /** The block grid to draw on (mutated in-place) */
  blocks: Block[][];
  /** Start X coordinate (grid cell) */
  startX: number;
  /** Start Y coordinate (grid cell) */
  startY: number;
  /** End X coordinate (grid cell) */
  endX: number;
  /** End Y coordinate (grid cell) */
  endY: number;
  /** Foreground color index (mIRC palette) */
  fg: number;
  /** Background color index (mIRC palette) */
  bg: number;
  /** Character to draw with (defaults to '█' if not specified) */
  char?: string;
}

// ─── Helper ──────────────────────────────────────────────────────

/** Apply a single block change, recording the old state. */
function applyBlock(
  blocks: Block[][],
  changes: FillChange[],
  cx: number,
  cy: number,
  fg: number,
  bg: number,
  char: string,
): void {
  const row = blocks[cy];
  if (!row) return;
  const block = row[cx];
  if (!block) return;

  const oldBlock: Block = { ...block };
  block.fg = fg;
  block.bg = bg;
  block.char = char;
  changes.push({ x: cx, y: cy, old: oldBlock, new: { ...block } });
}

// ─── Line Drawing ────────────────────────────────────────────────

/** Draw a line between two grid points using Bresenham's algorithm. */
export function drawLine(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588'; // █

  const points = bresenhamLine(startX, startY, endX, endY);
  for (const pt of points) {
    // Clamp to grid bounds
    if (pt.y < 0 || pt.y >= blocks.length) continue;
    const row = blocks[pt.y];
    if (!row || pt.x < 0 || pt.x >= row.length) continue;

    applyBlock(blocks, changes, pt.x, pt.y, fg, bg, drawChar);
  }

  return changes;
}

// ─── Rectangle Drawing ───────────────────────────────────────────

/** Draw a rectangle outline from corner to corner. */
export function drawRectOutline(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  // Top and bottom edges
  for (let cx = x1; cx <= x2; cx++) {
    if (y1 >= 0 && y1 < blocks.length) {
      applyBlock(blocks, changes, cx, y1, fg, bg, drawChar);
    }
    if (y2 >= 0 && y2 < blocks.length && y2 !== y1) {
      applyBlock(blocks, changes, cx, y2, fg, bg, drawChar);
    }
  }

  // Left and right edges (excluding corners already drawn)
  for (let cy = y1 + 1; cy < y2; cy++) {
    if (cy >= 0 && cy < blocks.length) {
      applyBlock(blocks, changes, x1, cy, fg, bg, drawChar);
      if (x2 !== x1) {
        applyBlock(blocks, changes, x2, cy, fg, bg, drawChar);
      }
    }
  }

  return changes;
}

/** Draw a filled rectangle from corner to corner. */
export function drawRectFilled(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  for (let cy = y1; cy <= y2; cy++) {
    if (cy < 0 || cy >= blocks.length) continue;
    for (let cx = x1; cx <= x2; cx++) {
      const row = blocks[cy];
      if (!row || cx < 0 || cx >= row.length) continue;
      applyBlock(blocks, changes, cx, cy, fg, bg, drawChar);
    }
  }

  return changes;
}

// ─── Ellipse Drawing (Midpoint Algorithm) ────────────────────────

/**
 * Collect boundary points of an ellipse using the midpoint algorithm.
 * Returns a Set of "x,y" strings for the four symmetric quadrants.
 */
function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): Set<string> {
  const points = new Set<string>();

  // Degenerate: point or line
  if (rx === 0 && ry === 0) {
    points.add(`${cx},${cy}`);
    return points;
  }
  if (rx === 0) {
    for (let y = cy - ry; y <= cy + ry; y++) {
      points.add(`${cx},${y}`);
    }
    return points;
  }
  if (ry === 0) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      points.add(`${x},${cy}`);
    }
    return points;
  }

  // Midpoint ellipse algorithm
  let x = 0;
  let y = ry;
  const rxSq = rx * rx;
  const rySq = ry * ry;
  let px = 0;
  let py = 2 * rxSq * y;

  // Region 1
  let p = rySq - rxSq * ry + 0.25 * rxSq;
  while (px < py) {
    points.add(`${cx + x},${cy + y}`);
    points.add(`${cx - x},${cy + y}`);
    points.add(`${cx + x},${cy - y}`);
    points.add(`${cx - x},${cy - y}`);

    x++;
    px += 2 * rySq;
    if (p < 0) {
      p += rySq + px;
    } else {
      y--;
      py -= 2 * rxSq;
      p += rySq + px - py;
    }
  }

  // Region 2
  p = rySq * (x + 0.5) * (x + 0.5) + rxSq * (y - 1) * (y - 1)
    - rxSq * rySq;
  while (y >= 0) {
    points.add(`${cx + x},${cy + y}`);
    points.add(`${cx - x},${cy + y}`);
    points.add(`${cx + x},${cy - y}`);
    points.add(`${cx - x},${cy - y}`);

    y--;
    py -= 2 * rxSq;
    if (p > 0) {
      p += rxSq - py;
    } else {
      x++;
      px += 2 * rySq;
      p += rxSq - py + px;
    }
  }

  return points;
}

/** Draw an ellipse outline using the midpoint algorithm. */
export function drawEllipseOutline(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  // Center and radii
  const cx = Math.floor((x1 + x2) / 2);
  const cy = Math.floor((y1 + y2) / 2);
  const rx = Math.floor((x2 - x1) / 2);
  const ry = Math.floor((y2 - y1) / 2);

  // Degenerate: single point
  if (rx === 0 && ry === 0) {
    applyBlock(blocks, changes, cx, cy, fg, bg, drawChar);
    return changes;
  }

  const pts = ellipsePoints(cx, cy, rx, ry);

  for (const key of pts) {
    const [px, py] = key.split(',').map(Number);
    if (py < 0 || py >= blocks.length) continue;
    const row = blocks[py];
    if (!row || px < 0 || px >= row.length) continue;
    applyBlock(blocks, changes, px, py, fg, bg, drawChar);
  }

  return changes;
}

/** Draw a filled ellipse using scanline fill inside the ellipse boundary. */
export function drawEllipseFilled(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  // Center and radii
  const cx = Math.floor((x1 + x2) / 2);
  const cy = Math.floor((y1 + y2) / 2);
  const rx = Math.floor((x2 - x1) / 2);
  const ry = Math.floor((y2 - y1) / 2);

  // Degenerate: single point
  if (rx === 0 && ry === 0) {
    applyBlock(blocks, changes, cx, cy, fg, bg, drawChar);
    return changes;
  }

  // For filled ellipse, iterate bounding rectangle and test ellipse equation
  // (x-cx)^2/rx^2 + (y-cy)^2/ry^2 <= 1
  const rxSq = Math.max(rx * rx, 1); // avoid division by zero
  const rySq = Math.max(ry * ry, 1);

  for (let py = y1; py <= y2; py++) {
    if (py < 0 || py >= blocks.length) continue;
    const row = blocks[py];
    if (!row) continue;

    for (let px = x1; px <= x2; px++) {
      if (px < 0 || px >= row.length) continue;

      const dx = px - cx;
      const dy = py - cy;
      const inside = (dx * dx) / rxSq + (dy * dy) / rySq <= 1.0;

      if (inside) {
        applyBlock(blocks, changes, px, py, fg, bg, drawChar);
      }
    }
  }

  return changes;
}

// ─── Dispatch ────────────────────────────────────────────────────

/**
 * Draw a shape on the block grid based on the shape type.
 * Dispatches to the appropriate drawing function.
 */
export function drawShape(
  shapeType: ShapeType,
  opts: ShapeDrawOptions,
): FillChange[] {
  switch (shapeType) {
    case 'line':
      return drawLine(opts);
    case 'rectOutline':
      return drawRectOutline(opts);
    case 'rectFilled':
      return drawRectFilled(opts);
    case 'ellipseOutline':
      return drawEllipseOutline(opts);
    case 'ellipseFilled':
      return drawEllipseFilled(opts);
    default:
      return [];
  }
}
