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
import Block from "../components/Block.vue";

export default {
  name: "Editor",
  props: ['tab','refresh'],
  components: { Block },
  mounted() {
    this.currentAsciibirdMeta = this.$store.getters.currentAscii;
    this.mircColors = this.$store.getters.mircColors;
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
  }),
  computed: {
    getCurrentTab() {
      return this.tab ?? 0;
    },
    shouldRefresh() {
      return this.refresh;
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
    watchColorChange() {
      return this.$store.getColor
    },
    watchToolChange() {
      return this.$store.getTool
    },
  },
  watch: {
    getCurrentTab(val, old) {
      this.onChangeTab( val );
    },
    shouldRefresh(val,old) {

    },
    watchColorChange(val) {
      console.log(JSON.stringify(val))        
    },
    watchToolChange(val) {
      console.log(JSON.stringify(val))          
    }
    // watchBlocksChange(val, old) {
    //   if (this.$refs[this.generate CanvasId]) {
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
    getMircColor(index) {
      return this.$store.getters.mircColors[index]
    },
    onChangeTab() {
      // Get the asciimeta index from the route URL
      this.currentAsciibirdMeta = this.$store.getters.currentAscii;


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

      //  this.drawGrid();
        // this.redrawCanvas();
    },
    redrawCanvas() {
      // console.log("Canvas redraw");

      // Clears the whole canvas
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.stroke();

        if (this.currentAsciibirdMeta.blocks.length) {
          const BLOCK_WIDTH = this.currentAsciibirdMeta.blockWidth;
          const BLOCK_HEIGHT = this.currentAsciibirdMeta.blockHeight;

          // Position of the meta array
          let x = 0;
          let y = 0;

          // Draws the actual rectangle
          let canvasX = 0;
          let canvasY = 0;

          let blockCanvasX = 0;
          let blockCanvasY = 0;

          let curBlock = {};

          this.ctx.font = "8px Mono";

          for (y = 0; y < this.currentAsciibirdMeta.height+1; y++) {
            canvasY = BLOCK_HEIGHT * y;

            for (x = 0; x < this.currentAsciibirdMeta.width+1; x++) {

              if (this.currentAsciibirdMeta.blocks[y][x]) {

                curBlock = JSON.parse(JSON.stringify(this.currentAsciibirdMeta.blocks[y][x]));
                canvasX = BLOCK_WIDTH * x;

                // Background block
                if (curBlock.bg !== null) {
                  this.ctx.fillStyle = this.mircColors[curBlock.bg];
                  this.ctx.fillRect(canvasX, canvasY, BLOCK_WIDTH, BLOCK_HEIGHT);
                } else {
                  this.ctx.fillStyle = "rgba(0, 0, 200, 0)";;
                }

                if (curBlock.char) {

                    if (curBlock.fg !== null) {
                      this.ctx.fillStyle = this.mircColors[curBlock.fg];
                    } else {
                      this.ctx.fillStyle = "#000000";
                    }

                  this.ctx.fillText(curBlock.char, canvasX, canvasY + BLOCK_HEIGHT - 3);
                  this.ctx.stroke();
                } 
              }

            }
          }
        }

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
