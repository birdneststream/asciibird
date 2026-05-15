// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
import { useToolbarStore } from '@/store/toolbar';
import { findNextVisibleLayer } from '@/utils/layers';
import type { Block, Layer, AsciibirdMeta, Options } from '@/types';

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
    x: 236,
    y: 56,
  };
}

// ─── Actions (former mutations) ─────────────────────────────────────

describe('Pinia Store Actions', () => {
  let store: ReturnType<typeof useAsciiBirdStore>;
  let modalStore: ReturnType<typeof useModalStore>;
  let desktopStore: ReturnType<typeof useDesktopStore>;
  let panelStore: ReturnType<typeof usePanelStore>;
  let toolbarStore: ReturnType<typeof useToolbarStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAsciiBirdStore();
    modalStore = useModalStore();
    desktopStore = useDesktopStore();
    panelStore = usePanelStore();
    toolbarStore = useToolbarStore();
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
        ircOverlay: false,
      };
      store.updateOptions(newOptions);
      expect(store.options).toEqual(newOptions);
    });

    it('defaults ircOverlay to true when not provided', () => {
      const partial = {
        defaultBg: 5, defaultFg: 3, renderOffScreen: true,
        undoLimit: 100, brushLimit: 200, tabLimit: 5, fps: 60,
      };
      store.updateOptions(partial as Options);
      expect(store.options.ircOverlay).toBe(true);
    });
  });

  describe('changeTab', () => {
    it('changes active tab', () => {
      store.newAsciibirdMeta(createTestMeta('Second'));
      store.changeTab(0);
      expect(store.tab).toBe(0);
    });
  });

  // ── Color and char actions (now in useToolbarStore) ──────────

  describe('changeColourFg', () => {
    it('updates fg color and resets flags', () => {
      toolbarStore.toolbarState.isUpdating = true;
      toolbarStore.toolbarState.isChoosingFg = true;
      toolbarStore.changeColourFg(4);
      expect(toolbarStore.toolbarState.currentColourFg).toBe(4);
      expect(toolbarStore.toolbarState.isUpdating).toBe(false);
      expect(toolbarStore.toolbarState.isChoosingFg).toBe(false);
    });
  });

  describe('changeColourBg', () => {
    it('updates bg color and resets flags', () => {
      toolbarStore.changeColourBg(7);
      expect(toolbarStore.toolbarState.currentColourBg).toBe(7);
      expect(toolbarStore.toolbarState.isUpdating).toBe(false);
    });
  });

  describe('changeChar', () => {
    it('updates selected char and resets isUpdating', () => {
      toolbarStore.changeChar('X');
      expect(toolbarStore.toolbarState.selectedChar).toBe('X');
      expect(toolbarStore.toolbarState.isUpdating).toBe(false);
    });

    it('closes char panel when persistCharPanel is false', () => {
      toolbarStore.toolbarState.persistCharPanel = false;
      toolbarStore.toolbarState.isChoosingChar = true;
      toolbarStore.changeChar('Y');
      expect(toolbarStore.toolbarState.isChoosingChar).toBe(false);
    });

    it('keeps char panel open when persistCharPanel is true', () => {
      toolbarStore.toolbarState.persistCharPanel = true;
      toolbarStore.toolbarState.isChoosingChar = true;
      toolbarStore.changeChar('Z');
      expect(toolbarStore.toolbarState.isChoosingChar).toBe(true);
    });
  });

  describe('changeTool', () => {
    it('updates current tool', () => {
      toolbarStore.changeTool(3);
      expect(toolbarStore.toolbarState.currentTool).toBe(3);
    });
  });

  describe('persistCharPanel', () => {
    it('toggles char panel persistence', () => {
      toolbarStore.toolbarState.persistCharPanel = true;
      expect(toolbarStore.toolbarState.persistCharPanel).toBe(true);
    });
  });

  // ── Targeting actions (now in useToolbarStore) ───────────────

  describe('targeting actions', () => {
    it('changeTargetingFg', () => {
      toolbarStore.changeTargetingFg(false);
      expect(toolbarStore.toolbarState.targetingFg).toBe(false);
    });

    it('changeTargetingBg', () => {
      toolbarStore.changeTargetingBg(false);
      expect(toolbarStore.toolbarState.targetingBg).toBe(false);
    });

    it('changeTargetingChar', () => {
      toolbarStore.changeTargetingChar(false);
      expect(toolbarStore.toolbarState.targetingChar).toBe(false);
    });

    it('changeIsUpdatingFg', () => {
      toolbarStore.changeIsUpdatingFg(true);
      expect(toolbarStore.toolbarState.isChoosingFg).toBe(true);
    });

    it('changeIsUpdatingBg', () => {
      toolbarStore.changeIsUpdatingBg(true);
      expect(toolbarStore.toolbarState.isChoosingBg).toBe(true);
    });

    it('changeIsUpdatingChar', () => {
      toolbarStore.changeIsUpdatingChar(true);
      expect(toolbarStore.toolbarState.isChoosingChar).toBe(true);
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

  // ── Panel state (now in usePanelStore) ────────────────────────

  describe('panel state actions', () => {
    it('toggleDebugPanel', () => {
      panelStore.toggleDebugPanel(true);
      expect(panelStore.debugPanel.visible).toBe(true);
    });

    it('changeDebugPanelState', () => {
      const newState = { x: 10, y: 20, h: 30, w: 40, visible: true, minimized: false };
      panelStore.changeDebugPanelState(newState);
      expect(panelStore.debugPanel).toEqual(newState);
    });

    it('toggleBrushLibrary', () => {
      panelStore.toggleBrushLibrary(false);
      expect(panelStore.brushLibrary.visible).toBe(false);
    });

    it('changeBrushLibraryState', () => {
      const newState = {
        x: 10, y: 20, h: 30, w: 40, visible: false, minimized: false, tab: 1,
      };
      panelStore.changeBrushLibraryState(newState);
      expect(panelStore.brushLibrary).toEqual(newState);
    });

    it('changeBrushPreviewState', () => {
      const newState = { x: 1, y: 2, h: 3, w: 4, visible: false, minimized: false };
      panelStore.changeBrushPreviewState(newState);
      expect(panelStore.brushPreview).toEqual(newState);
    });

    it('changeLayersLibraryState', () => {
      const newState = { x: 5, y: 6, h: 7, w: 8, visible: true, minimized: false };
      panelStore.changeLayersLibraryState(newState);
      expect(panelStore.layersLibrary).toEqual(newState);
    });

    it('minimizePanel sets minimized true and visible true', () => {
      panelStore.minimizePanel('brushPreview');
      expect(panelStore.brushPreview.minimized).toBe(true);
      expect(panelStore.brushPreview.visible).toBe(true);
    });

    it('restorePanel clears minimized and keeps visible', () => {
      panelStore.minimizePanel('layersLibrary');
      panelStore.restorePanel('layersLibrary');
      expect(panelStore.layersLibrary.minimized).toBe(false);
      expect(panelStore.layersLibrary.visible).toBe(true);
    });

    it('togglePanelMinimize toggles between minimized and restored', () => {
      // debugPanel starts with visible=false, so set visible first
      panelStore.toggleDebugPanel(true);
      expect(panelStore.debugPanel.minimized).toBe(false);
      panelStore.togglePanelMinimize('debugPanel');
      expect(panelStore.debugPanel.minimized).toBe(true);
      panelStore.togglePanelMinimize('debugPanel');
      expect(panelStore.debugPanel.minimized).toBe(false);
    });

    it('togglePanelMinimize restores hidden panel to visible', () => {
      // Start with hidden panel (visible=false)
      expect(panelStore.brushPreview.visible).toBe(true);
      panelStore.brushPreview.visible = false;
      panelStore.brushPreview.minimized = false;
      // Toggle should restore hidden panel
      panelStore.togglePanelMinimize('brushPreview');
      expect(panelStore.brushPreview.visible).toBe(true);
      expect(panelStore.brushPreview.minimized).toBe(false);
    });

    it('resetPanelPosition resets x/y to initial defaults', () => {
      panelStore.brushPreview.x = 9999;
      panelStore.brushPreview.y = 8888;
      panelStore.resetPanelPosition('brushPreview');
      expect(panelStore.brushPreview.x).not.toBe(9999);
      expect(panelStore.brushPreview.y).not.toBe(8888);
    });

    it('changeToolBarState', () => {
      toolbarStore.changeToolBarState({
        x: 10, y: 20, h: 30, w: 40, visible: false, minimized: false,
      });
      expect(toolbarStore.toolbarState.x).toBe(10);
      expect(toolbarStore.toolbarState.y).toBe(20);
      expect(toolbarStore.toolbarState.visible).toBe(false);
    });

    it('changeToolBarDraggable', () => {
      toolbarStore.changeToolBarDraggable(false);
      expect(toolbarStore.toolbarState.draggable).toBe(false);
    });

    it('minimizeToolbar sets minimized true and visible true', () => {
      toolbarStore.minimizeToolbar();
      expect(toolbarStore.toolbarState.minimized).toBe(true);
      expect(toolbarStore.toolbarState.visible).toBe(true);
    });

    it('restoreToolbar clears minimized and keeps visible', () => {
      toolbarStore.minimizeToolbar();
      toolbarStore.restoreToolbar();
      expect(toolbarStore.toolbarState.minimized).toBe(false);
      expect(toolbarStore.toolbarState.visible).toBe(true);
    });

    it('toggleToolbarMinimize toggles between minimized and restored', () => {
      expect(toolbarStore.toolbarState.minimized).toBe(false);
      toolbarStore.toggleToolbarMinimize();
      expect(toolbarStore.toolbarState.minimized).toBe(true);
      toolbarStore.toggleToolbarMinimize();
      expect(toolbarStore.toolbarState.minimized).toBe(false);
    });

    it('toggleToolbarMinimize restores hidden toolbar to visible', () => {
      toolbarStore.toolbarState.visible = false;
      toolbarStore.toolbarState.minimized = false;
      toolbarStore.toggleToolbarMinimize();
      expect(toolbarStore.toolbarState.visible).toBe(true);
      expect(toolbarStore.toolbarState.minimized).toBe(false);
    });

    it('resetToolbarPosition resets x/y to defaults', () => {
      toolbarStore.toolbarState.x = 999;
      toolbarStore.toolbarState.y = 888;
      toolbarStore.resetToolbarPosition();
      expect(toolbarStore.toolbarState.x).toBe(8);
      expect(toolbarStore.toolbarState.y).toBe(56);
    });

    it('updateMirror', () => {
      toolbarStore.updateMirror({ x: true, y: true });
      expect(toolbarStore.toolbarState.mirrorX).toBe(true);
      expect(toolbarStore.toolbarState.mirrorY).toBe(true);
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

    describe('toggleLayer', () => {
      it('toggles visibility', () => {
        store.toggleLayer(0);
        const layers = JSON.parse(
          LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
        );
        expect(layers[0].visible).toBe(false);
      });

      it('hiding non-selected layer does not change selectedLayer', () => {
        store.addLayer();
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        store.toggleLayer(0);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
      });

      it('hiding selected layer auto-selects next visible layer', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers: 0, 1, 2. Select layer 1.
        store.changeLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        store.toggleLayer(1);
        // Should auto-select layer 2 (next visible forward)
        expect(store.asciibirdMeta[0].selectedLayer).toBe(2);
      });

      it('hiding selected layer falls back to previous visible layer', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers. Hide layer 2, then select layer 1.
        store.toggleLayer(2);
        store.changeLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        // Hide layer 1 — layer 2 is already hidden, so fall back to 0
        store.toggleLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
      });

      it('hiding selected layer skips hidden layers in forward search', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers. Hide layer 1.
        store.toggleLayer(1);
        store.changeLayer(0);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
        // Hide layer 0 — forward search skips hidden layer 1, finds layer 2
        store.toggleLayer(0);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(2);
      });

      it('hiding last visible layer keeps selection when no other visible', () => {
        // Only 1 layer exists
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
        store.toggleLayer(0);
        // No other visible layer to select, so keep at 0
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
      });

      it('showing a hidden layer does not change selectedLayer', () => {
        store.addLayer();
        store.toggleLayer(0);
        store.changeLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        // Show layer 0 — selectedLayer should stay at 1
        store.toggleLayer(0);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
      });
    });

    describe('removeLayer', () => {
      it('removes a layer when more than 1 exist', () => {
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

      it('does nothing when only 1 layer exists', () => {
        store.removeLayer(0);
        const layers = JSON.parse(
          LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
        );
        expect(layers).toHaveLength(1); // Should not remove last layer
      });

      it('auto-selects next visible layer when removing selected', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers. Select layer 1.
        store.changeLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        store.removeLayer(1);
        // Should auto-select layer 1 (was layer 2, now shifted)
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
      });

      it('auto-selects previous visible when no forward visible exists', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers. Hide layer 2, select layer 1.
        store.toggleLayer(2);
        store.changeLayer(1);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
        store.removeLayer(1);
        // Layer 2 was hidden, so fall back to layer 0
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
      });

      it('skips hidden layers in forward search after removal', () => {
        store.addLayer();
        store.addLayer();
        // 3 layers. Hide layer 1, select layer 0.
        store.toggleLayer(1);
        store.changeLayer(0);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
        store.removeLayer(0);
        // After removing layer 0, only layers [1,2] remain.
        // Layer 1 (was index 1) is hidden, so select layer 2 (was index 2).
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
      });

      it('adjusts selectedLayer when removing layer below selection', () => {
        store.addLayer();
        store.addLayer();
        store.changeLayer(2);
        expect(store.asciibirdMeta[0].selectedLayer).toBe(2);
        store.removeLayer(0);
        // Removed layer 0, so layer 2 becomes layer 1
        expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
      });
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

    it('mergeLayerDown merges selected into layer below', () => {
      store.addLayer();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      // Content on layer 1 (upper, selected by default after add)
      layers[1].data[0][0] = { fg: 5, bg: 2, char: 'X' };
      // Content on layer 0 (lower)
      layers[0].data[0][0] = { fg: 0, bg: 1, char: 'A' };
      store.changeAsciiWidthHeight({ layers });
      store.changeLayer(1);

      store.mergeLayerDown();

      const mergedLayers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(mergedLayers).toHaveLength(1);
      // Upper block (X) should win over lower (A)
      expect(mergedLayers[0].data[0][0].char).toBe('X');
      expect(store.asciibirdMeta[0].selectedLayer).toBe(0);
    });

    it('mergeLayerDown does nothing on layer 0', () => {
      store.addLayer();
      store.changeLayer(0);
      const before = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      store.mergeLayerDown();
      const after = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(after).toHaveLength(before.length);
    });

    it('duplicateLayer creates a copy above selected', () => {
      store.addLayer();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      layers[1].data[0][0] = { fg: 5, bg: 2, char: 'D' };
      layers[1].label = 'Original';
      store.changeAsciiWidthHeight({ layers });
      store.changeLayer(1);

      store.duplicateLayer();

      const after = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      expect(after).toHaveLength(3);
      // The copy should be at index 1 (above original)
      expect(after[1].label).toBe('Original (Copy)');
      expect(after[1].data[0][0].char).toBe('D');
      // Original shifted to index 2
      expect(after[2].label).toBe('Original');
      // Selected stays at index 1 (the new copy)
      expect(store.asciibirdMeta[0].selectedLayer).toBe(1);
    });

    it('duplicateLayer copy is independent', () => {
      store.addLayer();
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      layers[1].data[0][0] = { fg: 5, char: 'T' };
      store.changeAsciiWidthHeight({ layers });
      store.changeLayer(1);

      store.duplicateLayer();

      const after = JSON.parse(
        LZString.decompressFromUTF16(store.asciibirdMeta[0].layers),
      );
      // Mutate copy
      after[1].data[0][0].char = 'Z';
      // Original should be unchanged
      expect(after[2].data[0][0].char).toBe('T');
    });
  });

  // ── findNextVisibleLayer utility ─────────────────────────────

  describe('findNextVisibleLayer', () => {
    it('returns -1 when no layers are visible', () => {
      const layers: Layer[] = [
        { label: 'A', visible: false, width: 1, height: 1, data: [] },
        { label: 'B', visible: false, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 0)).toBe(-1);
    });

    it('finds next visible layer in forward direction', () => {
      const layers: Layer[] = [
        { label: 'A', visible: false, width: 1, height: 1, data: [] },
        { label: 'B', visible: true, width: 1, height: 1, data: [] },
        { label: 'C', visible: true, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 0)).toBe(1);
    });

    it('finds previous visible layer when none forward', () => {
      const layers: Layer[] = [
        { label: 'A', visible: true, width: 1, height: 1, data: [] },
        { label: 'B', visible: false, width: 1, height: 1, data: [] },
        { label: 'C', visible: false, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 2)).toBe(0);
    });

    it('skips hidden layers in forward search', () => {
      const layers: Layer[] = [
        { label: 'A', visible: false, width: 1, height: 1, data: [] },
        { label: 'B', visible: false, width: 1, height: 1, data: [] },
        { label: 'C', visible: true, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 0)).toBe(2);
    });

    it('skips hidden layers in backward search', () => {
      const layers: Layer[] = [
        { label: 'A', visible: true, width: 1, height: 1, data: [] },
        { label: 'B', visible: false, width: 1, height: 1, data: [] },
        { label: 'C', visible: false, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 1)).toBe(0);
    });

    it('prefers forward over backward when both have visible layers', () => {
      const layers: Layer[] = [
        { label: 'A', visible: true, width: 1, height: 1, data: [] },
        { label: 'B', visible: false, width: 1, height: 1, data: [] },
        { label: 'C', visible: true, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 1)).toBe(2);
    });

    it('returns same index when it is visible', () => {
      const layers: Layer[] = [
        { label: 'A', visible: false, width: 1, height: 1, data: [] },
        { label: 'B', visible: true, width: 1, height: 1, data: [] },
        { label: 'C', visible: false, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 1)).toBe(1);
    });

    it('handles single visible layer', () => {
      const layers: Layer[] = [
        { label: 'A', visible: false, width: 1, height: 1, data: [] },
        { label: 'B', visible: true, width: 1, height: 1, data: [] },
      ];
      expect(findNextVisibleLayer(layers, 0)).toBe(1);
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

  // ── Brush actions (now in useToolbarStore) ──────────────────

  describe('brush actions', () => {
    it('updateBrushSize updates brush dimensions', () => {
      toolbarStore.updateBrushSize({
        brushSizeHeight: 5,
        brushSizeWidth: 3,
        brushSizeType: 'circle',
      });
      expect(toolbarStore.toolbarState.brushSizeHeight).toBe(5);
      expect(toolbarStore.toolbarState.brushSizeWidth).toBe(3);
      expect(toolbarStore.toolbarState.brushSizeType).toBe('circle');
    });

    it('brushBlocks compresses and stores brush data', () => {
      const blocks: Block[][] = [[{ fg: 1, bg: 2, char: 'A' }]];
      toolbarStore._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      );
      const restored = JSON.parse(
        LZString.decompressFromUTF16(toolbarStore._brushBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('selectBlocks compresses and stores selection data', () => {
      const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'B' }]];
      toolbarStore._selectBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      );
      const restored = JSON.parse(
        LZString.decompressFromUTF16(toolbarStore._selectBlocks),
      );
      expect(restored).toEqual(blocks);
    });

    it('toggleGridView toggles grid', () => {
      toolbarStore.toggleGridView(true);
      expect(toolbarStore.toolbarState.gridView).toBe(true);
    });

    it('toggleHalfBlockEditing toggles half-block mode', () => {
      toolbarStore.toggleHalfBlockEditing(true);
      expect(toolbarStore.toolbarState.halfBlockEditing).toBe(true);
    });

    it('toggleUpdateBrush toggles brush update flag', () => {
      toolbarStore.toggleUpdateBrush(false);
      expect(toolbarStore.toolbarState.updateBrush).toBe(false);
    });

    it('transformBrush flips brush blocks vertically', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }],
        [{ fg: 2, bg: 0, char: 'B' }],
      ];
      toolbarStore._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      );
      toolbarStore.transformBrush({ type: 'flip-v' });
      const flipped = JSON.parse(
        LZString.decompressFromUTF16(toolbarStore._brushBlocks),
      );
      expect(flipped[0][0].char).toBe('B');
      expect(flipped[1][0].char).toBe('A');
    });

    it('transformBrush flips brush blocks horizontally', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }, { fg: 2, bg: 0, char: 'B' }],
      ];
      toolbarStore._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      );
      toolbarStore.transformBrush({ type: 'flip-h' });
      const rotated = JSON.parse(
        LZString.decompressFromUTF16(toolbarStore._brushBlocks),
      );
      expect(rotated[0][0].char).toBe('B');
      expect(rotated[0][1].char).toBe('A');
    });

    it('transformBrush rotates brush blocks 90° CW', () => {
      const blocks: Block[][] = [
        [{ fg: 1, bg: 0, char: 'A' }, { fg: 2, bg: 0, char: 'B' }],
        [{ fg: 3, bg: 0, char: 'C' }, { fg: 4, bg: 0, char: 'D' }],
      ];
      toolbarStore._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      );
      toolbarStore.transformBrush({ type: 'rotate-cw' });
      const rotated = JSON.parse(
        LZString.decompressFromUTF16(toolbarStore._brushBlocks),
      );
      expect(rotated[0][0].char).toBe('C');
      expect(rotated[0][1].char).toBe('A');
      expect(rotated[1][0].char).toBe('D');
      expect(rotated[1][1].char).toBe('B');
    });

    it('transformBrush does nothing on empty brush', () => {
      toolbarStore._brushBlocks = '';
      toolbarStore.transformBrush({ type: 'flip-h' });
      expect(toolbarStore._brushBlocks).toBe('');
    });
  });

  // ── Brush library/history actions (now in useToolbarStore) ──

  describe('brush library actions', () => {
    const blocks1: Block[][] = [[{ fg: 1, bg: 0, char: 'A' }]];
    const blocks2: Block[][] = [[{ fg: 2, bg: 0, char: 'B' }]];

    it('pushBrushHistory adds to history', () => {
      toolbarStore.pushBrushHistory(blocks1);
      expect(toolbarStore.brushHistory).toHaveLength(1);
      expect(toolbarStore.brushHistory[0].hash).toBe(
        cyrb53(JSON.stringify(blocks1)),
      );
    });

    it('pushBrushHistory removes duplicates', () => {
      toolbarStore.pushBrushHistory(blocks1);
      toolbarStore.pushBrushHistory(blocks1);
      expect(toolbarStore.brushHistory).toHaveLength(1);
    });

    it('pushBrushHistory respects brushLimit', () => {
      for (let i = 0; i <= store.options.brushLimit; i++) {
        toolbarStore.pushBrushHistory([[{
          fg: i, bg: 0, char: String(i),
        }]]);
      }
      expect(toolbarStore.brushHistory.length)
        .toBeLessThanOrEqual(store.options.brushLimit);
    });

    it('pushBrushLibrary adds to library', () => {
      toolbarStore.pushBrushLibrary(blocks1);
      expect(toolbarStore.brushLibrary).toHaveLength(1);
    });

    it('pushBrushLibrary removes duplicates', () => {
      toolbarStore.pushBrushLibrary(blocks1);
      toolbarStore.pushBrushLibrary(blocks1);
      expect(toolbarStore.brushLibrary).toHaveLength(1);
    });

    it('removeBrushLibrary removes by hash', () => {
      toolbarStore.pushBrushLibrary(blocks1);
      toolbarStore.pushBrushLibrary(blocks2);
      toolbarStore.removeBrushLibrary(blocks1);
      expect(toolbarStore.brushLibrary).toHaveLength(1);
    });

    it('removeBrushHistory removes by hash', () => {
      toolbarStore.pushBrushHistory(blocks1);
      toolbarStore.pushBrushHistory(blocks2);
      toolbarStore.removeBrushHistory(blocks1);
      expect(toolbarStore.brushHistory).toHaveLength(1);
    });

    it('upBrush swaps brush up', () => {
      toolbarStore.pushBrushLibrary(blocks1);
      toolbarStore.pushBrushLibrary(blocks2);
      toolbarStore.upBrush(1);
      const hash0 = toolbarStore.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });

    it('downBrush swaps brush down', () => {
      toolbarStore.pushBrushLibrary(blocks1);
      toolbarStore.pushBrushLibrary(blocks2);
      toolbarStore.downBrush(0);
      const hash0 = toolbarStore.brushLibrary[0].hash;
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

  // ── Toolbar state (now in useToolbarStore) ──────────────────

  describe('updateToolBarState', () => {
    it('replaces entire toolbar state', () => {
      const newToolbar = {
        ...toolbarStore.toolbarState,
        currentTool: 5,
      };
      toolbarStore.updateToolBarState(newToolbar);
      expect(toolbarStore.toolbarState.currentTool).toBe(5);
    });
  });
});

// ─── Getters ────────────────────────────────────────────────────────

describe('Pinia Store Getters', () => {
  let store: ReturnType<typeof useAsciiBirdStore>;
  let modalStore: ReturnType<typeof useModalStore>;
  let desktopStore: ReturnType<typeof useDesktopStore>;
  let panelStore: ReturnType<typeof usePanelStore>;
  let toolbarStore: ReturnType<typeof useToolbarStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAsciiBirdStore();
    modalStore = useModalStore();
    desktopStore = useDesktopStore();
    panelStore = usePanelStore();
    toolbarStore = useToolbarStore();
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
    expect(toolbarStore.toolbarState)
      .toEqual(toolbarStore.$state.toolbarState);
  });

  it('debugPanel returns debug panel state', () => {
    expect(panelStore.debugPanel).toEqual(panelStore.$state.debugPanel);
  });

  it('currentTool returns current tool index', () => {
    expect(toolbarStore.currentTool).toBe(0);
  });

  it('currentFg returns fg color', () => {
    expect(toolbarStore.currentFg).toBe(0);
  });

  it('currentBg returns bg color', () => {
    expect(toolbarStore.currentBg).toBe(1);
  });

  it('currentChar returns selected char', () => {
    expect(toolbarStore.currentChar).toBe(' ');
  });

  it('currentTab returns current tab index', () => {
    expect(store.currentTab).toBe(0);
  });

  it('currentAscii returns current ASCII metadata', () => {
    const ascii = store.currentAscii;
    expect(ascii).not.toBe(false);
    if (ascii) expect(ascii.title).toBe('Test');
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
    expect(toolbarStore.brushSizeHeight).toBe(1);
  });

  it('brushSizeWidth returns width', () => {
    expect(toolbarStore.brushSizeWidth).toBe(1);
  });

  it('brushSizeType returns type', () => {
    expect(toolbarStore.brushSizeType).toBe('square');
  });

  it('blockSizeMultiplier returns multiplier', () => {
    expect(store.blockSizeMultiplier).toBe(1);
  });

  describe('setBlockMultiplier', () => {
    afterEach(() => {
      store.setBlockMultiplier(1);
    });

    it('sets multiplier within valid range', () => {
      store.setBlockMultiplier(2);
      expect(store.blockSizeMultiplier).toBe(2);
    });

    it('clamps below minimum (0.5)', () => {
      store.setBlockMultiplier(0.25);
      expect(store.blockSizeMultiplier).toBe(0.5);
    });

    it('clamps above maximum (4)', () => {
      store.setBlockMultiplier(5);
      expect(store.blockSizeMultiplier).toBe(4);
    });

    it('accepts minimum boundary value', () => {
      store.setBlockMultiplier(0.5);
      expect(store.blockSizeMultiplier).toBe(0.5);
    });

    it('accepts maximum boundary value', () => {
      store.setBlockMultiplier(4);
      expect(store.blockSizeMultiplier).toBe(4);
    });

    it('resets to 1', () => {
      store.setBlockMultiplier(3);
      store.setBlockMultiplier(1);
      expect(store.blockSizeMultiplier).toBe(1);
    });
  });

  it('brushHistory returns history array', () => {
    expect(toolbarStore.brushHistory).toEqual([]);
  });

  it('brushLibrary returns library array', () => {
    expect(toolbarStore.brushLibrary).toEqual([]);
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
    toolbarStore._brushBlocks = LZString.compressToUTF16(
      JSON.stringify(blocks),
    );
    expect(toolbarStore.brushBlocks).toEqual(blocks);
  });

  it('selectBlocks decompresses selection data', () => {
    const blocks: Block[][] = [[{ fg: 3, bg: 4, char: 'Y' }]];
    toolbarStore._selectBlocks = LZString.compressToUTF16(
      JSON.stringify(blocks),
    );
    expect(toolbarStore.selectBlocks).toEqual(blocks);
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
    expect(toolbarStore.isTargettingFg).toBe(true);
  });

  it('isTargettingBg returns targeting bg state', () => {
    expect(toolbarStore.isTargettingBg).toBe(true);
  });

  it('isTargettingChar returns targeting char state', () => {
    expect(toolbarStore.isTargettingChar).toBe(true);
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
    expect(toolbarStore.toolbarState.persistCharPanel).toBe(false);
  });
});

// ─── Async Actions (removed — updateAsciiBlocksAsync was dead code) ───
