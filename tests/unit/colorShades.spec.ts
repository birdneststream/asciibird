// Tests for colorShades utility — shade computation, mapping, dedup.

import { describe, it, expect } from 'vitest';
import {
  computeShadeVariants,
  getShadeIndices,
  SHADE_MAP,
} from '../../src/utils/colorShades';
import { MIRC_RGB } from '../../src/utils/ansiColors';

// ─── computeShadeVariants ───────────────────────────────────────

describe('computeShadeVariants', () => {
  it('returns one variant per step', () => {
    const steps = [0.2, 0, -0.2];
    const result = computeShadeVariants([128, 128, 128], steps);
    expect(result).toHaveLength(3);
  });

  it('lightens by interpolating toward white', () => {
    const [r, g, b] = computeShadeVariants([0, 0, 0], [0.5])[0];
    expect(r).toBe(128); // 0 + (255-0)*0.5 = 127.5 → 128
    expect(g).toBe(128);
    expect(b).toBe(128);
  });

  it('darkens by scaling channels', () => {
    const [r, g, b] = computeShadeVariants([200, 100, 50], [-0.5])[0];
    expect(r).toBe(100); // 200 * 0.5 = 100
    expect(g).toBe(50);  // 100 * 0.5 = 50
    expect(b).toBe(25);  // 50  * 0.5 = 25
  });

  it('returns original for step 0', () => {
    const [r, g, b] = computeShadeVariants([42, 84, 168], [0])[0];
    expect(r).toBe(42);
    expect(g).toBe(84);
    expect(b).toBe(168);
  });

  it('clamps values to 0-255 when lightening white', () => {
    const [r, g, b] = computeShadeVariants([255, 255, 255], [0.5])[0];
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  it('clamps values to 0-255 when darkening black', () => {
    const [r, g, b] = computeShadeVariants([0, 0, 0], [-0.5])[0];
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('produces lighter-to-darker order with default steps', () => {
    const variants = computeShadeVariants([128, 128, 128]);
    // First should be lightest (highest sum), last darkest (lowest sum)
    const sumFirst = variants[0][0] + variants[0][1] + variants[0][2];
    const sumLast = variants[variants.length - 1][0]
      + variants[variants.length - 1][1]
      + variants[variants.length - 1][2];
    expect(sumFirst).toBeGreaterThan(sumLast);
  });

  it('uses default 9 steps when none provided', () => {
    const result = computeShadeVariants([100, 100, 100]);
    expect(result).toHaveLength(9);
  });
});

// ─── getShadeIndices ────────────────────────────────────────────

describe('getShadeIndices', () => {
  it('returns valid mIRC indices (0-98)', () => {
    const indices = getShadeIndices(5);
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThanOrEqual(98);
    }
  });

  it('returns no duplicate indices', () => {
    const indices = getShadeIndices(5);
    const unique = new Set(indices);
    expect(unique.size).toBe(indices.length);
  });

  it('returns [] for negative input', () => {
    expect(getShadeIndices(-1)).toEqual([]);
  });

  it('returns [] for input > 98', () => {
    expect(getShadeIndices(99)).toEqual([]);
  });

  it('includes the original color index', () => {
    // The original color (step 0) should appear in results
    const indices = getShadeIndices(5);
    expect(indices).toContain(5);
  });

  it('white (index 0) produces few unique shades', () => {
    const indices = getShadeIndices(0);
    expect(indices.length).toBeLessThanOrEqual(9);
    expect(indices.length).toBeGreaterThanOrEqual(1);
  });

  it('black (index 1) produces few unique shades', () => {
    const indices = getShadeIndices(1);
    expect(indices.length).toBeLessThanOrEqual(9);
    expect(indices.length).toBeGreaterThanOrEqual(1);
  });

  it('mid-color produces multiple unique shades', () => {
    // Index 4 = red (255,0,0) — should have several distinct shades
    const indices = getShadeIndices(4);
    expect(indices.length).toBeGreaterThanOrEqual(3);
  });

  it('grayscale colors produce a smooth ramp', () => {
    // Index 14 = grey (127,127,127) — should map to multiple grays
    const indices = getShadeIndices(14);
    expect(indices.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── SHADE_MAP ──────────────────────────────────────────────────

describe('SHADE_MAP', () => {
  it('has exactly 99 entries', () => {
    expect(SHADE_MAP).toHaveLength(99);
  });

  it('every entry contains only valid mIRC indices', () => {
    for (const indices of SHADE_MAP) {
      for (const idx of indices) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(98);
      }
    }
  });

  it('no entry contains duplicates', () => {
    for (const indices of SHADE_MAP) {
      const unique = new Set(indices);
      expect(unique.size).toBe(indices.length);
    }
  });

  it('each entry always includes its own index', () => {
    // Even for colors with duplicate RGB values (e.g. index 4 and 52
    // are both pure red), the original index must be present.
    for (let i = 0; i < 99; i++) {
      expect(SHADE_MAP[i]).toContain(i);
    }
  });

  it('entry 0 (white) is valid', () => {
    expect(SHADE_MAP[0].length).toBeGreaterThanOrEqual(1);
    expect(SHADE_MAP[0]).toContain(0);
  });

  it('entry 1 (black) is valid', () => {
    expect(SHADE_MAP[1].length).toBeGreaterThanOrEqual(1);
    expect(SHADE_MAP[1]).toContain(1);
  });
});
