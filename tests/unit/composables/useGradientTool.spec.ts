// useGradientTool composable tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGradientTool } from '../../../src/composables/useGradientTool';
import { useToolbarStore } from '../../../src/store/toolbar';
import type { Block } from '../../../src/types';
import { emptyBlock } from '../../../src/ascii';
import { ref } from 'vue';

function makeGrid(w: number, h: number): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = { ...emptyBlock };
    }
  }
  return grid;
}

describe('useGradientTool', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with no start point', () => {
    const blocks = ref(makeGrid(5, 5));
    const recordDiff = vi.fn();
    const { gradientStart, isGradientPicking } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(5),
      recordDiff,
    });

    expect(gradientStart.value).toBeNull();
    expect(isGradientPicking.value).toBe(false);
  });

  it('setStartPoint records position and color', () => {
    const blocks = ref(makeGrid(5, 5));
    const recordDiff = vi.fn();
    const toolbarStore = useToolbarStore();
    toolbarStore.changeColourFg(4); // red

    const { gradientStart, isGradientPicking, setStartPoint } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(5),
      recordDiff,
    });

    setStartPoint(2, 3);

    expect(gradientStart.value).toEqual({ x: 2, y: 3 });
    expect(isGradientPicking.value).toBe(true);
  });

  it('applyGradient fills and records diffs', () => {
    const blocks = ref(makeGrid(5, 1));
    const recordDiff = vi.fn();
    const toolbarStore = useToolbarStore();
    toolbarStore.changeColourFg(0); // white
    toolbarStore.changeColourBg(1); // black

    const { setStartPoint, applyGradient, isGradientPicking } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(1),
      recordDiff,
    });

    setStartPoint(0, 0);
    expect(isGradientPicking.value).toBe(true);

    const changes = applyGradient(4, 0, blocks.value);

    // Should have changes
    expect(changes.length).toBeGreaterThan(0);
    // Should have recorded diffs
    expect(recordDiff).toHaveBeenCalled();
    // Should reset picking state
    expect(isGradientPicking.value).toBe(false);
  });

  it('cancelGradient resets state', () => {
    const blocks = ref(makeGrid(5, 5));
    const recordDiff = vi.fn();

    const {
      gradientStart, isGradientPicking, setStartPoint, cancelGradient,
    } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(5),
      recordDiff,
    });

    setStartPoint(2, 3);
    expect(isGradientPicking.value).toBe(true);

    cancelGradient();
    expect(gradientStart.value).toBeNull();
    expect(isGradientPicking.value).toBe(false);
  });

  it('applyGradient with no start point returns empty', () => {
    const blocks = ref(makeGrid(5, 5));
    const recordDiff = vi.fn();

    const { applyGradient } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(5),
      recordDiff,
    });

    const changes = applyGradient(4, 4, blocks.value);
    expect(changes).toHaveLength(0);
  });

  it('cancelGradient is idempotent', () => {
    const blocks = ref(makeGrid(5, 5));
    const recordDiff = vi.fn();

    const { cancelGradient, gradientStart, isGradientPicking } = useGradientTool({
      currentAsciiLayerBlocks: blocks,
      currentAsciiWidth: ref(5),
      currentAsciiHeight: ref(5),
      recordDiff,
    });

    // Cancel when already null — should not throw
    cancelGradient();
    expect(gradientStart.value).toBeNull();
    expect(isGradientPicking.value).toBe(false);
  });
});
