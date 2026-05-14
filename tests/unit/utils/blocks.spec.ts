import { describe, it, expect } from 'vitest';
import { cleanBlock, getBrushOffset } from '../../../src/utils/blocks';
import type { Block } from '../../../src/types';

describe('cleanBlock', () => {
  it('returns empty block for all-null properties', () => {
    expect(cleanBlock({ fg: null, bg: null, char: null }))
      .toEqual({});
  });

  it('returns empty block for all-undefined properties', () => {
    expect(cleanBlock({})).toEqual({});
  });

  it('preserves defined fg only', () => {
    expect(cleanBlock({ fg: 5, bg: null, char: null }))
      .toEqual({ fg: 5 });
  });

  it('preserves defined bg only', () => {
    expect(cleanBlock({ fg: null, bg: 3, char: null }))
      .toEqual({ bg: 3 });
  });

  it('preserves defined char only', () => {
    expect(cleanBlock({ fg: null, bg: null, char: 'A' }))
      .toEqual({ char: 'A' });
  });

  it('preserves all defined properties', () => {
    expect(cleanBlock({ fg: 1, bg: 0, char: 'X' }))
      .toEqual({ fg: 1, bg: 0, char: 'X' });
  });

  it('removes undefined properties', () => {
    const block: Block = { fg: undefined, bg: 2 };
    expect(cleanBlock(block)).toEqual({ bg: 2 });
  });

  it('does not mutate the input', () => {
    const original: Block = { fg: null, bg: 3, char: 'A' };
    const result = cleanBlock(original);
    expect(result).toEqual({ bg: 3, char: 'A' });
    expect(original).toEqual({ fg: null, bg: 3, char: 'A' });
  });
});

describe('getBrushOffset', () => {
  const bw = 8;
  const bh = 15;

  it('returns zero offset for single-cell brush', () => {
    const blocks: Block[][] = [[{ fg: 1, bg: 0, char: 'A' }]];
    const result = getBrushOffset(blocks, bw, bh);
    expect(result).toEqual({ dx: 0, dy: 0, xLength: 1 });
  });

  it('returns centered offset for 3x3 brush', () => {
    const blocks: Block[][] = [
      [{ fg: 1, bg: 0, char: 'A' }, { fg: 1, bg: 0, char: 'B' }, { fg: 1, bg: 0, char: 'C' }],
      [{ fg: 1, bg: 0, char: 'D' }, { fg: 1, bg: 0, char: 'E' }, { fg: 1, bg: 0, char: 'F' }],
      [{ fg: 1, bg: 0, char: 'G' }, { fg: 1, bg: 0, char: 'H' }, { fg: 1, bg: 0, char: 'I' }],
    ];
    const result = getBrushOffset(blocks, bw, bh);
    expect(result.dx).toBe(Math.floor(3 / 2) * bw);
    expect(result.dy).toBe(Math.floor(3 / 2) * bh);
    expect(result.xLength).toBe(3);
  });

  it('handles even-width brush (2x2)', () => {
    const blocks: Block[][] = [
      [{ fg: 1, bg: 0, char: 'A' }, { fg: 1, bg: 0, char: 'B' }],
      [{ fg: 1, bg: 0, char: 'C' }, { fg: 1, bg: 0, char: 'D' }],
    ];
    const result = getBrushOffset(blocks, bw, bh);
    expect(result.dx).toBe(1 * bw);
    expect(result.dy).toBe(1 * bh);
    expect(result.xLength).toBe(2);
  });

  it('handles empty brush rows', () => {
    const blocks: (Block | null)[][] = [
      null,
      [{ fg: 1, bg: 0, char: 'A' }],
    ] as unknown as Block[][];
    const result = getBrushOffset(blocks as Block[][], bw, bh);
    expect(result.dx).toBe(0);
    expect(result.xLength).toBe(1);
    expect(result.dy).toBe(Math.floor(2 / 2) * bh);
  });
});
