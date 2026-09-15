import { describe, it, expect } from 'vitest';
import { HalfBlockGrid } from '../../../src/utils/halfBlockGrid';
import type { Block } from '../../../src/types';

/** Create a grid of empty blocks */
function makeGrid(width: number, height: number): Block[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: ' ' } as Block)),
  );
}

/** Create a grid with specific block at position */
function makeGridWith(
  width: number,
  height: number,
  x: number,
  y: number,
  block: Block,
): Block[][] {
  const grid = makeGrid(width, height);
  grid[y][x] = { ...block };
  return grid;
}

describe('HalfBlockGrid', () => {
  describe('dimensions', () => {
    it('returns correct width and height', () => {
      const grid = new HalfBlockGrid(makeGrid(5, 3));
      expect(grid.width).toBe(5);
      expect(grid.height).toBe(6); // 3 * 2
    });

    it('handles empty grid', () => {
      const grid = new HalfBlockGrid([]);
      expect(grid.width).toBe(0);
      expect(grid.height).toBe(0);
    });

    it('handles single cell grid', () => {
      const grid = new HalfBlockGrid(makeGrid(1, 1));
      expect(grid.width).toBe(1);
      expect(grid.height).toBe(2);
    });
  });

  describe('getColour', () => {
    it('returns 99 for empty block (space char)', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(grid.getColour(0, 0)).toBe(99);
      expect(grid.getColour(0, 1)).toBe(99);
    });

    it('returns 99 for out-of-bounds', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(grid.getColour(-1, 0)).toBe(99);
      expect(grid.getColour(0, -1)).toBe(99);
      expect(grid.getColour(2, 0)).toBe(99);
      expect(grid.getColour(0, 4)).toBe(99);
    });

    it('▀ top half returns fg', () => {
      const blocks = makeGridWith(2, 2, 1, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(1, 0)).toBe(5); // even y = top = fg
    });

    it('▀ bottom half returns bg', () => {
      const blocks = makeGridWith(2, 2, 1, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(1, 1)).toBe(10); // odd y = bottom = bg
    });

    it('▄ top half returns bg', () => {
      const blocks = makeGridWith(2, 2, 1, 0, {
        fg: 5, bg: 10, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(1, 0)).toBe(10); // even y = top = bg for ▄
    });

    it('▄ bottom half returns fg', () => {
      const blocks = makeGridWith(2, 2, 1, 0, {
        fg: 5, bg: 10, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(1, 1)).toBe(5); // odd y = bottom = fg for ▄
    });

    it('handles undefined fg/bg as 99', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(0, 0)).toBe(99); // fg undefined
      expect(grid.getColour(0, 1)).toBe(99); // bg undefined
    });

    it('returns bg for collapsed space block', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        char: ' ', fg: 0, bg: 7,
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getColour(0, 0)).toBe(7); // even y → bg
      expect(grid.getColour(0, 1)).toBe(7); // odd y → bg
    });
  });

  describe('setColour', () => {
    it('sets top half (even y) with ▀', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 5);
      expect(blocks[0][0].fg).toBe(5);
      expect(blocks[0][0].char).toBe('\u2580');
    });

    it('sets bottom half (odd y) with ▀', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 1, 10);
      expect(blocks[0][0].bg).toBe(10);
      expect(blocks[0][0].char).toBe('\u2580');
    });

    it('preserves other half when setting one', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 5); // top
      grid.setColour(0, 1, 10); // bottom
      expect(blocks[0][0].fg).toBe(5);
      expect(blocks[0][0].bg).toBe(10);
      expect(blocks[0][0].char).toBe('\u2580');
    });

    it('collapses to space when both halves same colour', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 7); // top
      grid.setColour(0, 1, 7); // bottom = same
      expect(blocks[0][0].char).toBe(' ');
      expect(blocks[0][0].fg).toBeUndefined();
      expect(blocks[0][0].bg).toBe(7);
    });

    it('does not collapse when halves have different colours', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 5);
      grid.setColour(0, 1, 10);
      expect(blocks[0][0].char).toBe('\u2580');
      expect(blocks[0][0].fg).toBe(5);
      expect(blocks[0][0].bg).toBe(10);
    });

    it('ignores out-of-bounds', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      expect(() => grid.setColour(-1, 0, 5)).not.toThrow();
      expect(() => grid.setColour(0, 4, 5)).not.toThrow();
    });

    it('overwrites existing colour', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 1, bg: 2, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 9); // overwrite top
      expect(blocks[0][0].fg).toBe(9);
      expect(blocks[0][0].bg).toBe(2); // preserved
    });

    it('preserves other-half colour when normalising ▄ block (top)', () => {
      // ▄ block: fg=bottom=5, bg=top=3 → after setColour top=10:
      // normalise to ▀ fg=3 bg=5, then set fg=10 → ▀ fg=10 bg=5
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 3, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 10); // paint top half
      expect(grid.getColour(0, 0)).toBe(10); // new top color
      expect(grid.getColour(0, 1)).toBe(5);  // preserved bottom color
    });

    it('preserves other-half colour when normalising ▄ block (bottom)', () => {
      // ▄ block: fg=bottom=5, bg=top=3 → after setColour bottom=10:
      // normalise to ▀ fg=3 bg=5, then set bg=10 → ▀ fg=3 bg=10
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 3, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 1, 10); // paint bottom half
      expect(grid.getColour(0, 0)).toBe(3);  // preserved top color
      expect(grid.getColour(0, 1)).toBe(10); // new bottom color
    });

    it('collapses when setting half to match other via overwrite', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 10); // top = 10, bottom already 10 → collapse
      expect(blocks[0][0].char).toBe(' ');
      expect(blocks[0][0].fg).toBeUndefined();
      expect(blocks[0][0].bg).toBe(10);
    });
  });

  describe('setColourComplete', () => {
    it('fills complement into empty other half (top paint)', () => {
      const blocks = makeGrid(2, 2); // {} blocks with char ' '
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 1); // paint top red, complement black
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 1, char: '\u2580' });
    });

    it('fills complement into empty other half (bottom paint)', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 1, 5, 2); // paint bottom, complement 2
      expect(blocks[0][0]).toEqual({ fg: 2, bg: 5, char: '\u2580' });
    });

    it('preserves existing other-half colour', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 9, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 1); // repaint top; bottom stays 10
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 10, char: '\u2580' });
    });

    it('treats explicit 99 in other half as empty (uses complement)', () => {
      // Old persisted data can carry fg=99 — must not be preserved
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 99, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 1, 5, 3); // paint bottom; top is 99 → complement
      expect(blocks[0][0]).toEqual({ fg: 3, bg: 5, char: '\u2580' });
    });

    it('collapses to space when colour equals complement', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 7, 7);
      expect(blocks[0][0]).toEqual({ bg: 7, char: ' ' });
    });

    it('collapses when painting half to match existing other half', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 1, 5, 1); // bottom = 5 = top → collapse
      expect(blocks[0][0]).toEqual({ bg: 5, char: ' ' });
    });

    it('reads other half from collapsed space block (bg preserved)', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        bg: 6, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 1); // top=5, bottom=6 (from space bg)
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 6, char: '\u2580' });
    });

    it('normalises ▄ block before completing', () => {
      // ▄: fg=bottom=5, bg=top=3
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 3, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 10, 1); // paint top=10; bottom stays 5
      expect(blocks[0][0]).toEqual({ fg: 10, bg: 5, char: '\u2580' });
    });

    it('routes colour 99 (erase request) to clear semantics', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 99, 1); // erase top
      expect(blocks[0][0]).toEqual({ fg: 7, char: '\u2584' });
    });

    it('converts regular character block to half-block representation', () => {
      // Regular char blocks read fg=top, bg=bottom in the half model
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 3, bg: 4, char: 'X',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 2); // paint top=5; bottom keeps 4
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 4, char: '\u2580' });
    });

    it('treats explicit 99 in other-half bg as empty (uses complement)', () => {
      // Legacy persisted data can carry bg=99 — must not be preserved
      const blocks = makeGridWith(2, 2, 0, 0, {
        bg: 99, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 3); // paint top; bottom is 99 → complement
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 3, char: '\u2580' });
    });

    it('ignores out-of-bounds and ragged cells', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      expect(() => grid.setColourComplete(-1, 0, 5, 1)).not.toThrow();
      expect(() => grid.setColourComplete(0, 4, 5, 1)).not.toThrow();
      const ragged: Block[][] = [[{ char: ' ' }], []];
      const raggedGrid = new HalfBlockGrid(ragged);
      expect(() => raggedGrid.setColourComplete(0, 2, 5, 1)).not.toThrow();
    });
  });

  describe('setColourPreserve', () => {
    it('leaves empty other half empty (top paint) — no complement fill', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 0, 5);
      expect(blocks[0][0]).toEqual({ fg: 5, char: '\u2580' });
      expect('bg' in blocks[0][0]).toBe(false);
    });

    it('leaves empty other half empty (bottom paint) — no complement fill', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 1, 5);
      // Bottom-only: ▄ representation with fg holding the colour —
      // exports as fg-only, empty top stays transparent
      expect(blocks[0][0]).toEqual({ fg: 5, char: '\u2584' });
      expect('bg' in blocks[0][0]).toBe(false);
    });

    it('preserves existing other-half colour', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 9, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 0, 5); // repaint top; bottom stays 10
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 10, char: '\u2580' });
    });

    it('keeps collapsed-space sibling colour when painting the top half', () => {
      // Solid region stored as {bg:7, char:' '} — getColour reads BOTH
      // halves as 7, so the sibling must survive the paint
      const blocks = makeGridWith(2, 2, 0, 0, {
        bg: 7, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 0, 5); // top=5; bottom sibling keeps 7
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 7, char: '\u2580' });
    });

    it('keeps collapsed-space sibling colour when painting the bottom half', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        bg: 7, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 1, 5); // bottom=5; top sibling keeps 7
      expect(blocks[0][0]).toEqual({ fg: 7, bg: 5, char: '\u2580' });
    });

    it('collapses to space when both halves end up the same colour', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 1, 5); // bottom = 5 = top → collapse
      expect(blocks[0][0]).toEqual({ bg: 5, char: ' ' });
    });

    it('normalises ▄ block before painting', () => {
      // ▄: fg=bottom=5, bg=top=3
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 3, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 0, 10); // paint top=10; bottom stays 5
      expect(blocks[0][0]).toEqual({ fg: 10, bg: 5, char: '\u2580' });
    });

    it('routes colour 99 (erase request) to clear semantics', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 0, 99); // erase top
      expect(blocks[0][0]).toEqual({ fg: 7, char: '\u2584' });
    });

    it('treats explicit 99 in other half as empty (stays empty)', () => {
      // Legacy persisted data can carry fg=99 — must not be preserved
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 99, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColourPreserve(0, 1, 5); // paint bottom; top is 99 → stays empty
      expect(blocks[0][0]).toEqual({ fg: 5, char: '\u2584' });
      expect('bg' in blocks[0][0]).toBe(false);
    });

    it('ignores out-of-bounds and ragged cells', () => {
      const blocks = makeGrid(2, 2);
      const grid = new HalfBlockGrid(blocks);
      expect(() => grid.setColourPreserve(-1, 0, 5)).not.toThrow();
      expect(() => grid.setColourPreserve(0, 4, 5)).not.toThrow();
      const ragged: Block[][] = [[{ char: ' ' }], []];
      const raggedGrid = new HalfBlockGrid(ragged);
      expect(() => raggedGrid.setColourPreserve(0, 2, 5)).not.toThrow();
    });
  });

  describe('clearColour', () => {
    it('erasing top half of complete block → bottom-only ▄', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      expect(blocks[0][0]).toEqual({ fg: 7, char: '\u2584' });
      expect(grid.getColour(0, 0)).toBe(99); // top now empty
      expect(grid.getColour(0, 1)).toBe(7); // bottom preserved
    });

    it('erasing bottom half of complete block → top-only ▀', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1);
      expect(blocks[0][0]).toEqual({ fg: 5, char: '\u2580' });
      expect(grid.getColour(0, 0)).toBe(5);
      expect(grid.getColour(0, 1)).toBe(99);
    });

    it('erasing both halves → fully empty block', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      grid.clearColour(0, 1);
      expect(blocks[0][0]).toEqual({});
    });

    it('erasing half of empty block stays empty', () => {
      const blocks = makeGrid(1, 1); // {char: ' '} — no colours
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      // Both halves already empty → canonical empty block
      expect(blocks[0][0]).toEqual({});
      expect(grid.getColour(0, 0)).toBe(99);
    });

    it('erasing top of collapsed space → bottom-only ▄', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        bg: 6, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      expect(blocks[0][0]).toEqual({ fg: 6, char: '\u2584' });
    });

    it('erasing bottom of collapsed space → top-only ▀', () => {
      // Space stores the solid colour in bg for BOTH halves — erasing
      // the bottom must keep the colour in the top half
      const blocks = makeGridWith(1, 1, 0, 0, {
        bg: 6, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1);
      expect(blocks[0][0]).toEqual({ fg: 6, char: '\u2580' });
      expect(grid.getColour(0, 0)).toBe(6);
      expect(grid.getColour(0, 1)).toBe(99);
    });

    it('erasing bottom of legacy space keeps bg colour (not fg)', () => {
      // Legacy {char:' ', fg:0, bg:7} — the solid colour is bg=7
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 0, bg: 7, char: ' ',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1);
      expect(blocks[0][0]).toEqual({ fg: 7, char: '\u2580' });
    });

    it('erasing top with legacy bg=99 → empty block (no surviving 99)', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 99, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      expect(blocks[0][0]).toEqual({});
    });

    it('erasing bottom with legacy fg=99 → empty block (no surviving 99)', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 99, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1);
      expect(blocks[0][0]).toEqual({});
    });

    it('erasing top of legacy all-99 block → empty block', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 99, bg: 99, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0);
      expect(blocks[0][0]).toEqual({});
    });

    it('erasing half of regular character block converts to half-block', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 3, bg: 4, char: 'X',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1); // erase bottom; top (fg=3) survives
      expect(blocks[0][0]).toEqual({ fg: 3, char: '\u2580' });
    });

    it('erasing half of ▄ bottom-only block → fully empty', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 1); // erase the bottom (the only painted half)
      expect(blocks[0][0]).toEqual({});
    });

    it('erasing top of ▄ bottom-only block keeps bottom', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, char: '\u2584',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.clearColour(0, 0); // top already empty
      expect(blocks[0][0]).toEqual({ fg: 5, char: '\u2584' });
    });

    it('ignores out-of-bounds and ragged cells', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(() => grid.clearColour(-1, 0)).not.toThrow();
      expect(() => grid.clearColour(0, 99)).not.toThrow();
      const ragged: Block[][] = [[{ char: ' ' }], []];
      const raggedGrid = new HalfBlockGrid(ragged);
      expect(() => raggedGrid.clearColour(0, 2)).not.toThrow();
    });

    it('complement 99 falls back to a real colour (completeness invariant)', () => {
      const blocks = makeGrid(1, 1);
      const grid = new HalfBlockGrid(blocks);
      grid.setColourComplete(0, 0, 5, 99); // invalid complement → 0
      expect(blocks[0][0]).toEqual({ fg: 5, bg: 0, char: '\u2580' });
    });
  });

  describe('tryCollapse both-empty rule (via setColour)', () => {
    it('setColour 99 on both halves → empty block (not space+99)', () => {
      const blocks = makeGridWith(1, 1, 0, 0, {
        fg: 5, bg: 7, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      grid.setColour(0, 0, 99);
      expect(blocks[0][0]).toEqual({ fg: 99, bg: 7, char: '\u2580' }); // intermediate
      grid.setColour(0, 1, 99);
      expect(blocks[0][0]).toEqual({}); // both 99 → empty
    });
  });

  describe('getNeighbors', () => {
    it('returns 4 neighbors for interior top-half', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      // y=2 is top half of middle row (row 1)
      const neighbors = grid.getNeighbors(1, 2);
      expect(neighbors).toHaveLength(4);
      expect(neighbors).toContainEqual({ x: 1, y: 3 }); // same-cell bottom
      expect(neighbors).toContainEqual({ x: 0, y: 2 }); // left
      expect(neighbors).toContainEqual({ x: 2, y: 2 }); // right
      expect(neighbors).toContainEqual({ x: 1, y: 1 }); // cell-above bottom
    });

    it('returns 4 neighbors for interior bottom-half', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      // y=3 is bottom half of middle row (row 1)
      const neighbors = grid.getNeighbors(1, 3);
      expect(neighbors).toHaveLength(4);
      expect(neighbors).toContainEqual({ x: 1, y: 2 }); // same-cell top
      expect(neighbors).toContainEqual({ x: 0, y: 3 }); // left
      expect(neighbors).toContainEqual({ x: 2, y: 3 }); // right
      expect(neighbors).toContainEqual({ x: 1, y: 4 }); // cell-below top
    });

    it('returns 3 neighbors at top edge (top half)', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      // y=0 is top half of first row — no cell above
      const neighbors = grid.getNeighbors(1, 0);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContainEqual({ x: 1, y: 1 }); // same-cell bottom
      expect(neighbors).toContainEqual({ x: 0, y: 0 }); // left
      expect(neighbors).toContainEqual({ x: 2, y: 0 }); // right
    });

    it('returns 3 neighbors at bottom edge (bottom half)', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      // y=5 is bottom half of last row — no cell below
      const neighbors = grid.getNeighbors(1, 5);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContainEqual({ x: 1, y: 4 }); // same-cell top
      expect(neighbors).toContainEqual({ x: 0, y: 5 }); // left
      expect(neighbors).toContainEqual({ x: 2, y: 5 }); // right
    });

    it('returns 2 neighbors at top-left corner (top half)', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      const neighbors = grid.getNeighbors(0, 0);
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContainEqual({ x: 0, y: 1 }); // same-cell bottom
      expect(neighbors).toContainEqual({ x: 1, y: 0 }); // right
    });

    it('returns 2 neighbors at bottom-right corner (bottom half)', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      const neighbors = grid.getNeighbors(2, 5);
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContainEqual({ x: 2, y: 4 }); // same-cell top
      expect(neighbors).toContainEqual({ x: 1, y: 5 }); // left
    });

    it('single cell grid returns 1 neighbor for top half', () => {
      const grid = new HalfBlockGrid(makeGrid(1, 1));
      const neighbors = grid.getNeighbors(0, 0);
      expect(neighbors).toHaveLength(1);
      expect(neighbors).toContainEqual({ x: 0, y: 1 }); // same-cell bottom
    });

    it('single cell grid returns 1 neighbor for bottom half', () => {
      const grid = new HalfBlockGrid(makeGrid(1, 1));
      const neighbors = grid.getNeighbors(0, 1);
      expect(neighbors).toHaveLength(1);
      expect(neighbors).toContainEqual({ x: 0, y: 0 }); // same-cell top
    });

    it('left edge has 3 neighbors', () => {
      const grid = new HalfBlockGrid(makeGrid(3, 3));
      const neighbors = grid.getNeighbors(0, 2);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContainEqual({ x: 0, y: 3 }); // same-cell bottom
      expect(neighbors).toContainEqual({ x: 1, y: 2 }); // right
      expect(neighbors).toContainEqual({ x: 0, y: 1 }); // above bottom
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty block', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(grid.isEmpty(0, 0)).toBe(true);
      expect(grid.isEmpty(0, 1)).toBe(true);
    });

    it('returns false for painted half', () => {
      const blocks = makeGridWith(2, 2, 0, 0, {
        fg: 5, bg: 10, char: '\u2580',
      });
      const grid = new HalfBlockGrid(blocks);
      expect(grid.isEmpty(0, 0)).toBe(false); // fg=5
      expect(grid.isEmpty(0, 1)).toBe(false); // bg=10
    });

    it('returns true for out-of-bounds', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(grid.isEmpty(-1, 0)).toBe(true);
    });
  });

  describe('getBlock', () => {
    it('returns block at full-block coordinates', () => {
      const blocks = makeGrid(2, 2);
      blocks[1][0].fg = 7;
      const grid = new HalfBlockGrid(blocks);
      expect(grid.getBlock(0, 1).fg).toBe(7);
    });

    it('returns undefined for out-of-bounds', () => {
      const grid = new HalfBlockGrid(makeGrid(2, 2));
      expect(grid.getBlock(0, 5)).toBeUndefined();
    });
  });

  describe('fromPixels', () => {
    it('converts pixel to half-block coords at 1x zoom', () => {
      // bw=8, bh=15, halfBh=7.5
      const coord = HalfBlockGrid.fromPixels(4, 3, 8, 15);
      expect(coord.x).toBe(0); // 4/8 = 0
      expect(coord.y).toBe(0); // 3/7.5 = 0.4 → 0
    });

    it('converts pixel to half-block coords for bottom half', () => {
      const coord = HalfBlockGrid.fromPixels(4, 10, 8, 15);
      expect(coord.x).toBe(0);
      expect(coord.y).toBe(1); // 10/7.5 = 1.33 → 1
    });

    it('converts pixel to second row top half', () => {
      const coord = HalfBlockGrid.fromPixels(4, 15, 8, 15);
      expect(coord.x).toBe(0);
      expect(coord.y).toBe(2); // 15/7.5 = 2 → 2
    });

    it('handles 2x zoom', () => {
      const coord = HalfBlockGrid.fromPixels(16, 15, 16, 30);
      expect(coord.x).toBe(1); // 16/16 = 1
      expect(coord.y).toBe(1); // 15/15 = 1
    });

    it('handles zero dimensions safely', () => {
      const coord = HalfBlockGrid.fromPixels(10, 10, 0, 0);
      expect(coord).toEqual({ x: 0, y: 0 });
    });
  });
});
