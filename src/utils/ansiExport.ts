/**
 * ANSI Export Utility — converts mIRC art to ANSI terminal escape codes.
 *
 * Maps the 99 mIRC colors to the closest ANSI 256-color equivalents using
 * Euclidean RGB distance. Produces a raw ANSI escape sequence string
 * suitable for terminal display.
 */

import { mircColours99, mergeLayers, downloadFile } from '../ascii';
import type { Block } from '../types';

// ─── ANSI 256-color helpers ────────────────────────────────────

/** Parse color string to [r, g, b]. Handles #hex and rgb() formats. */
function parseColor(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  if (hex.length === 6 && !hex.startsWith('rgb')) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }
  // Handle rgb(r,g,b) or rgb(r, g, b)
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [
      Number.parseInt(match[1], 10),
      Number.parseInt(match[2], 10),
      Number.parseInt(match[3], 10),
    ];
  }
  return [0, 0, 0];
}

/** Get RGB for an ANSI 256-color index */
function ansiToRgb(index: number): [number, number, number] {
  if (index < 16) {
    const standard16: [number, number, number][] = [
      [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
      [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
      [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
      [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
    ];
    return standard16[index] ?? [0, 0, 0];
  }
  if (index < 232) {
    // 6x6x6 color cube
    const i = index - 16;
    const b = i % 6;
    const g = Math.floor(i / 6) % 6;
    const r = Math.floor(i / 36) % 6;
    const cube = [0, 95, 135, 175, 215, 255];
    return [cube[r], cube[g], cube[b]];
  }
  // Grayscale (232-255)
  const gray = 8 + (index - 232) * 10;
  return [gray, gray, gray];
}

/** Euclidean RGB distance */
function colorDistance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/** Find the closest ANSI 256-color for an RGB value */
function closestAnsiColor(rgb: [number, number, number]): number {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < 256; i++) {
    const d = colorDistance(rgb, ansiToRgb(i));
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// ─── Pre-computed IRC→ANSI color mapping ───────────────────────

/** Maps each of the 99 mIRC color indices to the closest ANSI 256-color */
export const IRC_TO_ANSI: number[] = mircColours99.map(color => {
  const rgb = parseColor(color);
  return closestAnsiColor(rgb);
});

// ─── Half-block characters ─────────────────────────────────────

const UPPER_HALF = '\u2580'; // ▀
const LOWER_HALF = '\u2584'; // ▄
const FULL_BLOCK = '\u2588'; // █
const HALF_BLOCK_CHARS = new Set([UPPER_HALF, LOWER_HALF]);

// ─── Export functions ───────────────────────────────────────────

/**
 * Convert Block[][] to ANSI escape sequence string.
 *
 * Handles:
 * - Half blocks (▀/▄): fg+bg codes + character (▄ normalized to ▀)
 * - Full blocks (█): treated as bg-colored space
 * - Regular characters: fg+bg codes + char
 * - Empty blocks: plain space (with reset if needed)
 * - Deduplication: skips redundant escape codes
 * - Line reset: ESC[0m at end of each line
 */
export function exportAnsi(blocks: Block[][]): string {
  const lines: string[] = [];

  for (let y = 0; y < blocks.length; y++) {
    let line = '';
    let prevFg: number | null = null;
    let prevBg: number | null = null;

    for (let x = 0; x < blocks[y].length; x++) {
      const block = blocks[y][x];
      const fg = block?.fg ?? undefined;
      const bg = block?.bg ?? undefined;
      const char = block?.char ?? ' ';

      // Skip empty blocks
      if (
        fg === undefined && bg === undefined &&
        (char === ' ' || char === undefined || char === null)
      ) {
        if (prevFg !== null || prevBg !== null) {
          line += '\x1b[0m';
          prevFg = null;
          prevBg = null;
        }
        line += ' ';
        continue;
      }

      const ansiFg = fg !== undefined ? IRC_TO_ANSI[fg] : undefined;
      const ansiBg = bg !== undefined ? IRC_TO_ANSI[bg] : undefined;

      if (HALF_BLOCK_CHARS.has(char)) {
        if (char === UPPER_HALF) {
          // ▀ : fg=top color, bg=bottom color
          if (ansiFg !== prevFg || ansiBg !== prevBg) {
            line += `\x1b[38;5;${ansiFg ?? 0};48;5;${ansiBg ?? 0}m`;
            prevFg = ansiFg ?? null;
            prevBg = ansiBg ?? null;
          }
          line += UPPER_HALF;
        } else {
          // ▄ : normalize to ▀ with swapped colors
          if (ansiBg !== prevFg || ansiFg !== prevBg) {
            line += `\x1b[38;5;${ansiBg ?? 0};48;5;${ansiFg ?? 0}m`;
            prevFg = ansiBg ?? null;
            prevBg = ansiFg ?? null;
          }
          line += UPPER_HALF;
        }
      } else if (char === FULL_BLOCK) {
        // Full block: render as space with fg color as bg
        if (ansiFg !== prevBg) {
          line += `\x1b[48;5;${ansiFg ?? 0}m`;
          prevBg = ansiFg ?? null;
          prevFg = null;
        }
        line += ' ';
      } else if (char === ' ') {
        // Space with bg color only
        if (ansiBg !== prevBg) {
          line += `\x1b[48;5;${ansiBg ?? 0}m`;
          prevBg = ansiBg ?? null;
          prevFg = null;
        }
        line += ' ';
      } else {
        // Regular character with fg and optional bg
        if (ansiFg !== prevFg || ansiBg !== prevBg) {
          line += `\x1b[38;5;${ansiFg ?? 7};48;5;${ansiBg ?? 0}m`;
          prevFg = ansiFg ?? null;
          prevBg = ansiBg ?? null;
        }
        line += char;
      }
    }

    // Reset at end of line
    line += '\x1b[0m';
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Download merged layers as an ANSI .ans file.
 * @param title - filename for the download (without .ans extension)
 */
export function downloadAnsi(title: string): void {
  const blocks = mergeLayers();
  const ansiContent = exportAnsi(blocks);
  const filename = title.endsWith('.ans') ? title : `${title}.ans`;
  downloadFile(ansiContent, filename, 'text/x-ansi');
}
