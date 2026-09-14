// Shape Tool composable — two-click flow for drawing shapes.
//
// Manages the state for a two-click interaction:
//   Click 1: set start point
//   Click 2: set end point → draw shape from start to end
//
// Reads shapeType from toolbarStore (persisted across tool switches).
// Follows the useGradientTool pattern with cleanup watchers.
//
// In half-block editing mode the start/end Y coordinates are tracked at
// half-block resolution (double-Y) and dispatched to drawShapeHalfBlock
// (complete-block colour model). Full-block mode keeps the original
// drawShape path. Shapes never apply mirroring in either mode.

import { ref, computed, watch, type Ref } from 'vue';
import { useToolbarStore } from '../store/toolbar';
import { useAsciiBirdStore } from '../store';
import { drawShape } from '../utils/shapes';
import { drawShapeHalfBlock } from '../utils/halfBlockShapes';
import type { FillChange } from '../ascii';
import type { Block } from '../types';

/** Shape start point — y at block resolution, halfY at half resolution */
export interface ShapeStart {
  x: number;
  y: number;
  /** Half-block Y (blockY * 2 + isTop ? 0 : 1). Defaults to y * 2. */
  halfY: number;
}

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
  const shapeStart = ref<ShapeStart | null>(null);

  // ─── Computed ───────────────────────────────────────────────────
  const isShapePicking = computed(() => shapeStart.value !== null);

  // ─── Methods ────────────────────────────────────────────────────

  /**
   * Set the start point for the shape.
   * `halfY` is the half-resolution Y (blockY * 2 + top/bottom); callers
   * in half-block mode pass it from the cursor position. Defaults to
   * the block position's top half.
   */
  function setShapeStart(x: number, y: number, halfY = y * 2): void {
    shapeStart.value = { x, y, halfY };
  }

  /**
   * Apply shape from start point to end point.
   * Reads shapeType from toolbarStore and dispatches to the half-block
   * or full-block drawing implementation.
   */
  function applyShape(
    endX: number,
    endY: number,
    blocks: Block[][],
    endHalfY = endY * 2,
  ): FillChange[] {
    if (!shapeStart.value) return [];

    const startX = shapeStart.value.x;
    const startY = shapeStart.value.y;
    const startHalfY = shapeStart.value.halfY;
    const shapeType = toolbarStore.toolbarState.shapeType;
    const fg = toolbarStore.currentFg;
    const bg = toolbarStore.currentBg;
    const char = toolbarStore.currentChar;

    const changes = toolbarStore.toolbarState.halfBlockEditing
      ? drawShapeHalfBlock(shapeType, {
        blocks,
        startX,
        startHalfY,
        endX,
        endHalfY,
        colour: fg,
        complement: bg,
      })
      : drawShape(shapeType, {
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

  // Cancel an in-progress shape pick when half-block mode toggles —
  // start/end coordinates live in different resolution spaces
  watch(
    () => toolbarStore.toolbarState.halfBlockEditing,
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
