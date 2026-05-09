<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full">
        <div class="flex w-full">
          <div class="w-1/2">
            <input
              type="number"
              name="width"
              class="ab-input"
              v-model="brushSizeWidthInput"
              min="1"
              :max="maxBrushSize"
              @focus="isInputtingBrushSize = true"
              @blur="isInputtingBrushSize = false"
            />
          </div>

          <div class="w-1/2">
            <input
              type="number"
              name="height"
              class="ab-input"
              v-model="brushSizeHeightInput"
              min="1"
              :max="maxBrushSize"
              @focus="isInputtingBrushSize = true"
              @blur="isInputtingBrushSize = false"
            />
          </div>
        </div>

        <div class="w-full">
          <select
            class="ab-input"
            v-model="brushSizeTypeInput"
          >
            <option
              v-for="opt in brushOptions"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>

        <div
          @mouseenter="canDrag = false"
          @mouseleave="canDrag = true"
        >
          <MainBrushCanvas />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { emptyBlock, maxBrushSize, blockWidth, blockHeight } from "../../ascii";
import MainBrushCanvas from "./MainBrushCanvas.vue";
import { useAsciiBirdStore } from "../../store";
import { useDraggable } from "@vueuse/core";
import { ref } from "vue";

export default {
  name: "BrushPreview",
  setup() {
    const store = useAsciiBirdStore();
    const panelEl = ref(null);
    const { style: panelStyle } = useDraggable(panelEl, {
      initialValue: { x: store.brushPreviewState.x, y: store.brushPreviewState.y },
    });
    return { store, panelEl, panelStyle };
  },
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

    this.panel.x = this.store.brushPreviewState.x;
    this.panel.y = this.store.brushPreviewState.y;
    this.panel.w = this.store.brushPreviewState.w;
    this.panel.h = this.store.brushPreviewState.h;
  },
  props: ["yOffset"],
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
        "Square",
        "Circle",
        "Cross",
        "Grid",
        "Inverted Grid",
        "H lines",
        "V lines",
      ];
    },
    blockWidth() {
      return blockWidth * this.store.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.store.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.store.blockSizeMultiplier;
    },
    canFg() {
      return this.store.isTargettingFg;
    },
    canBg() {
      return this.store.isTargettingBg;
    },
    canText() {
      return this.store.isTargettingChar;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    currentChar() {
      return this.store.currentChar;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    brushSizeHeight() {
      return this.store.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.store.brushSizeWidth;
    },
    brushSizeType() {
      return this.store.brushSizeType;
    },
    brushBlocks() {
      return this.store.brushBlocks;
    },
    brushBlocksEmpty() {
      return this.brushBlocks.length === 0;
    },
    maxBrushSize() {
      return maxBrushSize;
    },
    brushPreviewState() {
      return this.store.brushPreviewState;
    },
    updateBrush() {
      return this.toolbarState.updateBrush;
    },
    middleY() {
      return Math.floor(this.brushSizeHeight / 2);
    },
    middleX() {
      return Math.floor(this.brushSizeWidth / 2);
    },
  },
  watch: {
    isInputtingBrushSize(val) {
      this.$emit("inputtingbrush", val);
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
      this.store.pushBrushHistory(this.brushBlocks);
    },
    yOffset(val) {
      this.panelEl.style.top = Number.parseInt(
        this.brushPreviewState.y + val
      ) + "px";
    },
  },
  methods: {
    updateBrushSize() {
      this.store.updateBrushSize({
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
      let targetY = 0;

      const block = {
        fg: this.currentFg,
        bg: this.currentBg,
        char: this.currentChar,
      };

      for (y = 0; y < brushHeight; y++) {
        this.blocks[y] = [];
        for (x = 0; x < brushWidth; x++) {
          switch (this.brushSizeType.toLowerCase()) {
            case "cross":
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
                  if (targetX % 2 === 0) {
                    this.blocks[y][targetX] = { ...block };
                  }
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

              targetY = y;

              if (targetY % 2 === 0) {
                targetY -= 1;
              }

              if (this.blocks[targetY] && this.blocks[targetY][x]) {
                if (targetY % 2 === 0) {
                  if (x % 2 === 0) {
                    this.blocks[targetY][x] = { ...block };
                  }
                } else {
                  this.blocks[targetY][x] = { ...emptyBlock };
                }
              }

              break;

            case "square":
              this.blocks[y][x] = { ...block };
              break;

            case "circle":
              this.blocks[y][x] = { ...emptyBlock };
              break;
          }
        }
      }

      switch (this.brushSizeType.toLowerCase()) {
        case "circle": {
          let x1 = 0;
          let y1 = 0;

          for (let angle = 0; angle <= 360; angle += 1) {
            const radian = angle * ((Math.PI * 2) / 360);
            x1 = Math.round(
              (brushWidth - 1) * ((Math.cos(radian) + 1.0) / 2.0)
            );
            y1 = Math.round(
              (brushHeight - 1) * ((Math.sin(radian) + 1.0) / 2.0)
            );

            if (this.blocks[y1] && this.blocks[y1][x1]) {
              this.blocks[y1][x1] = { ...block };
            }
          }

          this.fill();
          break;
        }
      }

      this.store.setBrushBlocks(this.blocks);
    },
    fill() {
      const current = {};
      current.bg = null;

      this.fillTool(this.middleY, this.middleX);
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

      this.blocks[y][x].bg = this.currentBg;
      this.blocks[y][x].fg = this.currentFg;
      this.blocks[y][x].char = this.currentChar;

      this.fillTool(y, x - 1);
      this.fillTool(y, x + 1);
      this.fillTool(y - 1, x);
      this.fillTool(y + 1, x);
    },
  },
};
</script>
