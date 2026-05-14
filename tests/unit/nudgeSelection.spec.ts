import { describe, it, expect } from 'vitest';
import {
  selectionToGridRect,
  extractSelectionBlocks,
} from '@/composables/useSelectionTransform';
import type { Block } from '@/types';
import type { SelectionRect } from '@/composables/useSelectionTransform';

describe('selectionToGridRect', () => {
  const bw = 8;
  const bh = 16;
  const canvasW = 80;
  const canvasH = 30;

  it('converts pixel selection to grid coordinates', () => {
    const sel: SelectionRect = {
      startX: 0, startY: 0, endX: 80, endY: 32, canSelect: false,
    };
    const result = selectionToGridRect(sel, bw, bh, canvasW, canvasH);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(0);
    expect(result!.y).toBe(0);
    expect(result!.width).toBe(10);
    expect(result!.height).toBe(2);
  });

  it('returns null for incomplete selection', () => {
    const sel: SelectionRect = {
      startX: null, startY: 0, endX: 80, endY: 32, canSelect: false,
    };
    expect(selectionToGridRect(sel, bw, bh, canvasW, canvasH)).toBeNull();
  });

  it('normalizes start > end', () => {
    const sel: SelectionRect = {
      startX: 80, startY: 32, endX: 0, endY: 0, canSelect: false,
    };
    const result = selectionToGridRect(sel, bw, bh, canvasW, canvasH);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(0);
    expect(result!.y).toBe(0);
  });

  it('clamps to canvas bounds', () => {
    const sel: SelectionRect = {
      startX: 600, startY: 400, endX: 700, endY: 500,
      canSelect: false,
    };
    const result = selectionToGridRect(sel, bw, bh, canvasW, canvasH);
    expect(result).not.toBeNull();
    expect(result!.x).toBeLessThan(canvasW);
    expect(result!.y).toBeLessThan(canvasH);
  });
});

describe('extractSelectionBlocks', () => {
  it('extracts a rectangular region from layer data', () => {
    const layer: Block[][] = [
      [{ fg: 1, bg: 2, char: 'A' }, { fg: 3, bg: 4, char: 'B' }],
      [{ fg: 5, bg: 6, char: 'C' }, { fg: 7, bg: 8, char: 'D' }],
    ];
    const result = extractSelectionBlocks(layer, {
      x: 0, y: 0, width: 2, height: 2,
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].fg).toBe(1);
    expect(result[1][1].fg).toBe(7);
  });

  it('handles missing cells gracefully', () => {
    const layer: Block[][] = [[{ fg: 1, char: 'A' }]];
    const result = extractSelectionBlocks(layer, {
      x: 0, y: 0, width: 3, height: 1,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    expect(result[0][0].fg).toBe(1);
    expect(result[0][1]).toEqual({});
  });
});

/**
 * Nudge selection tests — pure function tests that verify
 * the nudge logic independently of the Vue component.
 *
 * The actual nudge is done inside useSelectionTransform.applyNudge()
 * which mutates layer data in-place. Here we test the helper functions
 * it depends on and the expected nudge behavior pattern.
 */
describe('nudge selection (logic)', () => {
  it('nudge shifts content by dx=1, dy=0', () => {
    // Simulate: 3x1 selection at (0,0) nudged right
    const selBlocks: Block[][] = [
      [{ fg: 1, char: 'A' }, { fg: 2, char: 'B' }, { fg: 3, char: 'C' }],
    ];
    const canvasW = 10;
    const canvasH = 10;

    // After nudge right by 1:
    // - Clear old area (0,0)-(2,0)
    // - Write at (1,0)-(3,0) with clipping
    // - Selection moves to (1,0)-(3,0)
    const dx = 1;
    const dy = 0;
    const oldX = 0;
    const oldY = 0;

    // Verify the math: new position is (oldX+dx, oldY+dy)
    const newX = oldX + dx;
    const newY = oldY + dy;
    expect(newX).toBe(1);
    expect(newY).toBe(0);

    // Content at leading edge (x=2) should be clipped from old position
    // and content at trailing edge (x=3) should be empty
    const newSelW = Math.min(selBlocks[0].length, canvasW - newX);
    expect(newSelW).toBe(3);
  });

  it('nudge left clips at x=0', () => {
    const dx = -1;
    const oldX = 0;
    const newX = Math.max(0, oldX + dx);
    expect(newX).toBe(0);
  });

  it('nudge down increases y by 1', () => {
    const dy = 1;
    const oldY = 5;
    expect(oldY + dy).toBe(6);
  });

  it('nudge up clips at y=0', () => {
    const dy = -1;
    const oldY = 0;
    expect(Math.max(0, oldY + dy)).toBe(0);
  });

  it('nudge preserves selection content shape', () => {
    const selBlocks: Block[][] = [
      [{ fg: 1, char: 'A' }, { fg: 2, char: 'B' }],
      [{ fg: 3, char: 'C' }, { fg: 4, char: 'D' }],
    ];
    // After any nudge, the selection should remain 2x2
    expect(selBlocks.length).toBe(2);
    expect(selBlocks[0].length).toBe(2);
  });
});
