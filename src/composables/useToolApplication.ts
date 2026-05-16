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

// ─── Module-level helpers ───────────────────────────────────────

type StateDeps = ToolApplicationOptions['state'];
type RenderDeps = ToolApplicationOptions['rendering'];

function recordDiff(
  diffBlocks: StateDeps['diffBlocks'],
  sx: number, sy: number, oldBlock: Block, newBlock: Block,
): void {
  storeDiffBlocks(diffBlocks, sx, sy, oldBlock, newBlock);
}

function mirrorBlockMutate(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
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

function snapshotMutateDiff(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  mx: number, my: number, mutate: (block: Block) => void,
): void {
  const block = s.currentAsciiLayerBlocks.value[my][mx];
  const ob = { ...block };
  mutate(block);
  recordDiff(diffBlocks, mx, my, ob, block);
}

function drawBrushBlocksPlain(
  s: StateDeps,
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

function drawBrushBlocksTarget(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
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
    mirrorBlockMutate(s, diffBlocks, arrayX, arrayY, (mx, my) => {
      snapshotMutateDiff(s, diffBlocks, mx, my, (b) => {
        b[target] = val;
      });
    });
  }
}

function drawBrushBlocksChar(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
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
    mirrorBlockMutate(s, diffBlocks, arrayX, arrayY, (mx, my) => {
      snapshotMutateDiff(s, diffBlocks, mx, my, (b) => {
        b.char = brushBlock.char;
      });
    });
  }
}

function doDrawBrushBlocks(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  r: RenderDeps,
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
    drawBrushBlocksPlain(s, toolCtx, brushX, brushY, bw, bh, arrayX, arrayY, tBlock);
  } else if (target === 'bg' || target === 'fg') {
    drawBrushBlocksTarget(s, diffBlocks, toolCtx, brushX, brushY, bw, bh, arrayX, arrayY, brushBlock, target, tBlock);
  } else {
    drawBrushBlocksChar(s, diffBlocks, toolCtx, brushX, brushY, bw, bh, arrayX, arrayY, brushBlock, tBlock);
  }
}

async function doDrawHalfBlocks(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  r: RenderDeps,
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
    recordDiff(diffBlocks, blockX, blockY, ob,
      s.currentAsciiLayerBlocks.value[blockY][blockX]);
    applyMirroredHalfBlock(
      blockX, halfY,
      s.currentAsciiWidth.value, s.currentAsciiHeight.value,
      s.mirrorX.value, s.mirrorY.value,
      (mx, mHalfY, mBlockY) => {
        const mRow = s.currentAsciiLayerBlocks.value[mBlockY];
        if (!mRow || mRow[mx] === undefined) return;
        const mOb = { ...mRow[mx] };
        grid.setColour(mx, mHalfY, s.currentFg.value);
        recordDiff(diffBlocks, mx, mBlockY, mOb, mRow[mx]);
      },
    );
  }
}

function computeBrushBounds(s: StateDeps) {
  const bw = s.blockWidthComp.value;
  const bh = s.blockHeightComp.value;
  const firstRow = s.brushBlocks.value.find(row => row);
  return {
    brushDiffX: firstRow ? Math.floor(firstRow.length / 2) * bw : 0,
    brushDiffY: Math.floor(s.brushBlocks.value.length / 2) * bh,
    xLength: firstRow ? firstRow.length : 0,
  };
}

function shouldSkipCell(cell: Block): boolean {
  if (!cell || isEmptyBlock(cell)) return true;
  return cell.char !== undefined && cell.char === ' '
    && cell.bg === undefined && cell.fg === undefined;
}

async function applyBrushCell(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  r: RenderDeps,
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
      await doDrawHalfBlocks(s, diffBlocks, r, brushX, brushY, s.isTopHalf.value);
    } else {
      if (s.canBg.value) doDrawBrushBlocks(s, diffBlocks, r, brushX, brushY, cell, 'bg');
      if (s.canFg.value) doDrawBrushBlocks(s, diffBlocks, r, brushX, brushY, cell, 'fg');
      doDrawBrushBlocks(s, diffBlocks, r, brushX, brushY, cell, null);
    }
    if (s.canTool.value && !s.toolbarState.value.halfBlockEditing) {
      recordDiff(diffBlocks, arrayX, arrayY, ob, cell);
    }
  } else if (s.isErasing.value) {
    doDrawBrushBlocks(s, diffBlocks, r, brushX, brushY, cell, null, true);
  }
}

async function doDrawBrush(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  r: RenderDeps,
  plain = false,
): Promise<void> {
  await r.clearToolCanvas();
  const { brushDiffX, brushDiffY, xLength } = computeBrushBounds(s);

  for (let by = 0; by < s.brushBlocks.value.length; by++) {
    if (!s.brushBlocks.value[by]) continue;
    for (let bx = 0; bx < xLength; bx++) {
      const cell = s.brushBlocks.value[by][bx];
      if (shouldSkipCell(cell)) continue;
      await applyBrushCell(
        s, diffBlocks, r, cell, bx, by, brushDiffX, brushDiffY, plain,
      );
    }
  }
}

function doEraser(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
): void {
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
      recordDiff(diffBlocks, s.x.value, s.y.value, ob, row[s.x.value]);
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
        recordDiff(diffBlocks, mx, mBlockY, mOb, mRow[mx]);
      },
    );
    return;
  }

  const { brushDiffX, brushDiffY } = computeBrushBounds(s);
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
      recordDiff(diffBlocks, arrayX, arrayY, ob, tBlock);
      mirrorBlockMutate(s, diffBlocks, arrayX, arrayY, (mx, my) => {
        snapshotMutateDiff(s, diffBlocks, mx, my, (b) => {
          eraseBlockProperties(b, eraseOpts);
        });
      });
    }
  }
}

function doFill(
  s: StateDeps,
  diffBlocks: StateDeps['diffBlocks'],
  r: RenderDeps,
  eraser = false,
): void {
  if (s.toolbarState.value.halfBlockEditing) {
    const bh = s.blockHeightComp.value;
    const halfY = Math.floor(
      (s.y.value * bh + (s.isTopHalf.value ? 0 : bh / 2)) / (bh / 2),
    );
    const fillColour = eraser ? 99 : s.currentFg.value;
    const changes = iterativeFillHalfBlock(
      s.currentAsciiLayerBlocks.value, halfY, s.x.value, fillColour,
    );
    recordFillChanges(diffBlocks, changes);
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
  if (JSON.stringify(current) === JSON.stringify(fillColor) && !eraser) return;

  const changes = iterativeFill(
    s.currentAsciiLayerBlocks.value,
    s.y.value, s.x.value, current, fillColor,
    s.canBg.value, s.canFg.value, s.canText.value,
    eraser,
  );
  recordFillChanges(diffBlocks, changes);
}

function recordFillChanges(
  diffBlocks: StateDeps['diffBlocks'],
  changes: Array<{ x: number; y: number; old: Block; new: Block }>,
): void {
  for (const change of changes) {
    if (
      change.old.bg !== change.new.bg
      || change.old.fg !== change.new.fg
      || change.old.char !== change.new.char
    ) {
      recordDiff(diffBlocks, change.x, change.y, change.old, change.new);
    }
  }
}

// ─── Composable ─────────────────────────────────────────────────

export function useToolApplication(
  opts: ToolApplicationOptions,
): ToolApplicationReturn {
  const s = opts.state;
  const r = opts.rendering;
  const d = s.diffBlocks;

  return {
    drawBrush: (plain?: boolean) => doDrawBrush(s, d, r, plain),
    drawBrushBlocks: (
      brushX: number, brushY: number, brushBlock: Block,
      target?: string | null, plain?: boolean,
    ) => doDrawBrushBlocks(s, d, r, brushX, brushY, brushBlock, target ?? null, plain),
    drawHalfBlocks: (brushX: number, brushY: number, topHalf?: boolean) =>
      doDrawHalfBlocks(s, d, r, brushX, brushY, topHalf),
    eraser: () => doEraser(s, d),
    fill: (isEraser?: boolean) => doFill(s, d, r, isEraser),
    recordDiff: (sx: number, sy: number, ob: Block, nb: Block) =>
      recordDiff(d, sx, sy, ob, nb),
  };
}
