/**
 * Tests for CP437 Decode Utility
 *
 * Covers: box-drawing, block elements, escape byte passthrough,
 * UTF-8 passthrough, CP437 fallback, SAUCE stripping on raw bytes.
 */

import { describe, it, expect } from 'vitest';
import {
  decodeCp437,
  hasUtf8ReplacementChars,
  decodeAnsiBuffer,
  stripSauceBytes,
} from '../../src/utils/cp437';

// ─── decodeCp437 ──────────────────────────────────────────────────

describe('decodeCp437', () => {
  it('decodes ASCII range (0x20-0x7E) as-is', () => {
    const bytes = new Uint8Array([
      0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64,
    ]);
    expect(decodeCp437(bytes.buffer)).toBe('Hello World');
  });

  it('preserves ESC byte (0x1B) as escape character', () => {
    const bytes = new Uint8Array([0x1B]);
    expect(decodeCp437(bytes.buffer)).toBe('\x1b');
  });

  it('preserves newline byte (0x0A) as newline', () => {
    const bytes = new Uint8Array([0x41, 0x0A, 0x42]);
    expect(decodeCp437(bytes.buffer)).toBe('A\nB');
  });

  it('preserves carriage return byte (0x0D) as CR', () => {
    const bytes = new Uint8Array([0x41, 0x0D, 0x42]);
    expect(decodeCp437(bytes.buffer)).toBe('A\rB');
  });

  // ── Box-drawing characters ─────────────────────────────────────

  it('decodes box-drawing: │ (0xB3)', () => {
    expect(decodeCp437(new Uint8Array([0xB3]).buffer)).toBe('│');
  });

  it('decodes box-drawing: ─ (0xC4)', () => {
    expect(decodeCp437(new Uint8Array([0xC4]).buffer)).toBe('─');
  });

  it('decodes box-drawing: ┌ (0xDA)', () => {
    expect(decodeCp437(new Uint8Array([0xDA]).buffer)).toBe('┌');
  });

  it('decodes box-drawing: ┐ (0xBF)', () => {
    expect(decodeCp437(new Uint8Array([0xBF]).buffer)).toBe('┐');
  });

  it('decodes box-drawing: └ (0xC0)', () => {
    expect(decodeCp437(new Uint8Array([0xC0]).buffer)).toBe('└');
  });

  it('decodes box-drawing: ┘ (0xD9)', () => {
    expect(decodeCp437(new Uint8Array([0xD9]).buffer)).toBe('┘');
  });

  // ── Block elements ─────────────────────────────────────────────

  it('decodes block: █ (0xDB)', () => {
    expect(decodeCp437(new Uint8Array([0xDB]).buffer)).toBe('█');
  });

  it('decodes block: ░ (0xB0)', () => {
    expect(decodeCp437(new Uint8Array([0xB0]).buffer)).toBe('░');
  });

  it('decodes block: ▒ (0xB1)', () => {
    expect(decodeCp437(new Uint8Array([0xB1]).buffer)).toBe('▒');
  });

  it('decodes block: ▓ (0xB2)', () => {
    expect(decodeCp437(new Uint8Array([0xB2]).buffer)).toBe('▓');
  });

  it('decodes block: ▄ (0xDC)', () => {
    expect(decodeCp437(new Uint8Array([0xDC]).buffer)).toBe('▄');
  });

  it('decodes block: ▌ (0xDD)', () => {
    expect(decodeCp437(new Uint8Array([0xDD]).buffer)).toBe('▌');
  });

  // ── Special high-range characters ──────────────────────────────

  it('decodes Ç (0x80)', () => {
    expect(decodeCp437(new Uint8Array([0x80]).buffer)).toBe('Ç');
  });

  it('decodes √ (0xFB)', () => {
    expect(decodeCp437(new Uint8Array([0xFB]).buffer)).toBe('√');
  });

  it('decodes α (0xE0)', () => {
    expect(decodeCp437(new Uint8Array([0xE0]).buffer)).toBe('α');
  });

  it('decodes π (0xE3)', () => {
    expect(decodeCp437(new Uint8Array([0xE3]).buffer)).toBe('π');
  });

  // ── Empty buffer ───────────────────────────────────────────────

  it('handles empty buffer', () => {
    expect(decodeCp437(new Uint8Array(0).buffer)).toBe('');
  });

  // ── Full table coverage ────────────────────────────────────────

  it('preserves ASCII printable range (0x20-0x7E) as-is', () => {
    const bytes = new Uint8Array(95);
    for (let i = 0; i < 95; i++) bytes[i] = 0x20 + i;
    const decoded = decodeCp437(bytes.buffer);
    for (let i = 0; i < 95; i++) {
      expect(decoded.charCodeAt(i)).toBe(0x20 + i);
    }
  });

  // ── Real-world pattern: ANSI escape + colored block ────────────

  it('decodes ANSI escape sequences with CP437 box chars', () => {
    // ESC[31m█ = red full block in CP437 (█ = byte 0xDB)
    const bytes = new Uint8Array([
      0x1B, 0x5B, 0x33, 0x31, 0x6D, // ESC[31m
      0xDB,                           // █ (full block in CP437)
      0x1B, 0x5B, 0x30, 0x6D,       // ESC[0m (reset)
    ]);
    const decoded = decodeCp437(bytes.buffer);
    expect(decoded).toBe('\x1b[31m█\x1b[0m');
  });
});

// ─── hasUtf8ReplacementChars ────────────────────────────────────────

describe('hasUtf8ReplacementChars', () => {
  it('returns true for string with U+FFFD', () => {
    expect(hasUtf8ReplacementChars('hello\uFFFDworld')).toBe(true);
  });

  it('returns false for clean string', () => {
    expect(hasUtf8ReplacementChars('hello world')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasUtf8ReplacementChars('')).toBe(false);
  });
});

// ─── decodeAnsiBuffer ───────────────────────────────────────────────

describe('decodeAnsiBuffer', () => {
  it('passes through valid UTF-8 content unchanged', () => {
    const text = 'Hello World with unicode: äöü';
    const buffer = new TextEncoder().encode(text).buffer;
    expect(decodeAnsiBuffer(buffer)).toBe(text);
  });

  it('falls back to CP437 for invalid UTF-8 bytes', () => {
    // Byte 0x80 is invalid in UTF-8 start byte but valid in CP437 (Ç)
    const bytes = new Uint8Array([0x80, 0x81]);
    const decoded = decodeAnsiBuffer(bytes.buffer);
    expect(decoded).toBe('Çü');
  });

  it('handles pure ASCII (both UTF-8 and CP437 agree)', () => {
    const bytes = new Uint8Array([0x41, 0x42, 0x43]);
    expect(decodeAnsiBuffer(bytes.buffer)).toBe('ABC');
  });

  it('handles empty buffer', () => {
    expect(decodeAnsiBuffer(new Uint8Array(0).buffer)).toBe('');
  });
});

// ─── stripSauceBytes ────────────────────────────────────────────────

describe('stripSauceBytes', () => {
  it('strips SAUCE metadata from end of buffer', () => {
    const content = new Uint8Array([0x41, 0x42, 0x43]); // ABC
    const sauce = new Uint8Array(128);
    const sig = [0x53, 0x41, 0x55, 0x43, 0x45, 0x30, 0x30]; // SAUCE00
    sig.forEach((b, i) => { sauce[i] = b; });
    for (let i = 7; i < 128; i++) sauce[i] = 0x20;

    const combined = new Uint8Array(content.length + sauce.length);
    combined.set(content, 0);
    combined.set(sauce, content.length);

    const result = stripSauceBytes(combined.buffer);
    expect(result.byteLength).toBe(3);
    const resultBytes = new Uint8Array(result);
    expect(resultBytes[0]).toBe(0x41);
    expect(resultBytes[1]).toBe(0x42);
    expect(resultBytes[2]).toBe(0x43);
  });

  it('returns buffer unchanged when no SAUCE signature', () => {
    const bytes = new Uint8Array(200);
    for (let i = 0; i < 200; i++) bytes[i] = 0x41;
    expect(stripSauceBytes(bytes.buffer).byteLength).toBe(200);
  });

  it('returns buffer unchanged when too short for SAUCE', () => {
    const bytes = new Uint8Array(50);
    expect(stripSauceBytes(bytes.buffer).byteLength).toBe(50);
  });

  it('does not strip SAUCE-like signature in middle of content', () => {
    const bytes = new Uint8Array(200);
    const sig = [0x53, 0x41, 0x55, 0x43, 0x45, 0x30, 0x30];
    sig.forEach((b, i) => { bytes[100 + i] = b; });
    expect(stripSauceBytes(bytes.buffer).byteLength).toBe(200);
  });
});
