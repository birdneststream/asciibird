// Color replace composable — encapsulates the two-click interaction
// for the replace-color tool (pick source → apply replacement).

import { ref, computed, watch } from 'vue';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { useToast } from './useToast';
import { toolbarIcons } from '../ascii';
import type { Block } from '../types';

export function useColorReplace() {
  const store = useAsciiBirdStore();
  const toolbarStore = useToolbarStore();
  const { show: toastShow } = useToast();

  /** Picked source colors from the first click */
  const replaceColorSource = ref<{
    fg: number | null;
    bg: number | null;
  } | null>(null);

  /** Whether we're in "source picked, awaiting apply" state */
  const isReplacePicking = computed(() => replaceColorSource.value !== null);

  /**
   * Pick source colors from a block on the canvas.
   * Called on the first click of the replace-color tool.
   */
  function pickSource(block: Block) {
    replaceColorSource.value = {
      fg: block.fg !== undefined && block.fg !== null ? block.fg : null,
      bg: block.bg !== undefined && block.bg !== null ? block.bg : null,
    };

    const fgStr = replaceColorSource.value.fg !== null
      ? `FG:${replaceColorSource.value.fg}`
      : 'FG:none';
    const bgStr = replaceColorSource.value.bg !== null
      ? `BG:${replaceColorSource.value.bg}`
      : 'BG:none';
    toastShow(`Source picked (${fgStr}, ${bgStr}). Click to replace.`);
  }

  /**
   * Apply the color replacement.
   * Called on the second click of the replace-color tool.
   * Uses the current FG/BG from the toolbar as target colors.
   * If a selection exists, scopes the replacement to selection bounds.
   *
   * @param selection - optional selection bounds {x, y, w, h}
   * @returns number of blocks changed
   */
  function applyReplace(
    selection?: { x: number; y: number; w: number; h: number },
  ): number {
    if (!replaceColorSource.value) return 0;

    const targetFg = toolbarStore.currentFg;
    const targetBg = toolbarStore.currentBg;

    const count = store.replaceColor({
      sourceFg: replaceColorSource.value.fg,
      sourceBg: replaceColorSource.value.bg,
      targetFg,
      targetBg,
      replaceFg: toolbarStore.isTargettingFg,
      replaceBg: toolbarStore.isTargettingBg,
      selection,
    });

    toastShow(`Replaced colors in ${count} block${count !== 1 ? 's' : ''}.`);
    resetReplace();
    return count;
  }

  /** Reset the pick state */
  function resetReplace() {
    replaceColorSource.value = null;
  }

  /**
   * Quick replace from context menu — uses the block under cursor
   * as source, current FG/BG as target, scoped to selection.
   */
  function contextMenuReplace(
    sourceBlock: Block,
    selection?: { x: number; y: number; w: number; h: number },
  ): number {
    pickSource(sourceBlock);
    return applyReplace(selection);
  }

  // Reset pick state when switching tools
  watch(
    () => toolbarStore.currentTool,
    () => {
      const toolName = toolbarIcons[toolbarStore.currentTool]?.name;
      if (toolName !== 'replace-color' && isReplacePicking.value) {
        resetReplace();
      }
    },
  );

  return {
    replaceColorSource,
    isReplacePicking,
    pickSource,
    applyReplace,
    resetReplace,
    contextMenuReplace,
  };
}
