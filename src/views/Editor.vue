<template>
  <div>
    <h1>{{ currentAsciibirdMeta.title }} ({{ currentAsciibirdMeta.width }} / {{ currentAsciibirdMeta.height }})</h1>
    <pre><small>{{ JSON.stringify(currentAsciibirdMeta) }}</small></pre>

    <div id="canvas">
      <span v-for="(yValue, y) in currentAsciibirdMeta.blocks" :key="y">
        <span v-for="(xValue, x) in currentAsciibirdMeta.blocks" :key="x">

          <Block :data="currentAsciibirdMeta.blocks[y][x]" v-if="currentAsciibirdMeta.blocks.length" />

        </span>
      </span>
    </div>

  </div>
</template>

<script>
import Block from '../components/Block.vue';

export default {
  name: 'Editor',
  components: { Block },
  created() {
    this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[0];
  },
  data: () => ({
    text: 'ASCII',
    currentAsciibirdMeta: null,
  }),
  computed: {
    getFullPath() {
      return this.$route.path;
    },
  },
  watch: {
    getFullPath() {
      console.log(this);
      this.getData();
    },
  },
  methods: {
    getData() {
      // Call my lovely API
      this.currentAsciibirdMeta = this.$store.state.asciibirdMeta[this.$route.params.ascii.split('/').join('')];
    },
  },
};
</script>
