<template>
  <div />
</template>

<script>
import { toolbarIcons } from "../../ascii";
import { useAsciiBirdStore } from "../../store";
import hotkeys from "hotkeys-js";

export default {
  name: "KeyboardShortcuts",
  setup() {
    const store = useAsciiBirdStore();
    return { store };
  },
  created() {
    var _this = this;

    hotkeys("*", "editor", function (event) {

      event.preventDefault();

      if (_this.toolbarState.isChoosingChar && event.key.length === 1 && !_this.disableKeyboard && !_this.toolbarState.persistCharPanel) {
        _this.store.changeChar(event.key);
        return;
      }

      if (
        Number.parseInt(event.key) >= 1 &&
        Number.parseInt(event.key) <= 8 &&
        !_this.toolbarState.isChoosingFg &&
        !_this.toolbarState.isChoosingBg &&
        event.altKey &&
        _this.haveOpenTabs
      ) {
        _this.store.changeTool(Number.parseInt(event.key - 1));
        _this.$emit("updatecanvas");
        return;
      }

      if (
        Number.parseInt(event.key) >= 0 &&
        Number.parseInt(event.key) <= 9 &&
        (_this.toolbarState.isChoosingFg || _this.toolbarState.isChoosingBg) &&
        _this.haveOpenTabs
      ) {
        if (_this.toolbarState.isChoosingFg) {
          _this.store.changeColourFg(Number.parseInt(event.key));
          return;
        }

        if (_this.toolbarState.isChoosingBg) {
          _this.store.changeColourBg(Number.parseInt(event.key));
          return;
        }
      }
    });

    hotkeys("Escape", "editor", function (event) {
      if (
        !_this.textEditing &&
        (_this.toolbarState.isChoosingChar ||
          _this.toolbarState.isChoosingBg ||
          (_this.toolbarState.isChoosingFg && _this.haveOpenTabs))
      ) {
        event.preventDefault();
        _this.store.changeIsUpdatingFg(false);
        _this.store.changeIsUpdatingBg(false);
        _this.store.changeIsUpdatingChar(false);
        return;
      }

      if (!_this.isDefault) {
        event.preventDefault();
        _this.$emit("updatecanvas");
        _this.store.changeTool(0);
        return;
      }

      return;
    });

    hotkeys.setScope(this.disableKeyboard ? "modals" : "editor");
  },
  data: () => ({}),
  props: {
    selectedBlocks: { type: Array, default: () => [] },
    textEditing: { type: [Object, null], default: null },
    selecting: { type: Object, default: () => ({}) },
    isInputtingBrushSize: { type: Boolean, default: false },
    showingPostUrl: { type: Boolean, default: false },
    isShowingDialog: { type: Boolean, default: false },
    canvasX: { type: Number, default: null },
    canvasY: { type: Number, default: null },
  },
  computed: {
    canvasXy() {
      return { x: this.canvasX, y: this.canvasY };
    },
    isModalOpen() {
      return this.store.isModalOpen;
    },
    brushSizeHeight() {
      return this.store.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.store.brushSizeWidth;
    },
    brushSizeType() {
      return this.store.brushSizeType;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    currentTool() {
      return toolbarIcons[this.store.currentTool];
    },
    canFg() {
      return this.store.isTargettingFg;
    },
    canBg() {
      return this.store.isTargettingBg;
    },
    canText() {
      return this.store.isTargettingChar;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    currentChar() {
      return this.store.currentChar;
    },
    isTextEditing() {
      return this.currentTool.name === "text";
    },
    isSelecting() {
      return this.currentTool.name === "select";
    },
    isDefault() {
      return this.currentTool.name === "default";
    },
    isBrushing() {
      return this.currentTool.name === "brush";
    },
    isEraser() {
      return this.currentTool.name === "eraser";
    },
    isSelected() {
      return (
        this.selecting.startX >= 0 &&
        this.selecting.startY >= 0 &&
        this.selecting.endX >= 0 &&
        this.selecting.endY >= 0
      );
    },
    brushBlocks() {
      return this.store.brushBlocks;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    debugPanelState() {
      return this.store.debugPanel;
    },
    selectBlocks() {
      return this.store.selectBlocks;
    },
    asciibirdMeta() {
      return this.store.asciibirdMeta;
    },
    haveSelectBlocks() {
      return !!this.selectBlocks.length;
    },
    brushLibraryState() {
      return this.store.brushLibraryState;
    },
    currentAsciiLayers() {
      return this.store.currentAsciiLayers;
    },
    currentSelectedLayer() {
      return this.currentAsciiLayers[this.currentAscii.selectedLayer];
    },
    currentAsciiLayerBlocks() {
      return this.currentSelectedLayer.data;
    },
    currentAsciiWidth() {
      return this.currentSelectedLayer.width;
    },
    currentAsciiHeight() {
      return this.currentSelectedLayer.height;
    },
    haveOpenTabs() {
      return this.currentAscii !== false;
    },
    gridView() {
      return this.toolbarState.gridView;
    },
    isKeyboardDisabled() {
      return this.store.isKeyboardDisabled;
    },
    disableKeyboard() {
      return (
        this.isInputtingBrushSize ||
        this.isKeyboardDisabled ||
        this.isShowingDialog ||
        this.isModalOpen
      );
    },
  },
  watch: {
    disableKeyboard() {
      hotkeys.setScope(this.disableKeyboard ? "modals" : "editor");
    },
  },
  methods: {
    undo() {
      this.store.undoBlocks();
    },
    redo() {
      this.store.redoBlocks();
    },
  },
};
</script>
