<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <vue-draggable-resizable
        ref="canvasdrag"
        :grid="[blockWidth, blockHeight]"
        :w="currentAsciiWidth * blockWidth"
        :h="currentAsciiHeight * blockHeight"
        :draggable="isDefault"
        @resizestop="onCanvasResize"
        @dragstop="onCavasDragStop"
        :x="currentAscii.x"
        :y="currentAscii.y"
      >
        <canvas
          id="overlay-image"
          :style="imageOverlayStyle"
          :width="currentAsciiWidth * blockWidth"
          :height="currentAsciiHeight * blockHeight"
        ></canvas>

        <canvas
          ref="canvas"
          id="canvas"
          class="canvas"
          :style="canvasTransparent"
          :width="currentAsciiWidth * blockWidth"
          :height="currentAsciiHeight * blockHeight"
        />

        <canvas
          ref="canvastools"
          id="canvastools"
          class="canvastools"
          :width="currentAsciiWidth * blockWidth"
          :height="currentAsciiHeight * blockHeight"
          @mousemove.left="canvasMouseMove"
          @mousedown.left="canvasMouseDown"
          @mouseup.left="canvasMouseUp"
          @touchmove="canvasMouseMove"
          @touchend="canvasMouseDown"
          @touchstart="canvasMouseUp"
        />
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<script>
import {
  toolbarIcons,
  mircColours99,
  filterNullBlocks,
  blockWidth,
  blockHeight,
  maxBrushSize,
  fillNullBlocks,
  getBlocksWidth,
  checkVisible,
  mergeLayers,
  cyrb53,
} from "../ascii";

export default {
  name: "Editor",
  mounted() {
    this.ctx = this.canvasRef.getContext("2d");
    this.toolCtx = this.$refs.canvastools.getContext("2d");
    this.delayRedrawCanvas();
  },
  created() {
    window.addEventListener("load", () => {
      // Fixes the font on load issue
      this.delayRedrawCanvas();
    });

    var _this = this;
    hotkeys("*", "editor", function (event, handler) {
      event.preventDefault();

      if (_this.isTextEditing) {
        _this.canvasKeyDown(event.key);
        return;
      }

      if (_this.isBrushing || _this.isErasing) {
        switch (event.key) {
          case "ArrowUp":
            _this.y--;
            _this.drawBrush(_this.isErasing);
            _this.delayRedrawCanvas();
            break;

          case "ArrowDown":
            _this.y++;
            _this.drawBrush(_this.isErasing);
            _this.delayRedrawCanvas();
            break;

          case "ArrowLeft":
            _this.x--;
            _this.drawBrush(_this.isErasing);
            _this.delayRedrawCanvas();
            break;

          case "ArrowRight":
            _this.x++;
            _this.drawBrush(_this.isErasing);
            _this.delayRedrawCanvas();
            break;

          case " ":
            _this.canTool = true;
            _this.isBrushing ? _this.drawBrush(false) : _this.eraser();
            _this.canTool = false;
            _this.dispatchBlocks();

            break;
        }
      }
    });

    if (this.currentAsciiLayerBlocks) {
      this.canvas.width = this.currentAsciiWidth * blockWidth;
      this.canvas.height = this.currentAsciiHeight * blockHeight;

      this.delayRedrawCanvas();
      this.$emit("textediting", this.textEditing);
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
    top: false,
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

    // Used to store the difference when editing blocks then commits them
    diffBlocks: {
      l: 0,
      old: [],
      new: [],
    },

    isUsingKeyboard: false,
  }),
  props: ["updateCanvas", "yOffset", "canvasxy", "brush"],
  computed: {
    canvasRef() {
      return this.$refs.canvas;
    },
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    selectedLayerIndex() {
      return this.currentAscii.selectedLayer || 0;
    },
    currentSelectedLayer() {
      return this.currentAsciiLayers[this.selectedLayerIndex];
    },
    currentAsciiLayerBlocks() {
      return this.currentSelectedLayer.data;
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
    isErasing() {
      return this.currentTool.name === "eraser";
    },
    isSelected() {
      return (
        this.selecting.startX !== null &&
        this.selecting.startY !== null &&
        this.selecting.endX !== null &&
        this.selecting.endY !== null
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
      return this.toolbarState.gridView;
    },
    asciiBlockAtXy() {
      return this.currentAsciiLayerBlocks[this.y] &&
        this.currentAsciiLayerBlocks[this.y][this.x]
        ? this.currentAsciiLayerBlocks[this.y][this.x]
        : false;
    },
    maxBrushSize() {
      return maxBrushSize;
    },
    currentAsciiWidth() {
      return this.currentSelectedLayer.width;
    },
    currentAsciiHeight() {
      return this.currentSelectedLayer.height;
    },
    imageOverlay() {
      return this.$store.getters.imageOverlay;
    },
    imageOverlayStyle() {
      let repeat = "background-repeat: no-repeat;";
      let stretched = "background-size: 100%;";

      if (this.imageOverlay.repeatx && this.imageOverlay.repeaty) {
        repeat = "background-repeat: repeat;";
      }

      if (this.imageOverlay.repeatx && !this.imageOverlay.repeaty) {
        repeat = "background-repeat: repeat-x;";
      }

      if (!this.imageOverlay.repeatx && this.imageOverlay.repeaty) {
        repeat = "background-repeat: repeat-y;";
      }

      if (this.imageOverlay.stretched) {
        stretched = "background-size: 100%;";
      } else {
        stretched = "";
      }

      return this.imageOverlay.visible
        ? `background-image: url('${
            this.imageOverlay.url
          }'); ${stretched} ${repeat} opacity: ${
            this.imageOverlay.opacity / 100
          }; z-index: -1; position: absolute;`
        : "position: absolute;";
    },
    canvasTransparent() {
      return this.imageOverlay.visible ? "opacity: 0.6;" : "opacity: 1;";
    },
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
    },
  },
  watch: {
    currentAscii(val, old) {
      if (val !== old) {
        this.canvas.width = this.currentAsciiWidth * blockWidth;
        this.canvas.height = this.currentAsciiHeight * blockHeight;
      }
    },
    currentAsciiLayerBlocks() {
      this.delayRedrawCanvas();
    },
    currentSelectedLayer(val, old) {
      if (old && old.visible) {
        this.warnInvisibleLayer();
      }
    },
    currentTool() {
      this.warnInvisibleLayer();

      switch (this.currentTool.name) {
        case "default":
          // Reset default values for tools
          this.textEditing = {
            startX: null,
            startY: null,
          };

          this.resetSelect();
          break;

        case "text":
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
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
    // For when we do zook, ctrl + or ctrl -
    // blockSizeMultiplier() {
    //   // this.delayRedrawCanvas();
    // },
    // Save text to store when finished
    isTextEditing(val, old) {
      if (val !== old && val === false) {
        this.dispatchBlocks();
      }
    },
    textEditing(val, old) {
      this.$emit("textediting", val);
    },
    updateCanvas(val, old) {
      if (val !== old) {
        // This comes from KeyboardShortcuts.vue
        this.clearToolCanvas();
        this.drawTextIndicator();
        this.drawIndicator();

        this.delayRedrawCanvas();
      }
    },
    selecting(val) {
      this.$emit("selecting", val);
    },
    yOffset() {
      this.delayRedrawCanvas();
    },
    selectedLayerIndex(val, old) {
      if (val !== old) {
        this.diffBlocks.l = val;
      }
    }
  },
  methods: {
    canvasKeyDown(char) {
      // if (this.isTextEditing) {
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

        let oldBlock = {};

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

              oldBlock = {
                ... targetBlock
              };

              delete this.currentAsciiLayerBlocks[this.textEditing.startY][
                this.textEditing.startX - 1
              ]['char'];

              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              );

              // Move back one block
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

              oldBlock = { ...targetBlock };

              delete this.currentAsciiLayerBlocks[this.textEditing.startY][
                this.textEditing.startX
              ]['char'];

              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock
              );
            }

            // Also remove in mirror mode the other chars
            if (this.mirrorX) {
              targetBlock =
                this.currentAsciiLayerBlocks[this.textEditing.startY][
                  this.currentAsciiWidth - this.textEditing.startX
                ];
              oldBlock = { ...targetBlock };
              delete targetBlock['char'];
              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock
              );
            }

            if (this.mirrorY) {

              targetBlock =
                this.currentAsciiLayerBlocks[
                  this.currentAsciiHeight - this.textEditing.startY
                ][this.textEditing.startX];
                oldBlock = { ...targetBlock };
              delete targetBlock['char'];
              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock);

            }

            if (this.mirrorY && this.mirrorX) {
              targetBlock =
                this.currentAsciiLayerBlocks[
                  this.currentAsciiHeight - this.textEditing.startY
                ][this.currentAsciiWidth - this.textEditing.startX];
              oldBlock = { ...targetBlock };
              delete targetBlock['char'];
              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock
              );
            }

            break;

          // Jump to next line at the 0 X position
          case "Enter":
            if (this.currentAsciiLayerBlocks[this.textEditing.startY + 1][0]) {
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

              oldBlock = { ...targetBlock };
              targetBlock.char = char;

              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock
              );

              let theX = this.currentAsciiWidth - this.textEditing.startX;
              if (this.mirrorX) {
                targetBlock =
                  this.currentAsciiLayerBlocks[this.textEditing.startY][theX];

                oldBlock = { ...targetBlock };

                if (this.canFg) {
                  targetBlock.fg = this.currentFg;
                }

                targetBlock.char = char;

                this.storeDiffBlocks(
                  theX,
                  this.textEditing.startY,
                  oldBlock,
                  targetBlock
                );
              }

              let theY = this.currentAsciiHeight - this.textEditing.startY;
              if (this.mirrorY) {
                targetBlock =
                  this.currentAsciiLayerBlocks[theY][this.textEditing.startX];

                oldBlock = { ...targetBlock };

                if (this.canFg) {
                  targetBlock.fg = this.currentFg;
                }

                targetBlock.char = char;

                this.storeDiffBlocks(
                  this.textEditing.startX,
                  theY,
                  oldBlock,
                  targetBlock
                );
              }

              if (this.mirrorY && this.mirrorX) {
                targetBlock = this.currentAsciiLayerBlocks[theY][theX];

                oldBlock = { ...targetBlock };

                if (this.canFg) {
                  targetBlock.fg = this.currentFg;
                }

                targetBlock.char = char;

                this.storeDiffBlocks(theX, theY, oldBlock, targetBlock);
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

      this.clearToolCanvas();
      this.drawTextIndicator();
      this.drawIndicator();

      this.delayRedrawCanvas();
    },
    warnInvisibleLayer() {
      if (!this.currentSelectedLayer && this.currentSelectedLayer.visible) {
        this.$toasted.show("You are trying to edit an invisible layer!!", {
          type: "error",
          icon: "fa-check-cross",
          singleton: true,
        });
      }
    },
    checkVisible(top) {
      return checkVisible(top, top - this.blockHeight);
    },
    undo() {
      this.$store.commit("undoBlocks");
    },
    redo() {
      this.$store.commit("redoBlocks");
    },
    resetSelect() {
      this.selecting = {
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        canSelect: false,
      };
      this.$emit("selecting", this.selecting);
    },
    redrawSelect() {
      if (this.currentAsciiLayerBlocks.length) {
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
    mergeLayers() {
      return mergeLayers();
    },
    drawGrid() {
      let ctx = this.ctx;
      let w = this.canvas.width;
      let h = this.canvas.height;

      ctx.beginPath();

      for (var x = 0; x <= w; x += blockWidth) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([1]);

      ctx.stroke();

      ctx.beginPath();
      for (var y = 0; y <= h; y += blockHeight) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }

      ctx.stroke();
    },
    redrawCanvas() {
      if (this.currentAsciiLayers.length) {
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

        let mergeLayers = this.mergeLayers();

        for (y = 0; y < this.currentAsciiHeight + 1; y++) {
          canvasY = blockHeight * y;

          // Experimental code to not rows blocks off screen
          if (
            this.options.renderOffScreen &&
            this.top !== false &&
            !this.checkVisible(this.top + canvasY - this.yOffset)
          ) {
            continue;
          }

          for (x = 0; x < this.currentAsciiWidth + 1; x++) {
            canvasX = blockWidth * x;

            curBlock = { ...mergeLayers[y][x] };

            if (curBlock.bg !== undefined && curBlock.bg !== null) {
              this.ctx.fillStyle = this.mircColours[curBlock.bg];
              this.ctx.fillRect(canvasX, canvasY, blockWidth, blockHeight);
            }

            if (curBlock.char !== undefined && curBlock.char !== null) {
              if (curBlock.fg !== undefined && curBlock.fg !== null) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              } else {
                this.ctx.fillStyle = "#FFFFFF";
              }

              this.ctx.fillText(
                curBlock.char,
                canvasX,
                canvasY + blockHeight - 3
              );
            }
          }
        }

        if (this.gridView) {
          this.drawGrid();
        }
      }
    },
    onCanvasResize(left, top, width, height) {
      const canvasBlockHeight = Math.floor(height / blockHeight);
      const canvasBlockWidth = Math.floor(width / blockWidth);
      let layers = fillNullBlocks(canvasBlockHeight, canvasBlockWidth);

      this.top = top;
      this.canvas.width = width;
      this.canvas.height = height;

      this.$store.commit("changeAsciiWidthHeight", {
        width: canvasBlockWidth,
        height: canvasBlockHeight,
        layers: [...layers],
      });

      this.$refs.canvasdrag.width = width;
      this.$refs.canvasdrag.height = height;
    },
    onCavasDragStop(x, y) {
      // Update left and top in panel
      this.top = y;
      this.$store.commit("changeAsciiCanvasState", { x, y });

      this.delayRedrawCanvas();
    },
    onCanvasDrag(x, y) {
      this.top = y;
    },
    dispatchBlocks() {
      this.diffBlocks.old = this.diffBlocks.old.flat();
      this.diffBlocks.new = this.diffBlocks.new.flat();

      this.$store.dispatch("updateAsciiBlocksAsync", {
        blocks: this.currentAsciiLayerBlocks,
        diff: { ...this.diffBlocks },
      });

      this.diffBlocks = {
        l: this.selectedLayerIndex,
        new: [],
        old: [],
      };
    },
    // Mouse Up, Down and Move
    canvasMouseUp() {
      if (this.isDefault) return;

      switch (this.currentTool.name) {
        case "brush":
          this.canTool = false;

          this.dispatchBlocks();

          break;

        case "eraser":
          this.canTool = false;

          this.dispatchBlocks();

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
            this.canTool = false;

            this.dispatchBlocks();
            break;

          case "fill-eraser":
            this.fill(true);

            this.dispatchBlocks();
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
              this.$store.commit(
                "changeColourFg",
                targetBlock.fg === undefined ? this.currentFg : targetBlock.fg
              );
            }

            if (this.canBg) {
              this.$store.commit(
                "changeColourBg",
                targetBlock.bg === undefined ? this.currentBg : targetBlock.bg
              );
            }

            if (this.canText) {
              this.$store.commit(
                "changeChar",
                targetBlock.char === undefined
                  ? this.currentChar
                  : targetBlock.char
              );
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
              this.selecting.endX = this.canvasX + blockWidth;
              this.selecting.endY = this.canvasY + blockHeight;

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
        var _this = this;
        setTimeout(function () {
          requestAnimationFrame(() => {
            _this.redrawCanvas();
            _this.redraw = true;
          });
        }, 1000 / this.options.fps);
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

      for (y = 0; y < this.currentAsciiHeight; y++) {
        if (
          y > Math.floor(this.selecting.startY / blockHeight) - 1 &&
          y < Math.floor(this.selecting.endY / blockHeight)
        ) {
          if (!this.selectedBlocks[y]) {
            this.selectedBlocks[y] = [];
          }

          for (x = 0; x < this.currentAsciiWidth; x++) {
            if (
              x > Math.ceil(this.selecting.startX / blockWidth) - 1 &&
              x <= Math.ceil(this.selecting.endX / blockWidth) - 1
            ) {
              if (
                this.currentAsciiLayerBlocks[y] &&
                this.currentAsciiLayerBlocks[y][x]
              ) {
                curBlock = { ...this.currentAsciiLayerBlocks[y][x] };

                if (!this.selectedBlocks[y][x]) {
                  this.selectedBlocks[y][x] = { ...curBlock };
                }
              }
            }
          }
        }
      }

      this.$emit("selectedblocks", this.selectedBlocks);
      this.$emit("selecting", this.selecting);
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
      this.drawRectangleBlock(this.x, this.y);

      // We can draw icons on the tool canvas with the font awesome CSS
      // it needs more work though to not conflict with the brush preview chars
      // if (this.isTextEditing) {
      //   this.toolCtx.font = '600 22px "Font Awesome 5 Free"';
      //   this.toolCtx.fillText(
      //     "\uf031",
      //     this.x * blockWidth,
      //     this.y * blockHeight + blockHeight * 2
      //   );
      //   // this.toolCtx.font = "13px Hack";
      // }

      if (this.isTextEditing) {
        if (this.mirrorX) {
          this.drawRectangleBlock(this.currentAsciiWidth - this.x, this.y);
        }

        if (this.mirrorY) {
          this.drawRectangleBlock(this.x, this.currentAsciiHeight - this.y);
        }

        if (this.mirrorY && this.mirrorX) {
          this.drawRectangleBlock(
            this.currentAsciiWidth - this.x,
            this.currentAsciiHeight - this.y
          );
        }
      }
    },
    drawTextIndicator() {
      this.drawRectangleBlock(this.textEditing.startX, this.textEditing.startY);

      if (this.mirrorX) {
        this.drawRectangleBlock(
          this.currentAsciiWidth - this.textEditing.startX,
          this.textEditing.startY
        );
      }

      if (this.mirrorY) {
        this.drawRectangleBlock(
          this.textEditing.startX,
          this.currentAsciiHeight - this.textEditing.startY
        );
      }

      if (this.mirrorY && this.mirrorX) {
        this.drawRectangleBlock(
          this.currentAsciiWidth - this.textEditing.startX,
          this.currentAsciiHeight - this.textEditing.startY
        );
      }
    },
    //
    // Functions related to drawBrush function bellow
    //
    drawBrushBlocks(brushX, brushY, brushBlock, target = null, plain = false) {
      const arrayY = brushY / blockHeight;
      const arrayX = brushX / blockWidth;
      const asciiWidth = this.currentAsciiWidth;
      const asciiHeight = this.currentAsciiHeight;
      let targetBlock = this.currentAsciiLayerBlocks[arrayY][arrayX];

      if (plain) {
        // Used for eraser preview and other non brushs
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

        return;
      }

      switch (target) {
        case "bg":
          this.toolCtx.fillStyle =
            brushBlock.bg !== undefined
              ? this.mircColours[brushBlock.bg]
              : "rgba(255,255,255,0.4)";

          break;
        case "fg":
          this.toolCtx.fillStyle =
            brushBlock.fg !== undefined
              ? this.mircColours[brushBlock.fg]
              : "#000000";

          break;

        // If no target is specified we assume we are rendering the text
        default:
          if (this.canText && brushBlock.char !== undefined) {
            this.toolCtx.font = "Hack 13px";

            this.toolCtx.fillStyle = this.canFg
              ? this.mircColours[brushBlock.fg]
              : "#000000";

            this.toolCtx.fillText(
              brushBlock.char,
              brushX,
              brushY + blockHeight - 3
            );

            if (this.mirrorX) {
              this.toolCtx.fillText(
                brushBlock.char,
                (asciiWidth - arrayX) * blockWidth,
                brushY + blockHeight - 4
              );
            }

            if (this.mirrorY) {
              this.toolCtx.fillText(
                brushBlock.char,
                brushX,
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
          }

          // Apply text to ascii blocks
          if (this.canText && this.canTool && brushBlock.char !== null) {
            targetBlock.char = brushBlock.char;

            if (
              this.mirrorX &&
              this.currentAsciiLayerBlocks[arrayY] &&
              this.currentAsciiLayerBlocks[arrayY][asciiWidth - arrayX]
            ) {
              this.currentAsciiLayerBlocks[arrayY][asciiWidth - arrayX].char =
                brushBlock.char;
            }

            if (
              this.mirrorY &&
              this.currentAsciiLayerBlocks[asciiHeight - arrayY] &&
              this.currentAsciiLayerBlocks[asciiHeight - arrayY][arrayX]
            ) {
              this.currentAsciiLayerBlocks[asciiHeight - arrayY][arrayX].char =
                brushBlock.char;
            }

            if (
              this.mirrorY &&
              this.mirrorX &&
              this.currentAsciiLayerBlocks[asciiHeight - arrayY] &&
              this.currentAsciiLayerBlocks[asciiHeight - arrayY][
                asciiWidth - arrayX
              ]
            ) {
              this.currentAsciiLayerBlocks[asciiHeight - arrayY][
                asciiWidth - arrayX
              ].char = brushBlock.char;
            }
          }

          return;
      }

      if (this.canBg && target == "bg") {
        this.toolCtx.setLineDash([1, 2]);
        this.toolCtx.strokeRect(brushX, brushY, blockWidth, blockHeight);
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
      }

      // Apply the actual brush block to the ascii block
      if (this.canTool && brushBlock[target] !== undefined) {
        targetBlock[target] = brushBlock[target];

        let theX = asciiWidth - arrayX;
        let theY = asciiHeight - arrayY;
        let oldBlock = {};

        if (
          this.mirrorX &&
          this.currentAsciiLayerBlocks[arrayY] &&
          this.currentAsciiLayerBlocks[arrayY][theX]
        ) {
          oldBlock = { ... this.currentAsciiLayerBlocks[arrayY][theX] }
          this.currentAsciiLayerBlocks[arrayY][theX][target] = brushBlock[target];

          this.storeDiffBlocks(theX, arrayY, oldBlock, brushBlock);
        }

        if (
          this.mirrorY &&
          this.currentAsciiLayerBlocks[theY] &&
          this.currentAsciiLayerBlocks[theY][arrayX]
        ) {
          oldBlock = { ... this.currentAsciiLayerBlocks[theY][arrayX] }
          this.currentAsciiLayerBlocks[theY][arrayX][target] = brushBlock[target];

          this.storeDiffBlocks(arrayX, theY, oldBlock, brushBlock);
        }

        if (
          this.mirrorY &&
          this.mirrorX &&
          this.currentAsciiLayerBlocks[theY] &&
          this.currentAsciiLayerBlocks[theY][theX]
        ) {
          oldBlock = { ... this.currentAsciiLayerBlocks[theY][theX] }
          this.currentAsciiLayerBlocks[theY][theX][target] = brushBlock[target];

          this.storeDiffBlocks(theX, theY, oldBlock, brushBlock);
        }
      }

      return;
    },
    //
    // drawBrush
    //  - draws brush
    //  - draws preview for all toolbar things that need it
    //  - also works with the copy / paste
    drawBrush(plain = false) {
      this.clearToolCanvas();
      let brushDiffX = 0;
      let xLength = 0;

      // If the first row isn't selected then we cannot get the width
      // with the 0 index
      for (let i = 0; i <= this.brushBlocks.length; i++) {
        if (this.brushBlocks[i]) {
          brushDiffX = Math.floor(this.brushBlocks[i].length / 2) * blockWidth;
          xLength = this.brushBlocks[i].length;
          break;
        }
      }

      const brushDiffY = Math.floor(this.brushBlocks.length / 2) * blockHeight;

      for (let y = 0; y < this.brushBlocks.length; y++) {
        if (!this.brushBlocks[y]) {
          continue;
        }

        for (let x = 0; x < xLength; x++) {
          if (!this.brushBlocks[y][x]) {
            continue;
          }

          // if (
          //   this.top !== false &&
          //   !this.checkVisible(this.top + (y * blockHeight) - this.yOffset)
          // ) {
          //   continue;
          // }

          const brushBlock = this.brushBlocks[y][x];

          const brushX = this.x * blockWidth + x * blockWidth - brushDiffX;
          const brushY = this.y * blockHeight + y * blockHeight - brushDiffY;

          const arrayY = brushY / blockHeight;
          const arrayX = brushX / blockWidth;

          if (
            this.currentAsciiLayerBlocks[arrayY] &&
            this.currentAsciiLayerBlocks[arrayY][arrayX]
          ) {
            let oldBlock = {
              ...this.currentAsciiLayerBlocks[arrayY][arrayX],
            };

            if (!plain) {
              if (this.canBg) {
                this.drawBrushBlocks(brushX, brushY, brushBlock, "bg");
              }

              if (this.canFg) {
                this.drawBrushBlocks(brushX, brushY, brushBlock, "fg");
              }

              this.drawBrushBlocks(brushX, brushY, brushBlock, null);
            } else {
              this.drawBrushBlocks(brushX, brushY, brushBlock, null, true);
            }

            if (this.canTool) {
              this.storeDiffBlocks(arrayX, arrayY, oldBlock, brushBlock);
            }
          }
        }
      }
    },
    async storeDiffBlocks(x, y, oldBlock, newBlock) {
      // For undo
      if (!this.diffBlocks.old[y]) {
        this.diffBlocks.old[y] = [];
      }

      if (!this.diffBlocks.old[y][x]) {
        this.diffBlocks.old[y][x] = {
            x: x,
            y: y,
            b: { ...oldBlock },
        };
      }

      if (!this.diffBlocks.new[y]) {
        this.diffBlocks.new[y] = [];
      }

      if (!this.diffBlocks.new[y][x]) {
        this.diffBlocks.new[y][x] = {
            x: x,
            y: y,
            b: { ...newBlock },
        };
      }
    },
    eraser() {
      if (this.canTool) {
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

            let targetBlock = this.currentAsciiLayerBlocks[arrayY][arrayX];
            let oldBlock = { ...this.currentAsciiLayerBlocks[arrayY][arrayX] };

            if (this.canFg && targetBlock.fg !== undefined) {
              delete targetBlock["fg"];
            }

            if (this.canBg && targetBlock.bg !== undefined) {
              delete targetBlock["bg"];
            }

            if (this.canText && targetBlock.char !== undefined) {
              delete targetBlock["char"];
            }

            this.storeDiffBlocks(arrayX, arrayY, oldBlock, targetBlock);

            let theX = this.currentAsciiWidth - arrayX;
            if (this.mirrorX) {
              if (
                this.currentAsciiLayerBlocks[arrayY] &&
                this.currentAsciiLayerBlocks[arrayY][theX]
              ) {
                targetBlock = this.currentAsciiLayerBlocks[arrayY][theX];
                oldBlock = { ...this.currentAsciiLayerBlocks[arrayY][theX] };

                if (this.canFg && targetBlock.fg !== undefined) {
                  delete targetBlock["fg"];
                }

                if (this.canBg && targetBlock.bg !== undefined) {
                  delete targetBlock["bg"];
                }

                if (this.canText && targetBlock.char !== undefined) {
                  delete targetBlock["char"];
                }

                this.storeDiffBlocks(theX, arrayY, oldBlock, targetBlock);
              }
            }

            let theY = this.currentAsciiHeight - arrayY;
            if (this.mirrorY) {
              if (
                this.currentAsciiLayerBlocks[theY] &&
                this.currentAsciiLayerBlocks[theY][arrayX]
              ) {
                targetBlock = this.currentAsciiLayerBlocks[theY][arrayX];
                oldBlock = { ...this.currentAsciiLayerBlocks[theY][arrayX] };

                if (this.canFg && targetBlock.fg !== undefined) {
                  delete targetBlock["fg"];
                }

                if (this.canBg && targetBlock.bg !== undefined) {
                  delete targetBlock["bg"];
                }

                if (this.canText && targetBlock.char !== undefined) {
                  delete targetBlock["char"];
                }

                this.storeDiffBlocks(arrayX, theY, oldBlock, targetBlock);
              }
            }

            if (this.mirrorY && this.mirrorX) {
              if (
                this.currentAsciiLayerBlocks[theY] &&
                this.currentAsciiLayerBlocks[theY][theX]
              ) {
                targetBlock = this.currentAsciiLayerBlocks[theY][theX];
                oldBlock = { ...this.currentAsciiLayerBlocks[theY][theX] };

                if (this.canFg && targetBlock.fg !== undefined) {
                  delete targetBlock["fg"];
                }

                if (this.canBg && targetBlock.bg !== undefined) {
                  delete targetBlock["bg"];
                }

                if (this.canText && targetBlock.char !== undefined) {
                  delete targetBlock["char"];
                }

                this.storeDiffBlocks(theX, theY, oldBlock, targetBlock);
              }
            }
          }
        }
      }
    },
    // Fill tool
    fill(eraser = false) {
      const newColor = {};
      const current = {};

      if (this.canBg) {
        newColor.bg = this.currentBg;
        current.bg = this.asciiBlockAtXy.bg;
      }
      //
      if (this.canFg) {
        newColor.fg = this.currentFg;
        current.fg = this.asciiBlockAtXy.fg;
      }

      // If the newColor is same as the existing
      // Then return the original image.
      if (JSON.stringify(current) === JSON.stringify(newColor) && !eraser) {
        return;
      }

      this.fillTool(
        this.currentAsciiLayerBlocks,
        this.y,
        this.x,
        current,
        eraser
      );
    },
    fillTool(fillBlocks, y, x, current, eraser) {
      if (y >= Math.floor(this.canvas.height / blockHeight)) {
        return;
      }

      if (x >= Math.floor(this.canvas.width / blockWidth)) {
        return;
      }

      if (fillBlocks[y] === undefined || fillBlocks[y][x] === undefined) {
        return;
      }

      if (this.canFg && fillBlocks[y][x].fg !== current.fg) {
        return;
      }

      if (this.canBg && fillBlocks[y][x].bg !== current.bg) {
        return;
      }

      // We can eraser or fill
      if (this.canBg) {
        fillBlocks[y][x].bg = eraser ? undefined : this.currentBg;
      }

      if (this.canFg) {
        fillBlocks[y][x].fg = eraser ? undefined : this.currentFg;
      }

      if (this.canText) {
        fillBlocks[y][x].char = eraser ? undefined : this.currentChar;
      }

      this.storeDiffBlocks(x, y, current, fillBlocks[y][x]);

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
