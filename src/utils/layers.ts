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
 * Returns an empty array if data is corrupted or cannot be parsed.
 */
export function decompressLayers(compressed: string): Layer[] {
  try {
    const raw = LZString.decompressFromUTF16(compressed);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[asciibird] Failed to decompress layers:', e);
    return [];
  }
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
 * Returns null if data is corrupted or cannot be parsed,
 * allowing callers to use `|| fallback` patterns.
 */
export function decompressData<T>(compressed: string): T | null {
  try {
    const raw = LZString.decompressFromUTF16(compressed);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[asciibird] Failed to decompress data:', e);
    return null;
  }
}

/**
 * Find the index of the next visible layer, searching forward then backward.
 * Returns -1 if no visible layer is found.
 *
 * @param layers      Array of layers to search
 * @param fromIndex   Starting index for the search
 */
export function findNextVisibleLayer(
  layers: Layer[],
  fromIndex: number,
): number {
  if (fromIndex < 0 || fromIndex >= layers.length) return -1;

  // Forward search
  for (let i = fromIndex; i < layers.length; i++) {
    if (layers[i].visible) return i;
  }
  // Backward search
  for (let i = fromIndex - 1; i >= 0; i--) {
    if (layers[i].visible) return i;
  }
  return -1;
}
