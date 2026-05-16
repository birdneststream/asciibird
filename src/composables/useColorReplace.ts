// Color replace composable — one-click recolor tool.
//
// Click a block → all blocks matching its checked properties (fg/bg/char)
// get replaced with the current toolbar brush values. Single undo step.

import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { useToast } from './useToast';
import type { Block } from '../types';

export function useColorReplace() {
  const store = useAsciiBirdStore();
  const toolbarStore = useToolbarStore();
  const { show: toastShow } = useToast();

  /**
   * One-click recolor: read source block properties, find all matching
   * blocks (AND-combined by enabled checkboxes), replace with toolbar
   * brush values. Optionally scope to a selection rectangle.
   *
   * @returns number of blocks changed
   */
  function applyReplaceFromBlock(
    sourceBlock: Block,
    selection?: { x: number; y: number; w: number; h: number },
  ): number {
    const sourceFg = sourceBlock.fg !== undefined && sourceBlock.fg !== null
      ? sourceBlock.fg : null;
    const sourceBg = sourceBlock.bg !== undefined && sourceBlock.bg !== null
      ? sourceBlock.bg : null;
    const sourceChar = sourceBlock.char ?? null;

    const replaceFg = toolbarStore.isTargettingFg;
    const replaceBg = toolbarStore.isTargettingBg;
    const replaceChar = toolbarStore.isTargettingChar;

    // Must have at least one replacement target
    if (!replaceFg && !replaceBg && !replaceChar) {
      toastShow('Enable at least one checkbox (FG, BG, or Text)', {
        type: 'error',
      });
      return 0;
    }

    const count = store.replaceColor({
      sourceFg,
      sourceBg,
      sourceChar,
      targetFg: toolbarStore.currentFg,
      targetBg: toolbarStore.currentBg,
      targetChar: toolbarStore.currentChar,
      replaceFg,
      replaceBg,
      replaceChar,
      selection,
    });

    if (count > 0) {
      toastShow(`Replaced ${count} block${count !== 1 ? 's' : ''}`);
    } else {
      toastShow('No matching blocks found');
    }

    return count;
  }

  return { applyReplaceFromBlock };
}
