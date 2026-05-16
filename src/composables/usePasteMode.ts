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
import { mircColours99, hasBlockContent } from '../ascii';
import { useToolbarStore } from '../store/toolbar';
import { useAsciiBirdStore } from '../store';
import {
  selectionToGridRect,
  extractSelectionBlocks,
  type SelectionRect,
  type GridSelection,
} from './useSelectionTransform';
import type { Block, BlockDiff } from '../types';

// ─── Pure helpers (module-level, no closure over composable state) ─────

/** Render a single block's bg, fg, and character onto the canvas */
function renderPasteBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  px: number,
  py: number,
  bw: number,
  bh: number,
): void {
  if (block.bg != null) {
    ctx.fillStyle = mircColours99[block.bg] ?? '#000';
    ctx.fillRect(px, py, bw, bh);
  }

  if (block.fg != null) {
    ctx.fillStyle = mircColours99[block.fg] ?? '#fff';
    ctx.fillRect(px, py, bw, bh / 2);
  }

  if (block.char) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = block.fg != null
      ? mircColours99[block.fg] ?? '#fff'
      : '#fff';
    ctx.font = `${Math.round(bh * 0.8)}px Hack`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(block.char, px, py + bh - 1);
    ctx.globalAlpha = 0.55;
  }
}

/** Draw dashed outline around the paste preview area */
function drawPasteOutline(
  ctx: CanvasRenderingContext2D,
  blocks: Block[][],
  gx: number,
  gy: number,
  bw: number,
  bh: number,
  canvasW: number,
  canvasH: number,
): void {
  const pasteW = Math.min(blocks[0]?.length ?? 0, canvasW - gx);
  const pasteH = Math.min(blocks.length, canvasH - gy);
  if (pasteW <= 0 || pasteH <= 0) return;

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(gx * bw, gy * bh, pasteW * bw, pasteH * bh);
  ctx.restore();
}

/** Dependencies injected from Editor.vue */
export interface UsePasteModeOptions {
  selecting: Ref<SelectionRect>;
  blockWidthComp: ComputedRef<number>;
  blockHeightComp: ComputedRef<number>;
  currentAsciiWidth: ComputedRef<number>;
  currentAsciiHeight: ComputedRef<number>;
  currentAsciiLayerBlocks: ComputedRef<Block[][]>;
  selectedLayerIndex: ComputedRef<number>;
  updateAsciiBlocks: (payload: {
    diff: { new: BlockDiff[]; old: BlockDiff[]; l?: number };
    blocks: Block[][];
  }) => void;
  redrawCanvas: () => Promise<void>;
  clearToolCanvas: () => Promise<void>;
}

// ─── Module-level operations ────────────────────────────────────

/** Get current selection as grid rect */
function getSelectionRect(
  opts: UsePasteModeOptions,
): GridSelection | null {
  return selectionToGridRect(
    opts.selecting.value,
    opts.blockWidthComp.value,
    opts.blockHeightComp.value,
    opts.currentAsciiWidth.value,
    opts.currentAsciiHeight.value,
  );
}

/** Erase all blocks within a grid selection area. Returns old/new diffs for undo. */
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
      if (!hasBlockContent(block)) continue;

      oldDiffs.push({ x: gx, y: gy, b: { ...block } });
      layerBlocks[gy][gx] = {};
      newDiffs.push({ x: gx, y: gy, b: {} });
    }
  }

  return { oldDiffs, newDiffs };
}

/** Commit blocks diff for undo/redo. */
function commitDiff(
  opts: UsePasteModeOptions,
  oldDiffs: BlockDiff[],
  newDiffs: BlockDiff[],
  layerBlocks: Block[][],
): void {
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
}

/** Confirm paste: stamp clipboard blocks at grid position (gx, gy). */
function confirmPaste(
  opts: UsePasteModeOptions,
  blocks: Block[][],
  gx: number, gy: number,
): boolean {
  if (!blocks || !blocks.length || !blocks[0]?.length) return false;

  const layerBlocks = opts.currentAsciiLayerBlocks.value;
  const canvasW = opts.currentAsciiWidth.value;
  const canvasH = opts.currentAsciiHeight.value;

  const oldDiffs: BlockDiff[] = [];
  const newDiffs: BlockDiff[] = [];

  for (let dy = 0; dy < blocks.length; dy++) {
    const destY = gy + dy;
    if (destY < 0 || destY >= canvasH) continue;
    const srcRow = blocks[dy];
    if (!srcRow) continue;

    for (let dx = 0; dx < srcRow.length; dx++) {
      const destX = gx + dx;
      if (destX < 0 || destX >= canvasW) continue;

      const srcBlock = srcRow[dx];
      if (!hasBlockContent(srcBlock)) continue;

      const oldBlock = layerBlocks[destY]?.[destX];
      if (oldBlock) {
        oldDiffs.push({ x: destX, y: destY, b: { ...oldBlock } });
      } else {
        oldDiffs.push({ x: destX, y: destY, b: {} });
      }

      if (!layerBlocks[destY]) layerBlocks[destY] = [];
      layerBlocks[destY][destX] = { ...srcBlock };

      newDiffs.push({ x: destX, y: destY, b: { ...srcBlock } });
    }
  }

  commitDiff(opts, oldDiffs, newDiffs, layerBlocks);
  return oldDiffs.length > 0;
}

/** Draw a semi-transparent ghost preview of clipboard blocks. */
function drawPastePreview(
  opts: UsePasteModeOptions,
  blocks: Block[][],
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  bw: number,
  bh: number,
): void {
  if (!blocks || !blocks.length) return;

  const canvasW = opts.currentAsciiWidth.value;
  const canvasH = opts.currentAsciiHeight.value;

  ctx.save();
  ctx.globalAlpha = 0.55;

  for (let dy = 0; dy < blocks.length; dy++) {
    const destY = gy + dy;
    if (destY < 0 || destY >= canvasH) continue;
    const row = blocks[dy];
    if (!row) continue;

    for (let dx = 0; dx < row.length; dx++) {
      const destX = gx + dx;
      if (destX < 0 || destX >= canvasW) continue;
      if (!hasBlockContent(row[dx])) continue;

      renderPasteBlock(ctx, row[dx], destX * bw, destY * bh, bw, bh);
    }
  }

  ctx.restore();
  drawPasteOutline(ctx, blocks, gx, gy, bw, bh, canvasW, canvasH);
}

// ─── Composable ─────────────────────────────────────────────────

export function usePasteMode(opts: UsePasteModeOptions) {
  const toolbarStore = useToolbarStore();
  const store = useAsciiBirdStore();

  const isPasteMode = ref(false);
  const clipboardBlocks = computed<Block[][]>(
    () => toolbarStore.selectBlocks,
  );
  const hasClipboard = computed(() => clipboardBlocks.value.length > 0);

  function startPasteMode(): void {
    if (!hasClipboard.value) return;
    isPasteMode.value = true;
  }

  function cancelPasteMode(): void {
    isPasteMode.value = false;
  }

  function doConfirmPaste(gx: number, gy: number): boolean {
    const result = confirmPaste(opts, clipboardBlocks.value, gx, gy);
    isPasteMode.value = false;
    return result;
  }

  function cutSelection(): boolean {
    const rect = getSelectionRect(opts);
    if (!rect) return false;
    const layerBlocks = opts.currentAsciiLayerBlocks.value;
    const blocks = extractSelectionBlocks(layerBlocks, rect);
    toolbarStore.setSelectBlocks(blocks);
    const { oldDiffs, newDiffs } = eraseArea(rect, layerBlocks);
    commitDiff(opts, oldDiffs, newDiffs, layerBlocks);
    return oldDiffs.length > 0;
  }

  function deleteSelection(): boolean {
    const rect = getSelectionRect(opts);
    if (!rect) return false;
    const layerBlocks = opts.currentAsciiLayerBlocks.value;
    const { oldDiffs, newDiffs } = eraseArea(rect, layerBlocks);
    commitDiff(opts, oldDiffs, newDiffs, layerBlocks);
    return oldDiffs.length > 0;
  }

  function doDrawPastePreview(
    ctx: CanvasRenderingContext2D, gx: number, gy: number,
    bw: number, bh: number,
  ): void {
    drawPastePreview(opts, clipboardBlocks.value, ctx, gx, gy, bw, bh);
  }

  // Cancel paste mode when switching tools or tabs
  watch(
    () => toolbarStore.currentTool,
    () => { if (isPasteMode.value) cancelPasteMode(); },
  );
  watch(
    () => store.tab,
    () => { if (isPasteMode.value) cancelPasteMode(); },
  );

  return {
    isPasteMode,
    clipboardBlocks,
    hasClipboard,
    startPasteMode,
    confirmPaste: doConfirmPaste,
    cancelPasteMode,
    cutSelection,
    deleteSelection,
    drawPastePreview: doDrawPastePreview,
  };
}
