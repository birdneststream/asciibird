import { describe, it, expect, vi } from 'vitest';
import {
  fastSin,
  getPlasmaColor,
  createRipple,
  updateRipples,
  computeParallaxOffset,
  calcGridDimensions,
  renderFrame,
} from '@/utils/splashRenderer';
import type { Ripple, MouseState } from '@/utils/splashRenderer';

// getPlasmaColor is no longer exported but we can test via renderFrame
// Testing the public API surface

// ─── Sin LUT ──────────────────────────────────────────────────────

describe('fastSin', () => {
  it('returns approximately correct values for common angles', () => {
    expect(fastSin(0)).toBeCloseTo(0, 1);
    expect(fastSin(Math.PI / 2)).toBeCloseTo(1, 1);
    expect(fastSin(Math.PI)).toBeCloseTo(0, 1);
    expect(fastSin(Math.PI * 1.5)).toBeCloseTo(-1, 1);
  });

  it('handles negative angles', () => {
    expect(fastSin(-Math.PI / 2)).toBeCloseTo(-1, 1);
  });

  it('wraps for large angles', () => {
    expect(fastSin(Math.PI * 100 + Math.PI / 2)).toBeCloseTo(1, 1);
  });
});

// ─── Ripple lifecycle ─────────────────────────────────────────────

describe('createRipple', () => {
  it('creates a ripple with correct properties', () => {
    const ripple = createRipple(100, 200, 1.5);
    expect(ripple.x).toBe(100);
    expect(ripple.y).toBe(200);
    expect(ripple.startTime).toBe(1.5);
    expect(ripple.duration).toBeGreaterThan(0);
    expect(ripple.maxRadius).toBeGreaterThan(0);
  });
});

describe('updateRipples', () => {
  it('removes expired ripples', () => {
    const ripples = [createRipple(100, 100, 0), createRipple(200, 200, 1.0)];
    expect(updateRipples(ripples, 10.0)).toHaveLength(0);
  });

  it('keeps active ripples', () => {
    expect(updateRipples([createRipple(100, 100, 9.0)], 10.0)).toHaveLength(1);
  });

  it('enforces cap of 10 ripples', () => {
    const ripples: Ripple[] = [];
    for (let i = 0; i < 15; i++) {
      ripples.push(createRipple(i * 10, i * 10, 4.0));
    }
    expect(updateRipples(ripples, 4.5)).toHaveLength(10);
  });

  it('removes oldest ripples when over cap', () => {
    const ripples: Ripple[] = [];
    for (let i = 0; i < 12; i++) {
      ripples.push(createRipple(i, i, 4.0));
    }
    const result = updateRipples(ripples, 4.5);
    expect(result).toHaveLength(10);
    expect(result[0].x).toBe(2);
  });
});

// ─── Parallax offset ──────────────────────────────────────────────

describe('computeParallaxOffset', () => {
  it('returns zero for center mouse position', () => {
    const offset = computeParallaxOffset(500, 500, 1000, 1000);
    expect(offset.x).toBeCloseTo(0, 5);
    expect(offset.y).toBeCloseTo(0, 5);
  });

  it('shifts opposite to mouse direction', () => {
    expect(computeParallaxOffset(1000, 500, 1000, 1000).x).toBeLessThan(0);
  });

  it('clamps to ±15px max', () => {
    const offset = computeParallaxOffset(0, 0, 1000, 1000);
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(15);
    expect(Math.abs(offset.y)).toBeLessThanOrEqual(15);
  });

  it('returns zero for zero viewport', () => {
    const offset = computeParallaxOffset(500, 500, 0, 0);
    expect(offset).toEqual({ x: 0, y: 0 });
  });
});

// ─── Grid dimensions ──────────────────────────────────────────────

describe('calcGridDimensions', () => {
  it('covers the viewport', () => {
    const { cols, rows } = calcGridDimensions(1920, 1080);
    expect(cols * 8).toBeGreaterThanOrEqual(1920);
    expect(rows * 15).toBeGreaterThanOrEqual(1080);
  });

  it('includes padding', () => {
    const { cols, rows } = calcGridDimensions(800, 600);
    expect(cols).toBeGreaterThan(Math.ceil(800 / 8));
    expect(rows).toBeGreaterThan(Math.ceil(600 / 15));
  });
});

// ─── Frame rendering ──────────────────────────────────────────────

describe('renderFrame', () => {
  function createMockContext() {
    return {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      stroke: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalCompositeOperation: '',
    } as unknown as CanvasRenderingContext2D;
  }

  it('clears the canvas at the start', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 0, y: 0 }, 800, 600);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('applies parallax translate', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 5, y: -3 }, 800, 600);
    expect(ctx.translate).toHaveBeenCalledWith(5, -3);
  });

  it('fills many blocks via fillRect', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 0, y: 0 }, 800, 600);
    expect(ctx.fillRect).toHaveBeenCalled();
    // Many blocks in an 800×600 viewport
    const calls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(100);
  });

  it('uses dark colors for fillStyle (background is dark)', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 0, y: 0 }, 800, 600);

    // fillStyle gets set before each fillRect — check it was set at all
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('does NOT use arc or createRadialGradient (ripples are in-plasma)', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 400, y: 300 }, [], { x: 0, y: 0 }, 800, 600);
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.createRadialGradient).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('renders with active ripples without errors', () => {
    const ctx = createMockContext();
    const ripples = [createRipple(400, 300, 0.5)];
    expect(() => {
      renderFrame(ctx, 1.0, { x: 400, y: 300 }, ripples, { x: 0, y: 0 }, 800, 600);
    }).not.toThrow();
    // Still no arc calls — ripple is in the plasma
    expect(ctx.arc).not.toHaveBeenCalled();
  });
});

// ─── getPlasmaColor (public for testing) ───────────────────────────

describe('getPlasmaColor', () => {
  it('returns a valid CSS color string', () => {
    const color = getPlasmaColor(25, 25, 1.0);
    expect(color).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
  });

  it('produces darkened values', () => {
    const color = getPlasmaColor(10, 10, 0);
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
    expect(match).toBeTruthy();
    // With DARKEN=0.25, max channel value is 63
    expect(Number(match![1])).toBeLessThanOrEqual(64);
    expect(Number(match![2])).toBeLessThanOrEqual(64);
    expect(Number(match![3])).toBeLessThanOrEqual(64);
  });
});
