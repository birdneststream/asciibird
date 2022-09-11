<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <context-menu ref="editor-menu" class="z-50">
        <ul>
          <li @click="canvasToPng()" class="ml-1 text-sm hover:bg-gray-400">
            Save as PNG
          </li>
          <li
            @click="startExport('clipboard')"
            class="ml-1 text-sm hover:bg-gray-400"
          >
            Export ASCII to mIRC Clipboard
          </li>
          <li
            @click="startExport('file')"
            class="ml-1 text-sm hover:bg-gray-400"
          >
            Export ASCII to mIRC File
          </li>
        </ul>
      </context-menu>

      <vue-draggable-resizable
        ref="canvasdrag"
        :grid="[blockWidth, blockHeight]"
        :w="currentAsciiWidth * blockWidth"
        :h="currentAsciiHeight * blockHeight"
        :draggable="isDefault"
        @resizestop="onCanvasResize"
        @dragstop="onCanvasDragStop"
        :x="currentAscii.x"
        :handles="['bm', 'br', 'mr']"
        :y="currentAscii.y"
        style="z-index: -1"
      >
        <canvas
          id="overlay-image"
          :style="imageOverlayStyle"
          :width="currentAsciiWidth * blockWidth"
          :height="currentAsciiHeight * blockHeight"
        />

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
          @mousemove="canvasMouseMove"
          @mousedown.left="canvasMouseDown"
          @mouseup.left="canvasMouseUp"
          @mouseup.right="openContextMenu"
          @touchmove="canvasMouseMove"
          @touchend="canvasMouseDown"
          @touchstart="canvasMouseUp"
        />
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<script>
import ContextMenu from "./../components/parts/ContextMenu.vue";
import VueDraggableResizable from "vue-draggable-resizable";

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
  canvasToPng,
  exportMirc,
  downloadFile,
  cyrb53,
  emptyBlock
} from "../ascii";

export default {
  name: "Editor",
  components: {
    ContextMenu,
    VueDraggableResizable,
  },
  async mounted() {
    this.ctx = this.canvasRef.getContext("2d");
    this.ctx.font = "13px Hack";
    this.toolCtx = this.$refs.canvastools.getContext("2d");
    await this.delayRedrawCanvas();
  },
  async created() {
    window.addEventListener("load", async () => {
      // Fixes the font on load issue
      await this.delayRedrawCanvas();
    });

    var _this = this;
    hotkeys("*", "editor", async function (event, handler) {
      event.preventDefault();

      if (_this.isTextEditing) {
        await _this.canvasKeyDown(event.key);
        return;
      }

      if (_this.isBrushing || _this.isErasing) {
        switch (event.key) {
          case "ArrowUp":
            _this.y--;
            await _this.drawBrush(_this.isErasing);
            break;

          case "ArrowDown":
            _this.y++;
            await _this.drawBrush(_this.isErasing);
            break;

          case "ArrowLeft":
            _this.x--;
            await _this.drawBrush(_this.isErasing);
            break;

          case "ArrowRight":
            _this.x++;
            await _this.drawBrush(_this.isErasing);
            break;

          case " ":
            _this.canTool = true;
            _this.isBrushing
              ? await _this.drawBrush(false)
              : await _this.eraser();
            _this.canTool = false;
            await _this.dispatchBlocks(true);
            break;
        }
      }
    });

    if (this.currentAsciiLayerBlocks) {
      this.canvas.width = this.currentAsciiWidth * blockWidth;
      this.canvas.height = this.currentAsciiHeight * blockHeight;

      await this.delayRedrawCanvas();
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
    // pixelX: 0,
    atTopHalf: 0,
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
    canvasHash: null,
  }),
  props: [
    "updateCanvas",
    "yOffset",
    "canvasxy",
    "brush",
    "updateascii",
    "resetSelect",
  ],
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
      return this.currentAsciiLayers[this.selectedLayerIndex] || [];
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
    isEraserFill() {
      return this.currentTool.name === "fill-eraser";
    },
    isFill() {
      return this.currentTool.name === "fill";
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
    halfBlockEditing() {
      return this.toolbarState.halfBlockEditing;
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
      // Tested with wtf.txt and the max rows before the canvas
      // stops working seems to be 2184
      return this.currentSelectedLayer.height > 2184
        ? 2184
        : this.currentSelectedLayer.height;
    },
    imageOverlay() {
      return this.$store.getters.imageOverlay;
    },
    imageOverlayStyle() {
      let repeat = "background-repeat: no-repeat;";
      let stretched = "background-size: 100%;";
      let left = `left: ${this.imageOverlay.left}%;`;
      let top = `top: ${this.imageOverlay.top}%;`;

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
        stretched = `background-size: ${this.imageOverlay.size}%;`;
      }

      return this.imageOverlay.visible
        ? `background-image: url('${
            this.imageOverlay.url
          }'); ${stretched} ${repeat} ${left} ${top} opacity: ${
            this.imageOverlay.opacity / 100
          }; z-index: -1; position: absolute;`
        : "position: absolute;";
    },
    canvasTransparent() {
      return this.imageOverlay.visible
        ? `opacity: ${this.imageOverlay.asciiOpacity / 100};`
        : "opacity: 1;";
    },
    emptyBlock() {
      return emptyBlock;
    }
  },
  watch: {
    currentAsciiHeight(val) {
      this.canvas.height = val * blockHeight;
    },
    currentAsciiWidth(val) {
      this.canvas.width = val * blockWidth;
    },
    async currentAscii(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.canvas.width = this.currentAsciiWidth * blockWidth;
        this.canvas.height = this.currentAsciiHeight * blockHeight;
        await this.delayRedrawCanvas();
      }
    },
    resetSelect(val, old) {
      this.resetSelectTool();
    },
    currentSelectedLayer(val, old) {
      if (val && val.visible) {
        this.warnInvisibleLayer();
      }
    },
    async currentAsciiLayerBlocks() {
      await this.delayRedrawCanvas();
    },
    async currentTool() {
      this.warnInvisibleLayer();

      switch (this.currentTool.name) {
        case "default":
          // Reset default values for tools
          this.textEditing = {
            startX: null,
            startY: null,
          };

          this.resetSelectTool();

          await this.clearToolCanvas();
          break;

        case "text":
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
          break;
      }
    },
    async isMouseOnCanvas(val, old) {
      if (val !== old) {
        if (!this.isSelecting) {
          await this.clearToolCanvas();
          await this.dispatchBlocks(true);
          this.canTool = false;
          await this.delayRedrawCanvas();
        }
      }
    },
    async gridView(val, old) {
      if (val !== old) {
        await this.clearToolCanvas();
      }
    },
    async brushBlocks() {
      await this.clearToolCanvas();

      // This was supposed to update the brush preview real time
      if (this.isMouseOnCanvas && this.isBrushing) {
        await this.drawBrush();
      }
    },
    // Save text to store when finished
    async isTextEditing(val, old) {
      if (val !== old && val === false) {
        await this.dispatchBlocks(true);
      }
    },
    textEditing(val, old) {
      this.$emit("textediting", val);
    },
    async updateCanvas(val, old) {
      if (val !== old) {
        // This comes from KeyboardShortcuts.vue
        await this.clearToolCanvas();
        await this.drawTextIndicator();
        await this.drawIndicator();

        await this.delayRedrawCanvas();
      }
    },
    selecting(val) {
      this.$emit("selecting", val);
    },
    async yOffset() {
      await this.delayRedrawCanvas(true);
    },
    selectedLayerIndex(val, old) {
      if (val !== old) {
        this.diffBlocks.l = val;
      }
    },
    // Layers undo
    async currentAsciiLayers(val, old) {
      await this.delayRedrawCanvas(true);
    },
    halfBlockEditing(val, old) {
      if (val !== old && this.gridView) {
        this.clearToolCanvas();
        this.drawGrid();
      }
    }
  },
  methods: {
    startExport(type) {
      let ascii = exportMirc();

      // Check the lines length on export to warn the user they maybe too large for irc
      let checkLengthArray = ascii.output.join("").split("\n");
      let checkLines = [];

      checkLengthArray.forEach((a, i) => {
        console.log((new TextEncoder().encode(a)).length)
        // The irc line limit is 512 bytes which also includes the users nick, indent and host.
        // 500 should be a good indication nonetheless.
        if ((new TextEncoder().encode(a)).length > 500) {
          checkLines.push(i);
        }
      });

      if (checkLines.length) {
        let displayLines = checkLines.join(", ")
        this.$toasted.show(
          `Line${checkLines.length > 0 ? 's' : ''} ${displayLines} may be too large width for IRC.`,
          {
            type: "error",
            position: "bottom-center",
            duration: 1200,
          }
        );
      }

      switch (type) {
        case "clipboard":
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
          break;

        default:
        case "file":
          downloadFile(ascii.output.join(""), ascii.filename, "text/plain");
          break;
      }
    },
    canvasToPng() {
      canvasToPng(this.canvasRef, this.currentAscii.title);
    },
    openContextMenu(e) {
      e.preventDefault();
      // These are the correct X and Y when inside the floating panel
      this.$refs["editor-menu"].open(e);
    },
    async canvasKeyDown(char) {
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
                ...targetBlock,
              };

              delete this.currentAsciiLayerBlocks[this.textEditing.startY][
                this.textEditing.startX - 1
              ]["char"];

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
              ]["char"];

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
              delete targetBlock["char"];
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
              delete targetBlock["char"];
              this.storeDiffBlocks(
                this.textEditing.startX,
                this.textEditing.startY,
                oldBlock,
                targetBlock
              );
            }

            if (this.mirrorY && this.mirrorX) {
              targetBlock =
                this.currentAsciiLayerBlocks[
                  this.currentAsciiHeight - this.textEditing.startY
                ][this.currentAsciiWidth - this.textEditing.startX];
              oldBlock = { ...targetBlock };
              delete targetBlock["char"];
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
              oldBlock = { ...targetBlock };
              targetBlock.char = char;

              if (this.canFg) {
                targetBlock.fg = this.currentFg;
              }

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

      await this.clearToolCanvas();
      await this.drawTextIndicator();
      await this.drawIndicator();

      await this.delayRedrawCanvas();
    },
    warnInvisibleLayer() {
      if (!this.currentSelectedLayer.visible) {
        this.$toasted.show("You are trying to edit an invisible layer!!", {
          type: "error",
          icon: "warning_amber",
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
    async resetSelectTool() {
      this.selecting = {
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        canSelect: false,
      };

      this.selectedBlocks = [];
      await this.clearToolCanvas();
      await this.delayRedrawCanvas();
      this.$emit("selecting", this.selecting);
    },
    async redrawSelect() {
      if (this.currentAsciiLayerBlocks.length && this.isSelected) {
        await this.clearToolCanvas();
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
    async drawGrid() {
      let w = this.canvas.width;
      let h = this.canvas.height;

      this.toolCtx.beginPath();

      for (var x = 1; x <= w; x += blockWidth) {
        this.toolCtx.moveTo(x, 0);
        this.toolCtx.lineTo(x, h);
      }

      this.toolCtx.strokeStyle = "rgba(40, 40, 40, 1)";
      this.toolCtx.lineWidth = 1;
      this.toolCtx.setLineDash([1]);

      this.toolCtx.stroke();

      this.toolCtx.beginPath();
      for (var y = 1; y <= h; y += this.halfBlockEditing ? (blockHeight / 2) : blockHeight) {
        this.toolCtx.moveTo(0, y);
        this.toolCtx.lineTo(w, y);
      }

      this.toolCtx.stroke();
    },
    async redrawCanvas(force = false) {
      if (this.currentAsciiLayers.length) {
        // https://stackoverflow.com/questions/28390358/high-cpu-usage-with-canvas-and-requestanimationframe

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        // hack font for ascii shout outs 2 beenz

        if (
          this.diffBlocks.new.length &&
          !this.canTool &&
          !this.isTextEditing &&
          !this.isFill &&
          // The main point of this was to use with brushing, but there is a redraw bug
          // where it draws the cached blocks the wrong way around, for now it's simpler
          // to have this.
          !this.isBrushing
        ) {
          // If we have a difference stored, just render the difference only instead
          // of the entire ascii again

          // We also have to take into account layers, if there is a block on top
          // we will not do anything
          outer: for (let i in this.diffBlocks.new) {
            let entry = this.diffBlocks.new[i];
            canvasX = blockWidth * entry.x;
            canvasY = blockHeight * entry.y;
            curBlock = { ...entry.b };

            for (
              let j = this.currentAsciiLayers.length - 1;
              j >= this.diffBlocks.l;
              j--
            ) {
              let layer = this.currentAsciiLayers[j];
              if (layer.data[entry.y][entry.x] && j !== this.diffBlocks.l) {
                continue outer;
              }
            }

            // Start to draw the actual block on the canvas
            if (
              curBlock.bg !== undefined &&
              curBlock.bg !== null &&
              this.canBg
            ) {
              this.ctx.fillStyle = this.mircColours[curBlock.bg];
              this.ctx.fillRect(canvasX, canvasY, blockWidth, blockHeight);
            }

            if (curBlock.char !== undefined && curBlock.char !== null) {
              if (
                curBlock.fg !== undefined &&
                curBlock.fg !== null &&
                this.canFg
              ) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              } else {
                this.ctx.fillStyle = this.mircColours[0];
              }

              // Draw character
              if (this.canText) {
                this.ctx.fillText(
                  curBlock.char,
                  canvasX,
                  canvasY + blockHeight - 3
                );
              } else {
                this.ctx.fillText(
                  this.currentAsciiLayerBlocks[entry.y][entry.x].char || " ",
                  canvasX,
                  canvasY + blockHeight - 3
                );
              }
            }
          }

          // Reset diff blocks now that they have been drawn
          this.diffBlocks = {
            l: this.selectedLayerIndex,
            new: [],
            old: [],
          };

          // Store canvas hash
          this.canvasHash = cyrb53(JSON.stringify(this.mergeLayers()));
        } else {
          let mergeLayers = this.mergeLayers();
          let tempHash = cyrb53(JSON.stringify(mergeLayers));

          if (tempHash === this.canvasHash && !force) {
            // Avoid redrawing the entire canvas to same some CPU
            // if we have no new changes
            return;
          }

          this.canvasHash = tempHash;
          this.ctx.save();
          this.canvasRef.width = this.canvasRef.width;
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.ctx.font = "13px Hack";

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
        }

        this.ctx.restore();
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

      this.$toasted.show(`${canvasBlockWidth} x ${canvasBlockHeight}`);
    },
    async onCanvasDragStop(x, y) {
      // Update left and top in panel
      this.top = y;
      this.$store.commit("changeAsciiCanvasState", { x, y });

      await this.delayRedrawCanvas();
    },
    onCanvasDrag(x, y) {
      this.top = y;
    },
    async dispatchBlocks(clearDiff = false) {
      this.diffBlocks.old = this.diffBlocks.old.flat();
      this.diffBlocks.new = this.diffBlocks.new.flat();

      this.$store.commit("updateAsciiBlocks", {
        blocks: this.currentAsciiLayerBlocks,
        diff: { ...this.diffBlocks },
      });

      if (clearDiff) {
        this.diffBlocks = {
          l: this.selectedLayerIndex,
          new: [],
          old: [],
        };
      }
    },
    // Mouse Up, Down and Move
    async canvasMouseUp() {
      if (this.isDefault) return;

      switch (this.currentTool.name) {
        case "brush":
          this.canTool = false;

          // Once the diff Blocks can render in the correct way we can
          // remove true from here
          await this.dispatchBlocks(true);

          break;

        case "eraser":
          this.canTool = false;

          await this.dispatchBlocks(true);

          break;

        case "fill-eraser":
        case "fill":
          this.canTool = false;
          break;

        case "select":
          this.selecting.canSelect = false;
          await this.processSelect();
          break;

        case "text":
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
          break;
      }
    },
    async canvasMouseDown() {
      if (this.isDefault) return;

      if (this.asciiBlockAtXy && this.currentTool) {
        const targetBlock = this.asciiBlockAtXy;

        switch (this.currentTool.name) {
          case "select":
            this.selecting.startX = this.canvasX;
            this.selecting.startY = this.canvasY;
            this.selecting.canSelect = true;
            await this.clearToolCanvas();
            break;

          case "fill":
            this.fill();
            this.canTool = false;
            await this.dispatchBlocks(true);
            break;

          case "fill-eraser":
            this.fill(true);
            await this.dispatchBlocks(true);
            break;

          case "brush":
            this.canTool = true;
            await this.drawBrush();
            break;

          case "eraser":
            this.canTool = true;
            await this.eraser();
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
                { char: targetBlock.char === undefined
                  ? this.currentChar
                  : targetBlock.char }
              );
            }

            this.$store.commit("changeTool", 0);
            break;
        }
      }
    },
    async canvasMouseMove(e) {
      if (this.isDefault) return;

      let lastX = this.x;
      let lastY = this.y;

      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
        this.atTopHalf = Math.floor(e.offsetY / (blockHeight / 2)) % 2 === 0;
      }

      this.x = Math.floor(this.x / blockWidth);
      this.y = Math.floor(this.y / blockHeight);

      if (this.x === lastX && this.y === lastY && !this.halfBlockEditing) {
        return;
      }

      this.$emit("coordsupdate", { x: this.x, y: this.y });

      if (this.asciiBlockAtXy) {
        switch (this.currentTool.name) {
          case "brush":
            if (this.isMouseOnCanvas) {
              await this.clearToolCanvas();
              await this.drawBrush();
              await this.delayRedrawCanvas();
            }
            break;

          case "eraser":
            await this.clearToolCanvas();

            if (this.isMouseOnCanvas) {
              await this.drawBrush(true);
              await this.delayRedrawCanvas();
              await this.eraser();
            }

            break;

          case "select":
            if (this.selecting.canSelect) {
              this.selecting.endX = this.canvasX + blockWidth;
              this.selecting.endY = this.canvasY + blockHeight;

              await this.redrawSelect();
            }

            if (!this.isSelected) {
              await this.redrawSelect();
            }

            break;

          case "text":
            await this.clearToolCanvas();
            await this.drawIndicator();

            if (this.isTextEditingValues) {
              await this.drawTextIndicator();
            }
            break;

          case "dropper":
            await this.clearToolCanvas();
            await this.drawIndicator();
            break;

          case "fill":
          case "fill-eraser":
            await this.clearToolCanvas();
            await this.drawIndicator();
            break;
        }
      }
    },
    async clearToolCanvas() {
      if (this.toolCtx) {
        this.toolCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.toolCtx.save();
        this.toolCtx.width = this.toolCtx.width;
        if (this.gridView) {
          await this.drawGrid();
        }
      }
    },
    async delayRedrawCanvas(force = false) {
      // Force will skip hash checking and redraw everything anyway
      if (this.redraw) {
        this.redraw = false;
        var _this = this;
        setTimeout(function () {
          requestAnimationFrame(async () => {
            await _this.redrawCanvas(force);
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
    async processSelect() {
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
                if (this.currentAsciiLayerBlocks[y][x].bg === null) {
                  delete this.currentAsciiLayerBlocks[y][x]["bg"];
                }

                if (this.currentAsciiLayerBlocks[y][x].fg === null) {
                  delete this.currentAsciiLayerBlocks[y][x]["fg"];
                }

                if (this.currentAsciiLayerBlocks[y][x].char === null) {
                  delete this.currentAsciiLayerBlocks[y][x]["char"];
                }

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
    async drawRectangleBlock(x, y) {
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
    async drawIndicator() {
      this.drawRectangleBlock(this.x, this.y);

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
    async drawTextIndicator() {
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
    async drawBrushBlocks(
      brushX,
      brushY,
      brushBlock,
      target = null,
      plain = false
    ) {
      const arrayY = brushY / blockHeight;
      const arrayX = brushX / blockWidth;
      const asciiWidth = this.currentAsciiWidth;
      const asciiHeight = this.currentAsciiHeight;
      let targetBlock = this.currentAsciiLayerBlocks[arrayY][arrayX];

      if (plain) {
        // Used for eraser preview and other non brushes
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
              : "#FFFFFF";

          break;

        // If no target is specified we assume we are rendering the text
        default:
          if (this.canText && brushBlock.char !== undefined) {
            this.toolCtx.font = "Hack 13px";

            this.toolCtx.fillStyle = this.canFg
              ? this.mircColours[brushBlock.fg]
              : "#FFFFFF";

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
          if (this.canText && this.canTool) {
            targetBlock["char"] = brushBlock["char"];

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
          this.currentAsciiLayerBlocks[arrayY][theX] &&
          (this.x !== theX || this.y !== arrayY)
        ) {
          oldBlock = { ...this.currentAsciiLayerBlocks[arrayY][theX] };
          this.currentAsciiLayerBlocks[arrayY][theX][target] =
            brushBlock[target];

          await this.storeDiffBlocks(theX, arrayY, oldBlock, brushBlock);
        }

        if (
          this.mirrorY &&
          this.currentAsciiLayerBlocks[theY] &&
          this.currentAsciiLayerBlocks[theY][arrayX] &&
          (this.x !== arrayX || this.y !== theY)
        ) {
          oldBlock = { ...this.currentAsciiLayerBlocks[theY][arrayX] };
          this.currentAsciiLayerBlocks[theY][arrayX][target] =
            brushBlock[target];

          await this.storeDiffBlocks(arrayX, theY, oldBlock, brushBlock);
        }

        if (
          this.mirrorY &&
          this.mirrorX &&
          this.currentAsciiLayerBlocks[theY] &&
          this.currentAsciiLayerBlocks[theY][theX] &&
          (this.x !== theX || this.y !== theY)
        ) {
          oldBlock = { ...this.currentAsciiLayerBlocks[theY][theX] };
          this.currentAsciiLayerBlocks[theY][theX][target] = brushBlock[target];

          await this.storeDiffBlocks(theX, theY, oldBlock, brushBlock);
        }
      }

      this.toolCtx.restore();
      return;
    },

    //
    // Functions related to drawBrush function bellow
    //
    async drawHalfBlocks(brushX, brushY, plain = false) {
        // Draw the preview brush
        const arrayY = brushY / blockHeight;
        const arrayX = brushX / blockWidth;
        
        let targetBlock = this.currentAsciiLayerBlocks[arrayY][arrayX];
        let oldBlock = { ... this.currentAsciiLayerBlocks[arrayY][arrayX]};

        let topChar = "▀";
        let bottomChar = "▄";
        let fullChar = " ";

        this.toolCtx.font = "Hack 13px";
        this.toolCtx.fillStyle = this.mircColours[this.currentFg];
        this.toolCtx.fillText(
          this.atTopHalf ? topChar : bottomChar,
          brushX,
          brushY + blockHeight - 3
        );

          // Apply the half block to the ascii block
        if (this.canTool) {
          if ((targetBlock.char === topChar && !this.atTopHalf) || (targetBlock.char === bottomChar && this.atTopHalf)) {
            
            // if the current fg is different to the current block fg then only apply fg
            if (this.currentFg === targetBlock.fg) {
              targetBlock["bg"] = this.currentFg;
              targetBlock["char"] = fullChar;
            } else {
              targetBlock["bg"] = this.currentFg;
              targetBlock["fg"] = targetBlock.fg;
              targetBlock["char"] = !this.atTopHalf ? topChar : bottomChar;
            }
            
          } else {
            // Have a block without any existing half blocks
            targetBlock["fg"] = this.currentFg;
            targetBlock["char"] = this.atTopHalf ? topChar : bottomChar;
          }

          await this.storeDiffBlocks(arrayX, arrayY, oldBlock, targetBlock);
        }

      this.toolCtx.restore();
    },

    //
    // drawBrush
    //  - draws brush
    //  - draws preview for all toolbar things that need it
    //  - also works with the copy / paste
    async drawBrush(plain = false) {
      await this.clearToolCanvas();
      let brushDiffX = 0;
      let xLength = false;

      // If the first row isn't selected then we cannot get the width
      // with the 0 index
      for (let i = 0; i <= this.brushBlocks.length; i++) {
        if (this.brushBlocks[i] && xLength === false) {
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
          if (
            !this.brushBlocks[y][x] ||
            JSON.stringify(this.brushBlocks[y][x]) === "{}"
          ) {
            continue;
          }

          // if (
          //   this.top !== false &&
          //   !this.checkVisible(this.top + (y * blockHeight) - this.yOffset)
          // ) {
          //   continue;
          // }

          const brushBlock = this.brushBlocks[y][x];

          // If we have no fg or bg, and just a space - this has to be an empty block
          if (
            brushBlock.char !== undefined &&
            brushBlock.char === " " &&
            brushBlock.bg === undefined &&
            brushBlock.fg === undefined
          ) {
            continue;
          }

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

                // Force 1x1 when half block editing mode as we ignore the brush
                if (this.toolbarState.halfBlockEditing) {
                  await this.drawHalfBlocks(brushX, brushY);    
                } else {
                  if (this.canBg) {
                    await this.drawBrushBlocks(brushX, brushY, brushBlock, "bg");
                  }

                  if (this.canFg) {
                    await this.drawBrushBlocks(brushX, brushY, brushBlock, "fg");
                  }

                  await this.drawBrushBlocks(brushX, brushY, brushBlock, null);
                }

                if (this.canTool) {
                  await this.storeDiffBlocks(
                    arrayX,
                    arrayY,
                    oldBlock,
                    brushBlock
                  );
                }

            } else if (this.isErasing) {
              await this.drawBrushBlocks(
                brushX,
                brushY,
                brushBlock,
                null,
                true
              );
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
    async eraser() {
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

            if (this.currentAsciiLayerBlocks[arrayY] === undefined) {
              continue;
            }

            if (
              this.currentAsciiLayerBlocks[arrayY][arrayX] === undefined ||
              JSON.stringify(this.brushBlocks[y][x]) === "{}"
            ) {
              continue;
            }

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
      const newColor = {
        bg: this.currentBg,
        // fg: this.currentFg,
        char: this.currentChar,
      };
      const current = { ...this.asciiBlockAtXy };
      if (!this.canBg) {
        delete newColor["bg"];
      }
      // if (!this.canFg) {
      //   delete newColor["fg"];
      // }
      if (!this.canText) {
        delete newColor["char"];
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
    fillTool(currentLayerBlocks, y, x, current, eraser) {
      if (y >= Math.floor(this.canvas.height / blockHeight)) {
        return;
      }
      if (x >= Math.floor(this.canvas.width / blockWidth)) {
        return;
      }
      if (
        currentLayerBlocks[y] === undefined ||
        currentLayerBlocks[y][x] === undefined
      ) {
        return;
      }
      let targetBlock = currentLayerBlocks[y][x];
      if (this.canBg && targetBlock.bg !== current.bg) {
        return;
      }
      // if (this.canFg && targetBlock.fg !== current.fg) {
      //   return;
      // }
      if (this.canText && targetBlock.char !== current.char) {
        return;
      }
      // We can eraser or fill
      let oldBlock = { ...targetBlock };
      if (!eraser) {
        if (this.canBg) {
          targetBlock.bg = this.currentBg;
        }
        if (this.canFg) {
          targetBlock.fg = this.currentFg;
        }
        if (this.canText) {
          targetBlock.char = this.currentChar;
        }
      } else {
        // If we are fill erasing
        if (this.canBg) {
          delete targetBlock["bg"];
        }
        if (this.canFg) {
          delete targetBlock["fg"];
        }
        if (this.canText) {
          delete targetBlock["char"];
        }
      }
      // if (!this.diffBlocks.new && !this.diffBlocks.new[y] && !this.diffBlocks.new[y][x]) {
      this.storeDiffBlocks(x, y, oldBlock, targetBlock);
      // }
      // Fill in all four directions
      // Fill Prev row
      if (currentLayerBlocks[y] && currentLayerBlocks[y][x - 1]) {
        this.fillTool(currentLayerBlocks, y, x - 1, current, eraser);
      }
      // Fill Next row
      if (currentLayerBlocks[y] && currentLayerBlocks[y][x + 1]) {
        this.fillTool(currentLayerBlocks, y, x + 1, current, eraser);
      }
      // Fill Prev col
      if (currentLayerBlocks[y - 1] && currentLayerBlocks[y - 1][x]) {
        this.fillTool(currentLayerBlocks, y - 1, x, current, eraser);
      }
      // Fill next col
      if (currentLayerBlocks[y + 1] && currentLayerBlocks[y + 1][x]) {
        this.fillTool(currentLayerBlocks, y + 1, x, current, eraser);
      }
      return;
    },
    // Fill tool
    floodFill(eraser = false) {
      const newColor = {
        bg: this.currentBg,
        fg: this.currentFg,
        char: this.currentChar,
      };

      const current = { ...this.asciiBlockAtXy };

      if (!this.canBg) {
        delete current["bg"];
        delete newColor["bg"];
      }

      if (!this.canFg) {
        delete current["fg"];
        delete newColor["fg"];
      }

      if (!this.canText) {
        delete current["char"];
        delete newColor["char"];
      }


      if (JSON.stringify(current) == JSON.stringify(newColor)) {
        return;
      }

      let stack = [];

      // do flood fill
      stack.push({ x: this.x, y: this.y });

      while (stack.length) {
        let pos = stack.shift();

        
        // left
        if (this.currentAsciiLayerBlocks[pos.y][pos.x - 1] && pos.x - 1 < this.currentAsciiWidth && pos.y < this.currentAsciiHeight &&
          (this.currentAsciiLayerBlocks[pos.y][pos.x-1].bg == (current.bg || undefined) &&
          (this.canFg && this.currentAsciiLayerBlocks[pos.y][pos.x-1].fg == (current.fg || undefined)) &&
          (this.canText && this.currentAsciiLayerBlocks[pos.y][pos.x-1].char == (current.char || undefined))
          
          )) {
          this.storeDiffBlocks(pos.x - 1, pos.y, this.currentAsciiLayerBlocks[pos.y][pos.x -1], newColor);
          this.currentAsciiLayerBlocks[pos.y][pos.x-1] = (eraser ? { ... emptyBlock} : { ... newColor });

          // if (!stackX.includes(pos.x - 1) || !stackY.includes(pos.y)) {
            stack.push({ x: pos.x - 1, y: pos.y});  
            // stackX.push(pos.x - 1);
            // stackY.push(pos.y);
          // }
          
        }

        //right
        if (this.currentAsciiLayerBlocks[pos.y][pos.x + 1] && pos.x + 1 < this.currentAsciiWidth && pos.y < this.currentAsciiHeight &&
          (this.currentAsciiLayerBlocks[pos.y][pos.x+1].bg == (current.bg || undefined) &&
          (this.canFg && this.currentAsciiLayerBlocks[pos.y][pos.x+1].fg == (current.fg || undefined)) &&
          (this.canText && this.currentAsciiLayerBlocks[pos.y][pos.x+1].char == (current.char || undefined))
          
          )) {
          this.storeDiffBlocks(pos.x + 1, pos.y, this.currentAsciiLayerBlocks[pos.y][pos.x+1], newColor);
          this.currentAsciiLayerBlocks[pos.y][pos.x+1] = (eraser ? { ... emptyBlock} : { ... newColor });

          // if (!stackX.includes(pos.x + 1) || !stackY.includes(pos.y)) {
            stack.push({ x: pos.x + 1, y: pos.y });  
            // stackX.push(pos.x + 1);
            // stackY.push(pos.y);
          // }
          
        }

        // top
        if (this.currentAsciiLayerBlocks[pos.y - 1] && this.currentAsciiLayerBlocks[pos.y - 1][pos.x] && pos.x < this.currentAsciiWidth && pos.y - 1 < this.currentAsciiHeight &&
          (this.currentAsciiLayerBlocks[pos.y-1][pos.x].bg == (current.bg || undefined) && 
          (this.canFg && this.currentAsciiLayerBlocks[pos.y-1][pos.x].fg == (current.fg || undefined)) &&
          (this.canText && this.currentAsciiLayerBlocks[pos.y-1][pos.x].char == (current.char || undefined))
          
          )) {
          this.storeDiffBlocks(pos.x, pos.y - 1, this.currentAsciiLayerBlocks[pos.y-1][pos.x], newColor);
          this.currentAsciiLayerBlocks[pos.y -1 ][pos.x] = (eraser ? { ... emptyBlock} : { ... newColor });

          // if (!stackX.includes(pos.x) || !stackY.includes(pos.y - 1)) {
            stack.push({ x: pos.x, y: pos.y - 1});  
            // stackX.push(pos.x);
            // stackY.push(pos.y - 1);
          // }
          
        }

        // bottom
        if (this.currentAsciiLayerBlocks[pos.y + 1] && this.currentAsciiLayerBlocks[pos.y + 1][pos.x] && pos.x < this.currentAsciiWidth && pos.y + 1 < this.currentAsciiHeight &&
          (this.currentAsciiLayerBlocks[pos.y+1][pos.x].bg == (current.bg || undefined) && 
          (this.canFg && this.currentAsciiLayerBlocks[pos.y+1][pos.x].fg == (current.fg || undefined)) &&
          (this.canText && this.currentAsciiLayerBlocks[pos.y+1][pos.x].char == (current.char || undefined))
          
          )) {
          this.storeDiffBlocks(pos.x, pos.y + 1, this.currentAsciiLayerBlocks[pos.y+1][pos.x], newColor);
          this.currentAsciiLayerBlocks[pos.y + 1][pos.x] = (eraser ? { ... emptyBlock} : { ... newColor });

          // if (!stackX.includes(pos.x) || !stackY.includes(pos.y + 1)) {
            stack.push({ x: pos.x, y: pos.y + 1});  
            // stackX.push(pos.x);
            // stackY.push(pos.y + 1);
          // }
          
        }

        // Absolute base case
        if (stack.length >= (this.currentAsciiHeight * this.currentAsciiWidth)) {
          break;
        }

        // stackX.push(pos.x);
        // stackY.push(pos.y);
      }


      this.delayRedrawCanvas();

    },

  },
};
</script>
