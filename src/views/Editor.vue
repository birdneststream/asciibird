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
  components: { Block },
  mounted() {
    this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[0];
  },
  created() {},
  data: () => ({
    text: "ASCII",
    currentAsciibirdMeta: null,
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
  },
  watch: {
    getFullPath(val, old) {
      this.onChangeTab(val.split("/%2F").join(""));
    },
  },
  methods: {
    // dataFieldClass(event) {
    //   this.ctx = event.currentTarget.id;
    //   console.log(this.ctx);
    // },
    onChangeTab(val) {
      // Get the asciimeta index from the route URL
      this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[val];

      console.log(this.currentAsciibirdMeta);

      // I dono some routs bs or some bs needs -1 to make it all work
      // Some lame canvas reference bug when changing routes
      // The newest canvas is not yet available for some reason at this stage, however we can still reference the previous one
      let currentRefCanvas = `canvas`;

      this.canvas.width = this.currentAsciibirdMeta.blocks.length * this.currentAsciibirdMeta.blockWidth
      this.canvas.height = this.currentAsciibirdMeta.blocks.length * this.currentAsciibirdMeta.blockHeight

      console.log({
        generateCanvasId: this.generateCanvasId,
        all_refs: this.$refs,
        current_canvas_ref: this.$refs[currentRefCanvas],
      });

      if (this.$refs[currentRefCanvas]) {
        this.ctx = this.$refs[currentRefCanvas].getContext("2d");
        this.gridCtx = this.$refs["grid"].getContext("2d");
        console.log("current ctx", this.ctx);

        this.drawGrid();
        this.redrawCanvas();

        this.canvas.width =
          this.currentAsciibirdMeta.width *
          this.currentAsciibirdMeta.blockWidth;
        this.canvas.height =
          this.currentAsciibirdMeta.height *
          this.currentAsciibirdMeta.blockHeight;
      } else {
        console.log(
          "Warning: could not find asciibird meta key " + currentRefCanvas
        );
      }
    },
    redrawCanvas() {
      console.log("Canvas redraw");

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.currentAsciibirdMeta.blocks.length) {
        let blockWidth = this.currentAsciibirdMeta.blockWidth;
        let blockHeight = this.currentAsciibirdMeta.blockHeight;

        let h = 0;
        let w = 0;
        let x = 0;
        let y = 0;
        let blockX = 0;
        let blockY = 0;
        let curBlock = undefined;

        this.ctx.font = "8px Mono";

        for (y = 0; y < this.currentAsciibirdMeta.blocks.length; y++) {
          blockY = y * blockHeight;
          w = blockWidth;

          for (x = 0; x < this.currentAsciibirdMeta.blocks[y].length; x++) {
            // console.log({ x, y, meta: JSON.stringify(this.currentAsciibirdMeta.blocks[y][x]) });

            curBlock = this.currentAsciibirdMeta.blocks[y][x];

            blockX = x * blockWidth;
            h = blockHeight;

            this.ctx.fillStyle = curBlock.bg;
            this.ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
            this.ctx.fillStyle = curBlock.fg;
            this.ctx.fillText(curBlock.char, blockX + 2, blockY - 3);
          }
        }
      } else {
        console.log(JSON.stringify(this.currentAsciibirdMeta));
      }

      this.ctx.stroke();
    },
    processMouseDown(e) {
      console.log("Mouse down");
      // this.canvasClass(e)
      this.selectionMode = true;
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
    },
    processMouseMove(e) {
      console.log("Mouse move");
      if (this.selectionMode) {
        // console.log(this.startPosition);

        this.ctx.beginPath();
        this.ctx.rect(
          this.startPosition.x,
          this.startPosition.y,
          e.clientX - this.startPosition.x,
          e.clientY - this.startPosition.y
        );
        this.ctx.closePath();
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.strokeStyle = "#f00";
        this.ctx.stroke();
      }
    },
    triangleTest(e) {
      console.log("Mouse triangleTest");
      // this.ctx = e.target;

      this.ctx.strokeStyle = "red";
      this.ctx.beginPath();
      this.ctx.moveTo(100, 100);
      this.ctx.lineTo(200, 100);
      this.ctx.lineTo(200, 150);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    processMouseUp(e) {
      console.log("Mouse up");
      this.ctx.fillStyle = "#fff";

      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
    },
    drawGrid() {
      let width = 5000;
      let height = 5000;

      let s = 13;
      let sW = 8;
      let pL = s;
      let pT = s;
      let pR = s;
      let pB = s;

      this.gridCtx.clearRect(0, 0, width, height);

      this.gridCtx.strokeStyle = "lightgrey";
      this.gridCtx.lineWidth = 0.333;
      this.gridCtx.beginPath();
      for (var x = pL; x <= width - pR; x += sW) {
        this.gridCtx.moveTo(x, pT);
        this.gridCtx.lineTo(x, height - pB);
      }
      for (var y = pT; y <= height - pB; y += s) {
        this.gridCtx.moveTo(pL, y);
        this.gridCtx.lineTo(width - pR, y);
      }
      this.gridCtx.stroke();
    },
  },
};
</script>
