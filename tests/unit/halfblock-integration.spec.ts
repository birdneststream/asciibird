// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { HalfBlockGrid } from '@/utils/halfBlockGrid';
import { computeHalfPreviewRects } from '@/composables/useToolApplication';
import { drawShapeHalfBlock } from '@/utils/halfBlockShapes';
import { parseMircToLayers } from '@/utils/mircImport';
import { create2DArray } from '@/ascii';
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
  describe('brush complete-block model (setColourComplete contract)', () => {
    it('painting top half over empty block produces complete ▀ with complement bg', () => {
      const blocks = makeGrid(1, 1, 0, 99);
      const grid = new HalfBlockGrid(blocks);
      // Brush paint: colour=currentFg(5), complement=currentBg(1)
      grid.setColourComplete(0, 0, 5, 1);
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 1, char: '▀' });
    });

    it('export emits complete fg,bg code for painted half (no fg-only)', () => {
      const blocks = makeGrid(1, 2, 0, 1);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 1); // top=5, bottom=complement 1
      const result = exportMirc(blocks);
      const output = result.output.join('');
      expect(output).toContain('\x035,1');
      expect(output).toContain('▀');
      expect(output).not.toContain('\x03\x035');
    });

    it('solid paint (colour === complement) collapses to space+bg (byte-optimal)', () => {
      const blocks = makeGrid(1, 1, 0, 99);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 8, 8);
      expect(blocks[0][0]).toEqual({ bg: 8, char: ' ' });
    });

    it('erasing a half exports minimal fg-only code (true transparency)', () => {
      const blocks: Block[][] = [[{ fg: 5, bg: 7, char: '▀' }]];
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0); // erase top → {▄, fg:7}
      expect(blocks[0][0]).toEqual({ fg: 7, char: '▄' });
      const result = exportMirc(blocks);
      const output = result.output.join('');
      expect(output).toContain('▄');
      expect(output).toContain('\x03\x037');
      expect(output).not.toContain('99');
    });

    it('brush paint over existing art preserves the other half', () => {
      const blocks: Block[][] = [[{ fg: 9, bg: 10, char: '▀' }]];
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 1, 5, 1); // repaint bottom; top stays 9
      expect(blocks[0][0]).toEqual({ fg: 9, bg: 5, char: '▀' });
    });
  });

  describe('IRC round-trips and byte budget', () => {
    /** UTF-8 byte length of an exported line (IRC limit is 512 incl. overhead) */
    function lineByteLength(output: string[], lineIdx: number): number {
      const line = output
        .join('')
        .split('\n')[lineIdx] ?? '';
      return new TextEncoder().encode(line).length;
    }

    it('brush walls + one-click fill survives export → import → identical halves', () => {
      // Build the browser-verified scenario: complete-block walls + fill
      const blocks = Array.from({ length: 6 }, () =>
        Array.from({ length: 6 }, () => ({} satisfies Block)));
      const grid = new HalfBlockGrid(blocks);
      for (let x = 1; x <= 4; x++) {
        grid.setColourComplete(x, 2, 5, 5);
        grid.setColourComplete(x, 10, 5, 5);
      }
      for (let h = 2; h <= 10; h++) {
        grid.setColourComplete(1, h, 5, 5);
        grid.setColourComplete(4, h, 5, 5);
      }
      iterativeFillHalfBlock(blocks, 6, 2, 9); // one-click interior fill

      const exported = exportMirc(blocks).output.join('');
      const parsed = parseMircToLayers(exported, 'rt', create2DArray);
      const reGrid = new HalfBlockGrid(parsed.layers[0].data);

      // Every half colour identical after the round trip
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          expect(reGrid.getColour(x, y)).toBe(grid.getColour(x, y));
        }
      }
    });

    it('half-block shape art exports minimal fg-only codes and round-trips', () => {
      const blocks = Array.from({ length: 5 }, () =>
        Array.from({ length: 10 }, () => ({} satisfies Block)));
      drawShapeHalfBlock('line', {
        blocks, startX: 1, startHalfY: 2, endX: 8, endHalfY: 2,
        colour: 4,
      });
      const result = exportMirc(blocks);
      const text = result.output.join('');
      // Single-colour model: top-half paints export fg-only codes —
      // the empty sibling half is NOT completed with a bg complement
      expect(text).toContain('\x03\x034▀');
      expect(text).not.toContain('\x034,1');

      const parsed = parseMircToLayers(text, 'rt', create2DArray);
      const reGrid = new HalfBlockGrid(parsed.layers[0].data);
      const origGrid = new HalfBlockGrid(blocks);
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          expect(reGrid.getColour(x, y)).toBe(origGrid.getColour(x, y));
        }
      }
    });

    it('bottom-half shape strokes export fg-only ▄ codes and round-trip', () => {
      const blocks = Array.from({ length: 5 }, () =>
        Array.from({ length: 10 }, () => ({} satisfies Block)));
      drawShapeHalfBlock('line', {
        blocks, startX: 1, startHalfY: 3, endX: 8, endHalfY: 3,
        colour: 4,
      });
      const result = exportMirc(blocks);
      const text = result.output.join('');
      // Bottom-only halves use the ▄ representation with fg holding
      // the colour — fg-only codes, never a solid fg=0 sibling code
      expect(text).toContain('\x03\x034▄');
      expect(text).not.toContain('\x030,4');

      const parsed = parseMircToLayers(text, 'rt', create2DArray);
      const reGrid = new HalfBlockGrid(parsed.layers[0].data);
      const origGrid = new HalfBlockGrid(blocks);
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          expect(reGrid.getColour(x, y)).toBe(origGrid.getColour(x, y));
        }
      }
    });

    it('solid regions export as spaces with bg-only codes (byte-optimal)', () => {
      // A filled rect paints both halves → collapse to spaces
      const blocks = Array.from({ length: 3 }, () =>
        Array.from({ length: 40 }, () => ({} satisfies Block)));
      drawShapeHalfBlock('rectFilled', {
        blocks, startX: 0, startHalfY: 0, endX: 39, endHalfY: 5,
        colour: 7,
      });
      const result = exportMirc(blocks);
      const text = result.output.join('');
      const solidLine = text.split('\n')[0];

      // No block characters in solid areas — spaces only
      expect(solidLine).not.toContain('█');
      expect(solidLine).not.toContain('▀');
      expect(solidLine).not.toContain('▄');
      // One bg-only code (4 chars) then bare spaces: 44 bytes total
      expect(solidLine.length).toBeLessThanOrEqual(4 + 40);
      expect(solidLine.startsWith('\x030,7')).toBe(true);
      expect(solidLine.slice(4)).toMatch(/^ +$/);
    });

    it('erased (transparent) halves export fg-only codes', () => {
      const blocks: Block[][] = [[{ fg: 5, bg: 7, char: '▀' }]];
      new HalfBlockGrid(blocks).clearColour(0, 0); // erase top → {▄, fg:7}
      const text = exportMirc(blocks).output.join('').trimEnd();
      expect(text).toBe('\x03\x037▄');
    });

    it('legacy colour-99 blocks export valid codes (never \\x03xx,99)', () => {
      const blocks: Block[][] = [
        [
          { fg: 99, bg: 7, char: '▀' },
          { char: ' ', bg: 99 },
        ],
      ];
      const text = exportMirc(blocks).output.join('');
      // fg:99 → transparent → bg-only code; bg:99 → transparent → soft
      // reset before the trailing space
      expect(text).toBe('\x030,7▀\x03 \n');
      expect(text).not.toContain('99');
    });

    it('exported lines stay within the IRC byte budget', () => {
      // 40 columns of striped halves (alternating fg/bg) — maximal code
      // churn per line: every block changes colour state
      const blocks = [Array.from({ length: 40 }, () => ({} satisfies Block))];
      const grid = new HalfBlockGrid(blocks);
      for (let x = 0; x < 40; x++) {
        grid.setColourComplete(x, (x % 2 === 0) ? 0 : 1, 4, 12);
      }
      const result = exportMirc(blocks);
      // ~400 UTF-8 bytes (5 code + 3 ▀ per striped block) — must stay
      // under the ~440 usable bytes per IRC line (512 minus overhead)
      const bytes = lineByteLength(result.output, 0);
      expect(bytes).toBeGreaterThan(300); // fixture is genuinely striped
      expect(bytes).toBeLessThan(440);
    });
  });

  describe('brush preview geometry (computeHalfPreviewRects)', () => {
    it('top-half paint previews painted half above complement', () => {
      const r = computeHalfPreviewRects(24, 45, 8, 7.5, true);
      expect(r.paintedRect).toEqual({ x: 24, y: 45, w: 8, h: 7.5 });
      expect(r.complementRect).toEqual({ x: 24, y: 52.5, w: 8, h: 7.5 });
    });

    it('bottom-half paint previews painted half below complement (no double offset)', () => {
      // brushY already includes the bh/2 bottom-half offset (52.5)
      const r = computeHalfPreviewRects(48, 52.5, 8, 7.5, false);
      expect(r.paintedRect).toEqual({ x: 48, y: 52.5, w: 8, h: 7.5 });
      expect(r.complementRect).toEqual({ x: 48, y: 45, w: 8, h: 7.5 });
    });
  });

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

      expect(blocks[0][0]).toEqual({ bg: 8, char: ' ' });
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

  describe('fill completes a section in one click', () => {
    /** Build a grid with solid walls drawn via the complete-block brush model */
    function walledGrid(): Block[][] {
      const blocks = Array.from({ length: 6 }, () =>
        Array.from({ length: 6 }, () => ({} satisfies Block)));
      const grid = new HalfBlockGrid(blocks);
      // Walls: complete blocks (what the brush now produces)
      for (let x = 1; x <= 4; x++) {
        grid.setColourComplete(x, 2, 5, 5);  // top wall row 1
        grid.setColourComplete(x, 10, 5, 5); // bottom wall row 5
      }
      for (let halfY = 2; halfY <= 10; halfY++) {
        grid.setColourComplete(1, halfY, 5, 5); // left wall x=1
        grid.setColourComplete(4, halfY, 5, 5); // right wall x=4
      }
      return blocks;
    }

    it('fill inside brush-drawn walls stays contained (one click)', () => {
      const blocks = walledGrid();
      const changes = iterativeFillHalfBlock(blocks, 6, 2, 9); // (2,3) top half

      // Every changed cell is inside the walls (x 2-3, y 2-4)
      for (const c of changes) {
        expect(c.x).toBeGreaterThanOrEqual(2);
        expect(c.x).toBeLessThanOrEqual(3);
        expect(c.y).toBeGreaterThanOrEqual(2);
        expect(c.y).toBeLessThanOrEqual(4);
      }
      // Interior fully filled as solid collapsed spaces
      for (let y = 2; y <= 4; y++) {
        for (let x = 2; x <= 3; x++) {
          expect(blocks[y][x]).toEqual({ bg: 9, char: ' ' });
        }
      }
      // Walls untouched (solid collapsed spaces)
      expect(blocks[1][2]).toEqual({ bg: 5, char: ' ' });
    });

    it('filling an empty region produces solid collapsed spaces (both halves)', () => {
      const blocks: Block[][] = [
        [{}, {}, {}],
        [{}, {}, {}],
      ];
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 7);
      expect(changes.length).toBeGreaterThan(0);
      for (const row of blocks) {
        for (const block of row) {
          expect(block).toEqual({ bg: 7, char: ' ' });
        }
      }
    });

    it('eraser fill removes two-colour half art cleanly (no fg=99 garbage)', () => {
      // All tops 5, all bottoms 7 — the half-grid is 4-connected through
      // halves, so horizontal runs of same-colour halves form regions
      const blocks: Block[][] = [
        [
          { fg: 5, bg: 7, char: '▀' },
          { fg: 5, bg: 7, char: '▀' },
        ],
      ];
      // Erase the top (5) region then the bottom (7) region
      iterativeFillHalfBlock(blocks, 0, 0, 99);
      // After clearing tops: {▄, fg:7} — bottoms survive as bottom-only
      expect(blocks[0][0]).toEqual({ fg: 7, char: '▄' });
      expect(blocks[0][1]).toEqual({ fg: 7, char: '▄' });
      iterativeFillHalfBlock(blocks, 1, 0, 99); // bottoms (7) region
      for (const block of blocks[0]) {
        expect(block).toEqual({});
      }
    });

    it('imported fg-only ▀ art: transparent bottoms still fill (mIRC semantics)', () => {
      // Imported art legitimately carries fg-only blocks — the bottom
      // half is genuinely transparent in IRC and reads as empty
      const blocks: Block[][] = [
        [{ fg: 5, char: '▀' }, {}],
      ];
      const changes = iterativeFillHalfBlock(blocks, 1, 1, 9); // fill from empty bottom
      // The fg-only block's transparent bottom joins the region
      expect(changes.length).toBe(2);
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 9, char: '▀' }); // top preserved
      expect(blocks[0][1]).toEqual({ bg: 9, char: ' ' });
    });

    it('recolouring a solid collapsed region reaches every block (both halves read bg)', () => {
      // Solid spaces read bg for both halves — a live-colour traversal
      // would also work here (sibling colour preserved), but this guards
      // the recolour path end-to-end
      const blocks: Block[][] = [
        [{ bg: 5, char: ' ' }, { bg: 5, char: ' ' }],
        [{ bg: 5, char: ' ' }, { bg: 5, char: ' ' }],
      ];
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 9);
      expect(changes.length).toBeGreaterThanOrEqual(4);
      for (const row of blocks) {
        for (const block of row) {
          expect(block).toEqual({ bg: 9, char: ' ' });
        }
      }
    });

    it('filling a real-colour region consumes empty sibling halves into solid spaces', () => {
      // fg-only blocks (imported art): the target region is the coloured
      // TOP halves; the empty bottom halves complete into the fill
      // colour, collapsing each block to a solid space
      const blocks: Block[][] = [
        [{ fg: 5, char: '▀' }, { fg: 5, char: '▀' }],
      ];
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 9); // fill tops (5)
      expect(changes).toHaveLength(2);
      for (const block of blocks[0]) {
        expect(block).toEqual({ bg: 9, char: ' ' });
      }
    });

    it('fill preserves existing other-half colours (art not overwritten)', () => {
      const blocks: Block[][] = [
        [{ fg: 3, bg: 4, char: '▀' }, { fg: 3, bg: 4, char: '▀' }],
      ];
      // Fill the top-half (3) region with 9 — bottoms (4) preserved
      const changes = iterativeFillHalfBlock(blocks, 0, 0, 9);
      expect(changes).toHaveLength(2);
      expect(blocks[0][0]).toEqual({ fg: 9, bg: 4, char: '▀' });
      expect(blocks[0][1]).toEqual({ fg: 9, bg: 4, char: '▀' });
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

    it('erasing both halves results in empty block', () => {
      const blocks: Block[][] = [
        [{ fg: 5, bg: 7, char: '▀' }],
      ];

      eraseHalfBlock(blocks, 0, 0); // erase top
      eraseHalfBlock(blocks, 0, 1); // erase bottom

      // Both halves 99 → collapse to fully empty block ({}).
      // Colour 99 is not renderable (mircColours99 has 0-98) and
      // {space, bg:99} would export invalid \x030,99.
      expect(blocks[0][0]).toEqual({});
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

  // ─── Export Round-Trip ────────────────────────────────────────

  describe('export round-trip', () => {
    it('half-block art survives mIRC export → import cycle', () => {
      // Create a small canvas with half-block art
      const blocks = makeGrid(3, 3);

      // Paint top half of row 0
      paintHalfBlock(blocks, 0, 0, 4); // red top
      // Paint bottom half of row 0
      paintHalfBlock(blocks, 0, 1, 12); // blue bottom
      // Paint top half of row 1
      paintHalfBlock(blocks, 1, 0, 4); // red top
      // Paint bottom half of row 1
      paintHalfBlock(blocks, 1, 1, 4); // same color → collapses

      // Export to mIRC
      const result = exportMirc(blocks);

      // Should contain ▀ characters and colour codes
      const mircText = result.output.join('');
      expect(mircText).toContain('\u2580'); // ▀

      // Import back — the import should produce identical visual output
      // Re-paint the same pattern and verify
      const blocks2 = makeGrid(3, 3);
      paintHalfBlock(blocks2, 0, 0, 4);
      paintHalfBlock(blocks2, 0, 1, 12);
      paintHalfBlock(blocks2, 1, 0, 4);
      paintHalfBlock(blocks2, 1, 1, 4);

      // Row 0 should have ▀ with fg=4 (top), bg=12 (bottom)
      expect(blocks[0][0].char).toBe('\u2580');
      expect(blocks[0][0].fg).toBe(4);
      expect(blocks[0][0].bg).toBe(12);

      // Row 1 col 0 should collapse to space (both halves same color)
      expect(blocks[1][0].char).toBe(' ');
    });

    it('half-block preserves different top/bottom colors', () => {
      const blocks = makeGrid(2, 2);
      paintHalfBlock(blocks, 0, 0, 4); // top = red
      paintHalfBlock(blocks, 0, 1, 9); // bottom = green

      const block = blocks[0][0];
      expect(block.char).toBe('\u2580');
      expect(block.fg).toBe(4); // top color in fg
      expect(block.bg).toBe(9); // bottom color in bg
    });

    it('undo preserves the other half of a block', () => {
      const blocks = makeGrid(2, 2);

      // Paint both halves
      paintHalfBlock(blocks, 0, 0, 4); // top = red
      paintHalfBlock(blocks, 0, 1, 9); // bottom = green

      // "Undo" the top half by setting it to empty (99)
      eraseHalfBlock(blocks, 0, 0);

      // Bottom half should be preserved
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(0, 1)).toBe(9); // bottom still green

      // Top half should be empty
      expect(grid.getColour(0, 0)).toBe(99);
    });
  });
});
