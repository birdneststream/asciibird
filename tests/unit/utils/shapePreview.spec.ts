// Shape preview rendering tests — block-accurate ghost contract.
// The preview must paint the exact cells the draw path would commit,
// at block (or half-row) pixel positions, ghosted via globalAlpha.
import { describe, it, expect, vi } from 'vitest';
import { drawShapePreview, SHAPE_PREVIEW_ALPHA } from '../../../src/utils/shapePreview';
import type { ShapePreviewOptions } from '../../../src/utils/shapePreview';
import { shapeCells } from '../../../src/utils/shapes';
import { mircColours99 } from '../../../src/ascii';

interface Rect { x: number; y: number; w: number; h: number; alpha: number; fill: string }
interface Text { char: string; x: number; y: number; alpha: number; fill: string }

/** Mock canvas 2D context recording fillRect/fillText/strokeRect calls */
function makeMockCtx() {
  const rects: Rect[] = [];
  const texts: Text[] = [];
  const strokes: Rect[] = [];
  const base = {
    globalAlpha: 1,
    font: '',
    fillStyle: '',
    fillRect: vi.fn((x: number, y: number, w: number, h: number) =>
      rects.push({ x, y, w, h, alpha: base.globalAlpha, fill: base.fillStyle })),
    fillText: vi.fn((char: string, x: number, y: number) =>
      texts.push({ char, x, y, alpha: base.globalAlpha, fill: base.fillStyle })),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) =>
      strokes.push({ x, y, w, h, alpha: base.globalAlpha, fill: '' })),
    setLineDash: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
  const ctx = base as unknown as CanvasRenderingContext2D;
  return { ctx, rects, texts, strokes };
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
    blockSizeMultiplier: 1,
    colours: mircColours99,
    fg: 4,
    bg: 1,
    char: '',
    ...extra,
  };
}

describe('drawShapePreview block-ghost contract', () => {
  it('full-block line paints one bg rect per cell at block positions', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'line', startX: 0, startY: 2, endX: 2, endY: 2 }));
    const cells = shapeCells('line', 0, 2, 2, 2);
    expect(rects).toHaveLength(cells.length);
    for (let i = 0; i < cells.length; i++) {
      expect(rects[i]).toMatchObject({
        x: cells[i].x * 8,
        y: cells[i].y * 15,
        w: 8,
        h: 15,
      });
    }
  });

  it('blocks are ghosted via globalAlpha and use the bg colour', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'rectFilled', endX: 0, endY: 0 }));
    expect(rects[0].alpha).toBe(SHAPE_PREVIEW_ALPHA);
    expect(rects[0].fill).toBe(mircColours99[1]);
  });

  it('glyph defaults to █ when char is empty (matching drawShape)', () => {
    const { ctx, texts } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'line', endX: 0, endY: 0, char: '' }));
    expect(texts[0].char).toBe('█');
  });

  it('explicit char is preserved', () => {
    const { ctx, texts } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'line', endX: 0, endY: 0, char: '#' }));
    expect(texts[0].char).toBe('#');
  });

  it('glyph is drawn in the fg colour at the main canvas baseline', () => {
    const { ctx, texts } = makeMockCtx();
    drawShapePreview(opts(ctx, { shapeType: 'line', startX: 3, startY: 1, endX: 3, endY: 1 }));
    expect(texts[0]).toMatchObject({
      x: 3 * 8,
      y: 1 * 15 + 15 - 3,
      fill: mircColours99[4],
    });
  });

  it('ghost state is wrapped in balanced save/restore pairs', () => {
    // Line: one pair (blocks only). Region shapes: two pairs (blocks
    // plus the dashed bbox) — every save has a matching restore.
    const line = makeMockCtx();
    drawShapePreview(opts(line.ctx, { shapeType: 'line', endX: 0, endY: 0 }));
    expect(line.ctx.save).toHaveBeenCalledTimes(1);
    expect(line.ctx.restore).toHaveBeenCalledTimes(1);

    const rect = makeMockCtx();
    drawShapePreview(opts(rect.ctx, { shapeType: 'rectFilled', endX: 0, endY: 0 }));
    expect(rect.ctx.save).toHaveBeenCalledTimes(2);
    expect(rect.ctx.restore).toHaveBeenCalledTimes(2);
  });

  it('half-block mode paints half-rows at blockHeight/2 with the fg colour', () => {
    const { ctx, rects } = makeMockCtx();
    drawShapePreview(opts(ctx, {
      shapeType: 'rectFilled',
      halfBlock: true,
      startX: 1, startY: 4, endX: 1, endY: 5,
    }));
    // half rows 4 and 5 → y = 4*7.5 and 5*7.5, each 8×7.5
    expect(rects).toEqual([
      { x: 8, y: 30, w: 8, h: 7.5, alpha: SHAPE_PREVIEW_ALPHA, fill: mircColours99[4] },
      { x: 8, y: 37.5, w: 8, h: 7.5, alpha: SHAPE_PREVIEW_ALPHA, fill: mircColours99[4] },
    ]);
  });

  it('region shapes get a dashed bounding box; lines do not', () => {
    const rectCase = makeMockCtx();
    drawShapePreview(opts(rectCase.ctx, {
      shapeType: 'rectOutline', startX: 1, startY: 2, endX: 3, endY: 6,
    }));
    expect(rectCase.strokes).toHaveLength(1);
    expect(rectCase.strokes[0]).toMatchObject({ x: 8, y: 30, w: 24, h: 75 });

    const lineCase = makeMockCtx();
    drawShapePreview(opts(lineCase.ctx, {
      shapeType: 'line', startX: 1, startY: 2, endX: 3, endY: 6,
    }));
    expect(lineCase.strokes).toHaveLength(0);
  });

  it('half-block region bbox spans half-row pixel bounds', () => {
    const { ctx, strokes } = makeMockCtx();
    drawShapePreview(opts(ctx, {
      shapeType: 'rectOutline', halfBlock: true,
      startX: 1, startY: 2, endX: 3, endY: 6,
    }));
    // x=1*8, y=2*7.5, w=3*8, h=(6-2+1)*7.5
    expect(strokes[0]).toMatchObject({ x: 8, y: 15, w: 24, h: 37.5 });
  });

  it('preview cells match the enumerator cells exactly (no drift)', () => {
    const { ctx, rects, texts } = makeMockCtx();
    drawShapePreview(opts(ctx, {
      shapeType: 'ellipseFilled', startX: 0, startY: 0, endX: 4, endY: 2,
    }));
    const cells = shapeCells('ellipseFilled', 0, 0, 4, 2);
    // every enumerated cell got exactly one bg rect (chars drawn on top)
    expect(rects.filter(r => r.w === 8 && r.h === 15)).toHaveLength(cells.length);
    expect(texts).toHaveLength(cells.length);
  });
});
