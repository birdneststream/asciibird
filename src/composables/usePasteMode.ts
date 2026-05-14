// Paste Mode composable — ghost preview paste with copy/cut/delete support.
//
// Manages paste-mode state: after copying selected blocks (Ctrl+C),
// pressing Ctrl+V enters paste mode where a semi-transparent ghost
// preview follows the cursor. Clicking stamps the blocks onto the
// canvas at that position.
//
// Also provides cutSelection and deleteSelection operations that
// work with the same selection coordinate system as useSelectionTransform.
//
// Uses toolbarStore.selectBlocks as the backing store (persisted to
// IndexedDB via pinia-plugin-persistedstate), so clipboard contents
// survive page reloads and tab switches.
//
// Follows the useGradientTool/useShapeTool pattern with dep injection
// and cleanup watchers.

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import { mircColours99 } from '../ascii';
import { useToolbarStore } from '../store/toolbar';
import { useAsciiBirdStore } from '../store';
import {
  selectionToGridRect,
  extractSelectionBlocks,
  type SelectionRect,
  type GridSelection,
} from './useSelectionTransform';
import type { Block, BlockDiff } from '../types';

/** Dependencies injected from Editor.vue */
export interface UsePasteModeOptions {
  /** Pixel-coordinate selection rectangle from Editor */
  selecting: Ref<SelectionRect>;
  /** Selected blocks from Editor (2D Block array) */
  selectedBlocks: Ref<Block[][]>;
  /** Block width in pixels (computed from multiplier) */
  blockWidthComp: ComputedRef<number>;
  /** Block height in pixels (computed from multiplier) */
  blockHeightComp: ComputedRef<number>;
  /** Canvas width in blocks */
  currentAsciiWidth: ComputedRef<number>;
  /** Canvas height in blocks */
  currentAsciiHeight: ComputedRef<number>;
  /** Current layer blocks (2D Block array) */
  currentAsciiLayerBlocks: ComputedRef<Block[][]>;
  /** Currently selected layer index */
  selectedLayerIndex: ComputedRef<number>;
  /** Store action to commit undo diff */
  updateAsciiBlocks: (payload: {
    diff: { new: BlockDiff[]; old: BlockDiff[]; l?: number };
    blocks: Block[][];
  }) => void;
  /** Trigger canvas redraw */
  redrawCanvas: () => Promise<void>;
  /** Clear tool overlay canvas */
  clearToolCanvas: () => Promise<void>;
}

export function usePasteMode(opts: UsePasteModeOptions) {
  const toolbarStore = useToolbarStore();
  const store = useAsciiBirdStore();

  // ─── State ──────────────────────────────────────────────────────
  const isPasteMode = ref(false);

  // ─── Computed ───────────────────────────────────────────────────
  const clipboardBlocks = computed<Block[][]>(
    () => toolbarStore.selectBlocks,
  );
  const hasClipboard = computed(
    () => clipboardBlocks.value.length > 0,
  );

  // ─── Helper: get current selection as grid rect ────────────────
  function getSelectionRect(): GridSelection | null {
    return selectionToGridRect(
      opts.selecting.value,
      opts.blockWidthComp.value,
      opts.blockHeightComp.value,
      opts.currentAsciiWidth.value,
      opts.currentAsciiHeight.value,
    );
  }

  // ─── Methods ────────────────────────────────────────────────────

  /**
   * Enter paste mode. Shows ghost preview of clipboard blocks
   * following the cursor. Click to confirm, Escape to cancel.
   */
  function startPasteMode(): void {
    if (!hasClipboard.value) return;
    isPasteMode.value = true;
  }

  /**
   * Cancel paste mode. Resets state without stamping blocks.
   */
  function cancelPasteMode(): void {
    isPasteMode.value = false;
  }

  /**
   * Confirm paste: stamp clipboard blocks at grid position (gx, gy).
   * Only writes non-empty blocks. Clips to canvas bounds.
   * Records a single undo diff.
   * Returns true if any blocks were stamped.
   */
  function confirmPaste(gx: number, gy: number): boolean {
    const blocks = clipboardBlocks.value;
    if (!blocks.length || !blocks[0]?.length) return false;

    const layerBlocks = opts.currentAsciiLayerBlocks.value;
    const canvasW = opts.currentAsciiWidth.value;
    const canvasH = opts.currentAsciiHeight.value;

    const oldDiffs: BlockDiff[] = [];
    const newDiffs: BlockDiff[] = [];

    for (let dy = 0; dy < blocks.length; dy++) {
      const destY = gy + dy;
      if (destY < 0 || destY >= canvasH) continue;

      for (let dx = 0; dx < blocks[dy].length; dx++) {
        const destX = gx + dx;
        if (destX < 0 || destX >= canvasW) continue;

        const srcBlock = blocks[dy][dx];
        // Skip empty source blocks (they don't overwrite)
        if (!srcBlock || Object.keys(srcBlock).length === 0) continue;

        // Record old block for undo
        const oldBlock = layerBlocks[destY]?.[destX];
        if (oldBlock) {
          oldDiffs.push({ x: destX, y: destY, b: { ...oldBlock } });
        } else {
          oldDiffs.push({ x: destX, y: destY, b: {} });
        }

        // Write new block
        if (!layerBlocks[destY]) layerBlocks[destY] = [];
        layerBlocks[destY][destX] = { ...srcBlock };

        newDiffs.push({ x: destX, y: destY, b: { ...srcBlock } });
      }
    }

    if (oldDiffs.length > 0 || newDiffs.length > 0) {
      opts.updateAsciiBlocks({
        diff: {
          old: oldDiffs,
          new: newDiffs,
          l: opts.selectedLayerIndex.value,
        },
        blocks: layerBlocks,
      });
    }

    isPasteMode.value = false;
    return oldDiffs.length > 0;
  }

  /**
   * Cut the current selection: copy blocks to clipboard, then erase
   * the selection area. Returns true if anything was cut.
   */
  function cutSelection(): boolean {
    const rect = getSelectionRect();
    if (!rect) return false;

    const layerBlocks = opts.currentAsciiLayerBlocks.value;

    // Extract and store in clipboard
    const blocks = extractSelectionBlocks(layerBlocks, rect);
    toolbarStore.setSelectBlocks(blocks);

    // Erase the selection area
    const { oldDiffs, newDiffs } = eraseArea(rect, layerBlocks);

    if (oldDiffs.length > 0) {
      opts.updateAsciiBlocks({
        diff: {
          old: oldDiffs,
          new: newDiffs,
          l: opts.selectedLayerIndex.value,
        },
        blocks: layerBlocks,
      });
    }

    return oldDiffs.length > 0;
  }

  /**
   * Delete the current selection contents (clear blocks, keep rect).
   * Does NOT modify the clipboard. Returns true if anything was deleted.
   */
  function deleteSelection(): boolean {
    const rect = getSelectionRect();
    if (!rect) return false;

    const layerBlocks = opts.currentAsciiLayerBlocks.value;
    const { oldDiffs, newDiffs } = eraseArea(rect, layerBlocks);

    if (oldDiffs.length > 0) {
      opts.updateAsciiBlocks({
        diff: {
          old: oldDiffs,
          new: newDiffs,
          l: opts.selectedLayerIndex.value,
        },
        blocks: layerBlocks,
      });
    }

    return oldDiffs.length > 0;
  }

  /**
   * Erase all blocks within a grid selection area.
   * Returns old/new diffs for undo.
   */
  function eraseArea(
    rect: GridSelection,
    layerBlocks: Block[][],
  ): { oldDiffs: BlockDiff[]; newDiffs: BlockDiff[] } {
    const oldDiffs: BlockDiff[] = [];
    const newDiffs: BlockDiff[] = [];

    for (let dy = 0; dy < rect.height; dy++) {
      const gy = rect.y + dy;
      for (let dx = 0; dx < rect.width; dx++) {
        const gx = rect.x + dx;
        const block = layerBlocks[gy]?.[gx];
        if (!block) continue;
        // Only record diffs for non-empty blocks
        if (Object.keys(block).length === 0) continue;

        oldDiffs.push({ x: gx, y: gy, b: { ...block } });
        layerBlocks[gy][gx] = {};
        newDiffs.push({ x: gx, y: gy, b: {} });
      }
    }

    return { oldDiffs, newDiffs };
  }

  /**
   * Draw a semi-transparent ghost preview of clipboard blocks
   * at grid position (gx, gy). Uses canvas 2D context directly.
   */
  function drawPastePreview(
    ctx: CanvasRenderingContext2D,
    gx: number,
    gy: number,
    bw: number,
    bh: number,
  ): void {
    const blocks = clipboardBlocks.value;
    if (!blocks.length) return;

    const canvasW = opts.currentAsciiWidth.value;
    const canvasH = opts.currentAsciiHeight.value;

    ctx.save();
    ctx.globalAlpha = 0.55;

    for (let dy = 0; dy < blocks.length; dy++) {
      const destY = gy + dy;
      if (destY < 0 || destY >= canvasH) continue;

      for (let dx = 0; dx < blocks[dy].length; dx++) {
        const destX = gx + dx;
        if (destX < 0 || destX >= canvasW) continue;

        const block = blocks[dy][dx];
        if (!block || Object.keys(block).length === 0) continue;

        const px = destX * bw;
        const py = destY * bh;

        // Draw background
        if (block.bg !== undefined && block.bg !== null) {
          ctx.fillStyle = mircColours99[block.bg] ?? '#000';
          ctx.fillRect(px, py, bw, bh);
        }

        // Draw foreground color indicator (top half)
        if (block.fg !== undefined && block.fg !== null) {
          ctx.fillStyle = mircColours99[block.fg] ?? '#fff';
          ctx.fillRect(px, py, bw, bh / 2);
        }

        // Draw character if present
        if (block.char) {
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = block.fg !== undefined && block.fg !== null
            ? mircColours99[block.fg] ?? '#fff'
            : '#fff';
          ctx.font = `${Math.round(bh * 0.8)}px Hack`;
          ctx.textBaseline = 'bottom';
          ctx.fillText(block.char, px, py + bh - 1);
          ctx.globalAlpha = 0.55;
        }
      }
    }

    ctx.restore();

    // Draw dashed outline around the paste area
    const pasteW = Math.min(
      blocks[0]?.length ?? 0,
      canvasW - gx,
    );
    const pasteH = Math.min(blocks.length, canvasH - gy);
    if (pasteW > 0 && pasteH > 0) {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(gx * bw, gy * bh, pasteW * bw, pasteH * bh);
      ctx.restore();
    }
  }

  // ─── Cleanup watchers ───────────────────────────────────────────

  // Cancel paste mode when switching tools
  watch(
    () => toolbarStore.currentTool,
    () => {
      if (isPasteMode.value) {
        cancelPasteMode();
      }
    },
  );

  // Cancel paste mode when switching tabs
  watch(
    () => store.tab,
    () => {
      if (isPasteMode.value) {
        cancelPasteMode();
      }
    },
  );

  return {
    isPasteMode,
    clipboardBlocks,
    hasClipboard,
    startPasteMode,
    confirmPaste,
    cancelPasteMode,
    cutSelection,
    deleteSelection,
    drawPastePreview,
  };
}
