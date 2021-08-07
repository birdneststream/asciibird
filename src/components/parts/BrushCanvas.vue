<template>
  <div>
    <t-card  >
    <canvas
      :ref="canvasName"
      :id="canvasName"
      
      :width="blocksWidthHeight.w"
      :height="blocksWidthHeight.h"
      
    />
    </t-card>
  </div>
</template>

<script>
import { mircColours99, blockWidth, blockHeight, cyrb53, getBlocksWidth, filterNullBlocks  } from "../../ascii";

export default {
  name: "BrushCanvas",
  mounted() {
    this.ctx = this.$refs[this.canvasName].getContext("2d");
    this.delayRedrawCanvas();
  },
  props: {
    blocks: {
      type: [Array, Boolean],
      required: false,
      default: false,
    },
  },
  data: () => ({
    ctx: null,
    redraw: true,
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
    currentChar() {
      return this.$store.getters.currentChar;
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
    options() {
      return this.$store.getters.options;
    },
    canvasName() {
      let hash = cyrb53(JSON.stringify(this.getBlocks))
      return `${hash}-brush-canvas`;
    },
    getBlocks() {
      return this.blocks === false
        ? this.$store.getters.brushBlocks
        : this.blocks;
    },
    isMainCanvas() {
      return this.blocks === false;
    },
    blocksWidthHeight() {
      return {
          w: 20 * blockWidth,
          h: this.getBlocks.length * blockHeight
        } 
    },
    mircColours() {
      return mircColours99;
    },
  },
  watch: {
    getBlocks() {
      this.delayRedrawCanvas();
    },
    blocks() {
      this.delayRedrawCanvas();
    },
    currentAscii() {
      this.delayRedrawCanvas();
    },
    brushSizeHeight() {
      this.delayRedrawCanvas();
    },
    brushSizeWidth() {
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
    currentChar() {
      this.delayRedrawCanvas();
    },
  },
  methods: {
    getBlocksWidth(blocks) {
      return getBlocksWidth(blocks)
    },
    filterNullBlocks(blocks) {
      return filterNullBlocks(blocks)
    },
    drawPreview() {
      this.ctx.clearRect(0, 0, 10000, 10000);
      this.ctx.fillStyle = this.mircColours[1];

      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      // hack font for ascii shout outs 2 beenz
      this.ctx.font = "13px Hack";

      let y = 0;
      let x = 0;

      // Get middle block
      if (this.getBlocks) {

        let blocksWidth = this.getBlocksWidth(this.getBlocks)
        for (y = 0; y < this.getBlocks.length; y++) {
          for (x = 0; x < blocksWidth; x++) {
            if (this.getBlocks[y] && this.getBlocks[y][x]) {
              const curBlock = this.getBlocks[y][x];

              if ((!this.isMainCanvas && curBlock.bg) || (curBlock.bg && this.isMainCanvas && this.isTargettingBg)) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];

                this.ctx.fillRect(
                  x * BLOCK_WIDTH,
                  y * BLOCK_HEIGHT,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT
                );
              }

              if ((!this.isMainCanvas && curBlock.fg) || (curBlock.fg && this.isMainCanvas && this.isTargettingFg)) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              }

              if ((!this.isMainCanvas && curBlock.char) || (curBlock.char && this.isMainCanvas && this.isTargettingChar)) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
                this.ctx.fillText(
                  curBlock.char,
                  x * BLOCK_WIDTH - 1,
                  y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
                );
              }
            }
          }
        }

        this.ctx.stroke();
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
