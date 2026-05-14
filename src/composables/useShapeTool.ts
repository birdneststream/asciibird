// Shape Tool composable — two-click flow for drawing shapes.
//
// Manages the state for a two-click interaction:
//   Click 1: set start point
//   Click 2: set end point → draw shape from start to end
//
// Reads shapeType from toolbarStore (persisted across tool switches).
// Follows the useGradientTool pattern with cleanup watchers.

import { ref, computed, watch, type Ref } from 'vue';
import { useToolbarStore } from '../store/toolbar';
import { useAsciiBirdStore } from '../store';
import { drawShape } from '../utils/shapes';
import type { FillChange } from '../ascii';
import type { Block } from '../types';

export interface UseShapeToolOptions {
  /** Current layer blocks */
  currentAsciiLayerBlocks: Ref<Block[][]>;
  /** Record a diff for undo */
  recordDiff: (x: number, y: number, oldBlock: Block, newBlock: Block) => void;
}

export function useShapeTool(opts: UseShapeToolOptions) {
  const toolbarStore = useToolbarStore();
  const store = useAsciiBirdStore();

  // ─── State ──────────────────────────────────────────────────────
  const shapeStart = ref<{ x: number; y: number } | null>(null);

  // ─── Computed ───────────────────────────────────────────────────
  const isShapePicking = computed(() => shapeStart.value !== null);

  // ─── Methods ────────────────────────────────────────────────────

  /**
   * Set the start point for the shape.
   */
  function setShapeStart(x: number, y: number): void {
    shapeStart.value = { x, y };
  }

  /**
   * Apply shape from start point to end point.
   * Reads shapeType from toolbarStore.
   * Returns the FillChange array for any post-processing.
   */
  function applyShape(
    endX: number,
    endY: number,
    blocks: Block[][],
  ): FillChange[] {
    if (!shapeStart.value) return [];

    const startX = shapeStart.value.x;
    const startY = shapeStart.value.y;
    const shapeType = toolbarStore.toolbarState.shapeType;
    const fg = toolbarStore.currentFg;
    const bg = toolbarStore.currentBg;
    const char = toolbarStore.currentChar;

    const changes = drawShape(shapeType, {
      blocks,
      startX,
      startY,
      endX,
      endY,
      fg,
      bg,
      char: char || undefined,
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
    cancelShape();

    return changes;
  }

  /**
   * Cancel the shape pick state.
   */
  function cancelShape(): void {
    shapeStart.value = null;
  }

  // ─── Cleanup watchers ───────────────────────────────────────────

  // Cancel shape when switching tools
  watch(
    () => toolbarStore.currentTool,
    () => {
      if (shapeStart.value !== null) {
        cancelShape();
      }
    },
  );

  // Cancel shape when switching tabs
  watch(
    () => store.tab,
    () => {
      if (shapeStart.value !== null) {
        cancelShape();
      }
    },
  );

  return {
    shapeStart: computed(() => shapeStart.value),
    isShapePicking,
    setShapeStart,
    applyShape,
    cancelShape,
  };
}
