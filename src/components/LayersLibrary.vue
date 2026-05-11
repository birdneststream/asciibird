<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full overflow-y-auto overflow-x-hidden">
        <Layers />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePanelDraggable } from '../composables/usePanelDraggable';
import { usePanelStore } from '../store/panels';
import Layers from './parts/Layers.vue';

const props = defineProps<{ yOffset?: number }>();
const panelStore = usePanelStore();
const panelEl = ref<HTMLElement | null>(null);

const { style: panelStyle } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.layersLibrary.x,
    y: panelStore.layersLibrary.y,
  },
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
