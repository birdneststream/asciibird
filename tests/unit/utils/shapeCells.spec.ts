// Shape cell enumerator tests — geometry + traversal-order parity with
// the draw path. The order assertions are load-bearing: enumerator order
// defines FillChange order (undo) and preview paint order.
import { describe, it, expect } from 'vitest';
import {
  shapeCells,
  lineCells,
  rectOutlineCells,
  rectFilledCells,
  ellipseFilledCells,
  drawShape,
  SHAPE_TYPES,
  type ShapeType,
} from '../../../src/utils/shapes';
import { drawShapeHalfBlock } from '../../../src/utils/halfBlockShapes';
import { HalfBlockGrid } from '../../../src/utils/halfBlockGrid';
import type { Block } from '../../../src/types';
import { emptyBlock } from '../../../src/ascii';

function makeGrid(w: number, h: number): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = { ...emptyBlock };
    }
  }
  return grid;
}

/** In-bounds cells from an enumerator, order preserved */
function inBounds(cells: { x: number; y: number }[], w: number, h: number) {
  return cells.filter(c => c.x >= 0 && c.x < w && c.y >= 0 && c.y < h);
}

describe('shapeCells geometry', () => {
  it('lineCells enumerates the diagonal in Bresenham order', () => {
    const cells = lineCells(0, 0, 3, 3);
    expect(cells).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
    ]);
  });

  it('rectOutlineCells interleaves top/bottom edges per column', () => {
    const cells = rectOutlineCells(0, 0, 2, 2);
    expect(cells).toEqual([
      // columns first: (x, y1), (x, y2) interleaved
      { x: 0, y: 0 }, { x: 0, y: 2 },
      { x: 1, y: 0 }, { x: 1, y: 2 },
      { x: 2, y: 0 }, { x: 2, y: 2 },
      // then interior row 1: (x1, y), (x2, y)
      { x: 0, y: 1 }, { x: 2, y: 1 },
    ]);
  });

  it('rectOutlineCells single row has no duplicated cells', () => {
    const cells = rectOutlineCells(1, 2, 4, 2);
    expect(cells).toEqual([
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    ]);
  });

  it('rectOutlineCells single column has no duplicated cells', () => {
    const cells = rectOutlineCells(3, 0, 3, 2);
    expect(cells).toEqual([
      { x: 3, y: 0 }, { x: 3, y: 2 },
      { x: 3, y: 1 },
    ]);
  });

  it('rectOutlineCells normalizes reversed corners', () => {
    expect(rectOutlineCells(2, 2, 0, 0)).toEqual(rectOutlineCells(0, 0, 2, 2));
  });

  it('rectFilledCells enumerates row-major', () => {
    const cells = rectFilledCells(0, 0, 1, 1);
    expect(cells).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 },
    ]);
  });

  it('ellipseFilledCells degenerate is the single center point', () => {
    expect(ellipseFilledCells(2, 2, 2, 2)).toEqual([{ x: 2, y: 2 }]);
    // 1x1 bbox → rx=0, ry=0
    expect(ellipseFilledCells(0, 0, 0, 0)).toEqual([{ x: 0, y: 0 }]);
  });

  it('ellipseFilledCells is vertically/horizontally symmetric', () => {
    const cells = ellipseFilledCells(0, 0, 6, 6);
    const set = new Set(cells.map(c => `${c.x},${c.y}`));
    // (3,1)/(3,5) and (1,3)/(5,3) are inside the ellipse — both mirror
    // pairs must exist
    expect(set.has('3,1')).toBe(true);
    expect(set.has('3,5')).toBe(true);
    expect(set.has('1,3')).toBe(true);
    expect(set.has('5,3')).toBe(true);
  });

  it('shapeCells dispatches every registered shape type', () => {
    for (const type of SHAPE_TYPES) {
      const cells = shapeCells(type, 0, 0, 4, 4);
      expect(cells.length).toBeGreaterThan(0);
      expect(cells.every(c => Number.isInteger(c.x) && Number.isInteger(c.y)))
        .toBe(true);
    }
  });

  it('enumerators contain no duplicate cells', () => {
    for (const type of SHAPE_TYPES) {
      const cells = shapeCells(type, 0, 0, 5, 3);
      const set = new Set(cells.map(c => `${c.x},${c.y}`));
      expect(set.size).toBe(cells.length);
    }
  });
});

describe('shapeCells order parity with drawShape', () => {
  const cases: Array<[ShapeType, number, number, number, number]> = [
    ['line', 0, 0, 5, 3],
    ['line', 4, 4, 0, 1],
    ['rectOutline', 0, 0, 5, 3],
    ['rectOutline', 5, 3, 0, 0], // reversed corners
    ['rectOutline', 2, 2, 2, 7], // single column
    ['rectOutline', 1, 3, 6, 3], // single row
    ['rectFilled', 0, 0, 4, 2],
    ['ellipseOutline', 0, 0, 6, 4],
    ['ellipseOutline', 3, 3, 3, 3], // degenerate point
    ['ellipseFilled', 0, 0, 6, 4],
    ['ellipseFilled', 2, 2, 2, 2], // degenerate point
  ];

  for (const [type, sx, sy, ex, ey] of cases) {
    it(`${type} (${sx},${sy})→(${ex},${ey}): FillChange order ≡ enumerator order`, () => {
      const grid = makeGrid(10, 10);
      const changes = drawShape(type, {
        blocks: grid,
        startX: sx, startY: sy, endX: ex, endY: ey,
        fg: 4, bg: 1, char: '#',
      });
      const drawn = changes.map(c => ({ x: c.x, y: c.y }));
      const enumerated = inBounds(shapeCells(type, sx, sy, ex, ey), 10, 10);
      expect(drawn).toEqual(enumerated);
    });
  }

  it('enumerator cells outside the grid are skipped by applyBlock, not drawn', () => {
    const grid = makeGrid(4, 4);
    const changes = drawShape('rectFilled', {
      blocks: grid,
      startX: -2, startY: -2, endX: 8, endY: 8,
      fg: 4, bg: 1,
    });
    // Every drawn change is inside the grid
    for (const c of changes) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(4);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThan(4);
    }
    // All in-bounds cells of the enumerator were drawn
    const enumerated = inBounds(shapeCells('rectFilled', -2, -2, 8, 8), 4, 4);
    expect(changes.map(c => ({ x: c.x, y: c.y }))).toEqual(enumerated);
  });
});

describe('shapeCells order parity with drawShapeHalfBlock', () => {
  // The half-block tracker dedupes per block and filters no-ops, so
  // FillChange order is not 1:1 with cells — parity here means the
  // FINAL grid equals painting the enumerator cells directly through
  // HalfBlockGrid (the single-colour paint model), for every type.
  const cases: Array<[ShapeType, number, number, number, number]> = [
    ['line', 1, 2, 4, 6],
    ['line', 4, 6, 1, 2], // reversed
    ['rectOutline', 0, 1, 5, 7],
    ['rectFilled', 0, 1, 5, 7],
    ['ellipseOutline', 0, 1, 6, 7],
    ['ellipseFilled', 0, 1, 6, 7],
  ];

  for (const [type, sx, sy, ex, ey] of cases) {
    it(`${type} (${sx},${sy})→(${ex},${ey}): painted grid ≡ enumerator halves`, () => {
      const drawGrid = makeGrid(8, 6);
      drawShapeHalfBlock(type, {
        blocks: drawGrid,
        startX: sx, startHalfY: sy, endX: ex, endHalfY: ey,
        colour: 4,
      });

      const manualGrid = makeGrid(8, 6);
      const grid = new HalfBlockGrid(manualGrid);
      for (const cell of shapeCells(type, sx, sy, ex, ey)) {
        grid.setColourPreserve(cell.x, cell.y, 4);
      }

      expect(drawGrid).toEqual(manualGrid);
    });
  }
});
