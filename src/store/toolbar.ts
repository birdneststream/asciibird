/**
 * Toolbar Store — manages tool state, brush data, and brush library.
 *
 * Extracted from the monolithic useAsciiBirdStore to isolate tool/brush state
 * and allow independent persistence.
 */
import { defineStore } from 'pinia';
import { cyrb53, getBlocksWidth } from '../ascii';
import { compressData, decompressData } from '../utils/layers';
import { useAsciiBirdStore } from './index';
import type {
  Block,
  PanelState,
  ToolbarState,
  BrushHistoryEntry,
  BrushLibraryEntry,
} from '../types';

export const useToolbarStore = defineStore('toolbar', {
  state: (): {
    toolbarState: ToolbarState;
    _brushBlocks: string;
    brushHistory: BrushHistoryEntry[];
    _selectBlocks: string;
    brushLibrary: BrushLibraryEntry[];
  } => ({
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
      x: 16, // blockWidth * 2
      y: 30, // blockHeight * 2
      h: 285, // blockHeight * 19
      w: 200, // blockWidth * 25
      draggable: true,
      updateBrush: true,
      gridView: false,
      visible: true,
      halfBlockEditing: false,
    },
    _brushBlocks: '',
    brushHistory: [],
    _selectBlocks: '',
    brushLibrary: [],
  }),

  getters: {
    currentTool: (state) => state.toolbarState.currentTool,
    isTargettingBg: (state) => state.toolbarState.targetingBg,
    isTargettingFg: (state) => state.toolbarState.targetingFg,
    isTargettingChar: (state) => state.toolbarState.targetingChar,
    currentFg: (state) => state.toolbarState.currentColourFg,
    currentBg: (state) => state.toolbarState.currentColourBg,
    currentChar: (state) => state.toolbarState.selectedChar,
    brushSizeHeight: (state) => state.toolbarState.brushSizeHeight,
    brushSizeWidth: (state) => state.toolbarState.brushSizeWidth,
    brushSizeType: (state) => state.toolbarState.brushSizeType,
    brushBlocks: (state): Block[] =>
      decompressData<Block[]>(state._brushBlocks) || [],
    selectBlocks: (state): Block[] =>
      decompressData<Block[]>(state._selectBlocks) || [],
  },

  actions: {
    changeColourFg(payload: number) {
      this.toolbarState.currentColourFg = payload;
      this.toolbarState.isUpdating = false;
      this.toolbarState.isChoosingFg = false;
    },
    changeColourBg(payload: number) {
      this.toolbarState.currentColourBg = payload;
      this.toolbarState.isUpdating = false;
      this.toolbarState.isChoosingBg = false;
    },
    changeChar(payload: string) {
      this.toolbarState.selectedChar = payload;
      this.toolbarState.isUpdating = false;

      if (!this.toolbarState.persistCharPanel) {
        this.toolbarState.isChoosingChar = false;
      }
    },
    changeTool(payload: number) {
      this.toolbarState.currentTool = payload;
    },
    persistCharPanel(payload: boolean) {
      this.toolbarState.persistCharPanel = payload;
    },
    changeIsUpdatingFg(payload: boolean) {
      this.toolbarState.isChoosingFg = payload;
    },
    changeIsUpdatingBg(payload: boolean) {
      this.toolbarState.isChoosingBg = payload;
    },
    changeIsUpdatingChar(payload: boolean) {
      this.toolbarState.isChoosingChar = payload;
    },
    changeTargetingFg(payload: boolean) {
      this.toolbarState.targetingFg = payload;
    },
    changeTargetingBg(payload: boolean) {
      this.toolbarState.targetingBg = payload;
    },
    changeTargetingChar(payload: boolean) {
      this.toolbarState.targetingChar = payload;
    },
    updateToolBarState(payload: ToolbarState) {
      this.toolbarState = payload;
    },
    updateMirror(payload: { x: boolean; y: boolean }) {
      this.toolbarState.mirrorX = payload.x;
      this.toolbarState.mirrorY = payload.y;
    },
    updateBrushSize(
      payload: {
        brushSizeHeight: number;
        brushSizeWidth: number;
        brushSizeType: ToolbarState['brushSizeType'];
      },
    ) {
      this.toolbarState.brushSizeHeight = payload.brushSizeHeight;
      this.toolbarState.brushSizeWidth = payload.brushSizeWidth;
      this.toolbarState.brushSizeType = payload.brushSizeType;
    },
    setBrushBlocks(payload: Block[][]) {
      this._brushBlocks = compressData(payload);
    },
    setSelectBlocks(payload: Block[][]) {
      this._selectBlocks = compressData(payload);
    },
    toggleGridView(payload: boolean) {
      this.toolbarState.gridView = payload;
    },
    toggleHalfBlockEditing(payload: boolean) {
      this.toolbarState.halfBlockEditing = payload;
    },
    toggleUpdateBrush(payload: boolean) {
      this.toolbarState.updateBrush = payload;
    },
    flipRotateBlocks(payload: { type: string }) {
      let tempBlocks: Block[][] = decompressData(this._brushBlocks);
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

      this._brushBlocks = compressData(parsedBlocks);
    },

    // Brush Library
    pushBrushHistory(payload: Block[][]) {
      const limit = useAsciiBirdStore().options.brushLimit;
      if (this.brushHistory.length >= limit) {
        this.brushHistory.pop();
      }

      const hashValue = cyrb53(JSON.stringify(payload));
      this.brushHistory = this.brushHistory.filter(
        obj => obj.hash !== hashValue,
      );

      this.brushHistory.unshift({
        blocks: compressData(payload),
        hash: hashValue,
      });
    },
    pushBrushLibrary(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));
      this.brushLibrary = this.brushLibrary.filter(
        obj => obj.hash !== hashValue,
      );

      this.brushLibrary.unshift({
        blocks: compressData(payload),
        hash: hashValue,
      });
    },
    removeBrushLibrary(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      this.brushLibrary = this.brushLibrary.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    removeBrushHistory(payload: Block[][]) {
      const hashValue = cyrb53(JSON.stringify(payload));

      this.brushHistory = this.brushHistory.filter(function (item) {
        return item.hash !== hashValue;
      });
    },
    upBrush(key: number) {
      if (key > 0) {
        const temp = this.brushLibrary[key];
        this.brushLibrary[key] = this.brushLibrary[key - 1];
        this.brushLibrary[key - 1] = temp;
      }
    },
    downBrush(key: number) {
      if (key < this.brushLibrary.length - 1) {
        const temp = this.brushLibrary[key];
        this.brushLibrary[key] = this.brushLibrary[key + 1];
        this.brushLibrary[key + 1] = temp;
      }
    },

    // Panel position — partial update of toolbar panel fields
    changeToolBarState(payload: PanelState & { draggable?: boolean }) {
      this.toolbarState.x = payload.x;
      this.toolbarState.y = payload.y;
      this.toolbarState.w = payload.w;
      this.toolbarState.h = payload.h;
      this.toolbarState.visible = payload.visible;
    },
    changeToolBarDraggable(payload: boolean) {
      this.toolbarState.draggable = payload;
    },
  },

  persist: {
    key: 'asciibird-toolbar',
    storage: localStorage,
    serializer: {
      serialize: (value: Record<string, unknown>) => {
        const out: Record<string, unknown> = { ...value };
        if ('_brushBlocks' in out) {
          out.brushBlocks = out._brushBlocks;
          delete out._brushBlocks;
        }
        if ('_selectBlocks' in out) {
          out.selectBlocks = out._selectBlocks;
          delete out._selectBlocks;
        }
        return JSON.stringify(out);
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        if ('brushBlocks' in parsed) {
          parsed._brushBlocks = parsed.brushBlocks;
          delete parsed.brushBlocks;
        }
        if ('selectBlocks' in parsed) {
          parsed._selectBlocks = parsed.selectBlocks;
          delete parsed.selectBlocks;
        }
        return parsed;
      },
    },
  },
});
