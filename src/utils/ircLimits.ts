// IRC line byte-length analysis for ASCIIBIRD.
//
// Provides functions to estimate mIRC output byte lengths per line,
// used by the status bar warning and export validation.
// Pure functions — no store dependencies.

import type { Block } from '../types';

/**
 * Check IRC line byte lengths and return indices exceeding 500-byte limit.
 * IRC protocol has a 512-byte line limit including nick/ident/host.
 * We use 500 as a practical threshold.
 */
export const checkIrcByteLimits = (output: string): number[] => {
  const lines = output.split('\n');
  const overLimit: number[] = [];

  lines.forEach((line, i) => {
    const byteLength = new TextEncoder().encode(line).length;
    if (byteLength > 500) {
      overLimit.push(i);
    }
  });

  return overLimit;
};

/**
 * Result of IRC line byte-length analysis for the status bar warning.
 */
export interface IrcLineCheck {
  /** Byte length of each line in the mIRC output */
  lineByteLengths: number[];
  /** Indices of lines exceeding the warning threshold */
  overLimitLines: number[];
  /** Maximum byte length across all lines */
  maxBytes: number;
}

/** IRC warning thresholds (bytes per line) */
export const IRC_WARN_THRESHOLD = 400;
export const IRC_ERROR_THRESHOLD = 500;

/**
 * Calculate mIRC byte lengths per line directly from block data.
 * Avoids running the full exportMirc pipeline — estimates byte length
 * by counting color code overhead per block transition.
 */
export const calculateMircLineBytes = (blocks: Block[][]): IrcLineCheck => {
  const lineByteLengths: number[] = [];
  let maxBytes = 0;
  const overLimitLines: number[] = [];

  for (let y = 0; y < blocks.length; y++) {
    let lineBytes = 0;
    let prevFg: number | undefined = -1;
    let prevBg: number | undefined = -1;

    for (let x = 0; x < blocks[y].length; x++) {
      const block = blocks[y][x];
      const fg = block?.fg ?? undefined;
      const bg = block?.bg ?? undefined;
      const char = block?.char ?? ' ';

      // Color code needed if fg or bg changed from previous block
      if (fg !== prevFg || bg !== prevBg) {
        // \x03 + fg digits + , + bg digits
        if (fg !== undefined && bg !== undefined) {
          lineBytes += 1 + String(fg).length + 1 + String(bg).length;
        } else if (fg !== undefined) {
          lineBytes += 1 + String(fg).length;
        } else if (bg !== undefined) {
          lineBytes += 1 + 1 + 1 + String(bg).length; // \x030,bg
        } else {
          lineBytes += 1; // \x03 reset
        }
      }

      // Character byte(s)
      lineBytes += new TextEncoder().encode(char).length;

      prevFg = fg;
      prevBg = bg;
    }

    lineByteLengths.push(lineBytes);
    if (lineBytes > maxBytes) maxBytes = lineBytes;
    if (lineBytes > IRC_ERROR_THRESHOLD) overLimitLines.push(y);
  }

  return { lineByteLengths, overLimitLines, maxBytes };
};
