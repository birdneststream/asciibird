// useShapeTool composable tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref, nextTick } from 'vue';
import { useShapeTool } from '../../../src/composables/useShapeTool';
import { useToolbarStore } from '../../../src/store/toolbar';
import type { Block } from '../../../src/types';
import { emptyBlock } from '../../../src/ascii';

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

function setup(blocks: Block[][]) {
  const recordDiff = vi.fn();
  const toolbarStore = useToolbarStore();
  const tool = useShapeTool({
    currentAsciiLayerBlocks: ref(blocks),
    recordDiff,
  });
  return { tool, recordDiff, toolbarStore, blocks };
}

describe('useShapeTool', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with no start point', () => {
    const { tool } = setup(makeGrid(4, 4));
    expect(tool.shapeStart.value).toBeNull();
    expect(tool.isShapePicking.value).toBe(false);
  });

  it('setShapeStart records position with halfY default', () => {
    const { tool } = setup(makeGrid(4, 4));
    tool.setShapeStart(2, 3);
    expect(tool.shapeStart.value).toEqual({ x: 2, y: 3, halfY: 6 });
    expect(tool.isShapePicking.value).toBe(true);
  });

  it('setShapeStart accepts explicit halfY', () => {
    const { tool } = setup(makeGrid(4, 4));
    tool.setShapeStart(1, 2, 5); // bottom half of row 2
    expect(tool.shapeStart.value).toEqual({ x: 1, y: 2, halfY: 5 });
  });

  it('applyShape dispatches to full-block drawShape in full-block mode', () => {
    const blocks = makeGrid(6, 4);
    const { tool, recordDiff, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeColourBg(1);

    tool.setShapeStart(0, 0);
    const changes = tool.applyShape(3, 2, blocks);

    // Full-block shape: fg/bg set on the drawn cells (char = currentChar)
    expect(changes.length).toBeGreaterThan(0);
    expect(blocks[0][0].fg).toBe(4);
    expect(blocks[0][0].bg).toBe(1);
    expect(recordDiff).toHaveBeenCalled();
    // Pick state reset
    expect(tool.isShapePicking.value).toBe(false);
  });

  it('applyShape dispatches to half-block drawing in half-block mode', () => {
    const blocks = makeGrid(6, 4);
    const { tool, recordDiff, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeColourBg(1);
    toolbarStore.toggleHalfBlockEditing(true);

    // Start on top half of (0,0) → halfY 0; end top half of (3,1) → halfY 2
    tool.setShapeStart(0, 0, 0);
    const changes = tool.applyShape(3, 1, blocks, 2);

    expect(changes.length).toBeGreaterThan(0);
    // Half-block shapes paint colours, not chars — complete blocks
    expect(blocks[0][0]).toEqual({ fg: 4, bg: 1, char: '▀' });
    expect(recordDiff).toHaveBeenCalled();
    expect(tool.isShapePicking.value).toBe(false);
  });

  it('applyShape uses the mode at apply time (toggle after pick)', () => {
    const blocks = makeGrid(6, 4);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);

    // Start pick in FULL-block mode
    tool.setShapeStart(0, 0);
    // Toggle to half-block BEFORE applying. The cancel watcher is
    // pre-flush (runs on the next microtask), so the pick is still
    // active and applyShape runs synchronously in half-block mode.
    toolbarStore.toggleHalfBlockEditing(true);
    const changes = tool.applyShape(2, 1, blocks, 2);

    // Half-block dispatch: complete ▀ blocks, not full-block chars
    expect(changes.length).toBeGreaterThan(0);
    expect(blocks[0][0]).toEqual({ fg: 4, bg: 1, char: '▀' });
  });

  it('toggling half-block mode cancels an in-progress pick', async () => {
    const blocks = makeGrid(6, 4);
    const { tool, toolbarStore } = setup(blocks);
    tool.setShapeStart(1, 1, 3);
    expect(tool.isShapePicking.value).toBe(true);

    toolbarStore.toggleHalfBlockEditing(true);
    await nextTick();

    expect(tool.shapeStart.value).toBeNull();
    expect(tool.isShapePicking.value).toBe(false);
  });

  it('toggling half-block mode does nothing when no pick is active', async () => {
    const blocks = makeGrid(6, 4);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.toggleHalfBlockEditing(true);
    await nextTick();
    expect(tool.shapeStart.value).toBeNull();
  });

  it('applyShape skips no-op diffs (same visual result)', () => {
    const blocks = makeGrid(6, 2);
    const { tool, recordDiff, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);

    tool.setShapeStart(0, 0, 0);
    tool.applyShape(1, 0, blocks, 0);
    expect(recordDiff).toHaveBeenCalled();

    // Repaint the same shape — visually identical blocks record no diffs
    recordDiff.mockClear();
    tool.setShapeStart(0, 0, 0);
    tool.applyShape(1, 0, blocks, 0);
    expect(recordDiff).not.toHaveBeenCalled();
  });

  it('applyShape with no start point returns empty', () => {
    const blocks = makeGrid(4, 2);
    const { tool } = setup(blocks);
    expect(tool.applyShape(1, 1, blocks)).toEqual([]);
  });

  it('cancelShape clears the pick', () => {
    const blocks = makeGrid(4, 2);
    const { tool } = setup(blocks);
    tool.setShapeStart(1, 1);
    tool.cancelShape();
    expect(tool.shapeStart.value).toBeNull();
  });
});
