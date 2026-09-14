// Shape preview rendering tests — half-block pixel mapping contract
import { describe, it, expect, vi } from 'vitest';
import { drawShapePreview } from '../../../src/utils/shapePreview';
import type { ShapePreviewOptions } from '../../../src/utils/shapePreview';

/** Mock canvas 2D context recording fillRect/strokeRect calls */
function makeMockCtx() {
  const rects: Array<{ x: number; y: number; w: number; h: number }> = [];
  const ctx = {
    fillRect: vi.fn((x: number, y: number, w: number, h: number) =>
      rects.push({ x, y, w, h })),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    ellipse: vi.fn(),
    setLineDash: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return { ctx, rects };
}

function opts(
  ctx: CanvasRenderingContext2D,
  extra: Partial<ShapePreviewOptions>,
): ShapePreviewOptions {
  return {
    ctx,
    shapeType: 'line',
    startX: 0,
    startY: 0,
    endX: 1,
    endY: 0,
    blockWidth: 8,
    blockHeight: 15,
    strokeColor: '#fff',
    ...extra,
  };
}

describe('drawShapePreview half-block mapping', () => {
  it('full-block mode maps Y at blockHeight per unit', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'line', startX: 0, startY: 2, endX: 1, endY: 2 }));
    const lineRect = rects.find(r => r.h === 13); // bh - 2
    expect(lineRect).toBeDefined();
    expect(lineRect!.y).toBe(2 * 15 + 1); // half-row 2 → y=31
  });

  it('half-block mode maps Y at blockHeight/2 per unit', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, {
      shapeType: 'line', halfBlock: true,
      startX: 0, startY: 4, endX: 1, endY: 4,
    }));
    // half row 4 → 4 * 7.5 = 30px, height uh - 2 = 5.5
    const lineRect = rects.find(r => r.h === 5.5);
    expect(lineRect).toBeDefined();
    expect(lineRect!.y).toBe(4 * 7.5 + 1); // 31
  });

  it('half-block rect spans half-height pixel bounds', () => {
    const { ctx } = makeMockCtx();
    const strokeSpy = vi.fn();
    ctx.strokeRect = strokeSpy;
    drawShapePreview(opts(ctx, {
      shapeType: 'rectOutline', halfBlock: true,
      startX: 1, startY: 2, endX: 3, endY: 6,
    }));
    // strokeRect(min x, min y, w, h): y = 2*7.5=15, h = (6-2+1)*7.5 = 37.5
    expect(strokeSpy).toHaveBeenCalledWith(1 * 8, 2 * 7.5, 3 * 8, 5 * 7.5);
  });

  it('half-block line dots centre on half rows', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, {
      shapeType: 'line', halfBlock: true,
      startX: 0, startY: 3, endX: 2, endY: 3,
    }));
    // start dot: (x*bw + bw/2 - 2, y*uh + uh/2 - 2) = (2, 3*7.5+3.75-2)
    const dot = rects.find(r => r.w === 4 && r.h === 4 && Math.abs(r.y - (22.5 + 1.75)) < 0.01);
    expect(dot).toBeDefined();
  });
});
