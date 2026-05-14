// Shape Preview Rendering — draws a dashed preview of shapes on the tools canvas.
//
// This is visual-only and does NOT modify any blocks.
// Called from Editor.vue canvasMouseMove to show shape preview during two-click flow.

import type { ShapeType } from './shapes';
import { bresenhamLine } from './bresenham';

// ─── Preview Options ─────────────────────────────────────────────

export interface ShapePreviewOptions {
  /** Canvas 2D rendering context for the tools layer */
  ctx: CanvasRenderingContext2D;
  /** Shape type to preview */
  shapeType: ShapeType;
  /** Start X in grid coordinates */
  startX: number;
  /** Start Y in grid coordinates */
  startY: number;
  /** Current mouse X in grid coordinates */
  endX: number;
  /** Current mouse Y in grid coordinates */
  endY: number;
  /** Block width in pixels */
  blockWidth: number;
  /** Block height in pixels */
  blockHeight: number;
  /** Stroke color (CSS color string) */
  strokeColor: string;
}

// ─── Line Preview ────────────────────────────────────────────────

function drawLinePreview(opts: ShapePreviewOptions): void {
  const { ctx, startX, startY, endX, endY, blockWidth: bw, blockHeight: bh } = opts;

  const points = bresenhamLine(startX, startY, endX, endY);
  const halfW = bw / 2;
  const halfH = bh / 2;

  ctx.fillStyle = opts.strokeColor;
  ctx.globalAlpha = 0.4;

  for (const pt of points) {
    ctx.fillRect(
      pt.x * bw + 1,
      pt.y * bh + 1,
      bw - 2,
      bh - 2,
    );
  }

  ctx.globalAlpha = 1.0;

  // Draw start and end dots
  ctx.fillStyle = opts.strokeColor;
  ctx.fillRect(startX * bw + halfW - 2, startY * bh + halfH - 2, 4, 4);
  ctx.fillRect(endX * bw + halfW - 2, endY * bh + halfH - 2, 4, 4);
}

// ─── Rectangle Preview ───────────────────────────────────────────

function drawRectPreview(opts: ShapePreviewOptions, filled: boolean): void {
  const { ctx, startX, startY, endX, endY, blockWidth: bw, blockHeight: bh } = opts;

  const x1 = Math.min(startX, endX) * bw;
  const y1 = Math.min(startY, endY) * bh;
  const x2 = Math.max(startX, endX) * bw + bw;
  const y2 = Math.max(startY, endY) * bh + bh;
  const w = x2 - x1;
  const h = y2 - y1;

  if (filled) {
    ctx.fillStyle = opts.strokeColor;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(x1, y1, w, h);
    ctx.globalAlpha = 1.0;
  }

  ctx.strokeStyle = opts.strokeColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x1, y1, w, h);
  ctx.setLineDash([]);
}

// ─── Ellipse Preview ─────────────────────────────────────────────

function drawEllipsePreview(opts: ShapePreviewOptions, filled: boolean): void {
  const { ctx, startX, startY, endX, endY, blockWidth: bw, blockHeight: bh } = opts;

  const x1 = Math.min(startX, endX) * bw;
  const y1 = Math.min(startY, endY) * bh;
  const x2 = Math.max(startX, endX) * bw + bw;
  const y2 = Math.max(startY, endY) * bh + bh;

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = (x2 - x1) / 2;
  const ry = (y2 - y1) / 2;

  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);

  if (filled) {
    ctx.fillStyle = opts.strokeColor;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  ctx.strokeStyle = opts.strokeColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ─── Dispatch ────────────────────────────────────────────────────

/**
 * Draw a shape preview on the tools canvas.
 * Visual-only — does NOT modify blocks.
 */
export function drawShapePreview(opts: ShapePreviewOptions): void {
  switch (opts.shapeType) {
    case 'line':
      drawLinePreview(opts);
      break;
    case 'rectOutline':
      drawRectPreview(opts, false);
      break;
    case 'rectFilled':
      drawRectPreview(opts, true);
      break;
    case 'ellipseOutline':
      drawEllipsePreview(opts, false);
      break;
    case 'ellipseFilled':
      drawEllipsePreview(opts, true);
      break;
  }
}
