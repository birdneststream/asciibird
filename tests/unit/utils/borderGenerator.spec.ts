// Border Generator utility tests
import { describe, it, expect } from 'vitest';
import {
  generateBorder,
  getBorderMinimumSize,
  BORDER_STYLES,
} from '../../../src/utils/borderGenerator';
import type { Block } from '../../../src/types';
import { emptyBlock } from '../../../src/ascii';

/** Helper: create an empty grid of given dimensions */
function makeGrid(w: number, h: number, fill?: Block): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = fill ? { ...fill } : { ...emptyBlock };
    }
  }
  return grid;
}

/** Helper: check that a block matches expected values */
function expectBlock(
  blocks: Block[][],
  x: number,
  y: number,
  expected: { char?: string; fg?: number; bg?: number },
): void {
  const block = blocks[y]?.[x];
  expect(block).toBeDefined();
  if (expected.char !== undefined) {
    expect(block.char).toBe(expected.char);
  }
  if (expected.fg !== undefined) {
    expect(block.fg).toBe(expected.fg);
  }
  if (expected.bg !== undefined) {
    expect(block.bg).toBe(expected.bg);
  }
}

describe('borderGenerator', () => {
  describe('getBorderMinimumSize', () => {
    it('returns minimum size for padding 0', () => {
      const { minW, minH } = getBorderMinimumSize(0);
      expect(minW).toBe(3);
      expect(minH).toBe(3);
    });

    it('returns minimum size for padding 1', () => {
      const { minW, minH } = getBorderMinimumSize(1);
      expect(minW).toBe(5);
      expect(minH).toBe(5);
    });

    it('returns minimum size for padding 2', () => {
      const { minW, minH } = getBorderMinimumSize(2);
      expect(minW).toBe(7);
      expect(minH).toBe(7);
    });
  });

  describe('BORDER_STYLES', () => {
    it('has 7 predefined styles', () => {
      const keys = Object.keys(BORDER_STYLES);
      expect(keys).toHaveLength(7);
    });

    it('each style has all 8 character positions', () => {
      for (const [name, chars] of Object.entries(BORDER_STYLES)) {
        expect(chars.tl).toBeTruthy();
        expect(chars.t).toBeTruthy();
        expect(chars.tr).toBeTruthy();
        expect(chars.l).toBeTruthy();
        expect(chars.r).toBeTruthy();
        expect(chars.bl).toBeTruthy();
        expect(chars.b).toBeTruthy();
        expect(chars.br).toBeTruthy();
      }
    });
  });

  describe('generateBorder — expand mode', () => {
    it('expands a 3x3 grid with single-line border', () => {
      const grid = makeGrid(3, 3, { char: 'X', fg: 1, bg: 0 });
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'single',
        fg: 5, bg: 1,
        padding: 0,
        expand: true,
      });

      // Expanded: 5x5 (3 + 1 border on each side)
      expect(result.width).toBe(5);
      expect(result.height).toBe(5);
      expect(result.offsetX).toBe(1);
      expect(result.offsetY).toBe(1);

      // Check corners
      expectBlock(result.blocks, 0, 0, { char: '┌', fg: 5, bg: 1 });
      expectBlock(result.blocks, 4, 0, { char: '┐', fg: 5, bg: 1 });
      expectBlock(result.blocks, 0, 4, { char: '└', fg: 5, bg: 1 });
      expectBlock(result.blocks, 4, 4, { char: '┘', fg: 5, bg: 1 });

      // Check edges
      expectBlock(result.blocks, 1, 0, { char: '─' });
      expectBlock(result.blocks, 0, 1, { char: '│' });
      expectBlock(result.blocks, 4, 1, { char: '│' });
      expectBlock(result.blocks, 1, 4, { char: '─' });

      // Check content is preserved with offset
      expectBlock(result.blocks, 1, 1, { char: 'X', fg: 1, bg: 0 });
      expectBlock(result.blocks, 3, 3, { char: 'X', fg: 1, bg: 0 });
    });

    it('expands with padding 1', () => {
      const grid = makeGrid(3, 3, { char: 'A', fg: 2, bg: 3 });
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'single',
        fg: 0, bg: 1,
        padding: 1,
        expand: true,
      });

      // Expanded: 3 + 2*(1+1) = 7
      expect(result.width).toBe(7);
      expect(result.height).toBe(7);
      expect(result.offsetX).toBe(2);
      expect(result.offsetY).toBe(2);

      // Content at offset position
      expectBlock(result.blocks, 2, 2, { char: 'A', fg: 2, bg: 3 });
      expectBlock(result.blocks, 4, 4, { char: 'A', fg: 2, bg: 3 });

      // Padding cells are empty
      const paddingBlock = result.blocks[1]?.[1];
      expect(paddingBlock).toBeDefined();
      expect(paddingBlock.char).toBeUndefined();
    });

    it('double-line border uses correct characters', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'double',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      expectBlock(result.blocks, 0, 0, { char: '╔' });
      expectBlock(result.blocks, 4, 0, { char: '╗' });
      expectBlock(result.blocks, 0, 4, { char: '╚' });
      expectBlock(result.blocks, 4, 4, { char: '╝' });
      expectBlock(result.blocks, 2, 0, { char: '═' });
      expectBlock(result.blocks, 0, 2, { char: '║' });
    });

    it('rounded border uses correct characters', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'rounded',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      expectBlock(result.blocks, 0, 0, { char: '╭' });
      expectBlock(result.blocks, 4, 0, { char: '╮' });
      expectBlock(result.blocks, 0, 4, { char: '╰' });
      expectBlock(result.blocks, 4, 4, { char: '╯' });
    });

    it('thick (solid block) border fills everything', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'thick',
        fg: 1, bg: 0,
        padding: 0,
        expand: true,
      });

      // All border positions should have █
      expectBlock(result.blocks, 0, 0, { char: '█' });
      expectBlock(result.blocks, 2, 0, { char: '█' });
      expectBlock(result.blocks, 0, 2, { char: '█' });
    });

    it('hash border uses # characters', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'hash',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      expectBlock(result.blocks, 0, 0, { char: '#' });
      expectBlock(result.blocks, 2, 0, { char: '#' });
    });

    it('star border uses * and ~ characters', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'star',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      // Corners are *
      expectBlock(result.blocks, 0, 0, { char: '*' });
      expectBlock(result.blocks, 4, 0, { char: '*' });
      // Top/bottom edges are ~
      expectBlock(result.blocks, 2, 0, { char: '~' }); // top edge
      expectBlock(result.blocks, 2, 4, { char: '~' }); // bottom edge
      // Side edges are *
      expectBlock(result.blocks, 0, 2, { char: '*' }); // left edge
      expectBlock(result.blocks, 4, 2, { char: '*' }); // right edge
    });

    it('custom border uses provided characters', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'custom',
        customChars: {
          tl: '<', t: '=', tr: '>',
          l: '|', r: '|',
          bl: '<', b: '=', br: '>',
        },
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      expectBlock(result.blocks, 0, 0, { char: '<' });
      expectBlock(result.blocks, 4, 0, { char: '>' });
      expectBlock(result.blocks, 2, 0, { char: '=' });
      expectBlock(result.blocks, 0, 2, { char: '|' });
    });

    it('custom border falls back to single when no chars provided', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'custom',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      // Should fall back to single-line chars
      expectBlock(result.blocks, 0, 0, { char: '┌' });
    });

    it('does not mutate the input grid', () => {
      const grid = makeGrid(3, 3, { char: 'X', fg: 1, bg: 0 });
      const original = JSON.stringify(grid);
      generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'single',
        fg: 5, bg: 1,
        padding: 0,
        expand: true,
      });
      expect(JSON.stringify(grid)).toBe(original);
    });
  });

  describe('generateBorder — overlay mode', () => {
    it('draws border over existing content', () => {
      const grid = makeGrid(5, 5, { char: 'X', fg: 1, bg: 0 });
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 5, h: 5,
        style: 'single',
        fg: 5, bg: 1,
        padding: 0,
        expand: false,
      });

      // Same dimensions — no expansion
      expect(result.width).toBe(5);
      expect(result.height).toBe(5);
      expect(result.offsetX).toBe(0);
      expect(result.offsetY).toBe(0);

      // Border drawn over existing content
      expectBlock(result.blocks, 0, 0, { char: '┌', fg: 5, bg: 1 });
      expectBlock(result.blocks, 4, 0, { char: '┐', fg: 5, bg: 1 });

      // Inner content preserved
      expectBlock(result.blocks, 2, 2, { char: 'X', fg: 1, bg: 0 });
    });

    it('draws border at specific region coordinates', () => {
      const grid = makeGrid(8, 6);
      const result = generateBorder({
        blocks: grid,
        x: 2, y: 1, w: 4, h: 3,
        style: 'double',
        fg: 0, bg: 1,
        padding: 0,
        expand: false,
      });

      // Border at (2,1) to (5,3)
      expectBlock(result.blocks, 2, 1, { char: '╔' });
      expectBlock(result.blocks, 5, 1, { char: '╗' });
      expectBlock(result.blocks, 2, 3, { char: '╚' });
      expectBlock(result.blocks, 5, 3, { char: '╝' });

      // Outside border is untouched
      expectBlock(result.blocks, 0, 0, {});
      expectBlock(result.blocks, 7, 5, {});
    });

    it('returns original grid if region too small', () => {
      const grid = makeGrid(3, 3, { char: 'X', fg: 1, bg: 0 });
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 1, h: 1,
        style: 'single',
        fg: 0, bg: 1,
        padding: 0,
        expand: false,
      });

      // No border drawn — region too small
      expect(result.width).toBe(3);
      expect(result.height).toBe(3);
      // Content unchanged
      expectBlock(result.blocks, 0, 0, { char: 'X', fg: 1, bg: 0 });
    });
  });

  describe('edge cases', () => {
    it('handles 1x1 grid in expand mode', () => {
      const grid = makeGrid(1, 1, { char: 'A', fg: 1, bg: 0 });
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 1, h: 1,
        style: 'single',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      // 1x1 → 3x3 with border
      expect(result.width).toBe(3);
      expect(result.height).toBe(3);
      expectBlock(result.blocks, 0, 0, { char: '┌' });
      expectBlock(result.blocks, 1, 1, { char: 'A', fg: 1, bg: 0 });
    });

    it('handles empty grid', () => {
      const grid: Block[][] = [];
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 0, h: 0,
        style: 'single',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      // 0 + 2*margin = 2x2
      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    });

    it('handles non-rectangular (jagged) grid in expand mode', () => {
      const grid: Block[][] = [
        [{ char: 'A', fg: 1, bg: 0 }],
        [{ char: 'B', fg: 2, bg: 1 }, { char: 'C', fg: 3, bg: 2 }],
      ];
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 2, h: 2,
        style: 'single',
        fg: 0, bg: 1,
        padding: 0,
        expand: true,
      });

      // Max width is 2, so expanded = 2 + 2 = 4
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });

    it('handles padding 2', () => {
      const grid = makeGrid(3, 3);
      const result = generateBorder({
        blocks: grid,
        x: 0, y: 0, w: 3, h: 3,
        style: 'single',
        fg: 0, bg: 1,
        padding: 2,
        expand: true,
      });

      // 3 + 2*(2+1) = 9
      expect(result.width).toBe(9);
      expect(result.height).toBe(9);
      expect(result.offsetX).toBe(3);
      expect(result.offsetY).toBe(3);
    });
  });
});
