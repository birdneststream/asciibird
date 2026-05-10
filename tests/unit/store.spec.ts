// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LZString from 'lz-string';
import {
  create2DArray,
  emptyBlock,
  cyrb53,
} from '@/ascii';
import { useAsciiBirdStore } from '@/store';
import { useModalStore } from '@/store/modal';
import { useDesktopStore } from '@/store/desktop';
import { usePanelStore } from '@/store/panels';
import type { Block, Layer, AsciibirdMeta, Options } from '@/types';
import type { RootState } from '@/types/store';

// Mock mergeLayers for mergeAllLayers action tests
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

// ─── Actions (former mutations) ─────────────────────────────────────

describe('Pinia Store Actions', () => {
  let store: ReturnType<typeof useAsciiBirdStore>;
  let modalStore: ReturnType<typeof useModalStore>;
  let desktopStore: ReturnType<typeof useDesktopStore>;
  let panelStore: ReturnType<typeof usePanelStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAsciiBirdStore();
    modalStore = useModalStore();
    desktopStore = useDesktopStore();
    panelStore = usePanelStore();
    store.newAsciibirdMeta(createTestMeta());
  });

  // ── Basic state actions ──────────────────────────────────────

  describe('changeState', () => {
    it('merges partial state', () => {
      store.changeState({ blockSizeMultiplier: 2 });
      expect(store.blockSizeMultiplier).toBe(2);
    });
  });

  describe('updateOptions', () => {
    it('replaces options object', () => {
      const newOptions: Options = {
        defaultBg: 5, defaultFg: 3, renderOffScreen: true,
        undoLimit: 100, brushLimit: 200, tabLimit: 5, fps: 60,
      };
      store.updateOptions(newOptions);
      expect(store.options).toEqual(newOptions);
    });
  });

  describe('changeTab', () => {
    it('changes active tab', () => {
      store.newAsciibirdMeta(createTestMeta('Second'));
      store.changeTab(0);
      expect(store.tab).toBe(0);
    });
  });

  // ── Color and char actions ──────────────────────────────────

  describe('changeColourFg', () => {
    it('updates fg color and resets flags', () => {
      store.toolbarState.isUpdating = true;
      store.toolbarState.isChoosingFg = true;
      store.changeColourFg(4);
      expect(store.toolbarState.currentColourFg).toBe(4);
      expect(store.toolbarState.isUpdating).toBe(false);
      expect(store.toolbarState.isChoosingFg).toBe(false);
    });
  });

  describe('changeColourBg', () => {
    it('updates bg color and resets flags', () => {
      store.changeColourBg(7);
      expect(store.toolbarState.currentColourBg).toBe(7);
      expect(store.toolbarState.isUpdating).toBe(false);
    });
  });

  describe('changeChar', () => {
    it('updates selected char and resets isUpdating', () => {
      store.changeChar('X');
      expect(store.toolbarState.selectedChar).toBe('X');
      expect(store.toolbarState.isUpdating).toBe(false);
    });

    it('closes char panel when persistCharPanel is false', () => {
      store.toolbarState.persistCharPanel = false;
      store.toolbarState.isChoosingChar = true;
      store.changeChar('Y');
      expect(store.toolbarState.isChoosingChar).toBe(false);
    });

    it('keeps char panel open when persistCharPanel is true', () => {
      store.toolbarState.persistCharPanel = true;
      store.toolbarState.isChoosingChar = true;
      store.changeChar('Z');
      expect(store.toolbarState.isChoosingChar).toBe(true);
    });
  });

  describe('changeTool', () => {
    it('updates current tool', () => {
      store.changeTool(3);
      expect(store.toolbarState.currentTool).toBe(3);
    });
  });

  describe('persistCharPanel', () => {
    it('toggles char panel persistence', () => {
      store.toolbarState.persistCharPanel = true;
      expect(store.toolbarState.persistCharPanel).toBe(true);
    });
  });

  // ── Targeting actions ──────────────────────────────────────

  describe('targeting actions', () => {
    it('changeTargetingFg', () => {
      store.changeTargetingFg(false);
      expect(store.toolbarState.targetingFg).toBe(false);
    });

    it('changeTargetingBg', () => {
      store.changeTargetingBg(false);
      expect(store.toolbarState.targetingBg).toBe(false);
    });

    it('changeTargetingChar', () => {
      store.changeTargetingChar(false);
      expect(store.toolbarState.targetingChar).toBe(false);
    });

    it('changeIsUpdatingFg', () => {
      store.changeIsUpdatingFg(true);
      expect(store.toolbarState.isChoosingFg).toBe(true);
    });

    it('changeIsUpdatingBg', () => {
      store.changeIsUpdatingBg(true);
      expect(store.toolbarState.isChoosingBg).toBe(true);
    });

    it('changeIsUpdatingChar', () => {
      store.changeIsUpdatingChar(true);
      expect(store.toolbarState.isChoosingChar).toBe(true);
    });
  });

  // ── Desktop state (now in useDesktopStore) ────────────────────

  describe('desktop state actions', () => {
    it('changeMenuBarVisible', () => {
      desktopStore.changeMenuBarVisible(false);
      expect(desktopStore.menuBarVisible).toBe(false);
    });

    it('changeTabsVisible', () => {
      desktopStore.changeTabsVisible(false);
      expect(desktopStore.tabsVisible).toBe(false);
    });
  });

  // ── Panel state actions ────────────────────────────────────

  // ── Panel state (now in usePanelStore) ────────────────────────

  describe('panel state actions', () => {
    it('toggleDebugPanel', () => {
      panelStore.toggleDebugPanel(true);
      expect(panelStore.debugPanel.visible).toBe(true);
    });

    it('changeDebugPanelState', () => {
      const newState = { x: 10, y: 20, h: 30, w: 40, visible: true };
      panelStore.changeDebugPanelState(newState);
      expect(panelStore.debugPanel).toEqual(newState);
    });

    it('toggleBrushLibrary', () => {
      panelStore.toggleBrushLibrary(false);
      expect(panelStore.brushLibrary.visible).toBe(false);
    });

    it('changeBrushLibraryState', () => {
      const newState = { x: 10, y: 20, h: 30, w: 40, visible: false, tab: 1 };
      panelStore.changeBrushLibraryState(newState);
      expect(panelStore.brushLibrary).toEqual(newState);
    });

    it('changeBrushPreviewState', () => {
      const newState = { x: 1, y: 2, h: 3, w: 4, visible: false };
      panelStore.changeBrushPreviewState(newState);
      expect(panelStore.brushPreview).toEqual(newState);
    });

    it('changeLayersLibraryState', () => {
      const newState = { x: 5, y: 6, h: 7, w: 8, visible: true };
      panelStore.changeLayersLibraryState(newState);
      expect(panelStore.layersLibrary).toEqual(newState);
    });

    it('changeToolBarState', () => {
      store.changeToolBarState({
        x: 10, y: 20, h: 30, w: 40, visible: false,
      });
      expect(store.toolbarState.x).toBe(10);
      expect(store.toolbarState.y).toBe(20);
      expect(store.toolbarState.visible).toBe(false);
    });

    it('changeToolBarDraggable', () => {
      store.changeToolBarDraggable(false);
      expect(store.toolbarState.draggable).toBe(false);
    });

    it('updateMirror', () => {
      store.updateMirror({ x: true, y: true });
      expect(store.toolbarState.mirrorX).toBe(true);
      expect(store.toolbarState.mirrorY).toBe(true);
    });
  });

  // ── ASCII metadata actions ─────────────────────────────────

  describe('newAsciibirdMeta', () => {
    it('adds a new ASCII tab and switches to it', () => {
      const meta = createTestMeta('New Art', 10, 10);
      store.newAsciibirdMeta(meta);
      expect(store.asciibirdMeta).toHaveLength(2);
      expect(store.tab).toBe(1);
    });
  });

  describe('updateAsciiTitle', () => {
    it('updates the title of the current ASCII', () => {
      store.updateAsciiTitle('Renamed Art');
      expect(store.asciibirdMeta[0].title).toBe('Renamed Art');
    });
  });

  describe('updateImageOverlay', () => {
    it('updates the image overlay settings', () => {
      const newOverlay = {
        ...store.asciibirdMeta[0].imageOverlay,
        opacity: 50,
        visible: true,
      };
      store.updateImageOverlay(newOverlay);
      expect(store.asciibirdMeta[0].imageOverlay.opacity).toBe(50);
      expect(store.asciibirdMeta[0].imageOverlay.visible).toBe(true);
    });
  });

  describe('changeAsciiCanvasState', () => {
    it('updates canvas scroll position', () => {
      store.changeAsciiCanvasState({ x: 100, y: 200 });
      expect(store.asciibirdMeta[0].x).toBe(100);
      expect(store.asciibirdMeta[0].y).toBe(200);
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

      store.changeAsciiWidthHeight({ layers: newLayers });
      const stored = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(stored[0].width).toBe(10);
      expect(stored[0].height).toBe(10);
    });
  });

  // ── Layer actions ──────────────────────────────────────────

  describe('layer actions', () => {
    it('addLayer adds a new layer', () => {
      store.addLayer();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(2);
      expect(layers[1].width).toBe(3);
      expect(layers[1].height).toBe(3);
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('toggleLayer toggles visibility', () => {
      store.toggleLayer(0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers[0].visible).toBe(false);
    });

    it('removeLayer removes a layer when more than 1 exist', () => {
      store.addLayer();
      expect(
        JSON.parse(LZString.decompressFromUTF16(
          store.asciibirdMeta[0].layers,
        )).length,
      ).toBe(2);

      store.removeLayer(1);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1);
    });

    it('removeLayer does nothing when only 1 layer exists', () => {
      store.removeLayer(0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1); // Should not remove last layer
    });

    it('changeLayer updates selectedLayer', () => {
      store.addLayer();
      store.changeLayer(0);
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('downLayer moves layer down', () => {
      store.addLayer();
      store.downLayer(0);
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers[0].label).toContain('Layer');
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('upLayer moves layer up', () => {
      store.addLayer();
      store.upLayer(1);
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('updateLayerName changes layer label', () => {
      store.updateLayerName({ key: 0, label: 'My Layer' });
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers[0].label).toBe('My Layer');
    });

    it('mergeAllLayers merges all layers into one', () => {
      store.addLayer();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      // Put some content on layer 1
      layers[1].data[0][0] = { fg: 5, bg: 2, char: 'M' };
      store.changeAsciiWidthHeight({ layers });

      store.mergeAllLayers();
      const mergedLayers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(mergedLayers).toHaveLength(1);
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
    });
  });

  // ── Block update with undo/redo ──────────────────────────────

  describe('updateAsciiBlocks with undo/redo', () => {
    it('updateAsciiBlocks adds diff to history', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      store.updateAsciiBlocks({
        diff: {
          new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
          old: [{ x: 0, y: 0, b: {} }],
        },
        blocks,
      });

      expect(store.asciibirdMeta[0].history).toHaveLength(1);
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undoBlocks restores previous state with layer index', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.updateAsciiBlocks({ diff, blocks });
      store.undoBlocks();

      const restoredLayers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(restoredLayers[0].data[0][0]).toEqual({});
      expect(store.asciibirdMeta[0].historyIndex).toBe(0);
    });

    it('redoBlocks re-applies undone state', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.updateAsciiBlocks({ diff, blocks });
      store.undoBlocks();
      store.redoBlocks();

      const redoneLayers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(redoneLayers[0].data[0][0].fg).toBe(4);
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undoBlocks is no-op when history is empty', () => {
      const initialIndex = store.asciibirdMeta[0].historyIndex;
      store.undoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(initialIndex);
    });

    it('redoBlocks is no-op at end of history', () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.updateAsciiBlocks({ diff, blocks });
      store.redoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undo/redo with layer-type history entry', () => {
      store.addLayer();
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);

      store.undoBlocks();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1); // Should be back to 1 layer
      expect(store.asciibirdMeta[0].historyIndex).toBe(0);
    });

    it('redoBlocks processes layer-type history entry', () => {
      store.addLayer();
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);

      // Undo the addLayer
      store.undoBlocks();
      let layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1);
      expect(store.asciibirdMeta[0].historyIndex).toBe(0);

      // Redo re-applies the layer operation, restoring data.new
      store.redoBlocks();
      layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(2);
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('redoBlocks clamps historyIndex after block-type redo', () => {
      // Set up a block-type diff, undo it, then manually
      // make historyIndex exceed length to trigger clamping
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      const diff = {
        new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
        old: [{ x: 0, y: 0, b: {} }],
        l: 0,
      };

      store.updateAsciiBlocks({ diff, blocks });
      store.undoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(0);

      // Redo the block change
      store.redoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);

      // Add a second change, undo it, then try to redo twice
      // to trigger historyIndex clamping
      blocks[0][1] = { fg: 5, bg: 2, char: 'Y' };
      const diff2 = {
        new: [{ x: 1, y: 0, b: { fg: 5, bg: 2, char: 'Y' } }],
        old: [{ x: 1, y: 0, b: {} }],
        l: 0,
      };
      store.updateAsciiBlocks({ diff: diff2, blocks });
      store.undoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(1);

      // Redo should work and clamp if needed
      store.redoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(2);
      // One more redo — history[2] doesn't exist, so no-op
      store.redoBlocks();
      expect(store.asciibirdMeta[0].historyIndex).toBe(2);
    });

    it('undoBlocks adjusts selectedLayer when layer is removed', () => {
      // Add a second layer so selectedLayer = 1
      store.addLayer();
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);

      // Undo: removes layer 2, selectedLayer should adjust
      store.undoBlocks();
      // selectedLayer was 1, but data.old only has 1 layer (index 0)
      // data.old[selectedLayer+1] = undefined, data.old[selectedLayer-1] exists
      // so selectedLayer should become 0
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('redoBlocks restores selectedLayer after layer redo', () => {
      // Add a second layer so selectedLayer = 1
      store.addLayer();
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);

      // Undo: removes layer 2, selectedLayer becomes 0
      store.undoBlocks();
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);

      // Redo: re-adds layer 2, selectedLayer should restore to 1
      store.redoBlocks();
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('updateAsciiBlocks with empty diff is a no-op', () => {
      store.updateAsciiBlocks({
        diff: { new: [], old: [] },
        blocks: [],
      });
      expect(store.asciibirdMeta[0].history).toHaveLength(0);
    });
  });

  // ── Brush actions ──────────────────────────────────────────

  describe('brush actions', () => {
    it('updateBrushSize updates brush dimensions', () => {
      store.updateBrushSize({
        brushSizeHeight: 5,
        brushSizeWidth: 3,
        brushSizeType: 'circle',
      });
      expect(store.toolbarState.brushSizeHeight).toBe(5);
      expect(store.toolbarState.brushSizeWidth).toBe(3);
      expect(store.toolbarState.brushSizeType).toBe('circle');
    });

    it('brushBlocks compresses and stores brush data', () => {
      const blocks: Block[][] = [[{ fg: 1, bg: 2, char: 'A' }]];
      store._brushBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
      const restored = JSON.parse(
        LZString.decompressFromUTF16(store._brushBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('selectBlocks compresses and stores selection data', () => {
      const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'B' }]];
      store._selectBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
      const restored = JSON.parse(
        LZString.decompressFromUTF16(store._selectBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('toggleGridView toggles grid', () => {
      store.toggleGridView(true);
      expect(store.toolbarState.gridView).toBe(true);
    });

    it('toggleHalfBlockEditing toggles half-block mode', () => {
      store.toggleHalfBlockEditing(true);
      expect(store.toolbarState.halfBlockEditing).toBe(true);
    });

    it('toggleUpdateBrush toggles brush update flag', () => {
      store.toggleUpdateBrush(false);
      expect(store.toolbarState.updateBrush).toBe(false);
    });

    it('flipRotateBlocks flips brush blocks', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }],
        [{ fg: 2, bg: 0, char: 'B' }],
      ];
      store._brushBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
      store.flipRotateBlocks({ type: 'flip' });
      const flipped = JSON.parse(
        LZString.decompressFromUTF16(store._brushBlocks),
      );
      expect(flipped[0][0].char).toBe('B');
      expect(flipped[1][0].char).toBe('A');
    });

    it('flipRotateBlocks rotates brush blocks', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }, { fg: 2, bg: 0, char: 'B' }],
      ];
      store._brushBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
      store.flipRotateBlocks({ type: 'rotate' });
      const rotated = JSON.parse(
        LZString.decompressFromUTF16(store._brushBlocks),
      );
      expect(rotated[0][0].char).toBe('B');
      expect(rotated[0][1].char).toBe('A');
    });
  });

  // ── Brush library/history actions ──────────────────────────

  describe('brush library actions', () => {
    const blocks1: Block[][] = [[{ fg: 1, bg: 0, char: 'A' }]];
    const blocks2: Block[][] = [[{ fg: 2, bg: 0, char: 'B' }]];

    it('pushBrushHistory adds to history', () => {
      store.pushBrushHistory(blocks1);
      expect(store.brushHistory).toHaveLength(1);
      expect(store.brushHistory[0].hash).toBe(
        cyrb53(JSON.stringify(blocks1)),
      );
    });

    it('pushBrushHistory removes duplicates', () => {
      store.pushBrushHistory(blocks1);
      store.pushBrushHistory(blocks1);
      expect(store.brushHistory).toHaveLength(1);
    });

    it('pushBrushHistory respects brushLimit', () => {
      for (let i = 0; i <= store.options.brushLimit; i++) {
        store.pushBrushHistory([[{
          fg: i, bg: 0, char: String(i),
        }]]);
      }
      expect(store.brushHistory.length).toBeLessThanOrEqual(
        store.options.brushLimit,
      );
    });

    it('pushBrushLibrary adds to library', () => {
      store.pushBrushLibrary(blocks1);
      expect(store.brushLibrary).toHaveLength(1);
    });

    it('pushBrushLibrary removes duplicates', () => {
      store.pushBrushLibrary(blocks1);
      store.pushBrushLibrary(blocks1);
      expect(store.brushLibrary).toHaveLength(1);
    });

    it('removeBrushLibrary removes by hash', () => {
      store.pushBrushLibrary(blocks1);
      store.pushBrushLibrary(blocks2);
      store.removeBrushLibrary(blocks1);
      expect(store.brushLibrary).toHaveLength(1);
    });

    it('removeBrushHistory removes by hash', () => {
      store.pushBrushHistory(blocks1);
      store.pushBrushHistory(blocks2);
      store.removeBrushHistory(blocks1);
      expect(store.brushHistory).toHaveLength(1);
    });

    it('upBrush swaps brush up', () => {
      store.pushBrushLibrary(blocks1);
      store.pushBrushLibrary(blocks2);
      store.upBrush(1);
      const hash0 = store.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });

    it('downBrush swaps brush down', () => {
      store.pushBrushLibrary(blocks1);
      store.pushBrushLibrary(blocks2);
      store.downBrush(0);
      const hash0 = store.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });
  });

  // ── Modal actions (now in useModalStore) ────────────────────

  describe('modal actions', () => {
    it('openModal sets modal state', () => {
      modalStore.openModal('new-ascii');
      expect(modalStore.modalState.newAscii).toBe(true);
    });

    it('closeModal unsets modal state', () => {
      modalStore.openModal('new-ascii');
      modalStore.closeModal('new-ascii');
      expect(modalStore.modalState.newAscii).toBe(false);
    });

    it('openModal handles all modal types', () => {
      const types = [
        'new-ascii', 'edit-ascii', 'paste-ascii',
        'options', 'overlay', 'about', 'help',
      ];
      for (const type of types) {
        modalStore.openModal(type);
        modalStore.closeModal(type);
      }
      const allClosed = Object.values(modalStore.modalState)
        .every(v => !v);
      expect(allClosed).toBe(true);
    });
  });

  // ── Tab actions ────────────────────────────────────────────

  describe('closeTab', () => {
    it('removes a tab and adjusts index', () => {
      store.newAsciibirdMeta(createTestMeta('Second'));
      store.newAsciibirdMeta(createTestMeta('Third'));
      expect(store.asciibirdMeta).toHaveLength(3);

      store.closeTab(2);
      expect(store.asciibirdMeta).toHaveLength(2);
    });

    it('jumps to last tab when closing current', () => {
      store.newAsciibirdMeta(createTestMeta('Second'));
      store.closeTab(1);
      expect(store.tab).toBe(0);
    });
  });

  // ── Keyboard toggle (now in useModalStore) ─────────────────────

  describe('toggleDisableKeyboard', () => {
    it('toggles keyboard disabled state', () => {
      modalStore.toggleDisableKeyboard();
      expect(modalStore.isKeyboardDisabled).toBe(true);
      modalStore.toggleDisableKeyboard();
      expect(modalStore.isKeyboardDisabled).toBe(false);
    });

    it('sets keyboard disabled to explicit value', () => {
      modalStore.toggleDisableKeyboard(true);
      expect(modalStore.isKeyboardDisabled).toBe(true);
    });
  });

  // ── Toolbar state ────────────────────────────────────────────

  describe('updateToolBarState', () => {
    it('replaces entire toolbar state', () => {
      const newToolbar = {
        ...store.toolbarState,
        currentTool: 5,
      };
      store.updateToolBarState(newToolbar);
      expect(store.toolbarState.currentTool).toBe(5);
    });
  });
});

// ─── Getters ────────────────────────────────────────────────────────

describe('Pinia Store Getters', () => {
  let store: ReturnType<typeof useAsciiBirdStore>;
  let modalStore: ReturnType<typeof useModalStore>;
  let desktopStore: ReturnType<typeof useDesktopStore>;
  let panelStore: ReturnType<typeof usePanelStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAsciiBirdStore();
    modalStore = useModalStore();
    desktopStore = useDesktopStore();
    panelStore = usePanelStore();
    store.newAsciibirdMeta(createTestMeta());
  });

  it('state getter returns state properties', () => {
    const state = store.state;
    expect(state.tab).toBe(store.tab);
    expect(state.options).toBe(store.options);
  });

  it('options returns options', () => {
    expect(store.options).toEqual(store.$state.options);
  });

  it('toolbarState returns toolbar state', () => {
    expect(store.toolbarState).toEqual(store.$state.toolbarState);
  });

  it('debugPanel returns debug panel state', () => {
    expect(panelStore.debugPanel).toEqual(panelStore.debugPanel);
  });

  it('currentTool returns current tool index', () => {
    expect(store.currentTool).toBe(0);
  });

  it('currentFg returns fg color', () => {
    expect(store.currentFg).toBe(0);
  });

  it('currentBg returns bg color', () => {
    expect(store.currentBg).toBe(1);
  });

  it('currentChar returns selected char', () => {
    expect(store.currentChar).toBe(' ');
  });

  it('currentTab returns current tab index', () => {
    expect(store.currentTab).toBe(0);
  });

  it('currentAscii returns current ASCII metadata', () => {
    expect(store.currentAscii.title).toBe('Test');
  });

  it('currentAsciiLayers decompresses layers correctly', () => {
    const layers = store.currentAsciiLayers;
    expect(layers).toHaveLength(1);
    expect(layers[0].width).toBe(3);
    expect(layers[0].height).toBe(3);
  });

  it('currentAsciiLayersWidthHeight returns dimensions', () => {
    const dims = store.currentAsciiLayersWidthHeight;
    expect(dims).toEqual({ width: 3, height: 3 });
  });

  it('selectedLayer returns selected layer index', () => {
    expect(store.selectedLayer).toBe(0);
  });

  it('asciibirdMeta returns full meta array', () => {
    expect(store.asciibirdMeta).toHaveLength(1);
  });

  it('brushSizeHeight returns height', () => {
    expect(store.brushSizeHeight).toBe(1);
  });

  it('brushSizeWidth returns width', () => {
    expect(store.brushSizeWidth).toBe(1);
  });

  it('brushSizeType returns type', () => {
    expect(store.brushSizeType).toBe('square');
  });

  it('blockSizeMultiplier returns multiplier', () => {
    expect(store.blockSizeMultiplier).toBe(1);
  });

  it('brushHistory returns history array', () => {
    expect(store.brushHistory).toEqual([]);
  });

  it('brushLibrary returns library array', () => {
    expect(store.brushLibrary).toEqual([]);
  });

  it('isKeyboardDisabled returns disabled state', () => {
    expect(modalStore.isKeyboardDisabled).toBe(false);
  });

  it('isModalOpen returns false when all closed', () => {
    expect(modalStore.isModalOpen).toBe(false);
  });

  it('isModalOpen returns true when any open', () => {
    modalStore.openModal('help');
    expect(modalStore.isModalOpen).toBe(true);
  });

  it('brushBlocks decompresses brush data', () => {
    const blocks: Block[][] = [[{ fg: 1, bg: 2, char: 'X' }]];
    store._brushBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
    expect(store.brushBlocks).toEqual(blocks);
  });

  it('selectBlocks decompresses selection data', () => {
    const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'Y' }]];
    store._selectBlocks = LZString.compressToUTF16(JSON.stringify(blocks));
    expect(store.selectBlocks).toEqual(blocks);
  });

  it('currentAscii returns false when no tabs', () => {
    store.closeTab(0);
    expect(store.currentAscii).toBe(false);
  });

  it('currentAsciiLayers returns empty array when no tabs', () => {
    store.closeTab(0);
    expect(store.currentAsciiLayers).toEqual([]);
  });

  it('currentAsciiLayersWidthHeight returns 0x0 when no tabs', () => {
    store.closeTab(0);
    expect(store.currentAsciiLayersWidthHeight).toEqual({
      width: 0, height: 0,
    });
  });

  it('imageOverlay returns overlay settings', () => {
    const overlay = store.imageOverlay;
    expect(overlay.opacity).toBe(95);
    expect(overlay.visible).toBe(false);
  });

  it('tabsVisible returns tabs visibility', () => {
    expect(desktopStore.tabsVisible).toBe(true);
  });

  it('menuBarVisible returns menu visibility', () => {
    expect(desktopStore.menuBarVisible).toBe(true);
  });

  it('isTargettingFg returns targeting fg state', () => {
    expect(store.isTargettingFg).toBe(true);
  });

  it('isTargettingBg returns targeting bg state', () => {
    expect(store.isTargettingBg).toBe(true);
  });

  it('isTargettingChar returns targeting char state', () => {
    expect(store.isTargettingChar).toBe(true);
  });

  it('brushLibraryState returns brush library panel state', () => {
    expect(panelStore.brushLibrary.visible).toBe(true);
  });

  it('brushPreviewState returns brush preview panel state', () => {
    expect(panelStore.brushPreview.visible).toBe(true);
  });

  it('layersLibraryState returns layers panel state', () => {
    expect(panelStore.layersLibrary.visible).toBe(true);
  });

  it('persistCharPanel returns char panel persistence', () => {
    expect(store.toolbarState.persistCharPanel).toBe(false);
  });
});

// ─── Async Actions ────────────────────────────────────────────────

describe('Pinia Store Async Actions', () => {
  let store: ReturnType<typeof useAsciiBirdStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAsciiBirdStore();
    store.newAsciibirdMeta(createTestMeta());
  });

  describe('updateAsciiBlocksAsync', () => {
    it('calls updateAsciiBlocks and resolves', async () => {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      const blocks = layers[0].data;
      blocks[0][0] = { fg: 4, bg: 1, char: 'X' };

      await store.updateAsciiBlocksAsync({
        diff: {
          new: [{ x: 0, y: 0, b: { fg: 4, bg: 1, char: 'X' } }],
          old: [{ x: 0, y: 0, b: {} }],
        },
        blocks,
      });

      expect(store.asciibirdMeta[0].history).toHaveLength(1);
    });
  });
});
