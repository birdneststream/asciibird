<template>
  <div>
    <div id="canvas-area">
      <vue-draggable-resizable
        style="z-index: 5; left: 220px"
        :grid="[currentAsciibirdMeta.blockHeight, currentAsciibirdMeta.blockWidth]"
        :w="canvas.width + (currentAsciibirdMeta.blockWidth/2)"
        :h="canvas.height + (currentAsciibirdMeta.blockHeight/2)"
        :draggable="currentTool === 'default'"
        @resizing="onCanvasResize"
        @dragging="onCanvasDrag"
      >
        <canvas
          ref="canvas"
          id="canvas"
          class="canvas"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
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
    this.toolbarState = this.$store.getters.getToolbarState;

    if (this.currentAsciibirdMeta.blocks) {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.canvas.width =
        this.currentAsciibirdMeta.width * this.currentAsciibirdMeta.blockWidth;
      this.canvas.height =
        this.currentAsciibirdMeta.height *
        this.currentAsciibirdMeta.blockHeight;
      this.delayRedrawCanvas();
      this.$store.commit("changeTool", "default");
      this.currentTool = "default";
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
    mircColors: null,
    ctx: null,
    canvas: {
      width: 512,
      height: 512,
    },
    x: 0,
    y: 0,
    refreshCanvas: 0,
    currentTool: null,
    redraw: true,

    toolbarState: {
      targetingFg: false,
      targetingBg: false,
      targetingText: false,
    },

    canTool: false,
  }),
  computed: {
    canvasStyle() {
      return `width:${this.canvas.width};height:${this.canvas.height};`;
    },
    generateTitle() {
      return this.currentAsciibirdMeta.title ?? "";
    },
    watchToolChange() {
      return this.$store.getters.getCurrentTool;
    },
    watchAsciiChange() {
      return this.$store.getters.currentAscii;
    },
    watchTargetingFg() {
      return this.$store.getters.getTargetingFg;
    },
    watchTargetingBg() {
      return this.$store.getters.getTargetingBg;
    },
    watchTargetingText() {
      return this.$store.getters.getTargetingText;
    },
  },
  watch: {
    watchAsciiChange(val, old) {
      this.currentAsciibirdMeta = val;
      this.canvas.width =
        this.currentAsciibirdMeta.width * this.currentAsciibirdMeta.blockWidth;
      this.canvas.height =
        this.currentAsciibirdMeta.height *
        this.currentAsciibirdMeta.blockHeight;
      this.delayRedrawCanvas();

      window.title = this.currentAsciibirdMeta.name
    },
    watchToolChange(val) {
      this.currentTool = val;
    },
    watchTargetingFg(val) {
      this.toolbarState.targetingFg = val;
    },
    watchTargetingBg(val) {
      this.toolbarState.targetingBg = val;
    },
    watchTargetingText(val) {
      this.toolbarState.targetingText = val;
    },
  },
  methods: {
    getMircColor(index) {
      return this.$store.getters.mircColors[index];
    },
    redrawCanvas() {
      // Clears the whole canvas
      this.ctx.clearRect(0, 0, 10000, 10000);

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

        this.ctx.font = "12.5px Hack";

        for (y = 0; y < this.currentAsciibirdMeta.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.currentAsciibirdMeta.width + 1; x++) {
            if (
              this.currentAsciibirdMeta.blocks[y] &&
              this.currentAsciibirdMeta.blocks[y][x]
            ) {
              // curBlock = JSON.parse(
              //   JSON.stringify(this.currentAsciibirdMeta.blocks[y][x])
              // );

              curBlock = Object.assign(curBlock,this.currentAsciibirdMeta.blocks[y][x])

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
                  canvasX - 1,
                  canvasY + BLOCK_HEIGHT - 3
                );
              }
            }
          }
        }
      }

      this.ctx.stroke();
    },
    onCanvasResize(left, top, width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.delayRedrawCanvas();
    },
    onCanvasDrag(left, top) {
      // Update left and top in panel
      
    },

    // Mouse Up, Down and Move
    canvasMouseUp() {
      this.delayRedrawCanvas();

      switch (this.currentTool) {
        case "brush":
          this.canTool = false;
          break;

        case "eraser":
          this.canTool = false;
          break;

        case "fill":
          this.canTool = false;

          break;

      }

    },
    canvasMouseDown() {
      switch (this.currentTool) {
        case "default":
          break;

        case "fill":
          // this.canTool = true;
          if (
            this.currentAsciibirdMeta.blocks[this.y] && 
            this.currentAsciibirdMeta.blocks[this.y][this.x]
          ) {
            this.fillTool()
          }
          break;

        case "brush":
          this.canTool = true;
          break;

        case "eraser":
          this.canTool = true;
          break;

        case "dropper":
          if (
            this.currentAsciibirdMeta.blocks[this.y] && 
            this.currentAsciibirdMeta.blocks[this.y][this.x]
          ) {
              let curBlock = this.currentAsciibirdMeta.blocks[this.y][this.x];

              if (this.toolbarState.targetingFg) {
                this.$store.commit("changeColorFg", curBlock.fg);
              }

              if (this.toolbarState.targetingBg) {
                this.$store.commit("changeColorBg", curBlock.bg);
              }

              // if (this.toolbarState.targetingText) {

              // }
          }

          this.currentTool = "default";
          this.$store.commit("changeTool", this.currentTool);
          break;
      }



    },
    canvasMouseMove(e) {

      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / this.currentAsciibirdMeta.blockWidth);
      this.y = Math.floor(this.y / this.currentAsciibirdMeta.blockHeight);

      switch (this.currentTool) {
        case "brush":
          if (this.canTool) {
            if (
              this.currentAsciibirdMeta.blocks[this.y] &&
              this.currentAsciibirdMeta.blocks[this.y][this.x]
            ) {


              if (this.toolbarState.targetingFg) {
                this.currentAsciibirdMeta.blocks[this.y][
                  this.x
                ].fg = this.$store.getters.getFgColor;
              }

              if (this.toolbarState.targetingBg) {
                this.currentAsciibirdMeta.blocks[this.y][
                  this.x
                ].bg = this.$store.getters.getBgColor;
              }

              // if (this.toolbarState.targetingText) {
              //   this.currentAsciibirdMeta.blocks[this.y][this.x].char = null;
              // }
            }

           
          }
          break;

        case "eraser":
          if (this.canTool) {
            if (
              this.currentAsciibirdMeta.blocks[this.y] &&
              this.currentAsciibirdMeta.blocks[this.y][this.x]
            ) {

              if (this.toolbarState.targetingFg) {
                this.currentAsciibirdMeta.blocks[this.y][this.x].fg = null;
              }

              if (this.toolbarState.targetingBg) {
                this.currentAsciibirdMeta.blocks[this.y][this.x].bg = null;
              }

              if (this.toolbarState.targetingText) {
                this.currentAsciibirdMeta.blocks[this.y][this.x].char = null;
              }

            }
              
          }
          break;
      }

      this.delayRedrawCanvas()
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;
        
        setTimeout(() => {
          this.redraw = true
          this.redrawCanvas();
        }, 8);
      }
    },
    fillTool() {
      let fillStartBlock = this.currentAsciibirdMeta.blocks[this.y][this.x];
  
      if (this.toolbarState.targetingBg) {
        let fillSameBg = fillStartBlock.bg
      }

      console.log(fillStartBlock)
    },




  },
};
</script>
