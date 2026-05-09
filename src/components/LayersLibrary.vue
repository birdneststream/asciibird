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
import { useDraggable } from '@vueuse/core';
import { useAsciiBirdStore } from '../store';
import Layers from './parts/Layers.vue';

const props = defineProps<{ yOffset?: number }>();
const store = useAsciiBirdStore();
const panelEl = ref<HTMLElement | null>(null);

const { style: panelStyle } = useDraggable(panelEl, {
  initialValue: {
    x: store.layersLibraryState.x,
    y: store.layersLibraryState.y,
  },
});

watch(
  () => props.yOffset,
  (val) => {
    if (panelEl.value) {
      panelEl.value.style.top =
        `${Math.trunc(store.layersLibraryState.y + val)}px`;
    }
  },
);
</script>
