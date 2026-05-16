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
import type { Ripple } from '@/utils/splashRenderer';

// ─── Sin LUT ──────────────────────────────────────────────────────

describe('fastSin', () => {
  it('returns approximately correct values', () => {
    expect(fastSin(0)).toBeCloseTo(0, 1);
    expect(fastSin(Math.PI / 2)).toBeCloseTo(1, 1);
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
  it('creates a ripple near the requested position', () => {
    const ripple = createRipple(100, 200, 1.5);
    // Position may be offset by up to ±20px for randomness
    expect(Math.abs(ripple.x - 100)).toBeLessThanOrEqual(20);
    expect(Math.abs(ripple.y - 200)).toBeLessThanOrEqual(20);
    expect(ripple.startTime).toBe(1.5);
    expect(ripple.duration).toBeGreaterThan(0);
    expect(ripple.maxRadius).toBeGreaterThan(0);
    expect(ripple.frequency).toBeGreaterThan(0);
    expect(ripple.intensity).toBeGreaterThan(0);
    expect(ripple.ringWidth).toBeGreaterThan(0);
  });

  it('creates ripples with varied properties', () => {
    const props = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const r = createRipple(0, 0, 0);
      props.add(`${r.duration.toFixed(1)}-${r.maxRadius.toFixed(0)}`);
    }
    // Randomness should produce at least a few distinct property combos
    expect(props.size).toBeGreaterThan(3);
  });
});

describe('updateRipples', () => {
  it('removes expired ripples', () => {
    expect(updateRipples([createRipple(100, 100, 0)], 10.0)).toHaveLength(0);
  });

  it('keeps active ripples', () => {
    expect(updateRipples([createRipple(100, 100, 9.0)], 10.0)).toHaveLength(1);
  });

  it('enforces cap of 12', () => {
    const ripples: Ripple[] = [];
    for (let i = 0; i < 15; i++) ripples.push(createRipple(i * 10, i * 10, 4.0));
    expect(updateRipples(ripples, 4.5)).toHaveLength(12);
  });

  it('removes oldest when over cap', () => {
    const ripples: Ripple[] = [];
    for (let i = 0; i < 14; i++) ripples.push(createRipple(i, i, 4.0));
    const result = updateRipples(ripples, 4.5);
    expect(result).toHaveLength(12);
    // Oldest ripples (earliest startTime) are removed
    expect(result[0].startTime).toBe(4.0);
  });
});

// ─── Parallax offset ──────────────────────────────────────────────

describe('computeParallaxOffset', () => {
  it('returns zero for center mouse', () => {
    const o = computeParallaxOffset(500, 500, 1000, 1000);
    expect(o.x).toBeCloseTo(0, 5);
    expect(o.y).toBeCloseTo(0, 5);
  });

  it('shifts opposite to mouse', () => {
    expect(computeParallaxOffset(1000, 500, 1000, 1000).x).toBeLessThan(0);
  });

  it('clamps to ±15px', () => {
    const o = computeParallaxOffset(0, 0, 1000, 1000);
    expect(Math.abs(o.x)).toBeLessThanOrEqual(15);
  });

  it('returns zero for zero viewport', () => {
    expect(computeParallaxOffset(500, 500, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

// ─── Grid dimensions ──────────────────────────────────────────────

describe('calcGridDimensions', () => {
  it('covers the viewport', () => {
    const { cols, rows } = calcGridDimensions(1920, 1080);
    expect(cols * 8).toBeGreaterThanOrEqual(1920);
    expect(rows * 15).toBeGreaterThanOrEqual(1080);
  });
});

// ─── getPlasmaColor ───────────────────────────────────────────────

describe('getPlasmaColor', () => {
  it('returns a valid CSS color string', () => {
    expect(getPlasmaColor(25, 25, 1.0)).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
  });

  it('produces darkened values', () => {
    const color = getPlasmaColor(10, 10, 0);
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBeLessThanOrEqual(64);
    expect(Number(match![2])).toBeLessThanOrEqual(64);
    expect(Number(match![3])).toBeLessThanOrEqual(64);
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
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalCompositeOperation: '',
    } as unknown as CanvasRenderingContext2D;
  }

  it('clears the canvas', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 0, y: 0 }, 800, 600);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('applies parallax translate', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 5, y: -3 }, 800, 600);
    expect(ctx.translate).toHaveBeenCalledWith(5, -3);
  });

  it('fills many blocks', () => {
    const ctx = createMockContext();
    renderFrame(ctx, 1.0, { x: 100, y: 100 }, [], { x: 0, y: 0 }, 800, 600);
    const calls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(100);
  });

  it('renders with active ripples', () => {
    const ctx = createMockContext();
    const ripples = [createRipple(400, 300, 0.5)];
    expect(() => {
      renderFrame(ctx, 1.0, { x: 400, y: 300 }, ripples, { x: 0, y: 0 }, 800, 600);
    }).not.toThrow();
  });
});
