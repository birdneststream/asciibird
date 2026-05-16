// Tests for usePasteMode composable
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, nextTick } from 'vue';
import type { Block } from '../../../src/types';
import type { SelectionRect } from '../../../src/composables/useSelectionTransform';

// Mock stores
const mockToolbarStore = {
  selectBlocks: [] as Block[][],
  setSelectBlocks: vi.fn((blocks: Block[][]) => {
    mockToolbarStore.selectBlocks = blocks;
  }),
  currentTool: 0,
  toolbarState: { shapeType: 'line' },
};

const mockAsciiStore = {
  tab: 0,
  asciibirdMeta: [],
};

vi.mock('../../../src/store/toolbar', () => ({
  useToolbarStore: () => mockToolbarStore,
}));

vi.mock('../../../src/store', () => ({
  useAsciiBirdStore: () => mockAsciiStore,
}));

// Mock ascii module for mircColours99 and hasBlockContent
vi.mock('../../../src/ascii', () => ({
  mircColours99: [
    'rgb(255,255,255)', 'rgb(0,0,0)', 'rgb(0,0,127)',
    'rgb(0,147,0)', 'rgb(255,0,0)',
  ],
  hasBlockContent: (block: Record<string, unknown> | undefined) =>
    !!block && Object.keys(block).length > 0,
}));

// Import after mocks
import { usePasteMode } from '../../../src/composables/usePasteMode';

function createMockDeps(overrides?: Partial<{
  selecting: SelectionRect;
  selectedBlocks: Block[][];
  blockWidth: number;
  blockHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  layerBlocks: Block[][];
  selectedLayerIndex: number;
}>) {
  const layerBlocks = overrides?.layerBlocks ?? createEmptyGrid(
    overrides?.canvasWidth ?? 10,
    overrides?.canvasHeight ?? 10,
  );

  const selecting = ref<SelectionRect>(
    overrides?.selecting ?? {
      startX: null, startY: null,
      endX: null, endY: null,
      canSelect: false,
    },
  );

  const deps = {
    selecting,
    selectedBlocks: ref<Block[][]>(overrides?.selectedBlocks ?? []),
    blockWidthComp: computed(() => overrides?.blockWidth ?? 8),
    blockHeightComp: computed(() => overrides?.blockHeight ?? 16),
    currentAsciiWidth: computed(() => overrides?.canvasWidth ?? 10),
    currentAsciiHeight: computed(() => overrides?.canvasHeight ?? 10),
    currentAsciiLayerBlocks: computed(() => layerBlocks),
    selectedLayerIndex: computed(() => overrides?.selectedLayerIndex ?? 0),
    updateAsciiBlocks: vi.fn(),
    redrawCanvas: vi.fn(() => Promise.resolve()),
    clearToolCanvas: vi.fn(() => Promise.resolve()),
  };

  return { deps, layerBlocks };
}

function createEmptyGrid(w: number, h: number): Block[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({} as Block)),
  );
}

function setBlock(
  grid: Block[][], x: number, y: number,
  fg?: number, bg?: number, char?: string,
): void {
  if (grid[y]?.[x]) {
    if (fg !== undefined) grid[y][x].fg = fg;
    if (bg !== undefined) grid[y][x].bg = bg;
    if (char !== undefined) grid[y][x].char = char;
  }
}

function makeSelection(
  startGX: number, startGY: number,
  endGX: number, endGY: number,
  bw = 8, bh = 16,
): SelectionRect {
  return {
    startX: startGX * bw,
    startY: startGY * bh,
    endX: endGX * bw,
    endY: endGY * bh,
    canSelect: false,
  };
}

describe('usePasteMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToolbarStore.selectBlocks = [];
    mockToolbarStore.currentTool = 0;
    mockAsciiStore.tab = 0;
  });

  describe('initial state', () => {
    it('starts with isPasteMode false', () => {
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.isPasteMode.value).toBe(false);
    });

    it('hasClipboard is false when selectBlocks is empty', () => {
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.hasClipboard.value).toBe(false);
    });

    it('hasClipboard is true when selectBlocks has blocks', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1, bg: 0, char: 'X' }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.hasClipboard.value).toBe(true);
    });
  });

  describe('startPasteMode', () => {
    it('enters paste mode when clipboard has blocks', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      pm.startPasteMode();
      expect(pm.isPasteMode.value).toBe(true);
    });

    it('does NOT enter paste mode when clipboard is empty', () => {
      mockToolbarStore.selectBlocks = [];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      pm.startPasteMode();
      expect(pm.isPasteMode.value).toBe(false);
    });
  });

  describe('cancelPasteMode', () => {
    it('exits paste mode', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      pm.startPasteMode();
      expect(pm.isPasteMode.value).toBe(true);
      pm.cancelPasteMode();
      expect(pm.isPasteMode.value).toBe(false);
    });
  });

  describe('confirmPaste', () => {
    it('stamps blocks at the given position', () => {
      mockToolbarStore.selectBlocks = [
        [{ fg: 1, bg: 0, char: 'A' }, { fg: 2, bg: 0, char: 'B' }],
      ];
      const { deps, layerBlocks } = createMockDeps();
      const pm = usePasteMode(deps);
      const result = pm.confirmPaste(2, 3);

      expect(result).toBe(true);
      expect(layerBlocks[3][2]).toEqual({ fg: 1, bg: 0, char: 'A' });
      expect(layerBlocks[3][3]).toEqual({ fg: 2, bg: 0, char: 'B' });
      expect(deps.updateAsciiBlocks).toHaveBeenCalledOnce();
    });

    it('exits paste mode after confirming', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      pm.startPasteMode();
      pm.confirmPaste(0, 0);
      expect(pm.isPasteMode.value).toBe(false);
    });

    it('returns false for empty clipboard', () => {
      mockToolbarStore.selectBlocks = [];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.confirmPaste(0, 0)).toBe(false);
    });

    it('clips blocks at canvas boundaries', () => {
      mockToolbarStore.selectBlocks = [
        [{ fg: 1 }, { fg: 2 }, { fg: 3 }],
        [{ fg: 4 }, { fg: 5 }, { fg: 6 }],
      ];
      const { deps, layerBlocks } = createMockDeps({
        canvasWidth: 5,
        canvasHeight: 5,
      });
      const pm = usePasteMode(deps);
      pm.confirmPaste(4, 4);

      expect(layerBlocks[4][4]).toEqual({ fg: 1 });
      expect(layerBlocks[5]).toBeUndefined();
      expect(layerBlocks[4][5]).toBeUndefined();
    });

    it('does not overwrite with empty source blocks', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }, {}]];
      const { deps, layerBlocks } = createMockDeps();
      layerBlocks[0][0] = { fg: 9 };
      layerBlocks[0][1] = { fg: 9 };

      const pm = usePasteMode(deps);
      pm.confirmPaste(0, 0);

      expect(layerBlocks[0][0]).toEqual({ fg: 1 });
      expect(layerBlocks[0][1]).toEqual({ fg: 9 });
    });

    it('pastes at position (0, 0)', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 5, bg: 2, char: 'X' }]];
      const { deps, layerBlocks } = createMockDeps();
      const pm = usePasteMode(deps);
      pm.confirmPaste(0, 0);
      expect(layerBlocks[0][0]).toEqual({ fg: 5, bg: 2, char: 'X' });
    });

    it('returns false for negative coordinates', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.confirmPaste(-1, -1)).toBe(false);
    });

    it('records undo diff with correct layer index', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps({ selectedLayerIndex: 3 });
      const pm = usePasteMode(deps);
      pm.confirmPaste(0, 0);

      const call = deps.updateAsciiBlocks.mock.calls[0];
      expect(call[0].diff.l).toBe(3);
    });
  });

  describe('cutSelection', () => {
    it('copies blocks and erases selection area', () => {
      const grid = createEmptyGrid(10, 10);
      setBlock(grid, 2, 2, 1, 0, 'A');
      setBlock(grid, 3, 2, 2, 0, 'B');
      setBlock(grid, 2, 3, 3, 0, 'C');

      const sel = makeSelection(2, 2, 4, 4);
      const { deps, layerBlocks } = createMockDeps({
        selecting: sel,
        layerBlocks: grid,
      });

      const pm = usePasteMode(deps);
      const result = pm.cutSelection();

      expect(result).toBe(true);
      expect(layerBlocks[2][2]).toEqual({});
      expect(layerBlocks[2][3]).toEqual({});
      expect(layerBlocks[3][2]).toEqual({});
      expect(mockToolbarStore.setSelectBlocks).toHaveBeenCalled();
      expect(deps.updateAsciiBlocks).toHaveBeenCalledOnce();
    });

    it('returns false when no selection exists', () => {
      const { deps } = createMockDeps({
        selecting: {
          startX: null, startY: null,
          endX: null, endY: null,
          canSelect: false,
        },
      });
      const pm = usePasteMode(deps);
      expect(pm.cutSelection()).toBe(false);
    });
  });

  describe('deleteSelection', () => {
    it('clears selection area without modifying clipboard', () => {
      const grid = createEmptyGrid(10, 10);
      setBlock(grid, 0, 0, 1, 0, 'X');
      setBlock(grid, 1, 0, 2, 0, 'Y');

      const sel = makeSelection(0, 0, 2, 1);
      const { deps, layerBlocks } = createMockDeps({
        selecting: sel,
        layerBlocks: grid,
      });

      const setSelectCalls = mockToolbarStore.setSelectBlocks.mock.calls.length;
      const pm = usePasteMode(deps);
      const result = pm.deleteSelection();

      expect(result).toBe(true);
      expect(layerBlocks[0][0]).toEqual({});
      expect(layerBlocks[0][1]).toEqual({});
      expect(mockToolbarStore.setSelectBlocks).toHaveBeenCalledTimes(
        setSelectCalls,
      );
    });

    it('returns false when no selection exists', () => {
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      expect(pm.deleteSelection()).toBe(false);
    });

    it('records undo diff for deleted blocks', () => {
      const grid = createEmptyGrid(10, 10);
      setBlock(grid, 0, 0, 1, 0, 'A');

      const sel = makeSelection(0, 0, 1, 1);
      const { deps } = createMockDeps({
        selecting: sel,
        layerBlocks: grid,
      });

      const pm = usePasteMode(deps);
      pm.deleteSelection();

      const call = deps.updateAsciiBlocks.mock.calls[0];
      const diff = call[0].diff;
      expect(diff.old.length).toBe(1);
      expect(diff.old[0].b).toEqual({ fg: 1, bg: 0, char: 'A' });
      expect(diff.new[0].b).toEqual({});
    });
  });

  describe('cut + paste round-trip', () => {
    it('preserves block data after cut and paste', () => {
      const grid = createEmptyGrid(10, 10);
      setBlock(grid, 0, 0, 1, 2, 'H');
      setBlock(grid, 1, 0, 3, 4, 'I');

      const sel = makeSelection(0, 0, 2, 1);
      const { deps, layerBlocks } = createMockDeps({
        selecting: sel,
        layerBlocks: grid,
      });

      const pm = usePasteMode(deps);

      pm.cutSelection();
      expect(layerBlocks[0][0]).toEqual({});
      expect(layerBlocks[0][1]).toEqual({});

      pm.confirmPaste(5, 5);
      expect(layerBlocks[5][5]).toEqual({ fg: 1, bg: 2, char: 'H' });
      expect(layerBlocks[5][6]).toEqual({ fg: 3, bg: 4, char: 'I' });
    });
  });

  describe('drawPastePreview', () => {
    function createMockCtx() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        beginPath: vi.fn(),
        globalAlpha: 1,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '' as CanvasTextAlign,
        textBaseline: '' as CanvasTextBaseline,
        setLineDash: vi.fn(),
      };
    }

    it('draws preview blocks at correct positions', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1, bg: 0 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      const ctx = createMockCtx() as unknown as CanvasRenderingContext2D;

      pm.drawPastePreview(ctx, 3, 4, 8, 16);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('does nothing for empty clipboard', () => {
      mockToolbarStore.selectBlocks = [];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      const ctx = createMockCtx() as unknown as CanvasRenderingContext2D;

      pm.drawPastePreview(ctx, 0, 0, 8, 16);

      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('draws dashed outline around paste area', () => {
      mockToolbarStore.selectBlocks = [[{ fg: 1 }]];
      const { deps } = createMockDeps();
      const pm = usePasteMode(deps);
      const ctx = createMockCtx() as unknown as CanvasRenderingContext2D;

      pm.drawPastePreview(ctx, 0, 0, 8, 16);

      expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
      expect(ctx.strokeRect).toHaveBeenCalled();
    });
  });

  // Note: Tool/tab switch cleanup watchers are tested via integration
  // because they depend on Pinia store reactivity which cannot be
  // easily simulated in isolated composable tests with mocked stores.
  // The watchers are trivial (watch value → cancelPasteMode) and
  // follow the exact same pattern as useGradientTool/useShapeTool.
});
