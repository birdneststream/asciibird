// Gradient preview rendering tests — block-accurate ghost contract.
// The preview must paint the exact bg colours gradientFill will commit
// (via the shared forEachGradientCell) while preserving each cell's
// existing char/fg, ghosted via globalAlpha.
import { describe, it, expect, vi } from 'vitest';
import {
  drawGradientPreview,
  GRADIENT_PREVIEW_ALPHA,
} from '../../../src/utils/gradientPreview';
import type { GradientPreviewOptions } from '../../../src/utils/gradientPreview';
import { gradientFill } from '../../../src/utils/gradientFill';
import { mircColours99, emptyBlock } from '../../../src/ascii';
import type { Block } from '../../../src/types';

interface Rect { x: number; y: number; w: number; h: number; alpha: number; fill: string }
interface Text { char: string; fill: string }

function makeMockCtx() {
  const rects: Rect[] = [];
  const texts: Text[] = [];
  const strokes: Rect[] = [];
  // Stateful context: save/restore actually push/pop the draw state so
  // a leaked globalAlpha/fillStyle across the ghost would be caught
  const state = { globalAlpha: 1, font: '', fillStyle: '' };
  const stack: typeof state[] = [];
  const base = {
    ...state,
    get globalAlpha() { return state.globalAlpha; },
    set globalAlpha(v: number) { state.globalAlpha = v; },
    get font() { return state.font; },
    set font(v: string) { state.font = v; },
    get fillStyle() { return state.fillStyle; },
    set fillStyle(v: string) { state.fillStyle = v; },
    fillRect: vi.fn((x: number, y: number, w: number, h: number) =>
      rects.push({ x, y, w, h, alpha: state.globalAlpha, fill: state.fillStyle })),
    fillText: vi.fn((char: string) =>
      texts.push({ char, fill: state.fillStyle })),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) =>
      strokes.push({ x, y, w, h, alpha: state.globalAlpha, fill: '' })),
    setLineDash: vi.fn(),
    save: vi.fn(() => stack.push({ ...state })),
    restore: vi.fn(() => {
      const prev = stack.pop();
      if (prev) Object.assign(state, prev);
    }),
  };
  return {
    ctx: base as unknown as CanvasRenderingContext2D,
    rects,
    texts,
    strokes,
    state,
  };
}

function makeLayer(
  w: number, h: number,
  decorate?: (b: Block, x: number, y: number) => void,
): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      const b = { ...emptyBlock };
      decorate?.(b, x, y);
      grid[y][x] = b;
    }
  }
  return grid;
}

function opts(
  ctx: CanvasRenderingContext2D,
  layerBlocks: Block[][],
  extra: Partial<GradientPreviewOptions> = {},
): GradientPreviewOptions {
  return {
    ctx,
    startX: 0,
    startY: 0,
    endX: 4,
    endY: 0,
    blockWidth: 8,
    blockHeight: 15,
    blockSizeMultiplier: 1,
    colours: mircColours99,
    direction: 'horizontal',
    startColorIdx: 0, // white
    endColorIdx: 1,   // black
    layerBlocks,
    ...extra,
  };
}

describe('drawGradientPreview block-ghost contract', () => {
  it('paints one ghost bg rect per cell with the committed palette colour', () => {
    const layer = makeLayer(5, 1);
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer));

    // Run the real fill on a copy and compare cell-by-cell
    const filled = makeLayer(5, 1);
    const changes = gradientFill({
      blocks: filled,
      startX: 0, startY: 0, endX: 4, endY: 0,
      startColorIdx: 0, endColorIdx: 1, direction: 'horizontal',
    });
    expect(rects).toHaveLength(changes.length);
    for (const change of changes) {
      const rect = rects.find(r => r.x === change.x * 8 && r.y === change.y * 15);
      expect(rect).toBeDefined();
      expect(rect!.fill).toBe(mircColours99[change.new.bg]);
      expect(rect!.alpha).toBe(GRADIENT_PREVIEW_ALPHA);
    }
  });

  it('preserves the existing char and fg in the ghost (fill only touches bg)', () => {
    const layer = makeLayer(5, 1, (b, x) => {
      if (x === 2) { b.char = 'X'; b.fg = 4; }
    });
    const { ctx, rects, texts } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer));

    // every cell painted a bg rect...
    expect(rects).toHaveLength(5);
    // ...but only the decorated cell drew its glyph, in its fg colour
    const glyph = texts.find(t => t.char === 'X');
    expect(glyph).toBeDefined();
    expect(glyph!.fill).toBe(mircColours99[4]);
    expect(texts).toHaveLength(1);
  });

  it('vertical direction paints constant colour per row', () => {
    const layer = makeLayer(1, 4);
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, {
      direction: 'vertical', endX: 0, endY: 3,
    }));
    expect(rects).toHaveLength(4);
    expect(rects[0].fill).toBe(mircColours99[0]); // start colour at pick row
    expect(rects[3].fill).toBe(mircColours99[1]); // end colour at release row
  });

  it('reverse drag anchors the start colour at the pick point', () => {
    const layer = makeLayer(5, 1);
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, { startX: 4, endX: 0 }));
    const at = (x: number) => rects.find(r => r.x === x * 8)!.fill;
    expect(at(4)).toBe(mircColours99[0]);
    expect(at(0)).toBe(mircColours99[1]);
  });

  it('draws a dashed bounding box around the pick region', () => {
    const layer = makeLayer(5, 2);
    const { ctx, strokes } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, { endX: 4, endY: 1 }));
    expect(strokes).toHaveLength(1);
    expect(strokes[0]).toMatchObject({ x: 0, y: 0, w: 5 * 8, h: 2 * 15 });
  });

  it('skips cells outside the layer bounds', () => {
    const layer = makeLayer(2, 1); // narrower than the drag
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, { endX: 4 }));
    expect(rects).toHaveLength(2);
    expect(rects.every(r => r.x === 0 || r.x === 8)).toBe(true);
  });

  it('uses a balanced save/restore pair around the ghost and restores state', () => {
    const layer = makeLayer(5, 1);
    const { ctx, state } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer));
    expect(ctx.save).toHaveBeenCalledTimes(2);
    expect(ctx.restore).toHaveBeenCalledTimes(2);
    // No leaked ghost alpha or font after the preview
    expect(state.globalAlpha).toBe(1);
    expect(state.font).toBe('');
  });

  it('diagonal direction radiates from the pick point', () => {
    const layer = makeLayer(3, 3);
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, {
      direction: 'diagonal', endX: 2, endY: 2,
    }));
    const at = (x: number, y: number) =>
      rects.find(r => r.x === x * 8 && r.y === y * 15)!.fill;
    expect(at(0, 0)).toBe(mircColours99[0]); // pick corner = start colour
    expect(at(2, 2)).toBe(mircColours99[1]); // far corner = end colour
  });

  it('zero-length drag paints every cell with the start colour (t=0)', () => {
    const layer = makeLayer(3, 3);
    const { ctx, rects } = makeMockCtx();
    drawGradientPreview(opts(ctx, layer, {
      startX: 1, startY: 1, endX: 1, endY: 1,
    }));
    expect(rects).toHaveLength(1);
    expect(rects[0].fill).toBe(mircColours99[0]);
  });
});
