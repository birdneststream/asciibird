// Gradient Fill — interpolates between two mIRC palette colors
// across a block region. Returns FillChange[] for undo integration.
//
// Color matching uses Euclidean distance in RGB space against
// the 99-color mIRC palette. This is perceptually approximate
// but sufficient for IRC art.
//
// Direction is always explicit (vertical / horizontal / diagonal) —
// the gradient tools lock their axis and pass it in. Interpolation
// is drag-aware: the start colour anchors at the pick start point
// and the end colour at the release point, so drags in any
// direction place the colours where the user dragged them.

import type { Block } from '../types';
import type { FillChange } from '../ascii';
import {
  MIRC_RGB,
  closestMircColor,
} from './ansiColors';

// ─── Color Types ────────────────────────────────────────────────

/** RGB color object used for gradient interpolation */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

// ─── Color Interpolation ────────────────────────────────────────

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
  /** Gradient direction — explicit, locked by the active gradient tool */
  direction: GradientDirection;
}

/** Callback receiving each in-bounds cell and its interpolated palette index */
export type GradientCellVisitor = (
  cx: number,
  cy: number,
  paletteIdx: number,
) => void;

/** Options for the shared cell iterator (blocks not required) */
export type GradientCellOptions = Omit<GradientFillOptions, 'blocks'>;

/**
 * Visit every cell of the gradient's bounding rectangle with its
 * interpolated palette index — the single source of truth shared by
 * gradientFill (commits bg changes) and the ghost preview, so preview
 * and commit can never drift.
 *
 * Iteration is row-major over the bounding rect; callers without a
 * block grid (the preview) bound-check cells themselves, and the
 * palette index for each cell is memoized by exact interpolation
 * factor (lossless).
 */
export function forEachGradientCell(
  opts: GradientCellOptions,
  visit: GradientCellVisitor,
): void {
  const {
    startX,
    startY,
    endX,
    endY,
    startColorIdx,
    endColorIdx,
    direction,
  } = opts;

  // Bounding rectangle
  const x1 = Math.min(startX, endX);
  const y1 = Math.min(startY, endY);
  const x2 = Math.max(startX, endX);
  const y2 = Math.max(startY, endY);

  // Get RGB values for start and end colors (from shared palette)
  const startTuple = MIRC_RGB[startColorIdx] ?? MIRC_RGB[0];
  const endTuple = MIRC_RGB[endColorIdx] ?? MIRC_RGB[0];
  const startRgb: RgbColor = { r: startTuple[0], g: startTuple[1], b: startTuple[2] };
  const endRgb: RgbColor = { r: endTuple[0], g: endTuple[1], b: endTuple[2] };

  // Palette-index memo keyed by the exact interpolation factor —
  // identical t values recur per row/column, so vertical/horizontal
  // gradients cost O(width + height) closest-color lookups instead
  // of O(cells). Lossless: equal inputs always map to equal outputs.
  const paletteByT = new Map<number, number>();
  function paletteAt(t: number): number {
    let idx = paletteByT.get(t);
    if (idx === undefined) {
      const c = lerpRgb(startRgb, endRgb, t);
      idx = closestMircColor([c.r, c.g, c.b]);
      paletteByT.set(t, idx);
    }
    return idx;
  }

  // Drag-aware interpolation ranges: measured from the true start
  // point so reverse drags anchor the start colour at the pick
  // point (positive drags match the old normalized-corner math)
  const dxTotal = endX - startX;
  const dyTotal = endY - startY;
  const rangeD = Math.sqrt(dxTotal * dxTotal + dyTotal * dyTotal);

  for (let cy = y1; cy <= y2; cy++) {
    for (let cx = x1; cx <= x2; cx++) {
      // Compute interpolation factor t ∈ [0, 1]
      let t: number;
      switch (direction) {
        case 'horizontal':
          t = dxTotal !== 0 ? (cx - startX) / dxTotal : 0;
          break;
        case 'vertical':
          t = dyTotal !== 0 ? (cy - startY) / dyTotal : 0;
          break;
        case 'diagonal':
        default: {
          const dx = cx - startX;
          const dy = cy - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          t = rangeD > 0 ? dist / rangeD : 0;
          break;
        }
      }

      t = Math.max(0, Math.min(1, t));
      visit(cx, cy, paletteAt(t));
    }
  }
}

/**
 * Fill a rectangular region with a gradient between two mIRC palette colors.
 *
 * The gradient runs from startColorIdx at (startX, startY) to
 * endColorIdx at (endX, endY) along `direction`. Each block in the
 * bounding rectangle receives a background color interpolated from
 * the 99-color palette. Only the `bg` property is modified — `fg`
 * and `char` are preserved.
 *
 * Returns FillChange[] for undo integration.
 */
export function gradientFill(opts: GradientFillOptions): FillChange[] {
  const { blocks } = opts;
  const changes: FillChange[] = [];

  // Early exit for degenerate cases
  const x1 = Math.min(opts.startX, opts.endX);
  const y1 = Math.min(opts.startY, opts.endY);
  const x2 = Math.max(opts.startX, opts.endX);
  const y2 = Math.max(opts.startY, opts.endY);
  if (x2 < 0 || y2 < 0 || x1 >= (blocks[0]?.length ?? 0)
    || y1 >= blocks.length) {
    return changes;
  }

  forEachGradientCell(opts, (cx, cy, paletteIdx) => {
    const block = blocks[cy]?.[cx];
    if (!block) return;

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
  });

  return changes;
}
