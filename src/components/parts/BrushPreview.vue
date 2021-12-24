<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      @resizestop="onResize"
      :grid="[blockWidth, blockHeight]"
      :min-width="blockWidth * 20"
      :max-width="blockWidth * 80"
      :min-height="blockHeight * 20"
      :max-height="blockHeight * 80"
      :w="brushPreviewState.w"
      :h="brushPreviewState.h"
      :x="brushPreviewState.x"
      :y="brushPreviewState.y"
      :draggable="canDrag && !isInputtingBrushSize"
      ref="previewpaneldrag"
    >
      <t-card class="h-full">
        <div class="flex w-full">
          <div class="w-1/2">
            <t-input
              type="number"
              name="width"
              v-model="brushSizeWidthInput"
              min="1"
              :max="maxBrushSize"             
              @focus="isInputtingBrushSize = true"
              @blur="isInputtingBrushSize = false"
            />
          </div>

          <div class="w-1/2">
            <t-input
              type="number"
              name="height"
              v-model="brushSizeHeightInput"
              min="1"
              :max="maxBrushSize"              
              @focus="isInputtingBrushSize = true"
              @blur="isInputtingBrushSize = false"
            />
          </div>
        </div>

        <div class="w-full">

            <t-select :options="brushOptions" v-model="brushSizeTypeInput" />

          <!-- <label class="block">
            <t-radio
              name="options"
              value="square"
              checked
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Square</span>
          </label>

          <label class="block">
            <t-radio
              name="options"
              value="circle"
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Circle</span>
          </label>

          <label class="block">
            <t-radio
              name="options"
              value="cross"
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Cross</span>
          </label>

          <label class="block">
            <t-radio
              name="options"
              value="grid"
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Grid</span>
          </label>

          <label class="block">
            <t-radio
              name="options"
              value="inverted-grid"
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Inverted Grid</span>
          </label>

          <label class="block">
            <t-radio
              name="options"
              value="lines"
              v-model="brushSizeTypeInput"
            />
            <span class="text-sm">Lines</span>
          </label> -->
        </div>

        <div
          @mouseenter="canDrag = false"
          @mouseleave="canDrag = true"
        >
          <MainBrushCanvas />
        </div>
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import { emptyBlock, maxBrushSize, blockWidth, blockHeight } from "../../ascii";
import MainBrushCanvas from "./MainBrushCanvas.vue";

export default {
  name: "BrushPreview",
  components: {
    MainBrushCanvas,
  },
  created() {
    if (this.brushBlocksEmpty) {
      this.createBlocks();
      this.brushSizeWidthInput = this.brushSizeWidth;
      this.brushSizeHeightInput = this.brushSizeHeight;
      this.brushSizeTypeInput = this.brushSizeType;
    }

    this.panel.x = this.brushPreviewState.x;
    this.panel.y = this.brushPreviewState.y;
    this.panel.w = this.brushPreviewState.w;
    this.panel.h = this.brushPreviewState.h;
  },
  props: ['yOffset'],
  data: () => ({
    canDrag: true,
    blocks: [],
    brushSizeHeightInput: 1,
    brushSizeWidthInput: 1,
    brushSizeTypeInput: "square",
    panel: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
      visible: true,
    },
    isInputtingBrushSize: false,
  }),
  computed: {
    brushOptions() {
      return [
        'Square',
        'Circle',
        'Cross',
        'Grid',
        'Inverted Grid',
        'H lines',
        'V lines',
      ]
    },
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier;
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
    toolbarState() {
      return this.$store.getters.toolbarState;
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
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    brushBlocksEmpty() {
      return this.brushBlocks.length === 0;
    },
    maxBrushSize() {
      return maxBrushSize;
    },
    brushPreviewState() {
      return this.$store.getters.brushPreviewState;
    },
    updateBrush() {
      return this.toolbarState.updateBrush;
    },   
    middleY() {
      return Math.floor(this.brushSizeHeight / 2);
    },
    middleX() {
      return Math.floor(this.brushSizeWidth / 2);
    }
  },
  watch: {
    isInputtingBrushSize(val) {
      this.$emit("inputtingbrush", val)
    },
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
    canFg(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    canBg(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    canText(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    currentFg(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    currentBg(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    currentChar(val, old) {
      if (val !== old && this.updateBrush) {
        this.createBlocks();
      }
    },
    brushBlocks() {
      this.$store.commit("pushBrushHistory", this.brushBlocks);
    },
    yOffset(val) {
     this.$refs.previewpaneldrag.top = Number.parseInt(this.brushPreviewState.y+val)
    }
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

      // Recreate 2d array for preview
      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          switch (this.brushSizeType.toLowerCase() ) {
            case "cross":
              // If we are 1x1 force fill 1 block, to avoid an empty 1x1
              if (x === 0 && y === 0) {
                this.blocks[y][x] = { ...block };
                continue;
              }

              this.blocks[y][x] = { ...emptyBlock };

              if (this.blocks[y] && this.blocks[y][x]) {

                if (x % 2 === 0 && y % 2 === 0) {
                  this.blocks[y][x] = { ...block };
                } 
                
                if (x % 2 === 1 && y % 2 === 1) {
                  this.blocks[y][x] = { ...block };
                }
              }

              break;

            case "inverted grid":
              if (x === 0 && y === 0) {
                this.blocks[y][x] = { ...block };
                continue;
              }
              if (y % 2 === 0 || x % 2 === 0) {
                this.blocks[y][x] = { ...block };
              } else {
                this.blocks[y][x] = { ...emptyBlock };
              }
              break;


            case "grid":
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
                if (y % 2 === 0 && x % 2 !== 0) {
                  this.blocks[y][targetX] = { ...block };
                } else {
                  this.blocks[y][targetX] = { ...emptyBlock };
                }
              }

              break;

            case "h lines":
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
                if (y % 2 === 0) {
                  if (targetX % 2 === 0) { this.blocks[y][targetX] = { ...block }; }
                } else {
                  this.blocks[y][targetX] = { ...emptyBlock };
                }
              }

              break;

            case "v lines":
              if (x === 0 && y === 0) {
                this.blocks[y][x] = { ...block };
                continue;
              }

              if (x === brushWidth) {
                this.blocks[y][x] = { ...emptyBlock };
              } else {
                this.blocks[y][x] = { ...block };
              }

              let targetY = y;

              if (screenY % 2 === 0) {
                screenY -= 1;
              } 

              if (this.blocks[targetY] && this.blocks[targetY][x]) {
                if (x % 2 === 0) {
                  if (x % 2 === 0) { this.blocks[targetY][x] = { ...block }; }
                } else {
                  this.blocks[targetY][x] = { ...emptyBlock };
                }
              }

              break;

            // default:
            case "square":
              this.blocks[y][x] = { ...block };
              break;

            case "circle":
              this.blocks[y][x] = { ... emptyBlock };
              break;
          }
        }
      }

      switch(this.brushSizeType.toLowerCase()) {
          case "circle":
  
              let x1 = 0;
              let y1 = 0;

              for (let angle = 0; angle <= 360; angle += 1) {
                  let radian = angle * (Math.PI*2/360);
                  x1 = Math.round( (brushWidth - 1) * ( (Math.cos(radian) + 1.0) / 2.0));
                  y1 = Math.round( (brushHeight - 1) * ((Math.sin(radian) + 1.0) / 2.0));

                  if (this.blocks[y1] && this.blocks[y1][x1]) {
                    this.blocks[y1][x1] = { ...block };
                  } 
              }

              this.fill();
            break;
        }

      this.$store.commit("brushBlocks", this.blocks);
    },
    fill() {
      const current = {};
      current.bg = null;

      this.fillTool(
        this.middleY,
        this.middleX,
      );
    },
    fillTool(y, x) {
      if (y >= this.brushSizeHeight) {
        return;
      }

      if (x >= this.brushSizeWidth) {
        return;
      }

      if (this.blocks[y] === undefined || this.blocks[y][x] === undefined) {
        return;
      }

      if (this.blocks[y][x].bg === this.currentBg) {
        return;
      }

      // We can eraser or fill
      if (this.canBg) this.blocks[y][x].bg = this.currentBg;
      if (this.canFg) this.blocks[y][x].fg = this.currentFg;
      if (this.canText) this.blocks[y][x].char = this.currentChar;

      // Fill in all four directions
      // Fill Prev row
      this.fillTool(y, x - 1);

      // Fill Next row
      this.fillTool(y, x + 1);

      // Fill Prev col
      this.fillTool(y - 1, x);

      // Fill next col
      this.fillTool(y + 1, x);
    },
    onResize(x, y, w, h) {
      this.panel.x = x;
      this.panel.y = y;
      this.panel.w = w;
      this.panel.h = h;

      this.$store.commit("changeBrushPreviewState", this.panel);
    },
    onDragStop(x, y) {
      this.panel.x = x;
      this.panel.y = y;

      this.$store.commit("changeBrushPreviewState", this.panel);
    },
  },
};
</script>
