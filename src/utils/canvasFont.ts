/**
 * Canvas font utilities for consistent ASCII rendering.
 *
 * All canvas contexts should use `getCanvasFont()` instead of
 * hardcoding font strings, so the font scales with blockSizeMultiplier.
 */

/** Base font size in pixels for ASCII block rendering at 1× zoom. */
const BASE_CANVAS_FONT_SIZE = 13;

/** Font family for canvas ASCII rendering. */
const CANVAS_FONT_FAMILY = 'Hack';

/**
 * Get the canvas font string scaled by the block size multiplier.
 *
 * @param blockSizeMultiplier - Current zoom level (0.5–4.0)
 * @returns CSS font string, e.g. '13px Hack' or '26px Hack'
 */
export function getCanvasFont(blockSizeMultiplier: number): string {
  return `${BASE_CANVAS_FONT_SIZE * blockSizeMultiplier}px ${CANVAS_FONT_FAMILY}`;
}
