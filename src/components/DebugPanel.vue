<template>
  <div>
    <vue-draggable-resizable
      @dragging="onDrag"
      style="z-index: 5; min-height: 300px"
      :min-width="200"
      :max-width="500"
      :min-height="100"
      :max-height="200"
      :x="0"
      :y="350"
    >
      <div style="height: 100%; min-height: 300px; max-height: 400px">
        <t-card header="Debug Info" style="height: 100%">
          <p v-html="$store.getters.getCurrentTool"></p>
          <p v-html="$store.getters.getFgColor"></p>
          <p v-html="$store.getters.getBgColor"></p>
        </t-card>
      </div>
    </vue-draggable-resizable>
  </div>
</template>
<script>
export default {
  created() {},
  name: "DebugPanel",
  data: () => ({
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
  }),
  computed: {},
  watch: {},
  methods: {
    onResize(x, y, width, height) {
      this.floating.x = x;
      this.floating.y = y;
      this.floating.width = width;
      this.floating.height = height;
    },
    onDrag(x, y) {
      this.floating.x = x;
      this.floating.y = y;
    },
  },
};
</script>
