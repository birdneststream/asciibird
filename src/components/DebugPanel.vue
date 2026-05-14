<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-48 z-40"
    >
      <PanelHeader
        ref="handleRef"
        title="Debug"
        show-status
        minimizable
        @minimize="panelStore.minimizePanel('debugPanel')"
      />

      <div class="p-sm flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <div class="font-label-mono text-label-mono space-y-1">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Tool:</span>
            <span class="text-on-surface">{{ getToolName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Fg:</span>
            <span class="text-on-surface">{{ currentFg }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Bg:</span>
            <span class="text-on-surface">{{ currentBg }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Char:</span>
            <span class="text-on-surface">{{ currentChar }}</span>
          </div>
          <hr class="border-outline-variant/30 my-1">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">X:</span>
            <span class="text-on-surface">{{ canvasX ?? '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Y:</span>
            <span class="text-on-surface">{{ canvasY ?? '-' }}</span>
          </div>
          <hr class="border-outline-variant/30 my-1">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">mirrorX:</span>
            <span class="text-on-surface">{{ mirrorX }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-on-surface-variant">mirrorY:</span>
            <span class="text-on-surface">{{ mirrorY }}</span>
          </div>
          <hr class="border-outline-variant/30 my-1">
          <div class="flex justify-between">
            <span class="text-on-surface-variant">Size:</span>
            <span class="text-on-surface">{{ asciiStats.stateSize }}</span>
          </div>
        </div>

        <button
          type="button"
          class="mt-2 w-full py-2 px-3 rounded-sm bg-error-container/20 text-error border border-error/50 font-label-mono text-label-mono hover:bg-error-container/30 transition-all"
          @click="copyUriToClipboard()"
        >
          Copy URI Encoded String
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LZString from 'lz-string';
import { usePanelDraggable } from '../composables/usePanelDraggable';
import { toolbarIcons, mergeLayers } from '../ascii';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { usePanelStore } from '../store/panels';
import { useToast } from '../composables/useToast';
import { useClipboard } from '../composables/useClipboard';
import PanelHeader from './parts/PanelHeader.vue';

defineProps<{
  canvasX?: number | null;
  canvasY?: number | null;
}>();

const store = useAsciiBirdStore();
const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const { show: toastShow } = useToast();
const { copyText } = useClipboard();
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);

const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.debugPanel.x,
    y: panelStore.debugPanel.y,
  },
  handle: computed(() => handleRef.value?.headerEl ?? null),
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeDebugPanelState({
    ...panelStore.debugPanel,
    x: newX,
    y: newY,
  });
});

const getToolName = computed(() =>
  toolbarIcons[toolbarStore.currentTool]
    ? toolbarIcons[toolbarStore.currentTool].name
    : 'none',
);

const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const currentChar = computed(() => toolbarStore.currentChar);
const mirrorX = computed(() => toolbarStore.toolbarState.mirrorX);
const mirrorY = computed(() => toolbarStore.toolbarState.mirrorY);

const asciiStats = computed(() => {
  const byteSize = (str: string) => new Blob([str]).size;
  const stateSize = (
    byteSize(JSON.stringify(store.$state)) / 1024
  ).toFixed(2);
  return { stateSize: `${stateSize}kb` };
});

function copyUriToClipboard() {
  const ascii = LZString.compressToEncodedURIComponent(
    JSON.stringify(mergeLayers()),
  );
  copyText(ascii).then(
    () => {
      toastShow('Copied URI encoded ASCII for Splash Ascii!', {
        type: 'success',
      });
    },
    () => {
      toastShow('Error when copying URI encoded ASCII!', {
        type: 'error',
      });
    },
  );
}
</script>
