<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full">
        <span class="ml-5">Tool: {{ getToolName }}</span> <br>
        <span class="ml-5">FgColour: {{ currentFg }}</span> <br>
        <span class="ml-5">BgColor: {{ currentBg }}</span> <br>
        <span class="ml-5">Char: {{ currentChar }}</span> <br>

        <span class="ml-5">canvasX: {{ canvasX }}</span> <br>
        <span class="ml-5">canvasY: {{ canvasY }}</span> <br>

        <span class="ml-5">mirrorX: {{ mirrorX }}</span> <br>
        <span class="ml-5">mirrorY: {{ mirrorY }}</span>

        <br>

        <span class="ml-5">State Internal Size: {{ asciiStats.stateSize }}</span>
        <br>

        <div class="mb-4 border-t-2">
          <div
            class="mt-1 p-2 bg-red-300 rounded-md cursor-pointer"
            @click="copyUriToClipboard()"
          >
            Copy URI Encoded String
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LZString from 'lz-string';
import { useDraggable } from '@vueuse/core';
import { toolbarIcons, mergeLayers } from '../ascii';
import { useAsciiBirdStore } from '../store';
import { usePanelStore } from '../store/panels';
import { useToast } from '../composables/useToast';
import { useClipboard } from '../composables/useClipboard';

defineProps<{
  canvasX?: number | null;
  canvasY?: number | null;
}>();

const store = useAsciiBirdStore();
const panelStore = usePanelStore();
const { show: toastShow } = useToast();
const { copyText } = useClipboard();
const panelEl = ref<HTMLElement | null>(null);

const { style: panelStyle } = useDraggable(panelEl, {
  initialValue: {
    x: panelStore.debugPanel.x,
    y: panelStore.debugPanel.y,
  },
});

const getToolName = computed(() =>
  toolbarIcons[store.currentTool]
    ? toolbarIcons[store.currentTool].name
    : 'none',
);

const currentFg = computed(() => store.currentFg);
const currentBg = computed(() => store.currentBg);
const currentChar = computed(() => store.currentChar);
const mirrorX = computed(() => store.toolbarState.mirrorX);
const mirrorY = computed(() => store.toolbarState.mirrorY);

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
