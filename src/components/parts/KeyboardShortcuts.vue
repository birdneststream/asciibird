<template>
  <div />
</template>

<script>
import {
  toolbarIcons,
  maxBrushSize,
} from "../../ascii";

export default {
  name: "KeyboardShortcuts",
  created() {
    var _this = this;

    hotkeys("Enter", function (event, handler) {
      event.preventDefault();
      // Enter events to confirm and close dialogs and modals
      if (_this.isShowingDialog) {
        _this.$dialog.hide("dialog-posthttp");
        return;
      }
    });

    hotkeys("*", "editor", function (event, handler) {
      event.preventDefault();

      if (_this.toolbarState.isChoosingChar && event.key.length === 1) {
        _this.$store.commit("changeChar", event.key);
        return;
      }

      // Change toolbar icon
      if (
        Number.parseInt(event.key) >= 1 &&
        Number.parseInt(event.key) <= 8 &&
        !_this.toolbarState.isChoosingFg &&
        !_this.toolbarState.isChoosingBg &&
        event.altKey &&
        _this.haveOpenTabs
      ) {

        _this.$store.commit("changeTool", Number.parseInt(event.key - 1));
        _this.$emit("updatecanvas");
        return;
      }

      // Choose FG or BG with Keyboard
      if (
        Number.parseInt(event.key) >= 0 &&
        Number.parseInt(event.key) <= 9 &&
        (_this.toolbarState.isChoosingFg || _this.toolbarState.isChoosingBg) &&
        _this.haveOpenTabs
      ) {

        if (_this.toolbarState.isChoosingFg) {
          _this.$store.commit("changeColourFg", Number.parseInt(event.key));
          return;
        }

        if (_this.toolbarState.isChoosingBg) {
          _this.$store.commit("changeColourBg", Number.parseInt(event.key));
          return;
        }
      }
    });

    hotkeys("Escape", function (event, handler) {
      if (
        !_this.textEditing &&
        (_this.toolbarState.isChoosingChar ||
          _this.toolbarState.isChoosingBg ||
          (_this.toolbarState.isChoosingFg && _this.haveOpenTabs))
      ) {
        event.preventDefault();
        _this.$store.commit("changeIsUpdatingFg", false);
        _this.$store.commit("changeIsUpdatingBg", false);
        _this.$store.commit("changeIsUpdatingChar", false);
        return;
      }

      if (!_this.isDefault) {
        event.preventDefault();
        _this.$emit("updatecanvas");
        _this.$store.commit("changeTool", 0);
        return;
      }

      return;
    });

    hotkeys.setScope(this.disableKeyboard ? "modals" : "editor");
  },
  data: () => ({}),
  props: [
    "selectedBlocks",
    "textEditing",
    "selecting",
    "isInputtingBrushSize",
    "showingPostUrl",
    "isShowingDialog",
    "canvasX",
    "canvasY",
  ],
  computed: {
    canvasXy() {
      return { x: this.canvasX, y: this.canvasY };
    },
    isModalOpen() {
      return this.$store.getters.isModalOpen;
    },
    brushSizeHeight() {
      return this.$store.getters.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.$store.getters.brushSizeWidth;
    },
    brushSizeType() {
      return this.$store.getters.brushSizeType;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool];
    },
    canFg() {
      return this.$store.getters.isTargettingFg;
    },
    canBg() {
      return this.$store.getters.isTargettingBg;
    },
    canText() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    currentChar() {
      return this.$store.getters.currentChar;
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
      return this.$store.getters.brushBlocks;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    debugPanelState() {
      return this.$store.getters.debugPanel;
    },
    selectBlocks() {
      return this.$store.getters.selectBlocks;
    },
    haveSelectBlocks() {
      return !!this.selectBlocks.length;
    },
    brushLibraryState() {
      return this.$store.getters.brushLibraryState;
    },
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
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
      return this.$store.getters.isKeyboardDisabled;
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
      this.$store.commit("undoBlocks");
    },
    redo() {
      this.$store.commit("redoBlocks");
    },
  },
};
</script>
