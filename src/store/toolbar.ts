/**
 * Toolbar Store — manages tool state, brush data, and brush library.
 *
 * Extracted from the monolithic useAsciiBirdStore to isolate tool/brush state
 * and allow independent persistence.
 */
import { defineStore } from 'pinia';
import { cyrb53 } from '../ascii';
import { compressData, decompressData } from '../utils/layers';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import { transformBlocks } from '../utils/transformBlocks';
import type { TransformType } from '../utils/transformBlocks';
import { validateBrushShapeKey } from '../utils/brushShapes';
import { nextShapeType, validateShapeType } from '../utils/shapes';
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
    pickerPos: { x: number; y: number } | null;
    recentColors: number[];
  } => ({
    toolbarState: {
      currentColourFg: 0,
      currentColourBg: 1,
      isChoosingFg: false,
      isChoosingBg: false,
      isChoosingChar: false,
      persistCharPanel: false,
      persistColourPanel: false,
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
      x: 8,
      y: 56,
      h: 285,
      w: 200,
      draggable: true,
      updateBrush: true,
      gridView: false,
      visible: true,
      halfBlockEditing: false,
      minimized: false,
      shapeType: 'line',
    },
    _brushBlocks: '',
    brushHistory: [],
    _selectBlocks: '',
    brushLibrary: [],
    pickerPos: null,
    recentColors: [],
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
    brushBlocks: (state): Block[][] =>
      decompressData<Block[][]>(state._brushBlocks) || [],
    selectBlocks: (state): Block[][] =>
      decompressData<Block[][]>(state._selectBlocks) || [],
  },

  actions: {
    changeColourFg(payload: number) {
      this.toolbarState.currentColourFg = payload;
      this.toolbarState.isUpdating = false;
      if (!this.toolbarState.persistColourPanel) {
        this.toolbarState.isChoosingFg = false;
      }
    },
    changeColourBg(payload: number) {
      this.toolbarState.currentColourBg = payload;
      this.toolbarState.isUpdating = false;
      if (!this.toolbarState.persistColourPanel) {
        this.toolbarState.isChoosingBg = false;
      }
    },
    changeChar(payload: string) {
      this.toolbarState.selectedChar = payload;
      this.toolbarState.isUpdating = false;

      if (!this.toolbarState.persistCharPanel) {
        this.toolbarState.isChoosingChar = false;
      }
    },
    /**
     * Add a color to the recent colors strip (LRU, max 12).
     * Moves to front if already present, pushes if new.
     */
    addRecentColor(colorIndex: number) {
      if (colorIndex < 0 || colorIndex > 98) return;
      // Remove if already present
      this.recentColors = this.recentColors.filter(c => c !== colorIndex);
      // Push to front
      this.recentColors.unshift(colorIndex);
      // Trim to 12
      if (this.recentColors.length > 12) {
        this.recentColors = this.recentColors.slice(0, 12);
      }
    },
    changeTool(payload: number) {
      this.toolbarState.currentTool = payload;
    },
    persistCharPanel(payload: boolean) {
      this.toolbarState.persistCharPanel = payload;
    },
    persistColourPanel(payload: boolean) {
      this.toolbarState.persistColourPanel = payload;
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
      // Validate shape key — defaults to 'square' if invalid (e.g. stale IDB)
      this.toolbarState.brushSizeType =
        validateBrushShapeKey(payload.brushSizeType);
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
    changeShapeType(payload: ToolbarState['shapeType']) {
      this.toolbarState.shapeType = payload;
    },
    cycleShapeType() {
      this.toolbarState.shapeType = nextShapeType(
        this.toolbarState.shapeType,
      );
    },
    /**
     * Transform the current brush blocks (flip or rotate).
     * Uses the generic transformBlocks utility.
     */
    transformBrush(payload: { type: TransformType }) {
      const blocks = decompressData<Block[][]>(this._brushBlocks);
      if (!blocks || !blocks.length) return;
      const result = transformBlocks(blocks, payload.type);
      this._brushBlocks = compressData(result);
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
    minimizeToolbar() {
      this.toolbarState.minimized = true;
      this.toolbarState.visible = true; // minimized != hidden
    },
    restoreToolbar() {
      this.toolbarState.minimized = false;
      this.toolbarState.visible = true;
    },
    toggleToolbarMinimize() {
      if (this.toolbarState.minimized) {
        this.toolbarState.minimized = false;
      } else if (this.toolbarState.visible) {
        this.toolbarState.minimized = true;
      } else {
        // Hidden toolbar — restore to visible
        this.toolbarState.visible = true;
        this.toolbarState.minimized = false;
      }
    },
    resetToolbarPosition() {
      this.toolbarState.x = 8;
      this.toolbarState.y = 56;
    },
    setPickerPos(pos: { x: number; y: number }) {
      this.pickerPos = pos;
    },
  },

  persist: {
    key: 'asciibird-toolbar',
    storage: idbPersistAdapter,
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
        // Validate persisted brushSizeType against registry
        if (parsed.toolbarState?.brushSizeType != null) {
          parsed.toolbarState.brushSizeType =
            validateBrushShapeKey(parsed.toolbarState.brushSizeType);
        }
        // Validate persisted shapeType against known types
        if (parsed.toolbarState?.shapeType != null) {
          parsed.toolbarState.shapeType =
            validateShapeType(parsed.toolbarState.shapeType);
        }
        // Migrate stale toolbar y-positions that extend below viewport.
        // The old default was y:364 which overlaps the status bar on
        // small viewports (< 757px). Clamp to a safe default (56px).
        if (parsed.toolbarState?.y != null) {
          const maxY = (typeof window !== 'undefined'
            ? window.innerHeight : 800) - 100;
          if (parsed.toolbarState.y > maxY) {
            parsed.toolbarState.y = 56;
          }
        }
        return parsed;
      },
    },
  },
});
