<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      style="z-index: 5;"
      :min-width="200"
      :max-width="500"
      :min-height="200"
      :max-height="500"
      :x="$store.getters.getDebugPanelState.x"
      :y="$store.getters.getDebugPanelState.y"
    >
      
        <t-card style="height: 100%;">
          <p v-html="`Tool: ${$store.getters.getCurrentTool}`"></p>
          <p v-html="`FgColour: ${$store.getters.getFgColour}`"></p>
          <p v-html="`BgColor: ${$store.getters.getBgColour}`"></p>
          <p v-html="`Char: ${$store.getters.getToolbarState.selectedChar}`"></p>

          <p v-html="`canvasX: ${canvasX}`"></p>
          <p v-html="`canvasY: ${canvasY}`"></p>
        </t-card>
      
    </vue-draggable-resizable>
  </div>
</template>
<script>
export default {
  created() {},
  name: "DebugPanel",
  props: ["canvasX", "canvasY"],
  data: () => ({
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
    throttle: true,
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
    onDragStop(x, y) {
      this.floating.x = x;
      this.floating.y = y;

      this.$store.commit("changeDebugPanelState", {x: x, y: y})
    },
  },
};
</script>
