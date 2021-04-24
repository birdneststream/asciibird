<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      :min-width="8 * 100"
      :max-width="8 * 150"
      :min-height="13 * 4"
      :max-height="13 * 4"
      style="z-index: 5;"
      :w="debugPanelState.w"
      :h="debugPanelState.h"
      :x="debugPanelState.x"
      :y="debugPanelState.y"
    >
      
        <t-card style="height: 100%;">
          <span class="ml-5" v-html="`Tool: ${getToolName}`"></span>
          <span class="ml-5" v-html="`FgColour: ${$store.getters.getFgColour}`"></span>
          <span class="ml-5" v-html="`BgColor: ${$store.getters.getBgColour}`"></span>
          <span class="ml-5" v-html="`Char: ${$store.getters.getToolbarState.selectedChar}`"></span>

          <span class="ml-5" v-html="`canvasX: ${canvasX}`"></span>
          <span class="ml-5" v-html="`canvasY: ${canvasY}`"></span>
        </t-card>
      
    </vue-draggable-resizable>
  </div>
</template>
<script>

export default {
  created() {
    this.panel.x = this.debugPanelState.x
    this.panel.y = this.debugPanelState.y
    this.panel.w = this.debugPanelState.w
    this.panel.h = this.debugPanelState.h
  },
  name: "DebugPanel",
  props: ["canvasX", "canvasY"],
  data: () => ({
    panel: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
    },
    throttle: true,
  }),
  computed: {
    getToolName() {
      return this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool] ? this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool].name : 'none'
    },
    debugPanelState() {
      return this.$store.getters.getDebugPanelState
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
  },
  watch: {},
  methods: {
    onResize(x, y, w, h) {
      this.panel.x = x;
      this.panel.y = y;
      this.panel.w = w;
      this.panel.h = h;

      this.$store.commit("changeDebugPanelState", this.panel)
    },
    onDragStop(x, y) {
      this.panel.x = x;
      this.panel.y = y;

      this.$store.commit("changeDebugPanelState", this.panel)
    },
  },
};
</script>
