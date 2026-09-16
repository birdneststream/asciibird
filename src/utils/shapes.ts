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
  const valid = SHAPE_TYPES.find(t => t === value);
  return valid ?? 'line';
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

// ─── Shape Cell Enumeration ──────────────────────────────────────
//
// Pure geometry — the single source of truth for which cells a shape
// paints. The draw functions (here and in halfBlockShapes.ts) consume
// these enumerators, and the ghost preview (shapePreview.ts) renders
// them, so the preview can never drift from the committed result.
//
// Y units are caller-defined: full-block mode passes cells, half-block
// mode passes half-rows (double-Y). Traversal order is load-bearing —
// it defines FillChange order for undo — and mirrors the original
// per-shape draw loops exactly.

/** A single cell a shape will paint (y is a cell or half-row index) */
export interface ShapeCell {
  x: number;
  y: number;
}

/** Enumerate the cells a line paints, in Bresenham order. */
export function lineCells(
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  return bresenhamLine(startX, startY, endX, endY);
}

/** Enumerate rectangle outline cells: top/bottom edges interleaved per
 * column, then left/right edges interleaved per interior row. */
export function rectOutlineCells(
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  const cells: ShapeCell[] = [];
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  for (let cx = x1; cx <= x2; cx++) {
    cells.push({ x: cx, y: y1 });
    if (y2 !== y1) {
      cells.push({ x: cx, y: y2 });
    }
  }

  for (let cy = y1 + 1; cy < y2; cy++) {
    cells.push({ x: x1, y: cy });
    if (x2 !== x1) {
      cells.push({ x: x2, y: cy });
    }
  }

  return cells;
}

/** Enumerate filled rectangle cells in row-major order. */
export function rectFilledCells(
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  const cells: ShapeCell[] = [];
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  for (let cy = y1; cy <= y2; cy++) {
    for (let cx = x1; cx <= x2; cx++) {
      cells.push({ x: cx, y: cy });
    }
  }

  return cells;
}

/** Enumerate ellipse outline cells from the midpoint point set. */
export function ellipseOutlineCells(
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  const cx = Math.floor((x1 + x2) / 2);
  const cy = Math.floor((y1 + y2) / 2);
  const rx = Math.floor((x2 - x1) / 2);
  const ry = Math.floor((y2 - y1) / 2);

  const pts = ellipsePoints(cx, cy, rx, ry);
  const cells: ShapeCell[] = [];
  for (const key of pts) {
    const [px, py] = key.split(',').map(Number);
    cells.push({ x: px, y: py });
  }
  return cells;
}

/** Enumerate filled ellipse cells: bounding rect + equation test. */
export function ellipseFilledCells(
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  const cx = Math.floor((x1 + x2) / 2);
  const cy = Math.floor((y1 + y2) / 2);
  const rx = Math.floor((x2 - x1) / 2);
  const ry = Math.floor((y2 - y1) / 2);

  // Degenerate: single point
  if (rx === 0 && ry === 0) {
    return [{ x: cx, y: cy }];
  }

  const rxSq = Math.max(rx * rx, 1); // avoid division by zero
  const rySq = Math.max(ry * ry, 1);

  const cells: ShapeCell[] = [];
  for (let py = y1; py <= y2; py++) {
    for (let px = x1; px <= x2; px++) {
      const dx = px - cx;
      const dy = py - cy;
      if ((dx * dx) / rxSq + (dy * dy) / rySq <= 1.0) {
        cells.push({ x: px, y: py });
      }
    }
  }
  return cells;
}

/**
 * Enumerate the cells a shape paints, in draw order.
 * Dispatches to the per-type enumerator; Y units follow the caller
 * (cells or half-rows).
 */
export function shapeCells(
  shapeType: ShapeType,
  startX: number, startY: number, endX: number, endY: number,
): ShapeCell[] {
  switch (shapeType) {
    case 'line':
      return lineCells(startX, startY, endX, endY);
    case 'rectOutline':
      return rectOutlineCells(startX, startY, endX, endY);
    case 'rectFilled':
      return rectFilledCells(startX, startY, endX, endY);
    case 'ellipseOutline':
      return ellipseOutlineCells(startX, startY, endX, endY);
    case 'ellipseFilled':
      return ellipseFilledCells(startX, startY, endX, endY);
    default:
      return [];
  }
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

  for (const cell of lineCells(startX, startY, endX, endY)) {
    applyBlock(blocks, changes, cell.x, cell.y, fg, bg, drawChar);
  }

  return changes;
}

// ─── Rectangle Drawing ───────────────────────────────────────────

/** Draw a rectangle outline from corner to corner. */
export function drawRectOutline(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  for (const cell of rectOutlineCells(startX, startY, endX, endY)) {
    applyBlock(blocks, changes, cell.x, cell.y, fg, bg, drawChar);
  }

  return changes;
}

/** Draw a filled rectangle from corner to corner. */
export function drawRectFilled(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  for (const cell of rectFilledCells(startX, startY, endX, endY)) {
    applyBlock(blocks, changes, cell.x, cell.y, fg, bg, drawChar);
  }

  return changes;
}

// ─── Ellipse Drawing (Midpoint Algorithm) ────────────────────────

/**
 * Collect boundary points of an ellipse using the midpoint algorithm.
 * Returns a Set of "x,y" strings for the four symmetric quadrants.
 * Shared with halfBlockShapes.ts for half-resolution ellipses.
 */
export function ellipsePoints(
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

  for (const cell of ellipseOutlineCells(startX, startY, endX, endY)) {
    applyBlock(blocks, changes, cell.x, cell.y, fg, bg, drawChar);
  }

  return changes;
}

/** Draw a filled ellipse using scanline fill inside the ellipse boundary. */
export function drawEllipseFilled(opts: ShapeDrawOptions): FillChange[] {
  const { blocks, startX, startY, endX, endY, fg, bg, char } = opts;
  const changes: FillChange[] = [];
  const drawChar = char || '\u2588';

  for (const cell of ellipseFilledCells(startX, startY, endX, endY)) {
    applyBlock(blocks, changes, cell.x, cell.y, fg, bg, drawChar);
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
