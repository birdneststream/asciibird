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

function open(evt: { pageX: number; pageY: number }) {
  left.value = evt.pageX;
  top.value = evt.pageY - window.pageYOffset;
  show.value = true;
  nextTick(() => contextEl.value?.focus());
}

defineExpose({ open, close, show, contextStyle });
</script>
