<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full overflow-y-auto overflow-x-auto">
        <button
          type="button"
          :class="`ab-button w-1/2 border-gray-200 bg-gray-500 text-sm ${
            panel.tab === 0
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(0)"
        >
          <span class="material-icons relative top-2 pb-4">history</span>
          History
        </button>

        <button
          type="button"
          :class="`ab-button w-1/2 border-gray-200 bg-gray-500 text-sm ${
            panel.tab === 1
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="changeTab(1)"
        >
          <span class="material-icons relative top-2 pb-4">library_books</span>
          Library {{ libraryCount }}
        </button>

        <div class="flex">
          <div v-if="panel.tab === 0">
            <div
              v-for="(brush, key) in brushHistory"
              :key="key"
            >
              <div
                class="ab-card hover:border-blue-900 border-gray-300 bg-gray-200 mt-2"
              >
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="saveToLibrary(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">save</span>
                </button>
                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">brush</span>
                </button>

                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="removeFromHistory(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="panel.tab === 1">
            <div v-if="!brushLibrary.length">
              <p class="text-sm text-center p-5">
                Save brushes to your library to use them here.
              </p>
            </div>

            <div
              v-for="(brush, key) in brushLibrary"
              :key="key"
            >
              <div
                :class="`ab-card hover:border-blue-900 border-gray-300 bg-gray-200 mt-2`"
              >
                <small v-if="key <= 9">Ctrl+{{ key === 9 ? 0 : key + 1 }}</small>
                <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="removeFromLibrary(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">delete</span>
                </button>
                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="reuseBlocks(decompressBlock(brush.blocks))"
                >
                  <span class="material-icons">brush</span>
                </button>

                <button
                  v-if="key !== 0"
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="upBrush(key)"
                >
                  <span class="material-icons">arrow_upward</span>
                </button>

                <button
                  type="button"
                  class="ab-rounded-button ml-1 mt-1"
                  @click="downBrush(key)"
                  v-if="key !== brushLibrary.length-1"
                >
                  <span class="material-icons">arrow_downward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
import { useAsciiBirdStore } from "../store";
import { useToast } from "../composables/useToast";
import { useDraggable } from "@vueuse/core";
import { ref } from "vue";

export default {
  name: "BrushLibrary",
  setup() {
    const store = useAsciiBirdStore();
    const toastShow = useToast();
    const panelEl = ref(null);
    const { style: panelStyle } = useDraggable(panelEl, {
      initialValue: { x: store.brushLibraryState.x, y: store.brushLibraryState.y },
    });
    return { store, toastShow, panelEl, panelStyle };
  },
  created() {
    this.panel.x = this.store.brushLibraryState.x;
    this.panel.y = this.store.brushLibraryState.y;
    this.panel.w = this.store.brushLibraryState.w;
    this.panel.h = this.store.brushLibraryState.h;
    this.panel.tab = this.store.brushLibraryState.tab;

    var _this = this;
    hotkeys(`${this.hotkeyBrushes}`, async function (event) {
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
  props: { yOffset: { type: Number, default: 0 } },
  computed: {
    hotkeyBrushes() {
      let hotkeyString = "";
      for (let i = 0; i <= 9; i++) {
        hotkeyString = `${hotkeyString}ctrl+${i},`;
      }
      return hotkeyString;
    },
    blockWidth() {
      return blockWidth * this.store.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.store.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.store.blockSizeMultiplier;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    brushHistory() {
      return this.store.brushHistory;
    },
    brushLibrary() {
      return this.store.brushLibrary;
    },
    mircColours() {
      return mircColours99;
    },
    brushBlocks() {
      return this.store.brushBlocks;
    },
    brushLibraryState() {
      return this.store.brushLibraryState;
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
      return toolbarIcons[this.store.currentTool];
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
      this.panelEl.style.top = Number.parseInt(
        this.brushLibraryState.y + val
      ) + "px";
    },
  },
  methods: {
    changeTab(tab) {
      this.panel.tab = tab;
      this.store.changeBrushLibraryState(this.panel);
    },
    decompressBlock(item) {
      return JSON.parse(LZString.decompressFromUTF16(item));
    },
    reuseBlocks(value) {
      this.store.setBrushBlocks(value);
      this.store.changeTool(4);
      this.toastShow(`Applied brush from Library`, {
        type: "success",
      });
    },
    saveToLibrary(value) {
      this.store.pushBrushLibrary(value);
      this.toastShow(`Saved brush to Library`, {
        type: "success",
      });
    },
    removeFromLibrary(value) {
      this.store.removeBrushLibrary(value);
      this.toastShow(`Removed brush from Library`);
    },
    removeFromHistory(value) {
      this.store.removeBrushHistory(value);
      this.toastShow(`Removed brush from History`);
    },
    upBrush(key) {
      this.store.upBrush(key);
    },
    downBrush(key) {
      this.store.downBrush(key);
    },
  },
};
</script>
