import { describe, it, expect, vi } from 'vitest';
import { getMirrorPositions, applyMirrored } from '../../src/utils/mirror';

// ─── getMirrorPositions ──────────────────────────────────────

describe('getMirrorPositions', () => {
  it('returns only the original position when no mirrors', () => {
    const result = getMirrorPositions(3, 5, 80, 24, false, false);
    expect(result).toEqual([{ x: 3, y: 5 }]);
  });

  it('returns original + mirrorX position', () => {
    const result = getMirrorPositions(3, 5, 80, 24, true, false);
    expect(result).toEqual([
      { x: 3, y: 5 },
      { x: 77, y: 5 }, // 80 - 3
    ]);
  });

  it('returns original + mirrorY position', () => {
    const result = getMirrorPositions(3, 5, 80, 24, false, true);
    expect(result).toEqual([
      { x: 3, y: 5 },
      { x: 3, y: 19 }, // 24 - 5
    ]);
  });

  it('returns all four positions with both mirrors', () => {
    const result = getMirrorPositions(3, 5, 80, 24, true, true);
    expect(result).toEqual([
      { x: 3, y: 5 },
      { x: 77, y: 5 },  // 80 - 3
      { x: 3, y: 19 },   // 24 - 5
      { x: 77, y: 19 },  // both
    ]);
  });

  it('deduplicates center position on even-width canvas', () => {
    // Width=80, x=40 → mirrorX = 80-40 = 40 (same as original)
    const result = getMirrorPositions(40, 5, 80, 24, true, false);
    expect(result).toEqual([{ x: 40, y: 5 }]);
  });

  it('deduplicates center position on even-height canvas', () => {
    // Height=24, y=12 → mirrorY = 24-12 = 12 (same as original)
    const result = getMirrorPositions(3, 12, 80, 24, false, true);
    expect(result).toEqual([{ x: 3, y: 12 }]);
  });

  it('deduplicates all four at exact center', () => {
    const result = getMirrorPositions(40, 12, 80, 24, true, true);
    expect(result).toEqual([{ x: 40, y: 12 }]);
  });
});

// ─── applyMirrored ───────────────────────────────────────────

describe('applyMirrored', () => {
  it('does not call callback when both mirrors are off', () => {
    const cb = vi.fn();
    applyMirrored(3, 5, 80, 24, false, false, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('calls callback once for mirrorX only', () => {
    const cb = vi.fn();
    applyMirrored(3, 5, 80, 24, true, false, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(77, 5);
  });

  it('calls callback once for mirrorY only', () => {
    const cb = vi.fn();
    applyMirrored(3, 5, 80, 24, false, true, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(3, 19);
  });

  it('calls callback for all three mirror positions', () => {
    const positions: Array<[number, number]> = [];
    applyMirrored(3, 5, 80, 24, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([
      [77, 5],
      [3, 19],
      [77, 19],
    ]);
  });

  it('deduplicates center position on even-width canvas', () => {
    const cb = vi.fn();
    // x=40 → mirrorX = 80-40 = 40 (same x)
    applyMirrored(40, 5, 80, 24, true, false, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('deduplicates center position on even-height canvas', () => {
    const cb = vi.fn();
    // y=12 → mirrorY = 24-12 = 12 (same y)
    applyMirrored(3, 12, 80, 24, false, true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('deduplicates exact center with both mirrors', () => {
    const cb = vi.fn();
    applyMirrored(40, 12, 80, 24, true, true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('skips out-of-bounds mirror position (x=0 on width grid)', () => {
    const cb = vi.fn();
    // x=0 → mirrorX = 80-0 = 80, which is out of bounds (0-indexed: 0..79)
    applyMirrored(0, 5, 80, 24, true, false, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('skips out-of-bounds mirror position (y=0 on height grid)', () => {
    const cb = vi.fn();
    // y=0 → mirrorY = 24-0 = 24, which is out of bounds (0-indexed: 0..23)
    applyMirrored(3, 0, 80, 24, false, true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('handles x=1 → mirror at last column (width-1)', () => {
    const cb = vi.fn();
    // x=1 → mirrorX = 80-1 = 79 (valid last column)
    applyMirrored(1, 5, 80, 24, true, false, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(79, 5);
  });

  it('handles y=1 → mirror at last row (height-1)', () => {
    const cb = vi.fn();
    applyMirrored(3, 1, 80, 24, false, true, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(3, 23);
  });

  it('skips mirrorX when out of bounds but applies mirrorY', () => {
    const positions: Array<[number, number]> = [];
    applyMirrored(0, 5, 80, 24, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    // mirrorX: 80-0=80 (out of bounds, skipped)
    // mirrorY: 24-5=19 (valid)
    // both: 80,19 (out of bounds x, skipped)
    expect(positions).toEqual([[0, 19]]);
  });

  it('works with odd-dimension grids', () => {
    const positions: Array<[number, number]> = [];
    // 7x5 grid, position (2, 1)
    // mirrorX: 7-2=5, mirrorY: 5-1=4, both: (5,4)
    applyMirrored(2, 1, 7, 5, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([
      [5, 1],
      [2, 4],
      [5, 4],
    ]);
  });

  it('works with small 1x1 grid', () => {
    const cb = vi.fn();
    // Only cell (0,0). mirrorX: 1-0=1 (out of bounds)
    applyMirrored(0, 0, 1, 1, true, true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('works with 2x2 grid', () => {
    const positions: Array<[number, number]> = [];
    // Cell (0,0). mirrorX: 2-0=2 (out of bounds). Same for mirrorY and both.
    applyMirrored(0, 0, 2, 2, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([]);
  });

  it('handles 2x2 grid at center (1,1)', () => {
    const positions: Array<[number, number]> = [];
    // Cell (1,1). mirrorX: 2-1=1 (same, deduped). mirrorY: 2-1=1 (same).
    applyMirrored(1, 1, 2, 2, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([]);
  });

  it('handles 3x3 grid at corner (0,0)', () => {
    const positions: Array<[number, number]> = [];
    // mirrorX: 3-0=3 (out of bounds). mirrorY: 3-0=3 (out of bounds).
    applyMirrored(0, 0, 3, 3, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([]);
  });

  it('handles 3x3 grid at (1,0)', () => {
    const positions: Array<[number, number]> = [];
    // mirrorX: 3-1=2, mirrorY: 3-0=3 (out of bounds)
    applyMirrored(1, 0, 3, 3, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([[2, 0]]);
  });

  it('handles 3x3 grid at (1,1)', () => {
    const positions: Array<[number, number]> = [];
    // mirrorX: 3-1=2, mirrorY: 3-1=2, both: (2,2)
    applyMirrored(1, 1, 3, 3, true, true, (mx, my) => {
      positions.push([mx, my]);
    });
    expect(positions).toEqual([
      [2, 1],
      [1, 2],
      [2, 2],
    ]);
  });
});
