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
                v-model="toolbarStore.toolbarState.targetingFg"
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
                v-model="toolbarStore.toolbarState.targetingBg"
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
                v-model="toolbarStore.toolbarState.targetingChar"
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
                toolbarStore.toolbarState.mirrorX
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
                toolbarStore.toolbarState.mirrorY
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
                toolbarStore.toolbarState.updateBrush
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
                toolbarStore.toolbarState.gridView
                  ? 'border-gray-900 bg-blue-800'
                  : 'border-gray-200 bg-gray-500'
              }`"
              @click="toggleGridView()"
            >
              <span
                class="material-icons"
                aria-hidden="true"
              >{{
                !toolbarStore.toolbarState.gridView ? "grid_on" : "grid_off"
              }}</span>
            </button>
          </Tooltip>

          <Tooltip content="Toggle Half Block Editing Mode">
            <button
              type="button"
              :class="`ab-toolbar-button ${
                toolbarStore.toolbarState.halfBlockEditing
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
              @click="toolbarStore.changeTool(keyToolbar)"
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
import { useToolbarStore } from '../store/toolbar';
import { useToast } from '../composables/useToast';
import Colours from "./Colours.vue";
import Tooltip from './parts/Tooltip.vue';
import { toolbarIcons } from "../ascii";
import { tooltipName } from '../utils/toolbar';

defineOptions({ name: 'Toolbar' });

const toolbarStore = useToolbarStore();
const { show: toastShow } = useToast();

const panelEl = ref<HTMLElement | null>(null);
const { style: panelStyle, x: dragX, y: dragY } = useDraggable(panelEl, {
  initialValue: { x: toolbarStore.toolbarState.x, y: toolbarStore.toolbarState.y },
});

// Sync drag position back to store
watch([dragX, dragY], ([newX, newY]) => {
  toolbarStore.changeToolBarState({
    x: newX,
    y: newY,
    w: toolbarStore.toolbarState.w,
    h: toolbarStore.toolbarState.h,
    visible: true,
  });
});

const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);
const canFg = computed(() => toolbarStore.isTargettingFg);
const canBg = computed(() => toolbarStore.isTargettingBg);
const canText = computed(() => toolbarStore.isTargettingChar);

function toggleMirrorX() {
  const newVal = !toolbarStore.toolbarState.mirrorX;
  toolbarStore.updateMirror({ x: newVal, y: toolbarStore.toolbarState.mirrorY });
  toastShow(`Mirror X ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleMirrorY() {
  const newVal = !toolbarStore.toolbarState.mirrorY;
  toolbarStore.updateMirror({ x: toolbarStore.toolbarState.mirrorX, y: newVal });
  toastShow(`Mirror Y ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleUpdateBrush() {
  const newVal = !toolbarStore.toolbarState.updateBrush;
  toolbarStore.toggleUpdateBrush(newVal);
  toastShow(
    `Update Brush when colours or char changes ${newVal ? 'enabled' : 'disabled'}`
  );
}

function toggleGridView() {
  const newVal = !toolbarStore.toolbarState.gridView;
  toolbarStore.toggleGridView(newVal);
  toastShow(`Grid view ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleHalfBlockEditing() {
  const newVal = !toolbarStore.toolbarState.halfBlockEditing;
  toolbarStore.toggleHalfBlockEditing(newVal);
  toastShow(`Half Block Editing Mode ${newVal ? 'enabled' : 'disabled'}`);
  toastShow('WARNING THIS FEATURE IS STILL EXPERIMENTAL');
}
</script>
