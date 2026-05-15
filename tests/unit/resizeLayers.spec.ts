import { describe, it, expect } from 'vitest';
import { resizeLayers } from '../../src/utils/resizeLayers';
import type { Block, Layer } from '../../src/types';

// ─── Helpers ────────────────────────────────────────────────────

/** Create a block with distinct fg value for tracking */
function fg(v: number): Block {
  return { fg: v, bg: 0, char: String(v) };
}

/** Create a single layer with the given block data */
function makeLayer(
  data: Block[][],
  label = 'test',
): Layer {
  return {
    label,
    visible: true,
    width: data[0]?.length ?? 0,
    height: data.length,
    data,
  };
}

// ─── resizeLayers ────────────────────────────────────────────────

describe('resizeLayers', () => {
  // ─── Input validation ──────────────────────────────────────────

  it('throws RangeError for width < 1', () => {
    const layers = [makeLayer([[]])];
    expect(() => resizeLayers(layers, 0, 5)).toThrow(RangeError);
  });

  it('throws RangeError for height < 1', () => {
    const layers = [makeLayer([[]])];
    expect(() => resizeLayers(layers, 5, 0)).toThrow(RangeError);
  });

  it('throws RangeError for negative dimensions', () => {
    const layers = [makeLayer([[]])];
    expect(() => resizeLayers(layers, -1, 3)).toThrow(RangeError);
    expect(() => resizeLayers(layers, 3, -1)).toThrow(RangeError);
  });

  // ─── Same size — identity (cloned) ─────────────────────────────

  it('returns cloned layers when dimensions are unchanged', () => {
    const original = [makeLayer([[fg(1), fg(2)], [fg(3), fg(4)]])];
    const result = resizeLayers(original, 2, 2);

    expect(result).toHaveLength(1);
    expect(result[0].width).toBe(2);
    expect(result[0].height).toBe(2);
    // Same content
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[1][1].fg).toBe(4);
    // But different references (deep clone)
    expect(result[0].data).not.toBe(original[0].data);
    expect(result[0].data[0][0]).not.toBe(original[0].data[0][0]);
  });

  // ─── Growing — preserves content, adds empty blocks ─────────────

  it('grows width: preserves content, adds empty columns', () => {
    const original = [makeLayer([[fg(1), fg(2)]])];
    const result = resizeLayers(original, 4, 1);

    expect(result[0].width).toBe(4);
    expect(result[0].height).toBe(1);
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[0][1].fg).toBe(2);
    expect(result[0].data[0][2]).toEqual({});
    expect(result[0].data[0][3]).toEqual({});
  });

  it('grows height: preserves content, adds empty rows', () => {
    const original = [makeLayer([[fg(1)], [fg(2)]])];
    const result = resizeLayers(original, 1, 4);

    expect(result[0].width).toBe(1);
    expect(result[0].height).toBe(4);
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[1][0].fg).toBe(2);
    expect(result[0].data[2]).toEqual([{}]);
    expect(result[0].data[3]).toEqual([{}]);
  });

  it('grows both dimensions simultaneously', () => {
    const original = [makeLayer([[fg(1)]])];
    const result = resizeLayers(original, 3, 3);

    expect(result[0].width).toBe(3);
    expect(result[0].height).toBe(3);
    expect(result[0].data[0][0].fg).toBe(1);
    // Empty blocks in new cells
    expect(result[0].data[0][1]).toEqual({});
    expect(result[0].data[1][0]).toEqual({});
    expect(result[0].data[2][2]).toEqual({});
  });

  // ─── Shrinking — truncates rows and columns ─────────────────────

  it('shrinks width: truncates columns', () => {
    const original = [makeLayer([[fg(1), fg(2), fg(3)]])];
    const result = resizeLayers(original, 1, 1);

    expect(result[0].width).toBe(1);
    expect(result[0].height).toBe(1);
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[0]).toHaveLength(1);
  });

  it('shrinks height: truncates rows', () => {
    const original = [makeLayer([[fg(1)], [fg(2)], [fg(3)]])];
    const result = resizeLayers(original, 1, 1);

    expect(result[0].width).toBe(1);
    expect(result[0].height).toBe(1);
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data).toHaveLength(1);
  });

  it('shrinks both dimensions simultaneously', () => {
    const original = [makeLayer([
      [fg(1), fg(2), fg(3)],
      [fg(4), fg(5), fg(6)],
      [fg(7), fg(8), fg(9)],
    ])];
    const result = resizeLayers(original, 2, 2);

    expect(result[0].width).toBe(2);
    expect(result[0].height).toBe(2);
    // Top-left corner preserved
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[0][1].fg).toBe(2);
    expect(result[0].data[1][0].fg).toBe(4);
    expect(result[0].data[1][1].fg).toBe(5);
    // Truncated data gone
    expect(result[0].data).toHaveLength(2);
    expect(result[0].data[0]).toHaveLength(2);
  });

  // ─── Edge cases ─────────────────────────────────────────────────

  it('handles resize to 1x1', () => {
    const original = [makeLayer([
      [fg(1), fg(2)],
      [fg(3), fg(4)],
    ])];
    const result = resizeLayers(original, 1, 1);

    expect(result[0].width).toBe(1);
    expect(result[0].height).toBe(1);
    expect(result[0].data[0][0].fg).toBe(1);
  });

  it('handles empty layers (0x0 data)', () => {
    const original = [makeLayer([])];
    original[0].width = 0;
    original[0].height = 0;
    const result = resizeLayers(original, 3, 2);

    expect(result[0].width).toBe(3);
    expect(result[0].height).toBe(2);
    expect(result[0].data).toHaveLength(2);
    expect(result[0].data[0]).toHaveLength(3);
    expect(result[0].data[0][0]).toEqual({});
  });

  it('handles layers with ragged rows', () => {
    // Row 0 has 3 items, row 1 has 1 item, row 2 is empty
    const original = [makeLayer([
      [fg(1), fg(2), fg(3)],
      [fg(4)],
      [],
    ])];
    original[0].width = 3;
    original[0].height = 3;
    const result = resizeLayers(original, 3, 3);

    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].data[0][2].fg).toBe(3);
    expect(result[0].data[1][0].fg).toBe(4);
    // Missing blocks filled with empty
    expect(result[0].data[1][1]).toEqual({});
    expect(result[0].data[2][0]).toEqual({});
    expect(result[0].data[2][2]).toEqual({});
  });

  // ─── Multiple layers ───────────────────────────────────────────

  it('resizes all layers uniformly', () => {
    const layer1 = makeLayer([[fg(1), fg(2)], [fg(3), fg(4)]], 'layer1');
    const layer2 = makeLayer([[fg(5), fg(6)], [fg(7), fg(8)]], 'layer2');
    const result = resizeLayers([layer1, layer2], 3, 3);

    expect(result).toHaveLength(2);
    expect(result[0].width).toBe(3);
    expect(result[0].height).toBe(3);
    expect(result[0].data[0][0].fg).toBe(1);
    expect(result[0].label).toBe('layer1');
    expect(result[1].width).toBe(3);
    expect(result[1].height).toBe(3);
    expect(result[1].data[0][0].fg).toBe(5);
    expect(result[1].label).toBe('layer2');
  });

  it('preserves layer metadata (label, visible)', () => {
    const layer: Layer = {
      label: 'my layer',
      visible: false,
      width: 2,
      height: 2,
      data: [[fg(1), fg(2)], [fg(3), fg(4)]],
    };
    const result = resizeLayers([layer], 3, 3);

    expect(result[0].label).toBe('my layer');
    expect(result[0].visible).toBe(false);
  });

  // ─── Non-mutation guarantee ─────────────────────────────────────

  it('does not mutate original layers', () => {
    const data = [[fg(1), fg(2)], [fg(3), fg(4)]];
    const original = [makeLayer(data)];
    const originalDataRef = original[0].data;

    resizeLayers(original, 3, 3);

    // Original data unchanged
    expect(original[0].data).toBe(originalDataRef);
    expect(original[0].data[0][0].fg).toBe(1);
    expect(original[0].data).toHaveLength(2);
  });

  it('modifying result does not affect original', () => {
    const original = [makeLayer([[fg(1)]])];
    const result = resizeLayers(original, 2, 2);

    // Modify result
    result[0].data[0][0].fg = 99;
    result[0].data[1][1].fg = 88;

    // Original unchanged
    expect(original[0].data[0][0].fg).toBe(1);
  });

  // ─── Inconsistent metadata normalization ────────────────────────

  it('normalizes layers with inconsistent width/height metadata', () => {
    // Layer says 2x2 but data is actually 3x3 (the current bug)
    const layer: Layer = {
      label: 'buggy',
      visible: true,
      width: 2,
      height: 2,
      data: [
        [fg(1), fg(2), fg(3)],
        [fg(4), fg(5), fg(6)],
        [fg(7), fg(8), fg(9)],
      ],
    };
    // Resize to actual 3x3 should normalize metadata
    const result = resizeLayers([layer], 3, 3);

    expect(result[0].width).toBe(3);
    expect(result[0].height).toBe(3);
    expect(result[0].data[2][2].fg).toBe(9);
  });
});
