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
      ref="toolbardrag"
    >
      <t-card class="h-full">
        <div class="flex mb-2">
          <Colours />
        </div>

        <div class="flex">
          <label class="ab-checkbox-hover">
            <t-checkbox
              class="form-checkbox h-5 w-5 text-blue-600"
              name="targetingFg"
              v-model="toolbarState.targetingFg"
              :disabled="!canBg && !canText"
            />
            <span class="ab-checkbox-label">FG</span>
          </label>

          <label class="ab-checkbox-hover">
            <t-checkbox
              class="ab-checkbox"
              name="targetingBg"
              v-model="toolbarState.targetingBg"
              :disabled="!canFg && !canText"
              checked
            />
            <span class="ab-checkbox-label">BG</span>
          </label>

          <label class="ab-checkbox-hover">
            <t-checkbox
              class="ab-checkbox"
              name="targetingChar"
              v-model="toolbarState.targetingChar"
              :disabled="!canFg && !canBg"
            />
            <span class="ab-checkbox-label">Text</span>
          </label>
        </div>

        <div class="flex mb-3 border-t border-black border-opacity-10 pt-2">
          <t-button
            type="button"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 ${
              mirror.x
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              mirror.x = !mirror.x;
              updateMirror();
              $toasted.show(`Mirror X ${mirror.x ? 'enabled' : 'disabled'}`);
            "
          >
            <span class="material-icons">more_vert</span>
          </t-button>

          <t-button
            type="button"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 ${
              mirror.y
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              mirror.y = !mirror.y;
              updateMirror();
              $toasted.show(`Mirror Y ${mirror.y ? 'enabled' : 'disabled'}`);
            "
          >
            <span class="material-icons">more_horiz</span>
          </t-button>

          <t-button
            type="button"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 ${
              toolbarState.updateBrush
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              $store.commit('toggleUpdateBrush', updateBrush);
              toolbarState.updateBrush = !toolbarState.updateBrush;
              $toasted.show(
                `Update Brush when colours or char changes ${
                  toolbarState.updateBrush ? 'enabled' : 'disabled'
                }`
              );
            "
          >
            <span class="material-icons">color_lens</span>
          </t-button>

          <t-button
            type="button"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 ${
              toolbarState.gridView
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              $store.commit('toggleGridView', gridView);
              toolbarState.gridView = !toolbarState.gridView;
              $toasted.show(
                `Grid view ${toolbarState.gridView ? 'enabled' : 'disabled'}`
              );
            "
          >
            <span class="material-icons">{{
              !this.gridView ? "grid_on" : "grid_off"
            }}</span>
          </t-button>
        </div>

        <div class="border-t border-black border-opacity-10 pt-2">
          <t-button
            type="button"
            v-for="(value, keyToolbar) in toolbarIcons"
            :key="keyToolbar + 50"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 ${
              currentTool.name === value.name
                ? 'border-gray-900 bg-blue-500'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="$store.commit('changeTool', keyToolbar)"
          >
            <span class="material-icons">{{ value.icon }}</span>
          </t-button>
        </div>
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
    this.toolbar.visible = this.toolbarState.visible;

    this.mirror.x = this.mirrorX;
    this.mirror.y = this.mirrorY;
  },
  name: "Toolbar",
  components: { Colours },
  props: ["yOffset"],
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
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
  },
  watch: {
    yOffset(val) {
      this.$refs.toolbardrag.top = Number.parseInt(this.toolbarState.y + val);
    },
    mirrorX(val) {
      this.mirror.x = val;
    },
    mirrorY(val) {
      this.mirror.y = val;
    },
  },
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
        visible: true,
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
        visible: true,
      });
    },
  },
};
</script>
