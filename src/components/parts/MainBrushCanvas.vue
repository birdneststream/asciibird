<template>
  <div>
    <t-card
      class="overflow-x-scroll overflow-y-scroll h-full"
      :h="blocksWidthHeight.h"
    >
      <div
        :style="`height: ${blocksWidthHeight.h}px;width: ${blocksWidthHeight.w}px;`"
        @mouseup.right="openContextMenu"
      >
        <canvas
          ref="brushcanvas"
          id="brushcanvas"
          class="brushcanvas"
          @mousemove="canvasMouseMove"
          @mousedown.left="processClick"
          @mouseup.left="canTool = false"
          @contextmenu.prevent
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
          @mouseenter="disableToolbarMoving"
          @mouseleave="enableToolbarMoving"
        />

        <context-menu ref="main-brush-menu" class="z-50" @contextmenu.prevent>
          <ul>
            <li @click="canvasToPng()" class="ab-context-menu-item">
              Save as PNG
            </li>
            <li @click="startExport('clipboard')" class="ab-context-menu-item">
              Export Brush to mIRC Clipboard
            </li>
            <li @click="startExport('file')" class="ab-context-menu-item">
              Export Brush to mIRC File
            </li>
            <li @click="saveToLibrary()" class="ab-context-menu-item">
              Save to Library
            </li>
          </ul>
        </context-menu>
      </div>
    </t-card>
  </div>
</template>

<script>
import ContextMenu from "./ContextMenu.vue";
import {
  mircColours99,
  blockWidth,
  blockHeight,
  getBlocksWidth,
  filterNullBlocks,
  toolbarIcons,
  emptyBlock,
  canvasToPng,
  cyrb53,
  exportMirc,
  downloadFile
} from "../../ascii";

export default {
  name: "MainBrushCanvas",
  components: {
    ContextMenu,
  },
  created() {
    window.addEventListener("load", () => {
      // Fixes the font on load issue
      this.delayRedrawCanvas();
    });
  },
  mounted() {
    this.ctx = this.canvasRef.getContext("2d");
    this.delayRedrawCanvas();
  },
  data: () => ({
    ctx: null,
    redraw: true,
    canTool: false,
    showContextMenu: true,
    hasChanged: false,
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
      return this.$store.getters.blockSizeMultiplier;
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
    },
    gridView() {
      return this.toolbarState.gridView;
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool] ?? null;
    },
    isDefault() {
      return this.currentTool.name === "default";
    },
    isBrushing() {
      return this.currentTool.name === "brush";
    },
    isErasing() {
      return this.currentTool.name === "eraser";
    },
    hash() {
      return cyrb53(JSON.stringify(this.brushBlocks));
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
    gridView(val, old) {
      if (val !== old) {
        this.delayRedrawCanvas();
      }
    },
  },
  methods: {
    openContextMenu(e) {
      e.preventDefault();
      // These are the correct X and Y when inside the floating panel
      this.$refs["main-brush-menu"].open({
        pageX: e.layerX,
        pageY: e.layerY,
      });
    },
    startExport(type) {
      let ascii = exportMirc(this.brushBlocks);
      switch (type) {
        case "clipboard":
          this.$copyText(ascii.output.join("")).then(
            (e) => {
              this.$toasted.show("Copied mIRC brush to clipboard!", {
                type: "success",
              });
            },
            (e) => {
              this.$toasted.show("Error when copying mIRC to clipboard!", {
                type: "error",
              });
            }
          );
          this.$refs[`main-brush-menu`].close();
          break;

        default:
        case "file":
          downloadFile(ascii.output.join(""), `brush-${this.hash}.txt`, "text/plain");
          this.$refs[`main-brush-menu`].close();
          break;
      }
    },
    saveToLibrary() {
      this.$store.commit("pushBrushLibrary", this.brushBlocks);
      this.$toasted.show(`Saved brush to Library`, {
            type: "success",
          });
      this.$refs[`main-brush-menu`].close();
    },
    canvasToPng() {
      canvasToPng(this.canvasRef, `brush-${this.hash}.png`)
      this.$refs[`main-brush-menu`].close();
    },
    processClick(e) {
      this.canTool = true;

      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / blockWidth);
      this.y = Math.floor(this.y / blockHeight);

      if (this.isErasing) {
        this.hasChanged = true;
        this.eraseBlock();
      }

      if (this.isBrushing) {
        this.hasChanged = true;
        this.addBlock();
      }
    },
    getBlocksWidth(blocks) {
      return getBlocksWidth(blocks);
    },
    filterNullBlocks(blocks) {
      return filterNullBlocks(blocks);
    },
    drawGrid() {
      let ctx = this.ctx;
      let w = this.canvasRef.width;
      let h = this.canvasRef.height;

      ctx.beginPath();

      for (var x = 0; x <= w; x += blockWidth) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([1]);

      ctx.stroke();

      ctx.beginPath();
      for (var y = 0; y <= h; y += blockHeight) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }

      ctx.stroke();
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

              if (curBlock.bg !== undefined) {
                // we had used to hide or show depending on canFg, etc && this.isTargettingBg
                this.ctx.fillStyle = this.mircColours[curBlock.bg];

                this.ctx.fillRect(
                  x * blockWidth,
                  y * blockHeight,
                  blockWidth,
                  blockHeight
                );
              }

              if (curBlock.fg !== undefined) {
                // we had used to hide or show depending on canFg, etc && this.isTargettingFg
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              }

              if (curBlock.char !== undefined) {
                // we had used to hide or show depending on canFg, etc && this.isTargettingChar
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

        if (this.gridView) {
          this.drawGrid();
        }
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;
        var _this = this;
        setTimeout(function () {
          requestAnimationFrame(() => {
            _this.drawPreview();
            _this.redraw = true;
          });
        }, 1000 / this.options.fps);
      }
    },
    // Basic block editing
    canvasMouseMove(e) {
      if (this.canTool && (this.isErasing || this.isBrushing)) {
        this.processClick(e);
      }
    },
    addBlock() {
      let block = { ...emptyBlock };

      if (this.canBg) {
        block["bg"] = this.currentBg;
      }

      if (this.canFg) {
        block["fg"] = this.currentFg;
      }

      if (this.canText) {
        block["char"] = this.currentChar;
      }

      this.brushBlocks[this.y][this.x] = block;
      this.delayRedrawCanvas();
    },
    eraseBlock() {
      if (this.canBg) {
        delete this.brushBlocks[this.y][this.x]["bg"];
      }

      if (this.canFg) {
        delete this.brushBlocks[this.y][this.x]["fg"];
      }

      if (this.canText) {
        delete this.brushBlocks[this.y][this.x]["char"];
      }

      this.delayRedrawCanvas();
    },
    disableToolbarMoving() {
      this.$store.commit("changeToolBarDraggable", false);
    },
    enableToolbarMoving() {
      // Save the blocks when the mouse leaves the canvas area
      // To avoid one block history changes
      if ( (this.isErasing || this.isBrushing) && this.hasChanged) {
        this.$store.commit("brushBlocks", this.brushBlocks);
        this.$store.commit("changeToolBarDraggable", true);
        this.hasChanged = false;
        this.$toasted.show(`Saved brush to Library`, {
          type: "success",
        });
      }
    },
  },
};
</script>
