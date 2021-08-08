<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      :min-width="blockWidth * 25"
      :max-width="blockWidth * 50"
      :min-height="blockHeight * 50"
      :max-height="blockHeight * 100"
      :w="brushLibraryState.w"
      :h="brushLibraryState.h"
      :x="brushLibraryState.x"
      :y="brushLibraryState.y"
    >
      <t-card class="h-full overflow-y-scroll">
        <t-button
          type="button"
          :class="`block w-full ${
            panel.tab === 1
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(1)"
          >Library</t-button
        >

        <t-button
          type="button"
          :class="`block w-full ${
            panel.tab === 0
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(0)"
          >History</t-button
        >

        <div class="flex">
          <div v-if="panel.tab === 0">
            <div v-for="(brush, key) in brushHistory" :key="key">
              <t-card class="hover:border-blue-900 border-gray-300 bg-gray-200 mt-2">
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <t-button
                  type="button"
                  @click="saveToLibrary(decompressBlock(brush.blocks))"
                  ><font-awesome-icon
                    :icon="['fas', 'save']"
                    size="lg"
                    class="p-1 mx-1"
                /></t-button>
                <t-button
                  type="button"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                  ><font-awesome-icon
                    :icon="['fas', 'paint-brush']"
                    size="lg"
                    class="p-1 mx-1"
                /></t-button>

                <t-button
                  type="button"
                  @click="removeFromHistory(decompressBlock(brush.blocks))"
                  ><font-awesome-icon
                    :icon="['fas', 'trash']"
                    size="lg"
                    class="p-1 mx-1 right-auto"
                /></t-button>
              </t-card>
            </div>
          </div>

          <div v-if="panel.tab === 1">
            <div v-for="(brush, key) in brushLibrary" :key="key">
              <t-card
                :class="`hover:border-blue-900 border-gray-300 bg-gray-200 mt-2`"
              >
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <t-button
                  type="button"
                  @click="removeFromLibrary(decompressBlock(brush.blocks))"
                  ><font-awesome-icon
                    :icon="['fas', 'trash']"
                    size="lg"
                    class="p-1 mx-1"
                /></t-button>
                <t-button
                  type="button"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                  ><font-awesome-icon
                    :icon="['fas', 'paint-brush']"
                    size="lg"
                    class="p-1 mx-1"
                /></t-button>
              </t-card>
            </div>
          </div>
        </div>
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import { mircColours99, blockWidth, blockHeight } from "../ascii";
import BrushCanvas from "./parts/BrushCanvas.vue";
import LZString from "lz-string";

export default {
  name: "BrushLibrary",
  created() {
    this.panel.x = this.brushLibraryState.x;
    this.panel.y = this.brushLibraryState.y;
    this.panel.w = this.brushLibraryState.w;
    this.panel.h = this.brushLibraryState.h;
    this.panel.tab = this.brushLibraryState.tab;
  },
  data: () => ({
    panel: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
      visible: true,
      tab: 1,
    },
  }),
  components: {
    BrushCanvas,
  },
  computed: {
    blockWidth() {
      return blockWidth;
    },
    blockHeight() {
      return blockHeight;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    brushHistory() {
      return this.$store.getters.brushHistory.slice(0, 100);
    },
    brushLibrary() {
      return this.$store.getters.brushLibrary;
    },
    mircColours() {
      return mircColours99;
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    brushLibraryState() {
      return this.$store.getters.brushLibraryState;
    },
  },
  watch: {},
  methods: {
    changeTab(tab) {
      this.panel.tab = tab;
      this.$store.commit("changeBrushLibraryState", this.panel);
    },
    decompressBlock(item) {
      return JSON.parse(LZString.decompressFromUTF16(item));
    },
    reuseBlocks(value) {
      this.$store.commit("brushBlocks", value);
      this.$store.commit("changeTool", 4);
    },
    saveToLibrary(value) {
      this.$store.commit("pushBrushLibrary", value);
    },
    removeFromLibrary(value) {
      this.$store.commit("removeBrushLibrary", value);
    },
    removeFromHistory(value) {
      this.$store.commit("removeBrushHistory", value);
    },
    onResize(x, y, w, h) {
      this.panel.x = x;
      this.panel.y = y;
      this.panel.w = w;
      this.panel.h = h;
      this.$store.commit("changeBrushLibraryState", this.panel);
    },
    onDragStop(x, y) {
      this.panel.x = x;
      this.panel.y = y;

      this.$store.commit("changeBrushLibraryState", this.panel);
    },
  },
};
</script>
