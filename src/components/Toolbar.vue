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
              v-model="store.toolbarState.targetingFg"
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600"
              name="targetingFg"
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
              v-model="store.toolbarState.targetingBg"
              type="checkbox"
              class="ab-checkbox"
              name="targetingBg"
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
              v-model="store.toolbarState.targetingChar"
              type="checkbox"
              class="ab-checkbox"
              name="targetingChar"
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
              store.toolbarState.mirrorX
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="toggleMirrorX()"
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
              store.toolbarState.mirrorY
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="toggleMirrorY()"
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
              store.toolbarState.updateBrush
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="toggleUpdateBrush()"
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
              store.toolbarState.gridView
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="toggleGridView()"
          >
            <div class="inline-block relative">
              <span class="material-icons">{{
                !store.toolbarState.gridView ? "grid_on" : "grid_off"
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
                  !store.toolbarState.gridView ? "grid_on" : "grid_off"
                }}</span>
                Toggle Grid View
              </div>
            </div>
          </button>

          <button
            type="button"
            :class="`ab-toolbar-button group ${
              store.toolbarState.halfBlockEditing
                ? 'border-gray-900 bg-blue-800'
                : 'border-gray-200 bg-gray-500'
            }`"
            @click="toggleHalfBlockEditing()"
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
            v-for="(value, keyToolbar) in toolbarIcons"
            :key="keyToolbar + 50"
            type="button"
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDraggable } from '@vueuse/core';
import { useAsciiBirdStore } from '../store';
import { useToast } from '../composables/useToast';
import Colours from "./Colours.vue";
import { toolbarIcons } from "../ascii";
import { tooltipName } from '../utils/toolbar';

defineOptions({ name: 'Toolbar' });

const store = useAsciiBirdStore();
const { show: toastShow } = useToast();

const panelEl = ref<HTMLElement | null>(null);
const { style: panelStyle, x: dragX, y: dragY } = useDraggable(panelEl, {
  initialValue: { x: store.toolbarState.x, y: store.toolbarState.y },
});

// Sync drag position back to store
watch([dragX, dragY], ([newX, newY]) => {
  store.changeToolBarState({
    x: newX,
    y: newY,
    w: store.toolbarState.w,
    h: store.toolbarState.h,
    visible: true,
  });
});

const currentTool = computed(() => toolbarIcons[store.currentTool]);
const canFg = computed(() => store.isTargettingFg);
const canBg = computed(() => store.isTargettingBg);
const canText = computed(() => store.isTargettingChar);

function toggleMirrorX() {
  const newVal = !store.toolbarState.mirrorX;
  store.updateMirror({ x: newVal, y: store.toolbarState.mirrorY });
  toastShow(`Mirror X ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleMirrorY() {
  const newVal = !store.toolbarState.mirrorY;
  store.updateMirror({ x: store.toolbarState.mirrorX, y: newVal });
  toastShow(`Mirror Y ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleUpdateBrush() {
  const newVal = !store.toolbarState.updateBrush;
  store.toggleUpdateBrush(newVal);
  toastShow(
    `Update Brush when colours or char changes ${newVal ? 'enabled' : 'disabled'}`
  );
}

function toggleGridView() {
  const newVal = !store.toolbarState.gridView;
  store.toggleGridView(newVal);
  toastShow(`Grid view ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleHalfBlockEditing() {
  const newVal = !store.toolbarState.halfBlockEditing;
  store.toggleHalfBlockEditing(newVal);
  toastShow(`Half Block Editing Mode ${newVal ? 'enabled' : 'disabled'}`);
  toastShow('WARNING THIS FEATURE IS STILL EXPERIMENTAL');
}
</script>
