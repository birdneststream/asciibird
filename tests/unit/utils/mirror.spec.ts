// Tests for src/utils/mirror.ts
// getMirrorPositions — mirror-aware position calculation utility

import { describe, it, expect } from 'vitest';
import {
  getMirrorPositions,
  applyMirrored,
  applyMirroredHalfBlock,
} from '@/utils/mirror';
import type { Position } from '@/utils/mirror';

// ─── No mirroring ─────────────────────────────────────────────────

describe('getMirrorPositions — no mirroring', () => {
  it('returns only the original position when both mirrors are off', () => {
    const result = getMirrorPositions(5, 3, 80, 25, false, false);

    expect(result).toEqual([{ x: 5, y: 3 }]);
    expect(result).toHaveLength(1);
  });

  it('returns position at (0, 0)', () => {
    const result = getMirrorPositions(0, 0, 80, 25, false, false);

    expect(result).toEqual([{ x: 0, y: 0 }]);
  });

  it('returns position at max boundary', () => {
    const result = getMirrorPositions(79, 24, 80, 25, false, false);

    expect(result).toEqual([{ x: 79, y: 24 }]);
  });
});

// ─── Mirror X only ────────────────────────────────────────────────

describe('getMirrorPositions — mirror X only', () => {
  it('returns original and mirrored X position', () => {
    const result = getMirrorPositions(10, 5, 80, 25, true, false);

    expect(result).toContainEqual({ x: 10, y: 5 });
    expect(result).toContainEqual({ x: 70, y: 5 }); // 80 - 10
    expect(result).toHaveLength(2);
  });

  it('mirrors position at x=0', () => {
    const result = getMirrorPositions(0, 5, 80, 25, true, false);

    expect(result).toContainEqual({ x: 0, y: 5 });
    expect(result).toContainEqual({ x: 80, y: 5 });
  });

  it('mirrors position at center of even-width canvas', () => {
    // Center of 80-wide canvas is 40
    const result = getMirrorPositions(40, 5, 80, 25, true, false);

    // 80 - 40 = 40, so mirrored is same position → deduplicated
    expect(result).toEqual([{ x: 40, y: 5 }]);
    expect(result).toHaveLength(1);
  });

  it('mirrors position at center of odd-width canvas', () => {
    // Center of 81-wide canvas is 40, mirror is 41
    const result = getMirrorPositions(40, 5, 81, 25, true, false);

    expect(result).toContainEqual({ x: 40, y: 5 });
    expect(result).toContainEqual({ x: 41, y: 5 }); // 81 - 40
    expect(result).toHaveLength(2);
  });
});

// ─── Mirror Y only ────────────────────────────────────────────────

describe('getMirrorPositions — mirror Y only', () => {
  it('returns original and mirrored Y position', () => {
    const result = getMirrorPositions(5, 10, 80, 25, false, true);

    expect(result).toContainEqual({ x: 5, y: 10 });
    expect(result).toContainEqual({ x: 5, y: 15 }); // 25 - 10
    expect(result).toHaveLength(2);
  });

  it('mirrors position at y=0', () => {
    const result = getMirrorPositions(5, 0, 80, 25, false, true);

    expect(result).toContainEqual({ x: 5, y: 0 });
    expect(result).toContainEqual({ x: 5, y: 25 });
  });

  it('mirrors position at center of even-height canvas', () => {
    const result = getMirrorPositions(5, 12, 80, 24, false, true);

    // 24 - 12 = 12, same position → deduplicated
    expect(result).toEqual([{ x: 5, y: 12 }]);
    expect(result).toHaveLength(1);
  });
});

// ─── Both mirrors ─────────────────────────────────────────────────

describe('getMirrorPositions — both mirrors', () => {
  it('returns 4 positions when both mirrors are on', () => {
    const result = getMirrorPositions(10, 5, 80, 25, true, true);

    expect(result).toContainEqual({ x: 10, y: 5 });   // original
    expect(result).toContainEqual({ x: 70, y: 5 });   // 80-10, y
    expect(result).toContainEqual({ x: 10, y: 20 });  // x, 25-5
    expect(result).toContainEqual({ x: 70, y: 20 });  // 80-10, 25-5
    expect(result).toHaveLength(4);
  });

  it('deduplicates when original is at center', () => {
    // Center of 80x25: 40, 12 → mirrors produce duplicates
    const result = getMirrorPositions(40, 12, 80, 24, true, true);

    // 80-40=40 (same x), 24-12=12 (same y) → all 4 positions collapse to 1
    expect(result).toEqual([{ x: 40, y: 12 }]);
    expect(result).toHaveLength(1);
  });

  it('deduplicates center-x with off-center y', () => {
    // x=40 (center), y=5 (off-center)
    const result = getMirrorPositions(40, 5, 80, 24, true, true);

    // Original: (40, 5)
    // Mirror X: (40, 5) — same, deduped
    // Mirror Y: (40, 19) — unique (24-5=19)
    // Both:     (40, 19) — same as mirrorY, deduped
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ x: 40, y: 5 });
    expect(result).toContainEqual({ x: 40, y: 19 });
  });

  it('deduplicates center-y with off-center x', () => {
    // x=10 (off-center), y=12 (center)
    const result = getMirrorPositions(10, 12, 80, 24, true, true);

    // Original: (10, 12)
    // Mirror X: (70, 12) — unique
    // Mirror Y: (10, 12) — same as original, deduped
    // Both:     (70, 12) — same as mirrorX, deduped
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ x: 10, y: 12 });
    expect(result).toContainEqual({ x: 70, y: 12 });
  });
});

// ─── Edge cases ───────────────────────────────────────────────────

describe('getMirrorPositions — edge cases', () => {
  it('handles small 1x1 canvas with no mirrors', () => {
    const result = getMirrorPositions(0, 0, 1, 1, false, false);
    expect(result).toEqual([{ x: 0, y: 0 }]);
  });

  it('handles small 1x1 canvas with both mirrors (center dedup)', () => {
    const result = getMirrorPositions(0, 0, 1, 1, true, true);
    // 1-0=1 for both, but original is (0,0)
    // MirrorX: (1, 0)
    // MirrorY: (0, 1)
    // Both:    (1, 1)
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({ x: 0, y: 0 });
    expect(result).toContainEqual({ x: 1, y: 0 });
    expect(result).toContainEqual({ x: 0, y: 1 });
    expect(result).toContainEqual({ x: 1, y: 1 });
  });

  it('handles 2x2 canvas with both mirrors', () => {
    // Position (0, 0) on 2x2 canvas
    const result = getMirrorPositions(0, 0, 2, 2, true, true);

    // MirrorX: (2, 0)
    // MirrorY: (0, 2)
    // Both:    (2, 2)
    expect(result).toHaveLength(4);
  });

  it('handles large canvas dimensions', () => {
    const result = getMirrorPositions(200, 100, 500, 300, true, true);

    expect(result).toContainEqual({ x: 200, y: 100 });
    expect(result).toContainEqual({ x: 300, y: 100 }); // 500-200
    expect(result).toContainEqual({ x: 200, y: 200 }); // 300-100
    expect(result).toContainEqual({ x: 300, y: 200 });
    expect(result).toHaveLength(4);
  });

  it('preserves position object structure', () => {
    const result = getMirrorPositions(5, 3, 80, 25, false, false);
    const pos = result[0];

    expect(pos).toHaveProperty('x', 5);
    expect(pos).toHaveProperty('y', 3);
    expect(Object.keys(pos)).toHaveLength(2);
  });

  it('handles position near edge with mirrorX', () => {
    // x=79 on width 80 → mirrorX = 80-79 = 1
    const result = getMirrorPositions(79, 0, 80, 25, true, false);

    expect(result).toContainEqual({ x: 79, y: 0 });
    expect(result).toContainEqual({ x: 1, y: 0 });
  });

  it('handles position at canvas corner with both mirrors', () => {
    const result = getMirrorPositions(0, 0, 80, 25, true, true);

    expect(result).toContainEqual({ x: 0, y: 0 });
    expect(result).toContainEqual({ x: 80, y: 0 });
    expect(result).toContainEqual({ x: 0, y: 25 });
    expect(result).toContainEqual({ x: 80, y: 25 });
    expect(result).toHaveLength(4);
  });

  it('does not produce duplicates when all 4 positions are unique', () => {
    const result = getMirrorPositions(5, 3, 80, 25, true, true);

    const keys = result.map(p => `${p.x},${p.y}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(result.length);
  });
});

// ─── Half-Block Mirror ───────────────────────────────────────────

describe('applyMirroredHalfBlock', () => {
  it('does nothing when both mirrors are off', () => {
    const positions: Array<[number, number, number]> = [];
    applyMirroredHalfBlock(5, 3, 80, 25, false, false, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    expect(positions).toHaveLength(0);
  });

  it('mirrors X at half-block level', () => {
    const positions: Array<[number, number, number]> = [];
    applyMirroredHalfBlock(5, 3, 80, 25, true, false, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    // Mirror X: x=80-5=75, halfY stays 3, blockY=1
    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual([75, 3, 1]);
  });

  it('mirrors Y at double resolution', () => {
    const positions: Array<[number, number, number]> = [];
    // height=25, halfHeight=50, halfY=3 → mirrored: 50-3-1=46
    applyMirroredHalfBlock(5, 3, 80, 25, false, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual([5, 46, 23]);
  });

  it('mirrors both X and Y at half-block level', () => {
    const positions: Array<[number, number, number]> = [];
    applyMirroredHalfBlock(5, 3, 80, 25, true, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    // MirrorX: (75, 3, 1)
    // MirrorY: (5, 46, 23)
    // Both:    (75, 46, 23)
    expect(positions).toHaveLength(3);
    expect(positions).toContainEqual([75, 3, 1]);
    expect(positions).toContainEqual([5, 46, 23]);
    expect(positions).toContainEqual([75, 46, 23]);
  });

  it('deduplicates when original is at center', () => {
    const positions: Array<[number, number, number]> = [];
    // 80-wide canvas center at x=40
    // 25-high canvas → halfHeight=50, center at halfY=24/25
    applyMirroredHalfBlock(40, 25, 80, 25, true, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    // MirrorX: 80-40=40 (same x) → deduped
    // MirrorY: 50-25-1=24 (different halfY)
    // Both:    (40, 24) — same as mirrorY deduped
    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual([40, 24, 12]);
  });

  it('skips out-of-bounds mirror positions', () => {
    const positions: Array<[number, number, number]> = [];
    // x=0 on width 1 → mirrorX = 1-0=1, which is out of bounds (>=1)
    applyMirroredHalfBlock(0, 0, 1, 1, true, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    // MirrorX: (1, 0) → x=1 >= width=1, skip
    // MirrorY: (0, 1) → halfY=1, blockY=0, valid (0 < height=1 * 2)
    // Both: (1, 1) → x=1 >= width, skip
    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual([0, 1, 0]);
  });

  it('correctly computes blockY from halfY', () => {
    const positions: Array<[number, number, number]> = [];
    // halfY=0 → blockY=0 (top half of row 0)
    // halfY=1 → blockY=0 (bottom half of row 0)
    // halfY=2 → blockY=1 (top half of row 1)
    // halfY=3 → blockY=1 (bottom half of row 1)
    applyMirroredHalfBlock(5, 0, 80, 25, false, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    // MirrorY: halfHeight=50, mirrored=50-0-1=49, blockY=24
    expect(positions).toHaveLength(1);
    expect(positions[0]).toEqual([5, 49, 24]);
  });

  it('handles top-half painting at row 0 with mirror Y', () => {
    const positions: Array<[number, number, number]> = [];
    // Painting top half of row 0: halfY=0
    // MirrorY: 50-0-1=49 → bottom half of row 24
    applyMirroredHalfBlock(5, 0, 80, 25, false, true, (mx, mHalfY, mBlockY) => {
      positions.push([mx, mHalfY, mBlockY]);
    });
    expect(positions).toHaveLength(1);
    expect(positions[0][1]).toBe(49); // bottom half of last row
    expect(positions[0][2]).toBe(24); // last block row
  });
});
