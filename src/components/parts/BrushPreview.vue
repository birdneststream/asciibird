<template>
  <div>
    <div class="flex">
      <div class="w-1/2">
        <t-input
          type="number"
          name="width"
          v-model="brushSizeWidth"
          @change="updateBrushSize"
          min="1"
          max="10"
        />
      </div>

      <div class="w-1/2">
        <t-input
          type="number"
          name="height"
          v-model="brushSizeHeight"
          @change="updateBrushSize"
          min="1"
          max="10"
        />
      </div>
    </div>

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
      :width="brushSizeWidthPreview + 1 * currentAscii.blockWidth"
      :height="brushSizeHeightPreview + 1 * currentAscii.blockHeight"
    />
  </div>
</template>

<script>
import { emptyBlock, mircColours99 } from "../../ascii";

export default {
  name: "BrushPreview",
  mounted() {
    this.ctx = this.$refs.brushcanvas.getContext("2d");
    this.delayRedrawCanvas();
    this.brushSizeWidth = this.brushSizeWidthPreview;
    this.brushSizeHeight = this.brushSizeHeightPreview;
    this.brushSizeType = this.brushSizeTypePreview;
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
      return this.$store.getters.toolbarState;
    },
    isTargettingBg() {
      return this.$store.getters.isTargettingBg;
    },
    isTargettingFg() {
      return this.$store.getters.isTargettingFg;
    },
    isTargettingChar() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    getChar() {
      return this.$store.getters.getChar;
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
    mircColours() {
      return mircColours99;
    },
    options() {
      return this.$store.getters.options;
    },
  },
  watch: {
    brushSizeWidth() {
      this.delayRedrawCanvas();
    },
    brushSizeHeight() {
      this.delayRedrawCanvas();
    },
    isTargettingBg() {
      this.delayRedrawCanvas();
    },
    isTargettingFg() {
      this.delayRedrawCanvas();
    },
    isTargettingChar() {
      this.delayRedrawCanvas();
    },
    currentFg() {
      this.delayRedrawCanvas();
    },
    currentBg() {
      this.delayRedrawCanvas();
    },
    getChar() {
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
      this.ctx.clearRect(0, 0, 10000, 10000);

      const brushHeight = this.brushSizeHeightPreview;
      const brushWidth = this.brushSizeWidthPreview;

      this.blocks = [];

      this.ctx.fillStyle = this.mircColours[1];

      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      // hack font for ascii shout outs 2 beenz
      this.ctx.font = "13px Hack";

      let y = 0;
      let x = 0;
      let targetX = 0;

      const block = {
        fg: this.currentFg,
        bg: this.currentBg,
        char: this.getChar,
      };

      const middleY = Math.floor(brushHeight / 2);
      const middleX = Math.floor(brushWidth / 2);
      let yModifier = 0;

      // Recreate 2d array for preview
      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          switch (this.brushSizeTypePreview) {
            case "cross":
              // If we are 1x1 force fill 1 block, to avoid an empty 1x1
              if (x === 0 && y === 0) {
                this.blocks[y][x] = { ...block };
                continue;
              }

              if (x === brushWidth) {
                this.blocks[y][x] = { ...emptyBlock };
              } else {
                this.blocks[y][x] = { ...block };
              }

              targetX = x;

              if (y % 2 === 0) {
                targetX -= 1;
              }

              if (this.blocks[y] && this.blocks[y][targetX]) {
                if (x % 2 === 0) {
                  this.blocks[y][targetX] = { ...emptyBlock };
                } else {
                  this.blocks[y][targetX] = { ...block };
                }
              }

              break;

            // default:
            case "square":
              this.blocks[y][x] = { ...block };
              break;

            case "circle":
              if (middleY >= y) {
                // Top half
                yModifier = y;

                if (x <= middleX + yModifier && x >= middleX - yModifier) {
                  this.blocks[y][x] = { ...block };
                } else {
                  this.blocks[y][x] = { ...emptyBlock };
                }
              } else {
                // Bottom half
                yModifier = middleY - (y - middleY);

                if (x <= middleX + yModifier && x >= middleX - yModifier) {
                  this.blocks[y][x] = { ...block };
                } else {
                  this.blocks[y][x] = { ...emptyBlock };
                }
              }

              break;
          }
        }
      }

      // Get middle block
      for (y = 0; y < this.blocks.length; y++) {
        for (x = 0; x < this.blocks[0].length; x++) {
          if (this.blocks[y] && this.blocks[y][x]) {
            const curBlock = this.blocks[y][x];

            if (curBlock.bg && this.isTargettingBg) {
              this.ctx.fillStyle = this.mircColours[curBlock.bg];

              this.ctx.fillRect(
                x * BLOCK_WIDTH,
                y * BLOCK_HEIGHT,
                BLOCK_WIDTH,
                BLOCK_HEIGHT
              );
            }

            if (curBlock.fg && this.isTargettingFg) {
              this.ctx.fillStyle = this.mircColours[curBlock.fg];
            }

            if (curBlock.char && this.isTargettingChar) {
              this.ctx.fillStyle = this.mircColours[curBlock.fg];
              this.ctx.fillText(
                curBlock.char,
                x * BLOCK_WIDTH - 1,
                y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
              );
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
        }, this.options.canvasRedrawSpeed);
      }
    },
  },
};
</script>
