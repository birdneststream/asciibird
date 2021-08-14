<template>
    <div></div>
</template>

<script>
import { mircColours99, toolbarIcons, maxBrushSize } from '../../ascii';

export default {
  name: 'KeyboardShortcuts',
  created() {
      const thisIs = this;
      this.keyListener = function (e) {
        // Stop blocking input when modals are open
        if (this.isModalOpen) {
          return;
        }

        e.preventDefault();

        const ctrlKey = e.ctrlKey || e.metaKey;
        const shiftKey = e.shiftKey;

        if (this.isTextEditing) {
          thisIs.canvasKeyDown(e.key);
          return;
        }

        // Ctrl Z here
        // skg - thanks for mac key suggestion, bro
        if (e.key === "z" && ctrlKey) {
          this.undo();
        }

        // Ctrl Y here
        if (e.key === "y" && ctrlKey) {
          this.redo();
        }

        // Ctrl C - copy blocks
        if (e.key === "c" && ctrlKey && !shiftKey) {
          if (this.selectedBlocks.length) {
            this.$store.commit(
              "selectBlocks",
              this.filterNullBlocks(this.selectedBlocks)
            );

            this.$toasted.show("Copied blocks!", {
              type: "success",
              icon: "fa-check-circle",
            });

            this.selectedBlocks = [];
          }
        }

        // Ctrl V - paste blocks
        if (e.key === "v" && ctrlKey) {
          if (this.haveSelectBlocks) {
            this.$store.commit("pushBrushHistory", this.brushBlocks);
            this.$store.commit("brushBlocks", this.selectBlocks);
            this.$store.commit("changeTool", 4);
          }
        }

        // Show / hide debug panel
        if (e.key === "d" && ctrlKey) {
          this.$store.commit("toggleDebugPanel", !this.debugPanelState.visible);
        }

        // Show / hide grid view
        if (e.key === "g" && ctrlKey) {
          this.$store.commit("toggleGridView", !this.toolbarState.gridView);
        }

        // Show / hide brush library
        if (e.key === "b" && ctrlKey) {
          this.$store.commit(
            "toggleBrushLibrary",
            !this.brushLibraryState.visible
          );
        }

        // New ASCII
        // Ctrl N doesn't seem to work in chrome? https://github.com/liftoff/GateOne/issues/290
        if (e.key === "m" && ctrlKey) {
          this.$store.commit("openModal", "new-ascii");
        }

        // Edit ASCII
        if (e.key === "e" && ctrlKey) {
          this.$store.commit("openModal", "edit-ascii");
        }

        // Paste ASCII
        if (e.key === "p" && ctrlKey) {
          this.$store.commit("openModal", "paste-ascii");
        }

        // Export to clipboard
        if (e.key === "C" && ctrlKey && shiftKey) {
          let ascii = exportMirc();
          this.$copyText(ascii.output.join("")).then(
            (e) => {
              this.$toasted.show("Copied mIRC to clipboard!", {
                type: "success",
              });
            },
            (e) => {
              this.$toasted.show("Error when copying mIRC to clipboard!", {
                type: "error",
              });
            }
          );
        }

        // Export to txt
        if (e.key === "F" && ctrlKey && shiftKey) {
          let ascii = exportMirc();
          downloadFile(ascii.output.join(""), ascii.filename, "text/plain");
        }

        if (
          e.key === "]" &&
          ctrlKey &&
          this.brushSizeHeight < this.maxBrushSize &&
          this.brushSizeHeight >= 1 &&
          this.brushSizeWidth < this.maxBrushSize &&
          this.brushSizeWidth >= 1
        ) {
          this.$store.commit("updateBrushSize", {
            brushSizeHeight: parseInt(this.brushSizeHeight) + 1,
            brushSizeWidth: parseInt(this.brushSizeWidth) + 1,
            brushSizeType: this.brushSizeType,
          });
        }

        if (
          e.key === "[" &&
          ctrlKey &&
          this.brushSizeHeight <= this.maxBrushSize &&
          this.brushSizeHeight > 1 &&
          this.brushSizeWidth <= this.maxBrushSize &&
          this.brushSizeWidth > 1
        ) {
          this.$store.commit("updateBrushSize", {
            brushSizeHeight: parseInt(this.brushSizeHeight) - 1,
            brushSizeWidth: parseInt(this.brushSizeWidth) - 1,
            brushSizeType: this.brushSizeType,
          });
        }

        // Hopefully we can still pick up the previous inputs
        // while in brush mode
        if (this.isBrushing) {
          if (e.key === "e") {
            this.$store.commit("flipRotateBlocks", {
              type: "flip",
            });
          }

          if (e.key === "q") {
            this.$store.commit("flipRotateBlocks", {
              type: "rotate",
            });
          }
          return;
        }
      };

      // this.keyListenerUp = function (e) {
      //     this.canKey = true
      // };

      document.addEventListener("keydown", this.keyListener.bind(this));
      // document.addEventListener("keyup", this.keyListenerUp.bind(this));
  },
  computed: {
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
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
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
    isSelected() {
      return (
        this.selecting.startX &&
        this.selecting.startY &&
        this.selecting.endX &&
        this.selecting.endY
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
    mircColours() {
      return mircColours99;
    },
    brushLibraryState() {
      return this.$store.getters.brushLibraryState;
    },
    maxBrushSize() {
      return maxBrushSize;
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
