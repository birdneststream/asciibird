<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      @resizestop="onResize"
      :grid="[blockWidth, blockHeight]"
      :min-width="blockWidth * 35"
      :max-width="blockWidth * 50"
      :min-height="blockHeight * 15"
      :max-height="blockHeight * 100"
      :w="brushLibraryState.w"
      :h="brushLibraryState.h"
      :x="brushLibraryState.x"
      :y="brushLibraryState.y"
      ref="brushlibrarypanel"
    >
      <t-card class="h-full overflow-y-auto overflow-x-auto">
        <t-button
          type="button"
          :class="`w-1/2 border-gray-200 bg-gray-500 text-sm ${
            panel.tab === 0
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(0)"
        >
          <span class="material-icons relative top-2 pb-4">history</span>
          History
        </t-button>

        <t-button
          type="button"
          :class="`w-1/2 border-gray-200 bg-gray-500 text-sm ${
            panel.tab === 1
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(1)"
        >
          <span class="material-icons relative top-2 pb-4">library_books</span>
          Library {{ libraryCount }}
        </t-button>

        <div class="flex">
          <div v-if="panel.tab === 0">
            <div v-for="(brush, key) in brushHistory" :key="key">
              <t-card
                class="hover:border-blue-900 border-gray-300 bg-gray-200 mt-2"
              >
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="saveToLibrary(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">save</span>
                </t-button>
                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">brush</span>
                </t-button>

                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="removeFromHistory(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">delete</span>
                </t-button>
              </t-card>
            </div>
          </div>

          <div v-if="panel.tab === 1">
            <div v-if="!brushLibrary.length">
              <p class="text-sm text-center p-5">
                Save brushes to your library to use them here.
              </p>
            </div>

            <div v-for="(brush, key) in brushLibrary" :key="key">
              <t-card
                :class="`hover:border-blue-900 border-gray-300 bg-gray-200 mt-2`"
              >
                <small v-if="key <= 9"
                  >Ctrl+{{ key === 9 ? 0 : key + 1 }}</small
                >
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="removeFromLibrary(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">delete</span>
                </t-button>
                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">brush</span>
                </t-button>

                <t-button
                  v-if="key !== 0"
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="upBrush(key)"
                >
                  <span class="material-icons">arrow_upward</span>
                </t-button>

                <t-button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="downBrush(key)"
                  v-if="key !== brushLibrary.length-1"
                >
                  <span class="material-icons">arrow_downward</span>
                </t-button>
              </t-card>
            </div>
          </div>
        </div>
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<style scoped>
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

<script>
import { mircColours99, blockWidth, blockHeight, toolbarIcons } from "../ascii";
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

    var _this = this;
    hotkeys(`${this.hotkeyBrushes}`, async function (event, handler) {
      event.preventDefault();

      if (_this.isBrushing || _this.isErasing) {
        let brushSelect =
          Number.parseInt(event.key) !== 0 ? Number.parseInt(event.key) - 1 : 9;
        if (_this.brushLibrary[brushSelect]) {
          _this.reuseBlocks(
            _this.decompressBlock(_this.brushLibrary[brushSelect].blocks)
          );
        }
      }
    });
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
    BrushCanvas,
  },
  props: ["yOffset"],
  computed: {
    hotkeyBrushes() {
      let hotkeyString = "";
      for (let i = 0; i <= 9; i++) {
        hotkeyString = `${hotkeyString}ctrl+${i},`;
      }
      return hotkeyString;
    },
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    brushHistory() {
      return this.$store.getters.brushHistory;
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
    libraryCount() {
      return this.brushLibrary.length > 0
        ? `(${this.brushLibrary.length})`
        : "";
    },
    toolbarIcons() {
      return toolbarIcons;
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool];
    },
    isBrushing() {
      return this.currentTool.name === "brush";
    },
    isErasing() {
      return this.currentTool.name === "eraser";
    },
  },
  watch: {
    yOffset(val) {
      this.$refs.brushlibrarypanel.top = Number.parseInt(
        this.brushLibraryState.y + val
      );
    },
  },
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
      this.$toasted.show(`Applied brush from Library`, {
        type: "success",
      });
    },
    saveToLibrary(value) {
      this.$store.commit("pushBrushLibrary", value);
      this.$toasted.show(`Saved brush to Library`, {
        type: "success",
      });
    },
    removeFromLibrary(value) {
      this.$store.commit("removeBrushLibrary", value);
      this.$toasted.show(`Removed brush from Library`);
    },
    removeFromHistory(value) {
      this.$store.commit("removeBrushHistory", value);
      this.$toasted.show(`Removed brush from History`);
    },
    upBrush(key) {
      this.$store.commit("upBrush", key);
    },
    downBrush(key) {
      this.$store.commit("downBrush", key);
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
