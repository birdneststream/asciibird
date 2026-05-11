import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderBlock,
  clearMainCanvas,
  useMainCanvasRenderer,
} from '@/composables/useMainCanvasRenderer';
import type { Block } from '@/types';

describe('useMainCanvasRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas.getContext('2d')!;

    // Spy on all drawing methods
    vi.spyOn(ctx, 'fillRect');
    vi.spyOn(ctx, 'fillText');
    vi.spyOn(ctx, 'clearRect');
    vi.spyOn(ctx, 'save');
    vi.spyOn(ctx, 'restore');
  });

  describe('renderBlock', () => {
    const colours = [
      'rgb(255,255,255)', // 0 white
      'rgb(0,0,0)',       // 1 black
      'rgb(0,0,127)',     // 2 navy
    ];

    it('draws background fill when block has bg', () => {
      const block: Block = { bg: 1, fg: undefined as any, char: undefined as any };
      renderBlock(ctx, block, 10, 20, 8, 14, colours);

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 8, 14);
      expect(ctx.fillStyle).toBe(colours[1]);
    });

    it('draws bg with color index 0 (white is valid, not falsy)', () => {
      const block: Block = { bg: 0, fg: undefined as any, char: undefined as any };
      renderBlock(ctx, block, 0, 0, 8, 14, colours);

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 8, 14);
      expect(ctx.fillStyle).toBe(colours[0]);
    });

    it('draws fg with color index 0', () => {
      const block: Block = { bg: undefined as any, fg: 0, char: 'A' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours);

      expect(ctx.fillText).toHaveBeenCalledWith('A', 0, 11);
      expect(ctx.fillStyle).toBe(colours[0]);
    });

    it('draws foreground text when block has char', () => {
      const block: Block = { bg: undefined as any, fg: 2, char: 'X' };
      renderBlock(ctx, block, 10, 20, 8, 14, colours);

      expect(ctx.fillText).toHaveBeenCalledWith('X', 10, 31); // 20 + 14 - 3
      expect(ctx.fillStyle).toBe(colours[2]);
    });

    it('draws both bg and text for complete block', () => {
      const block: Block = { bg: 1, fg: 2, char: 'X' };
      renderBlock(ctx, block, 10, 20, 8, 14, colours);

      expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 8, 14);
      expect(ctx.fillText).toHaveBeenCalledWith('X', 10, 31);
    });

    it('uses white color when fg is missing', () => {
      const block: Block = { bg: undefined as any, fg: undefined as any, char: 'Y' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours);

      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.fillStyle).toBe('#FFFFFF');
    });

    it('skips bg when canBg is false', () => {
      const block: Block = { bg: 1, fg: 0, char: 'A' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours, { canBg: false });

      expect(ctx.fillRect).not.toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('skips text when canText is false and uses fallbackChar', () => {
      const block: Block = { bg: 1, fg: 0, char: 'A' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours, {
        canText: false,
        fallbackChar: '.',
      });

      expect(ctx.fillText).toHaveBeenCalledWith('.', 0, 11);
    });

    it('uses fallback space when canText is false and no fallback provided', () => {
      const block: Block = { bg: 1, fg: 0, char: 'A' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours, { canText: false });

      expect(ctx.fillText).toHaveBeenCalledWith(' ', 0, 11);
    });

    it('skips fg color when canFg is false', () => {
      const block: Block = { bg: undefined as any, fg: 2, char: 'Z' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours, { canFg: false });

      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.fillStyle).toBe('#FFFFFF');
    });

    it('does nothing for empty block', () => {
      const block: Block = { bg: undefined as any, fg: undefined as any, char: undefined as any };
      renderBlock(ctx, block, 0, 0, 8, 14, colours);

      expect(ctx.fillRect).not.toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('skips text when char is empty string', () => {
      const block: Block = { bg: undefined as any, fg: 1, char: '' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours);

      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('skips text when canText is false and fallbackChar is empty', () => {
      const block: Block = { bg: 1, fg: 0, char: 'A' };
      renderBlock(ctx, block, 0, 0, 8, 14, colours, {
        canText: false,
        fallbackChar: '',
      });

      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('calculates correct text baseline offset', () => {
      const block: Block = { bg: 0, fg: 1, char: 'M' };
      renderBlock(ctx, block, 5, 10, 8, 16, colours);

      expect(ctx.fillText).toHaveBeenCalledWith('M', 5, 23); // 10 + 16 - 3
    });
  });

  describe('clearMainCanvas', () => {
    it('clears canvas and sets font', () => {
      clearMainCanvas(ctx, canvas, 200, 200);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
      expect(ctx.font).toBe('13px Hack');
    });

    it('resets canvas dimensions when canvas element provided', () => {
      const originalWidth = canvas.width;
      clearMainCanvas(ctx, canvas, 200, 200);

      // canvas.width = canvas.width is a reset pattern
      expect(canvas.width).toBe(originalWidth);
    });

    it('works when canvas element is null', () => {
      expect(() => clearMainCanvas(ctx, null, 200, 200)).not.toThrow();
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 200);
    });
  });

  describe('useMainCanvasRenderer', () => {
    it('returns renderBlock and clearMainCanvas functions', () => {
      const renderer = useMainCanvasRenderer();

      expect(renderer.renderBlock).toBe(renderBlock);
      expect(renderer.clearMainCanvas).toBe(clearMainCanvas);
    });
  });
});
