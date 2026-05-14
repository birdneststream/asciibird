// HalfBlockGrid — presents a Block[][] layer as a double-Y-resolution grid
//
// Rendering model (matches existing drawHalfBlocks in Editor.vue):
//   ▀ (U+2580, upper half block): fg = top color, bg = bottom color
//   ▄ (U+2584, lower half block): fg = bottom color, bg = top color
//
// setColour normalises to ▀ representation (fg=top, bg=bottom) so that all
// half-block data is consistent regardless of how it was originally created.
// This matches the existing code pattern at Editor.vue:1609-1625.

import type { Block } from '../types';

/** Transparent/empty colour index (mIRC convention) */
const EMPTY_COLOUR = 99;

/** Upper half block character */
const UPPER_HALF = '\u2580'; // ▀
/** Lower half block character */
const LOWER_HALF = '\u2584'; // ▄

/** Coordinates in the half-block grid (double Y resolution) */
export interface HalfBlockCoord {
  x: number;
  /** Half-block Y: 0 = first top, 1 = first bottom, 2 = second top, ... */
  y: number;
}

/**
 * Presents a standard Block[][] layer as a double-Y-resolution grid for
 * half-block editing mode. Operates on the underlying blocks in-place.
 *
 * Even y values map to the TOP half of a block.
 * Odd y values map to the BOTTOM half of a block.
 */
export class HalfBlockGrid {
  constructor(private blocks: Block[][]) {}

  /** Grid width (same as underlying blocks) */
  get width(): number {
    return this.blocks[0]?.length ?? 0;
  }

  /** Grid height (2x the underlying blocks height) */
  get height(): number {
    return (this.blocks.length ?? 0) * 2;
  }

  /**
   * Get the colour at half-block coordinates.
   *
   * For ▀ (upper half block): fg renders the top, bg renders the bottom.
   * For ▄ (lower half block): fg renders the bottom, bg renders the top.
   *
   * Even y (top half):
   *   ▀ → fg (top = fg),  ▄ → bg (top = bg)
   * Odd y (bottom half):
   *   ▀ → bg (bottom = bg),  ▄ → fg (bottom = fg)
   */
  getColour(x: number, y: number): number {
    if (!this.inBounds(x, y)) return EMPTY_COLOUR;

    const block = this.blocks[Math.floor(y / 2)][x];
    const isTop = y % 2 === 0;

    // Collapsed space block: bg holds the solid colour
    if (block.char === ' ') {
      return block.bg ?? EMPTY_COLOUR;
    }

    if (isTop) {
      // Top half: ▀ → fg, ▄ → bg
      if (block.char === LOWER_HALF) {
        return block.bg ?? EMPTY_COLOUR;
      }
      return block.fg ?? EMPTY_COLOUR;
    } else {
      // Bottom half: ▀ → bg, ▄ → fg
      if (block.char === LOWER_HALF) {
        return block.fg ?? EMPTY_COLOUR;
      }
      return block.bg ?? EMPTY_COLOUR;
    }
  }

  /**
   * Set the colour at half-block coordinates.
   *
   * Even y (top half):  set fg=colour, char='▀' (fg=top, bg=bottom)
   * Odd y (bottom half): set bg=colour, char='▀' (fg=top, bg=bottom)
   *
   * Normalises ▄ blocks to ▀ representation before modifying, preserving
   * the other half's colour correctly.
   *
   * If both halves of the same block end up with the same colour,
   * collapse to a space block: char=' ', fg=0, bg=colour.
   */
  setColour(x: number, y: number, colour: number): void {
    if (!this.inBounds(x, y)) return;

    const blockY = Math.floor(y / 2);
    const block = this.blocks[blockY][x];
    const isTop = y % 2 === 0;

    // Normalise ▄ → ▀ so fg=top, bg=bottom consistently
    this.normaliseToUpperHalf(block);

    if (isTop) {
      block.fg = colour;
      block.char = UPPER_HALF;
    } else {
      block.bg = colour;
      block.char = UPPER_HALF;
    }

    // Check if both halves now have the same colour → collapse
    this.tryCollapse(block);
  }

  /**
   * Get 4-connected neighbors at half-block granularity for flood fill.
   *
   * Even y (top half of cell at row r):
   *   - (x, y+1) — same cell's bottom half
   *   - (x-1, y), (x+1, y) — horizontal neighbors, same level
   *   - (x, y-1) — cell above's bottom half
   *
   * Odd y (bottom half of cell at row r):
   *   - (x, y-1) — same cell's top half
   *   - (x-1, y), (x+1, y) — horizontal neighbors, same level
   *   - (x, y+1) — cell below's top half
   */
  getNeighbors(x: number, y: number): HalfBlockCoord[] {
    const neighbors: HalfBlockCoord[] = [];
    const isTop = y % 2 === 0;

    if (isTop) {
      // Same cell's bottom half
      neighbors.push({ x, y: y + 1 });
      // Left neighbor
      if (x > 0) neighbors.push({ x: x - 1, y });
      // Right neighbor
      if (x < this.width - 1) neighbors.push({ x: x + 1, y });
      // Cell above's bottom half
      if (y > 0) neighbors.push({ x, y: y - 1 });
    } else {
      // Same cell's top half
      neighbors.push({ x, y: y - 1 });
      // Left neighbor
      if (x > 0) neighbors.push({ x: x - 1, y });
      // Right neighbor
      if (x < this.width - 1) neighbors.push({ x: x + 1, y });
      // Cell below's top half
      if (y < this.height - 1) neighbors.push({ x, y: y + 1 });
    }

    return neighbors;
  }

  /** A half-block is empty if its colour is 99 (transparent) or undefined */
  isEmpty(x: number, y: number): boolean {
    const colour = this.getColour(x, y);
    return colour === EMPTY_COLOUR;
  }

  /** Direct accessor for underlying block at full-block coordinates */
  getBlock(x: number, blockY: number): Block | undefined {
    return this.blocks[blockY]?.[x];
  }

  /** Check if half-block coordinates are within bounds */
  private inBounds(x: number, y: number): boolean {
    return (
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height
    );
  }

  /**
   * If both halves of a block have the same colour, collapse to a space.
   * This matches Editor.vue:1620-1622 behavior.
   */
  private tryCollapse(block: Block): void {
    if (
      block.char === UPPER_HALF &&
      block.fg != null &&
      block.bg != null &&
      block.fg === block.bg
    ) {
      block.char = ' ';
      block.fg = 0;
      // bg keeps the colour
    }
  }

  /**
   * Convert pixel coordinates to half-block coordinates.
   * Block dimensions must be positive.
   */
  static fromPixels(
    pixelX: number,
    pixelY: number,
    blockWidth: number,
    blockHeight: number,
  ): HalfBlockCoord {
    if (blockWidth <= 0 || blockHeight <= 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: Math.floor(pixelX / blockWidth),
      y: Math.floor(pixelY / (blockHeight / 2)),
    };
  }

  /**
   * Normalise a block from ▄ representation to ▀ representation.
   * ▄ stores: fg=bottom, bg=top. ▀ stores: fg=top, bg=bottom.
   * After normalisation: fg=top, bg=bottom, char='▀'.
   */
  private normaliseToUpperHalf(block: Block): void {
    if (block.char === LOWER_HALF) {
      const topColour = block.bg;
      const bottomColour = block.fg;
      block.fg = topColour != null ? topColour : undefined;
      block.bg = bottomColour != null ? bottomColour : undefined;
      block.char = UPPER_HALF;
    }
  }
}
