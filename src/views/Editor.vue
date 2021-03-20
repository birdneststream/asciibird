<template>
  <div>
    <h1>
      {{ currentAsciibirdMeta.title }} ({{ currentAsciibirdMeta.width }} /
      {{ currentAsciibirdMeta.height }})
    </h1>

    <div id="canvas-area" style="position: relative">
      <span>{{ x }}, {{ y }}</span>
      <canvas
        ref="grid"
        id="grid"
        width="5024"
        height="5024"
        class="gridCanvas"
      ></canvas>

      <vue-draggable-resizable
        style="z-index: 5; left: 220px"
        :max-width="1000"
        :max-height="1000"
        :draggable="currentTool === 'default'"
      >
        
        <canvas
          ref="canvas"
          id="canvas"
          width="1000"
          height="1000"
          :key="refreshCanvas"
          class="canvas"
          @mousemove="showCoordinates"
          @mousedown="cavnasMouseDown"
          @mouseup="cavnasMouseUp"
        ></canvas>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<style>
body {
  background: #eee;
}

.canvas {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
  border: lightgrey 1px solid;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  z-index: 0;
}

.gridCanvas {
  position: absolute;
  border: lightgrey 1px solid;
  border-radius: 5px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  z-index: -1;
  margin-left: -2502px;
  margin-top: -2493px;
  width: 5000px;
  height: 5000px;
  display: block;
}
</style>

<script>
import Block from "../components/Block.vue";

export default {
  name: "Editor",
  props: ["tab", "refresh"],
  components: { Block },
  mounted() {
    this.currentAsciibirdMeta = this.$store.getters.currentAscii;
    this.mircColors = this.$store.getters.mircColors;

    if (this.currentAsciibirdMeta.blocks) {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.gridCtx = this.$refs.grid.getContext("2d");

      this.redrawCanvas();
    }
  },
  created() {},
  data: () => ({
    text: "ASCII",
    currentAsciibirdMeta: {
      title: "Loading...",
      width: 0,
      height: 0,
    },
    data: {
      message: "Hello Vue!",
      vueCanvas: null,
    },
    mircColors: null,
    ctx: null,
    selectionMode: false,
    startPosition: {
      x: null,
      y: null,
    },
    canvas: {
      width: 2048,
      height: 2048,
    },
    gridCtx: null,
    x: 0,
    y: 0,
    refreshCanvas: 0,
    currentTool: null,
  }),
  computed: {
    canvasStyle() {
      return `width:${this.canvas.width};height:${this.canvas.height};`;
    },
    generateTitle() {
      return this.currentAsciibirdMeta.title ?? "";
    },
    // watchColorChange() {
    //   return this.$store.getters.getColor;
    // },
    watchToolChange() {
      return this.$store.getters.getCurrentTool;
    },
    watchAsciiChange() {
      return this.$store.getters.currentAscii;
    },
  },
  watch: {
    watchAsciiChange(val, old) {
      this.currentAsciibirdMeta = val;
      this.drawGrid();
      this.redrawCanvas();
    },
    // watchColorChange(val) {
    //   console.log(JSON.stringify(val));
    // },
    watchToolChange(val) {
      this.currentTool = val;
    },
  },
  methods: {
    getMircColor(index) {
      return this.$store.getters.mircColors[index];
    },
    redrawCanvas() {
      // Clears the whole canvas
      this.ctx.clearRect(0, 0, 1000, 1000);
      this.ctx.stroke();

      this.drawGrid();

      if (this.currentAsciibirdMeta.blocks.length) {
        const BLOCK_WIDTH = this.currentAsciibirdMeta.blockWidth;
        const BLOCK_HEIGHT = this.currentAsciibirdMeta.blockHeight;

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        this.ctx.font = "14px Hack";

        for (y = 0; y < this.currentAsciibirdMeta.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.currentAsciibirdMeta.width + 1; x++) {
            if (
              this.currentAsciibirdMeta.blocks[y] &&
              this.currentAsciibirdMeta.blocks[y][x]
            ) {
              curBlock = JSON.parse(
                JSON.stringify(this.currentAsciibirdMeta.blocks[y][x])
              );
              canvasX = BLOCK_WIDTH * x;

              // Background block
              if (curBlock.bg !== null) {
                this.ctx.fillStyle = this.mircColors[curBlock.bg];
                this.ctx.fillRect(canvasX, canvasY, BLOCK_WIDTH, BLOCK_HEIGHT);
              } else {
                this.ctx.fillStyle = "rgba(0, 0, 200, 0)";
              }

              if (curBlock.char) {
                if (curBlock.fg !== null) {
                  this.ctx.fillStyle = this.mircColors[curBlock.fg];
                } else {
                  this.ctx.fillStyle = "#000000";
                }

                this.ctx.fillText(
                  curBlock.char,
                  canvasX,
                  canvasY + BLOCK_HEIGHT 
                );
                this.ctx.stroke();
              }
            }
          }
        }
      }

      this.ctx.stroke();
    },
    processMouseDown(e) {
      // this.canvasClass(e)
      this.selectionMode = true;
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
    },
    processMouseMove(e) {
      // if (this.selectionMode) {
      // }
    },
    processMouseUp(e) {
      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
    },
    showCoordinates(e) {
      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / this.currentAsciibirdMeta.blockWidth);
      this.y = Math.floor(this.y / this.currentAsciibirdMeta.blockHeight);
    },
    cavnasMouseDown() {
      switch (this.currentTool) {
        case "mouse":
          break;

        case "brush":
          if (
            this.currentAsciibirdMeta.blocks[this.y] &&
            this.currentAsciibirdMeta.blocks[this.y][this.x]
          )
            this.currentAsciibirdMeta.blocks[this.y][
              this.x
            ].bg = this.$store.getters.getBgColor;
          break;
      }
    },
    cavnasMouseUp() {
      this.redrawCanvas();
    },
    drawGrid() {
      const width = 5000;
      const height = 5000;

      const s = 26;
      const sW = 16;
      const pL = s;
      const pT = s;
      const pR = s;
      const pB = s;

      if (this.gridCtx) {
        this.gridCtx.clearRect(0, 0, width, height);

        this.gridCtx.strokeStyle = "lightgrey";
        this.gridCtx.lineWidth = 0.333;
        this.gridCtx.beginPath();
        for (let x = pL; x <= width - pR; x += sW) {
          this.gridCtx.moveTo(x, pT);
          this.gridCtx.lineTo(x, height - pB);
        }
        for (let y = pT; y <= height - pB; y += s) {
          this.gridCtx.moveTo(pL, y);
          this.gridCtx.lineTo(width - pR, y);
        }
        this.gridCtx.stroke();
      }
    },
  },
};
</script>
