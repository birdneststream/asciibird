/**
 * ANSI Import Utility — parses ANSI terminal escape sequences into
 * ASCIIBIRD Block format.
 *
 * Supports:
 * - CP437 and UTF-8 encoded ANSI files (with auto-detection)
 * - 256-color: ESC[38;5;Nm (fg), ESC[48;5;Nm (bg)
 * - 16-color: ESC[30-37m (fg), ESC[40-47m (bg)
 * - Bright 16-color: ESC[90-97m (fg), ESC[100-107m (bg)
 * - Bold + 16-color: ESC[1m shifts 16-color to bright (8-15)
 * - 24-bit truecolor: ESC[38;2;R;G;Bm (fg), ESC[48;2;R;G;Bm (bg)
 * - Combined SGR: multiple attributes in one ESC[...m sequence
 * - Reset: ESC[0m
 * - SAUCE metadata: reads width/lines for proper column wrapping
 * - Flat ANSI (no newlines): wraps at SAUCE width or default 80 cols
 *
 * Limitations:
 * - Cursor positioning codes (ESC[Hf) are ignored
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
// Static import is safe — store/index.ts does not import from this module,
// so there is no circular dependency risk.
import { useAsciiBirdStore } from '../store';
import type { Block, Layer, AsciibirdMetaBuilder } from '../types';

// ─── SAUCE metadata ──────────────────────────────────────────────

/** Default column width for ANSI art without SAUCE metadata */
const DEFAULT_ANSI_WIDTH = 80;

interface SauceInfo {
  width: number;
  lines: number;
}

/**
 * Parse SAUCE record from the last 128 bytes of a buffer.
 * Returns { width, lines } or { width: 0, lines: 0 } if no SAUCE found.
 */
function parseSauceInfo(buffer: ArrayBuffer): SauceInfo {
  if (buffer.byteLength < 128) return { width: 0, lines: 0 };
  const bytes = new Uint8Array(buffer);
  const sauceStart = buffer.byteLength - 128;
  // Check for "SAUCE00" signature
  if (
    bytes[sauceStart] !== 0x53 || bytes[sauceStart + 1] !== 0x41
    || bytes[sauceStart + 2] !== 0x55 || bytes[sauceStart + 3] !== 0x43
    || bytes[sauceStart + 4] !== 0x45 || bytes[sauceStart + 5] !== 0x30
    || bytes[sauceStart + 6] !== 0x30
  ) {
    return { width: 0, lines: 0 };
  }
  // SAUCE record layout (128 bytes):
  // 0-6: "SAUCE00" | 7-41: Title | 42-63: Author | 64-85: Group
  // 86-93: Date | 94: DataType | 95: FileType
  // 96-97: TInfo1 (LE word) — width for ANSI
  // 98-99: TInfo2 (LE word) — lines for ANSI
  const width = bytes[sauceStart + 96]
    | (bytes[sauceStart + 97] << 8);
  const lines = bytes[sauceStart + 98]
    | (bytes[sauceStart + 99] << 8);
  return { width, lines };
}

/**
 * Strip SAUCE metadata from a decoded string.
 * SAUCE records are exactly 128 bytes at the end, starting with
 * "SAUCE00". After decoding, they're 128+ characters.
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

/** ESC character code */
const ESC = 0x1B;

/**
 * Parse ANSI escape sequences into an ASCIIBIRD Block[][] grid.
 *
 * Handles both newline-delimited and flat (no-newline) ANSI art.
 * When `targetWidth` is provided, characters wrap at that column
 * width, which is how legacy BBS ANSI art works (terminal auto-wrap).
 *
 * @param contents - decoded string with ANSI escape sequences
 * @param targetWidth - column width for line wrapping (0 = no wrap)
 */
export function parseAnsiToBlocks(
  contents: string,
  targetWidth = 0,
): {
  blocks: Block[][];
  width: number;
  height: number;
} {
  // Strip SAUCE metadata from decoded text
  contents = stripSauce(contents);

  if (contents.length === 0) {
    return { blocks: [], width: 0, height: 0 };
  }

  const state: SgrState = { fg: null, bg: null, bold: false };
  const blocks: Block[][] = [];
  let row: Block[] = [];
  let colCount = 0;
  let maxWidth = 0;

  let i = 0;
  while (i < contents.length) {
    const code = contents.charCodeAt(i);

    if (code === ESC && i + 1 < contents.length
        && contents.charCodeAt(i + 1) === 0x5B) {
      // CSI sequence: ESC [ ... <final byte>
      i += 2; // skip ESC [
      // Collect parameter bytes (0x30-0x3F) and intermediate
      // bytes (0x20-0x2F) until final byte (0x40-0x7E)
      let paramStr = '';
      while (i < contents.length && contents.charCodeAt(i) >= 0x20
             && contents.charCodeAt(i) <= 0x3F) {
        paramStr += contents[i];
        i++;
      }
      // Skip intermediate bytes
      while (i < contents.length && contents.charCodeAt(i) >= 0x20
             && contents.charCodeAt(i) <= 0x2F) {
        i++;
      }
      // Final byte
      if (i < contents.length) {
        const finalByte = contents.charCodeAt(i);
        if (finalByte === 0x6D) {
          // SGR: ESC[...m — process color attributes
          if (paramStr === '' || paramStr === '0') {
            state.fg = null;
            state.bg = null;
            state.bold = false;
          } else {
            const params = paramStr
              .split(';')
              .map(n => (n === '' ? 0 : Number.parseInt(n, 10)));
            applySgr(params, state);
          }
        }
        // Other CSI sequences (cursor movement, etc.) are ignored
        i++;
      }
    } else if (code === 0x0A) {
      // LF — end row
      if (row.length > maxWidth) maxWidth = row.length;
      blocks.push(row);
      row = [];
      colCount = 0;
      state.fg = null;
      state.bg = null;
      state.bold = false;
      i++;
    } else if (code === 0x0D) {
      // CR — end row (handles \r-only and \r\n line endings)
      // Check for \r\n pair — just skip CR and let LF handle it
      if (i + 1 < contents.length
          && contents.charCodeAt(i + 1) === 0x0A) {
        // \r\n pair — skip CR, LF will end the row
        i++;
      } else {
        // Standalone \r — treat as line break
        if (row.length > maxWidth) maxWidth = row.length;
        blocks.push(row);
        row = [];
        colCount = 0;
        state.fg = null;
        state.bg = null;
        state.bold = false;
        i++;
      }
    } else {
      // Visible character
      row.push(makeBlock(contents[i], state));
      colCount++;

      // Wrap at target width (for flat ANSI files)
      if (targetWidth > 0 && colCount >= targetWidth) {
        if (row.length > maxWidth) maxWidth = row.length;
        blocks.push(row);
        row = [];
        colCount = 0;
        // Do NOT reset SGR state at wrap — ANSI art expects
        // colors to carry across line wraps
      }
      i++;
    }
  }

  // Push remaining row
  if (row.length > 0) {
    if (row.length > maxWidth) maxWidth = row.length;
    blocks.push(row);
  }

  // Pad all rows to maxWidth
  for (const r of blocks) {
    while (r.length < maxWidth) {
      r.push({});
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
  // Extract SAUCE metadata for width before stripping/decoding
  let sauceWidth = 0;
  let text: string;

  if (buffer) {
    const sauce = parseSauceInfo(buffer);
    sauceWidth = sauce.width || 0;
    text = decodeAnsiBuffer(stripSauceBytes(buffer));
  } else {
    text = contents;
  }

  // Determine target width for flat ANSI files (no newlines)
  let targetWidth = 0;
  if (sauceWidth > 0) {
    targetWidth = sauceWidth;
  } else if (!text.includes('\n') && !text.includes('\r')) {
    // No newlines and no SAUCE — default to 80 columns
    targetWidth = DEFAULT_ANSI_WIDTH;
  }

  const { blocks, width, height } = parseAnsiToBlocks(text, targetWidth);

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

  const store = useAsciiBirdStore();
  store.newAsciibirdMeta(finalAscii);

  return true;
};
