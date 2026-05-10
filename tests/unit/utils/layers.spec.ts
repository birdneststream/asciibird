import { describe, it, expect } from 'vitest';
import {
  compressLayers,
  decompressLayers,
  createEmptyLayer,
  compressData,
  decompressData,
} from '@/utils/layers';
import type { Layer, Block } from '@/types';
import { emptyBlock } from '@/ascii';

function makeLayer(
  w: number,
  h: number,
  label = 'Test',
): Layer {
  const data: Block[][] = [];
  for (let y = 0; y < h; y++) {
    const row: Block[] = [];
    for (let x = 0; x < w; x++) {
      row.push({ ...emptyBlock });
    }
    data.push(row);
  }
  return { label, visible: true, width: w, height: h, data };
}

describe('compressLayers / decompressLayers', () => {
  it('round-trips a single layer', () => {
    const layers = [makeLayer(3, 2)];
    const compressed = compressLayers(layers);
    expect(typeof compressed).toBe('string');
    const restored = decompressLayers(compressed);
    expect(restored).toEqual(layers);
  });

  it('round-trips multiple layers', () => {
    const layers = [makeLayer(2, 2, 'A'), makeLayer(4, 3, 'B')];
    const restored = decompressLayers(compressLayers(layers));
    expect(restored).toEqual(layers);
    expect(restored).toHaveLength(2);
  });

  it('preserves block content', () => {
    const layer = makeLayer(2, 1);
    layer.data[0][0] = { fg: 1, bg: 2, char: 'X' };
    const restored = decompressLayers(compressLayers([layer]));
    expect(restored[0].data[0][0]).toEqual({ fg: 1, bg: 2, char: 'X' });
  });
});

describe('createEmptyLayer', () => {
  it('creates layer with correct dimensions', () => {
    const layer = createEmptyLayer(10, 5);
    expect(layer.width).toBe(10);
    expect(layer.height).toBe(5);
    expect(layer.data).toHaveLength(5);
    expect(layer.data[0]).toHaveLength(10);
  });

  it('creates layer with default label', () => {
    const layer = createEmptyLayer(1, 1);
    expect(layer.label).toBeTruthy();
    expect(layer.visible).toBe(true);
  });

  it('creates layer with custom label', () => {
    const layer = createEmptyLayer(1, 1, 'Custom');
    expect(layer.label).toBe('Custom');
  });

  it('creates layer with all empty blocks', () => {
    const layer = createEmptyLayer(3, 2);
    for (const row of layer.data) {
      for (const block of row) {
        expect(block).toEqual({});
      }
    }
  });

  it('handles 1x1 layer', () => {
    const layer = createEmptyLayer(1, 1);
    expect(layer.data).toHaveLength(1);
    expect(layer.data[0]).toHaveLength(1);
  });
});

describe('compressData / decompressData', () => {
  it('round-trips a string array', () => {
    const data = ['hello', 'world'];
    const restored = decompressData<string[]>(compressData(data));
    expect(restored).toEqual(data);
  });

  it('round-trips an object', () => {
    const data = { a: 1, b: 'test' };
    const restored = decompressData<typeof data>(compressData(data));
    expect(restored).toEqual(data);
  });

  it('round-trips null', () => {
    const restored = decompressData<null>(compressData(null));
    expect(restored).toBeNull();
  });
});
