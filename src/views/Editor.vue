<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <vue-draggable-resizable
        style="z-index: 5"
        :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
        :w="canvas.width"
        :h="canvas.height"
        :draggable="isDefault"
        @resizestop="onCanvasResize"
        @dragstop="onCavasDragStop"
        :x="currentAscii.x"
        :y="currentAscii.y"
      >
        <canvas
          ref="canvastools"
          id="canvastools"
          class="canvastools"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        />

        <canvas
          ref="canvas"
          id="canvas"
          class="canvas"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        />
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<style>
.canvastools {
  position: absolute;
  font-family: "Hack";
  z-index: 100;
  opacity: 0.6;
  cursor: crosshair;
}

.canvas {
  position: absolute;
  font-family: "Hack";
  background: rgba(0, 0, 0, 0.8);
  border: lightgrey 1px solid;
  z-index: 0;
}
</style>

<script>
import {
  toolbarIcons,
  mircColours99,
  exportMirc,
  downloadFile,
  filterNullBlocks,
  blockWidth,
  blockHeight,
  maxBrushSize,
  fillNullBlocks,
  emptyBlock,
  getBlocksWidth,
} from "../ascii";

export default {
  name: "Editor",
  mounted() {
    if (this.currentAsciiBlocks) {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.toolCtx = this.$refs.canvastools.getContext("2d");

      this.canvas.width = this.currentAscii.width * blockWidth;
      this.canvas.height = this.currentAscii.height * blockHeight;

      this.delayRedrawCanvas();

      // this.$store.commit("changeTool", 0);

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

        // Show / hide grid view
        if (e.key === "g" && altKey) {
          this.$store.commit("toggleGridView", !this.gridView);

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
        if (e.key === "c" && ctrlKey && !shiftKey && this.isSelected) {
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
                  this.currentAsciiBlocks[y][x] = { ...emptyBlock };
                }
              }
            }

            // Reset and hide the select after successful copy
            this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
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
                  this.currentAsciiBlocks[y][x] = { ...emptyBlock };
                }
              }
            }

            this.$store.commit(
              "selectBlocks",
              this.filterNullBlocks(this.selectedBlocks)
            );

            this.selectedBlocks = [];

            // Reset and hide the select after successful copy

            this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
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
        if (e.key === "n" && this.isDefault) {
          this.$store.commit("openModal", "new-ascii");

          return;
        }

        // Edit ASCII
        if (e.key === "e" && this.isDefault) {
          this.$store.commit("openModal", "edit-ascii");

          return;
        }

        // Paste ASCII
        if (e.key === "p" && this.isDefault) {
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

      document.addEventListener("keydown", this.keyListener.bind(this));
    }
  },
  data: () => ({
    ctx: null,
    toolCtx: null,
    canvas: {
      width: 512,
      height: 512,
    },
    x: 0, // Ascii X and Y
    y: 0, // Ascii X and Y
    redraw: true, // Used to limit canvas redraw
    canTool: false,
    textEditing: {
      startX: null,
      startY: null,
    },
    selecting: {
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      canSelect: false,
    },
    isMouseOnCanvas: false,
    selectedBlocks: [],
  }),
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
    isTextEditingValues() {
      return (
        this.textEditing.startX !== null && this.textEditing.startY !== null
      );
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
    canvasX() {
      return this.x * blockWidth;
    },
    canvasY() {
      return this.y * blockHeight;
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
    options() {
      return this.$store.getters.options;
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
    gridView() {
      return this.$store.getters.gridView;
    },
    asciiBlockAtXy() {
      return this.currentAsciiBlocks[this.y] &&
        this.currentAsciiBlocks[this.y][this.x]
        ? this.currentAsciiBlocks[this.y][this.x]
        : false;
    },
    maxBrushSize() {
      return maxBrushSize;
    },
  },
  watch: {
    currentAscii(val, old) {
      if (val !== old) {
        this.onCanvasResize(
          100,
          100,
          this.currentAscii.width * blockWidth,
          this.currentAscii.height * blockHeight
        );

        this.canvas.width = this.currentAscii.width * blockWidth;
        this.canvas.height = this.currentAscii.height * blockHeight;

        this.delayRedrawCanvas();

        document.title = `asciibird - ${this.currentAscii.title}`;
      }
    },
    currentTool() {
      switch (this.currentTool.name) {
        case "default":
          // Reset default values for tools
          this.textEditing = {
            startX: null,
            startY: null,
          };

          this.resetSelect();
          break;
      }
    },
    isMouseOnCanvas() {
      if (!this.isSelecting) {
        this.clearToolCanvas();
        this.canTool = false;
      }
    },
    gridView(val, old) {
      if (val !== old) {
        this.delayRedrawCanvas();
      }
    },
    brushBlocks() {
      this.clearToolCanvas();

      // This was supposed to update the brush preview real time
      if (this.isMouseOnCanvas && this.isBrushing) {
        this.drawBrush();
      }
    },
  },
  methods: {
    undo() {
      this.$store.commit("undoBlocks");
      this.delayRedrawCanvas();
    },
    redo() {
      this.$store.commit("redoBlocks");
      this.delayRedrawCanvas();
    },
    resetSelect() {
      this.selecting = {
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        canSelect: false,
      };
    },
    redrawSelect() {
      if (this.currentAsciiBlocks.length) {
        this.clearToolCanvas();
        this.toolCtx.fillStyle = this.mircColours[0];

        this.toolCtx.fillRect(
          this.selecting.startX,
          this.selecting.startY,
          this.selecting.endX - this.selecting.startX,
          this.selecting.endY - this.selecting.startY
        );

        this.toolCtx.setLineDash([6]);
        this.toolCtx.strokeRect(
          this.selecting.startX,
          this.selecting.startY,
          this.selecting.endX - this.selecting.startX,
          this.selecting.endY - this.selecting.startY
        );
      }
    },
    redrawCanvas() {
      if (this.currentAsciiBlocks.length) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        // hack font for ascii shout outs 2 beenz
        this.ctx.font = "13px Hack";

        for (y = 0; y < this.currentAscii.height + 1; y++) {
          canvasY = blockHeight * y;

          for (x = 0; x < this.currentAscii.width + 1; x++) {
            if (this.currentAsciiBlocks[y] && this.currentAsciiBlocks[y][x]) {
              curBlock = { ...this.currentAsciiBlocks[y][x] };

              canvasX = blockWidth * x;

              this.ctx.font = "13px Hack";

              if (this.gridView) {
                this.ctx.setLineDash([1]);
                this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
                this.ctx.strokeRect(canvasX, canvasY, blockWidth, blockHeight);
              }

              // Background block
              if (curBlock.bg !== null) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];
                this.ctx.fillRect(canvasX, canvasY, blockWidth, blockHeight);
              }

              if (curBlock.char) {
                if (curBlock.fg !== null) {
                  this.ctx.fillStyle = this.mircColours[curBlock.fg];
                } else {
                  this.ctx.fillStyle = "#000000";
                }

                this.ctx.fillText(
                  curBlock.char,
                  canvasX + 0.5,
                  canvasY + blockHeight - 3
                );
              }
            }
          }
        }
      }
    },
    onCanvasResize(left, top, width, height) {
      const canvasBlockHeight = Math.floor(height / blockHeight);
      const canvasBlockWidth = Math.floor(width / blockWidth);
      let blocks = fillNullBlocks(
        this.currentAsciiBlocks,
        canvasBlockHeight,
        canvasBlockWidth
      );

      this.canvas.width = width;
      this.canvas.height = height;

      this.$store.commit("changeAsciiWidthHeight", {
        width: canvasBlockWidth,
        height: canvasBlockHeight,
      });

      this.$store.commit("updateAsciiBlocks", blocks);

      this.delayRedrawCanvas();
    },
    onCavasDragStop(x, y) {
      // Update left and top in panel
      this.$store.commit("changeAsciiCanvasState", { x, y });
    },
    canvasKeyDown(char) {
      if (this.isTextEditing) {
        if (
          this.currentAsciiBlocks[this.textEditing.startY] &&
          this.currentAsciiBlocks[this.textEditing.startY][
            this.textEditing.startX
          ]
        ) {
          let targetBlock =
            this.currentAsciiBlocks[this.textEditing.startY][
              this.textEditing.startX
            ];

          switch (char) {
            // Remove a character
            case "Backspace":
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
                targetBlock =
                  this.currentAsciiBlocks[this.textEditing.startY][
                    this.textEditing.startX - 1
                  ];

                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ].char = null;
                this.textEditing.startX -= 1;
              }

            // Remove char as current position, but don't change position after
            case "Delete":
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX
                ]
              ) {
                targetBlock =
                  this.currentAsciiBlocks[this.textEditing.startY][
                    this.textEditing.startX
                  ];

                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX
                ].char = null;
              }

              // Also remove in mirror mode the other chars
              if (this.mirrorX) {
                targetBlock =
                  this.currentAsciiBlocks[this.textEditing.startY][
                    this.currentAscii.width - this.textEditing.startX
                  ];

                targetBlock.char = null;
              }

              if (this.mirrorY) {
                targetBlock =
                  this.currentAsciiBlocks[
                    this.currentAscii.height - this.textEditing.startY
                  ][this.textEditing.startX];
                targetBlock.char = null;
              }

              if (this.mirrorY && this.mirrorX) {
                targetBlock =
                  this.currentAsciiBlocks[
                    this.currentAscii.height - this.textEditing.startY
                  ][this.currentAscii.width - this.textEditing.startX];

                targetBlock.char = null;
              }

              break;

            // Jump to next line at the 0 X position
            case "Enter":
              if (this.currentAsciiBlocks[this.textEditing.startY + 1][0]) {
                this.textEditing.startX = 0;
                this.textEditing.startY += 1;
              }
              break;

            // Move the text indicator around with the arrow keys
            case "ArrowUp":
              if (
                this.currentAsciiBlocks[this.textEditing.startY - 1][
                  this.textEditing.startX
                ]
              ) {
                this.textEditing.startY -= 1;
              }
              break;

            case "ArrowDown":
              if (
                this.currentAsciiBlocks[this.textEditing.startY + 1][
                  this.textEditing.startX
                ]
              ) {
                this.textEditing.startY += 1;
              }
              break;

            case "ArrowLeft":
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
                this.textEditing.startX -= 1;
              }
              break;

            case "ArrowRight":
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
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
                    this.currentAsciiBlocks[this.textEditing.startY][
                      this.currentAscii.width - this.textEditing.startX
                    ];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY) {
                  targetBlock =
                    this.currentAsciiBlocks[
                      this.currentAscii.height - this.textEditing.startY
                    ][this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY && this.mirrorX) {
                  targetBlock =
                    this.currentAsciiBlocks[
                      this.currentAscii.height - this.textEditing.startY
                    ][this.currentAscii.width - this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (
                  this.currentAsciiBlocks[this.textEditing.startY][
                    this.textEditing.startX + 1
                  ]
                ) {
                  this.textEditing.startX++;
                } else {
                  this.textEditing.startX = 0;

                  if (this.textEditing.startY < this.currentAscii.height) {
                    this.textEditing.startY++;
                  }
                }
              }

              break;
          }
        }
        this.delayRedrawCanvas();

        // It's a bit intense to push this every single keystroke
        // this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
        this.clearToolCanvas();
        this.drawTextIndicator();
        this.drawIndicator();
      }
    },
    // Mouse Up, Down and Move
    canvasMouseUp() {
      if (this.isDefault) return;

      switch (this.currentTool.name) {
        case "brush":
          this.canTool = false;

          this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);

          break;

        case "eraser":
          this.canTool = false;
          this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
          break;

        case "fill-eraser":
        case "fill":
          this.canTool = false;
          break;

        case "select":
          this.selecting.canSelect = false;
          this.processSelect();
          break;

        case "text":
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
          break;
      }

      this.delayRedrawCanvas();
    },
    canvasMouseDown() {
      if (this.isDefault) return;

      if (this.asciiBlockAtXy && this.currentTool) {
        const targetBlock = this.asciiBlockAtXy;

        switch (this.currentTool.name) {
          case "select":
            this.selecting.startX = this.canvasX;
            this.selecting.startY = this.canvasY;
            this.selecting.canSelect = true;
            this.clearToolCanvas();
            break;

          case "fill":
            this.fill();
            this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
            this.canTool = false;
            break;

          case "fill-eraser":
            this.fill(true);
            this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
            this.canTool = false;
            break;

          case "brush":
            this.canTool = true;
            this.drawBrush();
            break;

          case "eraser":
            this.canTool = true;
            this.eraser();
            break;

          case "dropper":
            if (this.canFg) {
              this.$store.commit("changeColourFg", targetBlock.fg);
            }

            if (this.canBg) {
              this.$store.commit("changeColourBg", targetBlock.bg);
            }

            if (this.canText) {
              this.$store.commit("changeChar", targetBlock.char);
            }

            this.$store.commit("changeTool", 0);
            break;
        }
      }
    },
    canvasMouseMove(e) {
      if (this.isDefault) return;

      let lastX = this.x;
      let lastY = this.y;

      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / blockWidth);
      this.y = Math.floor(this.y / blockHeight);

      if (this.x === lastX && this.y === lastY) {
        return;
      }
      this.$emit("coordsupdate", { x: this.x, y: this.y });

      if (this.asciiBlockAtXy) {
        switch (this.currentTool.name) {
          case "brush":
            if (this.isMouseOnCanvas) {
              this.clearToolCanvas();
              this.drawBrush();
            }
            break;

          case "eraser":
            this.clearToolCanvas();

            if (this.isMouseOnCanvas) {
              this.drawBrush(true);
            }
            this.eraser();
            break;

          case "select":
            if (this.selecting.canSelect) {
              this.selecting.endX = this.canvasX;
              this.selecting.endY = this.canvasY;

              this.redrawSelect();
            }

            if (!this.isSelected) {
              this.redrawSelect();
            }

            break;

          case "text":
            this.clearToolCanvas();
            this.drawIndicator();

            if (this.isTextEditingValues) {
              this.drawTextIndicator();
            }
            break;

          case "dropper":
            this.clearToolCanvas();
            this.drawIndicator();
            break;

          case "fill":
          case "fill-eraser":
            this.clearToolCanvas();
            this.drawIndicator();
            break;
        }
      }

      this.delayRedrawCanvas();
    },
    clearToolCanvas() {
      if (this.toolCtx) {
        this.toolCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;
        requestAnimationFrame(() => {
          this.redraw = true;
          this.redrawCanvas();
        });
      }
    },
    getBlocksWidth(blocks) {
      return getBlocksWidth(blocks);
    },
    filterNullBlocks(blocks) {
      return filterNullBlocks(blocks);
    },
    //
    // TOOLS
    //
    processSelect() {
      //
      let x = 0;
      let y = 0;

      let curBlock = {};
      this.selectedBlocks = [];

      // If we select from the bottom right towards top left
      // we need to swap the values
      if (this.selecting.endY < this.selecting.startY) {
        let end = this.selecting.endY;
        let start = this.selecting.startY;

        this.selecting.startY = end;
        this.selecting.endY = start;
      }

      if (this.selecting.endX < this.selecting.startX) {
        let end = this.selecting.endX;
        let start = this.selecting.startX;

        this.selecting.startX = end;
        this.selecting.endX = start;
      }

      for (y = 0; y < this.currentAscii.height; y++) {
        if (
          y > Math.floor(this.selecting.startY / blockHeight) - 1 &&
          y < Math.floor(this.selecting.endY / blockHeight)
        ) {
          if (!this.selectedBlocks[y]) {
            this.selectedBlocks[y] = [];
          }

          for (x = 0; x < this.currentAscii.width; x++) {
            if (
              x > Math.ceil(this.selecting.startX / blockWidth) - 1 &&
              x <= Math.ceil(this.selecting.endX / blockWidth) - 1
            ) {
              if (this.currentAsciiBlocks[y] && this.currentAsciiBlocks[y][x]) {
                curBlock = { ...this.currentAsciiBlocks[y][x] };

                if (!this.selectedBlocks[y][x]) {
                  this.selectedBlocks[y][x] = { ...curBlock };
                }
              }
            }
          }
        }
      }
    },
    drawRectangleBlock(x, y) {
      let indicatorColour = this.asciiBlockAtXy.bg === 0 ? 1 : 0;

      if (this.asciiBlockAtXy.bg === 8) {
        indicatorColour = 1;
      }

      this.toolCtx.fillStyle = this.mircColours[indicatorColour];

      this.toolCtx.fillRect(
        x * blockWidth,
        y * blockHeight,
        blockWidth,
        blockHeight
      );

      this.toolCtx.setLineDash([1, 2]);
      this.toolCtx.strokeRect(
        x * blockWidth,
        y * blockHeight,
        blockWidth,
        blockHeight
      );
    },
    drawIndicator() {
      // if (clear) {
      //   this.clearToolCanvas();
      // }

      this.drawRectangleBlock(this.x, this.y);

      if (this.isTextEditing) {
        this.toolCtx.font = '600 22px "Font Awesome 5 Free"';
        this.toolCtx.fillText(
          "\uf031",
          this.x * blockWidth,
          this.y * blockHeight + blockHeight * 2
        );
        this.toolCtx.font = "13px Hack";
      }

      if (this.isTextEditing) {
        if (this.mirrorX) {
          this.drawRectangleBlock(this.currentAscii.width - this.x, this.y);
        }

        if (this.mirrorY) {
          this.drawRectangleBlock(this.x, this.currentAscii.height - this.y);
        }

        if (this.mirrorY && this.mirrorX) {
          this.drawRectangleBlock(
            this.currentAscii.width - this.x,
            this.currentAscii.height - this.y
          );
        }
      }
    },
    drawTextIndicator() {
      this.drawRectangleBlock(this.textEditing.startX, this.textEditing.startY);

      if (this.mirrorX) {
        this.drawRectangleBlock(
          this.currentAscii.width - this.textEditing.startX,
          this.textEditing.startY
        );
      }

      if (this.mirrorY) {
        this.drawRectangleBlock(
          this.textEditing.startX,
          this.currentAscii.height - this.textEditing.startY
        );
      }

      if (this.mirrorY && this.mirrorX) {
        this.drawRectangleBlock(
          this.currentAscii.width - this.textEditing.startX,
          this.currentAscii.height - this.textEditing.startY
        );
      }
    },
    //
    // drawBrush
    //  - draws brush
    //  - draws preview for all toolbar things that need it
    //  - also works with the copy / paste
    drawBrush(plain = false) {
      this.clearToolCanvas();

      let targetBlock = this.asciiBlockAtXy;
      let brushDiffX = 0;
      let xLength = 0;

      const asciiWidth = this.currentAscii.width;
      const asciiHeight = this.currentAscii.height;

      // If the first row isn't selected then we cannot get the width
      // with the 0 index
      for (let i = 0; i <= this.brushBlocks.length; i++) {
        if (this.brushBlocks[i]) {
          brushDiffX = Math.floor(this.brushBlocks[i].length / 2) * blockWidth;
          xLength = this.brushBlocks[i].length;
          break;
        }
      }

      // We always have a Y array
      const brushDiffY = Math.floor(this.brushBlocks.length / 2) * blockHeight;

      for (let y = 0; y < this.brushBlocks.length; y++) {
        if (!this.brushBlocks[y]) {
          continue;
        }

        for (let x = 0; x < xLength; x++) {
          if (!this.brushBlocks[y][x]) {
            continue;
          }

          const brushBlock = this.brushBlocks[y][x];

          const brushX = this.x * blockWidth + x * blockWidth - brushDiffX;
          const brushY = this.y * blockHeight + y * blockHeight - brushDiffY;

          const arrayY = brushY / blockHeight;
          const arrayX = brushX / blockWidth;

          if (
            this.currentAsciiBlocks[arrayY] &&
            this.currentAsciiBlocks[arrayY][arrayX]
          ) {
            targetBlock = this.currentAsciiBlocks[arrayY][arrayX];

            if (!plain) {
              if (this.canBg) {
                this.toolCtx.fillStyle =
                  brushBlock.bg !== null
                    ? this.mircColours[brushBlock.bg]
                    : "rgba(255,255,255,0.4)";

                this.toolCtx.setLineDash([1, 2]);
                this.toolCtx.strokeRect(
                  brushX,
                  brushY,
                  blockWidth,
                  blockHeight
                );

                this.toolCtx.fillRect(brushX, brushY, blockWidth, blockHeight);

                if (this.mirrorX) {
                  this.toolCtx.fillRect(
                    (asciiWidth - arrayX) * blockWidth,
                    brushY,
                    blockWidth,
                    blockHeight
                  );

                  this.toolCtx.setLineDash([1, 2]);
                  this.toolCtx.strokeRect(
                    (asciiWidth - arrayX) * blockWidth,
                    brushY,
                    blockWidth,
                    blockHeight
                  );
                }

                if (this.mirrorY) {
                  this.toolCtx.fillRect(
                    brushX,
                    (asciiHeight - arrayY) * blockHeight,
                    blockWidth,
                    blockHeight
                  );

                  this.toolCtx.setLineDash([1, 2]);
                  this.toolCtx.strokeRect(
                    brushX,
                    (asciiHeight - arrayY) * blockHeight,
                    blockWidth,
                    blockHeight
                  );
                }

                if (this.mirrorY && this.mirrorX) {
                  this.toolCtx.fillRect(
                    (asciiWidth - arrayX) * blockWidth,
                    (asciiHeight - arrayY) * blockHeight,
                    blockWidth,
                    blockHeight
                  );

                  this.toolCtx.setLineDash([1, 2]);
                  this.toolCtx.strokeRect(
                    (asciiWidth - arrayX) * blockWidth,
                    (asciiHeight - arrayY) * blockHeight,
                    blockWidth,
                    blockHeight
                  );
                }

                if (this.canTool && brushBlock.bg !== null) {
                  targetBlock.bg = brushBlock.bg;

                  if (
                    this.mirrorX &&
                    this.currentAsciiBlocks[arrayY] &&
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX]
                  ) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].bg =
                      brushBlock.bg;
                  }

                  if (
                    this.mirrorY &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].bg =
                      brushBlock.bg;
                  }

                  if (
                    this.mirrorY &&
                    this.mirrorX &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].bg = brushBlock.bg;
                  }
                }
              }

              if (this.canFg) {
                this.toolCtx.fillStyle =
                  brushBlock.fg !== null
                    ? this.mircColours[brushBlock.fg]
                    : "#000000";

                if (this.canTool && brushBlock.fg !== null) {
                  targetBlock.fg = brushBlock.fg;

                  if (
                    this.mirrorX &&
                    this.currentAsciiBlocks[arrayY] &&
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX]
                  ) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].fg =
                      brushBlock.fg;
                  }

                  if (
                    this.mirrorY &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].fg =
                      brushBlock.fg;
                  }

                  if (
                    this.mirrorY &&
                    this.mirrorX &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].fg = brushBlock.fg;
                  }
                }
              }

              if (this.canText && brushBlock.char !== null) {
                this.toolCtx.fillStyle = this.mircColours[brushBlock.fg];

                this.toolCtx.fillText(
                  brushBlock.char,
                  brushX - 1,
                  brushY + blockHeight - 2
                );

                if (this.mirrorX) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    (asciiWidth - arrayX) * blockWidth,
                    brushY + blockHeight - 2
                  );
                }

                if (this.mirrorY) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    brushX - 1,
                    (asciiHeight - arrayY) * blockHeight + 10
                  );
                }
                if (this.mirrorY && this.mirrorX) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    (asciiWidth - arrayX) * blockWidth,
                    (asciiHeight - arrayY) * blockHeight + 10
                  );
                }

                if (this.canTool && brushBlock.char !== null) {
                  targetBlock.char = !this.haveSelectBlocks
                    ? this.currentChar
                    : brushBlock.char;

                  if (
                    this.mirrorX &&
                    this.currentAsciiBlocks[arrayY] &&
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX]
                  ) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].char =
                      brushBlock.char;
                  }

                  if (
                    this.mirrorY &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].char =
                      brushBlock.char;
                  }

                  if (
                    this.mirrorY &&
                    this.mirrorX &&
                    this.currentAsciiBlocks[asciiHeight - arrayY] &&
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ]
                  ) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].char = brushBlock.char;
                  }
                }
              }
            } else {
              let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

              if (targetBlock.bg === 8) {
                indicatorColour = 1;
              }

              this.toolCtx.fillStyle = this.mircColours[indicatorColour];

              this.toolCtx.fillRect(brushX, brushY, blockWidth, blockHeight);

              if (this.mirrorX) {
                this.toolCtx.fillRect(
                  (asciiWidth - arrayX) * blockWidth,
                  brushY,
                  blockWidth,
                  blockHeight
                );
              }

              if (this.mirrorY) {
                this.toolCtx.fillRect(
                  brushX,
                  (asciiHeight - arrayY) * blockHeight,
                  blockWidth,
                  blockHeight
                );
              }

              if (this.mirrorY && this.mirrorX) {
                this.toolCtx.fillRect(
                  (asciiWidth - arrayX) * blockWidth,
                  (asciiHeight - arrayY) * blockHeight,
                  blockWidth,
                  blockHeight
                );
              }
            }
          }
        }
      }
    },
    eraser() {
      if (this.canTool) {
        let targetBlock = this.asciiBlockAtXy;

        const brushDiffX =
          Math.floor(this.brushBlocks[0].length / 2) * blockWidth;
        const brushDiffY =
          Math.floor(this.brushBlocks.length / 2) * blockHeight;

        for (let y = 0; y < this.brushBlocks.length; y++) {
          for (let x = 0; x < this.brushBlocks[0].length; x++) {
            const brushX = this.x * blockWidth + x * blockWidth - brushDiffX;
            const brushY = this.y * blockHeight + y * blockHeight - brushDiffY;

            const arrayY = brushY / blockHeight;
            const arrayX = brushX / blockWidth;

            if (this.asciiBlockAtXy) {
              targetBlock = this.currentAsciiBlocks[arrayY][arrayX];

              if (this.canFg) {
                targetBlock.fg = null;
              }

              if (this.canBg) {
                targetBlock.bg = null;
              }

              if (this.canText) {
                targetBlock.char = null;
              }
            }

            if (this.mirrorX) {
              if (
                this.currentAsciiBlocks[arrayY] &&
                this.currentAsciiBlocks[arrayY][
                  this.currentAscii.width - arrayX
                ]
              ) {
                targetBlock =
                  this.currentAsciiBlocks[arrayY][
                    this.currentAscii.width - arrayX
                  ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }

            if (this.mirrorY) {
              if (
                this.currentAsciiBlocks[this.currentAscii.height - arrayY] &&
                this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  arrayX
                ]
              ) {
                targetBlock =
                  this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                    arrayX
                  ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }

            if (this.mirrorY && this.mirrorX) {
              if (
                this.currentAsciiBlocks[this.currentAscii.height - arrayY] &&
                this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  this.currentAscii.width - arrayX
                ]
              ) {
                targetBlock =
                  this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                    this.currentAscii.width - arrayX
                  ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }
          }
        }
      }
    },
    // Fill tool
    fill(eraser = false) {
      const newColor = this.currentBg;
      const current = this.asciiBlockAtXy.bg;

      // If the newColor is same as the existing
      // Then return the original image.
      if (current === newColor && !eraser) {
        return this.currentAsciiBlocks;
      }

      this.fillTool(this.currentAsciiBlocks, this.y, this.x, current, eraser);
    },
    fillTool(fillBlocks, y, x, current, eraser) {
      // If row is less than 0
      if (x < 0) {
        return;
      }

      // If column is less than 0
      if (y < 0) {
        return;
      }

      // If row is greater than image length
      if (x >= this.currentAscii.width) {
        return;
      }

      // If column is greater than image length
      if (y >= this.currentAscii.height) {
        return;
      }

      if (!fillBlocks[y] && !fillBlocks[y][x]) {
        return;
      }

      // If the current pixel is not which needs to be replaced
      if (fillBlocks[y][x].bg !== current) {
        return;
      }

      // We can eraser or fill
      if (this.canBg) {
        fillBlocks[y][x].bg = eraser ? null : this.currentBg;
      }

      if (this.canFg) {
        fillBlocks[y][x].fg = eraser ? null : this.currentFg;
      }

      if (this.canText) {
        fillBlocks[y][x].char = eraser ? null : this.currentChar;
      }

      // Fill in all four directions
      // Fill Prev row
      this.fillTool(fillBlocks, y, x - 1, current, eraser);

      // Fill Next row
      this.fillTool(fillBlocks, y, x + 1, current, eraser);

      // Fill Prev col
      this.fillTool(fillBlocks, y - 1, x, current, eraser);

      // Fill next col
      this.fillTool(fillBlocks, y + 1, x, current, eraser);
    },
  },
};
</script>
