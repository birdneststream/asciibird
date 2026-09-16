// Gradient Preview Rendering — block-accurate ghost preview of the
// gradient tools.
//
// Visual-only and does NOT modify any blocks. Renders the exact bg
// colours gradientFill will commit by iterating cells through the
// shared forEachGradientCell (the same source of truth as the fill
// path), ghosting each cell over the tools canvas with the EXISTING
// layer block's char and fg preserved — gradientFill only touches bg,
// so the preview shows the committed look (new bg + current glyph).
// A faint dashed bounding box marks the pick region.

import type { Block } from '../types';
import {
  forEachGradientCell,
  type GradientDirection,
} from './gradientFill';
import { renderBlock } from './blockRenderer';
import { getCanvasFont } from './canvasFont';

/** Ghost opacity for preview blocks (matches the paste-mode ghost) */
export const GRADIENT_PREVIEW_ALPHA = 0.55;

// ─── Preview Options ─────────────────────────────────────────────

export interface GradientPreviewOptions {
  /** Canvas 2D rendering context for the tools layer */
  ctx: CanvasRenderingContext2D;
  /** Start X in grid coordinates (pick point) */
  startX: number;
  /** Start Y in grid coordinates (pick point) */
  startY: number;
  /** Current mouse X in grid coordinates */
  endX: number;
  /** Current mouse Y in grid coordinates */
  endY: number;
  /** Block width in pixels */
  blockWidth: number;
  /** Block height in pixels */
  blockHeight: number;
  /** Zoom level — scales the canvas font like the main canvas */
  blockSizeMultiplier: number;
  /** mIRC colour palette (CSS strings) */
  colours: string[];
  /** Gradient direction — locked by the active gradient tool */
  direction: GradientDirection;
  /** Start colour palette index (captured at pick start) */
  startColorIdx: number;
  /** End colour palette index (current BG) */
  endColorIdx: number;
  /** Existing layer blocks — chars/fg are preserved by the fill */
  layerBlocks: Block[][];
}

// ─── Preview ─────────────────────────────────────────────────────

/**
 * Draw a block-accurate ghost preview of the gradient on the tools
 * canvas. Visual-only — does NOT modify blocks.
 */
export function drawGradientPreview(opts: GradientPreviewOptions): void {
  const {
    ctx,
    startX,
    startY,
    endX,
    endY,
    blockWidth: bw,
    blockHeight: bh,
    blockSizeMultiplier,
    colours,
    direction,
    startColorIdx,
    endColorIdx,
    layerBlocks,
  } = opts;

  ctx.save();
  ctx.globalAlpha = GRADIENT_PREVIEW_ALPHA;
  // clearToolCanvas resets the canvas (and font) — re-apply it so the
  // ghost glyphs match the main canvas rendering
  ctx.font = getCanvasFont(blockSizeMultiplier);

  forEachGradientCell(
    { startX, startY, endX, endY, startColorIdx, endColorIdx, direction },
    (cx, cy, paletteIdx) => {
      const existing = layerBlocks[cy]?.[cx];
      if (!existing) return;

      renderBlock(
        ctx,
        { ...existing, bg: paletteIdx },
        cx * bw,
        cy * bh,
        bw, bh,
        colours,
      );
    },
  );

  ctx.restore();

  // Faint dashed bounding box around the pick region
  const x1 = Math.min(startX, endX) * bw;
  const y1 = Math.min(startY, endY) * bh;
  const x2 = (Math.max(startX, endX) + 1) * bw;
  const y2 = (Math.max(startY, endY) + 1) * bh;
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.restore();
}
