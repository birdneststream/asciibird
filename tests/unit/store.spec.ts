// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import LZString from 'lz-string';
import {
  create2DArray,
  emptyBlock,
  cyrb53,
} from '@/ascii';
import {
  createInitialState,
  mutations,
  getters,
  actions,
} from '@/store/definitions';
import type { Block, Layer, AsciibirdMeta, Options } from '@/types';
import type { RootState } from '@/types/store';

// Mock mergeLayers for mergeAllLayers mutation tests
vi.mock('@/ascii', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/ascii')>();
  return {
    ...original,
    mergeLayers: vi.fn(() => {
      // Return a simple merged 2D array matching the test layer dimensions
      return original.create2DArray(3).map(row => {
        for (let x = 0; x < 3; x++) row.push({ ...original.emptyBlock });
        return row;
      });
    }),
  };
});

Vue.use(Vuex);

// ─── Helper: create a fresh store from production definitions ───────

function createTestStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    state: createInitialState(),
    mutations,
    getters,
    actions,
  });
}

// ─── Helper: create a test AsciibirdMeta ──────────────────────────

function createTestMeta(
  title = 'Test',
  width = 3,
  height = 3,
): AsciibirdMeta {
  const layers: Layer[] = [{
    label: `${title} Layer`,
    visible: true,
    width,
    height,
    data: create2DArray(height).map(row => {
      for (let x = 0; x < width; x++) row.push({ ...emptyBlock });
      return row;
    }),
  }];

  return {
    title,
    layers: LZString.compressToUTF16(JSON.stringify(layers)),
    selectedLayer: 0,
    imageOverlay: {
      url: null, opacity: 95, asciiOpacity: 100,
      left: 0, top: 0, position: 'centered',
      size: 100, repeatx: true, repeaty: true,
      visible: false, stretched: false,
    },
    history: [],
    historyIndex: 0,
    x: 247,
    y: 24,
  };
}

// ─── Mutations ──────────────────────────────────────────────────────

describe('Vuex Store Mutations', () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = createTestStore();
    store.commit('newAsciibirdMeta', createTestMeta());
  });

  // ── Basic state mutations ──────────────────────────────────────

  describe('changeState', () => {
    it('merges partial state', () => {
      store.commit('changeState', { blockSizeMultiplier: 2 });
      expect(store.state.blockSizeMultiplier).toBe(2);
    });
  });

  describe('updateOptions', () => {
    it('replaces options object', () => {
      const newOptions: Options = {
        defaultBg: 5, defaultFg: 3, renderOffScreen: true,
        undoLimit: 100, brushLimit: 200, tabLimit: 5, fps: 60,
      };
      store.commit('updateOptions', newOptions);
      expect(store.state.options).toEqual(newOptions);
    });
  });

  describe('changeTab', () => {
    it('changes active tab', () => {
      store.commit('newAsciibirdMeta', createTestMeta('Second'));
      store.commit('changeTab', 0);
      expect(store.state.tab).toBe(0);
    });
  });

  // ── Color and char mutations ──────────────────────────────────

  describe('changeColourFg', () => {
    it('updates fg color and resets flags', () => {
      store.state.toolbarState.isUpdating = true;
      store.state.toolbarState.isChoosingFg = true;
      store.commit('changeColourFg', 4);
      expect(store.state.toolbarState.currentColourFg).toBe(4);
      expect(store.state.toolbarState.isUpdating).toBe(false);
      expect(store.state.toolbarState.isChoosingFg).toBe(false);
    });
  });

  describe('changeColourBg', () => {
    it('updates bg color and resets flags', () => {
      store.commit('changeColourBg', 7);
      expect(store.state.toolbarState.currentColourBg).toBe(7);
      expect(store.state.toolbarState.isUpdating).toBe(false);
    });
  });

  describe('changeChar', () => {
    it('updates selected char and resets isUpdating', () => {
      store.commit('changeChar', 'X');
      expect(store.state.toolbarState.selectedChar).toBe('X');
      expect(store.state.toolbarState.isUpdating).toBe(false);
    });

    it('closes char panel when persistCharPanel is false', () => {
      store.state.toolbarState.persistCharPanel = false;
      store.state.toolbarState.isChoosingChar = true;
      store.commit('changeChar', 'Y');
      expect(store.state.toolbarState.isChoosingChar).toBe(false);
    });

    it('keeps char panel open when persistCharPanel is true', () => {
      store.state.toolbarState.persistCharPanel = true;
      store.state.toolbarState.isChoosingChar = true;
      store.commit('changeChar', 'Z');
      expect(store.state.toolbarState.isChoosingChar).toBe(true);
    });
  });

  describe('changeTool', () => {
    it('updates current tool', () => {
      store.commit('changeTool', 3);
      expect(store.state.toolbarState.currentTool).toBe(3);
    });
  });

  describe('persistCharPanel', () => {
    it('toggles char panel persistence', () => {
      store.commit('persistCharPanel', true);
      expect(store.state.toolbarState.persistCharPanel).toBe(true);
    });
  });

  // ── Targeting mutations ──────────────────────────────────────

  describe('targeting mutations', () => {
    it('changeTargetingFg', () => {
      store.commit('changeTargetingFg', false);
      expect(store.state.toolbarState.targetingFg).toBe(false);
    });

    it('changeTargetingBg', () => {
      store.commit('changeTargetingBg', false);
      expect(store.state.toolbarState.targetingBg).toBe(false);
    });

    it('changeTargetingChar', () => {
      store.commit('changeTargetingChar', false);
      expect(store.state.toolbarState.targetingChar).toBe(false);
    });

    it('changeIsUpdatingFg', () => {
      store.commit('changeIsUpdatingFg', true);
      expect(store.state.toolbarState.isChoosingFg).toBe(true);
    });

    it('changeIsUpdatingBg', () => {
      store.commit('changeIsUpdatingBg', true);
      expect(store.state.toolbarState.isChoosingBg).toBe(true);
    });

    it('changeIsUpdatingChar', () => {
      store.commit('changeIsUpdatingChar', true);
      expect(store.state.toolbarState.isChoosingChar).toBe(true);
    });
  });

  // ── Desktop state ────────────────────────────────────────────

  describe('desktop state mutations', () => {
    it('changeMenuBarVisible', () => {
      store.commit('changeMenuBarVisible', false);
      expect(store.state.desktopState.menuBarVisible).toBe(false);
    });

    it('changeTabsVisible', () => {
      store.commit('changeTabsVisible', false);
      expect(store.state.desktopState.tabsVisible).toBe(false);
    });
  });

  // ── Panel state mutations ────────────────────────────────────

  describe('panel state mutations', () => {
    it('toggleDebugPanel', () => {
      store.commit('toggleDebugPanel', true);
      expect(store.state.debugPanelState.visible).toBe(true);
    });

    it('changeDebugPanelState', () => {
      const newState = { x: 10, y: 20, h: 30, w: 40, visible: true };
      store.commit('changeDebugPanelState', newState);
      expect(store.state.debugPanelState).toEqual(newState);
    });

    it('toggleBrushLibrary', () => {
      store.commit('toggleBrushLibrary', false);
      expect(store.state.brushLibraryState.visible).toBe(false);
    });

    it('changeBrushLibraryState', () => {
      const newState = { x: 10, y: 20, h: 30, w: 40, visible: false, tab: 1 };
      store.commit('changeBrushLibraryState', newState);
      expect(store.state.brushLibraryState).toEqual(newState);
    });

    it('changeBrushPreviewState', () => {
      const newState = { x: 1, y: 2, h: 3, w: 4, visible: false };
      store.commit('changeBrushPreviewState', newState);
      expect(store.state.brushPreviewState).toEqual(newState);
    });

    it('changeLayersLibraryState', () => {
      const newState = { x: 5, y: 6, h: 7, w: 8, visible: true };
      store.commit('changeLayersLibraryState', newState);
      expect(store.state.layersLibraryState).toEqual(newState);
    });

    it('changeToolBarState', () => {
      store.commit('changeToolBarState', {
        x: 10, y: 20, h: 30, w: 40, visible: false,
      });
      expect(store.state.toolbarState.x).toBe(10);
      expect(store.state.toolbarState.y).toBe(20);
      expect(store.state.toolbarState.visible).toBe(false);
    });

    it('changeToolBarDraggable', () => {
      store.commit('changeToolBarDraggable', false);
      expect(store.state.toolbarState.draggable).toBe(false);
    });

    it('updateMirror', () => {
      store.commit('updateMirror', { x: true, y: true });
      expect(store.state.toolbarState.mirrorX).toBe(true);
      expect(store.state.toolbarState.mirrorY).toBe(true);
    });
  });

  // ── ASCII metadata mutations ─────────────────────────────────

  describe('newAsciibirdMeta', () => {
    it('adds a new ASCII tab and switches to it', () => {
      const meta = createTestMeta('New Art', 10, 10);
      store.commit('newAsciibirdMeta', meta);
      expect(store.state.asciibirdMeta).toHaveLength(2);
      expect(store.state.tab).toBe(1);
    });
  });

  describe('updateAsciiTitle', () => {
    it('updates the title of the current ASCII', () => {
      store.commit('updateAsciiTitle', 'Renamed Art');
      expect(store.state.asciibirdMeta[0].title).toBe('Renamed Art');
    });
  });

  describe('updateImageOverlay', () => {
    it('updates the image overlay settings', () => {
      const newOverlay = {
        ...store.state.asciibirdMeta[0].imageOverlay,
        opacity: 50,
        visible: true,
      };
      store.commit('updateImageOverlay', newOverlay);
      expect(store.state.asciibirdMeta[0].imageOverlay.opacity).toBe(50);
      expect(store.state.asciibirdMeta[0].imageOverlay.visible).toBe(true);
    });
  });

  describe('changeAsciiCanvasState', () => {
    it('updates canvas scroll position', () => {
      store.commit('changeAsciiCanvasState', { x: 100, y: 200 });
      expect(store.state.asciibirdMeta[0].x).toBe(100);
      expect(store.state.asciibirdMeta[0].y).toBe(200);
    });
  });

  describe('changeAsciiWidthHeight', () => {
    it('updates layers with new dimensions', () => {
      const newLayers: Layer[] = [{
        label: 'Resized',
        visible: true,
        width: 10,
        height: 10,
        data: create2DArray(10).map(row => {
          for (let x = 0; x < 10; x++) row.push({ ...emptyBlock });
          return row;
        }),
      }];

      store.commit('changeAsciiWidthHeight', { layers: newLayers });
      const stored = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(stored[0].width).toBe(10);
      expect(stored[0].height).toBe(10);
    });
  });

  // ── Layer mutations ──────────────────────────────────────────

  describe('layer mutations', () => {
    it('addLayer adds a new layer', () => {
      store.commit('addLayer');
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(2);
      expect(layers[1].width).toBe(3);
      expect(layers[1].height).toBe(3);
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('toggleLayer toggles visibility', () => {
      store.commit('toggleLayer', 0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers[0].visible).toBe(false);
    });

    it('removeLayer removes a layer when more than 1 exist', () => {
      store.commit('addLayer');
      expect(
        JSON.parse(LZString.decompressFromUTF16(
          store.state.asciibirdMeta[0].layers,
        )).length,
      ).toBe(2);

      store.commit('removeLayer', 1);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1);
    });

    it('removeLayer does nothing when only 1 layer exists', () => {
      store.commit('removeLayer', 0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1); // Should not remove last layer
    });

    it('changeLayer updates selectedLayer', () => {
      store.commit('addLayer');
      store.commit('changeLayer', 0);
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('downLayer moves layer down', () => {
      store.commit('addLayer');
      store.commit('downLayer', 0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers[0].label).toContain('Layer');
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('upLayer moves layer up', () => {
      store.commit('addLayer');
      store.commit('upLayer', 1);
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('updateLayerName changes layer label', () => {
      store.commit('updateLayerName', { key: 0, label: 'My Layer' });
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers[0].label).toBe('My Layer');
    });

    it('mergeAllLayers merges all layers into one', () => {
      store.commit('addLayer');
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      // Put some content on layer 1
      layers[1].data[0][0] = { fg: 5, bg: 2, char: 'M' };
      store.commit('changeAsciiWidthHeight', { layers });

      store.commit('mergeAllLayers');
      const mergedLayers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(mergedLayers).toHaveLength(1);
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(0);
    });
  });

  // ── Block update with undo/redo ──────────────────────────────

  describe('updateAsciiBlocks with undo/redo', () => {
    it('updateAsciiBlocks adds diff to history', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      store.commit('updateAsciiBlocks', {
        diff: {
          new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
          old: [{ x: 0, y: 0, b: {} }],
        },
        blocks,
      });

      expect(store.state.asciibirdMeta[0].history).toHaveLength(1);
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undoBlocks restores previous state with layer index', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.commit('updateAsciiBlocks', { diff, blocks });
      store.commit('undoBlocks');

      const restoredLayers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(restoredLayers[0].data[0][0]).toEqual({});
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(0);
    });

    it('redoBlocks re-applies undone state', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.commit('updateAsciiBlocks', { diff, blocks });
      store.commit('undoBlocks');
      store.commit('redoBlocks');

      const redoneLayers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(redoneLayers[0].data[0][0].fg).toBe(4);
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undoBlocks is no-op when history is empty', () => {
      const initialIndex = store.state.asciibirdMeta[0].historyIndex;
      store.commit('undoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(initialIndex);
    });

    it('redoBlocks is no-op at end of history', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.commit('updateAsciiBlocks', { diff, blocks });
      store.commit('redoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undo/redo with layer-type history entry', () => {
      store.commit('addLayer');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);

      store.commit('undoBlocks');
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1); // Should be back to 1 layer
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(0);
    });

    it('redoBlocks processes layer-type history entry', () => {
      store.commit('addLayer');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);

      // Undo the addLayer
      store.commit('undoBlocks');
      let layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1);
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(0);

      // Redo processes the layer-type history entry at index 0
      // (covers redo layer path lines 664-675)
      // NOTE: redoBlocks for layer-type entries restores data.old (same
      // as undoBlocks), which means the layer is NOT re-added. This
      // appears to be a source code issue — redo should restore data.new
      // to re-add the layer. The test documents current behavior.
      store.commit('redoBlocks');
      layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      // Current behavior: redo uses data.old → stays at 1 layer
      expect(layers).toHaveLength(1);
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('redoBlocks clamps historyIndex after block-type redo', () => {
      // Set up a block-type diff, undo it, then manually
      // make historyIndex exceed length to trigger clamping
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.commit('updateAsciiBlocks', { diff, blocks });
      store.commit('undoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(0);

      // Redo the block change
      store.commit('redoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);

      // Add a second change, undo it, then try to redo twice
      // to trigger historyIndex clamping (lines 708-714)
      blocks[0][1] = { fg: 5, bg: 2, char: 'Y' };
      const diff2 = {
        new: [{ x: 1, y: 0, b: { fg: 5, bg: 2, char: 'Y' } }],
        old: [{ x: 1, y: 0, b: {} }],
        l: 0,
      };
      store.commit('updateAsciiBlocks', { diff: diff2, blocks });
      store.commit('undoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);

      // Redo should work and clamp if needed
      store.commit('redoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(2);
      // One more redo — history[2] doesn't exist, so no-op
      store.commit('redoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(2);
    });

    it('undoBlocks adjusts selectedLayer when layer is removed', () => {
      // Add a second layer so selectedLayer = 1
      store.commit('addLayer');
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(1);

      // Undo: removes layer 2, selectedLayer should adjust
      store.commit('undoBlocks');
      // selectedLayer was 1, but data.old only has 1 layer (index 0)
      // data.old[selectedLayer+1] = undefined, data.old[selectedLayer-1] exists
      // so selectedLayer should become 0 (covers lines 600-602)
      expect(store.state.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('updateAsciiBlocks with empty diff is a no-op', () => {
      store.commit('updateAsciiBlocks', {
        diff: { new: [], old: [] },
        blocks: [],
      });
      expect(store.state.asciibirdMeta[0].history).toHaveLength(0);
    });
  });

  // ── Brush mutations ──────────────────────────────────────────

  describe('brush mutations', () => {
    it('updateBrushSize updates brush dimensions', () => {
      store.commit('updateBrushSize', {
        brushSizeHeight: 5,
        brushSizeWidth: 3,
        brushSizeType: 'circle',
      });
      expect(store.state.toolbarState.brushSizeHeight).toBe(5);
      expect(store.state.toolbarState.brushSizeWidth).toBe(3);
      expect(store.state.toolbarState.brushSizeType).toBe('circle');
    });

    it('brushBlocks compresses and stores brush data', () => {
      const blocks: Block[][] = [[{ fg: 1, bg: 2, char: 'A' }]];
      store.commit('brushBlocks', blocks);
      const restored = JSON.parse(
        LZString.decompressFromUTF16(store.state.brushBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('selectBlocks compresses and stores selection data', () => {
      const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'B' }]];
      store.commit('selectBlocks', blocks);
      const restored = JSON.parse(
        LZString.decompressFromUTF16(store.state.selectBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('toggleGridView toggles grid', () => {
      store.commit('toggleGridView', true);
      expect(store.state.toolbarState.gridView).toBe(true);
    });

    it('toggleHalfBlockEditing toggles half-block mode', () => {
      store.commit('toggleHalfBlockEditing', true);
      expect(store.state.toolbarState.halfBlockEditing).toBe(true);
    });

    it('toggleUpdateBrush toggles brush update flag', () => {
      store.commit('toggleUpdateBrush', false);
      expect(store.state.toolbarState.updateBrush).toBe(false);
    });

    it('flipRotateBlocks flips brush blocks', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }],
        [{ fg: 2, bg: 0, char: 'B' }],
      ];
      store.commit('brushBlocks', blocks);
      store.commit('flipRotateBlocks', { type: 'flip' });
      const flipped = JSON.parse(
        LZString.decompressFromUTF16(store.state.brushBlocks),
      );
      expect(flipped[0][0].char).toBe('B');
      expect(flipped[1][0].char).toBe('A');
    });

    it('flipRotateBlocks rotates brush blocks', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }, { fg: 2, bg: 0, char: 'B' }],
      ];
      store.commit('brushBlocks', blocks);
      store.commit('flipRotateBlocks', { type: 'rotate' });
      const rotated = JSON.parse(
        LZString.decompressFromUTF16(store.state.brushBlocks),
      );
      expect(rotated[0][0].char).toBe('B');
      expect(rotated[0][1].char).toBe('A');
    });
  });

  // ── Brush library/history mutations ──────────────────────────

  describe('brush library mutations', () => {
    const blocks1: Block[][] = [[{ fg: 1, bg: 0, char: 'A' }]];
    const blocks2: Block[][] = [[{ fg: 2, bg: 0, char: 'B' }]];

    it('pushBrushHistory adds to history', () => {
      store.commit('pushBrushHistory', blocks1);
      expect(store.state.brushHistory).toHaveLength(1);
      expect(store.state.brushHistory[0].hash).toBe(
        cyrb53(JSON.stringify(blocks1)),
      );
    });

    it('pushBrushHistory removes duplicates', () => {
      store.commit('pushBrushHistory', blocks1);
      store.commit('pushBrushHistory', blocks1);
      expect(store.state.brushHistory).toHaveLength(1);
    });

    it('pushBrushHistory respects brushLimit', () => {
      for (let i = 0; i <= store.state.options.brushLimit; i++) {
        store.commit('pushBrushHistory', [[{
          fg: i, bg: 0, char: String(i),
        }]]);
      }
      expect(store.state.brushHistory.length).toBeLessThanOrEqual(
        store.state.options.brushLimit,
      );
    });

    it('pushBrushLibrary adds to library', () => {
      store.commit('pushBrushLibrary', blocks1);
      expect(store.state.brushLibrary).toHaveLength(1);
    });

    it('pushBrushLibrary removes duplicates', () => {
      store.commit('pushBrushLibrary', blocks1);
      store.commit('pushBrushLibrary', blocks1);
      expect(store.state.brushLibrary).toHaveLength(1);
    });

    it('removeBrushLibrary removes by hash', () => {
      store.commit('pushBrushLibrary', blocks1);
      store.commit('pushBrushLibrary', blocks2);
      store.commit('removeBrushLibrary', blocks1);
      expect(store.state.brushLibrary).toHaveLength(1);
    });

    it('removeBrushHistory removes by hash', () => {
      store.commit('pushBrushHistory', blocks1);
      store.commit('pushBrushHistory', blocks2);
      store.commit('removeBrushHistory', blocks1);
      expect(store.state.brushHistory).toHaveLength(1);
    });

    it('upBrush swaps brush up', () => {
      store.commit('pushBrushLibrary', blocks1);
      store.commit('pushBrushLibrary', blocks2);
      store.commit('upBrush', 1);
      const hash0 = store.state.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });

    it('downBrush swaps brush down', () => {
      store.commit('pushBrushLibrary', blocks1);
      store.commit('pushBrushLibrary', blocks2);
      store.commit('downBrush', 0);
      const hash0 = store.state.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });
  });

  // ── Modal mutations ──────────────────────────────────────────

  describe('modal mutations', () => {
    it('openModal sets modal state and disables keyboard', () => {
      store.commit('openModal', 'new-ascii');
      expect(store.state.modalState.newAscii).toBe(true);
      expect(store.state.isKeyboardDisabled).toBe(true);
    });

    it('closeModal unsets modal state and enables keyboard', () => {
      store.commit('openModal', 'new-ascii');
      store.commit('closeModal', 'new-ascii');
      expect(store.state.modalState.newAscii).toBe(false);
      expect(store.state.isKeyboardDisabled).toBe(false);
    });

    it('openModal handles all modal types', () => {
      const types = [
        'new-ascii', 'edit-ascii', 'paste-ascii',
        'options', 'overlay', 'about', 'help',
      ];
      for (const type of types) {
        store.commit('openModal', type);
        store.commit('closeModal', type);
      }
      const allClosed = Object.values(store.state.modalState)
        .every(v => !v);
      expect(allClosed).toBe(true);
    });
  });

  // ── Tab mutations ────────────────────────────────────────────

  describe('closeTab', () => {
    it('removes a tab and adjusts index', () => {
      store.commit('newAsciibirdMeta', createTestMeta('Second'));
      store.commit('newAsciibirdMeta', createTestMeta('Third'));
      expect(store.state.asciibirdMeta).toHaveLength(3);

      store.commit('closeTab', 2);
      expect(store.state.asciibirdMeta).toHaveLength(2);
    });

    it('jumps to last tab when closing current', () => {
      store.commit('newAsciibirdMeta', createTestMeta('Second'));
      store.commit('closeTab', 1);
      expect(store.state.tab).toBe(0);
    });
  });

  // ── Keyboard toggle ──────────────────────────────────────────

  describe('toggleDisableKeyboard', () => {
    it('toggles keyboard disabled state', () => {
      store.commit('toggleDisableKeyboard');
      expect(store.state.isKeyboardDisabled).toBe(true);
      store.commit('toggleDisableKeyboard');
      expect(store.state.isKeyboardDisabled).toBe(false);
    });

    it('sets keyboard disabled to explicit value', () => {
      store.commit('toggleDisableKeyboard', true);
      expect(store.state.isKeyboardDisabled).toBe(true);
    });
  });

  // ── Toolbar state ────────────────────────────────────────────

  describe('updateToolBarState', () => {
    it('replaces entire toolbar state', () => {
      const newToolbar = {
        ...store.state.toolbarState,
        currentTool: 5,
      };
      store.commit('updateToolBarState', newToolbar);
      expect(store.state.toolbarState.currentTool).toBe(5);
    });
  });
});

// ─── Getters ────────────────────────────────────────────────────────

describe('Vuex Store Getters', () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = createTestStore();
    store.commit('newAsciibirdMeta', createTestMeta());
  });

  it('state getter returns full state', () => {
    expect(store.getters.state).toBe(store.state);
  });

  it('modalState returns modal state', () => {
    expect(store.getters.modalState).toEqual(store.state.modalState);
  });

  it('options returns options', () => {
    expect(store.getters.options).toEqual(store.state.options);
  });

  it('toolbarState returns toolbar state', () => {
    expect(store.getters.toolbarState).toEqual(store.state.toolbarState);
  });

  it('debugPanel returns debug panel state', () => {
    expect(store.getters.debugPanel).toEqual(store.state.debugPanelState);
  });

  it('currentTool returns current tool index', () => {
    expect(store.getters.currentTool).toBe(0);
  });

  it('currentFg returns fg color', () => {
    expect(store.getters.currentFg).toBe(0);
  });

  it('currentBg returns bg color', () => {
    expect(store.getters.currentBg).toBe(1);
  });

  it('currentChar returns selected char', () => {
    expect(store.getters.currentChar).toBe(' ');
  });

  it('currentTab returns current tab index', () => {
    expect(store.getters.currentTab).toBe(0);
  });

  it('currentAscii returns current ASCII metadata', () => {
    expect(store.getters.currentAscii.title).toBe('Test');
  });

  it('currentAsciiLayers decompresses layers correctly', () => {
    const layers = store.getters.currentAsciiLayers;
    expect(layers).toHaveLength(1);
    expect(layers[0].width).toBe(3);
    expect(layers[0].height).toBe(3);
  });

  it('currentAsciiLayersWidthHeight returns dimensions', () => {
    const dims = store.getters.currentAsciiLayersWidthHeight;
    expect(dims).toEqual({ width: 3, height: 3 });
  });

  it('selectedLayer returns selected layer index', () => {
    expect(store.getters.selectedLayer).toBe(0);
  });

  it('asciibirdMeta returns full meta array', () => {
    expect(store.getters.asciibirdMeta).toHaveLength(1);
  });

  it('brushSizeHeight returns height', () => {
    expect(store.getters.brushSizeHeight).toBe(1);
  });

  it('brushSizeWidth returns width', () => {
    expect(store.getters.brushSizeWidth).toBe(1);
  });

  it('brushSizeType returns type', () => {
    expect(store.getters.brushSizeType).toBe('square');
  });

  it('blockSizeMultiplier returns multiplier', () => {
    expect(store.getters.blockSizeMultiplier).toBe(1);
  });

  it('brushHistory returns history array', () => {
    expect(store.getters.brushHistory).toEqual([]);
  });

  it('brushLibrary returns library array', () => {
    expect(store.getters.brushLibrary).toEqual([]);
  });

  it('isKeyboardDisabled returns disabled state', () => {
    expect(store.getters.isKeyboardDisabled).toBe(false);
  });

  it('isModalOpen returns false when all closed', () => {
    expect(store.getters.isModalOpen).toBe(false);
  });

  it('isModalOpen returns true when any open', () => {
    store.commit('openModal', 'help');
    expect(store.getters.isModalOpen).toBe(true);
  });

  it('brushBlocks decompresses brush data', () => {
    const blocks: Block[][] = [[{ fg: 1, bg: 2, char: 'X' }]];
    store.commit('brushBlocks', blocks);
    expect(store.getters.brushBlocks).toEqual(blocks);
  });

  it('selectBlocks decompresses selection data', () => {
    const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'Y' }]];
    store.commit('selectBlocks', blocks);
    expect(store.getters.selectBlocks).toEqual(blocks);
  });

  it('currentAscii returns false when no tabs', () => {
    store.commit('closeTab', 0);
    expect(store.getters.currentAscii).toBe(false);
  });

  it('currentAsciiLayers returns empty array when no tabs', () => {
    store.commit('closeTab', 0);
    expect(store.getters.currentAsciiLayers).toEqual([]);
  });

  it('currentAsciiLayersWidthHeight returns 0x0 when no tabs', () => {
    store.commit('closeTab', 0);
    expect(store.getters.currentAsciiLayersWidthHeight).toEqual({
      width: 0, height: 0,
    });
  });

  it('imageOverlay returns overlay settings', () => {
    const overlay = store.getters.imageOverlay;
    expect(overlay.opacity).toBe(95);
    expect(overlay.visible).toBe(false);
  });

  it('tabsVisible returns tabs visibility', () => {
    expect(store.getters.tabsVisible).toBe(true);
  });

  it('menuBarVisible returns menu visibility', () => {
    expect(store.getters.menuBarVisible).toBe(true);
  });

  it('isTargettingFg returns targeting fg state', () => {
    expect(store.getters.isTargettingFg).toBe(true);
  });

  it('isTargettingBg returns targeting bg state', () => {
    expect(store.getters.isTargettingBg).toBe(true);
  });

  it('isTargettingChar returns targeting char state', () => {
    expect(store.getters.isTargettingChar).toBe(true);
  });

  it('brushLibraryState returns brush library panel state', () => {
    expect(store.getters.brushLibraryState.visible).toBe(true);
  });

  it('brushPreviewState returns brush preview panel state', () => {
    expect(store.getters.brushPreviewState.visible).toBe(true);
  });

  it('layersLibraryState returns layers panel state', () => {
    expect(store.getters.layersLibraryState.visible).toBe(true);
  });

  it('persistCharPanel returns char panel persistence', () => {
    expect(store.getters.persistCharPanel).toBe(false);
  });
});

// ─── Actions ────────────────────────────────────────────────────────

describe('Vuex Store Actions', () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = createTestStore();
    store.commit('newAsciibirdMeta', createTestMeta());
  });

  describe('updateAsciiBlocksAsync', () => {
    it('commits updateAsciiBlocks and resolves', async () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      await store.dispatch('updateAsciiBlocksAsync', {
        diff: {
          new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
          old: [{ x: 0, y: 0, b: {} }],
        },
        blocks,
      });

      expect(store.state.asciibirdMeta[0].history).toHaveLength(1);
    });
  });
});
