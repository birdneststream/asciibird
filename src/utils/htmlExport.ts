// HTML Export Utility — converts mIRC art to a styled HTML document.
//
// Generates a standalone HTML file with inline styles using mIRC palette
// colors. Handles HTML entity escaping for special characters.
// Uses mergeLayers() to flatten all visible layers (consistent with ANSI export).

import { mircColours99, mergeLayers, downloadFile } from '../ascii';
import type { Block } from '../types';

// ─── HTML Entity Escaping ────────────────────────────────────────

/**
 * Escape special HTML characters to prevent XSS and rendering issues.
 * Handles: &, <, >, ", '
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── HTML Generation ─────────────────────────────────────────────

/**
 * Convert Block[][] to an HTML pre-formatted fragment.
 * Each block becomes a <span> with inline color styles.
 * Returns just the inner HTML content (no wrapper document).
 */
export function exportHtmlFragment(blocks: Block[][]): string {
  const lines: string[] = [];

  for (let y = 0; y < blocks.length; y++) {
    const spans: string[] = [];

    for (let x = 0; x < blocks[y].length; x++) {
      const block = blocks[y][x];
      const fg = block?.fg;
      const bg = block?.bg;
      const char = block?.char;

      // Determine the character to display
      const displayChar = char || ' ';

      // Skip empty blocks — just output a plain space
      if (
        fg === undefined && bg === undefined &&
        (!char || char === ' ')
      ) {
        spans.push(' ');
        continue;
      }

      // Build inline style
      const styles: string[] = [];
      if (fg !== undefined && fg !== null) {
        styles.push(`color:${mircColours99[fg] || 'inherit'}`);
      }
      if (bg !== undefined && bg !== null) {
        styles.push(`background-color:${mircColours99[bg] || 'transparent'}`);
      }

      const escapedChar = escapeHtml(displayChar);
      if (styles.length > 0) {
        spans.push(`<span style="${styles.join(';')}">${escapedChar}</span>`);
      } else {
        spans.push(escapedChar);
      }
    }

    lines.push(spans.join(''));
  }

  return lines.join('\n');
}

/**
 * Convert Block[][] to a standalone HTML document.
 * Includes embedded CSS with monospace font and proper line-height
 * for block art rendering.
 */
export function exportHtmlDocument(blocks: Block[][]): string {
  const fragment = exportHtmlFragment(blocks);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ASCIIBIRD Export</title>
<style>
  body {
    margin: 0;
    padding: 16px;
    background: #1e1e1e;
    color: #d4d4d4;
  }
  pre {
    font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.1;
    letter-spacing: 0;
    margin: 0;
    padding: 8px;
    background: #000;
    display: inline-block;
    border-radius: 4px;
  }
  span {
    text-decoration: none;
  }
</style>
</head>
<body>
<pre>${fragment}</pre>
</body>
</html>`;
}

/**
 * Download merged layers as an HTML file.
 * @param title - filename for the download (without .html extension)
 */
export function downloadHtml(title: string): void {
  const blocks = mergeLayers();
  const htmlContent = exportHtmlDocument(blocks);
  const filename = title.endsWith('.html') ? title : `${title}.html`;
  downloadFile(htmlContent, filename, 'text/html');
}
