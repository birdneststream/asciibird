// Tests for src/utils/transformBlocks.ts
// Block array transform utilities — flip, rotate, deep-clone

import { describe, it, expect } from 'vitest';
import {
  cloneBlocks,
  padToRect,
  flipHorizontal,
  flipVertical,
  rotate90CW,
  rotate90CCW,
  rotate180,
  transformBlocks,
  isHalfBlockChar,
} from '@/utils/transformBlocks';
import type { Block } from '@/types';

// ─── Helper factories ─────────────────────────────────────────────

function makeBlock(fg: number, bg: number, char: string): Block {
  return { fg, bg, char };
}

function makeRow(...specs: [number, number, string][]): Block[] {
  return specs.map(([fg, bg, char]) => makeBlock(fg, bg, char));
}

// 2×3 grid:
//   A B C
//   D E F
function makeGrid2x3(): Block[][] {
  return [
    makeRow(
      [1, 0, 'A'], [2, 0, 'B'], [3, 0, 'C'],
    ),
    makeRow(
      [4, 0, 'D'], [5, 0, 'E'], [6, 0, 'F'],
    ),
  ];
}

// ─── cloneBlocks ──────────────────────────────────────────────────

describe('cloneBlocks', () => {
  it('deep-clones a block array', () => {
    const original = makeGrid2x3();
    const cloned = cloneBlocks(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[0]).not.toBe(original[0]);
    expect(cloned[0][0]).not.toBe(original[0][0]);
  });

  it('preserves empty blocks as empty objects', () => {
    const blocks: Block[][] = [[{}]];
    const cloned = cloneBlocks(blocks);
    expect(cloned).toEqual([[{}]]);
  });

  it('handles empty array', () => {
    expect(cloneBlocks([])).toEqual([]);
  });
});

// ─── padToRect ────────────────────────────────────────────────────

describe('padToRect', () => {
  it('pads jagged rows with empty blocks', () => {
    const jagged: Block[][] = [
      [makeBlock(1, 0, 'A'), makeBlock(2, 0, 'B')],
      [makeBlock(3, 0, 'C')],
    ];

    const result = padToRect(jagged);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(2);
    expect(result[1][1]).toEqual({});
  });

  it('returns empty for empty input', () => {
    expect(padToRect([])).toEqual([]);
  });

  it('leaves rectangular arrays unchanged', () => {
    const rect = makeGrid2x3();
    const padded = padToRect(rect);
    expect(padded).toEqual(rect);
  });
});

// ─── flipHorizontal ───────────────────────────────────────────────

describe('flipHorizontal', () => {
  it('mirrors a 2×3 grid left/right', () => {
    const result = flipHorizontal(makeGrid2x3());
    // C B A / F E D
    expect(result[0].map(b => b.char)).toEqual(['C', 'B', 'A']);
    expect(result[1].map(b => b.char)).toEqual(['F', 'E', 'D']);
  });

  it('preserves fg and bg colours', () => {
    const result = flipHorizontal(makeGrid2x3());
    expect(result[0][0]).toEqual(makeBlock(3, 0, 'C'));
    expect(result[0][2]).toEqual(makeBlock(1, 0, 'A'));
  });

  it('does not mutate the input', () => {
    const original = makeGrid2x3();
    const originalA = original[0][0];
    flipHorizontal(original);
    expect(original[0][0]).toBe(originalA);
    expect(original[0][0].char).toBe('A');
  });

  it('swaps ▌↔▐ characters', () => {
    const blocks: Block[][] = [
      [makeBlock(0, 1, '\u258C'), makeBlock(0, 2, 'X')], // ▌ X
    ];
    const result = flipHorizontal(blocks);
    expect(result[0][0].char).toBe('X');
    expect(result[0][1].char).toBe('\u2590'); // ▐
  });

  it('handles single-row grid', () => {
    const blocks: Block[][] = [
      makeRow([1, 0, 'A'], [2, 0, 'B']),
    ];
    const result = flipHorizontal(blocks);
    expect(result[0].map(b => b.char)).toEqual(['B', 'A']);
  });

  it('handles single-column grid', () => {
    const blocks: Block[][] = [
      [makeBlock(1, 0, 'A')],
      [makeBlock(2, 0, 'B')],
    ];
    const result = flipHorizontal(blocks);
    expect(result[0][0].char).toBe('A');
    expect(result[1][0].char).toBe('B');
  });

  it('handles empty array', () => {
    expect(flipHorizontal([])).toEqual([]);
  });
});

// ─── flipVertical ─────────────────────────────────────────────────

describe('flipVertical', () => {
  it('mirrors a 2×3 grid top/bottom', () => {
    const result = flipVertical(makeGrid2x3());
    // D E F / A B C
    expect(result[0].map(b => b.char)).toEqual(['D', 'E', 'F']);
    expect(result[1].map(b => b.char)).toEqual(['A', 'B', 'C']);
  });

  it('does not mutate the input', () => {
    const original = makeGrid2x3();
    flipVertical(original);
    expect(original[0][0].char).toBe('A');
  });

  it('swaps ▀↔▄ characters and fg/bg colours', () => {
    // ▀ with fg=5 (top colour) bg=3 (bottom colour)
    const blocks: Block[][] = [
      [makeBlock(5, 3, '\u2580')], // ▀ fg=5 bg=3
      [makeBlock(7, 2, 'X')],      // plain
    ];
    const result = flipVertical(blocks);
    // After flip: ▀ is now at bottom → becomes ▄, fg↔bg
    expect(result[0][0].char).toBe('X');
    expect(result[1][0].char).toBe('\u2584'); // ▄
    expect(result[1][0].fg).toBe(3); // swapped
    expect(result[1][0].bg).toBe(5); // swapped
  });

  it('swaps ▄ to ▀ with fg/bg swap', () => {
    const blocks: Block[][] = [
      [makeBlock(7, 2, 'X')],
      [makeBlock(5, 3, '\u2584')], // ▄ fg=5 bg=3
    ];
    const result = flipVertical(blocks);
    expect(result[0][0].char).toBe('\u2580'); // ▀
    expect(result[0][0].fg).toBe(3); // swapped
    expect(result[0][0].bg).toBe(5); // swapped
  });

  it('handles single-row grid', () => {
    const blocks: Block[][] = [
      makeRow([1, 0, 'A'], [2, 0, 'B']),
    ];
    const result = flipVertical(blocks);
    expect(result[0].map(b => b.char)).toEqual(['A', 'B']);
  });

  it('handles empty array', () => {
    expect(flipVertical([])).toEqual([]);
  });
});

// ─── rotate90CW ───────────────────────────────────────────────────

describe('rotate90CW', () => {
  it('rotates a 2×3 grid 90° clockwise → 3×2', () => {
    // Input:       A B C
    //               D E F
    // Expected CW:  D A
    //               E B
    //               F C
    const result = rotate90CW(makeGrid2x3());
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(2);
    expect(result[0].map(b => b.char)).toEqual(['D', 'A']);
    expect(result[1].map(b => b.char)).toEqual(['E', 'B']);
    expect(result[2].map(b => b.char)).toEqual(['F', 'C']);
  });

  it('rotates a 1×1 grid (no-op)', () => {
    const blocks: Block[][] = [[makeBlock(1, 0, 'Z')]];
    const result = rotate90CW(blocks);
    expect(result[0][0].char).toBe('Z');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
  });

  it('does not mutate the input', () => {
    const original = makeGrid2x3();
    rotate90CW(original);
    expect(original[0][0].char).toBe('A');
  });

  it('handles empty array', () => {
    expect(rotate90CW([])).toEqual([]);
  });

  it('converts ▀ to ▌ on rotation', () => {
    // ▀ (vertical upper) → ▌ (horizontal left) after 90° CW
    const blocks: Block[][] = [
      [makeBlock(5, 3, '\u2580')], // ▀ fg=5 bg=3
    ];
    const result = rotate90CW(blocks);
    expect(result[0][0].char).toBe('\u258C'); // ▌
    // fg/bg swap: original fg=5 (top colour) → now bg; bg=3 → now fg
    expect(result[0][0].fg).toBe(3);
    expect(result[0][0].bg).toBe(5);
  });

  it('rotates a 3×1 grid → 1×3', () => {
    const blocks: Block[][] = [
      [makeBlock(1, 0, 'A')],
      [makeBlock(2, 0, 'B')],
      [makeBlock(3, 0, 'C')],
    ];
    const result = rotate90CW(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].map(b => b.char)).toEqual(['C', 'B', 'A']);
  });
});

// ─── rotate90CCW ──────────────────────────────────────────────────

describe('rotate90CCW', () => {
  it('rotates a 2×3 grid 90° counter-clockwise → 3×2', () => {
    // Input:       A B C
    //               D E F
    // Expected CCW: C F
    //               B E
    //               A D
    const result = rotate90CCW(makeGrid2x3());
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(2);
    expect(result[0].map(b => b.char)).toEqual(['C', 'F']);
    expect(result[1].map(b => b.char)).toEqual(['B', 'E']);
    expect(result[2].map(b => b.char)).toEqual(['A', 'D']);
  });

  it('rotates a 1×1 grid (no-op)', () => {
    const blocks: Block[][] = [[makeBlock(1, 0, 'Z')]];
    const result = rotate90CCW(blocks);
    expect(result[0][0].char).toBe('Z');
  });

  it('does not mutate the input', () => {
    const original = makeGrid2x3();
    rotate90CCW(original);
    expect(original[0][0].char).toBe('A');
  });

  it('handles empty array', () => {
    expect(rotate90CCW([])).toEqual([]);
  });

  it('converts ▀ to ▐ on CCW rotation', () => {
    // ▀ (vertical upper) → ▐ (horizontal right) after 90° CCW
    const blocks: Block[][] = [
      [makeBlock(5, 3, '\u2580')], // ▀ fg=5 bg=3
    ];
    const result = rotate90CCW(blocks);
    expect(result[0][0].char).toBe('\u2590'); // ▐
    expect(result[0][0].fg).toBe(3);
    expect(result[0][0].bg).toBe(5);
  });
});

// ─── rotate180 ────────────────────────────────────────────────────

describe('rotate180', () => {
  it('rotates a 2×3 grid 180°', () => {
    // Input:       A B C
    //               D E F
    // Expected:    F E D
    //               C B A
    const result = rotate180(makeGrid2x3());
    expect(result[0].map(b => b.char)).toEqual(['F', 'E', 'D']);
    expect(result[1].map(b => b.char)).toEqual(['C', 'B', 'A']);
  });

  it('does not mutate the input', () => {
    const original = makeGrid2x3();
    rotate180(original);
    expect(original[0][0].char).toBe('A');
  });

  it('handles empty array', () => {
    expect(rotate180([])).toEqual([]);
  });

  it('swaps ▀↔▄ with colour swap on 180° rotation', () => {
    // 180° = flipH + flipV → vertical flip does ▀↔▄ + fg/bg swap
    const blocks: Block[][] = [
      [makeBlock(5, 3, '\u2580')], // ▀ fg=5 bg=3
    ];
    const result = rotate180(blocks);
    // flipH: ▀ stays ▀ (no horizontal change)
    // flipV: ▀ → ▄ with fg/bg swap
    expect(result[0][0].char).toBe('\u2584'); // ▄
    expect(result[0][0].fg).toBe(3);
    expect(result[0][0].bg).toBe(5);
  });
});

// ─── transformBlocks (dispatch) ───────────────────────────────────

describe('transformBlocks', () => {
  const grid = makeGrid2x3();

  it('dispatches flip-h correctly', () => {
    const result = transformBlocks(grid, 'flip-h');
    expect(result[0].map(b => b.char)).toEqual(['C', 'B', 'A']);
  });

  it('dispatches flip-v correctly', () => {
    const result = transformBlocks(grid, 'flip-v');
    expect(result[0].map(b => b.char)).toEqual(['D', 'E', 'F']);
  });

  it('dispatches rotate-cw correctly', () => {
    const result = transformBlocks(grid, 'rotate-cw');
    expect(result[0].map(b => b.char)).toEqual(['D', 'A']);
  });

  it('dispatches rotate-ccw correctly', () => {
    const result = transformBlocks(grid, 'rotate-ccw');
    expect(result[0].map(b => b.char)).toEqual(['C', 'F']);
  });

  it('dispatches rotate-180 correctly', () => {
    const result = transformBlocks(grid, 'rotate-180');
    expect(result[0].map(b => b.char)).toEqual(['F', 'E', 'D']);
  });

  it('returns clone for unknown type', () => {
    const result = transformBlocks(grid, 'unknown' as any);
    expect(result).toEqual(grid);
    expect(result).not.toBe(grid);
  });
});

// ─── isHalfBlockChar ──────────────────────────────────────────────

describe('isHalfBlockChar', () => {
  it('recognises ▀', () => {
    expect(isHalfBlockChar('\u2580')).toBe(true);
  });

  it('recognises ▄', () => {
    expect(isHalfBlockChar('\u2584')).toBe(true);
  });

  it('recognises ▌', () => {
    expect(isHalfBlockChar('\u258C')).toBe(true);
  });

  it('recognises ▐', () => {
    expect(isHalfBlockChar('\u2590')).toBe(true);
  });

  it('recognises █', () => {
    expect(isHalfBlockChar('\u2588')).toBe(true);
  });

  it('returns false for regular characters', () => {
    expect(isHalfBlockChar('A')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isHalfBlockChar(null)).toBe(false);
    expect(isHalfBlockChar(undefined)).toBe(false);
  });
});

// ─── Round-trip verification ──────────────────────────────────────

describe('round-trip transforms', () => {
  it('rotate CW × 4 = identity', () => {
    const original = makeGrid2x3();
    let result = rotate90CW(original);
    result = rotate90CW(result);
    result = rotate90CW(result);
    result = rotate90CW(result);
    // Shape restored: 2×3
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(3);
    expect(result[0].map(b => b.char)).toEqual(['A', 'B', 'C']);
    expect(result[1].map(b => b.char)).toEqual(['D', 'E', 'F']);
  });

  it('rotate CCW × 4 = identity', () => {
    const original = makeGrid2x3();
    let result = rotate90CCW(original);
    result = rotate90CCW(result);
    result = rotate90CCW(result);
    result = rotate90CCW(result);
    expect(result[0].map(b => b.char)).toEqual(['A', 'B', 'C']);
  });

  it('flip-h × 2 = identity', () => {
    const original = makeGrid2x3();
    const result = flipHorizontal(flipHorizontal(original));
    expect(result[0].map(b => b.char)).toEqual(['A', 'B', 'C']);
  });

  it('flip-v × 2 = identity', () => {
    const original = makeGrid2x3();
    const result = flipVertical(flipVertical(original));
    expect(result[0].map(b => b.char)).toEqual(['A', 'B', 'C']);
  });

  it('rotate-cw then rotate-ccw = identity', () => {
    const original = makeGrid2x3();
    const result = rotate90CCW(rotate90CW(original));
    expect(result[0].map(b => b.char)).toEqual(['A', 'B', 'C']);
  });

  it('half-block chars survive round-trip CW × 4', () => {
    // ▀ should return to ▀ after 4 × 90° CW rotations
    const blocks: Block[][] = [[makeBlock(5, 3, '\u2580')]];
    let result = blocks;
    for (let i = 0; i < 4; i++) {
      result = rotate90CW(result);
    }
    expect(result[0][0].char).toBe('\u2580'); // ▀ restored
    expect(result[0][0].fg).toBe(5);
    expect(result[0][0].bg).toBe(3);
  });
});
