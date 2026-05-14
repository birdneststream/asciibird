<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-panel-width max-h-[80%] z-40"
    >
      <PanelHeader
        ref="handleRef"
        title="Layers"
        show-status
        minimizable
        @minimize="panelStore.minimizePanel('layersLibrary')"
      />

      <div class="p-sm flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Layers />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../composables/usePanelDraggable';
import { usePanelStore } from '../store/panels';
import Layers from './parts/Layers.vue';
import PanelHeader from './parts/PanelHeader.vue';

const props = defineProps<{ yOffset?: number }>();
const panelStore = usePanelStore();
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);

const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.layersLibrary.x,
    y: panelStore.layersLibrary.y,
  },
  handle: computed(() => handleRef.value?.headerEl ?? null),
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeLayersLibraryState({
    ...panelStore.layersLibrary,
    x: newX,
    y: newY,
  });
});

watch(
  () => props.yOffset,
  (val) => {
    if (panelEl.value) {
      panelEl.value.style.top =
        `${Math.trunc(panelStore.layersLibrary.y + val)}px`;
    }
  },
);
</script>
