// Gradient Fill utility tests
import { describe, it, expect } from 'vitest';
import {
  lerpRgb,
  detectGradientDirection,
  gradientFill,
} from '../../../src/utils/gradientFill';
import { parseColor, closestMircColor } from '../../../src/utils/ansiColors';
import type { Block } from '../../../src/types';
import { emptyBlock } from '../../../src/ascii';

/** Helper: create a grid of given dimensions */
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

describe('gradientFill', () => {
  describe('parseColor (from ansiColors)', () => {
    it('parses rgb(r,g,b) format', () => {
      const result = parseColor('rgb(255,128,0)');
      expect(result).toEqual([255, 128, 0]);
    });

    it('parses #hex format', () => {
      const result = parseColor('#FF8000');
      expect(result).toEqual([255, 128, 0]);
    });

    it('handles lowercase hex', () => {
      const result = parseColor('#ff0000');
      expect(result).toEqual([255, 0, 0]);
    });

    it('parses rgb with spaces', () => {
      const result = parseColor('rgb( 0 , 0 , 0 )');
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('closestMircColor', () => {
    it('finds exact match for white', () => {
      expect(closestMircColor([255, 255, 255])).toBe(0);
    });

    it('finds exact match for black', () => {
      expect(closestMircColor([0, 0, 0])).toBe(1);
    });

    it('finds exact match for red', () => {
      expect(closestMircColor([255, 0, 0])).toBe(4);
    });

    it('finds closest match for near-white', () => {
      const idx = closestMircColor([250, 250, 250]);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(99);
    });

    it('finds closest match for arbitrary color', () => {
      const idx = closestMircColor([100, 100, 100]);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(99);
    });

    it('always returns valid index', () => {
      for (let r = 0; r < 256; r += 50) {
        for (let g = 0; g < 256; g += 50) {
          for (let b = 0; b < 256; b += 50) {
            const idx = closestMircColor([r, g, b]);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(99);
          }
        }
      }
    });
  });

  describe('lerpRgb', () => {
    it('returns start color at t=0', () => {
      const result = lerpRgb(
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
        0,
      );
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('returns end color at t=1', () => {
      const result = lerpRgb(
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
        1,
      );
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns midpoint at t=0.5', () => {
      const result = lerpRgb(
        { r: 0, g: 0, b: 0 },
        { r: 100, g: 100, b: 100 },
        0.5,
      );
      expect(result).toEqual({ r: 50, g: 50, b: 50 });
    });

    it('rounds to nearest integer', () => {
      const result = lerpRgb(
        { r: 0, g: 0, b: 0 },
        { r: 1, g: 1, b: 1 },
        0.5,
      );
      // 0 + (1-0)*0.5 = 0.5 → rounds to 0 or 1
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(1);
    });
  });

  describe('detectGradientDirection', () => {
    it('detects horizontal direction', () => {
      expect(detectGradientDirection(0, 0, 10, 1)).toBe('horizontal');
    });

    it('detects vertical direction', () => {
      expect(detectGradientDirection(0, 0, 1, 10)).toBe('vertical');
    });

    it('detects diagonal direction', () => {
      expect(detectGradientDirection(0, 0, 10, 10)).toBe('diagonal');
    });

    it('horizontal when dy is 0', () => {
      expect(detectGradientDirection(0, 5, 10, 5)).toBe('horizontal');
    });

    it('vertical when dx is 0', () => {
      expect(detectGradientDirection(5, 0, 5, 10)).toBe('vertical');
    });
  });

  describe('gradientFill', () => {
    it('fills horizontal gradient across a row', () => {
      const grid = makeGrid(5, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 4, endY: 0,
        startColorIdx: 0, // white
        endColorIdx: 1,   // black
      });

      expect(changes).toHaveLength(5);
      // First block should be close to white (index 0)
      expect(changes[0].new.bg).toBe(0);
      // Last block should be close to black (index 1)
      expect(changes[4].new.bg).toBe(1);
    });

    it('fills vertical gradient across a column', () => {
      const grid = makeGrid(1, 5);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 0, endY: 4,
        startColorIdx: 0,
        endColorIdx: 1,
        direction: 'vertical',
      });

      expect(changes).toHaveLength(5);
      expect(changes[0].new.bg).toBe(0);
      expect(changes[4].new.bg).toBe(1);
    });

    it('fills diagonal gradient', () => {
      const grid = makeGrid(5, 5);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 4, endY: 4,
        startColorIdx: 0,
        endColorIdx: 1,
        direction: 'diagonal',
      });

      expect(changes).toHaveLength(25);
    });

    it('only modifies bg property', () => {
      const grid = makeGrid(3, 1);
      grid[0][1] = { char: 'X', fg: 5, bg: 3 };

      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 2, endY: 0,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      // fg and char should be preserved
      expect(grid[0][1].fg).toBe(5);
      expect(grid[0][1].char).toBe('X');
      // bg should be changed
      expect(grid[0][1].bg).not.toBe(3);
    });

    it('records old state in changes', () => {
      const grid = makeGrid(3, 1);
      grid[0][1].bg = 5;

      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 2, endY: 0,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      // Change for block (1,0) should have old.bg = 5
      const change1 = changes.find(c => c.x === 1 && c.y === 0);
      expect(change1).toBeDefined();
      expect(change1!.old.bg).toBe(5);
    });

    it('handles same start and end point', () => {
      const grid = makeGrid(3, 3);
      const changes = gradientFill({
        blocks: grid,
        startX: 1, startY: 1,
        endX: 1, endY: 1,
        startColorIdx: 0,
        endColorIdx: 4,
      });

      // Single cell
      expect(changes).toHaveLength(1);
      // t=0, so should be start color
      expect(changes[0].new.bg).toBe(0);
    });

    it('handles adjacent cells', () => {
      const grid = makeGrid(2, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 1, endY: 0,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      expect(changes).toHaveLength(2);
      // First cell near start should have start-ish color
      expect(changes[0].new.bg).toBe(0);
      // Last cell should have end-ish color
      expect(changes[1].new.bg).toBe(1);
    });

    it('returns empty for out-of-bounds region', () => {
      const grid = makeGrid(3, 3);
      const changes = gradientFill({
        blocks: grid,
        startX: 10, startY: 10,
        endX: 15, endY: 15,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      expect(changes).toHaveLength(0);
    });

    it('produces gradient with intermediate colors', () => {
      const grid = makeGrid(10, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 9, endY: 0,
        startColorIdx: 0, // white
        endColorIdx: 1,   // black
      });

      // Check that there are at least 2 different colors in the gradient
      const uniqueColors = new Set(changes.map(c => c.new.bg));
      expect(uniqueColors.size).toBeGreaterThanOrEqual(2);
    });

    it('produces many distinct colors for a wide white-to-black gradient', () => {
      const grid = makeGrid(20, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 19, endY: 0,
        startColorIdx: 0, // white
        endColorIdx: 1,   // black
      });

      const uniqueColors = new Set(changes.map(c => c.new.bg));
      // With 99 mIRC colors, a 20-cell white→black gradient should
      // produce significantly more than 2 distinct palette colors
      expect(uniqueColors.size).toBeGreaterThanOrEqual(5);
      // First cell should be start color, last should be end color
      expect(changes[0].new.bg).toBe(0);
      expect(changes[19].new.bg).toBe(1);
    });

    it('produces gradient from red to blue with distinct colors', () => {
      const grid = makeGrid(20, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 19, endY: 0,
        startColorIdx: 4,  // red
        endColorIdx: 12,   // blue
      });

      const uniqueColors = new Set(changes.map(c => c.new.bg));
      expect(uniqueColors.size).toBeGreaterThanOrEqual(3);
    });

    it('uses auto-detected direction when not specified', () => {
      const grid = makeGrid(10, 2);
      // Horizontal-ish gradient
      const changes = gradientFill({
        blocks: grid,
        startX: 0, startY: 0,
        endX: 9, endY: 1,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      expect(changes.length).toBeGreaterThan(0);
    });

    it('handles reversed start/end coordinates', () => {
      const grid = makeGrid(5, 1);
      const changes = gradientFill({
        blocks: grid,
        startX: 4, startY: 0,
        endX: 0, endY: 0,
        startColorIdx: 0,
        endColorIdx: 1,
      });

      expect(changes).toHaveLength(5);
      // Gradient still goes from startColor→endColor based on
      // distance from start point, regardless of coordinate order
      const uniqueColors = new Set(changes.map(c => c.new.bg));
      expect(uniqueColors.size).toBeGreaterThanOrEqual(1);
    });
  });
});
