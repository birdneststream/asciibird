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

// ─── Composable ──────────────────────────────────────────────────

export function useTextEditing(deps: TextEditingDeps) {
  const s = deps.state;
  const a = deps.actions;

  /**
   * Handle keyboard input in text editing mode.
   * Processes character typing, Backspace/Delete, Enter,
   * arrow keys, and applies mirror if enabled.
   */
  async function canvasKeyDown(char: string): Promise<void> {
    const rawX = s.textEditing.value.startX;
    const rawY = s.textEditing.value.startY;
    if (rawX === null || rawY === null) return;

    let sx = rawX;
    let sy = rawY;

    const data = s.currentAsciiLayerBlocks.value;
    if (data[sy] && data[sy][sx]) {
      let targetBlock = data[sy][sx];
      let oldBlock: Block = {};

      switch (char) {
        case 'Backspace':
          if (data[sy][sx - 1]) {
            targetBlock = data[sy][sx - 1];

            oldBlock = { ...targetBlock };

            delete data[sy][sx - 1]['char'];

            a.recordDiff(sx, sy, oldBlock, data[sy][sx - 1]);

            sx -= 1;
          }

        // eslint-disable-next-line no-fallthrough
        case 'Delete':
          if (data[sy][sx]) {
            targetBlock = data[sy][sx];

            oldBlock = { ...targetBlock };

            delete data[sy][sx]['char'];

            a.recordDiff(sx, sy, oldBlock, targetBlock);
          }

          applyMirrored(
            sx, sy,
            s.currentAsciiWidth.value, s.currentAsciiHeight.value,
            s.mirrorX.value, s.mirrorY.value,
            (mx, my) => {
              const block = data[my]?.[mx];
              if (!block) return;
              oldBlock = { ...block };
              delete block['char'];
              a.recordDiff(mx, my, oldBlock, block);
            },
          );

          break;

        case 'Enter':
          if (data[sy + 1]?.[0]) {
            sx = 0;
            sy += 1;
          }
          break;

        case 'ArrowUp':
          if (data[sy - 1]?.[sx]) {
            sy -= 1;
          }
          break;

        case 'ArrowDown':
          if (data[sy + 1]?.[sx]) {
            sy += 1;
          }
          break;

        case 'ArrowLeft':
          if (data[sy]?.[sx - 1]) {
            sx -= 1;
          }
          break;

        case 'ArrowRight':
          if (data[sy]?.[sx + 1]) {
            sx += 1;
          }
          break;

        default:
          if (char.length === 1) {
            oldBlock = { ...targetBlock };
            targetBlock.char = char;

            if (s.canFg.value) {
              targetBlock.fg = s.currentFg.value;
            }

            a.recordDiff(sx, sy, oldBlock, targetBlock);

            applyMirrored(
              sx, sy,
              s.currentAsciiWidth.value,
              s.currentAsciiHeight.value,
              s.mirrorX.value, s.mirrorY.value,
              (mx, my) => {
                const block = data[my]?.[mx];
                if (!block) return;
                oldBlock = { ...block };
                if (s.canFg.value) {
                  block.fg = s.currentFg.value;
                }
                block.char = char;
                a.recordDiff(mx, my, oldBlock, block);
              },
            );

            if (data[sy]?.[sx + 1]) {
              sx += 1;
            } else {
              sx = 0;

              if (sy < s.currentAsciiHeight.value) {
                sy += 1;
              }
            }
          }

          break;
      }
    }

    s.textEditing.value.startX = sx;
    s.textEditing.value.startY = sy;

    await a.clearToolCanvas();
    await a.drawTextIndicator();
    await a.drawIndicator();
    await a.delayRedrawCanvas();
  }

  return { canvasKeyDown };
}
