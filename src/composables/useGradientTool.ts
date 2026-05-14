// Gradient Tool composable — two-click flow for gradient fill.
//
// Manages the state for a two-click interaction:
//   Click 1: set start point + start color (current FG)
//   Click 2: set end point + end color (current BG) → apply gradient
//
// Follows the useColorReplace pattern with cleanup watchers
// for tool switching, tab switching, and Escape key.

import { ref, computed, watch, type Ref } from 'vue';
import { useToolbarStore } from '../store/toolbar';
import { useAsciiBirdStore } from '../store';
import { gradientFill } from '../utils/gradientFill';
import type { FillChange } from '../ascii';
import type { Block } from '../types';

export interface UseGradientToolOptions {
  /** Current layer blocks */
  currentAsciiLayerBlocks: Ref<Block[][]>;
  /** Current ASCII width */
  currentAsciiWidth: Ref<number>;
  /** Current ASCII height */
  currentAsciiHeight: Ref<number>;
  /** Record a diff for undo */
  recordDiff: (x: number, y: number, oldBlock: Block, newBlock: Block) => void;
}

export function useGradientTool(opts: UseGradientToolOptions) {
  const toolbarStore = useToolbarStore();
  const store = useAsciiBirdStore();

  // ─── State ──────────────────────────────────────────────────────
  const gradientStart = ref<{ x: number; y: number } | null>(null);
  const gradientStartColor = ref<number>(0);

  // ─── Computed ───────────────────────────────────────────────────
  const isGradientPicking = computed(
    () => gradientStart.value !== null,
  );

  // ─── Methods ────────────────────────────────────────────────────

  /**
   * Set the start point for the gradient.
   * Records the current FG color as the start color.
   */
  function setStartPoint(x: number, y: number): void {
    gradientStart.value = { x, y };
    gradientStartColor.value = toolbarStore.currentFg;
  }

  /**
   * Apply gradient from start point to end point.
   * Uses current BG as the end color.
   * Returns the FillChange array for any post-processing.
   */
  function applyGradient(
    endX: number,
    endY: number,
    blocks: Block[][],
  ): FillChange[] {
    if (!gradientStart.value) return [];

    const startX = gradientStart.value.x;
    const startY = gradientStart.value.y;
    const startColorIdx = gradientStartColor.value;
    const endColorIdx = toolbarStore.currentBg;

    const changes = gradientFill({
      blocks,
      startX,
      startY,
      endX,
      endY,
      startColorIdx,
      endColorIdx,
    });

    // Record diffs for undo
    for (const change of changes) {
      if (
        change.old.bg !== change.new.bg ||
        change.old.fg !== change.new.fg ||
        change.old.char !== change.new.char
      ) {
        opts.recordDiff(change.x, change.y, change.old, change.new);
      }
    }

    // Reset state
    cancelGradient();

    return changes;
  }

  /**
   * Cancel the gradient pick state.
   */
  function cancelGradient(): void {
    gradientStart.value = null;
    gradientStartColor.value = 0;
  }

  // ─── Cleanup watchers ───────────────────────────────────────────

  // Cancel gradient when switching tools
  watch(
    () => toolbarStore.currentTool,
    () => {
      if (gradientStart.value !== null) {
        cancelGradient();
      }
    },
  );

  // Cancel gradient when switching tabs
  watch(
    () => store.tab,
    () => {
      if (gradientStart.value !== null) {
        cancelGradient();
      }
    },
  );

  return {
    gradientStart: computed(() => gradientStart.value),
    gradientStartColor: computed(() => gradientStartColor.value),
    isGradientPicking,
    setStartPoint,
    applyGradient,
    cancelGradient,
  };
}
