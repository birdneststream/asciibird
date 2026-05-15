// mIRC export functions for ASCIIBIRD.
//
// Pure functions that convert block data to mIRC colour format.
// The main `exportMircBlocks` function accepts all data as parameters
// — callers inject store data via thin wrappers.

import type { Block, MircExportResult } from '../types';

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
  const currentAscii = meta;
  const currentAsciiLayersWidthHeight = dimensions;

  const output: string[] = [];
  let curBlock: Block;
  let pushString = '';

  let prevBlock: Block = { bg: -1, fg: -1 };

  const optimiseArray = ['\u2580', '\u2584', '\u2588'];

  const zeroPad = (num: number, places = 2): string =>
    String(num).padStart(places, '0');

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {
    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      // Determine if we need an extra 0 to pad a colour
      const nextBlock = blocks[y][x + 1];
      const isPadded = !!(
        (nextBlock !== undefined &&
          (nextBlock.bg === undefined || nextBlock.fg === undefined) &&
          nextBlock.char !== undefined &&
          Number.parseInt(nextBlock.char) >= 0 &&
          Number.parseInt(nextBlock.char) <= 9) ||
        (blocks[y][x].char !== undefined &&
          Number.parseInt(blocks[y][x].char ?? '') >= 0 &&
          Number.parseInt(blocks[y][x].char ?? '') <= 9)
      );

      // If we have a difference between our previous block
      // we'll put colour codes and continue as normal
      curBlock = { ...blocks[y][x] };

      // Optimise out half or full blocks with same bg and fg
      if (curBlock.fg === curBlock.bg &&
          optimiseArray.includes(curBlock.char ?? '')) {
        curBlock.fg = 0;
        curBlock.char = ' ';
      }

      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {
          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            output.push('\u0003');
            pushString = `\u0003${isPadded ? zeroPad(curBlock.fg) : curBlock.fg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg !== undefined) {
            pushString =
              `\u0003${curBlock.fg},${isPadded ? zeroPad(curBlock.bg) : curBlock.bg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg === undefined) {
            pushString =
              `\u00030,${isPadded ? zeroPad(curBlock.bg) : curBlock.bg}`;
          }

          output.push(pushString);
        }
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
  const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt'
    ? currentAscii.title
    : `${currentAscii.title}.txt`;

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
