// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { HalfBlockGrid } from '@/utils/halfBlockGrid';
import {
  iterativeFillHalfBlock,
  exportMirc,
} from '@/ascii';
import type { Block } from '@/types';

/**
 * Integration tests for the half-block coordinate system.
 *
 * Covers end-to-end scenarios from Gitea #54:
 *  - Brush painting at half-block granularity
 *  - Fill tool fills connected half-blocks without gaps
 *  - Export produces correct ▀ characters with proper colour codes
 *  - Eraser clears individual halves
 *  - Undo/redo snapshot verification
 */

// ─── Helpers ────────────────────────────────────────────────────────

function makeGrid(
  h: number,
  w: number,
  fg = 0,
  bg = 1,
  char = ' ',
): Block[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ fg, bg, char })),
  );
}

/** Paint a half-block and return the resulting block */
function paintHalfBlock(
  blocks: Block[][],
  x: number,
  halfY: number,
  colour: number,
): Block {
  const grid = new HalfBlockGrid(blocks);
  grid.setColour(x, halfY, colour);
  return blocks[Math.floor(halfY / 2)][x];
}

/** Erase a half-block (set to colour 99) */
function eraseHalfBlock(
  blocks: Block[][],
  x: number,
  halfY: number,
): Block {
  const grid = new HalfBlockGrid(blocks);
  grid.setColour(x, halfY, 99);
  return blocks[Math.floor(halfY / 2)][x];
}

// ─── Integration Tests ──────────────────────────────────────────────

describe('Half-block integration', () => {
  describe('brush painting at half-block granularity', () => {
    it('paints top half without affecting bottom half', () => {
      const blocks = makeGrid(1, 1, 0, 1);
      const result = paintHalfBlock(blocks, 0, 0, 5);

      expect(result.fg).toBe(5);
      expect(result.char).toBe('▀');
      expect(result.bg).toBe(1);
    });

    it('paints bottom half without affecting top half', () => {
      const blocks = makeGrid(1, 1, 3, 1);
      const result = paintHalfBlock(blocks, 0, 1, 7);

      expect(result.bg).toBe(7);
      expect(result.fg).toBe(3);
      expect(result.char).toBe('▀');
    });

    it('paints both halves of same cell with different colours', () => {
      const blocks = makeGrid(1, 1, 0, 1);
      paintHalfBlock(blocks, 0, 0, 5); // top = 5
      paintHalfBlock(blocks, 0, 1, 7); // bottom = 7

      expect(blocks[0][0]).toEqual({ fg: 5, bg: 7, char: '▀' });
    });

    it('paints both halves with same colour → collapses to space', () => {
      const blocks = makeGrid(1, 1, 0, 1);
      paintHalfBlock(blocks, 0, 0, 8); // top = 8
      paintHalfBlock(blocks, 0, 1, 8); // bottom = 8

      expect(blocks[0][0]).toEqual({ fg: 0, bg: 8, char: ' ' });
    });
  });

  describe('fill tool fills connected half-blocks without gaps', () => {
    it('fills a region of uniform blocks completely', () => {
      // 3x3 grid with all blocks having same fg and bg
      const blocks = makeGrid(3, 3, 2, 4);
      const grid = new HalfBlockGrid(blocks);

      // All top halves have colour 2 (fg), all bottom halves have colour 4 (bg)
      // Fill from top half (colour=2) with colour 9
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 9);

      // Should fill all top halves (9 cells worth)
      expect(changes.length).toBeGreaterThan(0);
      expect(changes.length).toBeLessThanOrEqual(9);

      // Verify all top halves now have colour 9
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(grid.getColour(x, y * 2)).toBe(9);
        }
      }
    });

    it('fill does not cross into different-coloured halves', () => {
      // Top halves: 5, 5 (same colour, connected)
      // Bottom halves: 3, 9 (different colours, not connected to each other)
      // Fill from top-left (top half, colour=5) with colour 7
      // Both top halves match, so both cells change
      const blocks: Block[][] = [
        [{ fg: 5, bg: 3, char: '▀' }, { fg: 5, bg: 9, char: '▀' }],
      ];

      const changes = iterativeFillHalfBlock(blocks, 0, 0, 7);

      // Both top halves are colour 5 → both get filled to 7
      expect(changes).toHaveLength(2);
      // Bottom halves (3 and 9) not affected
      expect(blocks[0][0].bg).toBe(3);
      expect(blocks[0][1].bg).toBe(9);
    });
  });

  describe('export produces correct mIRC with half-block chars', () => {
    it('exports ▀ blocks with correct fg/bg colour codes', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 7, char: '▀' }],
      ];

      const result = exportMirc(blocks);
      const output = result.output.join('');
      // Should contain the ▀ character
      expect(output).toContain('▀');
      // Should contain mIRC colour codes for fg=5 and bg=7
      expect(output).toContain('\x035,7');
    });

    it('exports mixed grid of ▀ and space blocks', () => {
      const blocks: Block[][] = [
        [
          { fg: 5, bg: 7, char: '▀' },
          { fg: 0, bg: 1, char: ' ' },
        ],
      ];

      const result = exportMirc(blocks);
      const output = result.output.join('');
      expect(output).toContain('▀');
    });
  });

  describe('eraser clears individual halves', () => {
    it('erases top half only, preserving bottom half', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 7, char: '▀' }],
      ];

      const result = eraseHalfBlock(blocks, 0, 0);
      expect(result.fg).toBe(99);
      expect(result.bg).toBe(7);
      expect(result.char).toBe('▀');
    });

    it('erases bottom half only, preserving top half', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 7, char: '▀' }],
      ];

      const result = eraseHalfBlock(blocks, 0, 1);
      expect(result.fg).toBe(5);
      expect(result.bg).toBe(99);
      expect(result.char).toBe('▀');
    });

    it('erasing both halves results in collapsed block', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 7, char: '▀' }],
      ];

      eraseHalfBlock(blocks, 0, 0); // erase top
      eraseHalfBlock(blocks, 0, 1); // erase bottom

      // Both halves 99 → tryCollapse (99 === 99) → space block with bg=99
      expect(blocks[0][0].char).toBe(' ');
      expect(blocks[0][0].bg).toBe(99);
    });
  });

  describe('undo/redo snapshot verification', () => {
    it('records correct old/new state for half-block paint', () => {
      const blocks = makeGrid(1, 1, 3, 7);
      const oldBlock = { ...blocks[0][0] };

      paintHalfBlock(blocks, 0, 0, 5);

      const newBlock = blocks[0][0];
      expect(oldBlock).toEqual({ fg: 3, bg: 7, char: ' ' });
      expect(newBlock).toEqual({ fg: 5, bg: 7, char: '▀' });

      // Simulate undo: restore old block
      blocks[0][0] = { ...oldBlock };
      expect(blocks[0][0]).toEqual({ fg: 3, bg: 7, char: ' ' });
    });

    it('records correct old/new state for half-block fill', () => {
      const blocks: Block[][] = [
        [{ fg: 2, bg: 2, char: ' ' }],
      ];
      const oldBlock = { ...blocks[0][0] };

      // Target colour is bg=2 (even halfY=0). Fill with 5.
      // Since both halves have same colour, fill spreads to both → collapse
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 5);
      expect(changes).toHaveLength(1);
      expect(changes[0].old).toEqual(oldBlock);
      expect(changes[0].new.bg).toBe(5);

      // Simulate undo: restore old block
      blocks[0][0] = { ...changes[0].old };
      expect(blocks[0][0]).toEqual({ fg: 2, bg: 2, char: ' ' });
    });
  });

  describe('▄ block backward compatibility', () => {
    it('paints over ▄ blocks correctly (normalises to ▀)', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 3, char: '▄' }],
      ];

      // For ▄ block: normaliseToUpperHalf swaps fg↔bg → fg=3, bg=5, char='▀'
      // Then setColour(0,0,7) sets fg=7
      const result = paintHalfBlock(blocks, 0, 0, 7);
      expect(result.char).toBe('▀');
      expect(result.fg).toBe(7);
      expect(result.bg).toBe(5);
    });

    it('reads correct colour from ▄ block top half', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 3, char: '▄' }],
      ];

      // ▄ block: fg=bottom=5, bg=top=3
      // getColour(0,0) normalises → even → fg=3 (was bg before swap)
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(0, 0)).toBe(3);
      expect(grid.getColour(0, 1)).toBe(5);
    });
  });

  // ─── Ragged array safety (Gitea #56) ────────────────────────────

  describe('ragged array safety', () => {
    it('getColour returns EMPTY_COLOUR for missing cell in shorter row', () => {
      // Row 0 has 2 cols, row 1 has 1 col
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: ' ' }, { fg: 0, bg: 1, char: ' ' }],
        [{ fg: 0, bg: 1, char: ' ' }],
      ];
      const grid = new HalfBlockGrid(blocks);

      // Valid cell: space block → bg holds colour
      expect(grid.getColour(0, 0)).toBe(1); // top half of (0,0) → bg=1
      // Missing cell (row 1, col 1)
      expect(grid.getColour(1, 2)).toBe(99); // top half of (1,1) — missing
    });

    it('getColour returns EMPTY_COLOUR for empty row', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: ' ' }],
        [], // empty row
      ];
      const grid = new HalfBlockGrid(blocks);

      // Valid cell in row 0: space block → bg holds colour
      expect(grid.getColour(0, 0)).toBe(1);
      // Missing cell in empty row 1
      expect(grid.getColour(0, 2)).toBe(99);
    });

    it('setColour is a no-op for missing cell', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: ' ' }],
        [], // empty row
      ];
      const grid = new HalfBlockGrid(blocks);

      // Should not throw
      grid.setColour(0, 2, 5); // row 1 is empty

      // Original block unchanged
      expect(blocks[0][0]).toEqual({ fg: 0, bg: 1, char: ' ' });
    });

    it('setColour is a no-op for shorter row out-of-bounds', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: ' ' }],
        [{ fg: 0, bg: 1, char: ' ' }],
      ];
      const grid = new HalfBlockGrid(blocks);

      // Col 5 doesn't exist — inBounds() catches this (x >= width)
      // so setColour returns at the bounds check before reaching the guard
      grid.setColour(5, 0, 5);
      // No crash, no mutation
      expect(blocks[0][0]).toEqual({ fg: 0, bg: 1, char: ' ' });
    });
  });
});
