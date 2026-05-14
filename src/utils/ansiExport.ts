/**
 * ANSI Export Utility — converts mIRC art to ANSI terminal escape codes.
 *
 * Maps the 99 mIRC colors to the closest ANSI 256-color equivalents using
 * Euclidean RGB distance. Produces a raw ANSI escape sequence string
 * suitable for terminal display.
 */

import { mergeLayers, downloadFile } from '../ascii';
import { IRC_TO_ANSI } from './ansiColors';
import type { Block } from '../types';

// Re-export for backward compatibility with existing imports
export { IRC_TO_ANSI } from './ansiColors';

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
