// Tests for useSaveBrushLibrary — legacy Ctrl+B semantics
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import LZString from 'lz-string';
import { useSaveBrushLibrary } from '../../../src/composables/useSaveBrushLibrary';
import { useToolbarStore } from '../../../src/store/toolbar';
import type { Block } from '../../../src/types';

function libraryChar(store: ReturnType<typeof useToolbarStore>): string {
  const entry = store.brushLibrary[0];
  const blocks = JSON.parse(
    LZString.decompressFromUTF16(entry.blocks),
  ) as Block[][];
  return blocks[0][0].char;
}

function makeBlocks(char = '#'): Block[][] {
  return [[{ fg: 1, bg: 0, char }]];
}

describe('useSaveBrushLibrary', () => {
  let toolbarStore: ReturnType<typeof useToolbarStore>;
  let selectedBlocks: ReturnType<typeof ref<Block[][]>>;
  let selecting: ReturnType<typeof ref<{
    startX: number | null; startY: number | null;
    endX: number | null; endY: number | null;
  }>>;
  let resetSelect: ReturnType<typeof ref<boolean>>;
  const toastMock = vi.fn();
  let save: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    toolbarStore = useToolbarStore();
    selectedBlocks = ref<Block[][]>([]);
    selecting = ref({
      startX: null, startY: null, endX: null, endY: null,
    });
    resetSelect = ref(false);
    toastMock.mockClear();
    ({ saveBrushLibrary: save } = useSaveBrushLibrary({
      selectedBlocks,
      selecting,
      resetSelect,
      toastShow: toastMock as unknown as (
        message: string, opts?: { type: string },
      ) => void,
    }));
  });

  it('brush tool saves current brush blocks and toasts', () => {
    toolbarStore.changeTool(4); // brush
    toolbarStore.setBrushBlocks(makeBlocks('B'));

    save();

    expect(toolbarStore.brushLibrary).toHaveLength(1);
    expect(libraryChar(toolbarStore)).toBe('B');
    expect(toastMock).toHaveBeenCalledWith(
      'Saved brush to Library!', { type: 'success' },
    );
  });

  it('select tool with live selection saves, clears selection, and toasts', () => {
    toolbarStore.changeTool(1); // select
    selectedBlocks.value = makeBlocks('S');
    selecting.value = { startX: 0, startY: 0, endX: 1, endY: 0 };
    toolbarStore.setSelectBlocks(makeBlocks('S'));

    save();

    expect(toolbarStore.brushLibrary).toHaveLength(1);
    expect(libraryChar(toolbarStore)).toBe('S');
    // Selection cleared via all three channels
    expect(selectedBlocks.value).toHaveLength(0);
    expect(resetSelect.value).toBe(true); // toggled
    expect(toolbarStore.selectBlocks).toHaveLength(0);
    expect(toastMock).toHaveBeenCalledTimes(1);
  });

  it('select tool without selection is a silent no-op', () => {
    toolbarStore.changeTool(1); // select

    save();

    expect(toolbarStore.brushLibrary).toHaveLength(0);
    expect(toastMock).not.toHaveBeenCalled();
    expect(resetSelect.value).toBe(false);
  });

  it('select tool with blocks but incomplete rect is a silent no-op', () => {
    toolbarStore.changeTool(1);
    selectedBlocks.value = makeBlocks('X');
    // endX/endY still null — Editor hasn't finished the drag

    save();

    expect(toolbarStore.brushLibrary).toHaveLength(0);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('non-brush/non-select tool is a silent no-op', () => {
    toolbarStore.changeTool(0); // default

    save();

    expect(toolbarStore.brushLibrary).toHaveLength(0);
    expect(toastMock).not.toHaveBeenCalled();
  });
});
