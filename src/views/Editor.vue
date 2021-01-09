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

    <div>
      <canvas
        :ref="generateCanvasId"
        :id="generateCanvasId"
        :width=canvas.width
        :height=canvas.height
        v-bind:class="dataFieldClass"
        class="border-gray-500"
        style="border-width: 2px;"
      ></canvas>


      

      <!-- <span v-for="(yValue, y) in currentAsciibirdMeta.blocks" :key="y">
        <span v-for="(xValue, x) in currentAsciibirdMeta.blocks" :key="x">

          <Block :data="currentAsciibirdMeta.blocks[y][x]" v-if="currentAsciibirdMeta.blocks.length" :blockWidth="currentAsciibirdMeta.blockWidth"  :blockHeight="currentAsciibirdMeta.blockHeight" />

        </span>
      </span> -->
    </div>
  </div>
</template>

<style>
body {
  margin: 2rem;
  background: #eee;
}

#canvas {
  background: white;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.2);
}
</style>

<script>
import Block from '../components/Block.vue';

export default {
  name: 'Editor',
  components: { Block },
  mounted() {
    this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[0];
    

    
  },
  created() {

  },
  data: () => ({
    text: 'ASCII',
    currentAsciibirdMeta: null,
    data: {
      message: 'Hello Vue!',
      vueCanvas: null,
    },
    ctx: null,
    selectionMode: false,
    startPosition: {
      x: null,
      y: null,
    },
    canvas: {
      width: 2048 ,
      height: 2048
    },
  }),
  computed: {
    getFullPath() {
      return this.$route.path;
    },
    generateCanvasId() {
      return `canvas${this.currentAsciibirdMeta.key}`;
    },
  },
  watch: {
    getFullPath() {
      // console.log(this);
      this.onChangeTab();
    },
  },
  methods: {
    dataFieldClass(event) {
      this.ctx = event.currentTarget.id;
      console.log(this.ctx);
    },
    onChangeTab() {

      // Get the asciimeta index from the route URL
      this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[
        this.$route.params.ascii.split('/').join('')
      ];

      // I dono some routs bs or some bs needs -1 to make it all work
      let currentRefCanvas =`canvas${this.currentAsciibirdMeta.key-1}`;

      // this.canvas.width = this.currentAsciibirdMeta.blocks.length * this.currentAsciibirdMeta.blockWidth
      // this.canvas.height = this.currentAsciibirdMeta.blocks.length * this.currentAsciibirdMeta.blockHeight

      console.log({ generateCanvasId: this.generateCanvasId, all_refs: this.$refs, current_canvas_ref: this.$refs[currentRefCanvas] })

      if (this.$refs[currentRefCanvas]) {
        this.ctx = this.$refs[currentRefCanvas].getContext("2d")
        console.log('current ctx', this.ctx)

        this.redrawCanvas()
      } else {
        console.log("Warning: could not find asciibird meta key " + currentRefCanvas)
      }
    },
    redrawCanvas() {
      console.log("Canvas redraw")

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      if (this.currentAsciibirdMeta.blocks.length) {

        let blockWidth = this.currentAsciibirdMeta.blockWidth
        let blockHeight = this.currentAsciibirdMeta.blockHeight

        let h = 0;
        let w = 0;
        let x = 0;
        let y = 0;
        let blockX = 0;
        let blockY = 0;
        let curBlock = undefined;

        this.ctx.font = "8px Mono";
        
        for(y = 0; y < this.currentAsciibirdMeta.blocks.length; y++) {
          blockY = y * blockHeight
          w = blockWidth

            for(x = 0; x < this.currentAsciibirdMeta.blocks[y].length; x++) {
              // console.log({ x, y, meta: JSON.stringify(this.currentAsciibirdMeta.blocks[y][x]) });

              curBlock = this.currentAsciibirdMeta.blocks[y][x];

              blockX = x * blockWidth
              h = blockHeight

              this.ctx.fillStyle = curBlock.bg
              this.ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
              this.ctx.fillStyle = curBlock.fg
              this.ctx.fillText( curBlock.char, blockX + 2 , blockY - 3  );
            }

        }
      } else {
        console.log(JSON.stringify(this.currentAsciibirdMeta))
      }


      this.ctx.stroke()

    },
    processMouseDown(e) {
      console.log("Mouse down")
      // this.canvasClass(e)
      this.selectionMode = true;
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
    },
    processMouseMove(e) {
      console.log("Mouse move")
      if (this.selectionMode) {
        // console.log(this.startPosition);
        
        this.ctx.beginPath();
        this.ctx.rect(
          this.startPosition.x,
          this.startPosition.y,
          e.clientX - this.startPosition.x,
          e.clientY - this.startPosition.y,
        );
        this.ctx.closePath();
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.strokeStyle = '#f00';
        this.ctx.stroke();
      }
    },
    triangleTest(e) {
      console.log("Mouse triangleTest")
      // this.ctx = e.target;

      this.ctx.strokeStyle = 'red';
      this.ctx.beginPath();
      this.ctx.moveTo(100, 100);
      this.ctx.lineTo(200, 100);
      this.ctx.lineTo(200, 150);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    processMouseUp(e) {
      console.log("Mouse up")
      this.ctx.fillStyle = '#fff';

      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
    },
  },
};
</script>
