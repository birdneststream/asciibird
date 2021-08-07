<template>
  <div>
    <t-card class="overflow-x-scroll h-full">
      <div :style="`height: ${blocksWidthHeight.h}px;width: ${blocksWidthHeight.w}px;`">
        <canvas
          :ref="canvasName"
          :id="canvasName"
          class="previewcanvas"
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
        />
    </div>
    </t-card>
  </div>
</template>

<style>
.previewcanvas {
  background: rgba(0, 0, 0, 0.1);
  border: lightgrey 1px solid;
  z-index: 0;
}
</style>

<script>
import { mircColours99, blockWidth, blockHeight, cyrb53, getBlocksWidth, filterNullBlocks  } from "../../ascii";

export default {
  name: "BrushCanvas",
  mounted() {
    this.ctx = this.canvasRef.getContext("2d");
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
          w: getBlocksWidth(this.getBlocks) * blockWidth,
          h: this.getBlocks.length * blockHeight
        }
    },
    mircColours() {
      return mircColours99;
    },
    canvasRef() {
      return this.$refs[this.canvasName];
    }
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
      this.ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
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

              if (curBlock.bg !== null) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];

                this.ctx.fillRect(
                  x * BLOCK_WIDTH,
                  y * BLOCK_HEIGHT,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT
                );
              }

              if (curBlock.fg !== null) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              }

              if (curBlock.char !== null) {
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
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        requestAnimationFrame(() => {
          this.redraw = true;
          this.drawPreview();
        });
      }
    },
  },
};
</script>
