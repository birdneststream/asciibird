// Text Editing composable — extracted from Editor.vue.
//
// Encapsulates the canvasKeyDown function that handles keyboard
// input in text editing mode: character typing, Backspace/Delete,
// Enter (new line), arrow key cursor movement, and mirror support.
//
// Dependencies are injected via a grouped options interface.

import { applyMirrored } from '../utils/mirror';
import type { Ref } from 'vue';
import type { Block } from '../types';

// ─── Types ──────────────────────────────────────────────────────

/** State refs needed by text editing */
export interface TextEditStateDeps {
  /** Text editing cursor position { startX, startY } */
  textEditing: Ref<{ startX: number | null; startY: number | null }>;
  /** Whether foreground color can be applied */
  canFg: Ref<boolean>;
  /** Current foreground color index */
  currentFg: Ref<number>;
  /** Current ASCII layer blocks (2D array) */
  currentAsciiLayerBlocks: Ref<Block[][]>;
  /** Current ASCII width in blocks */
  currentAsciiWidth: Ref<number>;
  /** Current ASCII height in blocks */
  currentAsciiHeight: Ref<number>;
  /** Mirror X enabled */
  mirrorX: Ref<boolean>;
  /** Mirror Y enabled */
  mirrorY: Ref<boolean>;
}

/** Action callbacks needed by text editing */
export interface TextEditActionDeps {
  /** Record a diff for undo/redo */
  recordDiff: (
    x: number, y: number,
    oldBlock: Block, newBlock: Block,
  ) => void;
  /** Clear the tool overlay canvas */
  clearToolCanvas: () => Promise<void>;
  /** Draw text editing indicator */
  drawTextIndicator: () => Promise<void>;
  /** Draw general indicator */
  drawIndicator: () => Promise<void>;
  /** Delayed canvas redraw */
  delayRedrawCanvas: (force?: boolean) => Promise<void>;
}

/** All dependencies injected from Editor.vue */
export interface TextEditingDeps {
  state: TextEditStateDeps;
  actions: TextEditActionDeps;
}

// ─── Module-level helpers ────────────────────────────────────────

/** Cursor movement map for navigation keys */
const CURSOR_MOVE: Record<string, (
  data: Block[][], sx: number, sy: number,
) => { sx: number; sy: number }> = {
  Enter: (data, sx, sy) =>
    data[sy + 1]?.[0] ? { sx: 0, sy: sy + 1 } : { sx, sy },
  ArrowUp: (data, sx, sy) =>
    data[sy - 1]?.[sx] ? { sx, sy: sy - 1 } : { sx, sy },
  ArrowDown: (data, sx, sy) =>
    data[sy + 1]?.[sx] ? { sx, sy: sy + 1 } : { sx, sy },
  ArrowLeft: (data, sx, sy) =>
    data[sy]?.[sx - 1] ? { sx: sx - 1, sy } : { sx, sy },
  ArrowRight: (data, sx, sy) =>
    data[sy]?.[sx + 1] ? { sx: sx + 1, sy } : { sx, sy },
};

/** Delete the character at (sx, sy) and apply mirror. */
function deleteAtPos(
  s: TextEditStateDeps,
  a: TextEditActionDeps,
  data: Block[][], sx: number, sy: number,
): void {
  if (!data[sy]?.[sx]) return;
  const block = data[sy][sx];
  const ob = { ...block };
  delete block['char'];
  a.recordDiff(sx, sy, ob, block);

  applyMirrored(
    sx, sy,
    s.currentAsciiWidth.value, s.currentAsciiHeight.value,
    s.mirrorX.value, s.mirrorY.value,
    (mx, my) => {
      const mBlock = data[my]?.[mx];
      if (!mBlock) return;
      const mOb = { ...mBlock };
      delete mBlock['char'];
      a.recordDiff(mx, my, mOb, mBlock);
    },
  );
}

/** Type a character at (sx, sy) with mirror, return new position. */
function typeChar(
  s: TextEditStateDeps,
  a: TextEditActionDeps,
  data: Block[][], sx: number, sy: number, char: string,
): { sx: number; sy: number } {
  const targetBlock = data[sy][sx];
  if (!targetBlock) return { sx, sy };

  const ob = { ...targetBlock };
  targetBlock.char = char;
  if (s.canFg.value) {
    targetBlock.fg = s.currentFg.value;
  }
  a.recordDiff(sx, sy, ob, targetBlock);

  applyMirrored(
    sx, sy,
    s.currentAsciiWidth.value, s.currentAsciiHeight.value,
    s.mirrorX.value, s.mirrorY.value,
    (mx, my) => {
      const block = data[my]?.[mx];
      if (!block) return;
      const mOb = { ...block };
      if (s.canFg.value) {
        block.fg = s.currentFg.value;
      }
      block.char = char;
      a.recordDiff(mx, my, mOb, block);
    },
  );

  // Advance cursor
  if (data[sy]?.[sx + 1]) {
    return { sx: sx + 1, sy };
  }
  return {
    sx: 0,
    sy: sy < s.currentAsciiHeight.value ? sy + 1 : sy,
  };
}

/**
 * Handle keyboard input in text editing mode.
 * Processes character typing, Backspace/Delete, Enter,
 * arrow keys, and applies mirror if enabled.
 */
async function canvasKeyDown(
  s: TextEditStateDeps,
  a: TextEditActionDeps,
  char: string,
): Promise<void> {
  const rawX = s.textEditing.value.startX;
  const rawY = s.textEditing.value.startY;
  if (rawX === null || rawY === null) return;

  let sx = rawX;
  let sy = rawY;

  const data = s.currentAsciiLayerBlocks.value;
  if (!data[sy]?.[sx]) {
    s.textEditing.value.startX = sx;
    s.textEditing.value.startY = sy;
    await a.clearToolCanvas();
    await a.drawTextIndicator();
    await a.drawIndicator();
    await a.delayRedrawCanvas();
    return;
  }

  if (char === 'Backspace') {
    if (data[sy]?.[sx - 1]) {
      const prevBlock = data[sy][sx - 1];
      const ob = { ...prevBlock };
      delete prevBlock['char'];
      a.recordDiff(sx, sy, ob, data[sy][sx - 1]);
      sx -= 1;
    }
    deleteAtPos(s, a, data, sx, sy);
  } else if (char === 'Delete') {
    deleteAtPos(s, a, data, sx, sy);
  } else if (CURSOR_MOVE[char]) {
    const pos = CURSOR_MOVE[char](data, sx, sy);
    sx = pos.sx;
    sy = pos.sy;
  } else if (char.length === 1) {
    const pos = typeChar(s, a, data, sx, sy, char);
    sx = pos.sx;
    sy = pos.sy;
  }

  s.textEditing.value.startX = sx;
  s.textEditing.value.startY = sy;

  await a.clearToolCanvas();
  await a.drawTextIndicator();
  await a.drawIndicator();
  await a.delayRedrawCanvas();
}

// ─── Composable ──────────────────────────────────────────────────

export function useTextEditing(deps: TextEditingDeps) {
  const s = deps.state;
  const a = deps.actions;

  return {
    canvasKeyDown: (char: string) => canvasKeyDown(s, a, char),
  };
}
