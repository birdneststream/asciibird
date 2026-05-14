// Selection transform composable for ASCIIBIRD.
//
// Handles transform operations (rotate, flip) on selected canvas blocks.
// Receives selection state and canvas dependencies from Editor.vue and
// provides methods to apply transforms with undo/redo support.

import { type ComputedRef, type Ref } from 'vue';
import { transformBlocks, type TransformType } from '../utils/transformBlocks';
import type { Block, HistoryDiff, BlockDiff } from '../types';

/** Pixel-coordinate selection rectangle from Editor */
export interface SelectionRect {
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  canSelect: boolean;
}

/** Grid-coordinate selection bounds (dense, relative) */
export interface GridSelection {
  x: number;      // left column (grid)
  y: number;      // top row (grid)
  width: number;  // columns
  height: number; // rows
}

/** Dependencies injected from Editor.vue */
export interface SelectionTransformDeps {
  selecting: Ref<SelectionRect>;
  selectedBlocks: Ref<Block[][]>;
  blockWidthComp: ComputedRef<number>;
  blockHeightComp: ComputedRef<number>;
  currentAsciiWidth: ComputedRef<number>;
  currentAsciiHeight: ComputedRef<number>;
  currentAsciiLayerBlocks: ComputedRef<Block[][]>;
  selectedLayerIndex: ComputedRef<number>;
  /** Store action to commit undo diff */
  updateAsciiBlocks: (payload: { diff: HistoryDiff; blocks: unknown }) => void;
  /** Toolbar store action to update select blocks (for Ctrl+V paste) */
  setSelectBlocks: (blocks: Block[][]) => void;
  /** Trigger canvas redraw */
  redrawCanvas: () => Promise<void>;
  /** Clear tool overlay canvas */
  clearToolCanvas: () => Promise<void>;
  /** Draw selection rectangle on tool canvas */
  redrawSelect: () => Promise<void>;
}

/**
 * Convert pixel selection rect to grid coordinates.
 * Normalizes so startX < endX, startY < endY.
 */
export function selectionToGridRect(
  sel: SelectionRect,
  bw: number,
  bh: number,
  canvasWidth: number,
  canvasHeight: number,
): GridSelection | null {
  if (
    sel.startX === null || sel.startY === null ||
    sel.endX === null || sel.endY === null
  ) {
    return null;
  }

  // Normalize: ensure start < end
  const px = Math.min(sel.startX, sel.endX);
  const py = Math.min(sel.startY, sel.endY);
  const pw = Math.abs(sel.endX - sel.startX);
  const ph = Math.abs(sel.endY - sel.startY);

  const gridX = Math.round(px / bw);
  const gridY = Math.round(py / bh);
  const gridW = Math.max(1, Math.round(pw / bw));
  const gridH = Math.max(1, Math.round(ph / bh));

  // Clamp to canvas bounds
  const clampedX = Math.max(0, Math.min(gridX, canvasWidth - 1));
  const clampedY = Math.max(0, Math.min(gridY, canvasHeight - 1));
  const clampedW = Math.min(gridW, canvasWidth - clampedX);
  const clampedH = Math.min(gridH, canvasHeight - clampedY);

  if (clampedW <= 0 || clampedH <= 0) return null;

  return {
    x: clampedX,
    y: clampedY,
    width: clampedW,
    height: clampedH,
  };
}

/**
 * Extract a dense, selection-relative Block[][] from layer data.
 * Returns blocks at grid positions within the selection rectangle.
 */
export function extractSelectionBlocks(
  layerBlocks: Block[][],
  rect: GridSelection,
): Block[][] {
  const result: Block[][] = [];

  for (let dy = 0; dy < rect.height; dy++) {
    const row: Block[] = [];
    const gy = rect.y + dy;

    for (let dx = 0; dx < rect.width; dx++) {
      const gx = rect.x + dx;
      const block = layerBlocks[gy]?.[gx];
      if (block) {
        // Clean null properties (matches existing processSelect behavior)
        const clean: Block = {};
        if (block.fg !== undefined && block.fg !== null) clean.fg = block.fg;
        if (block.bg !== undefined && block.bg !== null) clean.bg = block.bg;
        if (block.char !== undefined && block.char !== null) {
          clean.char = block.char;
        }
        row.push(clean);
      } else {
        row.push({});
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Selection transform composable.
 *
 * Provides methods to transform (rotate/flip) the selected area of the
 * canvas with undo/redo support. The transformed blocks are written back
 * to the layer data and the selection rectangle is updated for chaining.
 */
export function useSelectionTransform(deps: SelectionTransformDeps) {

  /**
   * Apply a transform to the currently selected area.
   * - Extracts blocks from the selection rectangle
   * - Applies the transform (rotate/flip)
   * - Writes transformed blocks back to the layer
   * - Records undo diff
   * - Updates selection rectangle to match new dimensions
   * - Updates selectedBlocks and selectBlocks for Ctrl+V paste
   */
  async function applyTransform(type: TransformType): Promise<boolean> {
    const sel = deps.selecting.value;
    const bw = deps.blockWidthComp.value;
    const bh = deps.blockHeightComp.value;

    // Convert pixel selection to grid rect
    const rect = selectionToGridRect(
      sel, bw, bh,
      deps.currentAsciiWidth.value,
      deps.currentAsciiHeight.value,
    );
    if (!rect) return false;

    const layerBlocks = deps.currentAsciiLayerBlocks.value;

    // Extract dense selection-relative blocks
    const originalBlocks = extractSelectionBlocks(layerBlocks, rect);
    if (originalBlocks.length === 0) return false;

    // Apply transform
    const transformedBlocks = transformBlocks(originalBlocks, type);

    // Calculate new dimensions after transform
    const newHeight = transformedBlocks.length;
    const newWidth = transformedBlocks[0]?.length || 0;

    // Build undo diff: record old and new blocks for all affected cells
    const oldDiffs: BlockDiff[] = [];
    const newDiffs: BlockDiff[] = [];

    // Clear the original selection area first (record old blocks)
    for (let dy = 0; dy < rect.height; dy++) {
      for (let dx = 0; dx < rect.width; dx++) {
        const gy = rect.y + dy;
        const gx = rect.x + dx;
        const oldBlock = layerBlocks[gy]?.[gx];
        if (oldBlock) {
          oldDiffs.push({
            x: gx,
            y: gy,
            b: { ...oldBlock },
          });
        }
      }
    }

    // Write transformed blocks back to the layer
    // The transform is anchored at the top-left corner of the selection.
    // If rotated and larger, clip to canvas bounds.
    for (let dy = 0; dy < newHeight; dy++) {
      const gy = rect.y + dy;
      if (gy >= deps.currentAsciiHeight.value) break;

      for (let dx = 0; dx < newWidth; dx++) {
        const gx = rect.x + dx;
        if (gx >= deps.currentAsciiWidth.value) break;

        if (!layerBlocks[gy]) layerBlocks[gy] = [];
        const newBlock = transformedBlocks[dy][dx];

        // Only write non-empty blocks
        if (Object.keys(newBlock).length > 0) {
          layerBlocks[gy][gx] = { ...newBlock };
        } else {
          // Clear the cell by deleting all properties
          if (layerBlocks[gy][gx]) {
            delete (layerBlocks[gy][gx] as any).fg;
            delete (layerBlocks[gy][gx] as any).bg;
            delete (layerBlocks[gy][gx] as any).char;
          }
        }

        newDiffs.push({ x: gx, y: gy, b: { ...layerBlocks[gy][gx] } });
      }
    }

    // Also clear any cells in the original selection that aren't covered
    // by the transformed result (e.g., if rotation made it smaller)
    if (newHeight < rect.height || newWidth < rect.width) {
      for (let dy = 0; dy < rect.height; dy++) {
        for (let dx = 0; dx < rect.width; dx++) {
          const gy = rect.y + dy;
          const gx = rect.x + dx;

          // Skip cells covered by transformed result
          if (dy < newHeight && dx < newWidth) continue;

          if (gy < deps.currentAsciiHeight.value &&
              gx < deps.currentAsciiWidth.value) {
            if (layerBlocks[gy]?.[gx]) {
              delete (layerBlocks[gy][gx] as any).fg;
              delete (layerBlocks[gy][gx] as any).bg;
              delete (layerBlocks[gy][gx] as any).char;
            }
          }
        }
      }
    }

    // Record undo diff
    if (oldDiffs.length > 0 || newDiffs.length > 0) {
      const diff: HistoryDiff = {
        old: oldDiffs,
        new: newDiffs,
        l: deps.selectedLayerIndex.value,
      };

      deps.updateAsciiBlocks({
        diff,
        blocks: layerBlocks,
      });
    }

    // Update selection rectangle to match transformed dimensions
    // (anchored at same top-left corner)
    deps.selecting.value = {
      startX: rect.x * bw,
      startY: rect.y * bh,
      endX: (rect.x + Math.min(newWidth, deps.currentAsciiWidth.value - rect.x)) * bw,
      endY: (rect.y + Math.min(newHeight, deps.currentAsciiHeight.value - rect.y)) * bh,
      canSelect: false,
    };

    // Update selected blocks for paste (Ctrl+V)
    const newSelectedBlocks = extractSelectionBlocks(
      layerBlocks,
      selectionToGridRect(
        deps.selecting.value, bw, bh,
        deps.currentAsciiWidth.value,
        deps.currentAsciiHeight.value,
      )!,
    );
    deps.selectedBlocks.value = newSelectedBlocks;
    deps.setSelectBlocks(newSelectedBlocks);

    // Redraw
    await deps.clearToolCanvas();
    await deps.redrawSelect();
    await deps.redrawCanvas();

    return true;
  }

  return {
    applyTransform,
    selectionToGridRect,
    extractSelectionBlocks,
  };
}
