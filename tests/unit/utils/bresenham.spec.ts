import { describe, it, expect } from 'vitest';
import { bresenhamLine } from '@/utils/bresenham';

describe('bresenhamLine', () => {
  it('returns single point when start equals end', () => {
    const points = bresenhamLine(5, 5, 5, 5);
    expect(points).toEqual([{ x: 5, y: 5 }]);
  });

  it('returns correct horizontal line left to right', () => {
    const points = bresenhamLine(2, 3, 6, 3);
    expect(points).toEqual([
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
    ]);
  });

  it('returns correct horizontal line right to left', () => {
    const points = bresenhamLine(6, 3, 2, 3);
    expect(points).toEqual([
      { x: 6, y: 3 },
      { x: 5, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ]);
  });

  it('returns correct vertical line top to bottom', () => {
    const points = bresenhamLine(3, 2, 3, 5);
    expect(points).toEqual([
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
    ]);
  });

  it('returns correct vertical line bottom to top', () => {
    const points = bresenhamLine(3, 5, 3, 2);
    expect(points).toEqual([
      { x: 3, y: 5 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
    ]);
  });

  it('returns correct 45-degree diagonal (down-right)', () => {
    const points = bresenhamLine(0, 0, 3, 3);
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);
  });

  it('returns correct 45-degree diagonal (up-left)', () => {
    const points = bresenhamLine(3, 3, 0, 0);
    expect(points).toEqual([
      { x: 3, y: 3 },
      { x: 2, y: 2 },
      { x: 1, y: 1 },
      { x: 0, y: 0 },
    ]);
  });

  it('returns correct shallow slope (mostly horizontal)', () => {
    const points = bresenhamLine(0, 0, 5, 2);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 5, y: 2 });
    // Every point should be adjacent (no gaps > 1 in either axis)
    for (let i = 1; i < points.length; i++) {
      expect(Math.abs(points[i].x - points[i - 1].x)).toBeLessThanOrEqual(1);
      expect(Math.abs(points[i].y - points[i - 1].y)).toBeLessThanOrEqual(1);
    }
  });

  it('returns correct steep slope (mostly vertical)', () => {
    const points = bresenhamLine(0, 0, 2, 5);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 2, y: 5 });
    for (let i = 1; i < points.length; i++) {
      expect(Math.abs(points[i].x - points[i - 1].x)).toBeLessThanOrEqual(1);
      expect(Math.abs(points[i].y - points[i - 1].y)).toBeLessThanOrEqual(1);
    }
  });

  it('handles negative coordinates', () => {
    const points = bresenhamLine(-2, -2, 2, 2);
    expect(points).toEqual([
      { x: -2, y: -2 },
      { x: -1, y: -1 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  it('produces continuous line with no gaps', () => {
    const points = bresenhamLine(0, 0, 10, 7);
    for (let i = 1; i < points.length; i++) {
      const dx = Math.abs(points[i].x - points[i - 1].x);
      const dy = Math.abs(points[i].y - points[i - 1].y);
      // Bresenham steps at most 1 in each axis (diagonal moves allowed)
      expect(dx).toBeLessThanOrEqual(1);
      expect(dy).toBeLessThanOrEqual(1);
    }
  });

  it('covers the full range from start to end', () => {
    const points = bresenhamLine(0, 0, 20, 15);
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    expect(Math.min(...xs)).toBe(0);
    expect(Math.max(...xs)).toBe(20);
    expect(Math.min(...ys)).toBe(0);
    expect(Math.max(...ys)).toBe(15);
  });

  it('handles octant 1 (shallow, down-right)', () => {
    const points = bresenhamLine(0, 0, 7, 3);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 7, y: 3 });
    expect(points.length).toBe(8); // 7 steps + start
  });

  it('handles octant 7 (steep, up-right)', () => {
    const points = bresenhamLine(0, 5, 3, 0);
    expect(points[0]).toEqual({ x: 0, y: 5 });
    expect(points[points.length - 1]).toEqual({ x: 3, y: 0 });
  });

  it('handles octant 5 (shallow, up-left)', () => {
    const points = bresenhamLine(7, 3, 0, 0);
    expect(points[0]).toEqual({ x: 7, y: 3 });
    expect(points[points.length - 1]).toEqual({ x: 0, y: 0 });
  });

  it('handles adjacent cells (distance 1)', () => {
    const points = bresenhamLine(5, 5, 6, 6);
    expect(points).toEqual([
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ]);
  });

  it('handles knight-move pattern', () => {
    const points = bresenhamLine(0, 0, 2, 1);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 2, y: 1 });
    // Should be exactly 3 points
    expect(points.length).toBe(3);
  });

  it('handles fast diagonal stroke (simulates sparse mousemove)', () => {
    // Simulate a fast brush stroke: mouse moves 20 pixels in one event
    const points = bresenhamLine(0, 0, 20, 15);
    expect(points.length).toBeGreaterThan(20);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 20, y: 15 });
    // No gaps — every step is adjacent
    for (let i = 1; i < points.length; i++) {
      expect(Math.abs(points[i].x - points[i - 1].x)).toBeLessThanOrEqual(1);
      expect(Math.abs(points[i].y - points[i - 1].y)).toBeLessThanOrEqual(1);
    }
  });

  it('handles long horizontal stroke (simulates fast horizontal drag)', () => {
    const points = bresenhamLine(0, 5, 50, 5);
    expect(points).toHaveLength(51);
    for (let i = 0; i <= 50; i++) {
      expect(points[i]).toEqual({ x: i, y: 5 });
    }
  });
});
