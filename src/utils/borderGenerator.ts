// Border Generator — wraps a block region in a decorative border frame
// using box-drawing characters and block elements.
//
// Pure functions: accept block arrays and options, return new arrays
// without mutating input. Used by the BorderGenerator modal.

import type { Block } from '../types';
import { emptyBlock } from '../ascii';
import { cloneBlocks } from './transformBlocks';

// ─── Border Style Definitions ──────────────────────────────────

/** Characters used for each position of a border frame */
export interface BorderStyleChars {
  tl: string; // top-left corner
  t: string;  // top edge
  tr: string; // top-right corner
  l: string;  // left edge
  r: string;  // right edge
  bl: string; // bottom-left corner
  b: string;  // bottom edge
  br: string; // bottom-right corner
}

/** Named border styles available in the UI */
export type BorderStyle =
  | 'single'
  | 'double'
  | 'rounded'
  | 'block'
  | 'thick'
  | 'hash'
  | 'star'
  | 'custom';

/** Predefined border character sets */
export const BORDER_STYLES: Record<Exclude<BorderStyle, 'custom'>, BorderStyleChars> = {
  single: { tl: '┌', t: '─', tr: '┐', l: '│', r: '│', bl: '└', b: '─', br: '┘' },
  double: { tl: '╔', t: '═', tr: '╗', l: '║', r: '║', bl: '╚', b: '═', br: '╝' },
  rounded: { tl: '╭', t: '─', tr: '╮', l: '│', r: '│', bl: '╰', b: '─', br: '╯' },
  block:   { tl: '▄', t: '▀', tr: '▄', l: '█', r: '█', bl: '▀', b: '▄', br: '▀' },
  thick:   { tl: '█', t: '█', tr: '█', l: '█', r: '█', bl: '█', b: '█', br: '█' },
  hash:    { tl: '#', t: '#', tr: '#', l: '#', r: '#', bl: '#', b: '#', br: '#' },
  star:    { tl: '*', t: '~', tr: '*', l: '*', r: '*', bl: '*', b: '~', br: '*' },
};

/** Options for the border generator */
export interface BorderGeneratorOptions {
  /** The block grid to add border to */
  blocks: Block[][];
  /** Starting X coordinate of the region (grid cells) */
  x: number;
  /** Starting Y coordinate of the region (grid cells) */
  y: number;
  /** Width of the region (grid cells) */
  w: number;
  /** Height of the region (grid cells) */
  h: number;
  /** Border style name */
  style: BorderStyle;
  /** Custom chars (used when style='custom') */
  customChars?: BorderStyleChars;
  /** Foreground color index for border blocks */
  fg: number;
  /** Background color index for border blocks */
  bg: number;
  /** Padding between border and content (0-2 cells) */
  padding: number;
  /** If true, expand the block array to fit the border */
  expand: boolean;
}

/** Result of border generation */
export interface BorderGeneratorResult {
  /** The resulting block grid (may be larger if expand=true) */
  blocks: Block[][];
  /** X offset of original content in the new grid (0 if not expanded) */
  offsetX: number;
  /** Y offset of original content in the new grid (0 if not expanded) */
  offsetY: number;
  /** New total width of the grid */
  width: number;
  /** New total height of the grid */
  height: number;
}

/**
 * Get the minimum dimensions needed to render a border with padding.
 * Returns { minW, minH } in grid cells. A border needs at least 2 cells
 * in each dimension for the corners + edges.
 */
export function getBorderMinimumSize(padding: number): {
  minW: number;
  minH: number;
} {
  const margin = 1 + padding; // border row + padding on each side
  return {
    minW: margin * 2 + 1, // left margin + 1 content + right margin
    minH: margin * 2 + 1,
  };
}

/**
 * Generate a border frame around a block region.
 *
 * When `expand=true`, the output grid is enlarged to accommodate the border
 * and padding. The original content is offset by (1+padding) cells from each
 * edge. When `expand=false`, the border is drawn over the existing content
 * within the specified region bounds.
 *
 * Returns the new block grid, offset values, and dimensions.
 */
export function generateBorder(opts: BorderGeneratorOptions): BorderGeneratorResult {
  const {
    blocks,
    x: regionX,
    y: regionY,
    w: regionW,
    h: regionH,
    style,
    customChars,
    fg,
    bg,
    padding,
    expand,
  } = opts;

  // Resolve chars for the chosen style
  const chars: BorderStyleChars = style === 'custom'
    ? (customChars ?? BORDER_STYLES.single)
    : BORDER_STYLES[style];

  // Compute margins (border + padding on each side)
  const margin = 1 + padding;

  if (expand) {
    // ── Expand mode: enlarge grid, offset content, draw border ──
    const srcH = blocks.length;
    const srcW = srcH > 0 ? Math.max(...blocks.map(r => r.length)) : 0;

    const newW = srcW + margin * 2;
    const newH = srcH + margin * 2;

    // Create new grid filled with empty blocks
    const result: Block[][] = [];
    for (let row = 0; row < newH; row++) {
      result[row] = [];
      for (let col = 0; col < newW; col++) {
        result[row][col] = { ...emptyBlock };
      }
    }

    // Copy original content with offset
    for (let sy = 0; sy < srcH; sy++) {
      for (let sx = 0; sx < srcW; sx++) {
        const srcBlock = blocks[sy]?.[sx];
        if (srcBlock) {
          result[sy + margin][sx + margin] = { ...srcBlock };
        }
      }
    }

    // Draw border frame
    drawBorderFrame(result, 0, 0, newW, newH, chars, fg, bg);

    return {
      blocks: result,
      offsetX: margin,
      offsetY: margin,
      width: newW,
      height: newH,
    };
  } else {
    // ── Overlay mode: draw border on existing grid ──
    const result = cloneBlocks(blocks);
    const totalH = result.length;
    const totalW = totalH > 0 ? Math.max(...result.map(r => r.length)) : 0;

    // Border frame bounds (outer edge)
    const bx1 = Math.max(0, regionX);
    const by1 = Math.max(0, regionY);
    const bx2 = Math.min(totalW, regionX + regionW);
    const by2 = Math.min(totalH, regionY + regionH);

    if (bx2 - bx1 < 2 || by2 - by1 < 2) {
      // Region too small for a border frame — return as-is
      return {
        blocks: result,
        offsetX: 0,
        offsetY: 0,
        width: totalW,
        height: totalH,
      };
    }

    drawBorderFrame(result, bx1, by1, bx2 - bx1, by2 - by1, chars, fg, bg);

    return {
      blocks: result,
      offsetX: 0,
      offsetY: 0,
      width: totalW,
      height: totalH,
    };
  }
}

/**
 * Draw a border frame directly onto a block grid.
 * The frame occupies the outer ring of the rectangle defined by
 * (x, y, w, h). Corners, horizontal edges, and vertical edges
 * are drawn with the given character set and colors.
 */
function drawBorderFrame(
  blocks: Block[][],
  x: number,
  y: number,
  w: number,
  h: number,
  chars: BorderStyleChars,
  fg: number,
  bg: number,
): void {
  // Ensure dimensions are valid
  if (w < 2 || h < 2) return;

  const x2 = x + w - 1;
  const y2 = y + h - 1;

  // ── Corners ──
  setBlock(blocks, x, y, chars.tl, fg, bg);
  setBlock(blocks, x2, y, chars.tr, fg, bg);
  setBlock(blocks, x, y2, chars.bl, fg, bg);
  setBlock(blocks, x2, y2, chars.br, fg, bg);

  // ── Top and bottom edges ──
  for (let cx = x + 1; cx < x2; cx++) {
    setBlock(blocks, cx, y, chars.t, fg, bg);
    setBlock(blocks, cx, y2, chars.b, fg, bg);
  }

  // ── Left and right edges ──
  for (let cy = y + 1; cy < y2; cy++) {
    setBlock(blocks, x, cy, chars.l, fg, bg);
    setBlock(blocks, x2, cy, chars.r, fg, bg);
  }
}

/**
 * Set a block's properties at (x, y) in the grid.
 * Creates the row/cell if it doesn't exist.
 */
function setBlock(
  blocks: Block[][],
  x: number,
  y: number,
  char: string,
  fg: number,
  bg: number,
): void {
  if (y < 0 || y >= blocks.length) return;
  if (!blocks[y]) return;
  if (x < 0 || x >= blocks[y].length) return;
  blocks[y][x] = { char, fg, bg };
}
