// @vitest-environment jsdom

// Not tested (network dependent): checkForGetRequest

import { describe, it, expect, vi, beforeEach } from 'vitest';
import LZString from 'lz-string';
import {
  mircColours99,
  charCodes,
  toolbarIcons,
  emptyBlock,
  create2DArray,
  blockWidth,
  blockHeight,
  maxBrushSize,
  maxBrushHistory,
  maxUndoHistory,
  tabLimit,
  cyrb53,
   getBlocksWidth,
   filterNullBlocks,
   checkVisible,
   fillNullBlocks,
   iterativeFill,
   setStore,
   setModalStore,
   createNewAscii,
  exportMirc,
  parseMircAscii,
  mergeLayers,
  splashAscii,
  downloadFile,
  canvasToPng,
} from '@/ascii';
import type { Block, Layer } from '@/types';

// ─── Helper: extract action call payload from mock store ──────────

function getActionPayload(
  mock: Record<string, any>,
  action: string,
): any {
  const fn = mock[action];
  if (typeof fn !== 'function') return undefined;
  // If it's a vi.fn(), we can check mock.calls
  if (fn.mock && fn.mock.calls) {
    const call = fn.mock.calls.find(() => true);
    return call?.[0];
  }
  return undefined;
}

// ─── Helper: get last newAsciibirdMeta call payload ───────────────

function getLastNewAsciiMetaPayload(mock: ReturnType<typeof createMockStore>): any {
  // newAsciibirdMeta is a vi.fn() — get the last call's first argument
  const calls = (mock.newAsciibirdMeta as any).mock?.calls;
  if (!calls || calls.length === 0) return undefined;
  return calls[calls.length - 1][0];
}

// ─── Helper: decompress layers from an AsciibirdMeta payload ─────────

function decompressLayers(compressed: string): Layer[] {
  return JSON.parse(LZString.decompressFromUTF16(compressed));
}

// ─── Helper: create a mock store for store-dependent tests ──────────

interface MockStoreConfig {
  layers?: Layer[];
  tab?: number;
  title?: string;
}

function createMockStore(config: MockStoreConfig = {}) {
  const layers = config.layers || [{
    label: 'Test Layer',
    visible: true,
    width: 5,
    height: 5,
    data: create2DArray(5).map(row => {
      for (let x = 0; x < 5; x++) row.push({ ...emptyBlock });
      return row;
    }),
  }];

  const title = config.title || 'Test ASCII';

  const state = {
    ver: 1,
    tab: config.tab ?? 0,
    asciibirdMeta: [{
      title,
      layers: LZString.compressToUTF16(JSON.stringify(layers)),
      selectedLayer: 0,
      imageOverlay: {
        url: null, opacity: 95, asciiOpacity: 100,
        left: 0, top: 0, position: 'centered',
        size: 100, repeatx: true, repeaty: true,
        visible: false, stretched: false,
      },
      history: [] as any[],
      historyIndex: 0,
      x: 247,
      y: 24,
    }],
    toolbarState: {
      currentColourFg: 0, currentColourBg: 1,
      isChoosingFg: false, isChoosingBg: false,
      isChoosingChar: false, persistCharPanel: false,
      brushSizeWidth: 1, brushSizeHeight: 1,
      brushSizeType: 'square' as const,
      selectedFg: 0, selectedBg: 1, selectedChar: ' ',
      isUpdating: false, currentTool: 0,
      targetingFg: true, targetingBg: true, targetingChar: true,
      mirrorX: false, mirrorY: false,
      x: 16, y: 30, h: 285, w: 200,
      draggable: true, updateBrush: true,
      gridView: false, visible: true, halfBlockEditing: false,
    },
    options: {
      defaultBg: 1, defaultFg: 0, renderOffScreen: false,
      undoLimit: 50, brushLimit: 50, tabLimit: 12, fps: 50,
    },
    modalState: {
      newAscii: false, editAscii: false, pasteAscii: false,
      options: false, overlay: false, about: false, help: false,
    },
  };

  // Track action calls
  const newAsciibirdMetaCalls: any[] = [];
  const closeModalCalls: any[] = [];

  const store: Record<string, any> = {
    // State
    get tab() { return state.tab },
    set tab(v) { state.tab = v },
    get asciibirdMeta() { return state.asciibirdMeta },

    // Getters
    get currentAscii() {
      return state.asciibirdMeta[state.tab]
    },
    get currentAsciiLayers() {
      return layers
    },
    get currentAsciiLayersWidthHeight() {
      return { width: layers[0].width, height: layers[0].height }
    },

    // Actions
    newAsciibirdMeta: vi.fn((payload: any) => {
      newAsciibirdMetaCalls.push(payload)
      state.asciibirdMeta.push(payload)
      state.tab = state.asciibirdMeta.length - 1
    }),
    closeModal: vi.fn((name: string) => {
      closeModalCalls.push(name)
    }),

    // Helpers for tests to inspect calls
    _newAsciibirdMetaCalls: newAsciibirdMetaCalls,
    _closeModalCalls: closeModalCalls,

    // Vuex compat (for tests that still use commit)
    commit: vi.fn((mutation: string, payload?: any) => {
      if (mutation === 'newAsciibirdMeta') {
        newAsciibirdMetaCalls.push(payload)
        state.asciibirdMeta.push(payload)
        state.tab = state.asciibirdMeta.length - 1
      }
    }),
    dispatch: vi.fn(),
  }

  return store
}

// ─── Constants ──────────────────────────────────────────────────────────

describe('ascii.ts constants', () => {
  it('mircColours99 has 99 entries', () => {
    expect(mircColours99).toHaveLength(99);
  });

  it('mircColours99 first entry is white', () => {
    expect(mircColours99[0]).toBe('rgb(255,255,255)');
  });

  it('mircColours99 second entry is black', () => {
    expect(mircColours99[1]).toBe('rgb(0,0,0)');
  });

  it('mircColours99 last entry is white', () => {
    expect(mircColours99[98]).toBe('#ffffff');
  });

  it('mircColours99 entries are valid CSS color strings', () => {
    for (const color of mircColours99) {
      expect(color).toMatch(/^(rgb\(|#)[\da-fA-F,()]+/);
    }
  });

  it('charCodes has correct length (>100)', () => {
    expect(charCodes.length).toBeGreaterThan(100);
  });

  it('charCodes starts with space and bang', () => {
    expect(charCodes[0]).toBe(' ');
    expect(charCodes[1]).toBe('!');
  });

  it('toolbarIcons has 8 tool entries', () => {
    expect(toolbarIcons).toHaveLength(8);
  });

  it('toolbarIcons each have name and icon', () => {
    for (const icon of toolbarIcons) {
      expect(icon).toHaveProperty('name');
      expect(icon).toHaveProperty('icon');
      expect(typeof icon.name).toBe('string');
      expect(typeof icon.icon).toBe('string');
    }
  });

  it('toolbarIcons contains expected tool names', () => {
    const names = toolbarIcons.map(t => t.name);
    expect(names).toContain('default');
    expect(names).toContain('brush');
    expect(names).toContain('fill');
    expect(names).toContain('eraser');
    expect(names).toContain('dropper');
    expect(names).toContain('select');
    expect(names).toContain('text');
    expect(names).toContain('fill-eraser');
  });

  it('blockWidth is 8', () => {
    expect(blockWidth).toBe(8);
  });

  it('blockHeight is 15', () => {
    expect(blockHeight).toBe(15);
  });

  it('maxBrushSize is 50', () => {
    expect(maxBrushSize).toBe(50);
  });

  it('maxBrushHistory is 200', () => {
    expect(maxBrushHistory).toBe(200);
  });

  it('maxUndoHistory is 500', () => {
    expect(maxUndoHistory).toBe(500);
  });

  it('tabLimit is 20', () => {
    expect(tabLimit).toBe(20);
  });

  it('emptyBlock is an empty object', () => {
    expect(emptyBlock).toEqual({});
    expect(Object.keys(emptyBlock)).toHaveLength(0);
  });
});

// ─── create2DArray ──────────────────────────────────────────────────────

describe('create2DArray', () => {
  it('creates array with correct number of rows', () => {
    const arr = create2DArray(5);
    expect(arr).toHaveLength(5);
  });

  it('each row is an empty array', () => {
    const arr = create2DArray(3);
    for (const row of arr) {
      expect(Array.isArray(row)).toBe(true);
      expect(row).toHaveLength(0);
    }
  });

  it('handles 0 rows', () => {
    const arr = create2DArray(0);
    expect(arr).toHaveLength(0);
    expect(arr).toEqual([]);
  });

  it('handles 1 row', () => {
    const arr = create2DArray(1);
    expect(arr).toHaveLength(1);
    expect(arr[0]).toEqual([]);
  });

  it('handles large row count', () => {
    const arr = create2DArray(100);
    expect(arr).toHaveLength(100);
  });
});

// ─── cyrb53 ─────────────────────────────────────────────────────────────

describe('cyrb53', () => {
  it('returns a number', () => {
    expect(typeof cyrb53('test')).toBe('number');
  });

  it('is deterministic (same input = same output)', () => {
    const hash1 = cyrb53('hello world');
    const hash2 = cyrb53('hello world');
    expect(hash1).toBe(hash2);
  });

  it('different inputs produce different hashes', () => {
    const hash1 = cyrb53('hello');
    const hash2 = cyrb53('world');
    expect(hash1).not.toBe(hash2);
  });

  it('respects seed parameter', () => {
    const hash1 = cyrb53('test', 1337);
    const hash2 = cyrb53('test', 9999);
    expect(hash1).not.toBe(hash2);
  });

  it('default seed is 1337', () => {
    const hash1 = cyrb53('test');
    const hash2 = cyrb53('test', 1337);
    expect(hash1).toBe(hash2);
  });

  it('handles empty string', () => {
    const hash = cyrb53('');
    expect(typeof hash).toBe('number');
  });

  it('handles unicode strings', () => {
    const hash = cyrb53('\u2588\u2584\u2580');
    expect(typeof hash).toBe('number');
  });

  it('produces non-negative numbers', () => {
    const hash = cyrb53('any string');
    expect(hash).toBeGreaterThanOrEqual(0);
  });

  it('handles long strings', () => {
    const longStr = 'x'.repeat(10000);
    const hash = cyrb53(longStr);
    expect(typeof hash).toBe('number');
    // Different length should produce different hash
    expect(hash).not.toBe(cyrb53('x'.repeat(9999)));
  });

  it('handles seed=0', () => {
    const hash = cyrb53('test', 0);
    expect(typeof hash).toBe('number');
    expect(hash).not.toBe(cyrb53('test', 1337));
  });
});

// ─── getBlocksWidth ─────────────────────────────────────────────────────

describe('getBlocksWidth', () => {
  it('returns 0 for empty array', () => {
    expect(getBlocksWidth([])).toBe(0);
  });

  it('returns width of a single row', () => {
    const blocks: Block[][] = [[{ fg: 0, bg: 1, char: 'A' }]];
    expect(getBlocksWidth(blocks)).toBe(1);
  });

  it('returns max width across rows', () => {
    const blocks: Block[][] = [
      [{ fg: 0, bg: 1, char: 'A' }, { fg: 0, bg: 1, char: 'B' }],
      [{ fg: 0, bg: 1, char: 'C' }],
    ];
    expect(getBlocksWidth(blocks)).toBe(2);
  });

  it('skips null rows', () => {
    const blocks: (Block[] | null)[] = [
      null,
      [{ fg: 0, bg: 1, char: 'A' }, { fg: 0, bg: 1, char: 'B' }, { fg: 0, bg: 1, char: 'C' }],
      null,
      [{ fg: 0, bg: 1, char: 'D' }],
    ];
    expect(getBlocksWidth(blocks)).toBe(3);
  });

  it('returns 0 when all rows are null', () => {
    const blocks: (Block[] | null)[] = [null, null, null];
    expect(getBlocksWidth(blocks)).toBe(0);
  });
});

// ─── filterNullBlocks ───────────────────────────────────────────────────

describe('filterNullBlocks', () => {
  it('returns empty array for empty input', () => {
    expect(filterNullBlocks([])).toEqual([]);
  });

  it('removes null rows', () => {
    const blocks: (Block[] | null)[] = [
      null,
      [{ fg: 0, bg: 1, char: 'A' }],
      null,
    ];
    const result = filterNullBlocks(blocks);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([{ fg: 0, bg: 1, char: 'A' }]);
  });

  it('removes null cells within rows', () => {
    const blocks: (Block[] | null)[] = [
      [{ fg: 0, bg: 1, char: 'A' }, null, { fg: 2, bg: 3, char: 'B' }],
    ];
    const result = filterNullBlocks(blocks);
    expect(result[0]).toEqual([
      { fg: 0, bg: 1, char: 'A' },
      { fg: 2, bg: 3, char: 'B' },
    ]);
  });

  it('preserves non-null rows and cells', () => {
    const blocks: (Block[] | null)[] = [
      [{ fg: 0, bg: 1, char: 'X' }],
    ];
    const result = filterNullBlocks(blocks);
    expect(result).toEqual([[{ fg: 0, bg: 1, char: 'X' }]]);
  });
});

// ─── checkVisible ───────────────────────────────────────────────────────

describe('checkVisible', () => {
  it('returns true when element is within viewport', () => {
    // jsdom default viewport height ~768
    const result = checkVisible(100, 0);
    expect(result).toBe(true);
  });

  it('returns false when element is above viewport (bottom < 0)', () => {
    const result = checkVisible(-50, -100);
    expect(result).toBe(false);
  });

  it('returns true for element at top of viewport', () => {
    const result = checkVisible(10, 0);
    expect(result).toBe(true);
  });

  it('returns false when element is below viewport', () => {
    // top - viewHeight >= 0 means fully below viewport
    // jsdom viewport ~768, so top=800 should be below
    const result = checkVisible(900, 800);
    expect(result).toBe(false);
  });
});

// ─── fillNullBlocks ─────────────────────────────────────────────────────

describe('fillNullBlocks', () => {
  it('fills null cells in existing rows', () => {
    const layers: Layer[] = [{
      label: 'Test',
      visible: true,
      width: 3,
      height: 2,
      data: [
        [{ fg: 0, bg: 1, char: 'A' }, null as any, null as any],
        [null as any, null as any, null as any],
      ],
    }];

    const result = fillNullBlocks(2, 3, layers);
    expect(result[0].data[0]).toHaveLength(3);
    expect(result[0].data[0][0]).toEqual({ fg: 0, bg: 1, char: 'A' });
    expect(result[0].data[0][1]).toEqual({});
    expect(result[0].data[0][2]).toEqual({});
    expect(result[0].data[1][0]).toEqual({});
  });

  it('creates new rows when missing', () => {
    const layers: Layer[] = [{
      label: 'Test',
      visible: true,
      width: 2,
      height: 3,
      data: [
        [{ fg: 0, bg: 1, char: 'A' }, { fg: 0, bg: 1, char: 'B' }],
      ] as Block[][],
    }];

    const result = fillNullBlocks(3, 2, layers);
    expect(result[0].data).toHaveLength(3);
    expect(result[0].data[1]).toEqual([{}, {}]);
    expect(result[0].data[2]).toEqual([{}, {}]);
  });

  it('updates layer width and height', () => {
    const layers: Layer[] = [{
      label: 'Test',
      visible: true,
      width: 0,
      height: 0,
      data: [] as Block[][],
    }];

    const result = fillNullBlocks(4, 6, layers);
    expect(result[0].width).toBe(6);
    expect(result[0].height).toBe(4);
    expect(result[0].data).toHaveLength(4);
    expect(result[0].data[0]).toHaveLength(6);
  });

  it('handles multiple layers', () => {
    const layers: Layer[] = [
      { label: 'L1', visible: true, width: 0, height: 0, data: [] as Block[][] },
      { label: 'L2', visible: true, width: 0, height: 0, data: [] as Block[][] },
    ];

    const result = fillNullBlocks(2, 2, layers);
    expect(result).toHaveLength(2);
    expect(result[0].data).toHaveLength(2);
    expect(result[1].data).toHaveLength(2);
  });

  it('does not modify filled cells', () => {
    const layers: Layer[] = [{
      label: 'Test',
      visible: true,
      width: 1,
      height: 1,
      data: [[{ fg: 5, bg: 10, char: 'Z' }]],
    }];

    const result = fillNullBlocks(1, 1, layers);
    expect(result[0].data[0][0]).toEqual({ fg: 5, bg: 10, char: 'Z' });
  });

  it('uses store getter when layerData is null', () => {
    const mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);

    const result = fillNullBlocks(5, 5, null);
    // Should use store's currentAsciiLayers (5x5 from mock)
    expect(result).toHaveLength(1);
    expect(result[0].data).toHaveLength(5);
    expect(result[0].data[0]).toHaveLength(5);
  });
});

// ─── downloadFile ───────────────────────────────────────────────────────

describe('downloadFile', () => {
  it('creates a download link and clicks it', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const createObjectURLSpy = vi.fn(() => 'blob:test');
    const revokeObjectURLSpy = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });

    downloadFile('test content', 'test.txt', 'text/plain');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

    clickSpy.mockRestore();
    vi.restoreAllMocks();
  });
});

// ─── canvasToPng ────────────────────────────────────────────────────────

describe('canvasToPng', () => {
  it('creates a download link and triggers blob download', () => {
    const canvas = document.createElement('canvas');
    const mockBlob = new Blob([''], { type: 'image/png' });
    const toBlobSpy = vi.spyOn(canvas, 'toBlob').mockImplementation(
      (cb: (_b: Blob | null) => void) => cb(mockBlob),
    );
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const createObjectURLSpy = vi.fn(() => 'blob:png');
    vi.stubGlobal('URL', { createObjectURL: createObjectURLSpy });

    canvasToPng(canvas, 'test.png');

    expect(toBlobSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    toBlobSpy.mockRestore();
    clickSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('handles null blob gracefully', () => {
    const canvas = document.createElement('canvas');
    const toBlobSpy = vi.spyOn(canvas, 'toBlob').mockImplementation(
      (cb: (_b: Blob | null) => void) => cb(null),
    );
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    canvasToPng(canvas, 'test.png');

    expect(toBlobSpy).toHaveBeenCalled();
    // Should not click when blob is null
    expect(clickSpy).not.toHaveBeenCalled();

    toBlobSpy.mockRestore();
    clickSpy.mockRestore();
  });
});

// ─── createNewAscii ─────────────────────────────────────────────────────

describe('createNewAscii', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('creates a new ASCII and calls store action', () => {
    const result = createNewAscii({
      createAscii: { title: 'Test Art', width: 10, height: 8 },
    });

    expect(result).toBe(true);
    expect(mockStore.newAsciibirdMeta).toHaveBeenCalledWith(
      expect.any(Object),
    );
  });

  it('calls closeModal for new-ascii', () => {
    createNewAscii({
      createAscii: { title: 'Test Art', width: 10, height: 8 },
    });

    expect(mockStore.closeModal).toHaveBeenCalledWith('new-ascii');
  });

  it('creates ASCII with correct title', () => {
    createNewAscii({
      createAscii: { title: 'My ASCII', width: 5, height: 5 },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.title).toBe('My ASCII');
  });

  it('creates ASCII with compressed layers of correct dimensions', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: 3, height: 3 },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(typeof payload.layers).toBe('string');
    expect(payload.layers.length).toBeGreaterThan(0);

    const layers = decompressLayers(payload.layers);
    expect(layers).toHaveLength(1);
    expect(layers[0].width).toBe(3);
    expect(layers[0].height).toBe(3);
    expect(layers[0].data).toHaveLength(3);
    expect(layers[0].data[0]).toHaveLength(3);
    // All blocks should be empty
    expect(layers[0].data[0][0]).toEqual({});
    expect(layers[0].data[2][2]).toEqual({});
  });

  it('creates ASCII with string width/height (coerced to number)', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: '4', height: '6' },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].width).toBe(4);
    expect(layers[0].height).toBe(6);
  });

  it('sets correct initial scroll position', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: 5, height: 5 },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.x).toBe(247);
    expect(payload.y).toBe(24);
  });

  it('initializes empty history', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: 5, height: 5 },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.history).toEqual([]);
    expect(payload.historyIndex).toBe(0);
  });

  it('initializes image overlay with defaults', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: 5, height: 5 },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.imageOverlay).toEqual({
      url: null,
      opacity: 95,
      asciiOpacity: 100,
      left: 0,
      top: 0,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    });
  });

  it('handles non-numeric width (parseInt returns NaN)', () => {
    createNewAscii({
      createAscii: { title: 'Test', width: 'abc', height: '2' },
    });

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    // parseInt('abc') returns NaN, but layer still gets created
    // The layer dimensions reflect parseInt result
    expect(layers[0].height).toBe(2);
  });
});

// ─── exportMirc ─────────────────────────────────────────────────────────

describe('exportMirc', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('exports a blank 5x5 canvas', () => {
    const result = exportMirc();
    expect(result).toHaveProperty('filename');
    expect(result).toHaveProperty('output');
    expect(Array.isArray(result.output)).toBe(true);
  });

  it('appends .txt to filename if missing', () => {
    const result = exportMirc();
    expect(result.filename).toMatch(/\.txt$/);
  });

  it('preserves .txt extension if already present', () => {
    // Need a store with a title ending in .txt
    const store = createMockStore({ title: 'myart.txt' });
    setStore(store);
    setModalStore(store);
    const result = exportMirc();
    expect(result.filename).toBe('myart.txt');
  });

  it('exports brush blocks directly (non-null argument)', () => {
    const brushBlocks: Block[][] = [
      [
        { fg: 0, bg: 1, char: 'A' },
        { fg: 0, bg: 1, char: 'B' },
      ],
    ];

    const result = exportMirc(brushBlocks);
    expect(result.filename).toMatch(/^brush-.*\.txt$/);
    expect(result.output.length).toBeGreaterThan(0);
  });

  it('uses store getters when blocks is null', () => {
    const result = exportMirc(null);
    expect(result.output.length).toBeGreaterThan(0);
    expect(mockStore.currentAscii).toBeDefined();
  });

  it('output contains newline characters', () => {
    const result = exportMirc();
    const hasNewline = result.output.some(chunk => chunk === '\n');
    expect(hasNewline).toBe(true);
  });

  it('handles block with only fg color', () => {
    const blocks: Block[][] = [
      [{ fg: 4, char: 'X' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('X');
    // Should have color code for fg=4
    expect(joined).toContain('\x03');
  });

  it('handles block with fg and bg color', () => {
    const blocks: Block[][] = [
      [{ fg: 4, bg: 2, char: 'Y' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('Y');
    expect(joined).toContain(','); // fg,bg separator
  });

  it('handles block with only bg color (no fg)', () => {
    const blocks: Block[][] = [
      [{ bg: 5, char: 'Z' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('Z');
    // Should use fg=0 with bg=5: \x030,5
    expect(joined).toContain('0,5');
  });

  it('optimises half/full blocks with same fg and bg to space', () => {
    const blocks: Block[][] = [
      [{ fg: 1, bg: 1, char: '\u2588' }],  // full block same fg/bg
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    // Should be optimised to space (fg=0, original bg kept)
    expect(joined).toContain(' ');
  });

  it('null chars render as spaces', () => {
    const blocks: Block[][] = [
      [{ fg: 0, bg: 1, char: null as unknown as string }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain(' ');
  });
});

// ─── parseMircAscii ─────────────────────────────────────────────────────

describe('parseMircAscii', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('parses simple mIRC string with correct fg/bg/char values', async () => {
    // \x03 = color code, followed by fg,bg
    const mirc = '\x031,0Hello';

    const result = await parseMircAscii(mirc, 'test.txt');

    expect(result).toBe(true);

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);

    // Verify parsed block values
    expect(layers[0].data[0][0]).toEqual({ fg: 1, bg: 0, char: 'H' });
    expect(layers[0].data[0][1]).toEqual({ fg: 1, bg: 0, char: 'e' });
    expect(layers[0].data[0][4]).toEqual({ fg: 1, bg: 0, char: 'o' });
    expect(layers[0].width).toBe(5);
  });

  it('creates ASCII with correct filename as title', async () => {
    const mirc = '\x031,0A';

    await parseMircAscii(mirc, 'art.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.title).toBe('art.txt');
  });

  it('handles empty input', async () => {
    const result = await parseMircAscii('', 'empty.txt');
    expect(result).toBe(true);
  });

  it('handles input without color codes (plain text)', async () => {
    const mirc = 'Hello World';

    const result = await parseMircAscii(mirc, 'plain.txt');
    expect(result).toBe(true);

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    // Width should be length of "Hello World" = 11
    expect(layers[0].width).toBe(11);
    // Plain text blocks should have no color codes
    expect(layers[0].data[0][0].char).toBe('H');
    expect(layers[0].data[0][0].fg).toBeUndefined();
  });

  it('strips bold and reverse formatting codes', async () => {
    // \x02 = bold, \x1D = reverse/italic
    const mirc = '\x02\x1D\x034,1AB';

    const result = await parseMircAscii(mirc, 'formatted.txt');
    expect(result).toBe(true);

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    // Bold/reverse should be stripped, color codes should remain
    expect(layers[0].data[0][0].char).toBe('A');
    expect(layers[0].data[0][0].fg).toBe(4);
    expect(layers[0].data[0][0].bg).toBe(1);
  });

  it('parses multi-line mIRC with correct dimensions', async () => {
    const mirc = '\x031,0AB\n\x032,1CD';

    await parseMircAscii(mirc, 'multiline.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].height).toBe(2);
    expect(layers[0].width).toBe(2);
    // Row 0: A, B with fg=1, bg=0
    expect(layers[0].data[0][0].char).toBe('A');
    expect(layers[0].data[0][0].fg).toBe(1);
    // Row 1: C, D with fg=2, bg=1
    expect(layers[0].data[1][0].char).toBe('C');
    expect(layers[0].data[1][0].fg).toBe(2);
    expect(layers[0].data[1][0].bg).toBe(1);
  });

  it('handles soft reset (\\x03 without colors) by clearing fg/bg', async () => {
    // \x03 without color code clears fg/bg
    const mirc = '\x031,0A\x03B';

    const result = await parseMircAscii(mirc, 'reset.txt');
    expect(result).toBe(true);

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    // 'A' should have fg=1, bg=0
    expect(layers[0].data[0][0].fg).toBe(1);
    expect(layers[0].data[0][0].bg).toBe(0);
    // 'B' after soft reset should have null fg/bg
    expect(layers[0].data[0][1].fg).toBeNull();
    expect(layers[0].data[0][1].bg).toBeNull();
    expect(layers[0].data[0][1].char).toBe('B');
  });

  it('compresses layers with LZ-String', async () => {
    await parseMircAscii('\x031,0Test', 'compress.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(typeof payload.layers).toBe('string');
    const decompressed = decompressLayers(payload.layers);
    expect(Array.isArray(decompressed)).toBe(true);
  });

  it('sets correct initial x/y from blockWidth/blockHeight', async () => {
    await parseMircAscii('\x031,0A', 'pos.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    expect(payload.x).toBe(blockWidth * 35);
    expect(payload.y).toBe(blockHeight * 2);
  });
});

// ─── mergeLayers ────────────────────────────────────────────────────────

describe('mergeLayers', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('returns a 2D block array', () => {
    const result = mergeLayers();
    expect(Array.isArray(result)).toBe(true);
    expect(Array.isArray(result[0])).toBe(true);
  });

  it('returns blocks from visible layer', () => {
    const layers: Layer[] = [{
      label: 'Visible',
      visible: true,
      width: 2,
      height: 2,
      data: [
        [{ fg: 4, bg: 1, char: 'A' }, { fg: 5, bg: 2, char: 'B' }],
        [{ fg: 6, bg: 3, char: 'C' }, { fg: 7, bg: 4, char: 'D' }],
      ],
    }];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    expect(result[0][0].fg).toBe(4);
    expect(result[0][0].char).toBe('A');
  });

  it('skips invisible layers', () => {
    const layers: Layer[] = [
      {
        label: 'Visible',
        visible: true,
        width: 1,
        height: 1,
        data: [[{ fg: 1, bg: 0, char: 'X' }]],
      },
      {
        label: 'Hidden',
        visible: false,
        width: 1,
        height: 1,
        data: [[{ fg: 9, bg: 9, char: 'Z' }]],
      },
    ];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    // Hidden layer should be skipped, so we should see X not Z
    expect(result[0][0].char).toBe('X');
  });

  it('back layers render behind front layers for empty cells', () => {
    const layers: Layer[] = [
      {
        label: 'Back',
        visible: true,
        width: 1,
        height: 1,
        data: [[{ fg: 1, bg: 0, char: 'B' }]],
      },
      {
        label: 'Front',
        visible: true,
        width: 1,
        height: 1,
        data: [[{ fg: undefined, bg: undefined, char: undefined } as any]],
      },
    ];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    // Front layer has empty block, so back layer should show through
    expect(result[0][0].char).toBe('B');
  });

  it('front layer overrides back layer for non-empty cells', () => {
    const layers: Layer[] = [
      {
        label: 'Back',
        visible: true,
        width: 1,
        height: 1,
        data: [[{ fg: 1, bg: 0, char: 'B' }]],
      },
      {
        label: 'Front',
        visible: true,
        width: 1,
        height: 1,
        data: [[{ fg: 5, bg: 3, char: 'F' }]],
      },
    ];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    // Front layer should win over back layer
    expect(result[0][0].char).toBe('F');
    expect(result[0][0].fg).toBe(5);
  });
});

// ─── mIRC round-trip ────────────────────────────────────────────────────

describe('mIRC round-trip (parse → export)', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('export of blank canvas is deterministic', () => {
    const hash1 = cyrb53(exportMirc().output.join(''));
    const hash2 = cyrb53(exportMirc().output.join(''));
    expect(hash1).toBe(hash2);
  });

  it('parse then export preserves character content', async () => {
    const original = '\x031,0AB\n\x032,1CD';

    await parseMircAscii(original, 'roundtrip.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const parsedLayers = decompressLayers(payload.layers);

    // Verify parsed structure before re-export
    expect(parsedLayers[0].width).toBe(2);
    expect(parsedLayers[0].height).toBe(2);
    expect(parsedLayers[0].data[0][0].char).toBe('A');
    expect(parsedLayers[0].data[1][1].char).toBe('D');

    // Create a new mock with the parsed layers for export
    const newStore = createMockStore({ layers: parsedLayers });
    setStore(newStore);
    setModalStore(newStore);

    const exported = exportMirc();
    expect(exported.output.length).toBeGreaterThan(0);

    const joined = exported.output.join('');
    expect(joined).toContain('A');
    expect(joined).toContain('B');
    expect(joined).toContain('C');
    expect(joined).toContain('D');
  });
});

// ─── splashAscii ────────────────────────────────────────────────────────

describe('splashAscii', () => {
  it('is an array', () => {
    expect(Array.isArray(splashAscii)).toBe(true);
  });

  it('has content (at least 1 row)', () => {
    expect(splashAscii.length).toBeGreaterThan(0);
  });

  it('contains block data (rows of blocks)', () => {
    // splashAscii is a raw 2D block array, not Layer[]
    for (const row of splashAscii) {
      expect(Array.isArray(row)).toBe(true);
    }
  });

  it('has valid block structure in cells', () => {
    const firstRow = splashAscii[0];
    expect(firstRow.length).toBeGreaterThan(0);
    const block = firstRow[0];
    // Blocks can be empty {} or have fg/bg/char
    expect(typeof block).toBe('object');
    // At least some blocks in the splash should have content
    let hasContent = false;
    for (const row of splashAscii) {
      for (const cell of row) {
        if (cell && cell.char) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) break;
    }
    expect(hasContent).toBe(true);
  });
});

// ─── mergeLayers edge cases (line 700 — null char) ──────────────

describe('mergeLayers edge cases', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('handles blocks with null char in front layer', () => {
    const layers: Layer[] = [{
      label: 'Back',
      visible: true,
      width: 1,
      height: 1,
      data: [[{ fg: 1, bg: 0, char: 'B' }]],
    }, {
      label: 'Front',
      visible: true,
      width: 1,
      height: 1,
      // char: null triggers the srcBlock.char !== null check (line 700)
      data: [[{ fg: 5, bg: 3, char: null as unknown as string }]],
    }];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    // Front layer has null char, which sets curBlock.char to undefined
    // Then back layer (processed after) sees undefined and fills in 'B'
    // This exercises the null branch on line 700
    expect(result[0][0].char).toBe('B');
  });

  it('handles blocks with all null properties in front layer only', () => {
    const layers: Layer[] = [{
      label: 'Only',
      visible: true,
      width: 1,
      height: 1,
      // All null - triggers null checks for fg, bg, and char
      data: [[{
        fg: null as unknown as number,
        bg: null as unknown as number,
        char: null as unknown as string,
      }]],
    }];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    const result = mergeLayers();
    // null fg/bg/char should all set curBlock properties to undefined
    expect(result[0][0].fg).toBeUndefined();
    expect(result[0][0].bg).toBeUndefined();
    expect(result[0][0].char).toBeUndefined();
  });

  it('handles empty layer data (no rows or columns)', () => {
    const layers: Layer[] = [{
      label: 'Empty',
      visible: true,
      width: 0,
      height: 0,
      data: [] as Block[][],
    }];

    mockStore = createMockStore({ layers });
    setStore(mockStore);
    setModalStore(mockStore);

    // mergeLayers should handle empty layers gracefully
    // It loops height+1 and width+1, so even 0x0 creates row 0 col 0
    const result = mergeLayers();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── LZ-String compression/decompression edge cases ─────────────

describe('LZ-String compression edge cases', () => {
  it('round-trips empty block arrays', () => {
    const empty: Block[][] = [];
    const compressed = LZString.compressToUTF16(JSON.stringify(empty));
    const decompressed = JSON.parse(
      LZString.decompressFromUTF16(compressed),
    );
    expect(decompressed).toEqual([]);
  });

  it('round-trips large block arrays', () => {
    const large: Block[][] = [];
    for (let y = 0; y < 100; y++) {
      large[y] = [];
      for (let x = 0; x < 100; x++) {
        large[y][x] = { fg: x % 99, bg: y % 99, char: String.fromCharCode(32 + ((x + y) % 94)) };
      }
    }
    const compressed = LZString.compressToUTF16(JSON.stringify(large));
    const decompressed = JSON.parse(
      LZString.decompressFromUTF16(compressed),
    );
    expect(decompressed).toEqual(large);
    // Compression should actually reduce size for repetitive data
    expect(compressed.length).toBeLessThan(JSON.stringify(large).length);
  });

  it('round-trips blocks with empty objects', () => {
    const blocks: Block[][] = [[{}, {}, {}]];
    const compressed = LZString.compressToUTF16(JSON.stringify(blocks));
    const decompressed = JSON.parse(
      LZString.decompressFromUTF16(compressed),
    );
    expect(decompressed).toEqual([[{}, {}, {}]]);
  });

  it('handles corrupted compressed data gracefully', () => {
    // Invalid compressed string should throw or return null
    const result = LZString.decompressFromUTF16('not-valid-compressed-data');
    // LZ-String may return null or empty string for invalid data
    expect(result === null || typeof result === 'string').toBe(true);
  });
});

// ─── exportMirc edge cases ───────────────────────────────────────

describe('exportMirc edge cases', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('handles digit chars that need padding', () => {
    // When the next block's char is a digit, color codes need zero-padding
    const blocks: Block[][] = [
      [{ fg: 4, bg: 1, char: 'A' }, { fg: 5, bg: 2, char: '3' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('A');
    expect(joined).toContain('3');
  });

  it('handles single-digit color codes', () => {
    const blocks: Block[][] = [
      [{ fg: 1, bg: 0, char: 'X' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('\x03');
    expect(joined).toContain('X');
  });

  it('handles two-digit color codes', () => {
    const blocks: Block[][] = [
      [{ fg: 15, bg: 10, char: 'Y' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('Y');
  });

  it('handles consecutive blocks with same colors (optimisation)', () => {
    const blocks: Block[][] = [
      [{ fg: 1, bg: 0, char: 'A' }, { fg: 1, bg: 0, char: 'B' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    // Should have only one color code for both
    // eslint-disable-next-line no-control-regex
    const colorCount = (joined.match(/\x03/g) || []).length;
    expect(colorCount).toBe(1);
  });

  it('handles blocks where char is a digit following a color code', () => {
    const blocks: Block[][] = [
      [{ fg: 4, bg: 1, char: '5' }],
    ];

    const result = exportMirc(blocks);
    const joined = result.output.join('');
    expect(joined).toContain('5');
    // Should be zero-padded since char is a digit
    expect(joined).toContain('\x03');
  });
});

// ─── parseMircAscii edge cases ───────────────────────────────────

describe('parseMircAscii edge cases', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
  });

  it('handles two-digit color codes', async () => {
    // Color code 12,08 (blue, yellow)
    const mirc = '\x0312,08Hello';

    await parseMircAscii(mirc, 'twodigit.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].data[0][0].fg).toBe(12);
    expect(layers[0].data[0][0].bg).toBe(8);
  });

  it('handles mixed single and double digit color codes', async () => {
    // \x031,0 is fg=1, bg=0
    const mirc = '\x031,0A\x0312,15B';

    await parseMircAscii(mirc, 'mixed.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].data[0][0].fg).toBe(1);
    expect(layers[0].data[0][1].fg).toBe(12);
    expect(layers[0].data[0][1].bg).toBe(15);
  });

  it('handles null reset followed by new color', async () => {
    // \x03 = reset, then \x034,2 = new color
    const mirc = '\x031,0A\x03\x034,2B';

    await parseMircAscii(mirc, 'resetnew.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].data[0][0].char).toBe('A');
    expect(layers[0].data[0][0].fg).toBe(1);
    expect(layers[0].data[0][1].char).toBe('B');
    expect(layers[0].data[0][1].fg).toBe(4);
  });

  it('handles very long single line', async () => {
    const longLine = '\x031,0' + 'X'.repeat(500);

    await parseMircAscii(longLine, 'long.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].width).toBe(500);
    expect(layers[0].height).toBe(1);
  });

  it('handles multiple newlines (empty lines)', async () => {
    const mirc = '\x031,0A\n\n\x032,1B';

    await parseMircAscii(mirc, 'emptylines.txt');

    const payload = getLastNewAsciiMetaPayload(mockStore);
    const layers = decompressLayers(payload.layers);
    expect(layers[0].height).toBe(3);
    expect(layers[0].data[0][0].char).toBe('A');
    expect(layers[0].data[2][0].char).toBe('B');
  });
});

// ─── setStore/getStore edge cases ────────────────────────────────

describe('setStore/getStore', () => {
  it('store-dependent functions work after setStore', () => {
    const mockStore = createMockStore();
    setStore(mockStore);
    setModalStore(mockStore);
    expect(() => mergeLayers()).not.toThrow();
  });
});

// ─── iterativeFill ─────────────────────────────────────────────────

describe('iterativeFill', () => {
  /** Create a grid of uniform blocks */
  function makeGrid(
    h: number,
    w: number,
    fg = 0,
    bg = 1,
    char = ' ',
  ): Block[][] {
    return Array.from({ length: h }, () =>
      Array.from({ length: w }, () => ({ fg, bg, char })),
    );
  }

  it('returns empty array on empty grid', () => {
    const changes = iterativeFill(
      [],
      0,
      0,
      { bg: 1 },
      { bg: 2 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toEqual([]);
  });

  it('returns empty array when start position is out of bounds', () => {
    const grid = makeGrid(3, 3);
    const changes = iterativeFill(
      grid,
      -1,
      0,
      { bg: 1 },
      { bg: 2 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toEqual([]);
  });

  it('returns empty array when start block does not match current', () => {
    const grid = makeGrid(3, 3, 0, 1);
    const changes = iterativeFill(
      grid,
      1,
      1,
      { bg: 99 },
      { bg: 2 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toEqual([]);
  });

  it('fills a single cell and returns one change', () => {
    const grid = makeGrid(1, 1);
    const changes = iterativeFill(
      grid,
      0,
      0,
      { bg: 1 },
      { bg: 5 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({
      x: 0,
      y: 0,
      old: { fg: 0, bg: 1, char: ' ' },
      new: { fg: 0, bg: 5, char: ' ' },
    });
    expect(grid[0][0].bg).toBe(5);
  });

  it('fills all connected cells with matching bg', () => {
    const grid = makeGrid(3, 3);
    const changes = iterativeFill(
      grid,
      1,
      1,
      { bg: 1 },
      { bg: 7 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toHaveLength(9);
    for (const c of changes) {
      expect(c.new.bg).toBe(7);
    }
  });

  it('stops at boundary with different bg', () => {
    const grid = makeGrid(3, 3);
    // Create a barrier row
    grid[1][0].bg = 99;
    grid[1][1].bg = 99;
    grid[1][2].bg = 99;

    const changes = iterativeFill(
      grid,
      0,
      1,
      { bg: 1 },
      { bg: 5 },
      true,
      false,
      false,
      false,
    );
    // Only top row should be filled
    expect(changes).toHaveLength(3);
    expect(grid[0][0].bg).toBe(5);
    expect(grid[0][1].bg).toBe(5);
    expect(grid[0][2].bg).toBe(5);
    // Barrier untouched
    expect(grid[1][0].bg).toBe(99);
    expect(grid[1][1].bg).toBe(99);
    expect(grid[1][2].bg).toBe(99);
  });

  it('only modifies bg when canBg=true, canFg=false, canText=false', () => {
    const grid = makeGrid(2, 2, 3, 1, 'X');
    const changes = iterativeFill(
      grid,
      0,
      0,
      { bg: 1, fg: 3, char: 'X' },
      { bg: 5, fg: 9, char: 'Y' },
      true,
      false,
      false,
      false,
    );
    expect(changes).toHaveLength(4);
    for (const c of changes) {
      expect(c.new.bg).toBe(5);
      expect(c.new.fg).toBe(3); // unchanged
      expect(c.new.char).toBe('X'); // unchanged
    }
  });

  it('erases by deleting properties when eraser=true', () => {
    const grid = makeGrid(2, 2, 3, 1, 'A');
    const changes = iterativeFill(
      grid,
      0,
      0,
      { bg: 1, fg: 3, char: 'A' },
      {},
      true,
      true,
      true,
      true,
    );
    expect(changes).toHaveLength(4);
    for (const c of changes) {
      expect(c.new.bg).toBeUndefined();
      expect(c.new.fg).toBeUndefined();
      expect(c.new.char).toBeUndefined();
    }
  });

  it('completes 100x100 fill efficiently (O(k) not O(n))', () => {
    const grid = makeGrid(100, 100);
    const start = performance.now();
    const changes = iterativeFill(
      grid,
      50,
      50,
      { bg: 1 },
      { bg: 5 },
      true,
      false,
      false,
      false,
    );
    const elapsed = performance.now() - start;
    expect(changes).toHaveLength(10_000);
    // CI/jsdom is slower than browser; just verify it completes reasonably
    // Developer target: <16ms on real hardware
    expect(elapsed).toBeLessThan(500);
  });

  it('returns changes that map directly to BlockDiff format', () => {
    const grid = makeGrid(2, 2);
    const changes = iterativeFill(
      grid,
      0,
      0,
      { bg: 1 },
      { bg: 5 },
      true,
      false,
      false,
      false,
    );
    expect(changes).toHaveLength(4);

    // Verify each change has the correct structure for undo system
    for (const c of changes) {
      expect(c).toHaveProperty('x');
      expect(c).toHaveProperty('y');
      expect(c).toHaveProperty('old');
      expect(c).toHaveProperty('new');
      expect(typeof c.x).toBe('number');
      expect(typeof c.y).toBe('number');
      expect(c.old).toHaveProperty('bg');
      expect(c.new).toHaveProperty('bg');
    }
  });
});
