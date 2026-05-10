// Layer compression and creation utilities
// Pure functions for LZ-String layer serialization

import LZString from 'lz-string';
import { create2DArray, emptyBlock } from '../ascii';
import type { Layer, Block } from '../types';

/**
 * Serialize and compress a Layer array to an LZ-String UTF-16 string.
 */
export function compressLayers(layers: Layer[]): string {
  return LZString.compressToUTF16(JSON.stringify(layers));
}

/**
 * Decompress and parse an LZ-String UTF-16 string back to a Layer array.
 */
export function decompressLayers(compressed: string): Layer[] {
  return JSON.parse(LZString.decompressFromUTF16(compressed));
}

/**
 * Create a new empty layer with the given dimensions.
 */
export function createEmptyLayer(
  width: number,
  height: number,
  label: string = `Layer ${Date.now()}`,
): Layer {
  const data: Block[][] = create2DArray(height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      data[y].push({ ...emptyBlock });
    }
  }
  return { label, visible: true, width, height, data };
}

/**
 * Serialize and compress arbitrary JSON-serializable data.
 */
export function compressData<T>(data: T): string {
  return LZString.compressToUTF16(JSON.stringify(data));
}

/**
 * Decompress and parse arbitrary LZ-String compressed data.
 */
export function decompressData<T>(compressed: string): T {
  return JSON.parse(LZString.decompressFromUTF16(compressed));
}
