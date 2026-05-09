<template>
  <div>
    <div
      class="ab-card overflow-x-scroll overflow-y-scroll h-full"
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
          @mouseup="canTool = false"
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
          @mouseenter="disableToolbarMoving"
          @mouseleave="enableToolbarMoving"
        />

        <context-menu
          ref="main-brush-menu"
          class="z-50"
        >
          <ul>
            <li
              @click="canvasToPng()"
              class="ab-context-menu-item"
            >
              Save as PNG
            </li>
            <li
              @click="startExport('clipboard')"
              class="ab-context-menu-item"
            >
              Export Brush to Clipboard
            </li>
            <li
              @click="startExport('file')"
              class="ab-context-menu-item"
            >
              Export Brush to File
            </li>
            <li
              @click="saveToLibrary()"
              class="ab-context-menu-item"
            >
              Save to Library
            </li>
          </ul>
        </context-menu>
      </div>
    </div>
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
  downloadFile,
} from "../../ascii";
import { useAsciiBirdStore } from "../../store";
import { useToast } from "../../composables/useToast";
import { useClipboard } from "../../composables/useClipboard";

export default {
  name: "MainBrushCanvas",
  setup() {
    const store = useAsciiBirdStore();
    const toastShow = useToast();
    const copyText = useClipboard();
    return { store, toastShow, copyText };
  },
  components: {
    ContextMenu,
  },
  created() {
    window.addEventListener("load", () => {
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
      return blockWidth * this.store.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.store.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.store.blockSizeMultiplier;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    isTargettingBg() {
      return this.store.isTargettingBg;
    },
    isTargettingFg() {
      return this.store.isTargettingFg;
    },
    isTargettingChar() {
      return this.store.isTargettingChar;
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
    brushSizeHeight() {
      return this.store.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.store.brushSizeWidth;
    },
    brushSizeType() {
      return this.store.brushSizeType;
    },
    options() {
      return this.store.options;
    },
    brushBlocks() {
      return this.store.brushBlocks;
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
      return toolbarIcons[this.store.currentTool] ?? null;
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
    },
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
      this.$refs["main-brush-menu"].open({
        pageX: e.layerX,
        pageY: e.layerY,
      });
    },
    startExport(type) {
      let ascii = exportMirc(this.brushBlocks);
      switch (type) {
        case "clipboard":
          this.copyText(ascii.output.join("")).then(
            () => {
              this.toastShow("Copied mIRC brush to clipboard!", {
                type: "success",
              });
            },
            () => {
              this.toastShow("Error when copying mIRC to clipboard!", {
                type: "error",
              });
            }
          );
          this.$refs[`main-brush-menu`].close();
          break;

        default:
        case "file":
          downloadFile(
            ascii.output.join(""),
            `brush-${this.hash}.txt`,
            "text/plain"
          );
          this.$refs[`main-brush-menu`].close();
          break;
      }
    },
    saveToLibrary() {
      this.store.pushBrushLibrary(this.brushBlocks);
      this.toastShow(`Saved brush to Library`, {
        type: "success",
      });
      this.$refs[`main-brush-menu`].close();
    },
    canvasToPng() {
      canvasToPng(this.canvasRef, `brush-${this.hash}.png`);
      this.$refs[`main-brush-menu`].close();
    },
    processClick(e) {
      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / blockWidth);
      this.y = Math.floor(this.y / blockHeight);

      if (this.isErasing) {
        this.canTool = true;
        this.hasChanged = true;
        this.eraseBlock();
      }

      if (this.isBrushing) {
        this.canTool = true;
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

      this.ctx.font = "13px Hack";

      let y = 0;
      let x = 0;

      if (this.brushBlocks) {
        let blocksWidth = this.getBlocksWidth(this.brushBlocks);
        for (y = 0; y < this.brushBlocks.length; y++) {
          for (x = 0; x < blocksWidth; x++) {
            if (this.brushBlocks[y] && this.brushBlocks[y][x]) {
              const curBlock = this.brushBlocks[y][x];

              if (curBlock.bg !== undefined) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];

                this.ctx.fillRect(
                  x * blockWidth,
                  y * blockHeight,
                  blockWidth,
                  blockHeight
                );
              }

              if (curBlock.fg !== undefined) {
                this.ctx.fillStyle = this.mircColours[curBlock.fg];
              } else {
                this.ctx.fillStyle = "#FFFFFF";
              }

              if (curBlock.char !== undefined) {
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
        const _this = this;
        setTimeout(function () {
          requestAnimationFrame(() => {
            _this.drawPreview();
            _this.redraw = true;
          });
        }, 1000 / this.options.fps);
      }
    },
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
      if (this.canBg && this.brushBlocks[this.y][this.x]["bg"] !== undefined) {
        delete this.brushBlocks[this.y][this.x]["bg"];
      }

      if (this.canFg && this.brushBlocks[this.y][this.x]["fg"] !== undefined) {
        delete this.brushBlocks[this.y][this.x]["fg"];
      }

      if (this.canText && this.brushBlocks[this.y][this.x]["char"] !== undefined) {
        delete this.brushBlocks[this.y][this.x]["char"];
      }

      this.delayRedrawCanvas();
    },
    disableToolbarMoving() {
      this.canTool = false;
      this.store.changeToolBarDraggable(false);
    },
    enableToolbarMoving() {
      this.canTool = false;

      if ((this.isErasing || this.isBrushing) && this.hasChanged) {
        this.store.setBrushBlocks(this.brushBlocks);
        this.store.changeToolBarDraggable(true);
        this.hasChanged = false;
        this.toastShow(`Saved brush to Library`, {
          type: "success",
        });
      }
    },
  },
};
</script>
