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

// ─── State for ANSI color deduplication ────────────────────────

interface ColorState {
  prevFg: number | null;
  prevBg: number | null;
}

// ─── Block rendering helpers ───────────────────────────────────

/**
 * Render an empty block — just a space, with optional reset.
 */
function renderEmptyBlock(state: ColorState): string {
  let out = '';
  if (state.prevFg !== null || state.prevBg !== null) {
    out += '\x1b[0m';
    state.prevFg = null;
    state.prevBg = null;
  }
  return out + ' ';
}

/**
 * Render a half-block character (▀ or ▄ normalized to ▀).
 */
function renderHalfBlock(
  char: string, ansiFg: number | undefined, ansiBg: number | undefined,
  state: ColorState,
): string {
  let out = '';
  if (char === UPPER_HALF) {
    // ▀ : fg=top color, bg=bottom color
    if (ansiFg !== state.prevFg || ansiBg !== state.prevBg) {
      out += `\x1b[38;5;${ansiFg ?? 0};48;5;${ansiBg ?? 0}m`;
      state.prevFg = ansiFg ?? null;
      state.prevBg = ansiBg ?? null;
    }
    out += UPPER_HALF;
  } else {
    // ▄ : normalize to ▀ with swapped colors
    if (ansiBg !== state.prevFg || ansiFg !== state.prevBg) {
      out += `\x1b[38;5;${ansiBg ?? 0};48;5;${ansiFg ?? 0}m`;
      state.prevFg = ansiBg ?? null;
      state.prevBg = ansiFg ?? null;
    }
    out += UPPER_HALF;
  }
  return out;
}

/**
 * Render a full block (█) as a bg-colored space.
 */
function renderFullBlock(ansiFg: number | undefined, state: ColorState): string {
  let out = '';
  if (ansiFg !== state.prevBg) {
    out += `\x1b[48;5;${ansiFg ?? 0}m`;
    state.prevBg = ansiFg ?? null;
    state.prevFg = null;
  }
  return out + ' ';
}

/**
 * Render a space character with bg color only.
 */
function renderColorSpace(ansiBg: number | undefined, state: ColorState): string {
  let out = '';
  if (ansiBg !== state.prevBg) {
    out += `\x1b[48;5;${ansiBg ?? 0}m`;
    state.prevBg = ansiBg ?? null;
    state.prevFg = null;
  }
  return out + ' ';
}

/**
 * Render a regular character with fg and optional bg.
 */
function renderRegularChar(
  char: string, ansiFg: number | undefined, ansiBg: number | undefined,
  state: ColorState,
): string {
  let out = '';
  if (ansiFg !== state.prevFg || ansiBg !== state.prevBg) {
    out += `\x1b[38;5;${ansiFg ?? 7};48;5;${ansiBg ?? 0}m`;
    state.prevFg = ansiFg ?? null;
    state.prevBg = ansiBg ?? null;
  }
  return out + char;
}

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
    const state: ColorState = { prevFg: null, prevBg: null };

    for (let x = 0; x < blocks[y].length; x++) {
      const block = blocks[y][x];
      const fg = block?.fg ?? undefined;
      const bg = block?.bg ?? undefined;
      const char = block?.char ?? ' ';

      // Skip empty blocks
      if (fg === undefined && bg === undefined &&
        (char === ' ' || char === undefined || char === null)) {
        line += renderEmptyBlock(state);
        continue;
      }

      const ansiFg = fg !== undefined ? IRC_TO_ANSI[fg] : undefined;
      const ansiBg = bg !== undefined ? IRC_TO_ANSI[bg] : undefined;

      if (HALF_BLOCK_CHARS.has(char)) {
        line += renderHalfBlock(char, ansiFg, ansiBg, state);
      } else if (char === FULL_BLOCK) {
        line += renderFullBlock(ansiFg, state);
      } else if (char === ' ') {
        line += renderColorSpace(ansiBg, state);
      } else {
        line += renderRegularChar(char, ansiFg, ansiBg, state);
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
