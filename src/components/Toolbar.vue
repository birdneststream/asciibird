<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="h-full ab-card">
        <div class="flex mb-2">
          <Colours />
        </div>

        <div class="flex">
          <label class="ab-checkbox-hover group">
            <input
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600"
              name="targetingFg"
              v-model="toolbarState.targetingFg"
              :disabled="!canBg && !canText"
            >
            <div class="inline-block relative">
              <span class="ab-checkbox-label">FG</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                Ignore Foreground when Editing
              </div>
            </div>
          </label>

          <label class="ab-checkbox-hover group">
            <input
              type="checkbox"
              class="ab-checkbox"
              name="targetingBg"
              v-model="toolbarState.targetingBg"
              :disabled="!canFg && !canText"
            >
            <div class="inline-block relative">
              <span class="ab-checkbox-label">BG</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                Ignore Background when Editing
              </div>
            </div>
          </label>

          <label class="ab-checkbox-hover group">
            <input
              type="checkbox"
              class="ab-checkbox"
              name="targetingChar"
              v-model="toolbarState.targetingChar"
              :disabled="!canFg && !canBg"
            >
            <div class="inline-block relative">
              <span class="ab-checkbox-label">Text</span>
              <span
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >Ignore Characters when Editing</span>
            </div>
          </label>
        </div>

        <div class="flex mb-3 border-t border-black border-opacity-10 pt-2">
          <button
            type="button"
            :class="`ab-toolbar-button group ${
              mirror.x
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              mirror.x = !mirror.x;
              updateMirror();
              toastShow(`Mirror X ${mirror.x ? 'enabled' : 'disabled'}`);
            "
          >
            <div class="inline-block relative">
              <span class="material-icons">more_vert</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                Mirror X axis when Editing
              </div>
            </div>
          </button>

          <button
            type="button"
            :class="`ab-toolbar-button group ${
              mirror.y
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              mirror.y = !mirror.y;
              updateMirror();
              toastShow(`Mirror Y ${mirror.y ? 'enabled' : 'disabled'}`);
            "
          >
            <div class="inline-block relative">
              <span class="material-icons">more_horiz</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                Mirror Y axis when Editing
              </div>
            </div>
          </button>

          <button
            type="button"
            :class="`ab-toolbar-button group ${
              toolbarState.updateBrush
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              store.toggleUpdateBrush(updateBrush);
              toolbarState.updateBrush = !toolbarState.updateBrush;
              toastShow(
                `Update Brush when colours or char changes ${
                  toolbarState.updateBrush ? 'enabled' : 'disabled'
                }`
              );
            "
          >
            <div class="inline-block relative">
              <span class="material-icons">color_lens</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                Update Brush Automatically when Colours or Char Changes
              </div>
            </div>
          </button>

          <button
            type="button"
            :class="`ab-toolbar-button group ${
              toolbarState.gridView
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              store.toggleGridView(gridView);
              toolbarState.gridView = !toolbarState.gridView;
              toastShow(
                `Grid view ${toolbarState.gridView ? 'enabled' : 'disabled'}`
              );
            "
          >
            <div class="inline-block relative">
              <span class="material-icons">{{
                !gridView ? "grid_on" : "grid_off"
              }}</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                <span class="material-icons">{{
                  !gridView ? "grid_on" : "grid_off"
                }}</span>
                Toggle Grid View
              </div>
            </div>
          </button>

          <button
            type="button"
            :class="`ab-toolbar-button group ${
              toolbarState.halfBlockEditing
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="
              toolbarState.halfBlockEditing = !toolbarState.halfBlockEditing;
              store.toggleHalfBlockEditing(toolbarState.halfBlockEditing);
              toastShow(
                `Half Block Editing Mode ${toolbarState.halfBlockEditing ? 'enabled' : 'disabled'}`
              );
              toastShow(
                `WARNING THIS FEATURE IS STILL EXPERIMENTAL`
              );
            "
          >
            <div class="inline-block relative">
              <span class="material-icons">{{
                "grid_view"
              }}</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                <span class="material-icons">{{
                  "grid_view"
                }}</span>
                Toggle Half Block Editing Mode
              </div>
            </div>
          </button>
        </div>

        <div class="border-t border-black border-opacity-10 pt-2">
          <button
            type="button"
            v-for="(value, keyToolbar) in toolbarIcons"
            :key="keyToolbar + 50"
            :class="`rounded-3xl w-10 h-10 mt-1 ml-1 transition-all group ${
              currentTool.name === value.name
                ? 'border-gray-900 bg-blue-500'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="store.changeTool(keyToolbar)"
          >
            <div class="inline-block relative">
              <span class="material-icons">{{ value.icon }}</span>
              <div
                class="
                  bg-gray-500
                  absolute
                  opacity-0
                  invisible
                  group-hover:animate-tooltip_show
                  ml-2
                "
              >
                <span class="material-icons">{{ value.icon }}</span>
                {{ tooltipName(value) }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useDraggable } from '@vueuse/core';
import { useAsciiBirdStore } from '../store';
import { useToast } from '../composables/useToast';
import Colours from "./Colours.vue";
import { toolbarIcons, blockWidth, blockHeight } from "../ascii";

export default {
  setup() {
    const store = useAsciiBirdStore();
    const { show: toastShow } = useToast();

    const panelEl = ref(null);
    const { style: panelStyle } = useDraggable(panelEl, {
      initialValue: { x: store.toolbarState.x, y: store.toolbarState.y },
    });

    return { store, toastShow, panelEl, panelStyle };
  },
  name: "Toolbar",
  components: { Colours },
  props: { yOffset: { type: Number, default: 0 } },
  data: () => ({
    mirror: {
      x: false,
      y: false,
    },
  }),
  created() {
    this.mirror.x = this.mirrorX;
    this.mirror.y = this.mirrorY;
  },
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
      return this.store.blockSizeMultiplier;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    currentTool() {
      return toolbarIcons[this.store.currentTool];
    },
    canFg() {
      return this.store.isTargettingFg;
    },
    canBg() {
      return this.store.isTargettingBg;
    },
    canText() {
      return this.store.isTargettingChar;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    currentChar() {
      return this.store.currentChar;
    },
    draggable() {
      return this.toolbarState.draggable;
    },
    gridView() {
      return this.toolbarState.gridView;
    },
    halfBlockEditing() {
      return this.toolbarState.halfBlockEditing;
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
    yOffset() {
      // yOffset handling managed by useDraggable positioning
    },
    mirrorX(val) {
      this.mirror.x = val;
    },
    mirrorY(val) {
      this.mirror.y = val;
    },
  },
  methods: {
    tooltipName(value) {
      switch (value.name) {
        case "default":
          return "Default Mode";
        case "select":
          return "Select Blocks";
        case "text":
          return "Text Editing";
        case "fill":
          return "Fill Blocks";
        case "brush":
          return "Brush Blocks";
        case "dropper":
          return "Block Picker";
        case "eraser":
          return "Eraser Blocks";
        case "fill-eraser":
          return "Fill Eraser Blocks";
      }
    },
    updateMirror() {
      this.store.updateMirror(this.mirror);
    },
    onDragStop(x, y) {
      this.store.changeToolBarState({
        x,
        y,
        w: this.toolbarState.w,
        h: this.toolbarState.h,
        visible: true,
      });
    },
  },
};
</script>
