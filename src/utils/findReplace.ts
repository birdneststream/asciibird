// Find and Replace utility for ASCIIBIRD
// Pure functions operating on Block[][] — no store dependency

import type { Block, FindCriteria, MatchPosition, ReplaceSpec, FindError, BlockDiff } from '../types';

/**
 * Find all blocks matching the given criteria.
 * Criteria are AND-combined: all specified fields must match.
 * Returns an array of {x, y} positions. If the regex pattern
 * is invalid, returns an empty array and sets the error output.
 */
export function findMatches(
  blocks: Block[][],
  criteria: FindCriteria,
  errorOut?: { error?: FindError },
): MatchPosition[] {
  const { char, fg, bg, useRegex } = criteria;
  const hasCriteria = char !== undefined || fg !== undefined
    || bg !== undefined;

  if (!hasCriteria) return [];

  // Compile regex if needed
  let regex: RegExp | null = null;
  if (char !== undefined && useRegex) {
    try {
      regex = new RegExp(char);
    } catch (e) {
      if (errorOut) {
        errorOut.error = {
          message: String(e instanceof Error ? e.message : e),
          pattern: char,
        };
      }
      return [];
    }
  }

  const matches: MatchPosition[] = [];

  for (let y = 0; y < blocks.length; y++) {
    const row = blocks[y];
    if (!row) continue;

    for (let x = 0; x < row.length; x++) {
      const block = row[x];
      if (!block) continue;

      if (matchesCriteria(block, char, fg, bg, regex)) {
        matches.push({ x, y });
      }
    }
  }

  return matches;
}

/**
 * Apply replacement at the given positions.
 * Returns old/new diff arrays for undo/redo integration.
 * Mutates blocks in-place (caller handles layer compression).
 */
export function replaceAtPositions(
  blocks: Block[][],
  positions: MatchPosition[],
  replacement: ReplaceSpec,
): { oldDiffs: BlockDiff[]; newDiffs: BlockDiff[] } {
  const oldDiffs: BlockDiff[] = [];
  const newDiffs: BlockDiff[] = [];
  const { char, fg, bg } = replacement;

  const hasReplace = char !== undefined
    || fg !== undefined
    || bg !== undefined;

  if (!hasReplace || positions.length === 0) {
    return { oldDiffs, newDiffs };
  }

  for (const pos of positions) {
    const block = blocks[pos.y]?.[pos.x];
    if (!block) continue;

    const oldBlock = { ...block };
    let changed = false;

    if (char !== undefined && block.char !== char) {
      block.char = char;
      changed = true;
    }
    if (fg !== undefined && block.fg !== fg) {
      block.fg = fg;
      changed = true;
    }
    if (bg !== undefined && block.bg !== bg) {
      block.bg = bg;
      changed = true;
    }

    if (changed) {
      oldDiffs.push({ x: pos.x, y: pos.y, b: oldBlock });
      newDiffs.push({ x: pos.x, y: pos.y, b: { ...block } });
    }
  }

  return { oldDiffs, newDiffs };
}

// ─── Internal helpers ──────────────────────────────────────────

function matchesCriteria(
  block: Block,
  char: string | undefined,
  fg: number | undefined,
  bg: number | undefined,
  regex: RegExp | null,
): boolean {
  // AND logic: all specified criteria must match
  if (char !== undefined) {
    if (regex) {
      if (!regex.test(block.char ?? '')) return false;
    } else {
      if ((block.char ?? '') !== char) return false;
    }
  }

  if (fg !== undefined && block.fg !== fg) {
    return false;
  }

  if (bg !== undefined && block.bg !== bg) {
    return false;
  }

  return true;
}
