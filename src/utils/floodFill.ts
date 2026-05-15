// Flood fill algorithms for ASCIIBIRD.
//
// Contains iterative flood fill implementations for both full-block
// and half-block grids. Pure functions — no store dependencies.

import { HalfBlockGrid } from './halfBlockGrid';
import type { Block } from '../types';

/**
 * A single cell change recorded during flood fill.
 * Two FillChanges (old+new per cell) map to one undo HistoryDiff entry
 * via storeDiffBlocks in Editor.vue.
 */
export interface FillChange {
  x: number;
  y: number;
  old: Block;
  new: Block;
}

/**
 * Iterative flood fill using DFS with visited set.
 * Replaces recursive approach to avoid stack overflow on large grids.
 * Selectively targets only the properties enabled by canBg/canFg/canText.
 * Returns an array of changes for efficient undo diff construction.
 *
 * Boundary checks: Only bg and char are used as boundary conditions.
 * Fg matching is intentionally excluded to match the original recursive
 * fillTool behavior — fg-only fills traverse all blocks matching the
 * bg/char pattern and change only the foreground colour.
 *
 * When ALL targeting flags (canBg, canFg, canText) are false, the fill
 * has no boundary and no effect — it returns early to prevent filling
 * the entire grid.
 */
export const iterativeFill = (
  blocks: Block[][],
  startY: number,
  startX: number,
  current: Block,
  fillColor: Block,
  canBg: boolean,
  canFg: boolean,
  canText: boolean,
  eraser: boolean,
): FillChange[] => {
  const changes: FillChange[] = [];

  // If no targeting flags are active, nothing to fill — bail early
  // to prevent filling the entire grid without boundary checks
  if (!canBg && !canFg && !canText) return changes;

  const height = blocks.length;
  if (height === 0) return changes;
  const width = blocks[0]?.length ?? 0;
  if (width === 0) return changes;

  // Bounds check starting position
  if (startY < 0 || startY >= height || startX < 0 || startX >= width) {
    return changes;
  }

  // Check if starting block matches current
  const startBlock = blocks[startY]?.[startX];
  if (!startBlock) return changes; // ragged array guard
  if (canBg && startBlock.bg !== current.bg) return changes;
  if (canText && startBlock.char !== current.char) return changes;

  const visited = new Set<number>();
  const stack: Array<{ x: number; y: number }> = [
    { x: startX, y: startY },
  ];

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const key = pos.y * width + pos.x;

    if (visited.has(key)) continue;
    if (pos.y < 0 || pos.y >= height || pos.x < 0 || pos.x >= width) {
      continue;
    }

    const block = blocks[pos.y]?.[pos.x];
    if (!block) continue; // ragged array — skip missing cells

    // Check if this block matches the current color pattern
    if (canBg && block.bg !== current.bg) continue;
    if (canText && block.char !== current.char) continue;

    visited.add(key);

    // Save old state before mutation (shallow clone — Block has only
    // primitives)
    const oldBlock: Block = { ...block };

    // Apply fill (selectively target properties)
    if (!eraser) {
      if (canBg) block.bg = fillColor.bg;
      if (canFg) block.fg = fillColor.fg;
      if (canText) block.char = fillColor.char;
    } else {
      if (canBg) delete block.bg;
      if (canFg) delete block.fg;
      if (canText) delete block.char;
    }

    // Record the change
    changes.push({
      x: pos.x,
      y: pos.y,
      old: oldBlock,
      new: { ...block },
    });

    // Push neighbors (4-directional)
    stack.push({ x: pos.x - 1, y: pos.y });
    stack.push({ x: pos.x + 1, y: pos.y });
    stack.push({ x: pos.x, y: pos.y - 1 });
    stack.push({ x: pos.x, y: pos.y + 1 });
  }

  return changes;
};

/**
 * Half-block-aware iterative flood fill.
 *
 * Operates at double Y resolution using HalfBlockGrid.
 * Each half-block has a single colour property. The fill connects
 * half-blocks through the 4-connected neighbor graph provided by
 * HalfBlockGrid.getNeighbors().
 *
 * Returns FillChange[] at full-block granularity for undo compatibility.
 * Multiple changes for the same block cell are deduplicated — only the
 * first old/new pair for each cell is kept.
 */
export const iterativeFillHalfBlock = (
  blocks: Block[][],
  startHalfY: number,
  startX: number,
  fillColour: number,
): FillChange[] => {
  const grid = new HalfBlockGrid(blocks);
  const changes: FillChange[] = [];
  const cellChanges = new Map<string, { old: Block; new: Block }>();
  const visited = new Set<string>();
  const stack: Array<{ x: number; y: number }> = [
    { x: startX, y: startHalfY },
  ];

  const targetColour = grid.getColour(startX, startHalfY);

  // Don't fill if target is same as fill colour
  if (targetColour === fillColour) return changes;

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const key = `${pos.x},${pos.y}`;

    if (visited.has(key)) continue;
    if (pos.x < 0 || pos.x >= grid.width || pos.y < 0 || pos.y >= grid.height) {
      continue;
    }

    const currentColour = grid.getColour(pos.x, pos.y);
    if (currentColour !== targetColour) continue;
    visited.add(key);

    // Record change at full-block level
    const blockY = Math.floor(pos.y / 2);
    const cellKey = `${pos.x},${blockY}`;

    // Only snapshot old block once per cell (before first mutation)
    const sourceBlock = blocks[blockY]?.[pos.x];
    if (!sourceBlock) continue; // ragged array — skip missing cells
    if (!cellChanges.has(cellKey)) {
      cellChanges.set(cellKey, {
        old: { ...sourceBlock },
        new: {} as Block, // will be filled after all mutations
      });
    }

    // Apply fill — mutate in-place
    grid.setColour(pos.x, pos.y, fillColour);

    // Push neighbors using HalfBlockGrid connectivity
    for (const n of grid.getNeighbors(pos.x, pos.y)) {
      if (!visited.has(`${n.x},${n.y}`)) {
        stack.push(n);
      }
    }
  }

  // Build final changes with updated blocks
  for (const [cellKey, data] of cellChanges) {
    const [xStr, yStr] = cellKey.split(',');
    const cx = Number(xStr);
    const cy = Number(yStr);
    const finalBlock = blocks[cy]?.[cx];
    if (!finalBlock) continue; // ragged array — skip missing cells
    changes.push({
      x: cx,
      y: cy,
      old: data.old,
      new: { ...finalBlock },
    });
  }

  return changes;
};
