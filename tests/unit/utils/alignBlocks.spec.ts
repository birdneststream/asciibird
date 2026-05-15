// Tests for alignBlocks utility — text alignment for IRC art selections

import { describe, it, expect } from 'vitest';
import {
  alignCenter,
  alignLeft,
  alignRight,
  alignSelection,
} from '../../../src/utils/alignBlocks';
import type { Block } from '../../../src/types';

// ─── Helpers ────────────────────────────────────────────────────

/** Create a block row from a string of chars with the given FG color */
function row(chars: string, fg = 1): Block[] {
  return chars.split('').map(c => c === ' ' ? {} : { char: c, fg });
}

/** Check if two block rows have the same content */
function rowsEqual(a: Block[], b: Block[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ae = Object.keys(a[i]).length === 0;
    const be = Object.keys(b[i]).length === 0;
    if (ae !== be) return false;
    if (!ae && !be) {
      if (a[i].char !== b[i].char || a[i].fg !== b[i].fg) return false;
    }
  }
  return true;
}

// ─── alignCenter ────────────────────────────────────────────────

describe('alignCenter', () => {
  it('should center content in a wider row', () => {
    // Content at position 0-4 in width 10
    const input = row('HELLO     ', 1);
    // Input: HELLO at positions 0-4, spaces at 5-9
    // But the spaces are empty blocks, so content is 0-4
    // Width 10: center of 10 = 5, content width = 5
    // So content should be at positions 2-6 (offset = (10-5)/2 = 2.5 → 2)
    // Wait, content starts at 0, so shift = floor((10-5)/2) - 0 = 2
    const result = alignCenter(input, 10);
    expect(result.length).toBe(10);
    // Content should be at positions 2-6
    expect(result[2]).toEqual({ char: 'H', fg: 1 });
    expect(result[6]).toEqual({ char: 'O', fg: 1 });
    expect(result[0]).toEqual({});
  });

  it('should return empty row when width is 0', () => {
    const result = alignCenter(row('hello', 1), 0);
    expect(result).toEqual([]);
  });

  it('should handle all-empty row', () => {
    const input = row('     ', 1);
    const result = alignCenter(input, 5);
    expect(result.length).toBe(5);
    expect(result.every(b => Object.keys(b).length === 0)).toBe(true);
  });

  it('should handle already-centered content', () => {
    // Content already centered in width 5
    const input = [{} , {}, { char: 'X', fg: 1 }, {}, {}];
    const result = alignCenter(input, 5);
    expect(result[2]).toEqual({ char: 'X', fg: 1 });
  });

  it('should handle single-char content', () => {
    const input = [{ char: 'X', fg: 1 }, {}, {}, {}, {}];
    const result = alignCenter(input, 5);
    // Content width = 1, should center at position 2
    expect(result[2]).toEqual({ char: 'X', fg: 1 });
  });

  it('should handle content filling entire width', () => {
    const input = row('ABCDE', 1);
    const result = alignCenter(input, 5);
    expect(result.length).toBe(5);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[4]).toEqual({ char: 'E', fg: 1 });
  });

  it('should pad row shorter than width', () => {
    const input = row('AB', 1);
    const result = alignCenter(input, 6);
    expect(result.length).toBe(6);
    // Content width 2, center of 6 = (6-2)/2 = 2
    expect(result[2]).toEqual({ char: 'A', fg: 1 });
    expect(result[3]).toEqual({ char: 'B', fg: 1 });
  });

  it('should handle content with background-only blocks', () => {
    const input: Block[] = [{}, { bg: 5 }, {}, {}, {}];
    const result = alignCenter(input, 5);
    // Content at position 1 (has bg:5), width 5
    // Content start=1, end=1, contentWidth=1
    // offset = floor((5-1)/2) - 1 = 2 - 1 = 1
    expect(result[2]).toEqual({ bg: 5 });
  });
});

// ─── alignLeft ─────────────────────────────────────────────────

describe('alignLeft', () => {
  it('should left-align content with leading empties', () => {
    const input = [{} , {}, {}, { char: 'A', fg: 1 }, { char: 'B', fg: 1 }];
    const result = alignLeft(input, 5);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[1]).toEqual({ char: 'B', fg: 1 });
    expect(result[2]).toEqual({});
  });

  it('should return empty row for width 0', () => {
    const result = alignLeft(row('hello', 1), 0);
    expect(result).toEqual([]);
  });

  it('should handle all-empty row', () => {
    const result = alignLeft(row('     ', 1), 5);
    expect(result.length).toBe(5);
    expect(result.every(b => Object.keys(b).length === 0)).toBe(true);
  });

  it('should handle already left-aligned content', () => {
    const input = row('AB   ', 1);
    const result = alignLeft(input, 5);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[1]).toEqual({ char: 'B', fg: 1 });
  });

  it('should pad row shorter than width', () => {
    const input = row('AB', 1);
    const result = alignLeft(input, 5);
    expect(result.length).toBe(5);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[1]).toEqual({ char: 'B', fg: 1 });
    expect(result[2]).toEqual({});
    expect(result[4]).toEqual({});
  });

  it('should truncate row longer than width', () => {
    const input = row('ABCDE', 1);
    const result = alignLeft(input, 3);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[2]).toEqual({ char: 'C', fg: 1 });
  });
});

// ─── alignRight ────────────────────────────────────────────────

describe('alignRight', () => {
  it('should right-align content with trailing empties', () => {
    const input = [{ char: 'A', fg: 1 }, { char: 'B', fg: 1 }, {}, {}, {}];
    const result = alignRight(input, 5);
    expect(result[3]).toEqual({ char: 'A', fg: 1 });
    expect(result[4]).toEqual({ char: 'B', fg: 1 });
    expect(result[0]).toEqual({});
  });

  it('should return empty row for width 0', () => {
    const result = alignRight(row('hello', 1), 0);
    expect(result).toEqual([]);
  });

  it('should handle all-empty row', () => {
    const result = alignRight(row('     ', 1), 5);
    expect(result.length).toBe(5);
    expect(result.every(b => Object.keys(b).length === 0)).toBe(true);
  });

  it('should handle content already at right edge', () => {
    const input = [{}, {}, {}, { char: 'A', fg: 1 }, { char: 'B', fg: 1 }];
    const result = alignRight(input, 5);
    expect(result[3]).toEqual({ char: 'A', fg: 1 });
    expect(result[4]).toEqual({ char: 'B', fg: 1 });
  });

  it('should pad row shorter than width', () => {
    const input = row('AB', 1);
    const result = alignRight(input, 5);
    expect(result.length).toBe(5);
    expect(result[3]).toEqual({ char: 'A', fg: 1 });
    expect(result[4]).toEqual({ char: 'B', fg: 1 });
    expect(result[0]).toEqual({});
  });

  it('should handle content filling entire width', () => {
    const input = row('ABCDE', 1);
    const result = alignRight(input, 5);
    expect(result.length).toBe(5);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[4]).toEqual({ char: 'E', fg: 1 });
  });

  it('should handle content wider than width', () => {
    const input = row('ABCDE', 1);
    const result = alignRight(input, 3);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ char: 'A', fg: 1 });
    expect(result[2]).toEqual({ char: 'C', fg: 1 });
  });
});

// ─── alignSelection ────────────────────────────────────────────

describe('alignSelection', () => {
  it('should apply alignment to each row independently', () => {
    const blocks = [
      row('  AB  ', 1),  // row 0: content at positions 2-3
      row('  CDEF', 1),  // row 1: content at positions 2-5
    ];

    const result = alignSelection(blocks, 'left');
    expect(result.length).toBe(2);
    // Row 0: AB should shift to position 0
    expect(result[0][0]).toEqual({ char: 'A', fg: 1 });
    expect(result[0][1]).toEqual({ char: 'B', fg: 1 });
    // Row 1: CDEF should shift to position 0
    expect(result[1][0]).toEqual({ char: 'C', fg: 1 });
    expect(result[1][3]).toEqual({ char: 'F', fg: 1 });
  });

  it('should handle empty selection', () => {
    const result = alignSelection([], 'center');
    expect(result).toEqual([]);
  });

  it('should preserve background-only blocks as content', () => {
    const blocks: Block[][] = [
      [{}, { bg: 5 }, {}, {}, {}],
    ];
    const result = alignSelection(blocks, 'left');
    // bg:5 at position 1 should shift to position 0
    expect(result[0][0]).toEqual({ bg: 5 });
    expect(result[0][1]).toEqual({});
  });

  it('should handle rows with mixed content types', () => {
    const blocks: Block[][] = [
      [
        {},
        { char: 'X', fg: 1 },
        {},
        { bg: 3 },
        {},
      ],
    ];
    const result = alignSelection(blocks, 'left');
    // Content starts at position 1
    expect(result[0][0]).toEqual({ char: 'X', fg: 1 });
    expect(result[0][2]).toEqual({ bg: 3 });
  });

  it('should not mutate the input array', () => {
    const original = [row('  AB  ', 1)];
    const copy = original.map(r => [...r]);
    alignSelection(original, 'left');
    // Original should be unchanged (shallow check)
    expect(original.length).toBe(1);
  });
});
