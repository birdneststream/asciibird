<template>
  <div>
    <h1>
      {{ currentAsciibirdMeta.title }} ({{ currentAsciibirdMeta.width }} /
      {{ currentAsciibirdMeta.height }})
    </h1>
    <!-- <pre><small>{{ JSON.stringify(currentAsciibirdMeta) }}</small></pre> -->

    <!-- @mousedown="processMouseDown"
        @mousemove="processMouseMove"
        @mouseup="processMouseUp" -->

    <div id="canvas-area" style="position: relative">
      <canvas
        ref="grid"
        id="grid"
        width="5024"
        height="5024"
        class="gridCanvas"
      ></canvas>

      <canvas
        :ref="generateCanvasId"
        :id="generateCanvasId"
        :width="canvas.width"
        :height="canvas.height"
        class="canvas"
      ></canvas>
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
import VueDraggableResizable from "vue-draggable-resizable";
import Block from "../components/Block.vue";

export default {
  name: "Editor",
  components: { Block },
  mounted() {
    this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[0];
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
  }),
  computed: {
    getFullPath() {
      return this.$route.path;
    },
    generateCanvasId() {
      return `canvas`;
    },
    watchBlocksChange() {
      return this.currentAsciibirdMeta;
    },
    generateTitle() {
      return this.currentAsciibirdMeta.title ?? "";
    },
  },
  watch: {
    getFullPath(val, old) {
      this.onChangeTab(val.split("/").join(""));
    },
    // watchBlocksChange(val, old) {
    //   if (this.$refs[this.generateCanvasId]) {
    //     this.ctx = this.$refs.canvas.getContext("2d");
    //     this.gridCtx = this.$refs.grid.getContext("2d");

    //     this.drawGrid();
    //     this.redrawCanvas();

    //     this.canvas.width = val.width * val.blockWidth;
    //     this.canvas.height = val.height * val.blockHeight;
    //   }
    // },
  },
  methods: {
    onChangeTab(val) {
      // Get the asciimeta index from the route URL
      this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[val];


      // I dono some routs bs or some bs needs -1 to make it all work
      // Some lame canvas reference bug when changing routes
      // The newest canvas is not yet available for some reason at this stage, however we can still reference the previous one
      const currentRefCanvas = "canvas";

      if (this.$refs[currentRefCanvas]) {
        this.ctx = this.$refs[currentRefCanvas].getContext("2d");
        this.gridCtx = this.$refs.grid.getContext("2d");

        this.canvas.width =
          this.currentAsciibirdMeta.width *
          this.currentAsciibirdMeta.blockWidth;
        this.canvas.height =
          this.currentAsciibirdMeta.height *
          this.currentAsciibirdMeta.blockHeight;

        this.drawGrid();
        this.redrawCanvas();

      } else {

      }
    },
    redrawCanvas() {
      // console.log("Canvas redraw");

      // Clears the whole canvas
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentAsciibirdMeta.blocks.length) {
          const blockWidth = this.currentAsciibirdMeta.blockWidth;
          const blockHeight = this.currentAsciibirdMeta.blockHeight;
          var finalWidth = 0;

          // Position of the meta array
          let x = 0;
          let y = 0;

          // Try get better loop
          let theX = 0;

          // Draws the actual rectangle
          let blockX = 0;
          let blockY = 0;
          let curBlock = {};

          this.ctx.font = "16px Mono";

          for (y = 0; y < this.currentAsciibirdMeta.blocks.length; y++) {
            blockY = this.currentAsciibirdMeta.blockHeight * y;

            for (x = 0; x < this.currentAsciibirdMeta.blocks[y].length; x++) {
              if (!this.currentAsciibirdMeta.blocks[y][x]) {
                continue;
              }

              // if (this.currentAsciibirdMeta.blocks[y][x] !== undefined) {
              // console.log({
              //   block: this.currentAsciibirdMeta.blocks[y][x],
              //   x: x,
              //   y: y,
              //   theX,
              //   blockY,
              //   blockX,
              //   blockWidth,
              //   blockHeight,
              // });

              curBlock = this.currentAsciibirdMeta.blocks[y][x];
              blockX = blockWidth * theX;

              // Background block
              this.ctx.fillStyle = curBlock.fg;
              this.ctx.fillRect(blockX, blockY, this.currentAsciibirdMeta.blockWidth, this.currentAsciibirdMeta.blockHeight);
              
              let tempChar = "";

              if (curBlock.char) {
                tempChar = curBlock.char;
                this.ctx.fillStyle = curBlock.fg;
                this.ctx.fillText(tempChar, blockX + 3, blockY -3);
              } else {
                // console.log("Yo char doesn't exist, bro.");
              }
              // }

              theX++;
              // break;
            }

            if (theX !== 0) {
              finalWidth = theX;
            }

            theX = 0;

            // break;
          }
        } else {
        }

        this.currentAsciibirdMeta.width = finalWidth;

        this.ctx.stroke();
      }
    },
    processMouseDown(e) {
      // this.canvasClass(e)
      this.selectionMode = true;
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
    },
    processMouseMove(e) {
      if (this.selectionMode) {

      }
    },
    processMouseUp(e) {
      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
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
    },
  },
};
</script>
