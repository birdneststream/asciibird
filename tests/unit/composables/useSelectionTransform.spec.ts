// Tests for src/composables/useSelectionTransform.ts
// Selection transform — rotate, flip selected canvas areas

import { describe, it, expect, vi } from 'vitest';
import { ref, computed, reactive } from 'vue';
import {
  useSelectionTransform,
  selectionToGridRect,
  extractSelectionBlocks,
} from '@/composables/useSelectionTransform';
import type { SelectionRect, SelectionTransformDeps } from '@/composables/useSelectionTransform';
import type { Block, HistoryDiff } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────

const BW = 8;   // block width
const BH = 15;  // block height

function makeLayerBlocks(
  width: number,
  height: number,
  fill?: (x: number, y: number) => Block,
): Block[][] {
  const result: Block[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Block[] = [];
    for (let x = 0; x < width; x++) {
      row.push(fill ? fill(x, y) : {});
    }
    result.push(row);
  }
  return result;
}

function makeDeps(
  overrides: Partial<{
    selecting: SelectionRect;
    layerBlocks: Block[][];
    canvasWidth: number;
    canvasHeight: number;
  }> = {},
): SelectionTransformDeps {
  const bw = BW;
  const bh = BH;
  const selecting = ref<SelectionRect>(
    overrides.selecting ?? {
      startX: null, startY: null,
      endX: null, endY: null,
      canSelect: false,
    },
  );
  const layerBlocks = overrides.layerBlocks ?? makeLayerBlocks(10, 10);
  return {
    selecting,
    selectedBlocks: ref<Block[][]>([]),
    blockWidthComp: computed(() => bw),
    blockHeightComp: computed(() => bh),
    currentAsciiWidth: computed(() => overrides.canvasWidth ?? 10),
    currentAsciiHeight: computed(() => overrides.canvasHeight ?? 10),
    currentAsciiLayerBlocks: computed(() => layerBlocks),
    selectedLayerIndex: computed(() => 0),
    updateAsciiBlocks: vi.fn(),
    setSelectBlocks: vi.fn(),
    redrawCanvas: vi.fn().mockResolvedValue(undefined),
    clearToolCanvas: vi.fn().mockResolvedValue(undefined),
    redrawSelect: vi.fn().mockResolvedValue(undefined),
  };
}

// ─── selectionToGridRect ──────────────────────────────────────────

describe('selectionToGridRect', () => {
  it('converts pixel selection to grid rect', () => {
    const sel: SelectionRect = {
      startX: 1 * BW, startY: 2 * BH,
      endX: 4 * BW, endY: 5 * BH,
      canSelect: false,
    };
    const rect = selectionToGridRect(sel, BW, BH, 10, 10);
    expect(rect).toEqual({ x: 1, y: 2, width: 3, height: 3 });
  });

  it('normalizes reversed coordinates', () => {
    const sel: SelectionRect = {
      startX: 4 * BW, startY: 5 * BH,
      endX: 1 * BW, endY: 2 * BH,
      canSelect: false,
    };
    const rect = selectionToGridRect(sel, BW, BH, 10, 10);
    expect(rect).toEqual({ x: 1, y: 2, width: 3, height: 3 });
  });

  it('returns null for incomplete selection', () => {
    const sel: SelectionRect = {
      startX: null, startY: null,
      endX: null, endY: null,
      canSelect: false,
    };
    expect(selectionToGridRect(sel, BW, BH, 10, 10)).toBeNull();
  });

  it('clamps to canvas bounds', () => {
    const sel: SelectionRect = {
      startX: 8 * BW, startY: 8 * BH,
      endX: 15 * BW, endY: 15 * BH,
      canSelect: false,
    };
    const rect = selectionToGridRect(sel, BW, BH, 10, 10);
    expect(rect!.x).toBe(8);
    expect(rect!.y).toBe(8);
    expect(rect!.width).toBeLessThanOrEqual(2);
    expect(rect!.height).toBeLessThanOrEqual(2);
  });

  it('returns minimum 1×1 rect', () => {
    const sel: SelectionRect = {
      startX: 0, startY: 0,
      endX: BW - 1, endY: BH - 1,
      canSelect: false,
    };
    const rect = selectionToGridRect(sel, BW, BH, 10, 10);
    expect(rect!.width).toBeGreaterThanOrEqual(1);
    expect(rect!.height).toBeGreaterThanOrEqual(1);
  });
});

// ─── extractSelectionBlocks ───────────────────────────────────────

describe('extractSelectionBlocks', () => {
  it('extracts a 2×2 dense block array', () => {
    const layer = makeLayerBlocks(4, 4, (x, y) => ({
      fg: y * 4 + x, bg: 0, char: String.fromCharCode(65 + y * 4 + x),
    }));
    const rect = { x: 1, y: 1, width: 2, height: 2 };
    const blocks = extractSelectionBlocks(layer, rect);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toHaveLength(2);
    expect(blocks[0][0].char).toBe('F'); // (1,1) = index 5 = 'F'
    expect(blocks[0][1].char).toBe('G'); // (2,1) = index 6 = 'G'
    expect(blocks[1][0].char).toBe('J'); // (1,2) = index 9 = 'J'
  });

  it('handles sparse layer data (missing cells → empty blocks)', () => {
    const layer: Block[][] = [
      [{ fg: 1, bg: 0, char: 'A' }, {}],
    ];
    const rect = { x: 0, y: 0, width: 2, height: 1 };
    const blocks = extractSelectionBlocks(layer, rect);

    expect(blocks[0][0].char).toBe('A');
    expect(blocks[0][1]).toEqual({});
  });

  it('handles null properties (cleans them)', () => {
    const layer: Block[][] = [
      [{ fg: 1, bg: null, char: null }],
    ];
    const rect = { x: 0, y: 0, width: 1, height: 1 };
    const blocks = extractSelectionBlocks(layer, rect);

    expect(blocks[0][0].fg).toBe(1);
    expect(blocks[0][0].bg).toBeUndefined();
    expect(blocks[0][0].char).toBeUndefined();
  });

  it('returns empty for out-of-bounds rect', () => {
    const layer = makeLayerBlocks(2, 2);
    const rect = { x: 5, y: 5, width: 2, height: 2 };
    const blocks = extractSelectionBlocks(layer, rect);

    expect(blocks).toHaveLength(2);
    expect(blocks[0][0]).toEqual({});
  });
});

// ─── useSelectionTransform ────────────────────────────────────────

describe('useSelectionTransform', () => {
  describe('applyTransform', () => {
    it('flips a 2×2 selection horizontally', async () => {
      const layerBlocks = makeLayerBlocks(4, 4, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 1 * BW, startY: 1 * BH,
          endX: 3 * BW, endY: 3 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 4,
        canvasHeight: 4,
      });

      const { applyTransform } = useSelectionTransform(deps);
      const result = await applyTransform('flip-h');

      expect(result).toBe(true);
      // After horizontal flip at (1,1) with width 2:
      // (1,1) should have what was at (2,1)
      expect(layerBlocks[1][1].char).toBe('2,1');
      expect(layerBlocks[1][2].char).toBe('1,1');
      // Undo diff should have been recorded
      expect(deps.updateAsciiBlocks).toHaveBeenCalled();
    });

    it('flips a selection vertically', async () => {
      const layerBlocks = makeLayerBlocks(4, 4, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 0, startY: 0,
          endX: 2 * BW, endY: 2 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 4,
        canvasHeight: 4,
      });

      const { applyTransform } = useSelectionTransform(deps);
      await applyTransform('flip-v');

      // (0,0) should have what was at (0,1)
      expect(layerBlocks[0][0].char).toBe('0,1');
      expect(layerBlocks[1][0].char).toBe('0,0');
    });

    it('rotates a selection 90° CW (3×2 → 2×3)', async () => {
      // Set up a 2-row, 3-col selection at (1,1)
      const layerBlocks = makeLayerBlocks(5, 5, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 1 * BW, startY: 1 * BH,
          endX: 4 * BW, endY: 3 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 5,
        canvasHeight: 5,
      });

      const { applyTransform } = useSelectionTransform(deps);
      await applyTransform('rotate-cw');

      // Selection is 3 wide, 2 tall (grid coords (1,1)-(3,2))
      // CW of 3×2 gives 2×3:
      // New[0][0] = old[1][0] reversed → old col 2 at row 1 → (3,1)
      // New[0][1] = old[0][0] reversed → old col 2 at row 0 → (3,2)
      // CW: transpose then reverse each row
      // old[0] = [(1,1), (2,1), (3,1)]
      // old[1] = [(1,2), (2,2), (3,2)]
      // transpose: [[(1,1),(1,2)], [(2,1),(2,2)], [(3,1),(3,2)]]
      // reverse each row: [[(1,2),(1,1)], [(2,2),(2,1)], [(3,2),(3,1)]]
      // New 3×2 → write back as 2×3 at (1,1):
      // (1,1) = (1,2), (1,2) = (1,1)
      // (2,1) = (2,2), (2,2) = (2,1)
      // (3,1) = (3,2), (3,2) = (3,1)
      // But result is 3 rows × 2 cols, anchored at (1,1):
      // grid(1,1) = new[0][0] = (1,2) → char '1,2'
      expect(layerBlocks[1][1].char).toBe('1,2');
      expect(layerBlocks[1][2].char).toBe('1,1');
      expect(layerBlocks[2][1].char).toBe('2,2');
      expect(layerBlocks[2][2].char).toBe('2,1');
      expect(layerBlocks[3][1].char).toBe('3,2');
      expect(layerBlocks[3][2].char).toBe('3,1');
    });

    it('returns false for incomplete selection', async () => {
      const deps = makeDeps({
        selecting: {
          startX: null, startY: null,
          endX: null, endY: null,
          canSelect: false,
        },
      });
      const { applyTransform } = useSelectionTransform(deps);
      const result = await applyTransform('flip-h');
      expect(result).toBe(false);
    });

    it('records undo diff with old and new blocks', async () => {
      const layerBlocks = makeLayerBlocks(4, 4, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 0, startY: 0,
          endX: 2 * BW, endY: 2 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 4,
        canvasHeight: 4,
      });

      const { applyTransform } = useSelectionTransform(deps);
      await applyTransform('flip-h');

      const call = (deps.updateAsciiBlocks as any).mock.calls[0][0];
      const diff: HistoryDiff = call.diff;
      expect(diff.old.length).toBeGreaterThan(0);
      expect(diff.new.length).toBeGreaterThan(0);
      expect(diff.l).toBe(0);
    });

    it('updates selectBlocks for Ctrl+V paste', async () => {
      const layerBlocks = makeLayerBlocks(4, 4, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 0, startY: 0,
          endX: 2 * BW, endY: 2 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 4,
        canvasHeight: 4,
      });

      const { applyTransform } = useSelectionTransform(deps);
      await applyTransform('flip-h');

      expect(deps.setSelectBlocks).toHaveBeenCalled();
    });

    it('chains transforms correctly (rotate + flip)', async () => {
      const layerBlocks = makeLayerBlocks(4, 4, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 0, startY: 0,
          endX: 2 * BW, endY: 2 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 4,
        canvasHeight: 4,
      });

      const { applyTransform } = useSelectionTransform(deps);
      await applyTransform('rotate-cw');
      // deps.selecting should be updated for the new rect
      const firstResult = `${layerBlocks[0][0].char}`;

      // Apply second transform on the new selection
      await applyTransform('flip-h');
      // Should be different from first result
      expect(layerBlocks[0][0].char).not.toBe(firstResult);
    });

    it('clips rotated selection that extends beyond canvas', async () => {
      // 5×5 canvas, select a 3×3 area near the bottom-right
      const layerBlocks = makeLayerBlocks(5, 5, (x, y) => ({
        fg: 0, bg: 1, char: `${x},${y}`,
      }));
      const deps = makeDeps({
        selecting: {
          startX: 3 * BW, startY: 3 * BH,
          endX: 5 * BW, endY: 5 * BH,
          canSelect: false,
        },
        layerBlocks,
        canvasWidth: 5,
        canvasHeight: 5,
      });

      const { applyTransform } = useSelectionTransform(deps);
      // This should not throw — it should clip
      const result = await applyTransform('rotate-cw');
      expect(result).toBe(true);
    });
  });
});
