import { describe, it, expect } from 'vitest';
import { getCanvasFont } from '@/utils/canvasFont';

describe('getCanvasFont', () => {
  it('returns 13px Hack at 1x zoom', () => {
    expect(getCanvasFont(1)).toBe('13px Hack');
  });

  it('returns 26px Hack at 2x zoom', () => {
    expect(getCanvasFont(2)).toBe('26px Hack');
  });

  it('returns 6.5px Hack at 0.5x zoom', () => {
    expect(getCanvasFont(0.5)).toBe('6.5px Hack');
  });

  it('returns 52px Hack at 4x zoom (max)', () => {
    expect(getCanvasFont(4)).toBe('52px Hack');
  });

  it('returns 16.25px Hack at 1.25x zoom', () => {
    expect(getCanvasFont(1.25)).toBe('16.25px Hack');
  });
});
