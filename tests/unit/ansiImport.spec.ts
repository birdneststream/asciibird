/**
 * Tests for ANSI Import Utility
 *
 * Covers: 16-color, 256-color, truecolor, combined SGR, bold+bright,
 * reset, malformed sequences, empty input, SAUCE metadata, round-trip
 * export→import, auto-detection.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  parseAnsiToBlocks,
  isAnsiContent,
  parseAnsiAscii,
} from '../../src/utils/ansiImport';
import { ANSI_TO_MIRC } from '../../src/utils/ansiColors';
import type { Block } from '../../src/types';

// ─── parseAnsiToBlocks ───────────────────────────────────────────

describe('parseAnsiToBlocks', () => {
  it('parses plain text without colors', () => {
    const result = parseAnsiToBlocks('Hello World');
    expect(result.width).toBe(11);
    expect(result.height).toBe(1);
    expect(result.blocks[0][0].char).toBe('H');
    expect(result.blocks[0][0].fg).toBeUndefined();
    expect(result.blocks[0][0].bg).toBeUndefined();
  });

  it('parses multiple lines', () => {
    const result = parseAnsiToBlocks('line1\nline2\nline3');
    expect(result.height).toBe(3);
    expect(result.width).toBe(5);
  });

  it('strips trailing empty line from final newline', () => {
    const result = parseAnsiToBlocks('line1\n');
    expect(result.height).toBe(1);
  });

  it('pads shorter rows to max width', () => {
    const result = parseAnsiToBlocks('abc\nde');
    expect(result.width).toBe(3);
    expect(result.blocks[1].length).toBe(3);
    expect(result.blocks[1][2]).toEqual({});
  });

  it('handles empty input', () => {
    const result = parseAnsiToBlocks('');
    expect(result.height).toBe(0);
    expect(result.width).toBe(0);
    expect(result.blocks).toEqual([]);
  });

  // ── 256-color ──────────────────────────────────────────────────

  it('parses 256-color fg', () => {
    const input = '\x1b[38;5;196mX';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[0][0].char).toBe('X');
  });

  it('parses 256-color bg', () => {
    const input = '\x1b[48;5;21mY';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].bg).toBeDefined();
    expect(result.blocks[0][0].char).toBe('Y');
  });

  it('parses combined 256-color fg+bg', () => {
    const input = '\x1b[38;5;196;48;5;21mZ';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[196]);
    expect(result.blocks[0][0].bg).toBe(ANSI_TO_MIRC[21]);
    expect(result.blocks[0][0].char).toBe('Z');
  });

  // ── 16-color ───────────────────────────────────────────────────

  it('parses standard 16-color fg (30-37)', () => {
    const input = '\x1b[31mA'; // red
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[1]);
    expect(result.blocks[0][0].char).toBe('A');
  });

  it('parses standard 16-color bg (40-47)', () => {
    const input = '\x1b[44mB'; // blue bg
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].bg).toBe(ANSI_TO_MIRC[4]);
    expect(result.blocks[0][0].char).toBe('B');
  });

  // ── Bold + 16-color ────────────────────────────────────────────

  it('bold shifts 16-color to bright variant', () => {
    const input = '\x1b[1;31mC'; // bold + red → bright red
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[9]); // bright red
  });

  it('bold off (22) reverts to standard 16-color', () => {
    const input = '\x1b[1m\x1b[22;31mD';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[1]); // standard red
  });

  // ── Bright 16-color (90-97, 100-107) ───────────────────────────

  it('parses bright fg (90-97)', () => {
    const input = '\x1b[91mE'; // bright red fg
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[9]);
  });

  it('parses bright bg (100-107)', () => {
    const input = '\x1b[104mF'; // bright blue bg
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].bg).toBe(ANSI_TO_MIRC[12]);
  });

  // ── 24-bit truecolor ───────────────────────────────────────────

  it('parses truecolor fg', () => {
    const input = '\x1b[38;2;255;0;0mG'; // pure red
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[0][0].char).toBe('G');
    // Should map close to mIRC red
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[196]);
  });

  it('parses truecolor bg', () => {
    const input = '\x1b[48;2;0;0;255mH'; // pure blue
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].bg).toBeDefined();
    expect(result.blocks[0][0].char).toBe('H');
  });

  // ── Reset ──────────────────────────────────────────────────────

  it('ESC[0m resets all attributes', () => {
    const input = '\x1b[38;5;196;48;5;21mX\x1b[0mY';
    const result = parseAnsiToBlocks(input);
    // First char has colors
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[0][0].bg).toBeDefined();
    // Second char is reset
    expect(result.blocks[0][1].fg).toBeUndefined();
    expect(result.blocks[0][1].bg).toBeUndefined();
    expect(result.blocks[0][1].char).toBe('Y');
  });

  it('ESC[m (empty params) resets', () => {
    const input = '\x1b[38;5;196mX\x1b[mY';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[0][1].fg).toBeUndefined();
  });

  it('ESC[39m resets fg to default', () => {
    const input = '\x1b[38;5;196mX\x1b[39mY';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[0][1].fg).toBeUndefined();
  });

  it('ESC[49m resets bg to default', () => {
    const input = '\x1b[48;5;21mX\x1b[49mY';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].bg).toBeDefined();
    expect(result.blocks[0][1].bg).toBeUndefined();
  });

  // ── State resets at line boundaries ────────────────────────────

  it('resets color state at each line boundary', () => {
    const input = '\x1b[38;5;196mA\nB';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBeDefined();
    expect(result.blocks[1][0].fg).toBeUndefined();
  });

  // ── Combined SGR ───────────────────────────────────────────────

  it('parses multiple attributes in one escape', () => {
    // Bold + fg + bg in one sequence
    const input = '\x1b[1;38;5;196;48;5;21mX';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[196]);
    expect(result.blocks[0][0].bg).toBe(ANSI_TO_MIRC[21]);
    expect(result.blocks[0][0].char).toBe('X');
  });

  // ── Malformed sequences ────────────────────────────────────────

  it('handles incomplete 256-color gracefully', () => {
    const input = '\x1b[38;5;mX'; // missing N
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].char).toBe('X');
  });

  it('handles incomplete truecolor gracefully', () => {
    const input = '\x1b[38;2;255;0mX'; // missing B
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].char).toBe('X');
  });

  it('handles bare ESC[ without params', () => {
    const input = 'A\x1b[mB';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[0][1].char).toBe('B');
  });

  it('handles carriage return', () => {
    const result = parseAnsiToBlocks('A\r\nB');
    expect(result.height).toBe(2);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[1][0].char).toBe('B');
  });

  // ── SAUCE metadata ─────────────────────────────────────────────

  it('strips SAUCE metadata from end of content', () => {
    const sauce = 'SAUCE00' + 'x'.repeat(121);
    const input = '\x1b[38;5;196mX\n' + sauce;
    const result = parseAnsiToBlocks(input);
    // Should only have the real content, not SAUCE junk
    expect(result.height).toBe(1);
    expect(result.blocks[0][0].char).toBe('X');
  });

  it('does not strip SAUCE-like text in middle of content', () => {
    const input = 'SAUCE00some data here\nreal line';
    const result = parseAnsiToBlocks(input);
    expect(result.height).toBe(2);
  });

  // ── Large / performance ────────────────────────────────────────

  it('handles wide lines (200+ chars)', () => {
    const line = 'A'.repeat(200);
    const result = parseAnsiToBlocks(line);
    expect(result.width).toBe(200);
    expect(result.blocks[0].length).toBe(200);
  });

  it('handles many lines', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line${i}`);
    const result = parseAnsiToBlocks(lines.join('\n'));
    expect(result.height).toBe(100);
  });

  // ── Flat ANSI (no newlines, targetWidth wrapping) ──────────────

  it('wraps flat content at targetWidth', () => {
    // 10 characters with targetWidth=5 → 2 rows of 5
    const result = parseAnsiToBlocks('ABCDEFGHIJ', 5);
    expect(result.width).toBe(5);
    expect(result.height).toBe(2);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[0][4].char).toBe('E');
    expect(result.blocks[1][0].char).toBe('F');
    expect(result.blocks[1][4].char).toBe('J');
  });

  it('wraps flat ANSI with colors at targetWidth', () => {
    // 6 colored chars, targetWidth=3 → 2 rows of 3
    const input = '\x1b[31mAAA\x1b[32mBBB';
    const result = parseAnsiToBlocks(input, 3);
    expect(result.width).toBe(3);
    expect(result.height).toBe(2);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[1]); // red
    expect(result.blocks[1][0].fg).toBe(ANSI_TO_MIRC[2]); // green
  });

  it('carries SGR state across line wraps (no reset)', () => {
    // 5 red chars wrapping at 3 → row 1 has 3 red, row 2 has 2 red
    const input = '\x1b[31mAAAAA';
    const result = parseAnsiToBlocks(input, 3);
    expect(result.height).toBe(2);
    // All chars should be red — state carries across wrap
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[1]);
    expect(result.blocks[1][0].fg).toBe(ANSI_TO_MIRC[1]);
    expect(result.blocks[1][1].fg).toBe(ANSI_TO_MIRC[1]);
  });

  it('targetWidth=0 disables wrapping', () => {
    const result = parseAnsiToBlocks('A'.repeat(200), 0);
    expect(result.width).toBe(200);
    expect(result.height).toBe(1);
  });

  it('handles leftover chars that do not fill a complete row', () => {
    // 7 chars with targetWidth=3 → 2 full rows + 1 partial row
    const result = parseAnsiToBlocks('ABCDEFG', 3);
    expect(result.height).toBe(3);
    expect(result.width).toBe(3);
    // Last row padded to width
    expect(result.blocks[2][0].char).toBe('G');
    expect(result.blocks[2][1]).toEqual({}); // padded
  });

  // ── Unknown SGR codes ──────────────────────────────────────────

  it('ignores underline (4) and reverse (7)', () => {
    const input = '\x1b[4;7;38;5;196mX';
    const result = parseAnsiToBlocks(input);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[196]);
    expect(result.blocks[0][0].char).toBe('X');
  });

  // ── Line-ending variants ────────────────────────────────────────

  it('handles \\r-only line endings', () => {
    const result = parseAnsiToBlocks('A\rB\rC');
    expect(result.height).toBe(3);
    expect(result.width).toBe(1);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[1][0].char).toBe('B');
    expect(result.blocks[2][0].char).toBe('C');
  });

  it('handles \\r\\n line endings', () => {
    const result = parseAnsiToBlocks('A\r\nB');
    expect(result.height).toBe(2);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[1][0].char).toBe('B');
  });

  it('handles mixed \\r\\n and \\n line endings', () => {
    const result = parseAnsiToBlocks('A\r\nB\nC');
    expect(result.height).toBe(3);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[1][0].char).toBe('B');
    expect(result.blocks[2][0].char).toBe('C');
  });

  it('preserves empty lines with \\n', () => {
    const result = parseAnsiToBlocks('A\n\nB');
    expect(result.height).toBe(3);
    expect(result.blocks[1]).toEqual([{}]); // empty row padded to width 1
  });

  it('handles consecutive \\r\\n\\r\\n', () => {
    const result = parseAnsiToBlocks('A\r\n\r\nB');
    expect(result.height).toBe(3);
    expect(result.blocks[0][0].char).toBe('A');
    expect(result.blocks[1][0]).toEqual({}); // empty row padded
    expect(result.blocks[2][0].char).toBe('B');
  });

  it('handles \\r\\n with ANSI colors', () => {
    const input = '\x1b[31mA\r\n\x1b[32mB';
    const result = parseAnsiToBlocks(input);
    expect(result.height).toBe(2);
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[1]);
    expect(result.blocks[1][0].fg).toBe(ANSI_TO_MIRC[2]);
  });
});

// ─── ANSI_TO_MIRC mapping ────────────────────────────────────────

describe('ANSI_TO_MIRC', () => {
  it('has 256 entries', () => {
    expect(ANSI_TO_MIRC.length).toBe(256);
  });

  it('maps each entry to a valid mIRC index (0-98)', () => {
    for (const mirc of ANSI_TO_MIRC) {
      expect(mirc).toBeGreaterThanOrEqual(0);
      expect(mirc).toBeLessThanOrEqual(98);
    }
  });

  it('maps ANSI black (0) to mIRC black (1)', () => {
    // mIRC color 1 is black (#000000)
    expect(ANSI_TO_MIRC[0]).toBe(1);
  });

  it('maps ANSI white (15) to mIRC white (0)', () => {
    // mIRC color 0 is white (#FFFFFF)
    expect(ANSI_TO_MIRC[15]).toBe(0);
  });

  it('maps ANSI red (9) to mIRC red (4)', () => {
    // mIRC color 4 is red
    expect(ANSI_TO_MIRC[9]).toBe(4);
  });
});

// ─── isAnsiContent ────────────────────────────────────────────────

describe('isAnsiContent', () => {
  it('returns true for ANSI content', () => {
    expect(isAnsiContent('\x1b[31mHello')).toBe(true);
  });

  it('returns false for mIRC content', () => {
    expect(isAnsiContent('\x034Hello')).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(isAnsiContent('Hello World')).toBe(false);
  });

  it('returns true for content with both ANSI and mIRC', () => {
    expect(isAnsiContent('\x1b[31m\x034Hello')).toBe(true);
  });
});

// ─── Round-trip: export → import ─────────────────────────────────

describe('round-trip export→import', () => {
  // We need to test with actual mIRC colors mapped through ANSI

  it('preserves character positions after export→import', async () => {
    const { exportAnsi } = await import('../../src/utils/ansiExport');
    const blocks: Block[][] = [
      [
        { fg: 0, bg: 1, char: 'H' },
        { fg: 4, bg: undefined, char: 'i' },
        { char: '!' },
      ],
    ];
    const exported = exportAnsi(blocks);
    const result = parseAnsiToBlocks(exported);
    expect(result.blocks[0][0].char).toBe('H');
    expect(result.blocks[0][1].char).toBe('i');
    expect(result.blocks[0][2].char).toBe('!');
  });

  it('preserves fg colors through round-trip (approximate)', async () => {
    const { exportAnsi } = await import(
      '../../src/utils/ansiExport'
    );
    const { IRC_TO_ANSI } = await import(
      '../../src/utils/ansiColors'
    );
    const mircFg = 4; // mIRC red
    const blocks: Block[][] = [[{ fg: mircFg, char: 'X' }]];
    const exported = exportAnsi(blocks);
    const result = parseAnsiToBlocks(exported);
    // The round-trip should map the ANSI color back to the same mIRC color
    const ansiFg = IRC_TO_ANSI[mircFg];
    expect(result.blocks[0][0].fg).toBe(ANSI_TO_MIRC[ansiFg]);
  });

  it('preserves bg colors through round-trip (approximate)', async () => {
    const { exportAnsi } = await import(
      '../../src/utils/ansiExport'
    );
    const { IRC_TO_ANSI } = await import(
      '../../src/utils/ansiColors'
    );
    const mircBg = 2; // mIRC navy
    const blocks: Block[][] = [[{ bg: mircBg, char: ' ' }]];
    const exported = exportAnsi(blocks);
    const result = parseAnsiToBlocks(exported);
    const ansiBg = IRC_TO_ANSI[mircBg];
    expect(result.blocks[0][0].bg).toBe(ANSI_TO_MIRC[ansiBg]);
  });
});

// ─── parseAnsiAscii (full import into store) ────────────────────

describe('parseAnsiAscii', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('creates a new tab with ANSI content', async () => {
    const content = '\x1b[31mHello\x1b[0m World';
    const result = await parseAnsiAscii(content, 'test.ans');
    expect(result).toBe(true);
  });

  it('returns false for empty content', async () => {
    const result = await parseAnsiAscii('', 'empty.ans');
    expect(result).toBe(false);
  });

  it('handles whitespace content as valid input', async () => {
    // Whitespace has width > 0 and height > 0, so parseAnsiAscii succeeds
    const result = await parseAnsiAscii('   \n  ', 'whitespace.ans');
    expect(result).toBe(true);
  });
});
