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

      if (_this.isTextEditing && _this.haveOpenTabs ) {
        _this.canvasKeyDown(event.key);
        return;
      }

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

    // New ASCII
    // Ctrl N doesn't seem to work in chrome? https://github.com/liftoff/GateOne/issues/290
    hotkeys("n", "editor", function (event, handler) {
      event.preventDefault();
      if (_this.isDefault && !_this.isTextEditing) {
        _this.$store.commit("openModal", "new-ascii");

        return;
      }
    });

    // Paste ASCII
    hotkeys("p", "editor", function (event, handler) {
      event.preventDefault();
      if (_this.isDefault && !_this.isTextEditing) {
        _this.$store.commit("openModal", "paste-ascii");
        return;
      }
    });

    // if (this.haveOpenTabs) {
    // Show / hide brush library
    hotkeys("l", "editor", function (event, handler) {
      event.preventDefault();
      if (_this.isDefault && _this.haveOpenTabs) {
        _this.$store.commit(
          "toggleBrushLibrary",
          !_this.brushLibraryState.visible
        );

        return;
      }
    });

    hotkeys("ctrl+v", function (event, handler) {
      event.preventDefault();
      if (
        _this.haveSelectBlocks &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        _this.$store.commit("pushBrushHistory", _this.brushBlocks);
        _this.$store.commit("brushBlocks", _this.selectBlocks);
        _this.$store.commit("changeTool", 4);
      }

      return;
    });

    // Show / hide debug panel
    hotkeys("d", "editor", function (event, handler) {
      event.preventDefault();
      if (_this.isDefault && _this.haveOpenTabs) {
        _this.$store.commit("toggleDebugPanel", !_this.debugPanelState.visible);

        return;
      }
    });

    // Edit ASCII
    hotkeys("e", "editor", function (event, handler) {
      event.preventDefault();
      if (_this.isDefault && !_this.isTextEditing && _this.haveOpenTabs) {
        _this.$store.commit("openModal", "edit-ascii");

        return;
      }
    });

    hotkeys("ctrl+shift+c", "editor", function (event, handler) {
      event.preventDefault();
      let ascii = exportMirc();
      _this.$copyText(ascii.output.join("")).then(
        (e) => {
          _this.$toasted.show("Copied mIRC to clipboard!", {
            type: "success",
          });
        },
        (e) => {
          _this.$toasted.show("Error when copying mIRC to clipboard!", {
            type: "error",
          });
        }
      );

      return;
    });

    hotkeys("ctrl+shift+f", "editor", function (event, handler) {
      event.preventDefault();
      let ascii = exportMirc();
      downloadFile(ascii.output.join(""), ascii.filename, "text/plain");
      return;
    });

    hotkeys("ctrl+]", "editor", function (event, handler) {
      event.preventDefault();
      if (
        _this.brushSizeHeight < maxBrushSize &&
        _this.brushSizeHeight >= 1 &&
        _this.brushSizeWidth < maxBrushSize &&
        _this.brushSizeWidth >= 1 &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        _this.$store.commit("updateBrushSize", {
          brushSizeHeight: parseInt(_this.brushSizeHeight) + 1,
          brushSizeWidth: parseInt(_this.brushSizeWidth) + 1,
          brushSizeType: _this.brushSizeType,
        });

        return;
      }
    });

    hotkeys("ctrl+[", "editor", function (event, handler) {
      event.preventDefault();
      if (
        _this.brushSizeHeight <= maxBrushSize &&
        _this.brushSizeHeight > 1 &&
        _this.brushSizeWidth <= maxBrushSize &&
        _this.brushSizeWidth > 1 &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        _this.$store.commit("updateBrushSize", {
          brushSizeHeight: parseInt(_this.brushSizeHeight) - 1,
          brushSizeWidth: parseInt(_this.brushSizeWidth) - 1,
          brushSizeType: _this.brushSizeType,
        });

        return;
      }
    });

    // Hopefully we can still pick up the previous inputs
    // while in brush mode

    hotkeys("e", "editor", function (event, handler) {
      if (_this.isBrushing && _this.haveOpenTabs) {
        event.preventDefault();
        _this.$store.commit("flipRotateBlocks", {
          type: "flip",
        });

        return;
      }
    });

    hotkeys("q", "editor", function (event, handler) {
      if (_this.isBrushing && _this.haveOpenTabs) {
        event.preventDefault();
        _this.$store.commit("flipRotateBlocks", {
          type: "rotate",
        });

        return;
      }
    });

    hotkeys("ctrl+y", function (event, handler) {
      event.preventDefault();
      _this.redo();
      return;
    });

    hotkeys("ctrl+z", function (event, handler) {
      event.preventDefault();
      _this.undo();
      return;
    });

    hotkeys("ctrl+c", function (event, handler) {
      if (
        _this.selectedBlocks.length &&
        _this.isSelected &&
        _this.isSelecting &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        event.preventDefault();

        _this.$store.commit(
          "selectBlocks",
          filterNullBlocks(_this.selectedBlocks)
        );

        _this.$toasted.show("Copied blocks!", {
          type: "success",
          icon: "fa-check-circle",
        });
      }

      return;
    });

    hotkeys("ctrl+x", function (event, handler) {
      if (
        _this.isSelected &&
        _this.isSelecting &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        event.preventDefault();

        if (_this.selectedBlocks.length) {
          for (let y = 0; y < _this.selectedBlocks.length + 1; y++) {
            for (let x = 0; x < getBlocksWidth(_this.selectedBlocks) + 1; x++) {
              if (_this.selectedBlocks[y] && _this.selectedBlocks[y][x]) {
                _this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
              }
            }
          }

          _this.$store.commit(
            "selectBlocks",
            filterNullBlocks(_this.selectedBlocks)
          );

          _this.selectedBlocks = [];

          // Reset and hide the select after successful copy

          _this.$store.commit(
            "updateAsciiBlocks",
            _this.currentAsciiLayerBlocks
          );
          _this.$emit("updatecanvas");

          _this.$toasted.show("Cut blocks!", {
            type: "success",
            icon: "fa-check-circle",
          });
        }

        return;
      }
    });

    hotkeys("alt+g", function (event, handler) {
      event.preventDefault();
      _this.$store.commit("toggleGridView", !_this.gridView);
      return;
    });

    hotkeys("alt+r", function (event, handler) {
      event.preventDefault();
      let bg = _this.currentBg;
      let fg = _this.currentFg;

      _this.$store.commit("changeColourFg", bg);
      _this.$store.commit("changeColourBg", fg);
      return;
    });

    hotkeys("alt+f", function (event, handler) {
      event.preventDefault();
      _this.$store.commit(
        "changeIsUpdatingFg",
        !_this.toolbarState.isChoosingFg
      );
      return;
    });

    hotkeys("alt+b", function (event, handler) {
      event.preventDefault();
      _this.$store.commit(
        "changeIsUpdatingBg",
        !_this.toolbarState.isChoosingBg
      );
      return;
    });

    hotkeys("alt+c", function (event, handler) {
      event.preventDefault();
      _this.$store.commit(
        "changeIsUpdatingChar",
        !_this.toolbarState.isChoosingChar
      );
      return;
    });

    hotkeys("Delete", "editor", function (event, handler) {
      if (
        _this.isSelected &&
        _this.isSelecting &&
        _this.haveOpenTabs &&
        !_this.isShowingDialog &&
        !_this.isModalOpen
      ) {
        event.preventDefault();

        if (_this.selectedBlocks.length) {
          for (let y = 0; y < _this.selectedBlocks.length + 1; y++) {
            for (let x = 0; x < getBlocksWidth(_this.selectedBlocks) + 1; x++) {
              if (_this.selectedBlocks[y] && _this.selectedBlocks[y][x]) {
                _this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
              }
            }
          }

          // Reset and hide the select after successful copy
          _this.$store.commit(
            "updateAsciiBlocks",
            _this.currentAsciiLayerBlocks
          );
          _this.$emit("updatecanvas");

          _this.$toasted.show("Deleted blocks!", {
            type: "success",
            icon: "fa-check-circle",
          });
        }

        return;
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
    canvasKeyDown(char) {
      if (this.isTextEditing) {
        console.log(char);
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
