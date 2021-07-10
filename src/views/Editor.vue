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
        :draggable="$store.getters.getCurrentTool === 0"
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

.canvastools {
  position: absolute;
  z-index: 100;
  opacity: 0.5;
  cursor: crosshair;
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
    if (this.currentAsciiBlocks) {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.toolCtx = this.$refs.canvastools.getContext("2d");

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
        if (this.currentToolIsText) {
          e.preventDefault();
          _this.canvasKeyDown(e.key);
        }

        // Ctrl Z here
        // skg - thanks for mac key suggestion, bro
        if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.undo();
        }

        // Ctrl Y here
        if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
          console.log("ctrl y");
          e.preventDefault();
          // Fk it works :\
          this.redo();
          this.redo();
        }

        // Ctrl C - copy blocks
        if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();

          if (this.isSelecting && this.isSelected && this.selectBlocks.length) {
            this.$store.commit("selectBlocks", this.selectBlocks);

            // this.$store.commit("brushBlocks", this.selectBlocks);
            // this.canTool = true;
            // this.drawBrush();

            console.log("ctrl c", this.selectBlocks);
          }
        }

        // Ctrl V - paste blocks
        // Not working
        if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();

          if (this.isSelecting && this.isSelected && this.selectBlocks.length) {
            const BLOCK_WIDTH = this.currentAscii.blockWidth;
            const BLOCK_HEIGHT = this.currentAscii.blockHeight;
            let x = 0;
            let y = 0;

            for (y = 0; y <= this.selectBlocks.height; y++) {
              canvasY = BLOCK_HEIGHT * y;

              for (x = 0; x <= this.selectBlocks.width; x++) {
                if (
                  this.currentAsciiBlocks[y] &&
                  this.currentAsciiBlocks[y][x]
                ) {
                  if (this.selectBlocks[y] && this.selectBlocks[y][x]) {
                    this.currentAsciiBlocks[y][x] = {
                      ...this.selectBlocks[y][x],
                    };
                  }
                }
              }
            }

            console.log("ctrl v", this.selectBlocks);

            this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
            this.delayRedrawCanvas();
          }
        }
      };

      document.addEventListener("keydown", this._keyListener.bind(this));
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
    isMouseOnCanvas: false,
    selectBlocks: [],
  }),
  computed: {
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
    },
    currentTool() {
      return this.$store.getters.getToolbarIcons[
        this.$store.getters.getCurrentTool
      ];
    },
    currentToolIsText() {
      return (
        this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool]
          .name === "text"
      );
    },
    canFg() {
      return this.$store.getters.getTargetingFg;
    },
    canBg() {
      return this.$store.getters.getTargetingBg;
    },
    canText() {
      return this.$store.getters.getTargetingChar;
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
      return `z-index: 5;width:${this.canvas.width + 4};height:${
        this.canvas.height + 4
      };`;
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
  },
  watch: {
    currentAscii(val, old) {
      console.log("changed");
      if (val !== old) {
        this.onCanvasResize(100,100,
          this.currentAscii.width * this.currentAscii.blockWidth,
          this.currentAscii.height * this.currentAscii.blockHeight
        );

        this.canvas.width =
          this.currentAscii.width * this.currentAscii.blockWidth;
        this.canvas.height =
          this.currentAscii.height * this.currentAscii.blockHeight;

        this.delayRedrawCanvas();

        document.title = `asciibird - ${this.currentAscii.title}`;
      }
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
    isMouseOnCanvas() {
      this.clearToolCanvas();
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
    redrawSelect() {
      if (this.currentAsciiBlocks.length) {
        let targetBlock = this.currentAsciiBlocks[this.y][this.x];

        this.clearToolCanvas();
        this.toolCtx.fillStyle = this.$store.getters.mircColours[0];
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        this.toolCtx.fillRect(
          this.selecting.startX * BLOCK_WIDTH,
          this.selecting.startY * BLOCK_HEIGHT,
          this.selecting.endX * BLOCK_WIDTH,
          this.selecting.endY * BLOCK_HEIGHT
        );

        this.toolCtx.stroke();
      }
    },
    redrawCanvas() {
      // Clears the whole canvas, we can maybe get a better way to check how far
      // we need to clear the canvas
      this.ctx.clearRect(0, 0, 10000, 10000);

      if (this.currentAsciiBlocks.length) {
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
        this.ctx.font = "13px Hack";

        for (y = 0; y < this.currentAscii.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.currentAscii.width + 1; x++) {
            if (this.currentAsciiBlocks[y] && this.currentAsciiBlocks[y][x]) {
              curBlock = Object.assign(curBlock, this.currentAsciiBlocks[y][x]);

              canvasX = BLOCK_WIDTH * x;

              // Background block
              if (curBlock.bg !== null) {
                this.ctx.fillStyle =
                  this.$store.getters.mircColours[curBlock.bg];
                this.ctx.fillRect(canvasX, canvasY, BLOCK_WIDTH, BLOCK_HEIGHT);
              } else {
                this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
              }

              if (curBlock.char) {
                if (curBlock.fg !== null) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.fg];
                } else {
                  this.ctx.fillStyle = "#000000";
                }

                this.ctx.fillText(
                  curBlock.char,
                  canvasX + 0.5,
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

      const oldWidth = blocks[0].length;
      const oldHeight = blocks.length;

      const canvasBlockHeight = Math.floor(
        height / this.currentAscii.blockHeight
      );
      const canvasBlockWidth = Math.floor(width / this.currentAscii.blockWidth);

      if (canvasBlockHeight > oldHeight || canvasBlockWidth > oldWidth) {
        // console.log({ canvasBlockHeight, oldHeight });

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
        // console.log({ canvasBlockWidth, oldWidth });
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
          this.currentAsciiBlocks[this.textEditing.startY] &&
          this.currentAsciiBlocks[this.textEditing.startY][
            this.textEditing.startX
          ]
        ) {
          const targetBlock =
            this.currentAsciiBlocks[this.textEditing.startY][
              this.textEditing.startX
            ];

          switch (char) {
            case "Backspace":
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
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

          this.drawTextIndicator();
        }
        this.delayRedrawCanvas();
      }
    },
    // Mouse Up, Down and Move
    canvasMouseUp() {
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      switch (this.currentTool.name) {
        case "brush":
          this.canTool = false;

          this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);

          break;

        case "eraser":
          this.canTool = false;

          this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
          break;

        case "fill":
          this.canTool = false;

          this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
          break;

        case "select":
          this.selecting.canSelect = false;
          this.clearToolCanvas();

          //
          let x = 0;
          let y = 0;

          let arrayX = 0;
          let arrayY = 0;

          let canvasY = 0;
          let canvasX = 0;
          let curBlock = {};
          this.selectBlocks = [];

          for (y = 0; y < this.currentAscii.height; y++) {
            canvasY = BLOCK_HEIGHT * y;

            if (y >= this.selecting.startY && y <= this.selecting.endY) {
              if (!this.selectBlocks[y]) {
                this.selectBlocks[y] = [];
              }

              for (x = 0; x < this.currentAscii.width; x++) {
                if (x >= this.selecting.startX && x <= this.selecting.endX) {
                  if (
                    this.currentAsciiBlocks[y] &&
                    this.currentAsciiBlocks[y][x]
                  ) {
                    curBlock = Object.assign(
                      curBlock,
                      this.currentAsciiBlocks[y][x]
                    );

                    if (!this.selectBlocks[y][x]) {
                      this.selectBlocks[y][x] = { ...curBlock };
                    }

                    canvasX = BLOCK_WIDTH * x;
                  }
                }
              }
            }
          }

          this.redrawSelect();
          break;

        case "text":
          // if (
          //   this.textEditing.startX === null ||
          //   this.textEditing.startY === null
          // ) {
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
          // }
          break;
      }

      this.delayRedrawCanvas();
    },
    canvasMouseDown() {
      this.toolCtx.clearRect(0, 0, 10000, 10000);

      if (
        this.currentAsciiBlocks[this.y] &&
        this.currentAsciiBlocks[this.y][this.x] &&
        this.currentTool
      ) {
        const targetBlock = this.currentAsciiBlocks[this.y][this.x];

        switch (this.currentTool.name) {
          case "default":
            break;

          case "select":
            if (
              this.selecting.startX === null ||
              (this.selecting.startY === null &&
                this.selecting.canSelect === false)
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
            this.drawBrush();
            break;

          case "eraser":
            this.canTool = true;
            this.eraser();
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
        this.currentAsciiBlocks[this.y] &&
        this.currentAsciiBlocks[this.y][this.x]
      ) {
        let targetBlock = this.currentAsciiBlocks[this.y][this.x];

        switch (
          this.$store.getters.getToolbarIcons[
            this.$store.getters.getCurrentTool
          ].name
        ) {
          case "brush":
            if (this.isMouseOnCanvas) {
              this.drawBrush();
            }
            break;

          case "eraser":
            if (this.isMouseOnCanvas) {
              this.drawBrush(true);
            }
            this.eraser();
            break;

          case "select":
            if (this.selecting.canSelect) {
              this.selecting.endX = this.x;
              this.selecting.endY = this.y;

              this.redrawSelect();
            }

            if (!this.isSelected) {
              this.redrawSelect();
            }

            break;

          case "text":
            this.drawIndicator();
            break;

          case "dropper":
            this.drawIndicator();
            break;

          case "fill":
            this.drawIndicator();
            break;
        }
      }

      this.delayRedrawCanvas();
    },
    clearToolCanvas() {
      if (this.toolCtx) {
        this.toolCtx.clearRect(0, 0, 10000, 10000);
        this.toolCtx.stroke();
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        setTimeout(() => {
          this.redraw = true;
          this.redrawCanvas();
        }, this.$store.state.options.canvasRedrawSpeed);
      }
    },
    //
    // TOOLS
    //
    drawIndicator() {
      this.clearToolCanvas();

      let targetBlock = this.currentAsciiBlocks[this.y][this.x];

      let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

      if (targetBlock.bg === 8) {
        indicatorColour = 1;
      }

      this.toolCtx.fillStyle = this.$store.getters.mircColours[indicatorColour];
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      this.toolCtx.fillRect(
        this.x * BLOCK_WIDTH,
        this.y * BLOCK_HEIGHT,
        BLOCK_WIDTH,
        BLOCK_HEIGHT
      );

      this.toolCtx.stroke();
    },
    drawTextIndicator() {
      this.clearToolCanvas();

      let targetBlock =
        this.currentAsciiBlocks[this.textEditing.startY][
          this.textEditing.startX
        ];

      let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

      if (targetBlock.bg === 8) {
        indicatorColour = 1;
      }

      this.toolCtx.fillStyle = this.$store.getters.mircColours[indicatorColour];
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;
      this.toolCtx.fillRect(
        this.textEditing.startX * BLOCK_WIDTH,
        this.textEditing.startY * BLOCK_HEIGHT,
        BLOCK_WIDTH,
        BLOCK_HEIGHT
      );

      this.toolCtx.stroke();
    },
    drawBrush(plain = false) {
      this.clearToolCanvas();
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      let targetBlock = this.currentAsciiBlocks[this.y][this.x];

      let brushDiffX = Math.floor(this.brushBlocks[0].length / 2) * BLOCK_WIDTH;
      let brushDiffY = Math.floor(this.brushBlocks.length / 2) * BLOCK_HEIGHT;

      for (let y = 0; y < this.brushBlocks.length; y++) {
        for (let x = 0; x < this.brushBlocks[0].length; x++) {
          let brushBlock = this.brushBlocks[y][x];

          let brushX = this.x * BLOCK_WIDTH + x * BLOCK_WIDTH - brushDiffX;
          let brushY = this.y * BLOCK_HEIGHT + y * BLOCK_HEIGHT - brushDiffY;

          let brushYHeight = brushY / BLOCK_HEIGHT;
          let brushXWidth = brushX / BLOCK_WIDTH;

          if (
            this.currentAsciiBlocks[brushYHeight] &&
            this.currentAsciiBlocks[brushYHeight][brushXWidth]
          ) {
            targetBlock = this.currentAsciiBlocks[brushYHeight][brushXWidth];

            if (!plain) {
              if (this.canBg) {
                if (brushBlock.bg !== null) {
                  this.toolCtx.fillStyle =
                    this.$store.getters.mircColours[brushBlock.bg];
                } else {
                  this.toolCtx.fillStyle = "#FFFFFF";
                }

                this.toolCtx.fillRect(
                  brushX,
                  brushY,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT
                );

                if (this.canTool && brushBlock.bg !== null) {
                  targetBlock.bg = this.$store.getters.getBgColour;
                }
              }

              if (this.canFg) {
                if (brushBlock.fg !== null) {
                  this.toolCtx.fillStyle =
                    this.$store.getters.mircColours[brushBlock.fg];
                } else {
                  this.toolCtx.fillStyle = "#000000";
                }

                if (this.canTool && brushBlock.fg !== null) {
                  targetBlock.fg = this.$store.getters.getFgColour;
                }
              }

              if (this.canText && brushBlock.char !== null) {
                this.toolCtx.fillStyle =
                  this.$store.getters.mircColours[brushBlock.fg];

                this.toolCtx.fillText(
                  brushBlock.char,
                  brushX - 1,
                  brushY + BLOCK_HEIGHT - 3
                );

                if (this.canTool && brushBlock.char !== null) {
                  targetBlock.char = this.$store.getters.getSelectedChar;
                }
              }
            } else {
              this.toolCtx.fillStyle = this.$store.getters.mircColours[0];

              this.toolCtx.fillRect(brushX, brushY, BLOCK_WIDTH, BLOCK_HEIGHT);
            }
          }
        }
      }

      this.toolCtx.stroke();
    },
    eraser() {
      if (this.canTool) {
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        let targetBlock = this.currentAsciiBlocks[this.y][this.x];

        let brushDiffX =
          Math.floor(this.$store.getters.brushBlocks[0].length / 2) *
          BLOCK_WIDTH;
        let brushDiffY =
          Math.floor(this.$store.getters.brushBlocks.length / 2) * BLOCK_HEIGHT;

        for (let y = 0; y < this.$store.getters.brushBlocks.length; y++) {
          for (let x = 0; x < this.$store.getters.brushBlocks[0].length; x++) {
            let brushX = this.x * BLOCK_WIDTH + x * BLOCK_WIDTH - brushDiffX;
            let brushY = this.y * BLOCK_HEIGHT + y * BLOCK_HEIGHT - brushDiffY;

            if (
              this.currentAsciiBlocks[brushY / BLOCK_HEIGHT] &&
              this.currentAsciiBlocks[brushY / BLOCK_HEIGHT][
                brushX / BLOCK_WIDTH
              ]
            ) {
              targetBlock =
                this.currentAsciiBlocks[brushY / BLOCK_HEIGHT][
                  brushX / BLOCK_WIDTH
                ];

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
          }
        }
      }
    },
    // Fill tool
    fill() {
      const { x } = this;
      const { y } = this;

      const newColor = this.$store.getters.getBgColour;

      // Get the input which needs to be replaced.
      const current = this.currentAsciiBlocks[y][x].bg;

      // If the newColor is same as the existing
      // Then return the original image.
      if (current === newColor) {
        return this.currentAsciiBlocks;
      }

      // Other wise call the fill function which will fill in the existing image.
      this.fillTool(this.currentAsciiBlocks, y, x, newColor, current);

      this.$store.commit("updateAsciiBlocks", this.currentAsciiBlocks);
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
