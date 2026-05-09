<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-50"
  >
    <div class="ab-card w-full h-full">
      <span
        v-for="(value, keyColours) in mircColours"
        :key="keyColours"
      >
        <hr v-if="keyColours === 16">

        <button
          type="button"
          :style="`background-color: ${mircColours[keyColours]} !important;`"
          class="ab-button border-gray-200 p-3"
          @click="onColourChange(keyColours)"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDraggable } from '@vueuse/core';
import { mircColours99 } from '../../ascii';
import { useAsciiBirdStore } from '../../store';

const props = defineProps<{ yOffset?: number }>();
const store = useAsciiBirdStore();
const el = ref<HTMLElement | null>(null);

const { style } = useDraggable(el, {
  initialValue: { x: 100, y: 100 + (props.yOffset || 0) },
});

const mircColours = mircColours99;

function onColourChange(colour: number) {
  if (store.toolbarState.isChoosingFg) {
    store.changeColourFg(colour);
  }

  if (store.toolbarState.isChoosingBg) {
    store.changeColourBg(colour);
  }
}
</script>
