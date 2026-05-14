/**
 * Tests for Crop to Content Utility
 *
 * Covers: empty borders, no content, partial content, multi-layer,
 * content at edges (no-op), single block, asymmetric borders,
 * empty layers mixed with content layers.
 */

import { describe, it, expect } from 'vitest';
import {
  findContentBounds,
  cropLayersToBounds,
  cropToContent,
} from '../../src/utils/cropContent';
import type { Block, Layer } from '../../src/types';

// ─── Helpers ──────────────────────────────────────────────────────

/** Create a layer filled with empty blocks */
function emptyLayer(width: number, height: number, label = 'test'): Layer {
  const data: Block[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Block[] = [];
    for (let x = 0; x < width; x++) {
      row.push({});
    }
    data.push(row);
  }
  return { label, visible: true, width, height, data };
}

/** Create a layer from a 2D array of block descriptions */
function layerFromDesc(
  desc: (string | null)[][],
  label = 'test',
): Layer {
  const height = desc.length;
  const width = desc[0]?.length ?? 0;
  const data: Block[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Block[] = [];
    for (let x = 0; x < width; x++) {
      const val = desc[y][x];
      row.push(val ? { char: val, fg: 0 } : {});
    }
    data.push(row);
  }
  return { label, visible: true, width, height, data };
}

// ─── findContentBounds ────────────────────────────────────────────

describe('findContentBounds', () => {
  it('returns null for completely empty layers', () => {
    const layers = [emptyLayer(5, 5)];
    expect(findContentBounds(layers)).toBeNull();
  });

  it('finds single content block', () => {
    const layer = emptyLayer(5, 5);
    layer.data[2][3] = { char: 'X', fg: 0 };
    const bounds = findContentBounds([layer]);
    expect(bounds).toEqual({ minX: 3, minY: 2, maxX: 3, maxY: 2 });
  });

  it('finds content across multiple layers', () => {
    const layer1 = emptyLayer(10, 10);
    const layer2 = emptyLayer(10, 10);
    layer1.data[1][2] = { char: 'A', fg: 0 };
    layer2.data[7][8] = { char: 'B', fg: 0 };
    const bounds = findContentBounds([layer1, layer2]);
    expect(bounds).toEqual({ minX: 2, minY: 1, maxX: 8, maxY: 7 });
  });

  it('finds content with background color only', () => {
    const layer = emptyLayer(5, 5);
    layer.data[3][1] = { bg: 4 }; // bg color with no char
    const bounds = findContentBounds([layer]);
    expect(bounds).toEqual({ minX: 1, minY: 3, maxX: 1, maxY: 3 });
  });

  it('ignores blocks with only space character and no colors', () => {
    const layer = emptyLayer(5, 5);
    layer.data[2][3] = { char: ' ' }; // space with no fg/bg
    expect(findContentBounds([layer])).toBeNull();
  });

  it('considers space with fg color as content', () => {
    const layer = emptyLayer(5, 5);
    layer.data[2][3] = { char: ' ', fg: 0 };
    const bounds = findContentBounds([layer]);
    expect(bounds).not.toBeNull();
    expect(bounds).toEqual({ minX: 3, minY: 2, maxX: 3, maxY: 2 });
  });

  it('finds content at origin', () => {
    const layer = emptyLayer(5, 5);
    layer.data[0][0] = { char: 'X', fg: 0 };
    const bounds = findContentBounds([layer]);
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  });

  it('finds content at bottom-right corner', () => {
    const layer = emptyLayer(5, 5);
    layer.data[4][4] = { char: 'X', fg: 0 };
    const bounds = findContentBounds([layer]);
    expect(bounds).toEqual({ minX: 4, minY: 4, maxX: 4, maxY: 4 });
  });

  it('returns null for empty layer array', () => {
    expect(findContentBounds([])).toBeNull();
  });
});

// ─── cropLayersToBounds ───────────────────────────────────────────

describe('cropLayersToBounds', () => {
  it('crops to specified bounds', () => {
    const layer = emptyLayer(10, 10);
    // Content at (3,2) to (6,5)
    for (let y = 2; y <= 5; y++) {
      for (let x = 3; x <= 6; x++) {
        layer.data[y][x] = { char: 'X', fg: 0 };
      }
    }
    const result = cropLayersToBounds(
      [layer],
      { minX: 3, minY: 2, maxX: 6, maxY: 5 },
    );
    expect(result[0].width).toBe(4);
    expect(result[0].height).toBe(4);
    expect(result[0].data[0][0].char).toBe('X');
    expect(result[0].data[3][3].char).toBe('X');
  });

  it('preserves content outside bounds in other layers', () => {
    // When multiple layers exist, ALL are cropped to the same bounds
    const layer1 = emptyLayer(8, 8);
    const layer2 = emptyLayer(8, 8);
    layer1.data[1][1] = { char: 'A', fg: 0 };
    layer1.data[3][3] = { char: 'B', fg: 0 };
    layer2.data[2][2] = { char: 'C', fg: 0 };
    const bounds = { minX: 1, minY: 1, maxX: 3, maxY: 3 };
    const result = cropLayersToBounds([layer1, layer2], bounds);
    // Layer 2 gets cropped too — content at (2,2) becomes (1,1)
    expect(result[1].data[1][1].char).toBe('C');
    expect(result[1].width).toBe(3);
    expect(result[1].height).toBe(3);
  });

  it('handles single-cell crop', () => {
    const layer = emptyLayer(5, 5);
    layer.data[2][3] = { char: 'X', fg: 0 };
    const result = cropLayersToBounds(
      [layer],
      { minX: 3, minY: 2, maxX: 3, maxY: 2 },
    );
    expect(result[0].width).toBe(1);
    expect(result[0].height).toBe(1);
    expect(result[0].data[0][0].char).toBe('X');
  });
});

// ─── cropToContent ────────────────────────────────────────────────

describe('cropToContent', () => {
  it('returns uncropped for empty canvas', () => {
    const layers = [emptyLayer(5, 5)];
    const result = cropToContent(layers);
    expect(result.cropped).toBe(false);
    expect(result.bounds).toBeNull();
  });

  it('crops symmetric empty borders', () => {
    const desc = [
      [null, null, null, null, null],
      [null, 'A', 'B', 'C', null],
      [null, 'D', 'E', 'F', null],
      [null, null, null, null, null],
    ];
    const layer = layerFromDesc(desc);
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].width).toBe(3);
    expect(result.layers[0].height).toBe(2);
    expect(result.layers[0].data[0][0].char).toBe('A');
    expect(result.layers[0].data[1][2].char).toBe('F');
  });

  it('returns uncropped when content fills edges', () => {
    const desc = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
    ];
    const layer = layerFromDesc(desc);
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(false);
    expect(result.layers[0].width).toBe(3);
  });

  it('crops asymmetric borders', () => {
    const desc = [
      [null, null, null],
      [null, 'X', null],
      [null, null, null],
      [null, null, null],
    ];
    const layer = layerFromDesc(desc);
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].width).toBe(1);
    expect(result.layers[0].height).toBe(1);
  });

  it('crops top-only border', () => {
    const desc = [
      [null, null],
      ['A', 'B'],
    ];
    const layer = layerFromDesc(desc);
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].height).toBe(1);
    expect(result.layers[0].data[0][0].char).toBe('A');
  });

  it('crops multiple layers to union bounds', () => {
    const layer1 = emptyLayer(8, 8);
    const layer2 = emptyLayer(8, 8);
    layer1.data[1][1] = { char: 'A', fg: 0 }; // interior
    layer2.data[5][5] = { char: 'Z', fg: 0 }; // interior
    const result = cropToContent([layer1, layer2]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].width).toBe(5); // 1 to 5
    expect(result.layers[0].height).toBe(5); // 1 to 5
    // Content preserved at new coordinates
    expect(result.layers[0].data[0][0].char).toBe('A');
    expect(result.layers[1].data[4][4].char).toBe('Z');
  });

  it('handles single block content', () => {
    const layer = emptyLayer(10, 10);
    layer.data[5][5] = { char: 'X', fg: 0 };
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].width).toBe(1);
    expect(result.layers[0].height).toBe(1);
  });

  it('handles content with only background color', () => {
    const layer = emptyLayer(5, 5);
    layer.data[1][1] = { bg: 4 };
    layer.data[3][3] = { bg: 2 };
    const result = cropToContent([layer]);
    expect(result.cropped).toBe(true);
    expect(result.layers[0].width).toBe(3);
    expect(result.layers[0].height).toBe(3);
  });
});
