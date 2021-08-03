<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      :min-width="8 * 40"
      :max-width="8 * 40"
      :min-height="13 * 20"
      :max-height="13 * 20"
      style="z-index: 5;"
      :w="debugPanelState.w"
      :h="debugPanelState.h"
      :x="debugPanelState.x"
      :y="debugPanelState.y"
    >
      
        <t-card style="height: 100%;">
          <span class="ml-5" v-html="`Tool: ${getToolName}`"></span> <br>
          <span class="ml-5" v-html="`FgColour: ${currentFg}`"></span> <br>
          <span class="ml-5" v-html="`BgColor: ${currentBg}`"></span> <br>
          <span class="ml-5" v-html="`Char: ${currentChar}`"></span> <br>

          <span class="ml-5" v-html="`canvasX: ${canvasX}`"></span> <br>
          <span class="ml-5" v-html="`canvasY: ${canvasY}`"></span> <br>

          <span class="ml-5" v-html="`mirrorX: ${mirrorX}`"></span> <br>
          <span class="ml-5" v-html="`mirrorY: ${mirrorY}`"></span> <br>

          <span class="ml-5"> Size: {{ asciiStats.sizeCompressed }} ({{ asciiStats.sizeUncompressed }} / {{ asciiStats.sizePercentage }}%) </span> <br>

          <span class="ml-5"> State Size: {{ asciiStats.stateSize }}</span> <br>
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
      visible: true,
    },
    throttle: true,
  }),
  computed: {
    getToolName() {
      return this.$store.getters.toolbarIcons[this.$store.getters.currentTool] ? this.$store.getters.toolbarIcons[this.$store.getters.currentTool].name : 'none'
    },
    debugPanelState() {
      return this.$store.getters.debugPanel
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiBlocks() {
        return this.$store.getters.currentAsciiBlocks
    },
    asciiStats() {
        let compressed = (this.currentAscii.blocks.length / 1024).toFixed(2);
        let uncompressed = ( JSON.stringify(this.currentAsciiBlocks).length / 1024).toFixed(2)

        let stateSize = ( JSON.stringify(this.state).length / 1024).toFixed(2);
        return {
            sizeCompressed: compressed + 'kb',
            sizeUncompressed: uncompressed + 'kb',
            stateSize: stateSize + 'kb',
            sizePercentage: (100 - (uncompressed / compressed)).toFixed(2),
        }
    },
    currentTool() {
      return this.$store.getters.toolbarIcons[
        this.$store.getters.currentTool
      ];
    },
    mircColours() {
      return this.$store.getters.mircColours;
    },
    canFg() {
      return this.$store.getters.isTargettingFg;
    },
    canBg() {
      return this.$store.getters.isTargettingBg;
    },
    canText() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    currentChar() {
      return this.$store.getters.getChar;
    },
    isTextEditing() {
      return this.currentTool.name === "text"
    },
    isSelecting() {
      return this.currentTool.name === "select"
    },
    isSelected() {
      return (
        this.selecting.startX &&
        this.selecting.startY &&
        this.selecting.endX &&
        this.selecting.endY
      );
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    // canvasX() {
    //   return this.x * this.currentAscii.blockWidth;
    // },
    // canvasY() {
    //   return this.y * this.currentAscii.blockHeight;
    // },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    state() {
      return this.$store.getters.state;
    }
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
