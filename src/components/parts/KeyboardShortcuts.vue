<template>
  <div />
</template>

<script>
import { mircColours99, toolbarIcons, maxBrushSize } from '../../ascii';

export default {
  name: 'KeyboardShortcuts',
  created() {
      const thisIs = this;
      this.keyListener = function (e) {
        // Stop blocking input when modals are open
        // Whatever this char "'\0'" is it'd occur even without pressing any keys
        // This fixes it
        if (this.isModalOpen || e.key === "\0") {
          return;
        }

        e.preventDefault();

        // When press escape go back to default took
        if (e.key === "Escape" && !this.isDefault) {
          this.clearToolCanvas();
          this.$store.commit("changeTool", 0);
          return;
        }

        // Change char when car picker is open
        if (this.toolbarState.isChoosingChar && e.key.length === 1) {
          this.$store.commit("changeChar", e.key);
          return;
        }

        // Keys without any ctrl, shift or alt are also integrated
        // and are available only in their toolbar context
        // for example pressing E in default mode will toggle edit ascii
        // E in text mode will type the character E
        // E in brush mode will flip the brush

        // Copy and paste,
        const ctrlKey = e.ctrlKey || e.metaKey;

        // Files / system related
        const shiftKey = e.shiftKey;

        // Alt key functions are toolbar related
        const altKey = e.altKey;

        // Used for text typing
        if (this.isTextEditing) {
          thisIs.canvasKeyDown(e.key);
          return;
        }

        // Show / hide grid view
        if (e.key === "g" && altKey) {
          this.$store.commit("toggleGridView", !this.gridView);

          return;
        }

        // Ctrl Z here
        // skg - thanks for mac key suggestion, bro
        if (e.key === "z" && ctrlKey) {
          this.undo();
          return;
        }

        // Ctrl Y here
        if (e.key === "y" && ctrlKey) {
          this.redo();
          return;
        }

        // Change toolbar icon
        if (
          Number.parseInt(e.key) >= 1 &&
          Number.parseInt(e.key) <= 8 &&
          !this.toolbarState.isChoosingFg &&
          !this.toolbarState.isChoosingBg &&
          altKey
        ) {
          this.$store.commit("changeTool", Number.parseInt(e.key - 1));
          this.clearToolCanvas();
          return;
        }

        // Swap colours
        if (e.key === "r" && altKey) {
          let bg = this.currentBg;
          let fg = this.currentFg;

          this.$store.commit("changeColourFg", bg);
          this.$store.commit("changeColourBg", fg);
          return;
        }

        // Show FG
        if (e.key === "f" && altKey && !ctrlKey) {
          this.$store.commit(
            "changeIsUpdatingFg",
            !this.toolbarState.isChoosingFg
          );
          return;
        }

        // Show BG
        if (e.key === "b" && altKey && !ctrlKey) {
          this.$store.commit(
            "changeIsUpdatingBg",
            !this.toolbarState.isChoosingBg
          );
          return;
        }

        // Show Character select
        if (e.key === "c" && altKey && !ctrlKey) {
          this.$store.commit(
            "changeIsUpdatingChar",
            !this.toolbarState.isChoosingChar
          );
          return;
        }

        // Choose FG or BG with Keyboard
        if (
          Number.parseInt(e.key) >= 0 &&
          Number.parseInt(e.key) <= 9 &&
          (this.toolbarState.isChoosingFg || this.toolbarState.isChoosingBg)
        ) {
          if (this.toolbarState.isChoosingFg) {
            this.$store.commit("changeColourFg", Number.parseInt(e.key));
            return;
          }

          if (this.toolbarState.isChoosingBg) {
            this.$store.commit("changeColourBg", Number.parseInt(e.key));
            return;
          }
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

            // Reset and hide the select after successful copy
            this.resetSelect();
            this.processSelect();
          }

          return;
        }

        // Delte blocks but do not save them when pressing Delete when selected
        if (e.key === "Delete" && this.isSelected) {
          if (this.selectedBlocks.length) {
            for (let y = 0; y < this.selectedBlocks.length + 1; y++) {
              for (
                let x = 0;
                x < getBlocksWidth(this.selectedBlocks) + 1;
                x++
              ) {
                if (this.selectedBlocks[y] && this.selectedBlocks[y][x]) {
                  this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
                }
              }
            }

            // Reset and hide the select after successful copy
            this.$store.commit(
              "updateAsciiBlocks",
              this.currentAsciiLayerBlocks
            );
            this.delayRedrawCanvas();

            this.$toasted.show("Deleted blocks!", {
              type: "success",
              icon: "fa-check-circle",
            });
          }

          return;
        }

        // Ctrl X - cut blocks
        if (e.key === "x" && ctrlKey && !shiftKey && this.isSelected) {
          if (this.selectedBlocks.length) {
            for (let y = 0; y < this.selectedBlocks.length + 1; y++) {
              for (
                let x = 0;
                x < getBlocksWidth(this.selectedBlocks) + 1;
                x++
              ) {
                if (this.selectedBlocks[y] && this.selectedBlocks[y][x]) {
                  this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
                }
              }
            }

            this.$store.commit(
              "selectBlocks",
              this.filterNullBlocks(this.selectedBlocks)
            );

            this.selectedBlocks = [];

            // Reset and hide the select after successful copy

            this.$store.commit(
              "updateAsciiBlocks",
              this.currentAsciiLayerBlocks
            );
            // this.delayRedrawCanvas()

            this.$toasted.show("Cut blocks!", {
              type: "success",
              icon: "fa-check-circle",
            });
          }

          return;
        }

        // Ctrl V - paste blocks
        if (e.key === "v" && ctrlKey) {
          if (this.haveSelectBlocks) {
            this.$store.commit("pushBrushHistory", this.brushBlocks);
            this.$store.commit("brushBlocks", this.selectBlocks);
            this.$store.commit("changeTool", 4);
          }

          return;
        }

        // Show / hide debug panel
        if (e.key === "d" && this.isDefault) {
          this.$store.commit("toggleDebugPanel", !this.debugPanelState.visible);

          return;
        }

        // Show / hide brush library
        if (e.key === "l" && this.isDefault) {
          this.$store.commit(
            "toggleBrushLibrary",
            !this.brushLibraryState.visible
          );

          return;
        }

        // New ASCII
        // Ctrl N doesn't seem to work in chrome? https://github.com/liftoff/GateOne/issues/290
        if (e.key === "n" && this.isDefault && !this.isTextEditing) {
          this.$store.commit("openModal", "new-ascii");

          return;
        }

        // Edit ASCII
        if (e.key === "e" && this.isDefault && !this.isTextEditing) {
          this.$store.commit("openModal", "edit-ascii");

          return;
        }

        // Paste ASCII
        if (e.key === "p" && this.isDefault && !this.isTextEditing) {
          this.$store.commit("openModal", "paste-ascii");

          return;
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

          return;
        }

        // Export to txt
        if (e.key === "F" && ctrlKey && shiftKey) {
          let ascii = exportMirc();
          downloadFile(ascii.output.join(""), ascii.filename, "text/plain");

          return;
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

          return;
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

          return;
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
