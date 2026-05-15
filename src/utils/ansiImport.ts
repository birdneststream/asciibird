/**
 * ANSI Import Utility — parses ANSI terminal escape sequences into
 * ASCIIBIRD Block format.
 *
 * Supports:
 * - 256-color: ESC[38;5;Nm (fg), ESC[48;5;Nm (bg)
 * - 16-color: ESC[30-37m (fg), ESC[40-47m (bg)
 * - Bright 16-color: ESC[90-97m (fg), ESC[100-107m (bg)
 * - Bold + 16-color: ESC[1m shifts 16-color to bright (8-15)
 * - 24-bit truecolor: ESC[38;2;R;G;Bm (fg), ESC[48;2;R;G;Bm (bg)
 * - Combined SGR: multiple attributes in one ESC[...m sequence
 * - Reset: ESC[0m
 *
 * Limitations:
 * - No CP437 decoding (assumes UTF-8 input)
 * - Cursor positioning codes are ignored
 * - Round-trip loss: ▄→▀ normalization and █→space in export are
 *   not reversible
 */

import LZString from 'lz-string';
import { fillNullBlocks, blockWidth, blockHeight, defaultImageOverlay } from '../ascii';
import {
  ANSI_TO_MIRC,
  closestMircColor,
  ANSI16_STANDARD,
  ANSI16_BRIGHT,
} from './ansiColors';
import {
  decodeAnsiBuffer,
  stripSauceBytes,
} from './cp437';
import type { Block, Layer, AsciibirdMetaBuilder } from '../types';

// ─── Image overlay default ───────────────────────────────────────
// (imported from ascii.ts — single source of truth)

// ─── SAUCE metadata stripping ────────────────────────────────────

/**
 * Strip SAUCE (Standard Architecture for Universal Comment Extensions)
 * metadata from ANSI file content. SAUCE records are exactly 128 bytes
 * at the very end of the file starting with "SAUCE00".
 */
function stripSauce(contents: string): string {
  if (contents.length < 128) return contents;
  const sauceStart = contents.length - 128;
  if (contents.slice(sauceStart, sauceStart + 7) === 'SAUCE00') {
    return contents.slice(0, sauceStart);
  }
  return contents;
}

// ─── SGR attribute parser ────────────────────────────────────────

interface SgrState {
  fg: number | null;   // mIRC color index
  bg: number | null;   // mIRC color index
  bold: boolean;
}

/**
 * Process an array of SGR parameters and update color state.
 * Handles:
 * - 0: reset
 * - 1: bold (affects 16-color interpretation)
 * - 30-37: standard fg
 * - 38;5;N: 256-color fg
 * - 38;2;R;G;B: truecolor fg
 * - 40-47: standard bg
 * - 48;5;N: 256-color bg
 * - 48;2;R;G;B: truecolor bg
 * - 90-97: bright fg
 * - 100-107: bright bg
 * - 22: bold off
 * - 39: default fg
 * - 49: default bg
 */
function applySgr(params: number[], state: SgrState): void {
  let i = 0;
  while (i < params.length) {
    const p = params[i];

    if (p === 0) {
      // Full reset
      state.fg = null;
      state.bg = null;
      state.bold = false;
    } else if (p === 1) {
      state.bold = true;
    } else if (p === 22) {
      state.bold = false;
    } else if (p === 39) {
      state.fg = null;
    } else if (p === 49) {
      state.bg = null;
    } else if (p >= 30 && p <= 37) {
      // Standard 16-color fg
      const idx = p - 30;
      state.fg = ANSI_TO_MIRC[
        state.bold ? ANSI16_BRIGHT[idx] : ANSI16_STANDARD[idx]
      ];
    } else if (p === 38 && i + 1 < params.length) {
      if (params[i + 1] === 5 && i + 2 < params.length) {
        // 256-color fg: ESC[38;5;Nm
        state.fg = ANSI_TO_MIRC[params[i + 2]] ?? 0;
        i += 2;
      } else if (params[i + 1] === 2 && i + 4 < params.length) {
        // Truecolor fg: ESC[38;2;R;G;Bm
        state.fg = closestMircColor([
          params[i + 2], params[i + 3], params[i + 4],
        ]);
        i += 4;
      } else {
        i++;
      }
    } else if (p === 48 && i + 1 < params.length) {
      if (params[i + 1] === 5 && i + 2 < params.length) {
        // 256-color bg: ESC[48;5;Nm
        state.bg = ANSI_TO_MIRC[params[i + 2]] ?? 0;
        i += 2;
      } else if (params[i + 1] === 2 && i + 4 < params.length) {
        // Truecolor bg: ESC[48;2;R;G;Bm
        state.bg = closestMircColor([
          params[i + 2], params[i + 3], params[i + 4],
        ]);
        i += 4;
      } else {
        i++;
      }
    } else if (p >= 90 && p <= 97) {
      // Bright 16-color fg
      state.fg = ANSI_TO_MIRC[ANSI16_BRIGHT[p - 90]];
    } else if (p >= 100 && p <= 107) {
      // Bright 16-color bg
      state.bg = ANSI_TO_MIRC[ANSI16_BRIGHT[p - 100]];
    } else if (p >= 40 && p <= 47) {
      // Standard 16-color bg
      state.bg = ANSI_TO_MIRC[ANSI16_STANDARD[p - 40]];
    }
    // Ignore: 4 underline, 7 reverse, 8 conceal, etc.

    i++;
  }
}

// ─── Block construction helper ───────────────────────────────────

/** Create a Block with current SGR state applied */
function makeBlock(char: string, state: SgrState): Block {
  const block: Block = { char };
  if (state.fg !== null) block.fg = state.fg;
  if (state.bg !== null) block.bg = state.bg;
  return block;
}

// ─── Main parser ─────────────────────────────────────────────────

/** Regex to match CSI SGR sequences: ESC [ (params) m */
// eslint-disable-next-line no-control-regex
const CSI_SGR_REGEX = /\x1b\[([0-9;]*)m/g;

/**
 * Parse ANSI escape sequences into an ASCIIBIRD Block[][] grid.
 * Returns the grid with dimensions filled in.
 */
export function parseAnsiToBlocks(contents: string): {
  blocks: Block[][];
  width: number;
  height: number;
} {
  // Strip SAUCE metadata
  contents = stripSauce(contents);

  // Split on all line-ending styles: \r\n, \n, and \r (old Mac/BBS)
  const lines = contents.split(/\r?\n|\r/);
  // Remove trailing empty line from final newline
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  const state: SgrState = { fg: null, bg: null, bold: false };
  let maxWidth = 0;
  const blocks: Block[][] = [];

  for (const line of lines) {
    const row: Block[] = [];
    let lastIndex = 0;
    CSI_SGR_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = CSI_SGR_REGEX.exec(line)) !== null) {
      // Add characters before this escape
      const text = line.slice(lastIndex, match.index);
      for (const ch of text) {
        row.push(makeBlock(ch, state));
      }

      // Process SGR parameters
      const paramStr = match[1];
      if (paramStr === '' || paramStr === '0') {
        // Reset
        state.fg = null;
        state.bg = null;
        state.bold = false;
      } else {
        const params = paramStr
          .split(';')
          .map(n => (n === '' ? 0 : Number.parseInt(n, 10)));
        applySgr(params, state);
      }

      lastIndex = CSI_SGR_REGEX.lastIndex;
    }

    // Remaining text after last escape
    const remaining = line.slice(lastIndex);
    for (const ch of remaining) {
      row.push(makeBlock(ch, state));
    }

    blocks.push(row);
    if (row.length > maxWidth) maxWidth = row.length;

    // Reset state at end of line (terminal convention)
    state.fg = null;
    state.bg = null;
    state.bold = false;
  }

  // Pad all rows to maxWidth
  for (const row of blocks) {
    while (row.length < maxWidth) {
      row.push({});
    }
  }

  return { blocks, width: maxWidth, height: blocks.length };
}

/**
 * Detect whether content appears to be ANSI (vs mIRC or plain text).
 * Returns true if the content contains ESC[ sequences.
 */
export function isAnsiContent(contents: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /\x1b\[/.test(contents);
}

/**
 * Parse ANSI art and create a new ASCIIBIRD tab.
 * Follows the same pattern as parseMircAscii in ascii.ts.
 *
 * Uses dynamic import for the Pinia store to avoid circular
 * dependencies (ascii.ts ← store/index.ts ← utils/*).
 *
 * @param contents - raw ANSI content string (for clipboard paste)
 * @param filename - title for the new tab
 * @param buffer - optional raw bytes for binary ANSI files (CP437)
 * @returns true on success
 */
export const parseAnsiAscii = async (
  contents: string,
  filename: string,
  buffer?: ArrayBuffer,
): Promise<boolean> => {
  // If binary buffer provided, strip SAUCE and decode with encoding detection
  const text = buffer
    ? decodeAnsiBuffer(stripSauceBytes(buffer))
    : contents;

  const { blocks, width, height } = parseAnsiToBlocks(text);

  if (height === 0 || width === 0) {
    return false;
  }

  const initialLayers: Layer[] = [{
    label: filename,
    visible: true,
    data: blocks,
    width,
    height,
  }];

  // Fill null blocks to ensure consistent grid
  const filledLayers = [...fillNullBlocks(height, width, initialLayers)];

  const finalAscii: AsciibirdMetaBuilder = {
    title: filename,
    layers: LZString.compressToUTF16(JSON.stringify(filledLayers)),
    history: [],
    historyIndex: 0,
    imageOverlay: defaultImageOverlay(),
    x: blockWidth * 35,
    y: blockHeight * 2,
    selectedLayer: 0,
  };

  // Dynamic import avoids circular dep (ascii.ts ← store/index.ts)
  const { useAsciiBirdStore } = await import('../store');
  const store = useAsciiBirdStore();
  store.newAsciibirdMeta(finalAscii);

  return true;
};
