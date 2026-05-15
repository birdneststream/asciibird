// Color shade computation for the shade picker.
//
// Generates lighter-to-darker variants of mIRC colors by linear RGB
// interpolation, then maps each variant back to the closest mIRC 99
// palette color.  Reuses parseColor / closestMircColor / MIRC_RGB
// from ansiColors.ts — no duplication.

import { MIRC_RGB, closestMircColor } from './ansiColors';

// ─── Types ──────────────────────────────────────────────────────

type Rgb = [number, number, number];

/** Shade step factors: positive = lighten, negative = darken */
const SHADE_STEPS: readonly number[] = [
  0.4, 0.3, 0.2, 0.1, 0, -0.1, -0.2, -0.3, -0.4,
];

// ─── Pure helpers ───────────────────────────────────────────────

/** Clamp a value to [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/**
 * Lighten an RGB color toward white by the given factor (0–1).
 * Uses linear interpolation: newC = C + (255 - C) * factor.
 */
function lighten(rgb: Rgb, factor: number): Rgb {
  return [
    clamp(Math.round(rgb[0] + (255 - rgb[0]) * factor), 0, 255),
    clamp(Math.round(rgb[1] + (255 - rgb[1]) * factor), 0, 255),
    clamp(Math.round(rgb[2] + (255 - rgb[2]) * factor), 0, 255),
  ];
}

/**
 * Darken an RGB color by the given factor (0–1).
 * Uses linear scaling: newC = C * (1 - factor).
 */
function darken(rgb: Rgb, factor: number): Rgb {
  return [
    clamp(Math.round(rgb[0] * (1 - factor)), 0, 255),
    clamp(Math.round(rgb[1] * (1 - factor)), 0, 255),
    clamp(Math.round(rgb[2] * (1 - factor)), 0, 255),
  ];
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Compute shade variant RGB values for a given color.
 * Returns one RGB tuple per shade step (lighter → darker).
 * Exported for testing; consumers should use SHADE_MAP instead.
 */
export function computeShadeVariants(
  rgb: Rgb,
  steps: readonly number[] = SHADE_STEPS,
): Rgb[] {
  return steps.map(s => {
    if (s > 0) return lighten(rgb, s);
    if (s < 0) return darken(rgb, -s);
    return rgb;
  });
}

/**
 * Get shade mIRC color indices for a given mIRC color index.
 * Returns deduplicated indices in lighter-to-darker order,
 * preserving first occurrence.  The original colorIndex is
 * always included (even if closestMircColor maps the step-0
 * variant to a lower-indexed duplicate in the palette).
 * Returns [] for out-of-range input.
 */
export function getShadeIndices(colorIndex: number): number[] {
  if (colorIndex < 0 || colorIndex > 98) return [];
  const rgb = MIRC_RGB[colorIndex];
  const variants = computeShadeVariants(rgb);
  const seen = new Set<number>();
  const result: number[] = [];

  for (const v of variants) {
    const idx = closestMircColor(v);
    if (!seen.has(idx)) {
      seen.add(idx);
      result.push(idx);
    }
  }

  // Ensure the original color is always present — some mIRC
  // colors share identical RGB values (e.g. index 4 and 52
  // are both pure red). closestMircColor returns the lower
  // index, so we inject the original if it was lost.
  if (!seen.has(colorIndex)) {
    result.push(colorIndex);
  }

  return result;
}

/**
 * Pre-computed shade map for all 99 mIRC colors.
 * Index 0–98 → array of shade mIRC indices (lighter to darker).
 */
export const SHADE_MAP: number[][] = MIRC_RGB.map(
  (_, i) => getShadeIndices(i),
);
