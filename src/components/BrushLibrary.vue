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

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import LZString from 'lz-string';
import { useDraggable } from '@vueuse/core';
import { toolbarIcons } from '../ascii';
import { useAsciiBirdStore } from '../store';
import { useToast } from '../composables/useToast';
import BrushCanvas from './parts/BrushCanvas.vue';
import hotkeys from 'hotkeys-js';

const props = defineProps<{ yOffset?: number }>();

const store = useAsciiBirdStore();
const toastShow = useToast();
const panelEl = ref<HTMLElement | null>(null);

const { style: panelStyle } = useDraggable(panelEl, {
  initialValue: {
    x: store.brushLibraryState.x,
    y: store.brushLibraryState.y,
  },
});

const panel = reactive({
  w: store.brushLibraryState.w,
  h: store.brushLibraryState.h,
  x: store.brushLibraryState.x,
  y: store.brushLibraryState.y,
  visible: true,
  tab: store.brushLibraryState.tab,
  dragging: false,
});

const brushHistory = computed(() => store.brushHistory);
const brushLibrary = computed(() => store.brushLibrary);
const currentTool = computed(() => toolbarIcons[store.currentTool]);
const isBrushing = computed(() => currentTool.value?.name === 'brush');
const isErasing = computed(() => currentTool.value?.name === 'eraser');

const libraryCount = computed(() =>
  brushLibrary.value.length > 0
    ? `(${brushLibrary.value.length})`
    : '',
);

const hotkeyBrushes = computed(() => {
  let hotkeyString = '';
  for (let i = 0; i <= 9; i++) {
    hotkeyString = `${hotkeyString}ctrl+${i},`;
  }
  return hotkeyString;
});

// Register hotkeys for brush selection
hotkeys(hotkeyBrushes.value, (event) => {
  event.preventDefault();

  if (isBrushing.value || isErasing.value) {
    const brushSelect =
      Number.parseInt(event.key) !== 0
        ? Number.parseInt(event.key) - 1
        : 9;
    if (brushLibrary.value[brushSelect]) {
      reuseBlocks(
        decompressBlock(brushLibrary.value[brushSelect].blocks),
      );
    }
  }
});

watch(
  () => props.yOffset,
  (val) => {
    if (panelEl.value) {
      panelEl.value.style.top =
        `${Math.trunc(store.brushLibraryState.y + val)}px`;
    }
  },
);

onUnmounted(() => {
  hotkeys.unbind(hotkeyBrushes.value);
});

function changeTab(tab: number) {
  panel.tab = tab;
  store.changeBrushLibraryState(panel);
}

function decompressBlock(item: string) {
  return JSON.parse(LZString.decompressFromUTF16(item));
}

function reuseBlocks(value: unknown[][]) {
  store.setBrushBlocks(value);
  store.changeTool(4);
  toastShow('Applied brush from Library', { type: 'success' });
}

function saveToLibrary(value: unknown[][]) {
  store.pushBrushLibrary(value);
  toastShow('Saved brush to Library', { type: 'success' });
}

function removeFromLibrary(value: unknown[][]) {
  store.removeBrushLibrary(value);
  toastShow('Removed brush from Library');
}

function removeFromHistory(value: unknown[][]) {
  store.removeBrushHistory(value);
  toastShow('Removed brush from History');
}

function upBrush(key: number) {
  store.upBrush(key);
}

function downBrush(key: number) {
  store.downBrush(key);
}
</script>
