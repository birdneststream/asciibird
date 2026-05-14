// Gradient Fill — interpolates between two mIRC palette colors
// across a block region. Returns FillChange[] for undo integration.
//
// Color matching uses Euclidean distance in RGB space against
// the 99-color mIRC palette. This is perceptually approximate
// but sufficient for IRC art.

import type { Block } from '../types';
import { mircColours99 } from '../ascii';
import type { FillChange } from '../ascii';

// ─── Color Parsing ──────────────────────────────────────────────

/** RGB color tuple */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a CSS color string from mircColours99 to RGB values.
 * Supports "rgb(r,g,b)" and "#hex" formats.
 */
export function parseCssColor(colorStr: string): RgbColor {
  // "rgb(r,g,b)" format (most entries in mircColours99)
  const rgbMatch = colorStr.match(
    /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/,
  );
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
    };
  }

  // "#hex" format (fallback)
  const hex = colorStr.replace('#', '');
  return {
    r: Number.parseInt(hex.substring(0, 2), 16),
    g: Number.parseInt(hex.substring(2, 4), 16),
    b: Number.parseInt(hex.substring(4, 6), 16),
  };
}

// ─── Pre-parsed palette for performance ─────────────────────────

/** Pre-parsed RGB values for the 99-color mIRC palette */
const paletteRgb: RgbColor[] = mircColours99.map(parseCssColor);

// ─── Color Interpolation ────────────────────────────────────────

/**
 * Find the closest color index in the 99-color mIRC palette.
 * Uses Euclidean distance in RGB space.
 * Returns the palette index (0-98) of the closest match.
 */
export function findClosestMircColor(r: number, g: number, b: number): number {
  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < paletteRgb.length; i++) {
    const p = paletteRgb[i];
    const dr = r - p.r;
    const dg = g - p.g;
    const db = b - p.b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return bestIdx;
}

/**
 * Linear interpolation between two RGB colors.
 * t=0 returns a, t=1 returns b.
 */
export function lerpRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

// ─── Gradient Direction ─────────────────────────────────────────

/** Direction of gradient interpolation */
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';

/**
 * Auto-detect gradient direction from start/end point geometry.
 * Returns 'horizontal' if mostly horizontal, 'vertical' if mostly
 * vertical, 'diagonal' if roughly equal.
 */
export function detectGradientDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): GradientDirection {
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);

  if (dx > dy * 2) return 'horizontal';
  if (dy > dx * 2) return 'vertical';
  return 'diagonal';
}

// ─── Gradient Fill ──────────────────────────────────────────────

/** Options for the gradient fill operation */
export interface GradientFillOptions {
  /** The block grid to fill */
  blocks: Block[][];
  /** Start X coordinate (grid cells) */
  startX: number;
  /** Start Y coordinate (grid cells) */
  startY: number;
  /** End X coordinate (grid cells) */
  endX: number;
  /** End Y coordinate (grid cells) */
  endY: number;
  /** Start color palette index */
  startColorIdx: number;
  /** End color palette index */
  endColorIdx: number;
  /** Gradient direction (auto-detected if not specified) */
  direction?: GradientDirection;
}

/**
 * Fill a rectangular region with a gradient between two mIRC palette colors.
 *
 * The gradient runs from startColorIdx at (startX, startY) to
 * endColorIdx at (endX, endY). Each block in the bounding rectangle
 * receives a background color interpolated from the 99-color palette.
 * Only the `bg` property is modified — `fg` and `char` are preserved.
 *
 * Returns FillChange[] for undo integration.
 */
export function gradientFill(opts: GradientFillOptions): FillChange[] {
  const {
    blocks,
    startX,
    startY,
    endX,
    endY,
    startColorIdx,
    endColorIdx,
  } = opts;

  const changes: FillChange[] = [];

  // Bounding rectangle
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  // Early exit for degenerate cases
  if (x2 < 0 || y2 < 0 || x1 >= (blocks[0]?.length ?? 0)
    || y1 >= blocks.length) {
    return changes;
  }

  const direction = opts.direction
    ?? detectGradientDirection(startX, startY, endX, endY);

  // Get RGB values for start and end colors
  const startRgb = paletteRgb[startColorIdx] ?? paletteRgb[0];
  const endRgb = paletteRgb[endColorIdx] ?? paletteRgb[0];

  // Compute interpolation ranges based on direction
  const rangeW = x2 - x1;
  const rangeH = y2 - y1;
  const rangeD = Math.sqrt(rangeW * rangeW + rangeH * rangeH);

  for (let cy = y1; cy <= y2; cy++) {
    const row = blocks[cy];
    if (!row) continue;

    for (let cx = x1; cx <= x2; cx++) {
      const block = row[cx];
      if (!block) continue;

      // Compute interpolation factor t ∈ [0, 1]
      let t: number;
      switch (direction) {
        case 'horizontal':
          t = rangeW > 0 ? (cx - x1) / rangeW : 0;
          break;
        case 'vertical':
          t = rangeH > 0 ? (cy - y1) / rangeH : 0;
          break;
        case 'diagonal':
        default: {
          const dx = cx - x1;
          const dy = cy - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          t = rangeD > 0 ? dist / rangeD : 0;
          break;
        }
      }

      t = Math.max(0, Math.min(1, t));

      // Interpolate and find closest palette color
      const interpolated = lerpRgb(startRgb, endRgb, t);
      const paletteIdx = findClosestMircColor(
        interpolated.r,
        interpolated.g,
        interpolated.b,
      );

      // Record old state
      const oldBlock: Block = { ...block };

      // Apply — only modify bg
      block.bg = paletteIdx;

      changes.push({
        x: cx,
        y: cy,
        old: oldBlock,
        new: { ...block },
      });
    }
  }

  return changes;
}
