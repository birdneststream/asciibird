// Shape Preview Rendering — block-accurate ghost preview of shapes.
//
// Visual-only and does NOT modify any blocks. Renders the exact blocks
// the shape tool will commit by enumerating cells through the shared
// shapeCells() geometry (the same source of truth as the draw path),
// so the preview can never drift from the committed result. Blocks are
// drawn semi-transparent (globalAlpha, paste-ghost style) over the
// tools canvas; region shapes additionally get a faint dashed bounding
// box.
//
// In half-block mode (`halfBlock: true`) Y coordinates are half-block
// rows: each visited half-row is painted with the stroke (FG) colour
// at blockHeight/2, matching the single-colour half-block paint model.

import type { Block } from '../types';
import { shapeCells, type ShapeType } from './shapes';
import { renderBlock } from './blockRenderer';
import { getCanvasFont } from './canvasFont';
import { hasColour } from './mircColors';

/** Ghost opacity for preview blocks (matches the paste-mode ghost) */
export const SHAPE_PREVIEW_ALPHA = 0.55;

// ─── Preview Options ─────────────────────────────────────────────

export interface ShapePreviewOptions {
  /** Canvas 2D rendering context for the tools layer */
  ctx: CanvasRenderingContext2D;
  /** Shape type to preview */
  shapeType: ShapeType;
  /** Start X in grid coordinates */
  startX: number;
  /** Start Y in grid coordinates (half-block rows when halfBlock) */
  startY: number;
  /** Current mouse X in grid coordinates */
  endX: number;
  /** Current mouse Y in grid coordinates (half-block rows when halfBlock) */
  endY: number;
  /** Block width in pixels */
  blockWidth: number;
  /** Block height in pixels */
  blockHeight: number;
  /** Zoom level — scales the canvas font like the main canvas */
  blockSizeMultiplier: number;
  /** mIRC colour palette (CSS strings) */
  colours: string[];
  /** Stroke foreground colour index */
  fg: number;
  /** Stroke background colour index */
  bg: number;
  /** Paint character ('█' is used when empty, matching drawShape) */
  char: string;
  /** Half-block mode: Y coordinates are half-rows at blockHeight/2 */
  halfBlock?: boolean;
}

// ─── Geometry Helper ─────────────────────────────────────────────

/** Pixel height of one Y unit — half a block in half-block mode. */
function unitHeight(halfBlock: boolean | undefined, blockHeight: number): number {
  return halfBlock ? blockHeight / 2 : blockHeight;
}

/** Draw a faint dashed bounding box around the shape region. */
function drawRegionOutline(opts: ShapePreviewOptions, uh: number): void {
  const { ctx, shapeType, startX, startY, endX, endY, blockWidth: bw } = opts;
  if (shapeType === 'line') return; // blocks alone show a line clearly

  const x1 = Math.min(startX, endX) * bw;
  const y1 = Math.min(startY, endY) * uh;
  const x2 = (Math.max(startX, endX) + 1) * bw;
  const y2 = (Math.max(startY, endY) + 1) * uh;

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.restore();
}

// ─── Preview ─────────────────────────────────────────────────────

/**
 * Draw a block-accurate ghost preview of the shape on the tools canvas.
 * Visual-only — does NOT modify blocks.
 */
export function drawShapePreview(opts: ShapePreviewOptions): void {
  const {
    ctx,
    shapeType,
    startX,
    startY,
    endX,
    endY,
    blockWidth: bw,
    blockHeight: bh,
    blockSizeMultiplier,
    colours,
    fg,
    bg,
    char,
    halfBlock,
  } = opts;

  const uh = unitHeight(halfBlock, bh);
  const cells = shapeCells(shapeType, startX, startY, endX, endY);
  if (!cells.length) return;

  ctx.save();
  ctx.globalAlpha = SHAPE_PREVIEW_ALPHA;
  // clearToolCanvas resets the canvas (and font) — re-apply it so the
  // ghost glyphs match the main canvas rendering
  ctx.font = getCanvasFont(blockSizeMultiplier);

  if (halfBlock) {
    // Single-colour paint model: each visited half-row gets the FG colour
    if (hasColour(fg, colours)) {
      ctx.fillStyle = colours[fg];
      for (const cell of cells) {
        ctx.fillRect(cell.x * bw, cell.y * uh, bw, uh);
      }
    }
  } else {
    // The exact block drawShape will commit — same fg/bg/char defaults
    const previewBlock: Block = { fg, bg, char: char || '\u2588' };
    for (const cell of cells) {
      renderBlock(
        ctx,
        previewBlock,
        cell.x * bw,
        cell.y * uh,
        bw, bh,
        colours,
      );
    }
  }

  ctx.restore();

  drawRegionOutline(opts, uh);
}
