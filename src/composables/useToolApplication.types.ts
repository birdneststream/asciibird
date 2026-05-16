// Types for useToolApplication composable.
//
// Extracted to keep the composable file focused on logic.

import type { Block, ToolbarState } from '../types';
import type { DiffBlocks } from '../utils/diffBlocks';
import type { Ref } from 'vue';

/** State refs needed by tool application */
export interface ToolAppStateDeps {
  x: Ref<number>;
  y: Ref<number>;
  isTopHalf: Ref<boolean>;
  canTool: Ref<boolean>;
  diffBlocks: DiffBlocks;
  currentAsciiLayerBlocks: Ref<Block[][]>;
  currentAsciiWidth: Ref<number>;
  currentAsciiHeight: Ref<number>;
  blockWidthComp: Ref<number>;
  blockHeightComp: Ref<number>;
  blockSizeMultiplier: Ref<number>;
  canFg: Ref<boolean>;
  canBg: Ref<boolean>;
  canText: Ref<boolean>;
  currentFg: Ref<number>;
  currentBg: Ref<number>;
  currentChar: Ref<string>;
  isErasing: Ref<boolean>;
  brushBlocks: Ref<(Block | null)[][]>;
  mirrorX: Ref<boolean>;
  mirrorY: Ref<boolean>;
  toolbarState: Ref<ToolbarState>;
  asciiBlockAtXy: Ref<Block | false>;
}

/** Canvas rendering functions needed by tool application */
export interface ToolRenderingDeps {
  getToolCtx: () => CanvasRenderingContext2D | null;
  clearToolCanvas: () => Promise<void>;
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
    target?: 'bg' | 'fg' | null,
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
