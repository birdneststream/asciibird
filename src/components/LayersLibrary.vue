<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      @resizestop="onResize"
      :grid="[blockWidth, blockHeight]"
      :min-width="blockWidth * 30"
      :max-width="blockWidth * 50"
      :min-height="blockHeight * 10"
      :max-height="blockHeight * 100"
      :w="layersLibraryState.w"
      :h="layersLibraryState.h"
      :x="layersLibraryState.x"
      :y="layersLibraryState.y"
      ref="layerspanel"
    >
      <t-card class="h-full overflow-y-auto overflow-x-hidden">
        <Layers />
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import { blockWidth, blockHeight } from "../ascii";
import Layers from "./parts/Layers.vue";

export default {
  name: "LayersLibrary",
  components: {
    Layers,
  },
  created() {
    this.panel.x = this.layersLibraryState.x;
    this.panel.y = this.layersLibraryState.y;
    this.panel.w = this.layersLibraryState.w;
    this.panel.h = this.layersLibraryState.h;
  },
  data: () => ({
    panel: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
      visible: true,
      tab: 1,
      dragging: false,
    },
  }),
  components: {
    Layers,
  },
  props: ["yOffset"],
  computed: {
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier;
    },
    layersLibraryState() {
      return this.$store.getters.layersLibraryState;
    },
  },
  watch: {
    yOffset(val) {
      this.$refs.layerspanel.top = Number.parseInt(
        this.layersLibraryState.y + val
      );
    },
  },
  methods: {
    onResize(x, y, w, h) {
      this.panel.x = x;
      this.panel.y = y;
      this.panel.w = w;
      this.panel.h = h;
      this.$store.commit("changeLayersLibraryState", this.panel);
    },
    onDragStop(x, y) {
      this.panel.x = x;
      this.panel.y = y;

      this.$store.commit("changeLayersLibraryState", this.panel);
    },
  },
};
</script>
