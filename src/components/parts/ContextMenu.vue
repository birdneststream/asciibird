<template>
  <div
    class="context-menu"
    v-show="show"
    :style="contextStyle"
    ref="contextEl"
    tabindex="0"
    @blur="close"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const left = ref(0);
const top = ref(0);
const show = ref(false);
const contextEl = ref<HTMLElement>();

const contextStyle = computed(() => ({
  top: `${top.value}px`,
  left: `${left.value}px`,
}));

function close() {
  show.value = false;
  left.value = 0;
  top.value = 0;
}

function clampToViewport() {
  if (!contextEl.value) return;
  const rect = contextEl.value.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  if (left.value < 0) left.value = 0;
  if (top.value < 0) top.value = 0;
  if (left.value > maxX) left.value = Math.max(0, maxX);
  if (top.value > maxY) top.value = Math.max(0, maxY);
}

function open(evt: { clientX: number; clientY: number }) {
  left.value = evt.clientX;
  top.value = evt.clientY;
  show.value = true;
  nextTick(() => {
    clampToViewport();
    contextEl.value?.focus();
  });
}

defineExpose({ open, close, show, contextStyle });
</script>
