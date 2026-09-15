// useShapeTool composable tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref, nextTick } from 'vue';
import { useShapeTool } from '../../../src/composables/useShapeTool';
import { useToolbarStore } from '../../../src/store/toolbar';
import { HalfBlockGrid, EMPTY_COLOUR } from '../../../src/utils/halfBlockGrid';
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

describe('useShapeTool modifier constraints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('applyShape with shift draws an equal width/height footprint', () => {
    const blocks = makeGrid(10, 10);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');

    tool.setShapeStart(0, 0);
    tool.applyShape(4, 2, blocks, 4, { shift: true, alt: false });

    // Constrained to (0,0)..(4,4) — 5×5 square
    expect(blocks[4][4].fg).toBe(4);
    expect(blocks[0][4].fg).toBe(4);
    expect(blocks[4][0].fg).toBe(4);
    expect(blocks[5][0].fg).toBeUndefined();
    expect(blocks[0][5].fg).toBeUndefined();
  });

  it('applyShape records undo diffs for constraint-expanded blocks', () => {
    const blocks = makeGrid(10, 10);
    const { tool, recordDiff, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');

    tool.setShapeStart(5, 5);
    // Alt box (2,2)..(8,8) — (8,8) lies outside the anchor→cursor drag
    tool.applyShape(8, 8, blocks, 16, { shift: false, alt: true });

    expect(recordDiff).toHaveBeenCalled();
    const painted = recordDiff.mock.calls.map(call => `${call[0]},${call[1]}`);
    expect(painted).toContain('8,8'); // expanded corner recorded for undo
    expect(painted).toContain('2,2');
  });

  it('applyShape with alt centers the shape on the first click', () => {
    const blocks = makeGrid(20, 20);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');

    tool.setShapeStart(10, 10);
    tool.applyShape(13, 12, blocks, 24, { shift: false, alt: true });

    // Box (7,8)..(13,12) centered on the anchor (10,10)
    expect(blocks[10][7].fg).toBe(4); // left edge
    expect(blocks[10][13].fg).toBe(4); // right edge
    expect(blocks[8][10].fg).toBe(4); // top edge
    expect(blocks[12][10].fg).toBe(4); // bottom edge
    expect(blocks[7][10].fg).toBeUndefined(); // above the box
    expect(blocks[13][10].fg).toBeUndefined(); // below the box
  });

  it('applyShape with alt clips safely at canvas edges', () => {
    const blocks = makeGrid(6, 6);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectOutline');

    tool.setShapeStart(1, 1);
    // Alt expands the box to (-1,-1)..(3,3) — negative corners clip
    const changes = tool.applyShape(3, 3, blocks, 6, { shift: false, alt: true });

    expect(changes.length).toBeGreaterThan(0);
    // Outline edges land on x=3 (y 0..3) and y=3 (x 0..3)
    expect(blocks[0][3].fg).toBe(4);
    expect(blocks[3][0].fg).toBe(4);
    expect(blocks[3][3].fg).toBe(4);
    expect(blocks[0][0].fg).toBeUndefined(); // outline interior
    expect(blocks[4][4].fg).toBeUndefined(); // outside the box
  });

  it('applyShape with shift+alt draws a centered square', () => {
    const blocks = makeGrid(20, 20);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');

    tool.setShapeStart(10, 10);
    tool.applyShape(14, 12, blocks, 24, { shift: true, alt: true });

    // Post-shift delta (4,4) → box (6,6)..(14,14) — 9×9 centered square
    expect(blocks[10][6].fg).toBe(4);
    expect(blocks[10][14].fg).toBe(4);
    expect(blocks[6][10].fg).toBe(4);
    expect(blocks[14][10].fg).toBe(4);
    expect(blocks[5][10].fg).toBeUndefined();
    expect(blocks[15][10].fg).toBeUndefined();
  });

  it('applyShape ignores modifiers for the line tool', () => {
    const blocks = makeGrid(10, 10);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('line');

    tool.setShapeStart(0, 0);
    tool.applyShape(6, 2, blocks, 4, { shift: true, alt: true });

    // Unconstrained bresenham line — endpoints painted, no square/centering
    expect(blocks[0][0].fg).toBe(4);
    expect(blocks[2][6].fg).toBe(4);
    expect(blocks[6][6].fg).toBeUndefined(); // would be painted by a 7×7 square
  });

  it('applyShape applies shift in half-block half-row space', () => {
    const blocks = makeGrid(8, 8);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');
    toolbarStore.toggleHalfBlockEditing(true);

    // Start halfY 1, end (6, halfY 2): dx=6, dy=1 → constrained dy=6
    tool.setShapeStart(0, 0, 1);
    tool.applyShape(6, 1, blocks, 2, { shift: true, alt: false });

    const grid = new HalfBlockGrid(blocks);
    // Fills halfY 1..7 (block rows 0..3) at column 6
    expect(grid.getColour(6, 7)).toBe(4);
    expect(grid.getColour(6, 8)).toBe(EMPTY_COLOUR); // row 4 untouched
  });

  it('applyShape applies alt in half-block half-row space', () => {
    const blocks = makeGrid(16, 16);
    const { tool, toolbarStore } = setup(blocks);
    toolbarStore.changeColourFg(4);
    toolbarStore.changeShapeType('rectFilled');
    toolbarStore.toggleHalfBlockEditing(true);

    // Anchor (4, halfY 5), end (7, halfY 6): dx=3, dy=1 → box (1,4)..(7,6)
    tool.setShapeStart(4, 2, 5);
    tool.applyShape(7, 3, blocks, 6, { shift: false, alt: true });

    const grid = new HalfBlockGrid(blocks);
    expect(grid.getColour(1, 4)).toBe(4); // left/top corner of box
    expect(grid.getColour(7, 6)).toBe(4); // right/bottom corner
    expect(grid.getColour(1, 3)).toBe(EMPTY_COLOUR); // above box
    // halfY 7 is the sibling half of painted halfY 6 — completed with the
    // complement, not empty. Row 4 (halfY 8+) is untouched.
    expect(grid.getColour(7, 7)).toBe(1);
    expect(grid.getColour(7, 8)).toBe(EMPTY_COLOUR);
  });
});
