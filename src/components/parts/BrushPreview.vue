<template>
  <div>
    <t-input
      type="number"
      name="width"
      v-model="brushSizeWidth"
      @change="updateBrushSizeWidth"
      min="1"
      max="10"
    />

    <t-input
      type="number"
      name="height"
      v-model="brushSizeHeight"
      @change="updateBrushSizeHeight"
      min="1"
      max="10"
    />

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
  },
  data: () => ({
    ctx: null,
    redraw: true,
    brushSizeHeight: 1,
    brushSizeWidth: 1,
  }),
  computed: {
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    toolbarState() {
      return this.$store.getters.getToolbarState;
    },
    watchBrushSizeWidth() {
      return this.brushSizeWidth;
    },
    watchBrushSizeHeight() {
      return this.brushSizeHeight;
    },
  },
  watch: {
    toolbarState(val, old) {
      console.log(val);
      this.delayRedrawCanvas();
    },
    watchBrushSizeWidth(val, old) {
      //   console.log(val, old);
      //   this.brushSizeWidth = val;
      this.delayRedrawCanvas();
    },
    watchBrushSizeHeight(val, old) {
      //   console.log(val, old);
      //   this.brushSizeHeight = val;
      this.delayRedrawCanvas();
    },
  },
  methods: {
    updateBrushSizeHeight() {
      this.$store.commit("updateBrushSize", {
        brushSizeHeight: this.brushSizeHeight,
        brushSizeWidth: this.brushSizeWidth,
      });
    },
    updateBrushSizeWidth() {
      this.$store.commit("updateBrushSize", {
        brushSizeHeight: this.brushSizeHeight,
        brushSizeWidth: this.brushSizeWidth,
      });
    },
    drawPreview() {
      let brushHeight = this.toolbarState.brushSizeHeight;
      let brushWidth = this.toolbarState.brushSizeWidth;

      this.ctx.clearRect(0, 0, 1000, 1000);
      this.ctx.fillStyle = this.$store.getters.mircColours[1];

      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      // hack font for ascii shout outs 2 beenz
      this.ctx.font = "12.5px Hack";

      let y = 0;
      let x = 0;

      let emptyBlock = {
        fg: null,
        bg: null,
        char: null,
      };

      let blocks = [];

      let minY = 5 - brushHeight;
      let maxY = 5 + brushHeight;

      let minX = 5 - brushWidth;
      let maxX = 5 + brushWidth;

      for (y = 0; y < 10; y++) {
        blocks[y] = [];

        if (y < maxY && y > minY) {
          for (x = 0; x < 10; x++) {
            if (x < maxX && x > minX) {
              let block = {
                fg: this.$store.getters.getFgColour,
                bg: this.$store.getters.getBgColour,
                char: this.$store.getters.getSelectedChar,
              };

              blocks[y][x] = Object.assign({}, block);
            } else {
              blocks[y][x] = Object.assign({}, emptyBlock);
            }
          }
        }
      }

      console.log("blocks", blocks);

      // Get middle block
      for (y = 0; y < blocks.length; y++) {
        for (x = 0; x < blocks[0].length; x++) {
          let curBlock = blocks[y][x];

          if (curBlock.bg) {
            this.ctx.fillStyle = this.$store.getters.mircColours[curBlock.bg];

            this.ctx.fillRect(
              x * BLOCK_WIDTH,
              y * BLOCK_HEIGHT,
              BLOCK_WIDTH,
              BLOCK_HEIGHT
            );
          }

          if (curBlock.fg) {
            this.ctx.fillStyle = this.$store.getters.mircColours[curBlock.fg];
          }

          if (curBlock.char) {
            this.ctx.fillStyle = this.$store.getters.mircColours[curBlock.fg];
            this.ctx.fillText(
              curBlock.char,
              x * BLOCK_WIDTH - 1,
              y * BLOCK_HEIGHT + BLOCK_HEIGHT - 3
            );
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
        }, this.$store.state.options.canvasRedrawSpeed);
      }
    },
  },
};
</script>
