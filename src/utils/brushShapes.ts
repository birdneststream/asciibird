// Brush shape registry — generates Block[][] arrays for each brush type.
//
// Each shape is a generator function that takes (width, height, block) and
// returns a 2D Block array. Most shapes use `createFromPredicate()` with a
// simple (col, row, w, h) => boolean function. Complex shapes (Circle) use
// custom algorithms.
//
// Keys match the persisted `brushSizeType` in the toolbar store (lowercase,
// spaces). Existing keys MUST NOT be renamed to preserve IndexedDB compat.

import type { Block } from '../types';
import { emptyBlock } from '../ascii';

/** Per-cell predicate: returns true if the cell should be filled. */
export type BrushShapePredicate = (
  col: number,
  row: number,
  width: number,
  height: number,
) => boolean;

/** Full generator: produces a complete Block[][] for a shape. */
export type BrushShapeGenerator = (
  width: number,
  height: number,
  block: Block,
) => Block[][];

/** Registry entry for a brush shape. */
export interface BrushShapeDef {
  /** Unique key (lowercase, spaces) — must match toolbar store values */
  key: string;
  /** Display label for the dropdown */
  label: string;
  /** Generator function */
  generate: BrushShapeGenerator;
}

// ─── Helper: create generator from a per-cell predicate ─────────

function createFromPredicate(
  predicate: BrushShapePredicate,
): BrushShapeGenerator {
  return (width, height, block) => {
    const result: Block[][] = [];
    for (let row = 0; row < height; row++) {
      result[row] = [];
      for (let col = 0; col < width; col++) {
        result[row][col] = predicate(col, row, width, height)
          ? { ...block }
          : { ...emptyBlock };
      }
    }
    return result;
  };
}

// ─── Shape predicates ───────────────────────────────────────────

function squarePred(
  _col: number, _row: number,
  _w: number, _h: number,
): boolean {
  return true;
}

function crossPred(
  col: number, row: number,
  _w: number, _h: number,
): boolean {
  // Diagonal checkerboard: filled where col%2 === row%2
  return col % 2 === row % 2;
}

function invertedGridPred(
  col: number, row: number,
  _w: number, _h: number,
): boolean {
  return row % 2 === 0 || col % 2 === 0;
}

function diamondPred(
  col: number, row: number,
  w: number, h: number,
): boolean {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const dx = Math.abs(col - cx);
  const dy = Math.abs(row - cy);
  // Manhattan distance from center ≤ half the smaller dimension
  const maxDist = (Math.min(w, h) - 1) / 2;
  return dx + dy <= maxDist;
}

function ringPred(
  col: number, row: number,
  w: number, h: number,
): boolean {
  if (w <= 2 || h <= 2) return true; // Too small for hollow
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const dx = (col - cx) / (w / 2);
  const dy = (row - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist >= 0.55 && dist <= 1.05;
}

function starPred(
  col: number, row: number,
  w: number, h: number,
): boolean {
  if (w <= 2 || h <= 2) return true;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const dx = col - cx;
  const dy = row - cy;
  // Convert to polar coordinates
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const outerR = Math.min(w, h) / 2;
  const innerR = outerR * 0.4;
  // 5-pointed star: radius oscillates between inner and outer
  const pointAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
  const sector = pointAngle / (Math.PI * 2 / 5);
  const sectorFrac = sector - Math.floor(sector);
  const r = sectorFrac < 0.5
    ? innerR + (outerR - innerR) * (1 - sectorFrac * 2)
    : innerR + (outerR - innerR) * ((sectorFrac - 0.5) * 2);
  return dist <= r;
}

function framePred(
  col: number, row: number,
  w: number, _h: number,
): boolean {
  return col === 0 || row === 0 || col === w - 1 || row === _h - 1;
}

function triangleUpPred(
  col: number, row: number,
  w: number, h: number,
): boolean {
  if (h <= 1) return true;
  const cx = (w - 1) / 2;
  const halfBase = (row / (h - 1)) * (w / 2);
  return Math.abs(col - cx) <= halfBase;
}

function triangleDownPred(
  col: number, row: number,
  w: number, h: number,
): boolean {
  if (h <= 1) return true;
  const cx = (w - 1) / 2;
  const progress = 1 - row / (h - 1);
  const halfBase = progress * (w / 2);
  return Math.abs(col - cx) <= halfBase;
}

function diagonalFwdGen(
  w: number, h: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  const centerVal = (w - 1) + 0; // col + row = w-1 is the main "/" diagonal
  const tolerance = Math.max(0, (Math.min(w, h) - 1) / 2);
  for (let row = 0; row < h; row++) {
    result[row] = [];
    for (let col = 0; col < w; col++) {
      const dist = Math.abs((col + row) - centerVal);
      result[row][col] = dist <= tolerance ? { ...block } : { ...emptyBlock };
    }
  }
  return result;
}

function diagonalBwdGen(
  w: number, h: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  // "\" diagonal: col - row = 0 is the main diagonal
  const tolerance = Math.max(0, (Math.min(w, h) - 1) / 2);
  for (let row = 0; row < h; row++) {
    result[row] = [];
    for (let col = 0; col < w; col++) {
      const dist = Math.abs((col - row));
      result[row][col] = dist <= tolerance ? { ...block } : { ...emptyBlock };
    }
  }
  return result;
}

function xPatternGen(
  w: number, h: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  const fwdCenter = (w - 1) + 0; // "/" center
  const tolerance = Math.max(0, (Math.min(w, h) - 1) / 2);
  for (let row = 0; row < h; row++) {
    result[row] = [];
    for (let col = 0; col < w; col++) {
      const fwdDist = Math.abs((col + row) - fwdCenter);
      const bwdDist = Math.abs(col - row);
      result[row][col] = (fwdDist <= tolerance || bwdDist <= tolerance)
        ? { ...block }
        : { ...emptyBlock };
    }
  }
  return result;
}

function checkerboardPred(
  col: number, row: number,
  _w: number, _h: number,
): boolean {
  return (col + row) % 2 === 0;
}

function sparsePred(
  _col: number, row: number,
  _w: number, _h: number,
): boolean {
  return row % 2 === 0;
}

// ─── Complex shape generators (preserve exact existing behavior) ──

/**
 * Circle — uses Euclidean distance from center.
 * Cleaner than the original parametric outline + flood fill approach,
 * produces more mathematically correct filled circles.
 */
function circleGen(
  width: number, height: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  if (width === 0 || height === 0) return result;

  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const rx = width / 2;
  const ry = height / 2;

  for (let row = 0; row < height; row++) {
    result[row] = [];
    for (let col = 0; col < width; col++) {
      // Normalized distance from center (ellipse equation)
      const dx = (col - cx) / rx;
      const dy = (row - cy) / ry;
      const dist = dx * dx + dy * dy;
      result[row][col] = dist <= 1.0 ? { ...block } : { ...emptyBlock };
    }
  }
  return result;
}

/**
 * Grid — preserves exact existing behavior from BrushPreview.vue.
 * Even rows: checkerboard pattern. Odd rows: inverted.
 */
function gridGen(
  width: number, height: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  for (let row = 0; row < height; row++) {
    result[row] = [];
    for (let col = 0; col < width; col++) {
      // First cell always filled
      if (col === 0 && row === 0) {
        result[row][col] = { ...block };
        continue;
      }
      // Even rows: fill at even cols. Odd rows: fill at odd cols.
      if (row % 2 === 0) {
        result[row][col] = col % 2 === 0 ? { ...block } : { ...emptyBlock };
      } else {
        result[row][col] = col % 2 !== 0 ? { ...block } : { ...emptyBlock };
      }
    }
  }
  return result;
}

/**
 * H Lines — horizontal stripe pattern.
 * Even rows: filled. Odd rows: empty.
 */
function hLinesGen(
  width: number, height: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  for (let row = 0; row < height; row++) {
    result[row] = [];
    for (let col = 0; col < width; col++) {
      result[row][col] = row % 2 === 0 ? { ...block } : { ...emptyBlock };
    }
  }
  return result;
}

/**
 * V Lines — vertical stripe pattern.
 * Even cols: filled. Odd cols: empty.
 */
function vLinesGen(
  width: number, height: number, block: Block,
): Block[][] {
  const result: Block[][] = [];
  for (let row = 0; row < height; row++) {
    result[row] = [];
    for (let col = 0; col < width; col++) {
      result[row][col] = col % 2 === 0 ? { ...block } : { ...emptyBlock };
    }
  }
  return result;
}

// ─── Registry ───────────────────────────────────────────────────

export const brushShapeRegistry: BrushShapeDef[] = [
  // Existing shapes (order must be preserved for dropdown)
  { key: 'square', label: 'Square', generate: createFromPredicate(squarePred) },
  { key: 'circle', label: 'Circle', generate: circleGen },
  { key: 'cross', label: 'Cross', generate: createFromPredicate(crossPred) },
  { key: 'grid', label: 'Grid', generate: gridGen },
  { key: 'inverted grid', label: 'Inverted Grid', generate: createFromPredicate(invertedGridPred) },
  { key: 'h lines', label: 'H Lines', generate: hLinesGen },
  { key: 'v lines', label: 'V Lines', generate: vLinesGen },
  // New shapes
  { key: 'diamond', label: 'Diamond', generate: createFromPredicate(diamondPred) },
  { key: 'ring', label: 'Ring', generate: createFromPredicate(ringPred) },
  { key: 'star', label: 'Star', generate: createFromPredicate(starPred) },
  { key: 'frame', label: 'Frame', generate: createFromPredicate(framePred) },
  { key: 'triangle up', label: 'Triangle Up', generate: createFromPredicate(triangleUpPred) },
  { key: 'triangle down', label: 'Triangle Down', generate: createFromPredicate(triangleDownPred) },
  { key: 'diagonal fwd', label: 'Diagonal /', generate: diagonalFwdGen },
  { key: 'diagonal bwd', label: 'Diagonal \\', generate: diagonalBwdGen },
  { key: 'x pattern', label: 'X Pattern', generate: xPatternGen },
  { key: 'checkerboard', label: 'Checkerboard', generate: createFromPredicate(checkerboardPred) },
  { key: 'sparse', label: 'Sparse', generate: createFromPredicate(sparsePred) },
];

/** Lookup map by key */
export const brushShapeMap = new Map<string, BrushShapeGenerator>(
  brushShapeRegistry.map(s => [s.key, s.generate]),
);

/** Get display labels in order (for the dropdown) */
export function getBrushShapeLabels(): string[] {
  return brushShapeRegistry.map(s => s.label);
}

/** Get keys in order */
export function getBrushShapeKeys(): string[] {
  return brushShapeRegistry.map(s => s.key);
}

/** All valid shape keys (for validation) */
export const validBrushShapeKeys = new Set(getBrushShapeKeys());

/**
 * Validate a brush shape key. Returns the key if valid, 'square' otherwise.
 */
export function validateBrushShapeKey(key: string): string {
  return validBrushShapeKeys.has(key) ? key : 'square';
}

/**
 * Generate a brush Block[][] array for the given shape.
 * Falls back to Square if the shape key is unknown.
 */
export function createBrushBlocks(
  shapeKey: string,
  width: number,
  height: number,
  block: Block,
): Block[][] {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const generator = brushShapeMap.get(shapeKey) ?? brushShapeMap.get('square')!;
  return generator(w, h, block);
}
