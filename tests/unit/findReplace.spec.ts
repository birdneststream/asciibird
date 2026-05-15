import { describe, it, expect } from 'vitest';
import {
  findMatches,
  replaceAtPositions,
} from '@/utils/findReplace';
import type { Block, FindCriteria, ReplaceSpec } from '@/types';

// ─── Test helpers ──────────────────────────────────────────────

function makeGrid(rows: string[], fg = 0, bg = 1): Block[][] {
  return rows.map(row =>
    row.split('').map(char => ({
      fg,
      bg,
      char,
    })),
  );
}

function makeEmptyGrid(h: number, w: number): Block[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({})),
  );
}

// ─── findMatches ───────────────────────────────────────────────

describe('findMatches', () => {
  it('finds blocks by character (literal)', () => {
    const grid = makeGrid(['abc', 'def', 'ghi']);
    const matches = findMatches(grid, { char: 'e' });
    expect(matches).toEqual([{ x: 1, y: 1 }]);
  });

  it('finds multiple blocks with same character', () => {
    const grid = makeGrid(['aba', 'bab']);
    const matches = findMatches(grid, { char: 'a' });
    expect(matches).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  it('finds blocks by foreground color', () => {
    const grid: Block[][] = [
      [{ fg: 5, bg: 1, char: 'a' }, { fg: 6, bg: 1, char: 'b' }],
      [{ fg: 5, bg: 1, char: 'c' }, { fg: 7, bg: 1, char: 'd' }],
    ];
    const matches = findMatches(grid, { fg: 5 });
    expect(matches).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }]);
  });

  it('finds blocks by background color', () => {
    const grid: Block[][] = [
      [{ fg: 0, bg: 3, char: 'a' }, { fg: 0, bg: 4, char: 'b' }],
    ];
    const matches = findMatches(grid, { bg: 3 });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  it('AND-combines criteria (char + fg)', () => {
    const grid: Block[][] = [
      [{ fg: 0, bg: 1, char: 'a' }, { fg: 5, bg: 1, char: 'a' }],
    ];
    const matches = findMatches(grid, { char: 'a', fg: 0 });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  it('AND-combines all three criteria', () => {
    const grid: Block[][] = [
      [
        { fg: 0, bg: 1, char: 'X' },
        { fg: 0, bg: 2, char: 'X' },
        { fg: 1, bg: 1, char: 'X' },
        { fg: 0, bg: 1, char: 'Y' },
      ],
    ];
    const matches = findMatches(grid, { char: 'X', fg: 0, bg: 1 });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  it('returns empty for no matches', () => {
    const grid = makeGrid(['abc', 'def']);
    const matches = findMatches(grid, { char: 'z' });
    expect(matches).toEqual([]);
  });

  it('returns empty for empty criteria', () => {
    const grid = makeGrid(['abc']);
    const matches = findMatches(grid, {});
    expect(matches).toEqual([]);
  });

  it('returns empty for empty grid', () => {
    const matches = findMatches([], { char: 'a' });
    expect(matches).toEqual([]);
  });

  it('handles single-cell grid', () => {
    const grid: Block[][] = [[{ fg: 0, bg: 1, char: 'X' }]];
    const matches = findMatches(grid, { char: 'X' });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  // ─── Regex ────────────────────────────────────────────────

  it('finds blocks by regex pattern', () => {
    const grid = makeGrid(['a1b', 'c2d']);
    const matches = findMatches(grid, { char: '[0-9]', useRegex: true });
    expect(matches).toEqual([{ x: 1, y: 0 }, { x: 1, y: 1 }]);
  });

  it('finds blocks by regex with anchors', () => {
    const grid = makeGrid(['abc', 'adc']);
    const matches = findMatches(grid, { char: '^a', useRegex: true });
    expect(matches).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }]);
  });

  it('handles invalid regex gracefully', () => {
    const grid = makeGrid(['abc']);
    const errorOut: { error?: { message: string; pattern: string } } = {};
    const matches = findMatches(grid, {
      char: '[invalid',
      useRegex: true,
    }, errorOut);
    expect(matches).toEqual([]);
    expect(errorOut.error).toBeDefined();
    expect(errorOut.error!.pattern).toBe('[invalid');
  });

  it('literal match does not treat special regex chars as regex', () => {
    const grid: Block[][] = [[{ fg: 0, bg: 1, char: '*' }]];
    const matches = findMatches(grid, { char: '*', useRegex: false });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  it('regex dot matches any character', () => {
    const grid: Block[][] = [
      [{ fg: 0, bg: 1, char: 'a' }, { fg: 0, bg: 1, char: ' ' }],
    ];
    const matches = findMatches(grid, { char: '.', useRegex: true });
    expect(matches).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }]);
  });

  // ─── Edge cases ───────────────────────────────────────────

  it('matches blocks with undefined optional fields', () => {
    const grid: Block[][] = [[{}]];
    const matches = findMatches(grid, { char: '' });
    expect(matches).toEqual([{ x: 0, y: 0 }]);
  });

  it('does not match undefined fg against a number', () => {
    const grid: Block[][] = [[{}]];
    const matches = findMatches(grid, { fg: 5 });
    expect(matches).toEqual([]);
  });

  it('does not match undefined bg against a number', () => {
    const grid: Block[][] = [[{}]];
    const matches = findMatches(grid, { bg: 5 });
    expect(matches).toEqual([]);
  });

  it('skips null rows gracefully', () => {
    const grid: Block[][] = [null as any, [{ fg: 0, bg: 1, char: 'a' }]];
    const matches = findMatches(grid, { char: 'a' });
    expect(matches).toEqual([{ x: 0, y: 1 }]);
  });
});

// ─── replaceAtPositions ───────────────────────────────────────

describe('replaceAtPositions', () => {
  it('replaces character at specified positions', () => {
    const grid = makeGrid(['abc', 'def']);
    const result = replaceAtPositions(
      grid,
      [{ x: 1, y: 1 }],
      { char: 'X' },
    );
    expect(grid[1][1].char).toBe('X');
    expect(result.oldDiffs).toHaveLength(1);
    expect(result.newDiffs).toHaveLength(1);
    expect(result.oldDiffs[0].b.char).toBe('e');
    expect(result.newDiffs[0].b.char).toBe('X');
  });

  it('replaces foreground color', () => {
    const grid = makeGrid(['ab'], 0, 1);
    replaceAtPositions(grid, [{ x: 0, y: 0 }], { fg: 5 });
    expect(grid[0][0].fg).toBe(5);
  });

  it('replaces background color', () => {
    const grid = makeGrid(['ab'], 0, 1);
    replaceAtPositions(grid, [{ x: 0, y: 0 }], { bg: 9 });
    expect(grid[0][0].bg).toBe(9);
  });

  it('replaces all three properties simultaneously', () => {
    const grid = makeGrid(['a'], 0, 1);
    const result = replaceAtPositions(
      grid,
      [{ x: 0, y: 0 }],
      { char: 'Z', fg: 7, bg: 8 },
    );
    expect(grid[0][0]).toEqual({ char: 'Z', fg: 7, bg: 8 });
    expect(result.oldDiffs).toHaveLength(1);
  });

  it('skips positions that would not change', () => {
    const grid = makeGrid(['a'], 0, 1);
    const result = replaceAtPositions(
      grid,
      [{ x: 0, y: 0 }],
      { char: 'a', fg: 0, bg: 1 },
    );
    // All same — no diff recorded
    expect(result.oldDiffs).toHaveLength(0);
  });

  it('handles multiple positions', () => {
    const grid = makeGrid(['aba', 'bab']);
    const positions = findMatches(grid, { char: 'a' });
    const result = replaceAtPositions(grid, positions, { char: 'X' });
    expect(result.oldDiffs).toHaveLength(3);
    expect(result.newDiffs).toHaveLength(3);
  });

  it('returns empty diffs for empty positions', () => {
    const grid = makeGrid(['abc']);
    const result = replaceAtPositions(grid, [], { char: 'X' });
    expect(result.oldDiffs).toEqual([]);
  });

  it('returns empty diffs for empty replacement', () => {
    const grid = makeGrid(['abc']);
    const result = replaceAtPositions(
      grid,
      [{ x: 0, y: 0 }],
      {} as ReplaceSpec,
    );
    expect(result.oldDiffs).toEqual([]);
  });

  it('handles partial replacement (char only)', () => {
    const grid = makeGrid(['a'], 5, 7);
    replaceAtPositions(grid, [{ x: 0, y: 0 }], { char: 'Z' });
    expect(grid[0][0].char).toBe('Z');
    expect(grid[0][0].fg).toBe(5); // unchanged
    expect(grid[0][0].bg).toBe(7); // unchanged
  });

  it('handles partial replacement (fg only)', () => {
    const grid = makeGrid(['a'], 0, 1);
    replaceAtPositions(grid, [{ x: 0, y: 0 }], { fg: 99 });
    expect(grid[0][0].fg).toBe(99);
    expect(grid[0][0].char).toBe('a'); // unchanged
  });

  it('handles out-of-bounds position gracefully', () => {
    const grid = makeGrid(['ab']);
    const result = replaceAtPositions(
      grid,
      [{ x: 99, y: 99 }],
      { char: 'X' },
    );
    expect(result.oldDiffs).toHaveLength(0);
  });

  it('records correct diff positions', () => {
    const grid = makeGrid(['abc', 'def']);
    const result = replaceAtPositions(
      grid,
      [{ x: 2, y: 0 }, { x: 0, y: 1 }],
      { char: 'Z' },
    );
    expect(result.oldDiffs[0]).toEqual({
      x: 2, y: 0, b: { fg: 0, bg: 1, char: 'c' },
    });
    expect(result.newDiffs[0]).toEqual({
      x: 2, y: 0, b: { fg: 0, bg: 1, char: 'Z' },
    });
    expect(result.oldDiffs[1]).toEqual({
      x: 0, y: 1, b: { fg: 0, bg: 1, char: 'd' },
    });
  });
});
