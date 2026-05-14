// Tests for shape drawing utilities
import { describe, it, expect } from 'vitest';
import {
  drawLine,
  drawRectOutline,
  drawRectFilled,
  drawEllipseOutline,
  drawEllipseFilled,
  drawShape,
  nextShapeType,
  validateShapeType,
  SHAPE_TYPES,
  type ShapeType,
} from '../../../src/utils/shapes';
import type { Block } from '../../../src/types';

/** Create a grid of empty blocks */
function makeGrid(w: number, h: number): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < h; y++) {
    const row: Block[] = [];
    for (let x = 0; x < w; x++) {
      row.push({});
    }
    grid.push(row);
  }
  return grid;
}

/** Count non-empty blocks in grid */
function countFilled(grid: Block[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const block of row) {
      if (block.fg !== undefined || block.bg !== undefined
        || block.char !== undefined) {
        count++;
      }
    }
  }
  return count;
}

/** Get block at position */
function blockAt(grid: Block[][], x: number, y: number): Block {
  return grid[y][x];
}

describe('shapes utilities', () => {
  const baseOpts = {
    fg: 5,
    bg: 10,
    char: 'X',
  };

  // ─── Line Drawing ────────────────────────────────────────────────

  describe('drawLine', () => {
    it('draws a horizontal line', () => {
      const grid = makeGrid(10, 5);
      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: 0, startY: 2, endX: 4, endY: 2,
      });

      expect(changes.length).toBe(5);
      for (let x = 0; x <= 4; x++) {
        expect(blockAt(grid, x, 2)).toEqual({ fg: 5, bg: 10, char: 'X' });
      }
      // Other rows untouched
      expect(blockAt(grid, 0, 0)).toEqual({});
    });

    it('draws a vertical line', () => {
      const grid = makeGrid(5, 10);
      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: 2, startY: 0, endX: 2, endY: 4,
      });

      expect(changes.length).toBe(5);
      for (let y = 0; y <= 4; y++) {
        expect(blockAt(grid, 2, y)).toEqual({ fg: 5, bg: 10, char: 'X' });
      }
    });

    it('draws a diagonal line', () => {
      const grid = makeGrid(10, 10);
      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: 0, startY: 0, endX: 4, endY: 4,
      });

      expect(changes.length).toBe(5);
      for (let i = 0; i <= 4; i++) {
        expect(blockAt(grid, i, i)).toEqual({ fg: 5, bg: 10, char: 'X' });
      }
    });

    it('draws a single point when start === end', () => {
      const grid = makeGrid(5, 5);
      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: 2, startY: 2, endX: 2, endY: 2,
      });

      expect(changes.length).toBe(1);
      expect(blockAt(grid, 2, 2)).toEqual({ fg: 5, bg: 10, char: 'X' });
    });

    it('uses default char █ when char not specified', () => {
      const grid = makeGrid(5, 5);
      drawLine({
        fg: 1, bg: 2, blocks: grid,
        startX: 0, startY: 0, endX: 0, endY: 0,
      });

      expect(blockAt(grid, 0, 0).char).toBe('\u2588');
    });

    it('clips to grid bounds', () => {
      const grid = makeGrid(5, 5);
      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: -2, startY: 2, endX: 3, endY: 2,
      });

      // Only x=0,1,2,3 are in bounds
      expect(changes.length).toBe(4);
    });

    it('returns correct FillChange old values', () => {
      const grid = makeGrid(5, 5);
      // Pre-set a block
      grid[0][0] = { fg: 99, bg: 88, char: 'A' };

      const changes = drawLine({
        ...baseOpts, blocks: grid,
        startX: 0, startY: 0, endX: 0, endY: 0,
      });

      expect(changes[0].old).toEqual({ fg: 99, bg: 88, char: 'A' });
      expect(changes[0].new).toEqual({ fg: 5, bg: 10, char: 'X' });
    });
  });

  // ─── Rectangle Outline ───────────────────────────────────────────

  describe('drawRectOutline', () => {
    it('draws a rectangle outline', () => {
      const grid = makeGrid(10, 10);
      const changes = drawRectOutline({
        ...baseOpts, blocks: grid,
        startX: 1, startY: 1, endX: 4, endY: 3,
      });

      // Perimeter: top(4) + bottom(4) + left(1) + right(1) = 10
      expect(changes.length).toBe(10);

      // Corners
      expect(blockAt(grid, 1, 1)).toEqual({ fg: 5, bg: 10, char: 'X' });
      expect(blockAt(grid, 4, 1)).toEqual({ fg: 5, bg: 10, char: 'X' });
      expect(blockAt(grid, 1, 3)).toEqual({ fg: 5, bg: 10, char: 'X' });
      expect(blockAt(grid, 4, 3)).toEqual({ fg: 5, bg: 10, char: 'X' });

      // Interior not drawn
      expect(blockAt(grid, 2, 2)).toEqual({});
    });

    it('draws a single-row rectangle (horizontal line)', () => {
      const grid = makeGrid(10, 5);
      const changes = drawRectOutline({
        ...baseOpts, blocks: grid,
        startX: 1, startY: 2, endX: 3, endY: 2,
      });

      // Just the top/bottom (same row): 3 blocks
      expect(changes.length).toBe(3);
    });

    it('draws a single-column rectangle (vertical line)', () => {
      const grid = makeGrid(5, 10);
      const changes = drawRectOutline({
        ...baseOpts, blocks: grid,
        startX: 2, startY: 1, endX: 2, endY: 3,
      });

      // Top + bottom (2) + left side excluding corners (1)
      // But x1 === x2, so left === right
      // Top edge: x=2 (1 block)
      // Bottom edge: x=2 (1 block) — skipped because y2 === y1? No, different y
      // Actually: top edge x from 1 to 1 (1), bottom edge (1), left/right are same column
      expect(changes.length).toBe(3);
    });

    it('handles start === end (single point)', () => {
      const grid = makeGrid(5, 5);
      const changes = drawRectOutline({
        ...baseOpts, blocks: grid,
        startX: 2, startY: 2, endX: 2, endY: 2,
      });

      expect(changes.length).toBe(1);
      expect(blockAt(grid, 2, 2)).toEqual({ fg: 5, bg: 10, char: 'X' });
    });
  });

  // ─── Rectangle Filled ────────────────────────────────────────────

  describe('drawRectFilled', () => {
    it('fills a rectangle', () => {
      const grid = makeGrid(10, 10);
      const changes = drawRectFilled({
        ...baseOpts, blocks: grid,
        startX: 1, startY: 1, endX: 3, endY: 3,
      });

      // 3x3 = 9 blocks
      expect(changes.length).toBe(9);

      // All blocks filled including interior
      for (let y = 1; y <= 3; y++) {
        for (let x = 1; x <= 3; x++) {
          expect(blockAt(grid, x, y)).toEqual({ fg: 5, bg: 10, char: 'X' });
        }
      }

      // Outside untouched
      expect(blockAt(grid, 0, 0)).toEqual({});
      expect(blockAt(grid, 4, 4)).toEqual({});
    });

    it('fills a single point', () => {
      const grid = makeGrid(5, 5);
      const changes = drawRectFilled({
        ...baseOpts, blocks: grid,
        startX: 2, startY: 2, endX: 2, endY: 2,
      });

      expect(changes.length).toBe(1);
    });

    it('clips to grid bounds', () => {
      const grid = makeGrid(5, 5);
      const changes = drawRectFilled({
        ...baseOpts, blocks: grid,
        startX: -1, startY: -1, endX: 10, endY: 10,
      });

      // Only 5x5 = 25 blocks in grid
      expect(changes.length).toBe(25);
    });
  });

  // ─── Ellipse Outline ─────────────────────────────────────────────

  describe('drawEllipseOutline', () => {
    it('draws a circle-like ellipse', () => {
      const grid = makeGrid(20, 20);
      const changes = drawEllipseOutline({
        ...baseOpts, blocks: grid,
        startX: 5, startY: 5, endX: 15, endY: 15,
      });

      // Should have drawn some points
      expect(changes.length).toBeGreaterThan(0);

      // All changes should have correct colors
      for (const change of changes) {
        expect(change.new.fg).toBe(5);
        expect(change.new.bg).toBe(10);
        expect(change.new.char).toBe('X');
      }
    });

    it('draws a single point when radius is 0', () => {
      const grid = makeGrid(10, 10);
      const changes = drawEllipseOutline({
        ...baseOpts, blocks: grid,
        startX: 5, startY: 5, endX: 5, endY: 5,
      });

      expect(changes.length).toBe(1);
      expect(blockAt(grid, 5, 5)).toEqual({ fg: 5, bg: 10, char: 'X' });
    });

    it('draws a horizontal line when ry is 0', () => {
      const grid = makeGrid(20, 10);
      const changes = drawEllipseOutline({
        ...baseOpts, blocks: grid,
        startX: 3, startY: 5, endX: 7, endY: 5,
      });

      // Should draw a horizontal line from x=3 to x=7 at y=5
      expect(changes.length).toBeGreaterThan(0);
    });

    it('draws a vertical line when rx is 0', () => {
      const grid = makeGrid(10, 20);
      const changes = drawEllipseOutline({
        ...baseOpts, blocks: grid,
        startX: 5, startY: 3, endX: 5, endY: 7,
      });

      expect(changes.length).toBeGreaterThan(0);
    });
  });

  // ─── Ellipse Filled ──────────────────────────────────────────────

  describe('drawEllipseFilled', () => {
    it('fills an ellipse', () => {
      const grid = makeGrid(20, 20);
      const changes = drawEllipseFilled({
        ...baseOpts, blocks: grid,
        startX: 5, startY: 5, endX: 15, endY: 15,
      });

      expect(changes.length).toBeGreaterThan(0);

      // Center should definitely be filled
      expect(blockAt(grid, 10, 10)).toEqual({ fg: 5, bg: 10, char: 'X' });

      // Outside the bounding box should be untouched
      expect(blockAt(grid, 0, 0)).toEqual({});
      expect(blockAt(grid, 19, 19)).toEqual({});
    });

    it('fills a single point when radius is 0', () => {
      const grid = makeGrid(10, 10);
      const changes = drawEllipseFilled({
        ...baseOpts, blocks: grid,
        startX: 5, startY: 5, endX: 5, endY: 5,
      });

      expect(changes.length).toBe(1);
    });

    it('fills more blocks than outline only', () => {
      const grid1 = makeGrid(20, 20);
      const grid2 = makeGrid(20, 20);

      const outlineChanges = drawEllipseOutline({
        ...baseOpts, blocks: grid1,
        startX: 3, startY: 3, endX: 17, endY: 17,
      });
      const filledChanges = drawEllipseFilled({
        ...baseOpts, blocks: grid2,
        startX: 3, startY: 3, endX: 17, endY: 17,
      });

      expect(filledChanges.length).toBeGreaterThan(outlineChanges.length);
    });
  });

  // ─── Dispatch ─────────────────────────────────────────────────────

  describe('drawShape', () => {
    it('dispatches to correct function based on shape type', () => {
      const types: ShapeType[] = [
        'line', 'rectOutline', 'rectFilled',
        'ellipseOutline', 'ellipseFilled',
      ];

      for (const type of types) {
        const grid = makeGrid(20, 20);
        const changes = drawShape(type, {
          ...baseOpts, blocks: grid,
          startX: 2, startY: 2, endX: 8, endY: 8,
        });

        expect(changes.length).toBeGreaterThan(0);
      }
    });

    it('returns empty array for unknown type', () => {
      const grid = makeGrid(5, 5);
      // Force unknown type via cast
      const changes = drawShape('unknown' as ShapeType, {
        ...baseOpts, blocks: grid,
        startX: 0, startY: 0, endX: 2, endY: 2,
      });

      expect(changes).toEqual([]);
    });
  });

  // ─── Shape Type Helpers ───────────────────────────────────────────

  describe('nextShapeType', () => {
    it('cycles through all shape types', () => {
      let current: ShapeType = 'line';
      const visited: ShapeType[] = [];

      for (let i = 0; i < 5; i++) {
        visited.push(current);
        current = nextShapeType(current);
      }

      expect(visited).toEqual(SHAPE_TYPES);
      // After 5 cycles, wraps back to first
      expect(current).toBe('line');
    });
  });

  describe('validateShapeType', () => {
    it('returns valid types unchanged', () => {
      for (const type of SHAPE_TYPES) {
        expect(validateShapeType(type)).toBe(type);
      }
    });

    it('returns "line" for invalid values', () => {
      expect(validateShapeType('invalid')).toBe('line');
      expect(validateShapeType('')).toBe('line');
      expect(validateShapeType('Line')).toBe('line');
    });
  });
});
