<template>
  <div>
    <div id="canvas-area">
      <vue-draggable-resizable
        style="z-index:5;"
        :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
        :w="canvas.width"
        :h="canvas.height"
        :draggable="$store.getters.getCurrentTool === 0"
        @resizestop="onCanvasResize"
        @dragstop="onCavasDragStop"
        :x="currentAscii.x"
        :y="currentAscii.y"
      >
        <canvas
          ref="canvastools"
          id="canvastools"
          class="toolscanvas"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        ></canvas>

        <canvas
          ref="canvas"
          id="canvas"
          class="canvas"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        ></canvas>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<style>
body {
  background: #eee;
}

.toolscanvas {
  position: absolute;
  z-index: 100;
}

.canvas {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  border: lightgrey 1px solid;
  z-index: 0;
}
</style>

<script>
import Block from "../components/Block.vue";

export default {
  name: "Editor",
  components: { Block },
  mounted() {
    if (this.$store.getters.currentAscii.blocks) {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.toolsCtx = this.$refs.canvastools.getContext("2d");

      this.canvas.width =
        this.$store.getters.currentAscii.width *
        this.$store.getters.currentAscii.blockWidth;
      this.canvas.height =
        this.$store.getters.currentAscii.height *
        this.$store.getters.currentAscii.blockHeight;

      this.delayRedrawCanvas();
      this.$store.commit("changeTool", 0);

      const _this = this;
      this._keyListener = function (e) {
        // if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // present "Save Page" from getting triggered.

        _this.canvasKeyDown(e.key);
        // }
      };

      document.addEventListener("keydown", this._keyListener.bind(this));
    }
  },
  created() {},
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
    throttle: true,
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
  }),
  computed: {
    canvasStyle() {
      return `width:${this.canvas.width};height:${this.canvas.height};`;
    },
    generateTitle() {
      return this.$store.getters.currentAscii.title ?? "";
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentTool() {
      return this.$store.getters.getToolbarIcons[
        this.$store.getters.getCurrentTool
      ];
    },
    isTextEditing() {
      return (
        this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool]
          .name === "text"
      );
    },
    isSelecting() {
      return (
        this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool]
          .name === "select"
      );
    },
    dragboxStyle() {
      return `z-index: 5;width:${this.canvas.width+4};height:${this.canvas.height+4};`
    }
  },
  watch: {
    currentAscii(val, old) {
      this.canvas.width =
        this.$store.getters.currentAscii.width *
        this.$store.getters.currentAscii.blockWidth;
      this.canvas.height =
        this.$store.getters.currentAscii.height *
        this.$store.getters.currentAscii.blockHeight;

      this.delayRedrawCanvas();

      document.title = `asciibird - ${this.currentAscii.title}`;
    },
    currentTool() {
      switch (
        this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool]
          .name
      ) {
        case "default":
          Object.assign(this.textEditing, {
            startX: null,
            startY: null,
          });

          Object.assign(this.selecting, {
            startX: null,
            startY: null,
            endX: null,
            endY: null,
            canSelect: false,
          });
          break;
      }
    },
  },
  methods: {
    redrawToolCanvas() {
      if (this.currentAscii.blocks.length) {
        this.clearToolCanvas();
        this.toolsCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        this.toolsCtx.fillRect(
          this.selecting.startX,
          this.selecting.startY,
          this.selecting.endX * BLOCK_WIDTH,
          this.selecting.endY * BLOCK_HEIGHT
        );
        this.toolsCtx.stroke();
      }
    },
    redrawCanvas() {
      // Clears the whole canvas, we can maybe get a better way to check how far
      // we need to clear the canvas
      this.ctx.clearRect(0, 0, 10000, 10000);

      if (this.currentAscii.blocks.length) {
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        // hack font for ascii shout outs 2 beenz
        this.ctx.font = "12.5px Hack";

        for (y = 0; y < this.currentAscii.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.currentAscii.width + 1; x++) {
            if (this.currentAscii.blocks[y] && this.currentAscii.blocks[y][x]) {
              curBlock = Object.assign(
                curBlock,
                this.currentAscii.blocks[y][x]
              );

              canvasX = BLOCK_WIDTH * x;

              // Background block
              if (curBlock.bg !== null) {
                this.ctx.fillStyle = this.$store.getters.mircColours[
                  curBlock.bg
                ];
                this.ctx.fillRect(canvasX, canvasY, BLOCK_WIDTH, BLOCK_HEIGHT);
              } else {
                this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
              }

              if (curBlock.char) {
                if (curBlock.fg !== null) {
                  this.ctx.fillStyle = this.$store.getters.mircColours[
                    curBlock.fg
                  ];
                } else {
                  this.ctx.fillStyle = "#000000";
                }

                this.ctx.fillText(
                  curBlock.char,
                  canvasX - 1,
                  canvasY + BLOCK_HEIGHT - 3
                );
              }
            }
          }
        }
      }

      this.ctx.stroke();
    },
    onCanvasResize(left, top, width, height) {
      const emptyBlock = {
        bg: null,
        fg: null,
        char: null,
      };

      const blocks = this.$store.getters.currentAsciiBlocks;

      const oldWidth = blocks[0].length; //  * this.currentAscii.blockWidth;
      const oldHeight = blocks.length; //  * this.currentAscii.blockHeight;

      const canvasBlockHeight = Math.floor(
        height / this.currentAscii.blockHeight
      );
      const canvasBlockWidth = Math.floor(width / this.currentAscii.blockWidth);

      if (canvasBlockHeight > oldHeight) {
        console.log({ canvasBlockHeight, oldHeight });

        for (let y = 0; y < canvasBlockHeight; y++) {
          // New row
          if (!blocks[y]) {
            blocks[y] = [];
            for (let x = 0; x < canvasBlockWidth; x++) {
              blocks[y][x] = Object.assign({}, emptyBlock);
            }
          } else {
            // blocks[y]
            // no new rows but new cols
            for (let x = 0; x < canvasBlockWidth; x++) {
              if (blocks[y] && !blocks[y][x]) {
                blocks[y][x] = Object.assign({}, emptyBlock);
              }
            }
          }
        }
      }

      if (canvasBlockWidth > oldWidth) {
        console.log({ canvasBlockWidth, oldWidth });
      }

      this.canvas.width = width;
      this.canvas.height = height;

      this.$store.commit("changeAsciiWidthHeight", {
        width: canvasBlockWidth,
        height: canvasBlockHeight,
      });

      this.$store.commit("updateAsciiBlocks", blocks);
      // Restructure blocks code here
      this.delayRedrawCanvas();
    },
    onCavasDragStop(x, y) {
      // Update left and top in panel
      this.$store.commit("changeAsciiCanvasState", { x, y });
    },
    canvasKeyDown(char) {
      if (this.isTextEditing) {
        if (
          this.currentAscii.blocks[this.textEditing.startY] &&
          this.currentAscii.blocks[this.textEditing.startY][
            this.textEditing.startX
          ]
        ) {
          const targetBlock = this.currentAscii.blocks[this.textEditing.startY][
            this.textEditing.startX
          ];

          switch (char) {
            case "Backspace":
              if (this.currentAscii.blocks[this.textEditing.startY][this.textEditing.startX-1]) {

                this.textEditing.startX--;
                targetBlock.char = null;

              }
              break;

            default:
              if (char.length === 1) {
                if (this.$store.getters.getTargetingFg) {
                  targetBlock.fg = this.$store.getters.getFgColour;
                }

                targetBlock.char = char;

                if (
                  this.currentAscii.blocks[this.textEditing.startY][
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
      }
    },
    // Mouse Up, Down and Move
    canvasMouseUp() {
      switch (this.currentTool.name) {
        case "brush":
          this.canTool = false;
          break;

        case "eraser":
          this.canTool = false;
          break;

        case "fill":
          this.canTool = false;

          break;

        case "select":
          this.selecting.canSelect = false;
          this.clearToolCanvas();
          break;

        case "text":
          if (
            this.textEditing.startX === null ||
            this.textEditing.startY === null
          ) {
            this.textEditing.startX = this.x;
            this.textEditing.startY = this.y;
          }
          break;
      }

      this.delayRedrawCanvas();
    },
    canvasMouseDown() {
      this.toolsCtx.clearRect(0, 0, 10000, 10000);

      if (
        this.currentAscii.blocks[this.y] &&
        this.currentAscii.blocks[this.y][this.x] &&
        this.currentTool
      ) {
        const targetBlock = this.currentAscii.blocks[this.y][this.x];

        switch (this.currentTool.name) {
          case "default":
            break;

          case "select":
            if (
              this.selecting.startX === null ||
              this.selecting.startY === null
            ) {
              this.selecting.startX = this.x;
              this.selecting.startY = this.y;
              this.selecting.canSelect = true;
            }

            break;

          case "fill":
            this.fill();
            break;

          case "brush":
            this.canTool = true;
            break;

          case "eraser":
            this.canTool = true;
            break;

          case "dropper":
            if (this.$store.getters.getTargetingFg) {
              this.$store.commit("changeColourFg", targetBlock.fg);
            }

            if (this.$store.getters.getTargetingBg) {
              this.$store.commit("changeColourBg", targetBlock.bg);
            }

            if (this.$store.getters.getTargetingChar) {
              this.$store.commit("changeChar", targetBlock.char);
            }

            this.$store.commit("changeTool", 0);
            break;
        }
      }
    },
    canvasMouseMove(e) {
      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / this.currentAscii.blockWidth);
      this.y = Math.floor(this.y / this.currentAscii.blockHeight);

      this.$emit("coordsupdate", { x: this.x, y: this.y });

      if (
        this.currentAscii.blocks[this.y] &&
        this.currentAscii.blocks[this.y][this.x]
      ) {
        const targetBlock = this.currentAscii.blocks[this.y][this.x];

        switch (
          this.$store.getters.getToolbarIcons[
            this.$store.getters.getCurrentTool
          ].name
        ) {
          case "brush":
            if (this.canTool) {
              if (this.$store.getters.getTargetingFg) {
                targetBlock.fg = this.$store.getters.getFgColour;
              }

              if (this.$store.getters.getTargetingBg) {
                targetBlock.bg = this.$store.getters.getBgColour;
              }

              if (this.$store.getters.getTargetingChar) {
                targetBlock.char = this.$store.getters.getSelectedChar;
              }
            }
            break;

          case "eraser":
            if (this.canTool) {
              if (this.$store.getters.getTargetingFg) {
                targetBlock.fg = null;
              }

              if (this.$store.getters.getTargetingBg) {
                targetBlock.bg = null;
              }

              if (this.$store.getters.getTargetingChar) {
                targetBlock.char = null;
              }
            }
            break;

          case "select":
            if (this.selecting.canSelect) {
              this.selecting.endX = this.x;
              this.selecting.endY = this.y;
            }

            break;
        }
      }

      this.delayRedrawCanvas();
    },
    clearToolCanvas() {
      if (this.toolsCtx) {
        this.toolsCtx.clearRect(0, 0, 10000, 10000);
        this.toolsCtx.stroke();
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        setTimeout(() => {
          this.redraw = true;
          this.redrawCanvas();
          this.redrawToolCanvas();
        }, this.$store.state.options.canvasRedrawSpeed);
      }
    },
    //
    // TOOLS
    //
    // Fill tool
    fill() {
      const fillBlocks = {
        ...this.currentAscii.blocks,
      };

      const { x } = this;
      const { y } = this;

      const newColor = this.$store.getters.getBgColour;

      // Get the input which needs to be replaced.
      const current = fillBlocks[y][x].bg;

      // If the newColor is same as the existing
      // Then return the original image.
      if (current === newColor) {
        return fillBlocks;
      }

      // Other wise call the fill function which will fill in the existing image.
      this.fillTool(fillBlocks, y, x, newColor, current);

      this.$store.commit("updateAsciiBlocks", fillBlocks);
    },
    fillTool(fillBlocks, y, x, newColor, current) {
      // If row is less than 0
      if (x < 0) {
        return;
      }

      // If column is less than 0
      if (y < 0) {
        return;
      }

      // If row is greater than image length
      if (x > this.currentAscii.width) {
        return;
      }

      // If column is greater than image length
      if (y > this.currentAscii.height) {
        return;
      }

      if (!fillBlocks[y] && !fillBlocks[y][x]) {
        return;
      }

      // If the current pixel is not which needs to be replaced
      // Bug with null bg stuff
      // if (fillBlocks[y] && fillBlocks[y][x] && fillBlocks[y][x].bg !== null) {
      if (fillBlocks[y][x].bg !== current) {
        return;
      }

      // Update the new color

      // }

      fillBlocks[y][x].bg = newColor;

      // Fill in all four directions
      // Fill Prev row
      this.fillTool(fillBlocks, y, x - 1, newColor, current);

      // Fill Next row
      this.fillTool(fillBlocks, y, x + 1, newColor, current);

      // Fill Prev col
      this.fillTool(fillBlocks, y - 1, x, newColor, current);

      // Fill next col
      this.fillTool(fillBlocks, y + 1, x, newColor, current);
    },
  },
};
</script>
