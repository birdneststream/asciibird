<template>
  <div
    ref="headerEl"
    class="drag-handle bg-surface-container-high flex items-center justify-between p-sm border-b border-outline-variant select-none"
  >
    <div class="flex items-center gap-2">
      <span
        class="material-icons text-outline text-sm"
        aria-hidden="true"
      >drag_indicator</span>
      <span class="font-label-mono text-label-mono text-on-surface font-bold uppercase tracking-wider">
        {{ title }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <slot name="right" />
      <div
        v-if="showStatus"
        class="w-2 h-2 rounded-full bg-secondary-fixed-dim shadow-[0_0_8px_rgba(171,214,0,0.5)]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
  showStatus?: boolean;
}>();

const headerEl = ref<HTMLElement | null>(null);

defineExpose({ headerEl });
</script>
