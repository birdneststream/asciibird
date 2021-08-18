<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[blockWidth, blockHeight]"
      :min-width="blockWidth * 25"
      :max-width="blockWidth * 40"
      :max-height="blockHeight * 20"
      :min-height="blockHeight * 19"
      :w="toolbarState.w"
      :h="toolbarState.h"
      :x="toolbarState.x"
      :y="toolbarState.y"
      :draggable="draggable"
    >
      <t-card class="h-full">
        <div class="flex mb-2">
          <Colours />
        </div>

        <div class="flex">
          <label class="ml-1 w-1/3">
            <t-checkbox
              class="form-checkbox m-1"
              name="targetingFg"
              v-model="toolbarState.targetingFg"
              :disabled="!canBg && !canText"
            />
            <span class="text-sm">FG</span>
          </label>

          <label class="ml-1 w-1/3">
            <t-checkbox
              class="form-checkbox m-1"
              name="targetingBg"
              v-model="toolbarState.targetingBg"
              :disabled="!canFg && !canText"
              checked
            />
            <span class="text-sm">BG</span>
          </label>

          <label class="ml-1 w-1/3">
            <t-checkbox
              class="form-checkbox m-1"
              name="targetingChar"
              v-model="toolbarState.targetingChar"
              :disabled="!canFg && !canBg"
            />
            <span class="text-sm">Text</span>
          </label>
        </div>

        <div class="flex">
          <label class="ml-1 w-1/2">
            <t-checkbox
              class="form-checkbox m-1"
              name="mirror-x"
              v-model="mirror.x"
              @change="updateMirror()"
            />
            <span class="text-sm">Mirror X</span>
          </label>
          <label class="ml-1 w-1/2">
            <t-checkbox
              class="form-checkbox m-1"
              name="mirror-y"
              v-model="mirror.y"
              @change="updateMirror()"
            />
            <span class="text-sm">Mirror Y</span>
          </label>
        </div>

        <div class="flex">
          <label class="ml-1 w-1/2">
            <t-checkbox
              class="form-checkbox m-1"
              name="update-brush"
              v-model="toolbarState.updateBrush"
              @change="$store.commit('toggleUpdateBrush', updateBrush)"
            />
            <span class="text-sm">Update Brush</span>
          </label>
          <label class="ml-1 w-1/2">
            <t-checkbox
              class="form-checkbox m-1"
              name="grid"
              v-model="toolbarState.gridView"
              @change="$store.commit('toggleGridView', gridView)"
            />
            <span class="text-sm">Grid</span>
          </label>
        </div>

        <hr class="m-3">

        <t-button
          type="button"
          v-for="(value, keyToolbar) in toolbarIcons"
          :key="keyToolbar + 50"
          :class="`w-10 h-10 mt-1 ml-1 ${
            currentTool.name === value.name
              ? 'border-gray-900 bg-blue-500'
              : 'border-gray-200 bg-gray-500'
          }`"
          @click="$store.commit('changeTool', keyToolbar)"
        >
          <font-awesome-icon
            :icon="[value.fa, value.icon]"
            size="lg"
          />
        </t-button>
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import Colours from "./Colours.vue";
import { toolbarIcons, blockWidth, blockHeight } from "../ascii";

export default {
  created() {
    this.toolbar.x = this.toolbarState.x;
    this.toolbar.y = this.toolbarState.y;
    this.toolbar.w = this.toolbarState.w;
    this.toolbar.h = this.toolbarState.h;

    this.mirror.x = this.toolbarState.mirrorX;
    this.mirror.y = this.toolbarState.mirrorY;
  },
  name: "Toolbar",
  components: { Colours },

  data: () => ({
    toolbar: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
    },
    mirror: {
      x: false,
      y: false,
    },
  }),
  computed: {
    toolbarIcons() {
      return toolbarIcons;
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
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool];
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
      return this.$store.getters.currentChar;
    },
    draggable() {
      return this.toolbarState.draggable;
    },
    gridView() {
      return this.toolbarState.gridView;
    },
    updateBrush() {
      return this.toolbarState.updateBrush;
    },
  },
  watch: {},
  methods: {
    updateMirror() {
      this.$store.commit("updateMirror", this.mirror);
    },
    onResize(x, y, w, h) {
      this.toolbar.x = x;
      this.toolbar.y = y;
      this.toolbar.w = w;
      this.toolbar.h = h;

      this.$store.commit("changeToolBarState", {
        x,
        y,
        w: this.toolbar.w,
        h: this.toolbar.h,
      });
    },
    onDragStop(x, y) {
      this.toolbar.x = x;
      this.toolbar.y = y;

      this.$store.commit("changeToolBarState", {
        x,
        y,
        w: this.toolbar.w,
        h: this.toolbar.h,
      });
    },
  },
};
</script>
