<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full overflow-y-auto overflow-x-hidden">
        <Layers />
      </div>
    </div>
  </div>
</template>

<script>
import { blockWidth, blockHeight } from "../ascii";
import Layers from "./parts/Layers.vue";
import { useAsciiBirdStore } from "../store";
import { useDraggable } from "@vueuse/core";
import { ref } from "vue";

export default {
  name: "LayersLibrary",
  setup() {
    const store = useAsciiBirdStore();
    const panelEl = ref(null);
    const { style: panelStyle } = useDraggable(panelEl, {
      initialValue: { x: store.layersLibraryState.x, y: store.layersLibraryState.y },
    });
    return { store, panelEl, panelStyle };
  },
  components: {
    Layers,
  },
  created() {
    this.panel.x = this.store.layersLibraryState.x;
    this.panel.y = this.store.layersLibraryState.y;
    this.panel.w = this.store.layersLibraryState.w;
    this.panel.h = this.store.layersLibraryState.h;
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
  props: ["yOffset"],
  computed: {
    blockWidth() {
      return blockWidth * this.store.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.store.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.store.blockSizeMultiplier;
    },
    layersLibraryState() {
      return this.store.layersLibraryState;
    },
  },
  watch: {
    yOffset(val) {
      this.panelEl.style.top = Number.parseInt(
        this.layersLibraryState.y + val
      ) + "px";
    },
  },
};
</script>
