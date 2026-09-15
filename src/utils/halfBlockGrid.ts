// HalfBlockGrid — presents a Block[][] layer as a double-Y-resolution grid
//
// Rendering model (matches existing drawHalfBlocks in Editor.vue):
//   ▀ (U+2580, upper half block): fg = top color, bg = bottom color
//   ▄ (U+2584, lower half block): fg = bottom color, bg = top color
//
// setColour normalises to ▀ representation (fg=top, bg=bottom) so that all
// half-block data is consistent regardless of how it was originally created.
// This matches the existing code pattern at Editor.vue:1609-1625.
//
// setColourComplete additionally guarantees the OTHER half holds a real
// colour (existing colour, or a complement) so blocks are always complete
// {▀, fg, bg} / collapsed-space representations — canvas and IRC export
// always agree.
//
// setColourPreserve paints one half and leaves the sibling exactly as it
// was (preserved when coloured, empty when empty) — the single-colour
// paint model used by half-block tools (brush, shapes).
//
// clearColour erases a half to true transparency by deleting its property
// ({▄, fg:D} bottom-only / {▀, fg:C} top-only / {} fully empty) — erased
// halves export as minimal fg-only mIRC codes.

import type { Block } from '../types';
import { UPPER_HALF, LOWER_HALF } from './halfBlockChars';

/** Transparent/empty colour index (mIRC convention). Not a renderable or
 * exportable colour — mircColours99 only has indices 0-98. */
export const EMPTY_COLOUR = 99;

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

    const block = this.blocks[Math.floor(y / 2)]?.[x];
    if (!block) return EMPTY_COLOUR; // ragged array guard
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
   * collapse to a space block: char=' ', fg deleted, bg=colour.
   */
  setColour(x: number, y: number, colour: number): void {
    if (!this.inBounds(x, y)) return;

    const blockY = Math.floor(y / 2);
    const block = this.blocks[blockY]?.[x];
    if (!block) return; // ragged array guard
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
   * Paint a half and ensure the OTHER half holds a real colour.
   *
   * The other half keeps its existing colour unless it is empty (99 or
   * undefined — checked via getColour, so explicit 99 counts as empty),
   * in which case it takes `complement` (a real palette colour, 0-98).
   * Produces complete {▀, fg, bg} blocks (or collapsed spaces when both
   * halves match) so canvas rendering and mIRC export agree — no
   * fg-only exports.
   *
   * A `colour` of 99 (EMPTY_COLOUR) is treated as an erase request and
   * routed to clearColour.
   */
  setColourComplete(x: number, y: number, colour: number, complement: number): void {
    const target = this.preparePaint(x, y, colour);
    if (!target) return;
    const { block, isTop } = target;

    // Complement must be a real colour — guarantee the completeness
    // invariant even if a caller passes EMPTY_COLOUR by mistake
    const realComplement = complement !== EMPTY_COLOUR ? complement : 0;

    // Other half keeps its colour unless empty (99 counts as empty)
    const otherHalf = this.getColour(x, isTop ? y + 1 : y - 1);
    const otherValue = otherHalf !== EMPTY_COLOUR ? otherHalf : realComplement;

    if (isTop) {
      block.fg = colour;
      block.bg = otherValue;
    } else {
      block.bg = colour;
      block.fg = otherValue;
    }
    block.char = UPPER_HALF;

    // Check if both halves now have the same colour → collapse
    this.tryCollapse(block);
  }

  /**
   * Paint a half while preserving the sibling half's colour exactly.
   *
   * The sibling keeps its existing colour — read through getColour so
   * collapsed spaces, the ▄ representation, and legacy 99 values are
   * all handled — and stays EMPTY when it was empty. No complement
   * fill: this is the single-colour paint primitive for half-block
   * shape tools, where only the halves an artist actually touches
   * change.
   *
   * Single-half results use the minimal exportable representations
   * (top-only → {▀, fg:C}, bottom-only → {▄, fg:C}, matching the
   * clearColour convention) — both export as fg-only mIRC codes so
   * the empty half stays transparent on IRC.
   *
   * A `colour` of 99 (EMPTY_COLOUR) is treated as an erase request
   * and routed to clearColour.
   */
  setColourPreserve(x: number, y: number, colour: number): void {
    const target = this.preparePaint(x, y, colour);
    if (!target) return;
    const { block, isTop } = target;

    // Sibling colour — getColour understands every representation
    const sibling = this.getColour(x, isTop ? y + 1 : y - 1);

    if (isTop) {
      block.fg = colour;
      if (sibling !== EMPTY_COLOUR) block.bg = sibling;
      else delete block.bg;
      block.char = UPPER_HALF;
      // Collapse when both halves hold the same colour
      this.tryCollapse(block);
    } else if (sibling !== EMPTY_COLOUR) {
      block.bg = colour;
      block.fg = sibling;
      block.char = UPPER_HALF;
      this.tryCollapse(block);
    } else {
      // Bottom-only paint: ▄ representation with fg holding the
      // colour (the clearColour convention) — exports as a fg-only
      // code so the empty top half stays transparent on IRC
      delete block.bg;
      block.fg = colour;
      block.char = LOWER_HALF;
    }
  }

  /**
   * Erase a half — true transparency.
   *
   * Rebuilds the block from the surviving half's semantic colour:
   *   {▀, fg:C, bg:D} erase top    → {▄, fg:D}  (bottom-only)
   *   {▀, fg:C, bg:D} erase bottom → {▀, fg:C}  (top-only)
   *   both halves empty            → {}         (empty block)
   *
   * Reading the survivor through getColour uniformly handles collapsed
   * spaces (colour stored in bg for BOTH halves), the ▄ representation,
   * and legacy explicit-99 values (treated as empty). Erased halves
   * export as fg-only codes (the IRC client's default background shows
   * through) — the minimal correct encoding.
   */
  clearColour(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;

    const blockY = Math.floor(y / 2);
    const block = this.blocks[blockY]?.[x];
    if (!block) return; // ragged array guard
    const isTop = y % 2 === 0;

    // Surviving half's colour; explicit 99 counts as empty
    const survivor = isTop
      ? this.getColour(x, y + 1)
      : this.getColour(x, y - 1);
    const colour = survivor !== EMPTY_COLOUR ? survivor : undefined;

    this.resetToEmpty(block);

    if (colour === undefined) return; // both halves empty

    // The surviving colour lives in fg either way: fg renders the top
    // for ▀ and the bottom for ▄.
    block.fg = colour;
    block.char = isTop ? LOWER_HALF : UPPER_HALF;
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
   *
   * When both halves are empty (99), reset to a fully empty block —
   * colour 99 is not renderable (mircColours99 has indices 0-98) and
   * not exportable (`\x030,99` is invalid mIRC).
   */
  private tryCollapse(block: Block): void {
    if (
      block.char === UPPER_HALF
      && block.fg != null
      && block.bg != null
      && block.fg === block.bg
    ) {
      // Both halves empty → fully empty block
      if (block.fg === EMPTY_COLOUR) {
        this.resetToEmpty(block);
        return;
      }
      block.char = ' ';
      // Don't set fg — collapsed space blocks only need bg.
      // Setting fg=0 (white) can cause white artifacts during
      // rendering if the space glyph leaks any visible pixels.
      delete block.fg;
      // bg keeps the colour
    }
  }

  /** Remove all properties — the canonical empty block ({}). */
  private resetToEmpty(block: Block): void {
    delete block.fg;
    delete block.bg;
    delete block.char;
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
   * Shared paint scaffolding for the setColour* family: bounds and
   * erase-request guards, block lookup, and ▄ → ▀ normalisation.
   * Returns null when the paint should not proceed (out of bounds,
   * erase request — already routed to clearColour — or ragged cell).
   */
  private preparePaint(
    x: number,
    y: number,
    colour: number,
  ): { block: Block; isTop: boolean } | null {
    if (!this.inBounds(x, y)) return null;

    // Erase request → transparent clear (99 is not a real colour)
    if (colour === EMPTY_COLOUR) {
      this.clearColour(x, y);
      return null;
    }

    const block = this.blocks[Math.floor(y / 2)]?.[x];
    if (!block) return null; // ragged array guard

    // Normalise ▄ → ▀ so fg=top, bg=bottom consistently
    this.normaliseToUpperHalf(block);

    return { block, isTop: y % 2 === 0 };
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
