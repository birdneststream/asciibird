/**
 * Shared ANSI color utilities used by both import and export.
 *
 * Provides: RGB parsing, ANSI 256-color palette, Euclidean distance,
 * closest-color lookups, and precomputed mIRC↔ANSI mappings.
 */

import { mircColours99 } from '../ascii';

// ─── RGB helpers ─────────────────────────────────────────────────

/** Parse color string to [r, g, b]. Handles #hex and rgb() formats. */
export function parseColor(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  if (hex.length === 6 && !hex.startsWith('rgb')) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [
      Number.parseInt(match[1], 10),
      Number.parseInt(match[2], 10),
      Number.parseInt(match[3], 10),
    ];
  }
  return [0, 0, 0];
}

/** ANSI 16 standard colors as RGB values */
const ANSI_STANDARD_16: [number, number, number][] = [
  [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
  [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
  [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
  [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
];

/** 6×6×6 color cube component values */
const CUBE_VALUES = [0, 95, 135, 175, 215, 255];

/** Get RGB for an ANSI 256-color index */
export function ansiToRgb(index: number): [number, number, number] {
  if (index < 16) {
    return ANSI_STANDARD_16[index] ?? [0, 0, 0];
  }
  if (index < 232) {
    const i = index - 16;
    const b = i % 6;
    const g = Math.floor(i / 6) % 6;
    const r = Math.floor(i / 36) % 6;
    return [CUBE_VALUES[r], CUBE_VALUES[g], CUBE_VALUES[b]];
  }
  // Grayscale (232-255)
  const gray = 8 + (index - 232) * 10;
  return [gray, gray, gray];
}

/** Euclidean RGB distance */
export function colorDistance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/** Find the closest ANSI 256-color for an RGB value */
export function closestAnsiColor(rgb: [number, number, number]): number {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < 256; i++) {
    const d = colorDistance(rgb, ansiToRgb(i));
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** Pre-computed mIRC 99 color RGB values */
export const MIRC_RGB: [number, number, number][] =
  mircColours99.map(parseColor);

/** Find the closest mIRC 99 color index for an RGB value */
export function closestMircColor(rgb: [number, number, number]): number {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < 99; i++) {
    const d = colorDistance(rgb, MIRC_RGB[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// ─── Pre-computed mappings ───────────────────────────────────────

/** Maps each of the 99 mIRC color indices to the closest ANSI 256-color */
export const IRC_TO_ANSI: number[] = MIRC_RGB.map(closestAnsiColor);

/** Maps each ANSI 256-color index to the closest mIRC 99 color */
export const ANSI_TO_MIRC: number[] = Array.from(
  { length: 256 },
  (_, i) => closestMircColor(ansiToRgb(i)),
);

/** ANSI 16-color standard indices (0-7) */
export const ANSI16_STANDARD = [0, 1, 2, 3, 4, 5, 6, 7];

/** ANSI 16-color bright indices (8-15) */
export const ANSI16_BRIGHT = [8, 9, 10, 11, 12, 13, 14, 15];
