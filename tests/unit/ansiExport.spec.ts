/**
 * Tests for ANSI export utility
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { exportAnsi, IRC_TO_ANSI } from '../../src/utils/ansiExport';
import type { Block } from '../../src/types';

// Mock mergeLayers + downloadFile so tests don't need a real Pinia store
vi.mock('../../src/ascii', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/ascii')>();
  return {
    ...actual,
    downloadFile: vi.fn(),
    mergeLayers: vi.fn(),
  };
});

// Escape character for ANSI sequences (avoids no-control-regex lint rule)
const E = '\x1b';
// Dynamic regex builder to avoid no-control-regex lint errors
const escSeq = (pattern: string) => new RegExp(E + pattern);

describe('ansiExport', () => {
  describe('IRC_TO_ANSI color mapping', () => {
    it('should map all 99 mIRC colors to ANSI 256-color indices', () => {
      expect(IRC_TO_ANSI).toHaveLength(99);
      for (const ansiIdx of IRC_TO_ANSI) {
        expect(ansiIdx).toBeGreaterThanOrEqual(0);
        expect(ansiIdx).toBeLessThanOrEqual(255);
        expect(Number.isInteger(ansiIdx)).toBe(true);
      }
    });

    it('should map mIRC color 0 (white) to ANSI bright white', () => {
      expect(IRC_TO_ANSI[0]).toBe(15);
    });

    it('should map mIRC color 1 (black) to ANSI black', () => {
      expect(IRC_TO_ANSI[1]).toBe(0);
    });
  });

  describe('exportAnsi', () => {
    it('should produce ANSI reset at end of each line', () => {
      const blocks: Block[][] = [
        [{ char: 'A', fg: 0, bg: 1 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toContain(`${E}[0m`);
      expect(result.endsWith(`${E}[0m`)).toBe(true);
    });

    it('should join lines with newline', () => {
      const blocks: Block[][] = [
        [{ char: 'A', fg: 0, bg: 1 }],
        [{ char: 'B', fg: 0, bg: 1 }],
      ];
      const result = exportAnsi(blocks);
      const lines = result.split('\n');
      expect(lines).toHaveLength(2);
    });

    it('should render regular characters with fg and bg colors', () => {
      const blocks: Block[][] = [
        [{ char: 'X', fg: 4, bg: 2 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toMatch(escSeq('\\[38;5;\\d+;48;5;\\d+mX' + E + '\\[0m'));
      expect(result).toContain('X');
    });

    it('should handle empty blocks as plain spaces', () => {
      const blocks: Block[][] = [
        [{ char: ' ', fg: undefined, bg: undefined }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toBe(` ${E}[0m`);
    });

    it('should handle null fg/bg as defaults', () => {
      const blocks: Block[][] = [
        [{ char: 'Z', fg: null, bg: null }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toContain('Z');
    });

    it('should render full blocks as bg-colored spaces', () => {
      const blocks: Block[][] = [
        [{ char: '\u2588', fg: 5, bg: 2 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toMatch(escSeq('\\[48;5;\\d+m ' + E + '\\[0m'));
    });

    it('should render upper half blocks with fg and bg', () => {
      const blocks: Block[][] = [
        [{ char: '\u2580', fg: 10, bg: 3 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toContain('\u2580');
      expect(result).toMatch(escSeq('\\[38;5;\\d+;48;5;\\d+m'));
    });

    it('should normalize lower half blocks to upper half', () => {
      const blocks: Block[][] = [
        [{ char: '\u2584', fg: 10, bg: 3 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toContain('\u2580');
      expect(result).not.toContain('\u2584');
    });

    it('should deduplicate consecutive same-color escape codes', () => {
      const blocks: Block[][] = [
        [
          { char: 'A', fg: 4, bg: 2 },
          { char: 'B', fg: 4, bg: 2 },
        ],
      ];
      const result = exportAnsi(blocks);
      const escapeCount = (result.match(new RegExp(E + '\\[38;5;', 'g')) ?? []).length;
      expect(escapeCount).toBe(1);
    });

    it('should emit new escape codes when colors change', () => {
      const blocks: Block[][] = [
        [
          { char: 'A', fg: 4, bg: 2 },
          { char: 'B', fg: 7, bg: 5 },
        ],
      ];
      const result = exportAnsi(blocks);
      const escapeCount = (result.match(new RegExp(E + '\\[38;5;', 'g')) ?? []).length;
      expect(escapeCount).toBe(2);
    });

    it('should handle spaces with bg color only', () => {
      const blocks: Block[][] = [
        [{ char: ' ', fg: undefined, bg: 4 }],
      ];
      const result = exportAnsi(blocks);
      expect(result).toMatch(escSeq('\\[48;5;\\d+m ' + E + '\\[0m'));
    });

    it('should handle an empty grid', () => {
      const blocks: Block[][] = [];
      const result = exportAnsi(blocks);
      expect(result).toBe('');
    });

    it('should handle a row with no blocks', () => {
      const blocks: Block[][] = [[]];
      const result = exportAnsi(blocks);
      expect(result).toBe(`${E}[0m`);
    });

    it('should handle mixed content row', () => {
      const blocks: Block[][] = [
        [
          { char: ' ', fg: undefined, bg: undefined },
          { char: 'H', fg: 0, bg: 1 },
          { char: 'i', fg: 0, bg: 1 },
          { char: ' ', fg: undefined, bg: undefined },
        ],
      ];
      const result = exportAnsi(blocks);
      expect(result).toContain('H');
      expect(result).toContain('i');
    });

    it('should treat fg=0 as a valid color (not falsy skip)', () => {
      // mIRC color 0 = white → should generate fg escape code
      const blocks: Block[][] = [[{ char: 'X', fg: 0, bg: 1 }]];
      const result = exportAnsi(blocks);
      expect(result).toMatch(escSeq('\\[38;5;15')); // mIRC 0 → ANSI 15 (white)
      expect(result).toContain('X');
    });
  });
});
