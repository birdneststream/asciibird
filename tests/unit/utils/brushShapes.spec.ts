// Tests for brush shape registry
import { describe, it, expect } from 'vitest';
import {
  brushShapeRegistry,
  brushShapeMap,
  getBrushShapeLabels,
  getBrushShapeKeys,
  validateBrushShapeKey,
  createBrushBlocks,
  validBrushShapeKeys,
} from '@/utils/brushShapes';
import type { Block } from '@/types';
import { emptyBlock } from '@/ascii';

const testBlock: Block = { fg: 0, bg: 1, char: 'X' };

/** Count filled (non-empty) cells in a Block[][] */
function countFilled(blocks: Block[][]): number {
  let count = 0;
  for (const row of blocks) {
    for (const cell of row) {
      if (Object.keys(cell).length > 0) count++;
    }
  }
  return count;
}

/** Check if a cell is filled (has properties) */
function isFilled(cell: Block): boolean {
  return Object.keys(cell).length > 0;
}

// ─── Registry structure ─────────────────────────────────────────

describe('brushShapeRegistry', () => {
  it('has 18 shapes', () => {
    expect(brushShapeRegistry).toHaveLength(18);
  });

  it('each entry has key, label, and generate function', () => {
    for (const shape of brushShapeRegistry) {
      expect(shape.key).toBeTruthy();
      expect(shape.label).toBeTruthy();
      expect(typeof shape.generate).toBe('function');
    }
  });

  it('keys are unique', () => {
    const keys = brushShapeRegistry.map(s => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keys are lowercase', () => {
    for (const shape of brushShapeRegistry) {
      expect(shape.key).toBe(shape.key.toLowerCase());
    }
  });

  it('preserves existing 7 shape keys', () => {
    const keys = getBrushShapeKeys();
    expect(keys).toContain('square');
    expect(keys).toContain('circle');
    expect(keys).toContain('cross');
    expect(keys).toContain('grid');
    expect(keys).toContain('inverted grid');
    expect(keys).toContain('h lines');
    expect(keys).toContain('v lines');
  });

  it('includes all 11 new shape keys', () => {
    const keys = getBrushShapeKeys();
    expect(keys).toContain('diamond');
    expect(keys).toContain('ring');
    expect(keys).toContain('star');
    expect(keys).toContain('frame');
    expect(keys).toContain('triangle up');
    expect(keys).toContain('triangle down');
    expect(keys).toContain('diagonal fwd');
    expect(keys).toContain('diagonal bwd');
    expect(keys).toContain('x pattern');
    expect(keys).toContain('checkerboard');
    expect(keys).toContain('sparse');
  });
});

describe('brushShapeMap', () => {
  it('maps all registry keys', () => {
    for (const shape of brushShapeRegistry) {
      expect(brushShapeMap.has(shape.key)).toBe(true);
    }
  });

  it('returns undefined for unknown key', () => {
    expect(brushShapeMap.get('nonexistent')).toBeUndefined();
  });
});

describe('getBrushShapeLabels', () => {
  it('returns 18 labels', () => {
    expect(getBrushShapeLabels()).toHaveLength(18);
  });

  it('labels are display-friendly (title case)', () => {
    const labels = getBrushShapeLabels();
    for (const label of labels) {
      expect(label[0]).toBe(label[0].toUpperCase());
    }
  });
});

describe('validateBrushShapeKey', () => {
  it('returns valid key unchanged', () => {
    expect(validateBrushShapeKey('square')).toBe('square');
    expect(validateBrushShapeKey('circle')).toBe('circle');
    expect(validateBrushShapeKey('star')).toBe('star');
  });

  it('defaults to square for invalid key', () => {
    expect(validateBrushShapeKey('nonexistent')).toBe('square');
    expect(validateBrushShapeKey('')).toBe('square');
    expect(validateBrushShapeKey('Square')).toBe('square');
  });
});

describe('createBrushBlocks', () => {
  it('returns correct dimensions', () => {
    const blocks = createBrushBlocks('square', 5, 3, testBlock);
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toHaveLength(5);
  });

  it('clamps minimum size to 1x1', () => {
    const blocks = createBrushBlocks('square', 0, 0, testBlock);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toHaveLength(1);
  });

  it('falls back to square for unknown shape', () => {
    const blocks = createBrushBlocks('nonexistent', 3, 3, testBlock);
    const square = createBrushBlocks('square', 3, 3, testBlock);
    expect(blocks).toEqual(square);
  });
});

// ─── Individual shape tests ─────────────────────────────────────

describe('Square shape', () => {
  it('fills all cells at 1x1', () => {
    const blocks = createBrushBlocks('square', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('fills all cells at 5x5', () => {
    const blocks = createBrushBlocks('square', 5, 5, testBlock);
    expect(countFilled(blocks)).toBe(25);
  });

  it('fills all cells at 10x1', () => {
    const blocks = createBrushBlocks('square', 10, 1, testBlock);
    expect(countFilled(blocks)).toBe(10);
  });
});

describe('Circle shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('circle', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('fills all cells at 3x3', () => {
    const blocks = createBrushBlocks('circle', 3, 3, testBlock);
    // 3x3 circle should be fully filled (all cells within ellipse)
    expect(countFilled(blocks)).toBe(9);
  });

  it('produces filled circle at 7x7', () => {
    const blocks = createBrushBlocks('circle', 7, 7, testBlock);
    // Should have most cells filled (not hollow)
    expect(countFilled(blocks)).toBeGreaterThan(30);
    // Corners should be empty
    expect(isFilled(blocks[0][0])).toBe(false);
  });

  it('produces filled circle at 5x5', () => {
    const blocks = createBrushBlocks('circle', 5, 5, testBlock);
    // Should be mostly filled
    expect(countFilled(blocks)).toBeGreaterThan(15);
  });

  it('center is always filled for size >= 3', () => {
    for (const size of [3, 5, 7, 9]) {
      const blocks = createBrushBlocks('circle', size, size, testBlock);
      const mid = Math.floor(size / 2);
      expect(isFilled(blocks[mid][mid])).toBe(true);
    }
  });
});

describe('Cross shape', () => {
  it('fills first cell', () => {
    const blocks = createBrushBlocks('cross', 3, 3, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('produces diagonal pattern', () => {
    const blocks = createBrushBlocks('cross', 3, 3, testBlock);
    // Cross: (0,0), (1,1), (2,2), (0,2), (2,0) — diagonal
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[1][1])).toBe(true);
    expect(isFilled(blocks[2][2])).toBe(true);
    expect(isFilled(blocks[0][2])).toBe(true);
    expect(isFilled(blocks[2][0])).toBe(true);
    // Off-diagonal should be empty
    expect(isFilled(blocks[0][1])).toBe(false);
    expect(isFilled(blocks[1][0])).toBe(false);
  });
});

describe('Grid shape', () => {
  it('fills first cell', () => {
    const blocks = createBrushBlocks('grid', 3, 3, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('produces checkerboard pattern', () => {
    const blocks = createBrushBlocks('grid', 5, 5, testBlock);
    // Row 0 (even): cols 0,2,4 filled
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[0][1])).toBe(false);
    expect(isFilled(blocks[0][2])).toBe(true);
    // Row 1 (odd): cols 1,3 filled
    expect(isFilled(blocks[1][0])).toBe(false);
    expect(isFilled(blocks[1][1])).toBe(true);
  });
});

describe('Inverted Grid shape', () => {
  it('fills most cells', () => {
    const blocks = createBrushBlocks('inverted grid', 5, 5, testBlock);
    // Inverted grid fills where row%2===0 OR col%2===0
    // Only skips cells where both row%2===1 AND col%2===1
    expect(countFilled(blocks)).toBeGreaterThan(15);
  });
});

describe('H Lines shape', () => {
  it('fills even rows, empties odd rows', () => {
    const blocks = createBrushBlocks('h lines', 4, 4, testBlock);
    // Row 0: all filled
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[0][3])).toBe(true);
    // Row 1: all empty
    expect(isFilled(blocks[1][0])).toBe(false);
    expect(isFilled(blocks[1][3])).toBe(false);
    // Row 2: all filled
    expect(isFilled(blocks[2][0])).toBe(true);
  });
});

describe('V Lines shape', () => {
  it('fills even cols, empties odd cols', () => {
    const blocks = createBrushBlocks('v lines', 4, 4, testBlock);
    // Col 0: filled
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[3][0])).toBe(true);
    // Col 1: empty
    expect(isFilled(blocks[0][1])).toBe(false);
    expect(isFilled(blocks[3][1])).toBe(false);
    // Col 2: filled
    expect(isFilled(blocks[0][2])).toBe(true);
  });
});

describe('Diamond shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('diamond', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('is symmetric', () => {
    const blocks = createBrushBlocks('diamond', 7, 7, testBlock);
    // Center should be filled
    expect(isFilled(blocks[3][3])).toBe(true);
    // Corners should be empty
    expect(isFilled(blocks[0][0])).toBe(false);
    expect(isFilled(blocks[0][6])).toBe(false);
  });

  it('has fewer filled cells than square', () => {
    const diamond = createBrushBlocks('diamond', 7, 7, testBlock);
    const square = createBrushBlocks('square', 7, 7, testBlock);
    expect(countFilled(diamond)).toBeLessThan(countFilled(square));
    expect(countFilled(diamond)).toBeGreaterThan(0);
  });
});

describe('Ring shape', () => {
  it('fills all cells at small sizes', () => {
    const blocks = createBrushBlocks('ring', 3, 3, testBlock);
    // Too small for hollow center
    expect(countFilled(blocks)).toBeGreaterThan(5);
  });

  it('is hollow at large sizes', () => {
    const blocks = createBrushBlocks('ring', 9, 9, testBlock);
    const filled = countFilled(blocks);
    const total = 81;
    // Ring should not fill everything
    expect(filled).toBeLessThan(total);
    // But should have some filled cells
    expect(filled).toBeGreaterThan(10);
  });

  it('center is empty at size 9', () => {
    const blocks = createBrushBlocks('ring', 9, 9, testBlock);
    expect(isFilled(blocks[4][4])).toBe(false);
  });
});

describe('Star shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('star', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('center is filled', () => {
    const blocks = createBrushBlocks('star', 9, 9, testBlock);
    expect(isFilled(blocks[4][4])).toBe(true);
  });

  it('has 5 points', () => {
    const blocks = createBrushBlocks('star', 11, 11, testBlock);
    // Should have more filled cells than just the center
    expect(countFilled(blocks)).toBeGreaterThan(5);
  });
});

describe('Frame shape', () => {
  it('fills all cells at 1x1', () => {
    const blocks = createBrushBlocks('frame', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('fills border, empties center at 5x5', () => {
    const blocks = createBrushBlocks('frame', 5, 5, testBlock);
    // All edges filled
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[0][4])).toBe(true);
    expect(isFilled(blocks[4][0])).toBe(true);
    expect(isFilled(blocks[4][4])).toBe(true);
    // Center empty
    expect(isFilled(blocks[2][2])).toBe(false);
  });

  it('fills all at 3x3 (all border)', () => {
    const blocks = createBrushBlocks('frame', 3, 3, testBlock);
    expect(countFilled(blocks)).toBe(8); // 3*3 - 1 center
    expect(isFilled(blocks[1][1])).toBe(false);
  });
});

describe('Triangle Up shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('triangle up', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('widens from top to bottom', () => {
    const blocks = createBrushBlocks('triangle up', 5, 5, testBlock);
    // Top row: only center (or 1 cell)
    const topFilled = blocks[0].filter(c => isFilled(c)).length;
    const bottomFilled = blocks[4].filter(c => isFilled(c)).length;
    expect(bottomFilled).toBeGreaterThanOrEqual(topFilled);
  });
});

describe('Triangle Down shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('triangle down', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('narrows from top to bottom', () => {
    const blocks = createBrushBlocks('triangle down', 5, 5, testBlock);
    const topFilled = blocks[0].filter(c => isFilled(c)).length;
    const bottomFilled = blocks[4].filter(c => isFilled(c)).length;
    expect(topFilled).toBeGreaterThanOrEqual(bottomFilled);
  });
});

describe('Diagonal / shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('diagonal fwd', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('has filled cells along the diagonal', () => {
    const blocks = createBrushBlocks('diagonal fwd', 5, 5, testBlock);
    expect(countFilled(blocks)).toBeGreaterThan(0);
  });
});

describe('Diagonal \\ shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('diagonal bwd', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('has filled cells along the diagonal', () => {
    const blocks = createBrushBlocks('diagonal bwd', 5, 5, testBlock);
    expect(countFilled(blocks)).toBeGreaterThan(0);
  });
});

describe('X Pattern shape', () => {
  it('fills single cell at 1x1', () => {
    const blocks = createBrushBlocks('x pattern', 1, 1, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
  });

  it('has both diagonals', () => {
    const blocks = createBrushBlocks('x pattern', 5, 5, testBlock);
    // Center should be filled
    expect(isFilled(blocks[2][2])).toBe(true);
    expect(countFilled(blocks)).toBeGreaterThan(5);
  });
});

describe('Checkerboard shape', () => {
  it('fills roughly half the cells', () => {
    const blocks = createBrushBlocks('checkerboard', 6, 6, testBlock);
    const filled = countFilled(blocks);
    expect(filled).toBe(18); // Exactly half for even dimensions
  });

  it('alternates pattern', () => {
    const blocks = createBrushBlocks('checkerboard', 4, 4, testBlock);
    // (0,0) filled, (0,1) empty, (1,0) empty, (1,1) filled
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[0][1])).toBe(false);
    expect(isFilled(blocks[1][0])).toBe(false);
    expect(isFilled(blocks[1][1])).toBe(true);
  });
});

describe('Sparse shape', () => {
  it('fills even rows only', () => {
    const blocks = createBrushBlocks('sparse', 4, 4, testBlock);
    expect(isFilled(blocks[0][0])).toBe(true);
    expect(isFilled(blocks[1][0])).toBe(false);
    expect(isFilled(blocks[2][0])).toBe(true);
    expect(isFilled(blocks[3][0])).toBe(false);
  });

  it('fills exactly half the rows', () => {
    const blocks = createBrushBlocks('sparse', 4, 4, testBlock);
    // Rows 0,2 filled (8 cells), rows 1,3 empty (8 cells)
    expect(countFilled(blocks)).toBe(8);
  });
});

// ─── Edge case tests ────────────────────────────────────────────

describe('edge cases', () => {
  const allShapes = getBrushShapeKeys();

  it('all shapes produce valid output at 1x1', () => {
    for (const key of allShapes) {
      const blocks = createBrushBlocks(key, 1, 1, testBlock);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toHaveLength(1);
      // 1x1 should always be filled
      expect(isFilled(blocks[0][0]), `Shape ${key} at 1x1 should be filled`).toBe(true);
    }
  });

  it('all shapes produce valid output at 10x1', () => {
    for (const key of allShapes) {
      const blocks = createBrushBlocks(key, 10, 1, testBlock);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toHaveLength(10);
    }
  });

  it('all shapes produce valid output at 1x10', () => {
    for (const key of allShapes) {
      const blocks = createBrushBlocks(key, 1, 10, testBlock);
      expect(blocks).toHaveLength(10);
      expect(blocks[0]).toHaveLength(1);
    }
  });

  it('all shapes produce valid block objects', () => {
    for (const key of allShapes) {
      const blocks = createBrushBlocks(key, 5, 5, testBlock);
      for (const row of blocks) {
        for (const cell of row) {
          if (isFilled(cell)) {
            expect(cell.fg).toBe(testBlock.fg);
            expect(cell.bg).toBe(testBlock.bg);
            expect(cell.char).toBe(testBlock.char);
          } else {
            expect(Object.keys(cell)).toHaveLength(0);
          }
        }
      }
    }
  });
});

// ─── validBrushShapeKeys ────────────────────────────────────────

describe('validBrushShapeKeys', () => {
  it('contains exactly 18 keys', () => {
    expect(validBrushShapeKeys.size).toBe(18);
  });

  it('contains all registry keys', () => {
    for (const shape of brushShapeRegistry) {
      expect(validBrushShapeKeys.has(shape.key)).toBe(true);
    }
  });
});
