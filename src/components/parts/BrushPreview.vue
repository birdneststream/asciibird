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

    this.brushSizeHeight = this.$store.getters.brushSizeHeight;
    this.brushSizeWidth = this.$store.getters.brushSizeWidth;
    this.brushSizeType = this.$store.getters.brushSizeType;
  },
  data: () => ({
    ctx: null,
    redraw: true,
    brushSizeHeight: 1,
    brushSizeWidth: 1,
    brushSizeType: "square",
    blocks: [],
  }),
  computed: {
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    toolbarState() {
      return this.$store.getters.getToolbarState;
    },
  },
  watch: {
    brushSizeWidth() {
      this.delayRedrawCanvas()
    },
    brushSizeHeight() {
      this.delayRedrawCanvas()
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
      this.$store.commit("brushBlocks", this.blocks)
    },
    drawPreview() {
      let brushHeight = this.toolbarState.brushSizeHeight;
      let brushWidth = this.toolbarState.brushSizeWidth;

      
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

      let minY = 5 - brushHeight;
      let maxY = 5 + brushHeight;

      let minX = 5 - brushWidth;
      let maxX = 5 + brushWidth;

      let block = {
        fg: this.$store.getters.getFgColour,
        bg: this.$store.getters.getBgColour,
        char: this.$store.getters.getSelectedChar,
      };

      // Recreate 2d array for preview
      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          this.blocks[y][x] = Object.assign({}, block);
        }
      }     

      // Get middle block
      for (y = 0; y < this.blocks.length; y++) {
        for (x = 0; x < this.blocks[0].length; x++) {
          let curBlock = this.blocks[y][x];

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
        }, 2);
      }
    },
  },
};
</script>
