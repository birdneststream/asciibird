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
        @mousedown="startSelect"
        @mousemove="drawRect"
        @mouseup="stopSelect"
        v-bind:class="dataFieldClass"
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
    console.log(this.$refs);
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
      return `canvas-${this.currentAsciibirdMeta.key}`;
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
    },
    startSelect(e) {
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
    drawRect(e) {
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
      this.ctx = e.target;

      this.ctx.strokeStyle = 'red';
      this.ctx.beginPath();
      this.ctx.moveTo(100, 100);
      this.ctx.lineTo(200, 100);
      this.ctx.lineTo(200, 150);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    stopSelect(e) {
      this.ctx.fillStyle = '#fff';

      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
    },
  },
};
</script>
