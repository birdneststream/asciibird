// Half-Block Shape Drawing — line, rectangle, and ellipse drawing on the
// double-Y-resolution half-block grid.
//
// All functions mutate the passed blocks array in-place through
// HalfBlockGrid.setColourPreserve (single-colour paint model) and return
// FillChange[] at full-block granularity for undo integration, matching
// the shapes.ts pattern. Y coordinates are half-block rows (double
// resolution): even = top half, odd = bottom half.
//
// Geometry comes from the shared shapeCells() enumerators in shapes.ts
// (Y = half-rows here) — the same single source of truth the full-block
// draw path and the ghost preview consume, so preview and commit can
// never drift.
//
// Shapes paint colours, not characters — the stroke colour fills only
// the visited halves. Sibling halves keep their existing colour or stay
// transparent; blocks collapse to solid spaces when both halves end up
// the same colour. Like full-block shapes, half-block shapes do not
// apply mirroring.

import type { Block } from '../types';
import type { FillChange } from '../ascii';
import type { ShapeType } from './shapes';
import { shapeCells } from './shapes';
import { HalfBlockGrid } from './halfBlockGrid';

// ─── Options ─────────────────────────────────────────────────────

export interface HalfBlockShapeOptions {
  /** The block grid to draw on (mutated in-place) */
  blocks: Block[][];
  /** Start X coordinate (block column) */
  startX: number;
  /** Start Y coordinate at half-block resolution */
  startHalfY: number;
  /** End X coordinate (block column) */
  endX: number;
  /** End Y coordinate at half-block resolution */
  endHalfY: number;
  /** Stroke colour (mIRC palette index 0-98) */
  colour: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Accumulates per-block undo changes. The first touch of a block
 * snapshots its old state; the final state is captured after drawing
 * (the same final-state pattern as iterativeFillHalfBlock).
 */
class ShapeChangeTracker {
  private readonly grid: HalfBlockGrid;
  private readonly cellOld = new Map<string, { x: number; y: number; old: Block }>();

  constructor(private readonly blocks: Block[][]) {
    this.grid = new HalfBlockGrid(blocks);
  }

  /** Paint a half-block if it is within bounds. */
  paint(x: number, halfY: number, colour: number): void {
    // grid.width derives from the first row — on ragged grids valid cells
    // in longer rows are conservatively rejected (layers are normalised)
    if (x < 0 || x >= this.grid.width || halfY < 0 || halfY >= this.grid.height) {
      return;
    }
    const blockY = Math.floor(halfY / 2);
    const row = this.blocks[blockY];
    if (!row || row[x] === undefined) return; // ragged array guard

    const key = `${x},${blockY}`;
    if (!this.cellOld.has(key)) {
      this.cellOld.set(key, { x, y: blockY, old: { ...row[x] } });
    }

    this.grid.setColourPreserve(x, halfY, colour);
  }

  /** Build the FillChange list, skipping no-op changes. */
  build(): FillChange[] {
    const changes: FillChange[] = [];
    for (const [, entry] of this.cellOld) {
      const finalBlock = this.blocks[entry.y]?.[entry.x];
      if (!finalBlock) continue;
      if (
        entry.old.bg === finalBlock.bg
        && entry.old.fg === finalBlock.fg
        && entry.old.char === finalBlock.char
      ) {
        continue; // visually unchanged
      }
      changes.push({
        x: entry.x,
        y: entry.y,
        old: entry.old,
        new: { ...finalBlock },
      });
    }
    return changes;
  }
}

// ─── Shape Drawing ───────────────────────────────────────────────
//
// All half-block draw functions enumerate cells through the shared
// shapeCells() geometry (Y = half-rows) and paint via the tracker —
// identical traversal order to the full-block draw path, so undo
// diffs and previews stay in lockstep.

/** Paint the enumerated cells with the single stroke colour. */
function paintCells(
  tracker: ShapeChangeTracker,
  shapeType: ShapeType,
  startX: number, startHalfY: number,
  endX: number, endHalfY: number,
  colour: number,
): void {
  for (const cell of shapeCells(
    shapeType, startX, startHalfY, endX, endHalfY,
  )) {
    tracker.paint(cell.x, cell.y, colour);
  }
}

// ─── Line Drawing ────────────────────────────────────────────────

/** Draw a line between two half-grid points using Bresenham's algorithm. */
export function drawHalfBlockLine(opts: HalfBlockShapeOptions): FillChange[] {
  const { blocks, startX, startHalfY, endX, endHalfY, colour } = opts;
  const tracker = new ShapeChangeTracker(blocks);
  paintCells(tracker, 'line', startX, startHalfY, endX, endHalfY, colour);
  return tracker.build();
}

// ─── Rectangle Drawing ───────────────────────────────────────────

/** Draw a rectangle outline from corner to corner in half coordinates. */
export function drawHalfBlockRectOutline(
  opts: HalfBlockShapeOptions,
): FillChange[] {
  const { blocks, startX, startHalfY, endX, endHalfY, colour } = opts;
  const tracker = new ShapeChangeTracker(blocks);
  paintCells(tracker, 'rectOutline', startX, startHalfY, endX, endHalfY, colour);
  return tracker.build();
}

/** Draw a filled rectangle from corner to corner in half coordinates. */
export function drawHalfBlockRectFilled(
  opts: HalfBlockShapeOptions,
): FillChange[] {
  const { blocks, startX, startHalfY, endX, endHalfY, colour } = opts;
  const tracker = new ShapeChangeTracker(blocks);
  paintCells(tracker, 'rectFilled', startX, startHalfY, endX, endHalfY, colour);
  return tracker.build();
}

// ─── Ellipse Drawing ─────────────────────────────────────────────

/** Draw an ellipse outline using the midpoint algorithm on the half grid. */
export function drawHalfBlockEllipseOutline(
  opts: HalfBlockShapeOptions,
): FillChange[] {
  const { blocks, startX, startHalfY, endX, endHalfY, colour } = opts;
  const tracker = new ShapeChangeTracker(blocks);
  paintCells(tracker, 'ellipseOutline', startX, startHalfY, endX, endHalfY, colour);
  return tracker.build();
}

/** Draw a filled ellipse (ellipse-equation test) on the half grid. */
export function drawHalfBlockEllipseFilled(
  opts: HalfBlockShapeOptions,
): FillChange[] {
  const { blocks, startX, startHalfY, endX, endHalfY, colour } = opts;
  const tracker = new ShapeChangeTracker(blocks);
  paintCells(tracker, 'ellipseFilled', startX, startHalfY, endX, endHalfY, colour);
  return tracker.build();
}

// ─── Dispatch ────────────────────────────────────────────────────

/**
 * Draw a shape on the half-block grid based on the shape type.
 * Dispatches to the appropriate half-block drawing function.
 */
export function drawShapeHalfBlock(
  shapeType: ShapeType,
  opts: HalfBlockShapeOptions,
): FillChange[] {
  switch (shapeType) {
    case 'line':
      return drawHalfBlockLine(opts);
    case 'rectOutline':
      return drawHalfBlockRectOutline(opts);
    case 'rectFilled':
      return drawHalfBlockRectFilled(opts);
    case 'ellipseOutline':
      return drawHalfBlockEllipseOutline(opts);
    case 'ellipseFilled':
      return drawHalfBlockEllipseFilled(opts);
    default:
      return [];
  }
}
