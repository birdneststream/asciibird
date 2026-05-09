// Tests for src/utils/diffBlocks.ts
// storeDiffBlocks and dispatchBlocks — undo/redo diff tracking utilities

import { describe, it, expect, vi } from 'vitest';
import {
  storeDiffBlocks,
  dispatchBlocks,
} from '@/utils/diffBlocks';
import type { Block } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────

const makeBlock = (fg = 0, bg = 1, char = 'X'): Block => ({ fg, bg, char });

const makeDiff = (l = 0) => ({
  l,
  old: [] as any[],
  new: [] as any[],
});

// ─── storeDiffBlocks ─────────────────────────────────────────────

describe('storeDiffBlocks', () => {
  it('stores old and new blocks at the given position', () => {
    const diff = makeDiff();
    const oldBlock = makeBlock(1, 2, 'A');
    const newBlock = makeBlock(3, 4, 'B');

    storeDiffBlocks(diff, 2, 1, oldBlock, newBlock);

    expect(diff.old[1]).toBeDefined();
    expect(diff.old[1][2]).toEqual({ x: 2, y: 1, b: { fg: 1, bg: 2, char: 'A' } });
    expect(diff.new[1]).toBeDefined();
    expect(diff.new[1][2]).toEqual({ x: 2, y: 1, b: { fg: 3, bg: 4, char: 'B' } });
  });

  it('creates row arrays lazily as needed', () => {
    const diff = makeDiff();
    storeDiffBlocks(diff, 0, 5, makeBlock(), makeBlock());

    expect(diff.old[5]).toBeDefined();
    expect(diff.old[0]).toBeUndefined();
    expect(diff.old[4]).toBeUndefined();
  });

  it('does not overwrite existing entries (first-write-wins)', () => {
    const diff = makeDiff();
    const original = makeBlock(1, 1, 'O');
    const intermediate = makeBlock(2, 2, 'I');

    storeDiffBlocks(diff, 3, 2, original, makeBlock(9, 9, 'N'));
    storeDiffBlocks(diff, 3, 2, intermediate, makeBlock(8, 8, 'M'));

    // First old block is preserved
    expect(diff.old[2][3].b).toEqual({ fg: 1, bg: 1, char: 'O' });
    // First new block is also preserved
    expect(diff.new[2][3].b).toEqual({ fg: 9, bg: 9, char: 'N' });
  });

  it('stores a spread copy of blocks (not a reference)', () => {
    const diff = makeDiff();
    const oldBlock = makeBlock(5, 6, 'C');
    const newBlock = makeBlock(7, 8, 'D');

    storeDiffBlocks(diff, 0, 0, oldBlock, newBlock);

    // Mutating original should not affect stored copy
    oldBlock.fg = 99;
    newBlock.char = 'Z';

    expect(diff.old[0][0].b.fg).toBe(5);
    expect(diff.new[0][0].b.char).toBe('D');
  });

  it('stores multiple positions in different rows', () => {
    const diff = makeDiff();
    storeDiffBlocks(diff, 0, 0, makeBlock(1, 1, 'A'), makeBlock(2, 2, 'B'));
    storeDiffBlocks(diff, 1, 0, makeBlock(3, 3, 'C'), makeBlock(4, 4, 'D'));
    storeDiffBlocks(diff, 0, 1, makeBlock(5, 5, 'E'), makeBlock(6, 6, 'F'));

    expect(diff.old[0][0].b.char).toBe('A');
    expect(diff.old[0][1].b.char).toBe('C');
    expect(diff.old[1][0].b.char).toBe('E');
  });

  it('handles storing at position (0, 0)', () => {
    const diff = makeDiff();
    storeDiffBlocks(diff, 0, 0, makeBlock(), makeBlock());

    expect(diff.old[0]).toBeDefined();
    expect(diff.old[0][0]).toBeDefined();
    expect(diff.new[0][0]).toBeDefined();
  });

  it('handles large coordinates', () => {
    const diff = makeDiff();
    storeDiffBlocks(diff, 500, 300, makeBlock(), makeBlock());

    expect(diff.old[300][500]).toBeDefined();
    expect(diff.new[300][500]).toBeDefined();
  });

  it('stores blocks with undefined properties', () => {
    const diff = makeDiff();
    const emptyBlock: Block = {};
    const partialBlock: Block = { fg: 1 };

    storeDiffBlocks(diff, 0, 0, emptyBlock, partialBlock);

    expect(diff.old[0][0].b).toEqual({});
    expect(diff.new[0][0].b).toEqual({ fg: 1 });
  });
});

// ─── dispatchBlocks ──────────────────────────────────────────────

describe('dispatchBlocks', () => {
  it('calls store.commit with updateAsciiBlocks when useAsync is false', () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const store = { commit, dispatch };
    const diff = makeDiff();
    const blocks: Block[][] = [[makeBlock()]];

    storeDiffBlocks(diff, 0, 0, makeBlock(1, 1, 'A'), makeBlock(2, 2, 'B'));
    dispatchBlocks(store, diff, blocks, 0, false, false);

    expect(commit).toHaveBeenCalledWith('updateAsciiBlocks', expect.objectContaining({
      blocks,
      diff: expect.objectContaining({ l: 0 }),
    }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('calls store.dispatch with updateAsciiBlocksAsync when useAsync is true', () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const store = { commit, dispatch };
    const diff = makeDiff();
    const blocks: Block[][] = [[makeBlock()]];

    storeDiffBlocks(diff, 0, 0, makeBlock(), makeBlock());
    dispatchBlocks(store, diff, blocks, 0, false, true);

    expect(dispatch).toHaveBeenCalledWith('updateAsciiBlocksAsync', expect.objectContaining({
      blocks,
    }));
    expect(commit).not.toHaveBeenCalled();
  });

  it('flattens old and new arrays before dispatching', () => {
    const commit = vi.fn();
    const store = { commit, dispatch: vi.fn() };
    const diff = makeDiff();

    storeDiffBlocks(diff, 0, 0, makeBlock(), makeBlock());
    storeDiffBlocks(diff, 1, 0, makeBlock(), makeBlock());

    // Before dispatch: 2D sparse arrays
    expect(Array.isArray(diff.old[0])).toBe(true);

    dispatchBlocks(store, diff, [[]], 0, false, false);

    // After dispatch: flattened
    const callData = commit.mock.calls[0][1];
    expect(Array.isArray(callData.diff.old)).toBe(true);
    expect(callData.diff.old.length).toBeGreaterThan(0);
    // Should not contain nested arrays
    expect(callData.diff.old.every((item: any) => !Array.isArray(item))).toBe(true);
  });

  it('clears diff when clearDiff is true', () => {
    const store = { commit: vi.fn(), dispatch: vi.fn() };
    const diff = makeDiff(5);

    storeDiffBlocks(diff, 2, 3, makeBlock(), makeBlock());
    dispatchBlocks(store, diff, [[]], 7, true, false);

    expect(diff.l).toBe(7);
    expect(diff.old).toEqual([]);
    expect(diff.new).toEqual([]);
  });

  it('does not clear diff when clearDiff is false', () => {
    const store = { commit: vi.fn(), dispatch: vi.fn() };
    const diff = makeDiff(5);

    storeDiffBlocks(diff, 2, 3, makeBlock(), makeBlock());
    dispatchBlocks(store, diff, [[]], 7, false, false);

    expect(diff.l).toBe(5); // unchanged
    // old/new have been flattened but not cleared
    expect(diff.old.length).toBeGreaterThan(0);
  });

  it('passes the layer index in the diff data', () => {
    const store = { commit: vi.fn(), dispatch: vi.fn() };
    const diff = makeDiff(3);

    dispatchBlocks(store, diff, [[]], 0, false, false);

    const callData = store.commit.mock.calls[0][1];
    expect(callData.diff.l).toBe(3);
  });

  it('handles empty diff (no blocks stored)', () => {
    const store = { commit: vi.fn(), dispatch: vi.fn() };
    const diff = makeDiff();

    dispatchBlocks(store, diff, [[]], 0, false, false);

    expect(store.commit).toHaveBeenCalledWith('updateAsciiBlocks', expect.objectContaining({
      diff: expect.objectContaining({
        old: [],
        new: [],
      }),
    }));
  });

  it('handles multiple stored blocks across rows', () => {
    const store = { commit: vi.fn(), dispatch: vi.fn() };
    const diff = makeDiff();

    storeDiffBlocks(diff, 0, 0, makeBlock(1, 1, 'A'), makeBlock(2, 2, 'B'));
    storeDiffBlocks(diff, 1, 1, makeBlock(3, 3, 'C'), makeBlock(4, 4, 'D'));

    dispatchBlocks(store, diff, [[], []], 0, true, false);

    const callData = store.commit.mock.calls[0][1];
    // Should have 2 entries after flattening
    const oldFlat = callData.diff.old;
    const newFlat = callData.diff.new;
    expect(oldFlat.filter((x: any) => x).length).toBe(2);
    expect(newFlat.filter((x: any) => x).length).toBe(2);
  });
});
