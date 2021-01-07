<template>
  <div>
    <h1>
      {{ currentAsciibirdMeta.title }} ({{ currentAsciibirdMeta.width }} /
      {{ currentAsciibirdMeta.height }})
    </h1>
    <pre><small>{{ JSON.stringify(currentAsciibirdMeta) }}</small></pre>

    <div>
      <canvas
        :ref="generateCanvasId"
        :id="generateCanvasId"
        @mousedown="processMouseDown"
        @mousemove="processMouseMove"
        @mouseup="processMouseUp"
        v-bind:class="dataFieldClass"
        class="border-gray-500"
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
      this.getData();
    },
  },
  methods: {
    dataFieldClass(event) {
      this.ctx = event.currentTarget.id;
      console.log(this.ctx);
    },
    getData() {
      // Call my lovely API
      this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[
        this.$route.params.ascii.split('/').join('')
      ];

      console.log({ generateCanvasId: this.generateCanvasId, all_refs: this.$refs, current_canvas_ref: this.$refs[`canvas${this.currentAsciibirdMeta.key-1}`] })

      if (this.$refs[`canvas${this.currentAsciibirdMeta.key-1}`]) {
        console.log('got', this.$refs[`canvas${this.currentAsciibirdMeta.key-1}`]);
        this.ctx = this.$refs[`canvas${this.currentAsciibirdMeta.key-1}`].getContext("2d")
        console.log('current ctx', this.ctx)
      } else {
        console.log("Warning: could not find asciibird meta key " + `canvas${this.currentAsciibirdMeta.key-1}`)
      }
    },
    
    processMouseDown(e) {
      console.log("Mouse down")
      this.canvasClass(e)
      this.selectionMode = true;
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
    },
    // dataFieldClass() {
    //   console.log({'NIGGA': this.$refs[this.generateCanvasId]});

    //   if (!this.$refs[this.generateCanvasId]) {
    //     // First render, the element is not there yet
    //     return null;
    //   } else {
    //     // Here is the element
    //     this.ctx = this.$refs[this.generateCanvasId]
    //     console.log(this.$refs[this.generateCanvasId]);
    //   }
    // },
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
    canvasClass(e) {
      console.log("Mouse canvasClass")
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
