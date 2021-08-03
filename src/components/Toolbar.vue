<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      style="z-index: 5"
      :min-width="8 * 25"
      :max-width="8 * 30"
      :max-height="13 * 39"
      :min-height="13 * 38"
      :w="toolbarState.w"
      :h="toolbarState.h"
      :x="toolbarState.x"
      :y="toolbarState.y"
    >
      <t-card style="height: 100%">
        <label class="flex ml-1">
          <t-checkbox
            name="targetingFg"
            v-model="toolbarState.targetingFg"
            :disabled="!canBg && !canText"
          />
          <span class="text-sm">FG</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingBg"
            v-model="toolbarState.targetingBg"
            :disabled="!canFg && !canText"
            checked
          />
          <span class="text-sm">BG</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingChar"
            v-model="toolbarState.targetingChar"
            :disabled="!canFg && !canBg"
          />
          <span class="text-sm">Text</span>
        </label>

        <hr />

        <label class="flex ml-1">
          <t-checkbox
            name="targetingFg"
            v-model="mirror.x"
            @change="updateMirror()"
          />
          <span class="text-sm">Mirror X</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingBg"
            v-model="mirror.y"
            @change="updateMirror()"
          />
          <span class="text-sm">Mirror Y</span>
        </label>

        <hr />

        <Colours />

        <t-button
          type="button"
          v-for="(value, keyToolbar) in toolbarIcons"
          :key="keyToolbar + 50"
          :class="`max-h-7 max-w-5 w-7  ${
            currentTool.name === value.name
              ? 'border-gray-900'
              : 'border-gray-200'
          }`"
          @click="$store.commit('changeTool', keyToolbar)"
        >
          <font-awesome-icon :icon="[value.fa, value.icon]" />
        </t-button>

        <hr />

        <BrushPreview />
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import Colours from "./Colours.vue";
import BrushPreview from "./parts/BrushPreview.vue";
import { toolbarIcons } from "../ascii.js";

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
  components: { Colours, BrushPreview },

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
      return this.$store.getters.getChar;
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
        x: x,
        y: y,
        w: this.toolbar.w,
        h: this.toolbar.h,
      });
    },
    onDragStop(x, y) {
      this.toolbar.x = x;
      this.toolbar.y = y;

      this.$store.commit("changeToolBarState", {
        x: x,
        y: y,
        w: this.toolbar.w,
        h: this.toolbar.h,
      });
    },
  },
};
</script>
