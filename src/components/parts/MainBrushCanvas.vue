<template>
  <div>
    <t-card class="overflow-x-scroll h-full">
      <div :style="`height: ${blocksWidthHeight.h}px;width: ${blocksWidthHeight.w}px;`">
        <canvas
          ref="brushcanvas"
          id="brushcanvas"
          class="brushcanvas"
          @mousemove="canvasMouseMove"
          @mouseup="disable"
          @mousedown.left="addBlock"
          @mousedown.right="eraseBlock"
          @contextmenu.prevent
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
          @mouseenter="disableToolbarMoving"
          @mouseleave="enableToolbarMoving"
        />
      </div>
    </t-card>
  </div>
</template>


<style>
.brushcanvas {
  background: rgba(0, 0, 0, 0.1);
  border: lightgrey 1px solid;
  z-index: 0;
}
</style>


<script>
import {
  mircColours99,
  blockWidth,
  blockHeight,
  getBlocksWidth,
  filterNullBlocks,
} from "../../ascii";

export default {
  name: "MainBrushCanvas",
  created() {
    window.addEventListener('load', () => {
         // Fixes the font on load issue
         this.delayRedrawCanvas();
    })
  },
  mounted() {
    this.ctx = this.canvasRef.getContext("2d");
    this.delayRedrawCanvas();
  },
  data: () => ({
    ctx: null,
    redraw: true,
    erasing: false,
    drawing: false,
    x: 0,
    y: 0,
  }),
  computed: {
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier
    },
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
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    blocksWidthHeight() {
      return {
        w: this.getBlocksWidth(this.brushBlocks) * blockWidth,
        h: this.brushBlocks.length * blockHeight,
      };
    },
    mircColours() {
      return mircColours99;
    },
    canvasRef() {
      return this.$refs.brushcanvas;
    }
  },
  watch: {
    brushBlocks() {
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
    blockSizeMultiplier() {
      this.delayRedrawCanvas();
    },
  },
  methods: {
    getBlocksWidth(blocks) {
      return getBlocksWidth(blocks);
    },
    filterNullBlocks(blocks) {
      return filterNullBlocks(blocks);
    },

    drawPreview() {
      this.ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
      this.ctx.fillStyle = this.mircColours[1];

      // hack font for ascii shout outs 2 beenz
      this.ctx.font = "13px Hack";

      let y = 0;
      let x = 0;

      // Get middle block
      if (this.brushBlocks) {
        let blocksWidth = this.getBlocksWidth(this.brushBlocks);
        for (y = 0; y < this.brushBlocks.length; y++) {
          for (x = 0; x < blocksWidth; x++) {
            if (this.brushBlocks[y] && this.brushBlocks[y][x]) {
              const curBlock = this.brushBlocks[y][x];

              if (curBlock.bg !== null && this.isTargettingBg) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];

                this.ctx.fillRect(
                  x * blockWidth,
                  y * blockHeight,
                  blockWidth,
                  blockHeight
                );
              }

              if (curBlock.fg !== null && this.isTargettingFg) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              }

              if (curBlock.char !== null && this.isTargettingChar) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
                this.ctx.fillText(
                  curBlock.char,
                  x * blockWidth,
                  y * blockHeight + blockHeight - 3
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
    // Basic block editing
    canvasMouseMove(e) {
      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / blockWidth);
      this.y = Math.floor(this.y / blockHeight);

      if (this.erasing) {
        this.brushBlocks[this.y][this.x] = {
          bg: this.canBg ? null : this.currentFg,
          fg: this.canFg ? null : this.currentBg,
          char: this.canText ? null : this.currentChar,
        };
      }

      if (this.drawing) {
        this.brushBlocks[this.y][this.x] = {
          bg: this.canBg ? this.currentBg : null,
          fg: this.canFg ? this.currentFg : null,
          char: this.canText ? this.currentChar : null,
        };
      }

      this.delayRedrawCanvas();
    },
    disable() {
      this.erasing = false;
      this.drawing = false;
    },
    addBlock() {
      this.drawing = true;
      this.brushBlocks[this.y][this.x] = {
        bg: this.canBg ? this.currentBg : null,
        fg: this.canFg ? this.currentFg : null,
        char: this.canText ? this.currentChar : null,
      };
    },
    eraseBlock(e) {
      this.erasing = true;
      this.brushBlocks[this.y][this.x] = {
        bg: this.canBg ? null : this.currentFg,
        fg: this.canFg ? null : this.currentBg,
        char: this.canText ? null : this.currentChar,
      };
    },
    disableToolbarMoving() {
      this.$store.commit("changeToolBarDraggable", false);
    },
    enableToolbarMoving() {
      // Save the blocks when the mouse leaves the canvas area
      // To avoid one block history changes
      this.disable()
      this.$store.commit("brushBlocks", this.brushBlocks);
      this.$store.commit("changeToolBarDraggable", true);
    },
  },
};
</script>
