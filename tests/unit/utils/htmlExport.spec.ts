// Tests for HTML export utility
import { describe, it, expect } from 'vitest';
import {
  exportHtmlFragment,
  exportHtmlDocument,
} from '../../../src/utils/htmlExport';
import type { Block } from '../../../src/types';

describe('htmlExport', () => {
  describe('exportHtmlFragment', () => {
    it('exports a simple block with fg and bg colors', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: 'X' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('<span style="');
      expect(html).toContain('color:');
      expect(html).toContain('background-color:');
      expect(html).toContain('X</span>');
    });

    it('escapes HTML special characters', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: '<script>' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });

    it('escapes ampersands', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: 'A&B' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('A&amp;B');
      expect(html).not.toContain('A&B');
    });

    it('escapes quotes', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: '"hello"' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('&quot;hello&quot;');
    });

    it('outputs plain space for empty blocks', () => {
      const blocks: Block[][] = [
        [{}, { fg: 0, char: 'A' }, {}],
      ];
      const html = exportHtmlFragment(blocks);

      // Should have spaces for empty blocks, not spans
      expect(html).toMatch(/^ <span/);
    });

    it('handles blocks with only fg color', () => {
      const blocks: Block[][] = [
        [{ fg: 5, char: 'X' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('color:');
      expect(html).not.toContain('background-color:');
    });

    it('handles blocks with only bg color', () => {
      const blocks: Block[][] = [
        [{ bg: 5, char: ' ' }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('background-color:');
      // Should NOT have a separate 'color:' style
      expect(html).not.toMatch(/[^-]color:/);
    });

    it('handles multi-row grids with newline separators', () => {
      const blocks: Block[][] = [
        [{ fg: 0, char: 'A' }],
        [{ fg: 1, char: 'B' }],
      ];
      const html = exportHtmlFragment(blocks);

      const lines = html.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain('A');
      expect(lines[1]).toContain('B');
    });

    it('handles empty grid', () => {
      const blocks: Block[][] = [];
      const html = exportHtmlFragment(blocks);

      expect(html).toBe('');
    });

    it('handles block with null properties', () => {
      const blocks: Block[][] = [
        [{ fg: null, bg: null, char: null }],
      ];
      const html = exportHtmlFragment(blocks);

      // Null values should be treated as undefined → plain space
      expect(html).toBe(' ');
    });

    it('handles single apostrophe escaping', () => {
      const blocks: Block[][] = [
        [{ fg: 0, char: "it's" }],
      ];
      const html = exportHtmlFragment(blocks);

      expect(html).toContain('it&#039;s');
    });
  });

  describe('exportHtmlDocument', () => {
    it('produces a valid HTML document', () => {
      const blocks: Block[][] = [
        [{ fg: 0, bg: 1, char: 'X' }],
      ];
      const html = exportHtmlDocument(blocks);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
      expect(html).toContain('<pre>');
      expect(html).toContain('</pre>');
    });

    it('includes JetBrains Mono font', () => {
      const blocks: Block[][] = [[{}]];
      const html = exportHtmlDocument(blocks);

      expect(html).toContain('JetBrains Mono');
    });

    it('includes the fragment content inside pre tag', () => {
      const blocks: Block[][] = [
        [{ fg: 0, char: 'A' }],
      ];
      const html = exportHtmlDocument(blocks);

      expect(html).toContain('>A<');
    });
  });
});
