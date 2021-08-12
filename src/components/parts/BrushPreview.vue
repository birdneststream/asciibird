<template>
  <div>
    <div class="flex">
      <div class="w-1/2">
        <t-input
          type="number"
          name="width"
          v-model="brushSizeWidthInput"
          min="1"
          :max="maxBrushSize"
        />
      </div>

      <div class="w-1/2">
        <t-input
          type="number"
          name="height"
          v-model="brushSizeHeightInput"
          min="1"
          :max="maxBrushSize"
        />
      </div>
    </div>

    <div class="flex">
      <label class="block">
        <t-radio
          name="options"
          value="square"
          checked
          v-model="brushSizeTypeInput"
        />
        <span class="text-sm">Square</span>
      </label>

      <label class="block">
        <t-radio name="options" value="circle" v-model="brushSizeTypeInput" />
        <span class="text-sm">Circle</span>
      </label>

      <label class="block">
        <t-radio name="options" value="cross" v-model="brushSizeTypeInput" />
        <span class="text-sm">Cross</span>
      </label>
    </div>

    <MainBrushCanvas />
  </div>
</template>

<script>
import { emptyBlock, maxBrushSize } from "../../ascii";
import MainBrushCanvas from "./MainBrushCanvas.vue";

export default {
  name: "BrushPreview",
  components: {
    MainBrushCanvas,
  },
  mounted() {
    if (this.brushBlocksEmpty) {
      this.brushSizeWidthInput = this.brushSizeWidth;
      this.brushSizeHeightInput = this.brushSizeHeight;
      this.brushSizeTypeInput = this.brushSizeType;
      this.createBlocks();
    }
  },
  data: () => ({
    blocks: [],
    brushSizeHeightInput: 1,
    brushSizeWidthInput: 1,
    brushSizeTypeInput: "square",
  }),
  computed: {
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
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    brushBlocksEmpty() {
      return this.brushBlocks.length === 0;
    },
    maxBrushSize() {
      return maxBrushSize
    }
  },
  watch: {
    brushSizeWidth() {
      this.brushSizeWidthInput = this.brushSizeWidth;
    },
    brushSizeHeight() {
      this.brushSizeHeightInput = this.brushSizeHeight;
    },
    brushSizeType() {
      this.brushSizeTypeInput = this.brushSizeType;
    },
    brushSizeHeightInput(val, old) {
      if (val !== old) {
        this.createBlocks();
      }
    },
    brushSizeWidthInput(val, old) {
      if (val !== old) {
        this.createBlocks();
      }
    },
    brushSizeTypeInput(val, old) {
      if (val !== old) {
        this.createBlocks();
      }
    },
    brushBlocks() {
      this.$store.commit("pushBrushHistory", this.brushBlocks);
    },
  },
  methods: {
    updateBrushSize() {
      this.$store.commit("updateBrushSize", {
        brushSizeHeight: this.brushSizeHeightInput,
        brushSizeWidth: this.brushSizeWidthInput,
        brushSizeType: this.brushSizeTypeInput,
      });
    },
    createBlocks() {
      this.updateBrushSize();

      const brushHeight = this.brushSizeHeight;
      const brushWidth = this.brushSizeWidth;
      this.blocks = [];

      let y = 0;
      let x = 0;
      let targetX = 0;

      const block = {
        fg: this.currentFg,
        bg: this.currentBg,
        char: this.currentChar,
      };

      const middleY = Math.floor(brushHeight / 2);
      const middleX = Math.floor(brushWidth / 2);
      let yModifier = 0;
      
      // Recreate 2d array for preview
      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          switch (this.brushSizeType) {
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

      this.$store.commit("brushBlocks", this.blocks);
    },
  },
};
</script>
