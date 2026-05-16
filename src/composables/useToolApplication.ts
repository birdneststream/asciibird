// Tool Application composable — brush, eraser, fill drawing logic.
//
// Encapsulates the core tool application functions that modify
// block data on the canvas: drawBrush, drawBrushBlocks,
// drawHalfBlocks, eraser, fill. These functions are tightly
// coupled to editor state and canvas rendering, so they receive
// all dependencies via the options interface.

import {
  mircColours99,
  isEmptyBlock,
  eraseBlockProperties,
  iterativeFill,
  iterativeFillHalfBlock,
} from '../ascii';
import { applyMirrored, applyMirroredHalfBlock } from '../utils/mirror';
import { storeDiffBlocks } from '../utils/diffBlocks';
import { getCanvasFont } from '../utils/canvasFont';
import { HalfBlockGrid } from '../utils/halfBlockGrid';
import type { Block } from '../types';
import type {
  ToolApplicationOptions,
  ToolApplicationReturn,
} from './useToolApplication.types';

// Re-export types for consumers
export type {
  ToolAppStateDeps,
  ToolRenderingDeps,
  ToolApplicationOptions,
  ToolApplicationReturn,
} from './useToolApplication.types';

// ─── Composable ─────────────────────────────────────────────────

export function useToolApplication(
  opts: ToolApplicationOptions,
): ToolApplicationReturn {
  const s = opts.state;
  const r = opts.rendering;

  function recordDiff(
    sx: number, sy: number, oldBlock: Block, newBlock: Block,
  ): void {
    storeDiffBlocks(s.diffBlocks, sx, sy, oldBlock, newBlock);
  }

  // ─── Mirror helpers ───────────────────────────────────────────

  /** Mirror a block-mutation to mirrored positions with diff recording. */
  function mirrorBlockMutate(
    arrayX: number,
    arrayY: number,
    mutate: (mx: number, my: number) => void,
  ): void {
    applyMirrored(
      arrayX, arrayY,
      s.currentAsciiWidth.value, s.currentAsciiHeight.value,
      s.mirrorX.value, s.mirrorY.value,
      (mx, my) => {
        if (
          s.currentAsciiLayerBlocks.value[my]
          && s.currentAsciiLayerBlocks.value[my][mx]
          && (s.x.value !== mx || s.y.value !== my)
        ) {
          mutate(mx, my);
        }
      },
    );
  }

  /** Snapshot a block, mutate it, then record the diff. */
  function snapshotMutateDiff(
    mx: number, my: number, mutate: (block: Block) => void,
  ): void {
    const block = s.currentAsciiLayerBlocks.value[my][mx];
    const ob = { ...block };
    mutate(block);
    recordDiff(mx, my, ob, block);
  }

  // ─── Draw Brush Blocks ────────────────────────────────────────

  /** Plain mode: draw indicator rectangle only */
  function drawBrushBlocksPlain(
    toolCtx: CanvasRenderingContext2D,
    brushX: number, brushY: number,
    bw: number, bh: number,
    arrayX: number, arrayY: number,
    tBlock: Block,
  ): void {
    const indicatorColour = tBlock.bg === 0 || tBlock.bg === 8 ? 1 : 0;
    toolCtx.fillStyle = mircColours99[indicatorColour];
    toolCtx.fillRect(brushX, brushY, bw, bh);

    applyMirrored(
      arrayX, arrayY,
      s.currentAsciiWidth.value, s.currentAsciiHeight.value,
      s.mirrorX.value, s.mirrorY.value,
      (mx, my) => toolCtx.fillRect(mx * bw, my * bh, bw, bh),
    );
  }

  /** Target mode: apply bg or fg colour to canvas and block */
  function drawBrushBlocksTarget(
    toolCtx: CanvasRenderingContext2D,
    brushX: number, brushY: number,
    bw: number, bh: number,
    arrayX: number, arrayY: number,
    brushBlock: Block, target: 'bg' | 'fg',
    tBlock: Block,
  ): void {
    const val = brushBlock[target];
    const canApply = target === 'bg' ? s.canBg.value : true;

    toolCtx.fillStyle = val !== undefined
      ? mircColours99[val]
      : target === 'bg' ? 'rgba(255,255,255,0.4)' : '#FFFFFF';

    if (target === 'bg' && canApply) {
      toolCtx.setLineDash([1, 2]);
      toolCtx.strokeRect(brushX, brushY, bw, bh);
      toolCtx.fillRect(brushX, brushY, bw, bh);
      applyMirrored(
        arrayX, arrayY,
        s.currentAsciiWidth.value, s.currentAsciiHeight.value,
        s.mirrorX.value, s.mirrorY.value,
        (mx, my) => {
          toolCtx.fillRect(mx * bw, my * bh, bw, bh);
          toolCtx.setLineDash([1, 2]);
          toolCtx.strokeRect(mx * bw, my * bh, bw, bh);
        },
      );
    }

    if (s.canTool.value && val !== undefined) {
      tBlock[target] = val;
      mirrorBlockMutate(arrayX, arrayY, (mx, my) => {
        snapshotMutateDiff(mx, my, (b) => {
          b[target] = val;
        });
      });
    }
  }

  /** Char mode: draw character text and mutate block */
  function drawBrushBlocksChar(
    toolCtx: CanvasRenderingContext2D,
    brushX: number, brushY: number,
    bw: number, bh: number,
    arrayX: number, arrayY: number,
    brushBlock: Block,
    tBlock: Block,
  ): void {
    if (s.canText.value && brushBlock.char !== undefined) {
      toolCtx.font = getCanvasFont(s.blockSizeMultiplier.value);
      toolCtx.fillStyle = s.canFg.value
        ? mircColours99[brushBlock.fg]
        : '#FFFFFF';
      toolCtx.fillText(brushBlock.char, brushX, brushY + bh - 3);

      applyMirrored(
        arrayX, arrayY,
        s.currentAsciiWidth.value, s.currentAsciiHeight.value,
        s.mirrorX.value, s.mirrorY.value,
        (mx, my) => {
          toolCtx.fillText(
            brushBlock.char!, mx * bw, my * bh + bh - 3,
          );
        },
      );
    }

    if (s.canText.value && s.canTool.value) {
      tBlock.char = brushBlock.char;
      mirrorBlockMutate(arrayX, arrayY, (mx, my) => {
        snapshotMutateDiff(mx, my, (b) => {
          b.char = brushBlock.char;
        });
      });
    }
  }

  function drawBrushBlocks(
    brushX: number,
    brushY: number,
    brushBlock: Block,
    target: string | null = null,
    plain = false,
  ): void {
    const toolCtx = r.getToolCtx();
    if (!toolCtx) return;
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;
    const arrayY = brushY / bh;
    const arrayX = brushX / bw;
    const tBlock = s.currentAsciiLayerBlocks.value[arrayY]?.[arrayX];
    if (!tBlock) return;

    if (plain) {
      drawBrushBlocksPlain(
        toolCtx, brushX, brushY, bw, bh, arrayX, arrayY, tBlock,
      );
    } else if (target === 'bg' || target === 'fg') {
      drawBrushBlocksTarget(
        toolCtx, brushX, brushY, bw, bh,
        arrayX, arrayY, brushBlock, target, tBlock,
      );
    } else {
      drawBrushBlocksChar(
        toolCtx, brushX, brushY, bw, bh,
        arrayX, arrayY, brushBlock, tBlock,
      );
    }
  }

  // ─── Draw Half Blocks ─────────────────────────────────────────

  async function drawHalfBlocks(
    brushX: number, brushY: number, topHalf?: boolean,
  ): Promise<void> {
    const toolCtx = r.getToolCtx();
    if (!toolCtx) return;
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;
    const isTop = topHalf ?? s.isTopHalf.value;
    const blockX = Math.floor(brushX / bw);
    const blockY = Math.floor(brushY / bh);
    const halfY = blockY * 2 + (isTop ? 0 : 1);

    if (!s.currentAsciiLayerBlocks.value[blockY]?.[blockX]) return;

    const ob = { ...s.currentAsciiLayerBlocks.value[blockY][blockX] };
    const halfH = bh / 2;
    toolCtx.fillStyle = mircColours99[s.currentFg.value];
    toolCtx.fillRect(brushX, isTop ? brushY : brushY + halfH, bw, halfH);

    if (s.canTool.value) {
      const grid = new HalfBlockGrid(s.currentAsciiLayerBlocks.value);
      grid.setColour(blockX, halfY, s.currentFg.value);

      recordDiff(
        blockX, blockY, ob,
        s.currentAsciiLayerBlocks.value[blockY][blockX],
      );

      applyMirroredHalfBlock(
        blockX, halfY,
        s.currentAsciiWidth.value, s.currentAsciiHeight.value,
        s.mirrorX.value, s.mirrorY.value,
        (mx, mHalfY, mBlockY) => {
          const mRow = s.currentAsciiLayerBlocks.value[mBlockY];
          if (!mRow || mRow[mx] === undefined) return;
          const mOb = { ...mRow[mx] };
          grid.setColour(mx, mHalfY, s.currentFg.value);
          recordDiff(mx, mBlockY, mOb, mRow[mx]);
        },
      );
    }
  }

  // ─── Brush bounds ─────────────────────────────────────────────

  function computeBrushBounds() {
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;
    const firstRow = s.brushBlocks.value.find(row => row);
    return {
      brushDiffX: firstRow ? Math.floor(firstRow.length / 2) * bw : 0,
      brushDiffY: Math.floor(s.brushBlocks.value.length / 2) * bh,
      xLength: firstRow ? firstRow.length : 0,
    };
  }

  // ─── Draw Brush ───────────────────────────────────────────────

  /** Check if a brush cell should be skipped (empty or whitespace-only) */
  function shouldSkipCell(cell: Block): boolean {
    if (!cell || isEmptyBlock(cell)) return true;
    return cell.char !== undefined && cell.char === ' '
      && cell.bg === undefined && cell.fg === undefined;
  }

  /** Apply a single brush cell to the canvas */
  async function applyBrushCell(
    cell: Block, bx: number, by: number,
    brushDiffX: number, brushDiffY: number,
    plain: boolean,
  ): Promise<void> {
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;
    const brushX = s.x.value * bw + bx * bw - brushDiffX;
    const halfOffset = s.toolbarState.value.halfBlockEditing
      && !s.isTopHalf.value ? bh / 2 : 0;
    const brushY = s.y.value * bh + by * bh - brushDiffY + halfOffset;
    const arrayY = Math.floor(brushY / bh);
    const arrayX = Math.floor(brushX / bw);

    const row = s.currentAsciiLayerBlocks.value[arrayY];
    if (!row?.[arrayX]) return;

    if (!plain) {
      const ob = { ...row[arrayX] };
      if (s.toolbarState.value.halfBlockEditing) {
        await drawHalfBlocks(brushX, brushY, s.isTopHalf.value);
      } else {
        if (s.canBg.value) drawBrushBlocks(brushX, brushY, cell, 'bg');
        if (s.canFg.value) drawBrushBlocks(brushX, brushY, cell, 'fg');
        drawBrushBlocks(brushX, brushY, cell, null);
      }
      if (s.canTool.value && !s.toolbarState.value.halfBlockEditing) {
        recordDiff(arrayX, arrayY, ob, cell);
      }
    } else if (s.isErasing.value) {
      drawBrushBlocks(brushX, brushY, cell, null, true);
    }
  }

  async function drawBrush(plain = false): Promise<void> {
    await r.clearToolCanvas();
    const { brushDiffX, brushDiffY, xLength } = computeBrushBounds();

    for (let by = 0; by < s.brushBlocks.value.length; by++) {
      if (!s.brushBlocks.value[by]) continue;
      for (let bx = 0; bx < xLength; bx++) {
        const cell = s.brushBlocks.value[by][bx];
        if (shouldSkipCell(cell)) continue;
        await applyBrushCell(
          cell, bx, by, brushDiffX, brushDiffY, plain,
        );
      }
    }
  }

  // ─── Eraser ───────────────────────────────────────────────────

  function eraser(): void {
    if (!s.canTool.value) return;

    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;

    if (s.toolbarState.value.halfBlockEditing) {
      const grid = new HalfBlockGrid(s.currentAsciiLayerBlocks.value);
      const halfY = s.y.value * 2 + (s.isTopHalf.value ? 0 : 1);

      const row = s.currentAsciiLayerBlocks.value[s.y.value];
      if (row && row[s.x.value] !== undefined) {
        const ob = { ...row[s.x.value] };
        grid.setColour(s.x.value, halfY, 99);
        recordDiff(s.x.value, s.y.value, ob, row[s.x.value]);
      }

      applyMirroredHalfBlock(
        s.x.value, halfY,
        s.currentAsciiWidth.value, s.currentAsciiHeight.value,
        s.mirrorX.value, s.mirrorY.value,
        (mx, mHalfY, mBlockY) => {
          const mRow = s.currentAsciiLayerBlocks.value[mBlockY];
          if (!mRow || mRow[mx] === undefined) return;
          const mOb = { ...mRow[mx] };
          grid.setColour(mx, mHalfY, 99);
          recordDiff(mx, mBlockY, mOb, mRow[mx]);
        },
      );
      return;
    }

    const { brushDiffX, brushDiffY } = computeBrushBounds();
    const eraseOpts = {
      fg: s.canFg.value, bg: s.canBg.value, char: s.canText.value,
    };

    for (let ey = 0; ey < s.brushBlocks.value.length; ey++) {
      for (let ex = 0; ex < s.brushBlocks.value[0]!.length; ex++) {
        const brushX = s.x.value * bw + ex * bw - brushDiffX;
        const brushY = s.y.value * bh + ey * bh - brushDiffY;
        const arrayY = brushY / bh;
        const arrayX = brushX / bw;

        if (!s.currentAsciiLayerBlocks.value[arrayY]?.[arrayX]) continue;
        if (isEmptyBlock(s.brushBlocks.value[ey][ex])) continue;

        const tBlock = s.currentAsciiLayerBlocks.value[arrayY][arrayX];
        const ob = { ...tBlock };

        eraseBlockProperties(tBlock, eraseOpts);
        recordDiff(arrayX, arrayY, ob, tBlock);

        mirrorBlockMutate(arrayX, arrayY, (mx, my) => {
          snapshotMutateDiff(mx, my, (b) => {
            eraseBlockProperties(b, eraseOpts);
          });
        });
      }
    }
  }

  // ─── Fill ─────────────────────────────────────────────────────

  function fill(eraser = false): void {
    if (s.toolbarState.value.halfBlockEditing) {
      const bh = s.blockHeightComp.value;
      const halfY = Math.floor(
        (s.y.value * bh + (s.isTopHalf.value ? 0 : bh / 2)) / (bh / 2),
      );
      const fillColour = eraser ? 99 : s.currentFg.value;

      const changes = iterativeFillHalfBlock(
        s.currentAsciiLayerBlocks.value,
        halfY, s.x.value, fillColour,
      );

      recordFillChanges(changes);
      return;
    }

    if (!s.canBg.value && !s.canFg.value && !s.canText.value) {
      r.showError('Select at least one fill target (FG/BG/Text)');
      return;
    }

    const fillColor: Block = {};
    if (s.canBg.value) fillColor.bg = s.currentBg.value;
    if (s.canFg.value) fillColor.fg = s.currentFg.value;
    if (s.canText.value) fillColor.char = s.currentChar.value;

    const current = { ...(s.asciiBlockAtXy.value as Block) };

    if (JSON.stringify(current) === JSON.stringify(fillColor) && !eraser) {
      return;
    }

    const changes = iterativeFill(
      s.currentAsciiLayerBlocks.value,
      s.y.value, s.x.value, current, fillColor,
      s.canBg.value, s.canFg.value, s.canText.value,
      eraser,
    );

    recordFillChanges(changes);
  }

  /** Record diffs for fill changes that modified blocks. */
  function recordFillChanges(
    changes: Array<{ x: number; y: number; old: Block; new: Block }>,
  ): void {
    for (const change of changes) {
      if (
        change.old.bg !== change.new.bg
        || change.old.fg !== change.new.fg
        || change.old.char !== change.new.char
      ) {
        recordDiff(change.x, change.y, change.old, change.new);
      }
    }
  }

  return {
    drawBrush,
    drawBrushBlocks,
    drawHalfBlocks,
    eraser,
    fill,
    recordDiff,
  };
}
