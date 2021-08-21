<template>
  <div />
</template>

<script>
import {
  toolbarIcons,
  maxBrushSize,
  filterNullBlocks,
  getBlocksWidth,
  emptyBlock,
  exportMirc,
  downloadFile,
} from "../../ascii";

export default {
  name: "KeyboardShortcuts",
  destroyed() {
    window.removeEventListener("keydown", this.keyListener.bind(this));
  },
  created() {
    this.keyListener = function (e) {
      // Stop blocking input when modals are open
      // Whatever this char "'\0'" is it'd occur even without pressing any keys
      // This fixes it
      if (this.isModalOpen || e.key === "\0" || this.isInputtingBrushSize || this.showingPostUrl) {
        return;
      }

      e.preventDefault();

      // When press escape go back to default took
      if (e.key === "Escape" && !this.isDefault && this.haveOpenTabs) {
        this.$emit("updatecanvas");
        this.$store.commit("changeTool", 0);
        return;
      }

      // Change char when car picker is open
      if (
        this.toolbarState.isChoosingChar &&
        e.key.length === 1 &&
        this.haveOpenTabs
      ) {
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
      if (this.isTextEditing && this.haveOpenTabs) {
        this.canvasKeyDown(e.key);
        return;
      }

      // Show / hide grid view
      if (e.key === "g" && altKey && this.haveOpenTabs) {
        this.$store.commit("toggleGridView", !this.gridView);
        return;
      }

      // Ctrl Z here
      // skg - thanks for mac key suggestion, bro
      if (e.key === "z" && ctrlKey && this.haveOpenTabs) {
        this.undo();
        return;
      }

      // Ctrl Y here
      if (e.key === "y" && ctrlKey && this.haveOpenTabs) {
        this.redo();
        return;
      }

      // Change toolbar icon
      if (
        Number.parseInt(e.key) >= 1 &&
        Number.parseInt(e.key) <= 8 &&
        !this.toolbarState.isChoosingFg &&
        !this.toolbarState.isChoosingBg &&
        altKey &&
        this.haveOpenTabs
      ) {
        this.$store.commit("changeTool", Number.parseInt(e.key - 1));
        this.$emit("updatecanvas");
        return;
      }

      // Swap colours
      if (e.key === "r" && altKey && this.haveOpenTabs) {
        let bg = this.currentBg;
        let fg = this.currentFg;

        this.$store.commit("changeColourFg", bg);
        this.$store.commit("changeColourBg", fg);
        return;
      }

      // Show FG
      if (e.key === "f" && altKey && !ctrlKey && this.haveOpenTabs) {
        this.$store.commit(
          "changeIsUpdatingFg",
          !this.toolbarState.isChoosingFg
        );
        return;
      }

      // Show BG
      if (e.key === "b" && altKey && !ctrlKey && this.haveOpenTabs) {
        this.$store.commit(
          "changeIsUpdatingBg",
          !this.toolbarState.isChoosingBg
        );
        return;
      }

      // Show Character select
      if (e.key === "c" && altKey && !ctrlKey && this.haveOpenTabs) {
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
        (this.toolbarState.isChoosingFg || this.toolbarState.isChoosingBg) &&
        this.haveOpenTabs
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
      if (
        e.key === "c" &&
        ctrlKey &&
        !shiftKey &&
        this.haveOpenTabs &&
        this.isSelected &&
        this.isSelecting
      ) {
        if (this.selectedBlocks.length) {
          this.$store.commit(
            "selectBlocks",
            filterNullBlocks(this.selectedBlocks)
          );

          this.$toasted.show("Copied blocks!", {
            type: "success",
            icon: "fa-check-circle",
          });
        }

        return;
      }

      // Delte blocks but do not save them when pressing Delete when selected
      if (
        e.key === "Delete" &&
        this.haveOpenTabs &&
        this.isSelected &&
        this.isSelecting
      ) {
        console.log(getBlocksWidth(this.selectedBlocks));
        if (this.selectedBlocks.length) {
          for (let y = 0; y < this.selectedBlocks.length + 1; y++) {
            for (let x = 0; x < getBlocksWidth(this.selectedBlocks) + 1; x++) {
              if (this.selectedBlocks[y] && this.selectedBlocks[y][x]) {
                this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
              }
            }
          }

          // Reset and hide the select after successful copy
          this.$store.commit("updateAsciiBlocks", this.currentAsciiLayerBlocks);
          this.$emit("updatecanvas");

          this.$toasted.show("Deleted blocks!", {
            type: "success",
            icon: "fa-check-circle",
          });
        }

        return;
      }

      // Ctrl X - cut blocks
      if (
        e.key === "x" &&
        ctrlKey &&
        !shiftKey &&
        this.haveOpenTabs &&
        this.isSelected &&
        this.isSelecting
      ) {
        if (this.selectedBlocks.length) {
          for (let y = 0; y < this.selectedBlocks.length + 1; y++) {
            for (let x = 0; x < getBlocksWidth(this.selectedBlocks) + 1; x++) {
              if (this.selectedBlocks[y] && this.selectedBlocks[y][x]) {
                this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
              }
            }
          }

          this.$store.commit(
            "selectBlocks",
            filterNullBlocks(this.selectedBlocks)
          );

          this.selectedBlocks = [];

          // Reset and hide the select after successful copy

          this.$store.commit("updateAsciiBlocks", this.currentAsciiLayerBlocks);
          this.$emit("updatecanvas");

          this.$toasted.show("Cut blocks!", {
            type: "success",
            icon: "fa-check-circle",
          });
        }

        return;
      }

      // Ctrl V - paste blocks
      if (e.key === "v" && ctrlKey && this.haveOpenTabs) {
        if (this.haveSelectBlocks) {
          this.$store.commit("pushBrushHistory", this.brushBlocks);
          this.$store.commit("brushBlocks", this.selectBlocks);
          this.$store.commit("changeTool", 4);
        }

        return;
      }

      // Show / hide debug panel
      if (e.key === "d" && this.isDefault && this.haveOpenTabs) {
        this.$store.commit("toggleDebugPanel", !this.debugPanelState.visible);

        return;
      }

      // Show / hide brush library
      if (e.key === "l" && this.isDefault && this.haveOpenTabs) {
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
      if (
        e.key === "e" &&
        this.isDefault &&
        !this.isTextEditing &&
        this.haveOpenTabs
      ) {
        this.$store.commit("openModal", "edit-ascii");

        return;
      }

      // Paste ASCII
      if (e.key === "p" && this.isDefault && !this.isTextEditing) {
        this.$store.commit("openModal", "paste-ascii");

        return;
      }

      // Export to clipboard
      if (e.key === "C" && ctrlKey && shiftKey && this.haveOpenTabs) {
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
      if (e.key === "F" && ctrlKey && shiftKey && this.haveOpenTabs) {
        let ascii = exportMirc();
        downloadFile(ascii.output.join(""), ascii.filename, "text/plain");

        return;
      }

      if (
        e.key === "]" &&
        ctrlKey &&
        this.brushSizeHeight < maxBrushSize &&
        this.brushSizeHeight >= 1 &&
        this.brushSizeWidth < maxBrushSize &&
        this.brushSizeWidth >= 1 &&
        this.haveOpenTabs
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
        this.brushSizeHeight <= maxBrushSize &&
        this.brushSizeHeight > 1 &&
        this.brushSizeWidth <= maxBrushSize &&
        this.brushSizeWidth > 1 &&
        this.haveOpenTabs
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
      if (this.isBrushing && this.haveOpenTabs) {
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

    document.addEventListener("keydown", this.keyListener.bind(this));

    document.body.addEventListener("keyup", function (e) {
      this.isPressed = false;
    });
  },
  data: () => ({
    isPressed: false,
  }),
  props: ["selectedBlocks", "textEditing", "selecting", "isInputtingBrushSize", "showingPostUrl"],
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
    }
  },
  methods: {
    undo() {
      this.$store.commit("undoBlocks");
    },
    redo() {
      this.$store.commit("redoBlocks");
    },
    canvasKeyDown(char) {
      if (this.isTextEditing) {
        if (
          this.currentAsciiLayerBlocks[this.textEditing.startY] &&
          this.currentAsciiLayerBlocks[this.textEditing.startY][
            this.textEditing.startX
          ]
        ) {
          let targetBlock =
            this.currentAsciiLayerBlocks[this.textEditing.startY][
              this.textEditing.startX
            ];

          switch (char) {
            // Remove a character
            case "Backspace":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
                targetBlock =
                  this.currentAsciiLayerBlocks[this.textEditing.startY][
                    this.textEditing.startX - 1
                  ];

                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ].char = null;
                this.textEditing.startX -= 1;
              }

            // Remove char as current position, but don't change position after
            case "Delete":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX
                ]
              ) {
                targetBlock =
                  this.currentAsciiLayerBlocks[this.textEditing.startY][
                    this.textEditing.startX
                  ];

                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX
                ].char = null;
              }

              // Also remove in mirror mode the other chars
              if (this.mirrorX) {
                targetBlock =
                  this.currentAsciiLayerBlocks[this.textEditing.startY][
                    this.currentAsciiWidth - this.textEditing.startX
                  ];

                targetBlock.char = null;
              }

              if (this.mirrorY) {
                targetBlock =
                  this.currentAsciiLayerBlocks[
                    this.currentAsciiHeight - this.textEditing.startY
                  ][this.textEditing.startX];
                targetBlock.char = null;
              }

              if (this.mirrorY && this.mirrorX) {
                targetBlock =
                  this.currentAsciiLayerBlocks[
                    this.currentAsciiHeight - this.textEditing.startY
                  ][this.currentAsciiWidth - this.textEditing.startX];

                targetBlock.char = null;
              }

              break;

            // Jump to next line at the 0 X position
            case "Enter":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY + 1][0]
              ) {
                this.textEditing.startX = 0;
                this.textEditing.startY += 1;
              }
              break;

            // Move the text indicator around with the arrow keys
            case "ArrowUp":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY - 1][
                  this.textEditing.startX
                ]
              ) {
                this.textEditing.startY -= 1;
              }
              break;

            case "ArrowDown":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY + 1][
                  this.textEditing.startX
                ]
              ) {
                this.textEditing.startY += 1;
              }
              break;

            case "ArrowLeft":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
                this.textEditing.startX -= 1;
              }
              break;

            case "ArrowRight":
              if (
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX + 1
                ]
              ) {
                this.textEditing.startX += 1;
              }
              break;

            // Normal typing
            default:
              if (char.length === 1) {
                if (this.canFg) {
                  targetBlock.fg = this.currentFg;
                }

                targetBlock.char = char;

                if (this.mirrorX) {
                  targetBlock =
                    this.currentAsciiLayerBlocks[this.textEditing.startY][
                      this.currentAsciiWidth - this.textEditing.startX
                    ];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY) {
                  targetBlock =
                    this.currentAsciiLayerBlocks[
                      this.currentAsciiHeight - this.textEditing.startY
                    ][this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY && this.mirrorX) {
                  targetBlock =
                    this.currentAsciiLayerBlocks[
                      this.currentAsciiHeight - this.textEditing.startY
                    ][this.currentAsciiWidth - this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (
                  this.currentAsciiLayerBlocks[this.textEditing.startY][
                    this.textEditing.startX + 1
                  ]
                ) {
                  this.textEditing.startX++;
                } else {
                  this.textEditing.startX = 0;

                  if (this.textEditing.startY < this.currentAsciiHeight) {
                    this.textEditing.startY++;
                  }
                }
              }

              break;
          }
        }

        // Emit back to dashboard then to editor that we need to redraw the canvas
        this.$emit("updatecanvas");
      }
    },
  },
};
</script>
