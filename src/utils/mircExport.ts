// mIRC export functions for ASCIIBIRD.
//
// Pure functions that convert block data to mIRC colour format.
// The main `exportMircBlocks` function accepts all data as parameters
// — callers inject store data via thin wrappers.

import type { Block, MircExportResult } from '../types';

// ─── Helpers ────────────────────────────────────────────────────

const OPTIMISE_CHARS = ['\u2580', '\u2584', '\u2588'];

const zeroPad = (num: number, places = 2): string =>
  String(num).padStart(places, '0');

/**
 * Determine if the next block's char is a digit that needs zero-padding
 * to avoid mIRC parsing ambiguity (e.g., `\u000312` is color 12,
 * but `\u00031,2` followed by char "2" is ambiguous).
 */
function needsPadding(block: Block, nextBlock: Block | undefined): boolean {
  // Check if next block's char is a single digit
  const nextCharDigit = nextBlock !== undefined
    && (nextBlock.bg === undefined || nextBlock.fg === undefined)
    && nextBlock.char !== undefined
    && Number.parseInt(nextBlock.char) >= 0
    && Number.parseInt(nextBlock.char) <= 9;

  // Check if current block's char is a single digit
  const curCharDigit = block.char !== undefined
    && Number.parseInt(block.char ?? '') >= 0
    && Number.parseInt(block.char ?? '') <= 9;

  return !!(nextCharDigit || curCharDigit);
}

/**
 * Optimise half/full blocks with same fg and bg into plain spaces.
 * Prevents mIRC clients from rendering redundant color codes.
 */
function optimiseBlock(block: Block): Block {
  if (block.fg === block.bg && OPTIMISE_CHARS.includes(block.char ?? '')) {
    return { ...block, fg: 0, char: ' ' };
  }
  return { ...block };
}

/**
 * Generate mIRC color code string based on block's fg/bg state.
 * Returns the escape sequence or empty string.
 */
function formatMircColor(block: Block, isPadded: boolean): string {
  if (block.fg === undefined && block.bg === undefined) {
    return '\u0003';
  }

  if (block.bg === undefined && block.fg !== undefined) {
    return '\u0003' + (isPadded ? zeroPad(block.fg) : String(block.fg));
  }

  if (block.bg !== undefined && block.fg !== undefined) {
    return `\u0003${block.fg},${isPadded ? zeroPad(block.bg) : block.bg}`;
  }

  if (block.bg !== undefined && block.fg === undefined) {
    return `\u00030,${isPadded ? zeroPad(block.bg) : block.bg}`;
  }

  return '';
}

// ─── Export functions ───────────────────────────────────────────

/**
 * Converts ASCIIBIRD blocks to mIRC colour format.
 *
 * @param blocks - 2D block grid to export
 * @param meta - Document title for filename generation
 * @param dimensions - Height and width for iteration bounds
 */
export const exportMircBlocks = (
  blocks: Block[][],
  meta: { title: string },
  dimensions: { height: number; width: number },
): MircExportResult => {
  const output: string[] = [];
  let prevBlock: Block = { bg: -1, fg: -1 };

  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      const rawBlock = blocks[y][x];
      const nextBlock = blocks[y][x + 1];
      const isPadded = needsPadding(rawBlock, nextBlock);
      const curBlock = optimiseBlock(rawBlock);

      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        output.push(formatMircColor(curBlock, isPadded));
      }

      // null .chars will end up as space
      output.push(curBlock.char ?? ' ');
      prevBlock = { ...curBlock };
    }

    // We can never have a -1 colour code so we'll always
    // write one at the start of each line
    prevBlock = { bg: -1, fg: -1 };
    output.push('\n');
  }

  // Check if filename already ends with .txt
  const filename = meta.title.endsWith('.txt')
    ? meta.title
    : `${meta.title}.txt`;

  return { filename, output };
};

/**
 * Generate an export filename for brush data.
 * Uses a hash of the blocks for a unique filename.
 */
export const brushExportMeta = (
  blocks: Block[][],
  hashFn: (str: string, seed?: number) => number,
): { title: string } => ({
  title: `brush-${hashFn(JSON.stringify(blocks))}.txt`,
});

/**
 * Export ASCII blocks as plain text (no color codes).
 * Strips all fg/bg, outputs just the character for each cell.
 * Trailing spaces and empty trailing lines are trimmed.
 */
export const exportPlainTextBlocks = (blocks: Block[][]): string[] => {
  if (!blocks || blocks.length === 0) return [];

  const output: string[] = [];

  for (let y = 0; y < blocks.length; y++) {
    const row = blocks[y];
    if (!row) continue;

    let line = '';
    for (let x = 0; x < row.length; x++) {
      const block = row[x];
      line += (block?.char && block.char !== null) ? block.char : ' ';
    }

    output.push(line.trimEnd());
  }

  // Strip trailing empty lines
  while (output.length > 0 && output[output.length - 1] === '') {
    output.pop();
  }

  return output;
};
