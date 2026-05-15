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
import type { Block, ToolbarState } from '../types';
import type { DiffBlocks } from '../utils/diffBlocks';
import type { Ref } from 'vue';

// ─── Types ──────────────────────────────────────────────────────

/** State refs needed by tool application */
export interface ToolAppStateDeps {
  /** Block grid x coordinate */
  x: Ref<number>;
  /** Block grid y coordinate */
  y: Ref<number>;
  /** Whether editing top half of half-block */
  isTopHalf: Ref<boolean>;
  /** Whether tool can apply changes */
  canTool: Ref<boolean>;
  /** Diff tracking for undo */
  diffBlocks: DiffBlocks;
  /** Current ASCII layer blocks */
  currentAsciiLayerBlocks: Ref<Block[][]>;
  /** Current ASCII width */
  currentAsciiWidth: Ref<number>;
  /** Current ASCII height */
  currentAsciiHeight: Ref<number>;
  /** Block pixel width */
  blockWidthComp: Ref<number>;
  /** Block pixel height */
  blockHeightComp: Ref<number>;
  /** Block size multiplier for font rendering */
  blockSizeMultiplier: Ref<number>;
  /** Whether FG can be applied */
  canFg: Ref<boolean>;
  /** Whether BG can be applied */
  canBg: Ref<boolean>;
  /** Whether text/char can be applied */
  canText: Ref<boolean>;
  /** Current FG color index */
  currentFg: Ref<number>;
  /** Current BG color index */
  currentBg: Ref<number>;
  /** Current character */
  currentChar: Ref<string>;
  /** Whether currently erasing */
  isErasing: Ref<boolean>;
  /** Brush block grid */
  brushBlocks: Ref<(Block | null)[][]>;
  /** Mirror X enabled */
  mirrorX: Ref<boolean>;
  /** Mirror Y enabled */
  mirrorY: Ref<boolean>;
  /** Toolbar state (for halfBlockEditing) */
  toolbarState: Ref<ToolbarState>;
  /** Block at current xy position */
  asciiBlockAtXy: Ref<Block | false>;
}

/** Canvas rendering functions needed by tool application */
export interface ToolRenderingDeps {
  /** Get the 2D tool canvas context */
  getToolCtx: () => CanvasRenderingContext2D | null;
  /** Clear the tool overlay canvas */
  clearToolCanvas: () => Promise<void>;
  /** Show error message to user (e.g. for invalid fill) */
  showError: (message: string) => void;
}

/** Options for useToolApplication */
export interface ToolApplicationOptions {
  state: ToolAppStateDeps;
  rendering: ToolRenderingDeps;
}

/** Return type for useToolApplication */
export interface ToolApplicationReturn {
  drawBrush: (plain?: boolean) => Promise<void>;
  drawBrushBlocks: (
    brushX: number,
    brushY: number,
    brushBlock: Block,
    target?: string | null,
    plain?: boolean,
  ) => void;
  drawHalfBlocks: (
    brushX: number,
    brushY: number,
    topHalf?: boolean,
  ) => Promise<void>;
  eraser: () => void;
  fill: (eraser?: boolean) => void;
  recordDiff: (
    sx: number,
    sy: number,
    oldBlock: Block,
    newBlock: Block,
  ) => void;
}

// ─── Composable ─────────────────────────────────────────────────

export function useToolApplication(
  opts: ToolApplicationOptions,
): ToolApplicationReturn {
  const s = opts.state;
  const r = opts.rendering;

  // ─── Record Diff ──────────────────────────────────────────────

  function recordDiff(
    sx: number,
    sy: number,
    oldBlock: Block,
    newBlock: Block,
  ): void {
    storeDiffBlocks(s.diffBlocks, sx, sy, oldBlock, newBlock);
  }

  // ─── Draw Brush Blocks ────────────────────────────────────────

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
    const asciiWidth = s.currentAsciiWidth.value;
    const asciiHeight = s.currentAsciiHeight.value;
    const tBlock = s.currentAsciiLayerBlocks.value[arrayY]?.[arrayX];
    if (!tBlock) return;

    if (plain) {
      let indicatorColour = tBlock.bg === 0 ? 1 : 0;
      if (tBlock.bg === 8) {
        indicatorColour = 1;
      }
      toolCtx.fillStyle = mircColours99[indicatorColour];
      toolCtx.fillRect(brushX, brushY, bw, bh);

      applyMirrored(
        arrayX, arrayY, asciiWidth, asciiHeight,
        s.mirrorX.value, s.mirrorY.value,
        (mx, my) => {
          toolCtx.fillRect(mx * bw, my * bh, bw, bh);
        },
      );
      return;
    }

    switch (target) {
      case 'bg':
        toolCtx.fillStyle =
          brushBlock.bg !== undefined
            ? mircColours99[brushBlock.bg]
            : 'rgba(255,255,255,0.4)';
        break;

      case 'fg':
        toolCtx.fillStyle =
          brushBlock.fg !== undefined
            ? mircColours99[brushBlock.fg]
            : '#FFFFFF';
        break;

      default:
        if (s.canText.value && brushBlock.char !== undefined) {
          toolCtx.font = getCanvasFont(s.blockSizeMultiplier.value);
          toolCtx.fillStyle = s.canFg.value
            ? mircColours99[brushBlock.fg]
            : '#FFFFFF';
          toolCtx.fillText(
            brushBlock.char, brushX, brushY + bh - 3,
          );

          applyMirrored(
            arrayX, arrayY, asciiWidth, asciiHeight,
            s.mirrorX.value, s.mirrorY.value,
            (mx, my) => {
              toolCtx.fillText(
                brushBlock.char!,
                mx * bw,
                my * bh + bh - 3,
              );
            },
          );
        }

        if (s.canText.value && s.canTool.value) {
          tBlock['char'] = brushBlock['char'];

          applyMirrored(
            arrayX, arrayY, asciiWidth, asciiHeight,
            s.mirrorX.value, s.mirrorY.value,
            (mx, my) => {
              if (
                s.currentAsciiLayerBlocks.value[my]
                && s.currentAsciiLayerBlocks.value[my][mx]
                && (s.x.value !== mx || s.y.value !== my)
              ) {
                const charOb = {
                  ...s.currentAsciiLayerBlocks.value[my][mx],
                };
                s.currentAsciiLayerBlocks.value[my][mx].char =
                  brushBlock.char;
                recordDiff(mx, my, charOb, brushBlock);
              }
            },
          );
        }

        return;
    }

    if (s.canBg.value && target === 'bg') {
      toolCtx.setLineDash([1, 2]);
      toolCtx.strokeRect(brushX, brushY, bw, bh);
      toolCtx.fillRect(brushX, brushY, bw, bh);

      applyMirrored(
        arrayX, arrayY, asciiWidth, asciiHeight,
        s.mirrorX.value, s.mirrorY.value,
        (mx, my) => {
          toolCtx.fillRect(mx * bw, my * bh, bw, bh);
          toolCtx.setLineDash([1, 2]);
          toolCtx.strokeRect(mx * bw, my * bh, bw, bh);
        },
      );
    }

    if (s.canTool.value && brushBlock[target!] !== undefined) {
      tBlock[target!] = brushBlock[target!];

      applyMirrored(
        arrayX, arrayY, asciiWidth, asciiHeight,
        s.mirrorX.value, s.mirrorY.value,
        (mx, my) => {
          if (
            s.currentAsciiLayerBlocks.value[my]
            && s.currentAsciiLayerBlocks.value[my][mx]
            && (s.x.value !== mx || s.y.value !== my)
          ) {
            const ob = {
              ...s.currentAsciiLayerBlocks.value[my][mx],
            };
            s.currentAsciiLayerBlocks.value[my][mx][target!] =
              brushBlock[target!];
            recordDiff(mx, my, ob, brushBlock);
          }
        },
      );
    }

    toolCtx.restore();
  }

  // ─── Draw Half Blocks ─────────────────────────────────────────

  /** Draw a half-block at the cursor position. */
  async function drawHalfBlocks(
    brushX: number,
    brushY: number,
    topHalf?: boolean,
  ): Promise<void> {
    const toolCtx = r.getToolCtx();
    if (!toolCtx) return;
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;

    // Use isTopHalf directly (not pixel-based conversion which loses
    // half-block info when y.value is quantised to full-block coords)
    const isTop = topHalf ?? s.isTopHalf.value;
    const blockX = Math.floor(brushX / bw);
    const blockY = Math.floor(brushY / bh);
    const halfY = blockY * 2 + (isTop ? 0 : 1);

    if (
      !s.currentAsciiLayerBlocks.value[blockY]
      || !s.currentAsciiLayerBlocks.value[blockY][blockX]
    ) {
      toolCtx.restore();
      return;
    }

    const ob = { ...s.currentAsciiLayerBlocks.value[blockY][blockX] };

    toolCtx.font = getCanvasFont(s.blockSizeMultiplier.value);
    toolCtx.fillStyle = mircColours99[s.currentFg.value];

    // Draw the half-block character at the correct pixel position
    const charPixelY = isTop ? brushY : brushY;
    toolCtx.fillText(
      isTop ? '\u2580' : '\u2584',
      brushX,
      charPixelY + bh - 3,
    );

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

    toolCtx.restore();
  }

  // ─── Draw Brush ───────────────────────────────────────────────

  async function drawBrush(plain = false): Promise<void> {
    await r.clearToolCanvas();
    const bw = s.blockWidthComp.value;
    const bh = s.blockHeightComp.value;

    // Find first non-empty brush row to determine brush width offset
    const firstRow = s.brushBlocks.value.find(r => r);
    const xLength = firstRow ? firstRow.length : 0;
    const brushDiffX = firstRow
      ? Math.floor(firstRow.length / 2) * bw
      : 0;

    const brushDiffY = Math.floor(
      s.brushBlocks.value.length / 2,
    ) * bh;

    for (let by = 0; by < s.brushBlocks.value.length; by++) {
      if (!s.brushBlocks.value[by]) continue;

      for (let bx = 0; bx < xLength; bx++) {
        if (
          !s.brushBlocks.value[by][bx]
          || isEmptyBlock(s.brushBlocks.value[by][bx])
        ) {
          continue;
        }

        const brushBlock = s.brushBlocks.value[by][bx];

        if (
          brushBlock.char !== undefined
          && brushBlock.char === ' '
          && brushBlock.bg === undefined
          && brushBlock.fg === undefined
        ) {
          continue;
        }

        const brushX =
          s.x.value * bw + bx * bw - brushDiffX;
        // In half-block mode, offset brushY to the correct half.
        // y.value is always a full-block coord; isTopHalf tracks
        // which half the cursor is in.
        const halfOffset = s.toolbarState.value.halfBlockEditing
          && !s.isTopHalf.value
          ? bh / 2
          : 0;
        const brushY =
          s.y.value * bh + by * bh - brushDiffY + halfOffset;

        const arrayY = Math.floor(brushY / bh);
        const arrayX = Math.floor(brushX / bw);

        if (
          s.currentAsciiLayerBlocks.value[arrayY]
          && s.currentAsciiLayerBlocks.value[arrayY][arrayX]
        ) {
          const ob = {
            ...s.currentAsciiLayerBlocks.value[arrayY][arrayX],
          };

          if (!plain) {
            if (s.toolbarState.value.halfBlockEditing) {
              await drawHalfBlocks(
                brushX, brushY, s.isTopHalf.value,
              );
            } else {
              if (s.canBg.value) {
                drawBrushBlocks(brushX, brushY, brushBlock, 'bg');
              }
              if (s.canFg.value) {
                drawBrushBlocks(brushX, brushY, brushBlock, 'fg');
              }
              drawBrushBlocks(brushX, brushY, brushBlock, null);
            }

            if (s.canTool.value && !s.toolbarState.value.halfBlockEditing) {
              recordDiff(arrayX, arrayY, ob, brushBlock);
            }
          } else if (s.isErasing.value) {
            drawBrushBlocks(
              brushX, brushY, brushBlock, null, true,
            );
          }
        }
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

    const brushDiffX =
      Math.floor(s.brushBlocks.value[0]!.length / 2) * bw;
    const brushDiffY =
      Math.floor(s.brushBlocks.value.length / 2) * bh;

    for (let ey = 0; ey < s.brushBlocks.value.length; ey++) {
      for (let ex = 0; ex < s.brushBlocks.value[0]!.length; ex++) {
        const brushX =
          s.x.value * bw + ex * bw - brushDiffX;
        const brushY =
          s.y.value * bh + ey * bh - brushDiffY;

        const arrayY = brushY / bh;
        const arrayX = brushX / bw;

        if (s.currentAsciiLayerBlocks.value[arrayY] === undefined) continue;

        if (
          s.currentAsciiLayerBlocks.value[arrayY][arrayX] === undefined
          || isEmptyBlock(s.brushBlocks.value[ey][ex])
        ) {
          continue;
        }

        const tBlock = s.currentAsciiLayerBlocks.value[arrayY][arrayX];
        const ob = {
          ...s.currentAsciiLayerBlocks.value[arrayY][arrayX],
        };

        eraseBlockProperties(tBlock, {
          fg: s.canFg.value,
          bg: s.canBg.value,
          char: s.canText.value,
        });

        recordDiff(arrayX, arrayY, ob, tBlock);

        applyMirrored(
          arrayX, arrayY,
          s.currentAsciiWidth.value, s.currentAsciiHeight.value,
          s.mirrorX.value, s.mirrorY.value,
          (mx, my) => {
            const block = s.currentAsciiLayerBlocks.value[my]?.[mx];
            if (!block) return;
            const mOb = { ...block };
            eraseBlockProperties(block, {
              fg: s.canFg.value,
              bg: s.canBg.value,
              char: s.canText.value,
            });
            recordDiff(mx, my, mOb, block);
          },
        );
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
        halfY,
        s.x.value,
        fillColour,
      );

      for (const change of changes) {
        if (
          change.old.bg !== change.new.bg
          || change.old.fg !== change.new.fg
          || change.old.char !== change.new.char
        ) {
          recordDiff(change.x, change.y, change.old, change.new);
        }
      }
      return;
    }

    if (!s.canBg.value && !s.canFg.value && !s.canText.value) {
      r.showError('Select at least one fill target (FG/BG/Text)');
      return;
    }

    // Construct fill block with only enabled properties (avoid delete)
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
      s.y.value,
      s.x.value,
      current,
      fillColor,
      s.canBg.value,
      s.canFg.value,
      s.canText.value,
      eraser,
    );

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
