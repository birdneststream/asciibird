<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-50"
  >
    <div class="ab-card w-full h-full">
      <div class="p-1">
        <input
          type="checkbox"
          class="ab-checkbox"
          name="leave-open"
          v-model="persistChars"
          @click="changePersistChars"
        > <small>Persist this panel after character changes</small>
      </div>
      <button
        type="button"
        v-for="(char, keyChar) in charCodes"
        :key="keyChar"
        :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]} !important;${outline};font-size: 13px;width: ${charBlockWidth}px;height: ${charBlockHeight}px;`"
        class="ab-button m-0.5"
        @click="onCharChange(char)"
      >
        {{ char === " " ? "SP" : char }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDraggable } from '@vueuse/core';
import {
  charCodes,
  mircColours99,
  blockWidth,
  blockHeight,
} from '../../ascii';
import { useAsciiBirdStore } from '../../store';

const props = defineProps<{
  canvasX?: number | null;
  canvasY?: number | null;
  yOffset?: number;
}>();

const store = useAsciiBirdStore();
const el = ref<HTMLElement | null>(null);
const persistChars = ref(false);

const { style } = useDraggable(el, {
  initialValue: { x: 170, y: 100 + (props.yOffset || 0) },
});

const mircColours = mircColours99;

const currentFg = computed(() => store.currentFg);
const currentBg = computed(() => store.currentBg);
const charBlockWidth = computed(() => blockWidth * 2);
const charBlockHeight = computed(() => blockHeight * 2);

const outline = computed(() => {
  const outlineColor = currentBg.value === 0 ? 'black' : 'white';
  if (currentFg.value === currentBg.value) {
    return `-webkit-text-stroke-width: 0.5px;-webkit-text-stroke-color: ${outlineColor};`;
  }
  return '';
});

function onCharChange(char: string) {
  store.changeChar(char);
}

function changePersistChars() {
  store.persistCharPanel(!persistChars.value);
}
</script>
