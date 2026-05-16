<template>
  <div>
    <div
      ref="panelEl"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-panel-width max-h-[40%]"
      :style="[panelStyle, { zIndex: panelStore.panelZIndex('brushLibrary') }]"
    >
      <PanelHeader
        ref="handleRef"
        title="Brushes"
        icon="palette"
        show-status
        minimizable
        @minimize="panelStore.minimizePanel('brushLibrary')"
      />

      <div class="p-sm flex flex-col gap-xs overflow-y-auto custom-scrollbar">
        <!-- Tabs -->
        <div class="flex gap-1 mb-2">
          <button
            type="button"
            class="flex-1 py-1.5 font-label-mono text-label-mono rounded-sm transition-all duration-200 flex items-center justify-center gap-1"
            :class="panel.tab === 0
              ? 'bg-primary-container/20 text-primary border border-primary/50'
              : 'text-on-surface-variant hover:bg-surface-variant border border-transparent'"
            @click="changeTab(0)"
          >
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >history</span>
            History
          </button>

          <button
            type="button"
            class="flex-1 py-1.5 font-label-mono text-label-mono rounded-sm transition-all duration-200 flex items-center justify-center gap-1"
            :class="panel.tab === 1
              ? 'bg-primary-container/20 text-primary border border-primary/50'
              : 'text-on-surface-variant hover:bg-surface-variant border border-transparent'"
            @click="changeTab(1)"
          >
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >library_books</span>
            Library {{ libraryCount }}
          </button>
        </div>

        <!-- History Tab -->
        <div
          v-if="panel.tab === 0"
          class="flex flex-col gap-2"
        >
          <div
            v-for="(brush, key) in brushHistory"
            :key="key"
            class="bg-surface-container-lowest border border-outline-variant rounded p-2 hover:border-primary transition-colors"
          >
            <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

            <div class="flex gap-1 mt-2">
              <button
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="saveToLibrary(decompressBlock(brush.blocks))"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >save</span>
              </button>
              <button
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="reuseBlocks(decompressBlock(brush.blocks))"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >brush</span>
              </button>
              <button
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="removeFromHistory(decompressBlock(brush.blocks))"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Library Tab -->
        <div
          v-if="panel.tab === 1"
          class="flex flex-col gap-2"
        >
          <div v-if="!brushLibrary.length">
            <p class="text-sm text-center p-5 text-on-surface-variant">
              Save brushes to your library to use them here.
            </p>
          </div>

          <div
            v-for="(brush, key) in brushLibrary"
            :key="key"
            class="bg-surface-container-lowest border border-outline-variant rounded p-2 hover:border-primary transition-colors"
          >
            <div
              v-if="key <= 8"
              class="font-label-mono text-label-mono text-outline mb-1"
            >
              Ctrl+{{ key + 1 }}
            </div>
            <BrushCanvas :blocks="decompressBlock(brush.blocks)" />

            <div class="flex gap-1 mt-2">
              <button
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="removeFromLibrary(decompressBlock(brush.blocks))"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >delete</span>
              </button>
              <button
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="reuseBlocks(decompressBlock(brush.blocks))"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >brush</span>
              </button>
              <button
                v-if="key !== 0"
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="upBrush(key)"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >arrow_upward</span>
              </button>
              <button
                v-if="key !== brushLibrary.length - 1"
                type="button"
                class="w-8 h-8 rounded-sm flex items-center justify-center bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent"
                @click="downBrush(key)"
              >
                <span
                  class="material-icons text-sm"
                  aria-hidden="true"
                >arrow_downward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import LZString from 'lz-string';
import { usePanelDraggable } from '../composables/usePanelDraggable';
import { toolbarIcons, blockWidth, blockHeight } from '../ascii';
import type { Block } from '../types';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { usePanelStore } from '../store/panels';
import { useToast } from '../composables/useToast';
import BrushCanvas from './parts/BrushCanvas.vue';
import PanelHeader from './parts/PanelHeader.vue';
import hotkeys from 'hotkeys-js';

const props = defineProps<{ yOffset?: number }>();

const store = useAsciiBirdStore();
const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const { show: toastShow } = useToast();
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);
const snapX = computed(() => blockWidth * store.blockSizeMultiplier);
const snapY = computed(() => blockHeight * store.blockSizeMultiplier);
const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.brushLibrary.x,
    y: panelStore.brushLibrary.y,
  },
  handle: computed(() => handleRef.value?.headerEl ?? null),
  onBringToFront: () => panelStore.bringToFront('brushLibrary'),
  snapX,
  snapY,
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeBrushLibraryState({
    ...panelStore.brushLibrary,
    x: newX,
    y: newY,
  });
});

const panel = reactive({
  w: panelStore.brushLibrary.w,
  h: panelStore.brushLibrary.h,
  x: panelStore.brushLibrary.x,
  y: panelStore.brushLibrary.y,
  visible: true,
  tab: panelStore.brushLibrary.tab,
  dragging: false,
});

const brushHistory = computed(() => toolbarStore.brushHistory);
const brushLibrary = computed(() => toolbarStore.brushLibrary);
const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);
const isBrushing = computed(() => currentTool.value?.name === 'brush');
const isErasing = computed(() => currentTool.value?.name === 'eraser');

const libraryCount = computed(() =>
  brushLibrary.value.length > 0
    ? `(${brushLibrary.value.length})`
    : '',
);

const hotkeyBrushes = computed(() => {
  // ctrl+0 is reserved for zoom reset ('all' scope) — only bind ctrl+1..9
  const keys: string[] = [];
  for (let i = 1; i <= 9; i++) {
    keys.push(`ctrl+${i}`);
  }
  return keys.join(',');
});

// Register hotkeys for brush selection in 'editor' scope
hotkeys(hotkeyBrushes.value, 'editor', (event) => {
  event.preventDefault();

  if (isBrushing.value || isErasing.value) {
    const brushSelect = Number.parseInt(event.key) - 1;
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
        `${Math.trunc(panelStore.brushLibrary.y + val)}px`;
    }
  },
);

onUnmounted(() => {
  hotkeys.unbind(hotkeyBrushes.value, 'editor');
});

function changeTab(tab: number) {
  panel.tab = tab;
  panelStore.changeBrushLibraryState(panel);
}

function decompressBlock(item: string) {
  return JSON.parse(LZString.decompressFromUTF16(item));
}

function reuseBlocks(value: Block[][]) {
  toolbarStore.setBrushBlocks(value);
  toolbarStore.changeTool(4);
  toastShow('Applied brush from Library', { type: 'success' });
}

function saveToLibrary(value: Block[][]) {
  toolbarStore.pushBrushLibrary(value);
  toastShow('Saved brush to Library', { type: 'success' });
}

function removeFromLibrary(value: Block[][]) {
  toolbarStore.removeBrushLibrary(value);
  toastShow('Removed brush from Library');
}

function removeFromHistory(value: Block[][]) {
  toolbarStore.removeBrushHistory(value);
  toastShow('Removed brush from History');
}

function upBrush(key: number) {
  toolbarStore.upBrush(key);
}

function downBrush(key: number) {
  toolbarStore.downBrush(key);
}
</script>
