<template>
  <div>
    <div id="canvas-area">
      <vue-draggable-resizable
        style="z-index: 5; left: 220px"
        :grid="[
          $store.getters.currentAscii.blockHeight,
          $store.getters.currentAscii.blockWidth,
        ]"
        :w="canvas.width + $store.getters.currentAscii.blockWidth"
        :h="canvas.height + $store.getters.currentAscii.blockHeight"
        :draggable="$store.getters.getCurrentTool === 'default'"
        @resizing="onCanvasResize"
        @dragging="onCanvasDrag"
      >
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
      this.canvas.width =
        this.$store.getters.currentAscii.width *
        this.$store.getters.currentAscii.blockWidth;
      this.canvas.height =
        this.$store.getters.currentAscii.height *
        this.$store.getters.currentAscii.blockHeight;
      this.delayRedrawCanvas();
      this.$store.commit("changeTool", "default");
    }
  },
  created() {},
  data: () => ({
    ctx: null,
    canvas: {
      width: 512,
      height: 512,
    },
    x: 0, // Ascii X and Y
    y: 0, // Ascii X and Y
    redraw: true, // Used to limit canvas redraw
    canTool: false,
  }),
  computed: {
    canvasStyle() {
      return `width:${this.canvas.width};height:${this.canvas.height};`;
    },
    generateTitle() {
      return this.$store.getters.currentAscii.title ?? "";
    },
    watchAsciiChange() {
      return this.$store.getters.currentAscii;
    },
  },
  watch: {
    watchAsciiChange(val, old) {
      this.canvas.width =
        this.$store.getters.currentAscii.width *
        this.$store.getters.currentAscii.blockWidth;
      this.canvas.height =
        this.$store.getters.currentAscii.height *
        this.$store.getters.currentAscii.blockHeight;

      this.delayRedrawCanvas();

      document.title = `asciibird - ${this.$store.getters.currentAscii.title}`;
    },
  },
  methods: {
    redrawCanvas() {
      // Clears the whole canvas, we can maybe get a better way to check how far
      // we need to clear the canvas
      this.ctx.clearRect(0, 0, 10000, 10000);

      if (this.$store.getters.currentAscii.blocks.length) {
        const BLOCK_WIDTH = this.$store.getters.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.$store.getters.currentAscii.blockHeight;

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        // hack font for ascii shout outs 2 beenz
        this.ctx.font = "12.5px Hack";

        for (y = 0; y < this.$store.getters.currentAscii.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.$store.getters.currentAscii.width + 1; x++) {
            if (
              this.$store.getters.currentAscii.blocks[y] &&
              this.$store.getters.currentAscii.blocks[y][x]
            ) {
              curBlock = Object.assign(
                curBlock,
                this.$store.getters.currentAscii.blocks[y][x]
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
      this.canvas.width = width;
      this.canvas.height = height;
      this.delayRedrawCanvas();
    },
    onCanvasDrag(left, top) {
      // Update left and top in panel
    },

    // Mouse Up, Down and Move
    canvasMouseUp() {
      this.delayRedrawCanvas();

      switch (this.$store.getters.getCurrentTool) {
        case "brush":
          this.canTool = false;
          break;

        case "eraser":
          this.canTool = false;
          break;

        case "fill":
          this.canTool = false;

          break;
      }
    },
    canvasMouseDown() {
      if (
        this.$store.getters.currentAscii.blocks[this.y] &&
        this.$store.getters.currentAscii.blocks[this.y][this.x]
      ) {
        switch (this.$store.getters.getCurrentTool) {
          case "default":
            break;

          case "fill":
            this.fillTool();
            break;

          case "brush":
            this.canTool = true;
            break;

          case "eraser":
            this.canTool = true;
            break;

          case "dropper":
            let curBlock = this.$store.getters.currentAscii.blocks[this.y][
              this.x
            ];

            if (this.$store.getters.getTargetingFg) {
              this.$store.commit("changeColourFg", curBlock.fg);
            }

            if (this.$store.getters.getTargetingBg) {
              this.$store.commit("changeColourBg", curBlock.bg);
            }

            if (this.$store.getters.getTargetingChar) {
              this.$store.commit("changeChar", curBlock.char);
            }

            this.$store.commit(
              "changeTool",
              this.$store.getters.getCurrentTool
            );
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

      this.x = Math.floor(this.x / this.$store.getters.currentAscii.blockWidth);
      this.y = Math.floor(
        this.y / this.$store.getters.currentAscii.blockHeight
      );

      this.$emit('coordsupdate', {x: this.x, y: this.y})

      if (
        this.$store.getters.currentAscii.blocks[this.y] &&
        this.$store.getters.currentAscii.blocks[this.y][this.x]
      ) {
        switch (this.$store.getters.getCurrentTool) {
          case "brush":
            if (this.canTool) {
              if (this.$store.getters.getTargetingFg) {
                this.$store.getters.currentAscii.blocks[this.y][this.x].fg = this.$store.getters.getFgColour;
              }

              if (this.$store.getters.getTargetingBg) {
                this.$store.getters.currentAscii.blocks[this.y][this.x].bg = this.$store.getters.getBgColour;
              }

              if (this.$store.getters.getTargetingChar) {
                this.$store.getters.currentAscii.blocks[this.y][this.x].char = this.$store.getters.getSelectedChar;
              }
            }
            break;

          case "eraser":
            if (this.canTool) {
              if (this.$store.getters.getTargetingFg) {
                this.$store.getters.currentAscii.blocks[this.y][
                  this.x
                ].fg = null;
              }

              if (this.$store.getters.getTargetingBg) {
                this.$store.getters.currentAscii.blocks[this.y][
                  this.x
                ].bg = null;
              }

              if (this.$store.getters.getTargetingChar) {
                this.$store.getters.currentAscii.blocks[this.y][
                  this.x
                ].char = null;
              }
            }
            break;
        }
      }

      this.delayRedrawCanvas();
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        setTimeout(() => {
          this.redraw = true;
          this.redrawCanvas();
        }, 8);
      }
    },

    // TOOLS
    fillTool() {
      let fillStartBlock = this.$store.getters.currentAscii.blocks[this.y][
        this.x
      ];

      if (this.$store.getters.getTargetingBg) {
        let fillSameBg = fillStartBlock.bg;
      }

      // console.log(fillStartBlock);
    },
  },
};
</script>
