// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import LZString from 'lz-string';
import {
  create2DArray,
  emptyBlock,
  blockWidth,
  blockHeight,
  cyrb53,
  getBlocksWidth,
} from '@/ascii';
import type { Block, Layer, AsciibirdMeta, Options } from '@/types';
import type { RootState } from '@/types/store';

Vue.use(Vuex);

// ─── Helper: create a fresh store instance for each test ──────────────

// We need to recreate the store module for each test since Vuex mutates state.
// We can't import the real store directly because setStore creates a circular
// dependency (store imports ascii, ascii imports store via setStore).
//
// TODO (Phase 4): Extract store options (state factory, mutations, getters,
// actions) into src/store/definitions.ts so both real store and tests import
// from the same source. This eliminates ~700 lines of duplication and ensures
// tests validate actual production code.

function createTestStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    state: {
      ver: 1,
      modalState: {
        newAscii: false,
        editAscii: false,
        pasteAscii: false,
        options: false,
        overlay: false,
        about: false,
        help: false,
      },
      isKeyboardDisabled: false,
      options: {
        defaultBg: 1,
        defaultFg: 0,
        renderOffScreen: false,
        undoLimit: 50,
        brushLimit: 50,
        tabLimit: 12,
        fps: 50,
      },
      tab: 0,
      desktopState: {
        menuBarVisible: true,
        tabsVisible: true,
      },
      asciibirdMeta: [] as AsciibirdMeta[],
      toolbarState: {
        currentColourFg: 0,
        currentColourBg: 1,
        isChoosingFg: false,
        isChoosingBg: false,
        isChoosingChar: false,
        persistCharPanel: false,
        brushSizeWidth: 1,
        brushSizeHeight: 1,
        brushSizeType: 'square',
        selectedFg: 0,
        selectedBg: 1,
        selectedChar: ' ',
        isUpdating: false,
        currentTool: 0,
        targetingFg: true,
        targetingBg: true,
        targetingChar: true,
        mirrorX: false,
        mirrorY: false,
        x: blockWidth * 2,
        y: blockHeight * 2,
        h: blockHeight * 19,
        w: blockWidth * 25,
        draggable: true,
        updateBrush: true,
        gridView: false,
        visible: true,
        halfBlockEditing: false,
      },
      debugPanelState: {
        x: blockWidth * 40,
        y: blockHeight * 20,
        h: blockHeight * 20,
        w: blockWidth * 40,
        visible: false,
      },
      blockSizeMultiplier: 1,
      brushBlocks: '',
      brushHistory: [],
      selectBlocks: '',
      brushLibrary: [],
      brushLibraryState: {
        x: blockWidth * 130,
        y: blockHeight * 23,
        h: blockHeight * 25,
        w: blockWidth * 35,
        visible: true,
        tab: 0,
      },
      brushPreviewState: {
        x: blockWidth * 2,
        y: blockHeight * 22,
        h: blockHeight * 19,
        w: blockWidth * 25,
        visible: true,
      },
      layersLibraryState: {
        x: blockWidth * 130,
        y: blockHeight * 2,
        h: blockHeight * 19,
        w: blockWidth * 35,
        visible: true,
      },
    },
    mutations: {
      changeState(state, payload: Partial<RootState>) {
        Object.assign(state, payload);
      },
      updateOptions(state, payload: Options) {
        state.options = { ...payload };
      },
      changeTab(state, payload: number) {
        state.tab = payload;
        document.title = `asciibird - ${state.asciibirdMeta[payload].title}`;
      },
      updateImageOverlay(state, payload: AsciibirdMeta['imageOverlay']) {
        state.asciibirdMeta[state.tab].imageOverlay = payload;
      },
      changeDebugPanelState(state, payload) {
        state.debugPanelState = payload;
      },
      toggleDebugPanel(state, payload: boolean) {
        state.debugPanelState.visible = payload;
      },
      changeBrushLibraryState(state, payload) {
        state.brushLibraryState = payload;
      },
      changeBrushPreviewState(state, payload) {
        state.brushPreviewState = payload;
      },
      toggleBrushLibrary(state, payload: boolean) {
        state.brushLibraryState.visible = payload;
      },
      changeToolBarState(state, payload) {
        state.toolbarState.x = payload.x;
        state.toolbarState.y = payload.y;
        state.toolbarState.w = payload.w;
        state.toolbarState.h = payload.h;
        state.toolbarState.visible = payload.visible;
      },
      changeToolBarDraggable(state, payload: boolean) {
        state.toolbarState.draggable = payload;
      },
      changeLayersLibraryState(state, payload) {
        state.layersLibraryState = payload;
      },
      changeAsciiWidthHeight(state, payload: { layers: Layer[] }) {
        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(payload.layers),
        );
      },
      changeAsciiCanvasState(state, payload: { x: number; y: number }) {
        state.asciibirdMeta[state.tab].x = payload.x;
        state.asciibirdMeta[state.tab].y = payload.y;
      },
      changeColourFg(state, payload: number) {
        state.toolbarState.currentColourFg = payload;
        state.toolbarState.isUpdating = false;
        state.toolbarState.isChoosingFg = false;
      },
      changeColourBg(state, payload: number) {
        state.toolbarState.currentColourBg = payload;
        state.toolbarState.isUpdating = false;
        state.toolbarState.isChoosingBg = false;
      },
      changeChar(state, payload: string) {
        state.toolbarState.selectedChar = payload;
        state.toolbarState.isUpdating = false;
        if (!state.toolbarState.persistCharPanel) {
          state.toolbarState.isChoosingChar = false;
        }
      },
      changeTool(state, payload: number) {
        state.toolbarState.currentTool = payload;
      },
      persistCharPanel(state, payload: boolean) {
        state.toolbarState.persistCharPanel = payload;
      },
      changeIsUpdatingFg(state, payload: boolean) {
        state.toolbarState.isChoosingFg = payload;
      },
      changeIsUpdatingBg(state, payload: boolean) {
        state.toolbarState.isChoosingBg = payload;
      },
      changeIsUpdatingChar(state, payload: boolean) {
        state.toolbarState.isChoosingChar = payload;
      },
      changeTargetingFg(state, payload: boolean) {
        state.toolbarState.targetingFg = payload;
      },
      changeTargetingBg(state, payload: boolean) {
        state.toolbarState.targetingBg = payload;
      },
      changeTargetingChar(state, payload: boolean) {
        state.toolbarState.targetingChar = payload;
      },
      changeMenuBarVisible(state, payload: boolean) {
        state.desktopState.menuBarVisible = payload;
      },
      changeTabsVisible(state, payload: boolean) {
        state.desktopState.tabsVisible = payload;
      },
      newAsciibirdMeta(state, payload: AsciibirdMeta) {
        state.asciibirdMeta.push(payload);
        state.tab = state.asciibirdMeta.length - 1;
        document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
      },
      updateToolBarState(state, payload) {
        state.toolbarState = payload;
      },
      updateMirror(state, payload: { x: boolean; y: boolean }) {
        state.toolbarState.mirrorX = payload.x;
        state.toolbarState.mirrorY = payload.y;
      },
      updateAsciiBlocks(state, payload) {
        if (payload.diff && payload.diff.new && payload.diff.new.length) {
          if (state.asciibirdMeta[state.tab].history.length >= state.options.undoLimit) {
            state.asciibirdMeta[state.tab].history.shift();
          }
          const tempLayers: Layer[] = JSON.parse(
            LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
          );
          tempLayers[state.asciibirdMeta[state.tab].selectedLayer].data = payload.blocks;
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          const historyIndex = state.asciibirdMeta[state.tab].historyIndex;
          if (state.asciibirdMeta[state.tab].history.length !== historyIndex) {
            state.asciibirdMeta[state.tab].history.splice(
              historyIndex,
              state.asciibirdMeta[state.tab].history.length,
            );
          }
          state.asciibirdMeta[state.tab].history.push(
            LZString.compressToUTF16(JSON.stringify(payload.diff)),
          );
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
          if (historyIndex > state.asciibirdMeta[state.tab].history.length) {
            state.asciibirdMeta[state.tab].historyIndex =
              state.asciibirdMeta[state.tab].history.length;
          }
        }
      },
      addLayer(state) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        const width = tempLayers[0].width;
        const height = tempLayers[0].height;
        const newBlocksArray: Block[][] = create2DArray(height);
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            newBlocksArray[y].push({ ...emptyBlock });
          }
        }
        tempLayers.push({
          label: 'Layer ' + Number.parseInt(String(tempLayers.length)),
          visible: true,
          data: [...newBlocksArray],
          width,
          height,
        });
        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );
        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });
        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;
        state.asciibirdMeta[state.tab].selectedLayer =
          Number.parseInt(String(tempLayers.length)) - 1;
      },
      toggleLayer(state, payload: number) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        tempLayers[payload].visible = !tempLayers[payload].visible;
        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(tempLayers),
        );
        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({
            new: tempLayers,
            old: oldLayer,
          })),
        });
        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;
      },
      removeLayer(state, payload: number) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        if (tempLayers.length > 1) {
          const oldLayer = JSON.parse(JSON.stringify(tempLayers));
          tempLayers.splice(payload, 1);
          let selectedLayer = state.asciibirdMeta[state.tab].selectedLayer;
          while (tempLayers[selectedLayer] === undefined && selectedLayer >= 0) {
            selectedLayer--;
          }
          state.asciibirdMeta[state.tab].selectedLayer = selectedLayer;
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].history.push({
            t: 'l',
            d: LZString.compressToUTF16(JSON.stringify({
              new: tempLayers,
              old: oldLayer,
            })),
          });
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
        }
      },
      changeLayer(state, payload: number) {
        state.asciibirdMeta[state.tab].selectedLayer = payload;
      },
      mergeAllLayers(state) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        const oldLayer = JSON.parse(JSON.stringify(tempLayers));
        const width = tempLayers[0].width;
        const height = tempLayers[0].height;
        const label = tempLayers[state.asciibirdMeta[state.tab].selectedLayer].label;
        // Simple merge: take first non-empty block from visible layers (back to front)
        const mergedData: Block[][] = create2DArray(height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const curBlock: Block = { ...emptyBlock };
            for (let z = tempLayers.length - 1; z >= 0; z--) {
              if (!tempLayers[z].visible) continue;
              const src = tempLayers[z].data[y]?.[x];
              if (!src) continue;
              if (curBlock.bg === undefined) curBlock.bg = src.bg ?? undefined;
              if (curBlock.fg === undefined) curBlock.fg = src.fg ?? undefined;
              if (curBlock.char === undefined) curBlock.char = src.char ?? undefined;
            }
            mergedData[y][x] = curBlock;
          }
        }
        const merged: Layer[] = [{
          visible: true, width, height, label, data: mergedData,
        }];
        state.asciibirdMeta[state.tab].selectedLayer = 0;
        state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
          JSON.stringify(merged),
        );
        state.asciibirdMeta[state.tab].history.push({
          t: 'l',
          d: LZString.compressToUTF16(JSON.stringify({ new: merged, old: oldLayer })),
        });
        state.asciibirdMeta[state.tab].historyIndex =
          state.asciibirdMeta[state.tab].history.length;
      },
      updateAsciiTitle(state, payload: string) {
        state.asciibirdMeta[state.tab].title = payload;
      },
      undoBlocks(state) {
        const historyIndex = state.asciibirdMeta[state.tab].historyIndex;
        if (state.asciibirdMeta[state.tab].history[historyIndex - 1]) {
          const prev = state.asciibirdMeta[state.tab].history[historyIndex - 1];
          if (
            (prev as { t: string }).t !== undefined &&
            (prev as { t: string }).t === 'l'
          ) {
            const data = JSON.parse(
              LZString.decompressFromUTF16((prev as { d: string }).d),
            );
            state.asciibirdMeta[state.tab].layers =
              LZString.compressToUTF16(JSON.stringify(data.old));
            state.asciibirdMeta[state.tab].historyIndex--;
            const selectedLayer = state.asciibirdMeta[state.tab].selectedLayer;
            if (data.old[selectedLayer + 1]) {
              state.asciibirdMeta[state.tab].selectedLayer = selectedLayer + 1;
            } else if (data.old[selectedLayer - 1]) {
              state.asciibirdMeta[state.tab].selectedLayer = selectedLayer - 1;
            }
            return;
          }
          const prevData = JSON.parse(
            LZString.decompressFromUTF16(
              state.asciibirdMeta[state.tab].history[historyIndex - 1] as string,
            ),
          );
          const tempLayers: Layer[] = JSON.parse(
            LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
          );
          if (prevData.old) {
            for (const change in prevData.old) {
              const data = prevData.old[change];
              if (tempLayers[prevData.l] !== undefined) {
                tempLayers[prevData.l].data[data.y][data.x] = { ...data.b };
              }
            }
          }
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].historyIndex--;
        }
      },
      redoBlocks(state) {
        const historyIndex = state.asciibirdMeta[state.tab].historyIndex;
        if (state.asciibirdMeta[state.tab].history[historyIndex]) {
          let prev: any = state.asciibirdMeta[state.tab].history[historyIndex];
          if (
            (prev as { t: string }).t !== undefined &&
            (prev as { t: string }).t === 'l'
          ) {
            const data = JSON.parse(
              LZString.decompressFromUTF16((prev as { d: string }).d),
            );
            state.asciibirdMeta[state.tab].layers =
              LZString.compressToUTF16(JSON.stringify(data.old));
            state.asciibirdMeta[state.tab].historyIndex++;
            return;
          }
          prev = JSON.parse(
            LZString.decompressFromUTF16(
              state.asciibirdMeta[state.tab].history[historyIndex] as string,
            ),
          );
          const tempLayers: Layer[] = JSON.parse(
            LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
          );
          if (prev.new && prev.l !== undefined) {
            for (const change in prev.new) {
              if (tempLayers[prev.l] !== undefined) {
                const data = prev.new[change];
                tempLayers[prev.l].data[data.y][data.x] = { ...data.b };
              }
            }
          }
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].historyIndex++;
        }
      },
      updateBrushSize(state, payload) {
        state.toolbarState.brushSizeHeight = payload.brushSizeHeight;
        state.toolbarState.brushSizeWidth = payload.brushSizeWidth;
        state.toolbarState.brushSizeType = payload.brushSizeType;
      },
      brushBlocks(state, payload: Block[][]) {
        state.brushBlocks = LZString.compressToUTF16(JSON.stringify(payload));
      },
      selectBlocks(state, payload: Block[][]) {
        state.selectBlocks = LZString.compressToUTF16(JSON.stringify(payload));
      },
      toggleGridView(state, payload: boolean) {
        state.toolbarState.gridView = payload;
      },
      toggleHalfBlockEditing(state, payload: boolean) {
        state.toolbarState.halfBlockEditing = payload;
      },
      toggleUpdateBrush(state, payload: boolean) {
        state.toolbarState.updateBrush = payload;
      },
      flipRotateBlocks(state, payload: { type: string }) {
        let tempBlocks: Block[][] = JSON.parse(
          LZString.decompressFromUTF16(state.brushBlocks),
        );
        const parsedBlocks: Block[][] = [];
        switch (payload.type) {
          case 'flip':
            tempBlocks = tempBlocks.reverse();
            for (let y = 0; y < tempBlocks.length; y++) {
              parsedBlocks[y] = tempBlocks[y];
              for (let x = 0; x < getBlocksWidth(tempBlocks); x++) {
                parsedBlocks[y][x] = tempBlocks[y][x];
              }
            }
            break;
          case 'rotate':
            for (let y = 0; y < tempBlocks.length; y++) {
              parsedBlocks[y] = tempBlocks[y].reverse();
              for (let x = 0; x < getBlocksWidth(tempBlocks); x++) {
                parsedBlocks[y][x] = tempBlocks[y][x];
              }
            }
            break;
        }
        state.brushBlocks = LZString.compressToUTF16(
          JSON.stringify(parsedBlocks),
        );
      },
      pushBrushHistory(state, payload: Block[][]) {
        if (state.brushHistory.length >= state.options.brushLimit) {
          state.brushHistory.pop();
        }
        const hashValue = cyrb53(JSON.stringify(payload));
        state.brushHistory = state.brushHistory.filter(
          obj => obj.hash !== hashValue,
        );
        state.brushHistory.unshift({
          blocks: LZString.compressToUTF16(JSON.stringify(payload)),
          hash: hashValue,
        });
      },
      pushBrushLibrary(state, payload: Block[][]) {
        const hashValue = cyrb53(JSON.stringify(payload));
        state.brushLibrary = state.brushLibrary.filter(
          obj => obj.hash !== hashValue,
        );
        state.brushLibrary.unshift({
          blocks: LZString.compressToUTF16(JSON.stringify(payload)),
          hash: hashValue,
        });
      },
      removeBrushLibrary(state, payload: Block[][]) {
        const hashValue = cyrb53(JSON.stringify(payload));
        state.brushLibrary = state.brushLibrary.filter(
          item => item.hash !== hashValue,
        );
      },
      removeBrushHistory(state, payload: Block[][]) {
        const hashValue = cyrb53(JSON.stringify(payload));
        state.brushHistory = state.brushHistory.filter(
          item => item.hash !== hashValue,
        );
      },
      toggleDisableKeyboard(state, payload: boolean | null = null) {
        state.isKeyboardDisabled = (
          payload === null ? !state.isKeyboardDisabled : payload
        );
      },
      openModal(state, type: string) {
        const map: Record<string, keyof typeof state.modalState> = {
          'new-ascii': 'newAscii',
          'edit-ascii': 'editAscii',
          'paste-ascii': 'pasteAscii',
          'options': 'options',
          'overlay': 'overlay',
          'about': 'about',
          'help': 'help',
        };
        const key = map[type];
        if (key) {
          state.modalState[key] = true;
          state.isKeyboardDisabled = true;
        }
      },
      closeModal(state, type: string) {
        const map: Record<string, keyof typeof state.modalState> = {
          'new-ascii': 'newAscii',
          'edit-ascii': 'editAscii',
          'paste-ascii': 'pasteAscii',
          'options': 'options',
          'overlay': 'overlay',
          'about': 'about',
          'help': 'help',
        };
        const key = map[type];
        if (key) {
          state.modalState[key] = false;
          state.isKeyboardDisabled = false;
        }
      },
      closeTab(state, tab: number) {
        state.asciibirdMeta.splice(tab, 1);
        if (tab === state.tab) {
          state.tab = state.asciibirdMeta.length - 1;
        }
        if (state.asciibirdMeta.length) {
          document.title = `asciibird - ${state.asciibirdMeta[state.tab].title}`;
        } else {
          document.title = 'asciibird';
        }
      },
      upBrush(state, key: number) {
        const tempBrushLibrary = [...state.brushLibrary];
        if (tempBrushLibrary[key - 1] && tempBrushLibrary[key]) {
          const swap1 = tempBrushLibrary[key - 1];
          const swap = tempBrushLibrary[key];
          tempBrushLibrary[key - 1] = swap;
          tempBrushLibrary[key] = swap1;
          state.brushLibrary = tempBrushLibrary;
        }
      },
      downBrush(state, key: number) {
        const tempBrushLibrary = [...state.brushLibrary];
        if (tempBrushLibrary[key + 1] && tempBrushLibrary[key]) {
          const swap1 = tempBrushLibrary[key + 1];
          const swap = tempBrushLibrary[key];
          tempBrushLibrary[key + 1] = swap;
          tempBrushLibrary[key] = swap1;
          state.brushLibrary = tempBrushLibrary;
        }
      },
      downLayer(state, payload: number) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        if (tempLayers[payload + 1]) {
          const oldLayer = JSON.parse(JSON.stringify(tempLayers));
          const swap1 = tempLayers[payload + 1];
          const swap = tempLayers[payload];
          tempLayers[payload + 1] = swap;
          tempLayers[payload] = swap1;
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].history.push({
            t: 'l',
            d: LZString.compressToUTF16(JSON.stringify({
              new: tempLayers,
              old: oldLayer,
            })),
          });
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
          state.asciibirdMeta[state.tab].selectedLayer = payload + 1;
        }
      },
      upLayer(state, payload: number) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        if (tempLayers[payload - 1]) {
          const oldLayer = JSON.parse(JSON.stringify(tempLayers));
          const swap1 = tempLayers[payload - 1];
          const swap = tempLayers[payload];
          tempLayers[payload - 1] = swap;
          tempLayers[payload] = swap1;
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].history.push({
            t: 'l',
            d: LZString.compressToUTF16(JSON.stringify({
              new: tempLayers,
              old: oldLayer,
            })),
          });
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
          state.asciibirdMeta[state.tab].selectedLayer = payload - 1;
        }
      },
      updateLayerName(state, payload: { key: number; label: string }) {
        const tempLayers: Layer[] = JSON.parse(
          LZString.decompressFromUTF16(state.asciibirdMeta[state.tab].layers),
        );
        if (tempLayers[payload.key]) {
          const oldLayer = JSON.parse(JSON.stringify(tempLayers));
          tempLayers[payload.key].label = payload.label;
          state.asciibirdMeta[state.tab].layers = LZString.compressToUTF16(
            JSON.stringify(tempLayers),
          );
          state.asciibirdMeta[state.tab].history.push({
            t: 'l',
            d: LZString.compressToUTF16(JSON.stringify({
              new: tempLayers,
              old: oldLayer,
            })),
          });
          state.asciibirdMeta[state.tab].historyIndex =
            state.asciibirdMeta[state.tab].history.length;
        }
      },
    },
    getters: {
      state: (state) => state,
      modalState: (state) => state.modalState,
      options: (state) => state.options,
      toolbarState: (state) => state.toolbarState,
      debugPanel: (state) => state.debugPanelState,
      tabsVisible: (state) => state.desktopState.tabsVisible,
      menuBarVisible: (state) => state.desktopState.menuBarVisible,
      currentTool: (state) => state.toolbarState.currentTool,
      isTargettingBg: (state) => state.toolbarState.targetingBg,
      isTargettingFg: (state) => state.toolbarState.targetingFg,
      isTargettingChar: (state) => state.toolbarState.targetingChar,
      currentFg: (state) => state.toolbarState.currentColourFg,
      currentBg: (state) => state.toolbarState.currentColourBg,
      currentChar: (state) => state.toolbarState.selectedChar,
      currentTab: (state) => state.tab,
      currentAscii: (state) => state.asciibirdMeta[state.tab] ?? false,
      currentAsciiLayers: (state): Layer[] => {
        const meta = state.asciibirdMeta[state.tab];
        if (!meta) return [];
        return JSON.parse(LZString.decompressFromUTF16(meta.layers));
      },
      currentAsciiLayersWidthHeight: (state) => {
        const meta = state.asciibirdMeta[state.tab];
        if (!meta) return { width: 0, height: 0 };
        const blocks = JSON.parse(
          LZString.decompressFromUTF16(meta.layers),
        );
        return { width: blocks[0].width, height: blocks[0].height };
      },
      selectedLayer: (state) =>
        state.asciibirdMeta[state.tab]?.selectedLayer ?? 0,
      imageOverlay: (state) => state.asciibirdMeta[state.tab]?.imageOverlay,
      asciibirdMeta: (state) => state.asciibirdMeta,
      brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
      brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
      brushSizeType: (state) => state.toolbarState.brushSizeType,
      persistCharPanel: (state) => state.toolbarState.persistCharPanel,
      blockSizeMultiplier: (state) => state.blockSizeMultiplier,
      brushHistory: (state) => state.brushHistory,
      brushLibrary: (state) => state.brushLibrary,
      brushLibraryState: (state) => state.brushLibraryState,
      brushPreviewState: (state) => state.brushPreviewState,
      layersLibraryState: (state) => state.layersLibraryState,
      isKeyboardDisabled: (state) => state.isKeyboardDisabled,
      brushBlocks: (state): Block[] =>
        JSON.parse(LZString.decompressFromUTF16(state.brushBlocks)) || [],
      selectBlocks: (state): Block[] =>
        JSON.parse(LZString.decompressFromUTF16(state.selectBlocks)) || [],
      isModalOpen: (state): boolean => {
        const keys = Object.keys(state.modalState);
        return keys.some(key => (state.modalState as any)[key]);
      },
    },
    actions: {
      updateAsciiBlocksAsync({ commit }, data) {
        return new Promise((resolve) => {
          commit('updateAsciiBlocks', data);
          resolve(undefined);
        });
      },
    },
  });
}

// ─── Helper: create a test AsciibirdMeta ──────────────────────────────

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

// ─── Mutations ──────────────────────────────────────────────────────────

describe('Vuex Store Mutations', () => {
  let store: Store<RootState>;

  beforeEach(() => {
    store = createTestStore();
    store.commit('newAsciibirdMeta', createTestMeta());
  });

  // ── Basic state mutations ────────────────────────────────────────

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

  // ── Color and char mutations ────────────────────────────────────

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

  // ── Targeting mutations ──────────────────────────────────────────

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

  // ── Desktop state ────────────────────────────────────────────────

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

  // ── Panel state mutations ────────────────────────────────────────

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

  // ── ASCII metadata mutations ─────────────────────────────────────

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

  // ── Layer mutations ──────────────────────────────────────────────

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
      // Add a second layer
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

  // ── Block update with undo/redo ──────────────────────────────────

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

      // The diff must include 'l' (layer index) for undo to work
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
      // After undo, the block should be restored to the old state
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
      // At end of history, redo should be a no-op
      store.commit('redoBlocks');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);
    });

    it('undo/redo with layer-type history entry', () => {
      store.commit('addLayer');
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(1);

      // Undo the layer add
      store.commit('undoBlocks');
      const layers = JSON.parse(
        LZString.decompressFromUTF16(store.state.asciibirdMeta[0].layers),
      );
      expect(layers).toHaveLength(1); // Should be back to 1 layer
      expect(store.state.asciibirdMeta[0].historyIndex).toBe(0);
    });

    it('updateAsciiBlocks with empty diff is a no-op', () => {
      store.commit('updateAsciiBlocks', {
        diff: { new: [], old: [] },
        blocks: [],
      });
      expect(store.state.asciibirdMeta[0].history).toHaveLength(0);
    });
  });

  // ── Brush mutations ──────────────────────────────────────────────

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

  // ── Brush library/history mutations ──────────────────────────────

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
      // Fill up to limit
      for (let i = 0; i <= store.state.options.brushLimit; i++) {
        store.commit('pushBrushHistory', [[{ fg: i, bg: 0, char: String(i) }]]);
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
      // blocks2 is at index 0, blocks1 is at index 1
      store.commit('upBrush', 1);
      // Now blocks1 should be at index 0
      const hash0 = store.state.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });

    it('downBrush swaps brush down', () => {
      store.commit('pushBrushLibrary', blocks1);
      store.commit('pushBrushLibrary', blocks2);
      // blocks2 at index 0, blocks1 at index 1
      store.commit('downBrush', 0);
      const hash0 = store.state.brushLibrary[0].hash;
      expect(hash0).toBe(cyrb53(JSON.stringify(blocks1)));
    });
  });

  // ── Modal mutations ──────────────────────────────────────────────

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
      // All should be closed after close
      const allClosed = Object.values(store.state.modalState).every(v => !v);
      expect(allClosed).toBe(true);
    });
  });

  // ── Tab mutations ────────────────────────────────────────────────

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
      store.commit('closeTab', 1); // Close current tab
      expect(store.state.tab).toBe(0);
    });
  });

  // ── Keyboard toggle ──────────────────────────────────────────────

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

  // ── Toolbar state ────────────────────────────────────────────────

  describe('updateToolBarState', () => {
    it('replaces entire toolbar state', () => {
      const newToolbar = { ...store.state.toolbarState, currentTool: 5 };
      store.commit('updateToolBarState', newToolbar);
      expect(store.state.toolbarState.currentTool).toBe(5);
    });
  });
});

// ─── Getters ────────────────────────────────────────────────────────────

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

// ─── Actions ────────────────────────────────────────────────────────────

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
