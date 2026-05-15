// mIRC import (parsing) functions for ASCIIBIRD.
//
// Pure functions that parse mIRC colour-coded text into block data.
// The main `parseMircToLayers` function returns parsed data without
// touching the store — callers handle store persistence.

import type { Block, Layer } from '../types';

/**
 * Parse mIRC colour-coded text into layer data.
 *
 * Returns the parsed layer data, width, and height without
 * interacting with the store. Callers are responsible for
 * persisting the result.
 *
 * @param contents - Raw mIRC text with colour codes
 * @param filename - Label for the initial layer
 * @param create2DArray - Factory function to create empty 2D block array
 * @returns Parsed layer data with dimensions
 */
export const parseMircToLayers = (
  contents: string,
  filename: string,
  create2DArray: (rows: number) => Block[][],
): {
  layers: Layer[];
  width: number;
  height: number;
} => {
  // Note: Do NOT collapse \x03\x03 — the first \x03 is a valid soft reset
  // that clears fg/bg. Collapsing destroys the reset and causes bg to
  // incorrectly persist across half-block boundaries (Bug #23).
  contents = contents
    .split('\u000F').join('')
    .split('\u0003\n').join('\n')
    .split('\u0002\u0003').join('\u0003')
    .split('\u0002').join('') // bold
    .split('\u001D').join(''); // bg highlight

  const asciiLines = contents.split('\n');
  const lineCount = asciiLines.length;

  const initialLayers: Layer[] = [{
    label: filename,
    visible: true,
    data: create2DArray(lineCount),
    width: 0, // calculated below
    height: lineCount,
  }];

  // https://modern.ircdocs.horse/formatting.html#color
  const asciiblasterRegex = /(^[\d]{1,2})?(?:,([\d]{1,2}))?/;
  let cleanedWidth = 0;

  for (const y in asciiLines) {
    const line = asciiLines[y];
    const len = line.length - 1;
    let char: string;
    let block: Block = {};
    let pos = -1;
    let actualPos = 0;

    while (pos < len) {
      pos++;
      char = line[pos];

      // This code and regex came from asciiblaster and was changed to
      // work with asciibird.
      if (char === '\x03') {
        const matches = line.substring(pos + 1, pos + 6)
          .match(asciiblasterRegex);

        if (!matches) continue;

        // \x03 without color code is a soft block reset
        if (matches[1] === undefined && matches[2] === undefined) {
          block.fg = null;
          block.bg = null;
          continue;
        }

        if (matches[1] !== undefined) {
          block.fg = Number(matches[1]);
        }

        if (matches[2] !== undefined) {
          block.bg = Number(matches[2]);
        }

        pos += matches[0].length;
        continue;
      }

      block.char = char;

      initialLayers[0].data[y][actualPos] = {
        ...block,
      };

      actualPos++;

      if (actualPos > cleanedWidth) {
        cleanedWidth = actualPos;
      }
    }

    block = {};
  }

  initialLayers[0].width = cleanedWidth;

  return {
    layers: initialLayers,
    width: cleanedWidth,
    height: lineCount,
  };
};
