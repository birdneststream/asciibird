// Splash screen renderer — pure TypeScript animation engine.
//
// Generates an animated ASCII block background for the ASCIIBIRD
// splash screen. Uses fillRect per block with a sin LUT for fast
// plasma color computation. Click ripples distort the plasma itself.

import { MIRC_RGB } from './ansiColors';

// ─── Types ──────────────────────────────────────────────────────────

export interface Ripple {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  maxRadius: number;
  /** Per-ripple wave frequency for varied ring patterns */
  frequency: number;
  /** Per-ripple intensity multiplier */
  intensity: number;
  /** Per-ripple ring width in pixels */
  ringWidth: number;
}

export interface MouseState {
  x: number;
  y: number;
}

// ─── Constants ──────────────────────────────────────────────────────

export const BW = 8;
export const BH = 15;
const MAX_PARALLAX_SHIFT = 15;
const DARKEN = 0.12;

// ─── Sin LUT ────────────────────────────────────────────────────────

const LUT_SIZE = 256;
const LUT_MASK = LUT_SIZE - 1;
const TWO_PI = Math.PI * 2;

const sinLUT = new Float32Array(LUT_SIZE);
for (let i = 0; i < LUT_SIZE; i++) {
  sinLUT[i] = Math.sin((i / LUT_SIZE) * TWO_PI);
}

export function fastSin(angle: number): number {
  const norm = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
  return sinLUT[Math.floor((norm / TWO_PI) * LUT_SIZE) & LUT_MASK];
}

// ─── Plasma color palette ───────────────────────────────────────────

const PLASMA_COLORS: [number, number, number][] = [
  2, 9, 12, 24, 25, 42, 43, 59, 60, 76, 77,
  6, 23, 39, 55, 71, 87,
  10, 11, 26, 58, 74,
  80, 81, 82, 83, 84, 85, 86, 87, 88,
].map(i => MIRC_RGB[i]);

const PLASMA_LEN = PLASMA_COLORS.length;

// ─── Ripple lifecycle ───────────────────────────────────────────────

const MAX_RIPPLES = 12;

/** Random float in [min, max) */
function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createRipple(x: number, y: number, time: number): Ripple {
  return {
    x: x + randRange(-20, 20),
    y: y + randRange(-20, 20),
    startTime: time,
    duration: randRange(1.5, 3.5),
    maxRadius: randRange(150, 500),
    frequency: randRange(0.04, 0.12),
    intensity: randRange(2, 5),
    ringWidth: randRange(40, 100),
  };
}

export function updateRipples(ripples: Ripple[], time: number): Ripple[] {
  const active = ripples.filter(r => time - r.startTime < r.duration);
  while (active.length > MAX_RIPPLES) active.shift();
  return active;
}

// ─── Parallax ───────────────────────────────────────────────────────

export function computeParallaxOffset(
  mouseX: number,
  mouseY: number,
  viewportW: number,
  viewportH: number,
): { x: number; y: number } {
  if (viewportW === 0 || viewportH === 0) return { x: 0, y: 0 };
  const nx = (mouseX / viewportW - 0.5) * -2;
  const ny = (mouseY / viewportH - 0.5) * -2;
  return {
    x: Math.max(-MAX_PARALLAX_SHIFT, Math.min(MAX_PARALLAX_SHIFT, nx * MAX_PARALLAX_SHIFT)),
    y: Math.max(-MAX_PARALLAX_SHIFT, Math.min(MAX_PARALLAX_SHIFT, ny * MAX_PARALLAX_SHIFT)),
  };
}

// ─── Grid dimensions ────────────────────────────────────────────────

export function calcGridDimensions(
  viewportW: number,
  viewportH: number,
): { cols: number; rows: number } {
  const padX = Math.ceil(MAX_PARALLAX_SHIFT / BW) + 1;
  const padY = Math.ceil(MAX_PARALLAX_SHIFT / BH) + 1;
  return {
    cols: Math.ceil(viewportW / BW) + padX * 2,
    rows: Math.ceil(viewportH / BH) + padY * 2,
  };
}

// ─── Color computation ──────────────────────────────────────────────

/**
 * Simple plasma color — no ripples/mouse, for testing.
 */
export function getPlasmaColor(
  col: number,
  row: number,
  time: number,
): string {
  const t = time * 0.4;
  const v =
    fastSin(col * 0.05 + t * 0.7) +
    fastSin(row * 0.08 + t * 0.5) +
    fastSin((col + row) * 0.03 + t) +
    fastSin(Math.sqrt(col * col + row * row) * 0.04 + t * 0.3);

  const norm = (v + 4) / 8;
  const [pr, pg, pb] = PLASMA_COLORS[
    Math.floor(Math.abs(norm) * PLASMA_LEN) % PLASMA_LEN
  ];
  return `rgb(${Math.floor(pr * DARKEN)},${Math.floor(pg * DARKEN)},${Math.floor(pb * DARKEN)})`;
}

/**
 * Full block color with ripple distortion.
 * Each ripple has its own randomized frequency, intensity, and ring width,
 * so clicks produce varied, organic-looking expanding color rings.
 */
function getBlockColor(
  col: number,
  row: number,
  pxX: number,
  pxY: number,
  time: number,
  _mouse: MouseState,
  ripples: Ripple[],
): string {
  const t = time * 0.4;

  // Base plasma
  let v =
    fastSin(col * 0.05 + t * 0.7) +
    fastSin(row * 0.08 + t * 0.5) +
    fastSin((col + row) * 0.03 + t) +
    fastSin(Math.sqrt(col * col + row * row) * 0.04 + t * 0.3);

  // Ripple distortion — each ripple has unique wave properties
  for (let i = 0; i < ripples.length; i++) {
    const rp = ripples[i];
    const progress = (time - rp.startTime) / rp.duration;
    const radius = progress * rp.maxRadius;
    const fade = 1 - progress;
    const dx = pxX - rp.x;
    const dy = pxY - rp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const ringDist = Math.abs(dist - radius);
    if (ringDist < rp.ringWidth) {
      const ringFade = fade * (1 - ringDist / rp.ringWidth);
      v += fastSin(dist * rp.frequency - time * 3) * ringFade * rp.intensity;
    }
  }

  // Normalize and pick palette color
  const norm = (v + 4) / 8;
  const [pr, pg, pb] = PLASMA_COLORS[
    Math.floor(Math.abs(norm) * PLASMA_LEN) % PLASMA_LEN
  ];

  const r = Math.min(255, Math.floor(pr * DARKEN));
  const g = Math.min(255, Math.floor(pg * DARKEN));
  const b = Math.min(255, Math.floor(pb * DARKEN));

  return `rgb(${r},${g},${b})`;
}

// ─── Frame rendering ────────────────────────────────────────────────

/**
 * Render one frame — fillRect per block with plasma + ripple distortion.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  time: number,
  mouse: MouseState,
  ripples: Ripple[],
  parallax: { x: number; y: number },
  viewportW: number,
  viewportH: number,
): void {
  const { cols, rows } = calcGridDimensions(viewportW, viewportH);

  ctx.clearRect(0, 0, viewportW, viewportH);
  ctx.save();
  ctx.translate(parallax.x, parallax.y);

  for (let r = 0; r < rows; r++) {
    const y = r * BH;
    if (y > viewportH + BH) break;
    for (let c = 0; c < cols; c++) {
      const x = c * BW;
      if (x > viewportW + BW) break;
      ctx.fillStyle = getBlockColor(c, r, x, y, time, mouse, ripples);
      ctx.fillRect(x, y, BW, BH);
    }
  }

  ctx.restore();
}
