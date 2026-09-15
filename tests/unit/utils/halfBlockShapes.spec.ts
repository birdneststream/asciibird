import { describe, it, expect } from 'vitest';
import {
  drawShapeHalfBlock,
  drawHalfBlockLine,
  drawHalfBlockRectOutline,
  drawHalfBlockRectFilled,
  drawHalfBlockEllipseOutline,
  drawHalfBlockEllipseFilled,
} from '../../../src/utils/halfBlockShapes';
import type { HalfBlockShapeOptions } from '../../../src/utils/halfBlockShapes';
import { HalfBlockGrid } from '../../../src/utils/halfBlockGrid';
import type { Block } from '../../../src/types';
import type { ShapeType } from '../../../src/utils/shapes';

/** Create a grid of empty blocks */
function makeGrid(width: number, height: number): Block[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: ' ' })),
  );
}

const baseOpts = (
  blocks: Block[][],
  extra: Partial<HalfBlockShapeOptions> = {},
): HalfBlockShapeOptions => ({
  blocks,
  startX: 1,
  startHalfY: 2,
  endX: 4,
  endHalfY: 6,
  colour: 5,
  ...extra,
});

describe('halfBlockShapes', () => {
  describe('line', () => {
    it('draws a horizontal line along half rows, siblings untouched', () => {
      const blocks = makeGrid(6, 4);
      const changes = drawHalfBlockLine(baseOpts(blocks, { startHalfY: 2, endHalfY: 2, endX: 3 }));
      // blocks (1..3, 1) top halves painted fg=5; empty siblings stay
      // empty — single-half representation, no complement fill
      expect(blocks[1][1]).toEqual({ fg: 5, char: '▀' });
      expect(blocks[1][2]).toEqual({ fg: 5, char: '▀' });
      expect(blocks[1][3]).toEqual({ fg: 5, char: '▀' });
      expect(changes.length).toBe(3);
    });

    it('draws a vertical line through both halves of rows', () => {
      const blocks = makeGrid(6, 6);
      drawHalfBlockLine(baseOpts(blocks, { startX: 2, endX: 2, startHalfY: 1, endHalfY: 5 }));
      const grid = new HalfBlockGrid(blocks);
      for (let h = 1; h <= 5; h++) {
        expect(grid.getColour(2, h)).toBe(5);
      }
      // block (2,0) has only the bottom half painted; the empty top
      // half stays empty — ▄ representation, no complement
      expect(blocks[0][2]).toEqual({ fg: 5, char: '▄' });
    });

    it('returns no changes for a fully out-of-bounds line', () => {
      const blocks = makeGrid(4, 2);
      const changes = drawHalfBlockLine(
        baseOpts(blocks, { startX: -5, startHalfY: -3, endX: -1, endHalfY: -1 }),
      );
      expect(changes).toHaveLength(0);
      expect(blocks[0][0]).toEqual({ char: ' ' }); // nothing painted
    });

    it('draws only the in-bounds segment of a partially out-of-bounds line', () => {
      const blocks = makeGrid(4, 2);
      // Horizontal line entering from x=-2 through x=1 at half row 0
      const changes = drawHalfBlockLine(
        baseOpts(blocks, { startX: -2, startHalfY: 0, endX: 1, endHalfY: 0 }),
      );
      expect(changes).toHaveLength(2); // blocks (0,0) and (1,0)
      expect(blocks[0][0]).toEqual({ fg: 5, char: '▀' });
      expect(blocks[0][1]).toEqual({ fg: 5, char: '▀' });
      expect(blocks[0][2]).toEqual({ char: ' ' }); // past the end
    });

    it('skips no-op changes (same colour repaint)', () => {
      const blocks = makeGrid(4, 2);
      drawHalfBlockLine(baseOpts(blocks, { startHalfY: 2, endHalfY: 2, endX: 2 }));
      const changes = drawHalfBlockLine(baseOpts(blocks, { startHalfY: 2, endHalfY: 2, endX: 2 }));
      expect(changes).toHaveLength(0);
    });

    it('preserves collapsed-space siblings when painting through solids', () => {
      // A solid region stored as collapsed spaces {bg:7, char:' '}
      const blocks = makeGrid(6, 2);
      blocks[1][1] = { bg: 7, char: ' ' };
      blocks[1][2] = { bg: 7, char: ' ' };
      drawHalfBlockLine(baseOpts(blocks, { startHalfY: 2, endHalfY: 3, endX: 2, startX: 1 }));

      // Top half of (1,1) painted 5 — bottom sibling keeps its colour 7
      expect(blocks[1][1]).toEqual({ fg: 5, bg: 7, char: '▀' });
      // Bottom half of (2,1) painted 5 — top sibling keeps its colour 7
      expect(blocks[1][2]).toEqual({ fg: 7, bg: 5, char: '▀' });
    });
  });

  describe('rectOutline', () => {
    it('draws a rect border in half coordinates', () => {
      const blocks = makeGrid(8, 6);
      const changes = drawHalfBlockRectOutline(baseOpts(blocks, {
        startX: 1, startHalfY: 2, endX: 4, endHalfY: 9,
      }));
      const grid = new HalfBlockGrid(blocks);
      // Border halves painted, interior untouched
      for (let x = 1; x <= 4; x++) {
        expect(grid.getColour(x, 2)).toBe(5);  // top edge (half row 2)
        expect(grid.getColour(x, 9)).toBe(5);  // bottom edge (half row 9)
      }
      for (let h = 3; h <= 8; h++) {
        expect(grid.getColour(1, h)).toBe(5);  // left edge
        expect(grid.getColour(4, h)).toBe(5);  // right edge
      }
      expect(grid.getColour(2, 5)).toBe(99);   // interior empty
      expect(changes.length).toBeGreaterThan(0);
    });
  });

  describe('rectFilled', () => {
    it('fills every half in the rect region (blocks collapse when both halves painted)', () => {
      const blocks = makeGrid(8, 6);
      drawHalfBlockRectFilled(baseOpts(blocks, {
        startX: 1, startHalfY: 2, endX: 3, endHalfY: 7,
      }));
      const grid = new HalfBlockGrid(blocks);
      for (let h = 2; h <= 7; h++) {
        for (let x = 1; x <= 3; x++) {
          expect(grid.getColour(x, h)).toBe(5);
        }
      }
      // Both halves of each block painted 5 (the second paint reads the
      // sibling as 5 via getColour) → collapses to solid space
      expect(blocks[1][2]).toEqual({ bg: 5, char: ' ' });
      expect(grid.getColour(0, 2)).toBe(99); // outside untouched
    });

    it('collapses to solid spaces when both halves are painted the same colour', () => {
      const blocks = makeGrid(8, 6);
      drawHalfBlockRectFilled(baseOpts(blocks, {
        startX: 1, startHalfY: 2, endX: 3, endHalfY: 7,
      }));
      // Every fully-painted block becomes a collapsed space (bg=5)
      expect(blocks[1][2]).toEqual({ bg: 5, char: ' ' });
      expect(blocks[2][2]).toEqual({ bg: 5, char: ' ' });
    });
  });

  describe('ellipseOutline', () => {
    it('draws an ellipse outline at half resolution', () => {
      const blocks = makeGrid(10, 6);
      const changes = drawHalfBlockEllipseOutline(baseOpts(blocks, {
        startX: 1, startHalfY: 2, endX: 7, endHalfY: 11,
      }));
      const grid = new HalfBlockGrid(blocks);
      // Center of the bounding box is on the outline set's bounding shape:
      // extreme points painted. cy = floor(13/2) = 6, ry = floor(9/2) = 4
      // → vertical extremes at half rows 2 and 10.
      expect(grid.getColour(4, 2)).toBe(5);  // top of ellipse
      expect(grid.getColour(4, 10)).toBe(5); // bottom (cy + ry)
      expect(grid.getColour(1, 6)).toBe(5);  // left extreme (cx - rx, cy)
      expect(grid.getColour(7, 6)).toBe(5);  // right extreme
      // Center itself not on the outline
      expect(grid.getColour(4, 6)).toBe(99);
      expect(changes.length).toBeGreaterThan(0);
    });

    it('degenerates to a single painted half for a point', () => {
      const blocks = makeGrid(6, 3);
      const changes = drawHalfBlockEllipseOutline(
        baseOpts(blocks, { startX: 2, startHalfY: 3, endX: 2, endHalfY: 3 }),
      );
      expect(changes).toHaveLength(1);
      // Bottom half painted; empty top sibling stays empty (▄ rep)
      expect(blocks[1][2]).toEqual({ fg: 5, char: '▄' });
    });

    it('draws a flat vertical line when rx is zero', () => {
      const blocks = makeGrid(6, 4);
      drawHalfBlockEllipseOutline(
        baseOpts(blocks, { startX: 2, startHalfY: 1, endX: 2, endHalfY: 5 }),
      );
      const grid = new HalfBlockGrid(blocks);
      for (let h = 1; h <= 5; h++) {
        expect(grid.getColour(2, h)).toBe(5);
      }
    });
  });

  describe('ellipseFilled', () => {
    it('fills the ellipse region including centre', () => {
      const blocks = makeGrid(10, 6);
      drawHalfBlockEllipseFilled(baseOpts(blocks, {
        startX: 1, startHalfY: 2, endX: 7, endHalfY: 11,
      }));
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(4, 6)).toBe(5);  // centre filled
      expect(grid.getColour(4, 2)).toBe(5);  // top
      expect(grid.getColour(0, 6)).toBe(99); // outside
    });

    it('degenerates to a single painted half for a point', () => {
      const blocks = makeGrid(4, 2);
      drawHalfBlockEllipseFilled(baseOpts(blocks, {
        startX: 2, startHalfY: 3, endX: 2, endHalfY: 3,
      }));
      // bottom half painted, empty top sibling stays empty (▄ rep)
      expect(blocks[1][2]).toEqual({ fg: 5, char: '▄' });
    });
  });

  describe('dispatch', () => {
    it('dispatches every shape type', () => {
      const types = [
        'line', 'rectOutline', 'rectFilled', 'ellipseOutline', 'ellipseFilled',
      ] as const;
      for (const t of types) {
        const blocks = makeGrid(8, 6);
        const changes = drawShapeHalfBlock(t, baseOpts(blocks));
        expect(Array.isArray(changes)).toBe(true);
        expect(changes.length).toBeGreaterThan(0);
      }
    });

    it('returns empty for unknown type', () => {
      const blocks = makeGrid(4, 2);
      const changes = drawShapeHalfBlock(
        'unknown' as unknown as ShapeType,
        baseOpts(blocks),
      );
      expect(changes).toEqual([]);
    });
  });

  describe('undo diff integrity', () => {
    it('old snapshots are pre-draw state; new are final (per-block dedup)', () => {
      const blocks: Block[][] = [
        [
          { fg: 9, bg: 9, char: ' ' },
          { fg: 3, bg: 4, char: '▀' },
        ],
      ];
      const changes = drawHalfBlockRectFilled(baseOpts(blocks, {
        startX: 0, startHalfY: 0, endX: 1, endHalfY: 1, colour: 5,
      }));
      // Both halves of both blocks painted 5 → collapse
      expect(blocks[0][0]).toEqual({ bg: 5, char: ' ' });
      expect(blocks[0][1]).toEqual({ bg: 5, char: ' ' });
      // One change per block, old = original snapshot
      expect(changes).toHaveLength(2);
      expect(changes[0].old).toEqual({ fg: 9, bg: 9, char: ' ' });
      expect(changes[0].new).toEqual({ bg: 5, char: ' ' });
      expect(changes[1].old).toEqual({ fg: 3, bg: 4, char: '▀' });
      expect(changes[1].new).toEqual({ bg: 5, char: ' ' });
    });
  });
});
