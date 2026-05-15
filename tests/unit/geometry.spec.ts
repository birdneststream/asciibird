import { describe, it, expect } from 'vitest';
import { snapToGrid, snapDimensionToGrid } from '@/utils/geometry';

describe('snapToGrid', () => {
  it('snaps to nearest grid line', () => {
    expect(snapToGrid(4, 8)).toBe(8);
    expect(snapToGrid(11, 8)).toBe(8);
    expect(snapToGrid(12, 8)).toBe(16);
    expect(snapToGrid(5, 8)).toBe(8);
  });

  it('returns value unchanged when already on grid', () => {
    expect(snapToGrid(0, 8)).toBe(0);
    expect(snapToGrid(8, 8)).toBe(8);
    expect(snapToGrid(16, 8)).toBe(16);
    expect(snapToGrid(15, 15)).toBe(15);
    expect(snapToGrid(30, 15)).toBe(30);
  });

  it('handles negative values', () => {
    expect(snapToGrid(-3, 8)).toBe(0);
    expect(snapToGrid(-5, 8)).toBe(-8);
    expect(snapToGrid(-12, 8)).toBe(-8);
  });

  it('returns value when gridSize is 0 or negative', () => {
    expect(snapToGrid(10, 0)).toBe(10);
    expect(snapToGrid(10, -1)).toBe(10);
  });

  it('handles fractional values', () => {
    expect(snapToGrid(3.7, 8)).toBe(0);
    expect(snapToGrid(4.1, 8)).toBe(8);
    expect(snapToGrid(7.5, 15)).toBe(15); // 7.5/15=0.5, rounds to 1 → 15
    expect(snapToGrid(7.4, 15)).toBe(0); // 7.4/15=0.493, rounds to 0
  });

  it('works with blockHeight grid (15px)', () => {
    expect(snapToGrid(7, 15)).toBe(0); // 7/15=0.47, rounds to 0
    expect(snapToGrid(14, 15)).toBe(15); // 14/15=0.93, rounds to 1 → 15
    expect(snapToGrid(22, 15)).toBe(15); // 22/15=1.47, rounds to 1 → 15
    expect(snapToGrid(23, 15)).toBe(30); // 23/15=1.53, rounds to 2 → 30
    expect(snapToGrid(30, 15)).toBe(30);
  });

  it('eliminates negative zero', () => {
    const result = snapToGrid(-3, 8);
    expect(Object.is(result, -0)).toBe(false);
    expect(result).toBe(0);
  });
});

describe('snapDimensionToGrid', () => {
  it('snaps dimension to grid', () => {
    expect(snapDimensionToGrid(4, 8)).toBe(8); // 4/8=0.5, rounds to 1 → 8, min 1 unit
    expect(snapDimensionToGrid(13, 8)).toBe(16); // 13/8=1.625, rounds to 2 → 16
  });

  it('enforces minimum of 1 grid unit by default', () => {
    expect(snapDimensionToGrid(0, 8)).toBe(8);
    expect(snapDimensionToGrid(-10, 8)).toBe(8);
    expect(snapDimensionToGrid(3, 8)).toBe(8);
  });

  it('enforces custom minimum', () => {
    expect(snapDimensionToGrid(5, 8, 3)).toBe(24);
    expect(snapDimensionToGrid(0, 8, 3)).toBe(24);
  });

  it('returns value when gridSize is 0', () => {
    expect(snapDimensionToGrid(10, 0)).toBe(10);
  });

  it('works with blockHeight (15px)', () => {
    expect(snapDimensionToGrid(14, 15)).toBe(15); // snaps to 15, min 1 unit
    expect(snapDimensionToGrid(0, 15)).toBe(15);
    expect(snapDimensionToGrid(30, 15)).toBe(30);
  });
});
