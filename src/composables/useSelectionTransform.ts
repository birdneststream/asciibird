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
  x: number;
  y: number;
  width: number;
  height: number;
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
  updateAsciiBlocks: (payload: { diff: HistoryDiff; blocks: Block[][] }) => void;
  setSelectBlocks: (blocks: Block[][]) => void;
  redrawCanvas: () => Promise<void>;
  clearToolCanvas: () => Promise<void>;
  redrawSelect: () => Promise<void>;
}

/**
 * Convert pixel selection rect to grid coordinates.
 * Normalizes so startX < endX, startY < endY.
 */
export function selectionToGridRect(
  sel: SelectionRect,
  bw: number, bh: number,
  canvasWidth: number, canvasHeight: number,
): GridSelection | null {
  if (
    sel.startX === null || sel.startY === null
    || sel.endX === null || sel.endY === null
  ) return null;

  const px = Math.min(sel.startX, sel.endX);
  const py = Math.min(sel.startY, sel.endY);
  const pw = Math.abs(sel.endX - sel.startX);
  const ph = Math.abs(sel.endY - sel.startY);

  const gridX = Math.floor(px / bw);
  const endGridX = Math.ceil((px + pw) / bw);
  const gridY = Math.floor(py / bh);
  const endGridY = Math.ceil((py + ph) / bh);

  const x = Math.max(0, Math.min(gridX, canvasWidth - 1));
  const y = Math.max(0, Math.min(gridY, canvasHeight - 1));
  const width = Math.min(Math.max(1, endGridX - gridX), canvasWidth - x);
  const height = Math.min(Math.max(1, endGridY - gridY), canvasHeight - y);

  return width > 0 && height > 0 ? { x, y, width, height } : null;
}

/**
 * Extract a dense, selection-relative Block[][] from layer data.
 */
export function extractSelectionBlocks(
  layerBlocks: Block[][], rect: GridSelection,
): Block[][] {
  const result: Block[][] = [];
  for (let dy = 0; dy < rect.height; dy++) {
    const row: Block[] = [];
    for (let dx = 0; dx < rect.width; dx++) {
      const block = layerBlocks[rect.y + dy]?.[rect.x + dx];
      if (block) {
        const clean: Block = {};
        if (block.fg != null) clean.fg = block.fg;
        if (block.bg != null) clean.bg = block.bg;
        if (block.char != null) clean.char = block.char;
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
 * Copy selection blocks to toolbar store for later paste.
 * @returns true if blocks were copied, false if nothing to copy
 */
export function copySelectionBlocks(
  selecting: SelectionRect,
  selectedBlocks: Block[][],
  layerBlocks: Block[][],
  blockWidth: number, blockHeight: number,
  canvasWidth: number, canvasHeight: number,
  setSelectBlocks: (blocks: Block[][]) => void,
): boolean {
  if (selectedBlocks.length === 0) return false;
  const rect = selectionToGridRect(
    selecting, blockWidth, blockHeight, canvasWidth, canvasHeight,
  );
  setSelectBlocks(rect && layerBlocks
    ? extractSelectionBlocks(layerBlocks, rect)
    : selectedBlocks);
  return true;
}

// ─── Composable ─────────────────────────────────────────────────

export function useSelectionTransform(deps: SelectionTransformDeps) {
  const { blockWidthComp: bw, blockHeightComp: bh } = deps;

  /** Get current grid rect, or null if no selection. */
  function getRect() {
    return selectionToGridRect(
      deps.selecting.value, bw.value, bh.value,
      deps.currentAsciiWidth.value, deps.currentAsciiHeight.value,
    );
  }

  /** Record diff, update blocks, redraw. */
  async function commitDiff(
    oldDiffs: BlockDiff[], newDiffs: BlockDiff[],
    layerBlocks: Block[][],
  ) {
    if (oldDiffs.length > 0 || newDiffs.length > 0) {
      deps.updateAsciiBlocks({
        diff: { old: oldDiffs, new: newDiffs, l: deps.selectedLayerIndex.value },
        blocks: layerBlocks,
      });
    }
    await deps.clearToolCanvas();
    await deps.redrawSelect();
    await deps.redrawCanvas();
  }

  /** Update selection rect and selected blocks for paste. */
  function updateSelection(
    x: number, y: number, w: number, h: number,
    layerBlocks: Block[][],
  ) {
    deps.selecting.value = {
      startX: x * bw.value,
      startY: y * bh.value,
      endX: (x + w) * bw.value,
      endY: (y + h) * bh.value,
      canSelect: false,
    };
    const newRect = selectionToGridRect(
      deps.selecting.value, bw.value, bh.value,
      deps.currentAsciiWidth.value, deps.currentAsciiHeight.value,
    );
    if (newRect) {
      const blocks = extractSelectionBlocks(layerBlocks, newRect);
      deps.selectedBlocks.value = blocks;
      deps.setSelectBlocks(blocks);
    }
  }

  /** Snapshot all blocks in a grid region for undo. */
  function snapshotRegion(
    layerBlocks: Block[][], x: number, y: number, w: number, h: number,
  ): BlockDiff[] {
    const diffs: BlockDiff[] = [];
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gy = y + dy, gx = x + dx;
        const block = layerBlocks[gy]?.[gx];
        if (block) diffs.push({ x: gx, y: gy, b: { ...block } });
      }
    }
    return diffs;
  }

  // ─── Apply Transform ──────────────────────────────────────────

  async function applyTransform(type: TransformType): Promise<boolean> {
    const rect = getRect();
    if (!rect) return false;

    const layerBlocks = deps.currentAsciiLayerBlocks.value;
    const canvasW = deps.currentAsciiWidth.value;
    const canvasH = deps.currentAsciiHeight.value;

    const originalBlocks = extractSelectionBlocks(layerBlocks, rect);
    if (originalBlocks.length === 0) return false;

    const transformed = transformBlocks(originalBlocks, type);
    const newH = transformed.length;
    const newW = transformed[0]?.length || 0;

    // Record old blocks for undo
    const oldDiffs = snapshotRegion(layerBlocks, rect.x, rect.y, rect.width, rect.height);
    const newDiffs: BlockDiff[] = [];

    // Write transformed blocks back to layer
    for (let dy = 0; dy < newH; dy++) {
      const gy = rect.y + dy;
      if (gy >= canvasH) break;
      for (let dx = 0; dx < newW; dx++) {
        const gx = rect.x + dx;
        if (gx >= canvasW) break;
        if (!layerBlocks[gy]) layerBlocks[gy] = [];
        const block = transformed[dy][dx];
        layerBlocks[gy][gx] = Object.keys(block).length > 0 ? { ...block } : {};
        newDiffs.push({ x: gx, y: gy, b: { ...layerBlocks[gy][gx] } });
      }
    }

    // Clear cells in original selection not covered by transform
    for (let dy = 0; dy < rect.height; dy++) {
      for (let dx = 0; dx < rect.width; dx++) {
        if (dy < newH && dx < newW) continue;
        const gy = rect.y + dy, gx = rect.x + dx;
        if (gy < canvasH && gx < canvasW) {
          layerBlocks[gy][gx] = {};
          newDiffs.push({ x: gx, y: gy, b: {} });
        }
      }
    }

    // Update selection rect BEFORE redraw so redrawSelect renders correctly
    const clampedW = Math.min(newW, canvasW - rect.x);
    const clampedH = Math.min(newH, canvasH - rect.y);
    updateSelection(rect.x, rect.y, clampedW, clampedH, layerBlocks);

    await commitDiff(oldDiffs, newDiffs, layerBlocks);

    return true;
  }

  // ─── Apply Nudge ──────────────────────────────────────────────

  async function applyNudge(dx: number, dy: number): Promise<boolean> {
    const rect = getRect();
    if (!rect) return false;

    const layerBlocks = deps.currentAsciiLayerBlocks.value;
    const canvasW = deps.currentAsciiWidth.value;
    const canvasH = deps.currentAsciiHeight.value;

    const selBlocks = extractSelectionBlocks(layerBlocks, rect);

    // Compute affected area bounds
    const minX = Math.max(0, Math.min(rect.x, rect.x + dx));
    const minY = Math.max(0, Math.min(rect.y, rect.y + dy));
    const maxX = Math.min(canvasW - 1, Math.max(
      rect.x + rect.width - 1, rect.x + rect.width - 1 + dx,
    ));
    const maxY = Math.min(canvasH - 1, Math.max(
      rect.y + rect.height - 1, rect.y + rect.height - 1 + dy,
    ));

    const oldDiffs = snapshotRegion(layerBlocks, minX, minY, maxX - minX + 1, maxY - minY + 1);

    // Clear original selection
    for (let sy = 0; sy < rect.height; sy++) {
      for (let sx = 0; sx < rect.width; sx++) {
        const gy = rect.y + sy, gx = rect.x + sx;
        if (gy < canvasH && gx < canvasW) {
          if (!layerBlocks[gy]) layerBlocks[gy] = [];
          layerBlocks[gy][gx] = {};
        }
      }
    }

    // Write at new position (clipped)
    for (let sy = 0; sy < rect.height; sy++) {
      const destY = rect.y + sy + dy;
      if (destY < 0 || destY >= canvasH) continue;
      for (let sx = 0; sx < rect.width; sx++) {
        const destX = rect.x + sx + dx;
        if (destX < 0 || destX >= canvasW) continue;
        const src = selBlocks[sy]?.[sx];
        if (src && Object.keys(src).length > 0) {
          if (!layerBlocks[destY]) layerBlocks[destY] = [];
          layerBlocks[destY][destX] = { ...src };
        }
      }
    }

    // Record new blocks in affected area
    const newDiffs: BlockDiff[] = [];
    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        const block = layerBlocks[gy]?.[gx];
        newDiffs.push({ x: gx, y: gy, b: block ? { ...block } : {} });
      }
    }

    // Update selection rect BEFORE redraw so redrawSelect renders correctly
    const clampedX = Math.max(0, rect.x + dx);
    const clampedY = Math.max(0, rect.y + dy);
    const clampedW = Math.min(rect.width, canvasW - clampedX);
    const clampedH = Math.min(rect.height, canvasH - clampedY);

    if (clampedW > 0 && clampedH > 0) {
      updateSelection(clampedX, clampedY, clampedW, clampedH, layerBlocks);
    }

    await commitDiff(oldDiffs, newDiffs, layerBlocks);

    return true;
  }

  return {
    applyTransform,
    applyNudge,
    selectionToGridRect,
    extractSelectionBlocks,
  };
}
