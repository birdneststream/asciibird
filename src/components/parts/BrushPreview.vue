<template>
  <div>
    <t-input
      type="number"
      name="width"
      v-model="brushSizeWidth"
      @change="updateBrushSize"
      min="1"
      max="10"
    />

    <t-input
      type="number"
      name="height"
      v-model="brushSizeHeight"
      @change="updateBrushSize"
      min="1"
      max="10"
    />

    <div class="flex">
      <label class="block">
        <t-radio
          name="options"
          value="square"
          checked
          v-model="brushSizeType"
          @change="updateBrushSize"
        />
        <span class="text-sm">Square</span>
      </label>

      <label class="block">
        <t-radio
          name="options"
          value="circle"
          v-model="brushSizeType"
          @change="updateBrushSize"
        />
        <span class="text-sm">Circle</span>
      </label>

      <label class="block">
        <t-radio
          name="options"
          value="cross"
          v-model="brushSizeType"
          @change="updateBrushSize"
        />
        <span class="text-sm">Cross</span>
      </label>
    </div>

    <canvas
      ref="brushcanvas"
      id="brushcanvas"
      class="brushcanvas"
      :width="100"
      :height="100"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "BrushPreview",
  mounted() {
    this.ctx = this.$refs.brushcanvas.getContext("2d");
    this.delayRedrawCanvas();
    this.brushSizeWidth = this.$store.getters.brushSizeWidth;
    this.brushSizeHeight = this.$store.getters.brushSizeHeight;
    this.brushSizeType = this.$store.getters.brushSizeType;
  },
  data: () => ({
    ctx: null,
    redraw: true,
    blocks: [],
    brushSizeHeight: 1,
    brushSizeWidth: 1,
    brushSizeType: "square",
  }),
  computed: {
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    toolbarState() {
      return this.$store.getters.getToolbarState;
    },
    getTargetingBg() {
      return this.$store.getters.getTargetingBg;
    },
    getTargetingFg() {
      return this.$store.getters.getTargetingFg;
    },
    getTargetingChar() {
      return this.$store.getters.getTargetingChar;
    },
    getFgColour() {
      return this.$store.getters.getFgColour;
    },
    getBgColour() {
      return this.$store.getters.getBgColour;
    },
    getSelectedChar() {
      return this.$store.getters.getSelectedChar;
    },
    brushSizeHeightPreview() {
      return this.$store.getters.brushSizeHeight;
    },
    brushSizeWidthPreview() {
      return this.$store.getters.brushSizeWidth;
    },
    brushSizeTypePreview() {
      return this.$store.getters.brushSizeType;
    },
  },
  watch: {
    brushSizeWidth() {
      this.delayRedrawCanvas();
    },
    brushSizeHeight() {
      this.delayRedrawCanvas();
    },
    getTargetingBg() {
      this.delayRedrawCanvas();
    },
    getTargetingFg() {
      this.delayRedrawCanvas();
    },
    getTargetingChar() {
      this.delayRedrawCanvas();
    },
    getFgColour() {
      this.delayRedrawCanvas();
    },
    getBgColour() {
      this.delayRedrawCanvas();
    },
    getSelectedChar() {
      this.delayRedrawCanvas();
    },
  },
  methods: {
    updateBrushSize() {
      this.$store.commit("updateBrushSize", {
        brushSizeHeight: this.brushSizeHeight,
        brushSizeWidth: this.brushSizeWidth,
        brushSizeType: this.brushSizeType,
      });

      this.ctx.clearRect(0, 0, 1000, 1000);
      this.delayRedrawCanvas();
    },
    drawPreview() {
      let brushHeight = this.brushSizeHeightPreview;
      let brushWidth = this.brushSizeWidthPreview;

      this.blocks = [];

      this.ctx.fillStyle = this.$store.getters.mircColours[1];

      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      // hack font for ascii shout outs 2 beenz
      this.ctx.font = "12.5px Hack";

      let y = 0;
      let x = 0;

      let targetY = 0;
      let targetX = 0;

      let block = {
        fg: this.getFgColour,
        bg: this.getBgColour,
        char: this.getSelectedChar,
      };

      let emptyBlock = {
        fg: null,
        bg: null,
        char: null,
      };

      let middlePoint = Math.round(brushHeight / 2);

      let startWidth = Math.round(brushWidth / 2);

      // let checkWidth = 

      // Recreate 2d array for preview
      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          switch (this.brushSizeTypePreview) {
            case "cross":
              this.blocks[y][x] = Object.assign({}, emptyBlock);

              targetX = x;

              if (y % 2 === 0) {
                targetX = targetX - 1;
              }

              if (this.blocks[y]) {
                if (x % 2 === 0) {
                  this.blocks[y][targetX] = Object.assign({}, emptyBlock);
                } else {
                  this.blocks[y][targetX] = Object.assign({}, block);
                }
              }
              break;

            default:
            case "square":
              this.blocks[y][x] = Object.assign({}, block);
              break;

            // case "circle":

            //   // Top half
            //   if (y < middlePoint) {

            //     if (x = brushWidth-1) {
            //       this.blocks[y][x] = Object.assign({}, block);
            //     } else {
            //       this.blocks[y][x] = Object.assign({}, emptyBlock);
            //     }               

            //   } else {
            //     // Bottom half
            //     this.blocks[y][x] = Object.assign({}, block);
            //   }

            //   break;
          }
        }
      }

      // Get middle block
      for (y = 0; y < this.blocks.length; y++) {
        for (x = 0; x < this.blocks[0].length; x++) {
          if (this.blocks[y] && this.blocks[y][x]) {
            let curBlock = this.blocks[y][x];

            switch (this.brushSizeTypePreview) {
              case "cross":
                if (curBlock.bg && this.getTargetingBg) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.bg];

                  this.ctx.fillRect(
                    x * BLOCK_WIDTH,
                    y * BLOCK_HEIGHT,
                    BLOCK_WIDTH,
                    BLOCK_HEIGHT
                  );
                }

                if (curBlock.fg && this.getTargetingFg) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.fg];
                }

                if (curBlock.char && this.getTargetingChar) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.fg];
                  this.ctx.fillText(
                    curBlock.char,
                    x * BLOCK_WIDTH - 1,
                    y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
                  );
                }

                break;

              // case "circle":
              //   if (curBlock.bg && this.getTargetingBg) {
              //     this.ctx.fillStyle =
              //       this.$store.getters.mircColours[curBlock.bg];

              //     this.ctx.fillRect(
              //       x * BLOCK_WIDTH,
              //       y * BLOCK_HEIGHT,
              //       BLOCK_WIDTH,
              //       BLOCK_HEIGHT
              //     );
              //   }

              //   if (curBlock.fg && this.getTargetingFg) {
              //     this.ctx.fillStyle =
              //       this.$store.getters.mircColours[curBlock.fg];
              //   }

              //   if (curBlock.char && this.getTargetingChar) {
              //     this.ctx.fillStyle =
              //       this.$store.getters.mircColours[curBlock.fg];
              //     this.ctx.fillText(
              //       curBlock.char,
              //       x * BLOCK_WIDTH - 1,
              //       y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
              //     );
              //   }

              //   break;

              default:
              case "square":
                if (curBlock.bg && this.getTargetingBg) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.bg];

                  this.ctx.fillRect(
                    x * BLOCK_WIDTH,
                    y * BLOCK_HEIGHT,
                    BLOCK_WIDTH,
                    BLOCK_HEIGHT
                  );
                }

                if (curBlock.fg && this.getTargetingFg) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.fg];
                }

                if (curBlock.char && this.getTargetingChar) {
                  this.ctx.fillStyle =
                    this.$store.getters.mircColours[curBlock.fg];
                  this.ctx.fillText(
                    curBlock.char,
                    x * BLOCK_WIDTH - 1,
                    y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
                  );
                }
                break;
            }
          }
        }

        this.ctx.stroke();

        this.$store.commit("brushBlocks", this.blocks);
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        setTimeout(() => {
          this.redraw = true;
          this.drawPreview();
        }, 2);
      }
    },
  },
};
</script>
