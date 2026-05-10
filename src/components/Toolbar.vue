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
          <Tooltip content="Ignore Foreground when Editing">
            <label class="ab-checkbox-hover">
              <input
                v-model="store.toolbarState.targetingFg"
                type="checkbox"
                class="form-checkbox h-5 w-5 text-blue-600"
                name="targetingFg"
                :disabled="!canBg && !canText"
              >
              <span class="ab-checkbox-label">FG</span>
            </label>
          </Tooltip>

          <Tooltip content="Ignore Background when Editing">
            <label class="ab-checkbox-hover">
              <input
                v-model="store.toolbarState.targetingBg"
                type="checkbox"
                class="ab-checkbox"
                name="targetingBg"
                :disabled="!canFg && !canText"
              >
              <span class="ab-checkbox-label">BG</span>
            </label>
          </Tooltip>

          <Tooltip content="Ignore Characters when Editing">
            <label class="ab-checkbox-hover">
              <input
                v-model="store.toolbarState.targetingChar"
                type="checkbox"
                class="ab-checkbox"
                name="targetingChar"
                :disabled="!canFg && !canBg"
              >
              <span class="ab-checkbox-label">Text</span>
            </label>
          </Tooltip>
        </div>

        <div class="flex mb-3 border-t border-black border-opacity-10 pt-2">
          <Tooltip content="Mirror X axis when Editing">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                store.toolbarState.mirrorX
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleMirrorX()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >more_vert</span>
            </button>
          </Tooltip>

          <Tooltip content="Mirror Y axis when Editing">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                store.toolbarState.mirrorY
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleMirrorY()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >more_horiz</span>
            </button>
          </Tooltip>

          <Tooltip content="Update Brush Automatically when Colours or Char Changes">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                store.toolbarState.updateBrush
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleUpdateBrush()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >color_lens</span>
            </button>
          </Tooltip>

          <Tooltip content="Toggle Grid View">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                store.toolbarState.gridView
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleGridView()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >{{
                !store.toolbarState.gridView ? "grid_on" : "grid_off"
              }}</span>
            </button>
          </Tooltip>

          <Tooltip content="Toggle Half Block Editing Mode">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                store.toolbarState.halfBlockEditing
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleHalfBlockEditing()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >grid_view</span>
            </button>
          </Tooltip>
        </div>

        <div class="border-t border-black border-opacity-10 pt-2">
          <Tooltip
            v-for="(value, keyToolbar) in toolbarIcons"
            :key="keyToolbar + 50"
            :content="tooltipName(value)"
          >
            <button
              type="button"
              :class="`rounded-3xl w-10 h-10 mt-1 ml-1 transition-all ${
                currentTool.name === value.name
                  ? 'border-gray-900 bg-blue-500'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="store.changeTool(keyToolbar)"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >{{ value.icon }}</span>
            </button>
          </Tooltip>
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
import Tooltip from './parts/Tooltip.vue';
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
