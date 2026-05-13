<template>
  <footer class="fixed bottom-0 left-0 right-0 z-40 h-6 bg-surface-container border-t border-outline-variant px-md flex items-center justify-between">
    <div class="flex items-center gap-lg">
      <div class="flex items-center gap-xs">
        <span class="w-2 h-2 rounded-full bg-secondary-fixed-dim shadow-[0_0_8px_rgba(171,214,0,0.5)]" />
        <span class="font-label-mono text-[10px] uppercase text-on-surface-variant">Ready</span>
      </div>
      <span class="font-label-mono text-[10px] text-on-surface-variant">
        X: {{ coordsX }} | Y: {{ coordsY }}
      </span>
      <span
        v-if="toolName"
        class="font-label-mono text-[10px] text-on-surface-variant"
      >
        Tool: {{ toolName }}
      </span>
    </div>
    <div class="flex items-center gap-md">
      <span
        v-if="projectTitle"
        class="font-label-mono text-[10px] text-on-surface-variant"
      >
        Project: {{ projectTitle }}
      </span>
      <span
        v-if="layerInfo"
        class="font-label-mono text-[10px] text-on-surface-variant"
      >
        Layer: {{ layerInfo }}
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { toolbarIcons } from '../ascii';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';

const store = useAsciiBirdStore();
const toolbarStore = useToolbarStore();

const props = defineProps<{
  canvasX: number | null;
  canvasY: number | null;
}>();

const coordsX = computed(() => props.canvasX ?? '-');
const coordsY = computed(() => props.canvasY ?? '-');

const toolName = computed(() => {
  const tool = toolbarIcons[toolbarStore.currentTool];
  return tool ? tool.name.charAt(0).toUpperCase() + tool.name.slice(1) : null;
});

const projectTitle = computed(() => {
  const meta = store.asciibirdMeta;
  if (!meta.length) return null;
  return store.currentAscii?.title ?? null;
});

const layerInfo = computed(() => {
  const ascii = store.currentAscii;
  if (!ascii) return null;
  const layers = store.currentAsciiLayers;
  const idx = ascii.selectedLayer ?? 0;
  const layer = layers[idx];
  if (!layer) return null;
  return `${idx + 1}/${layers.length} ${layer.label}`;
});
</script>
