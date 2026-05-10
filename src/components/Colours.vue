<template>
  <div>
    <button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl"
      id="currentColourFg"
      @click="toolbarStore.changeIsUpdatingFg(!toolbarState.isChoosingFg)"
    >
      FG
    </button>

    <button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl ml-2"
      id="currentColourBg"
      @click="toolbarStore.changeIsUpdatingBg(!toolbarState.isChoosingBg)"
    >
      BG
    </button>

    <button
      type="button"
      class="ab-button rounded-3xl w-7 h-7"
      style="margin-left: -86px; margin-top: 12px"
      id="swapColour"
      @click="swapColours()"
    >
      <span
        class="material-icons"
        aria-hidden="true"
      >swap_horiz</span>
    </button>

    <button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};${outline}`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl ml-14"
      id="currentChar"
      :disabled="halfBlockEditing"
      @click="toolbarStore.changeIsUpdatingChar(!toolbarState.isChoosingChar)"
    >
      {{ toolbarState.selectedChar === " " ? "SP" : toolbarState.selectedChar }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mircColours99 } from '../ascii';
import { useToolbarStore } from '../store/toolbar';

const toolbarStore = useToolbarStore();

const mircColours = mircColours99;

const toolbarState = computed(() => toolbarStore.toolbarState);
const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const halfBlockEditing = computed(() => toolbarState.value.halfBlockEditing);

const outline = computed(() => {
  let outlineColor = currentBg.value === 0 ? 'black' : 'white';
  if (currentFg.value === currentBg.value) {
    return `-webkit-text-stroke-width: 0.5px;-webkit-text-stroke-color: ${outlineColor};`;
  }
  return '';
});

function swapColours() {
  const bg = currentBg.value;
  const fg = currentFg.value;
  toolbarStore.changeColourFg(bg);
  toolbarStore.changeColourBg(fg);
}

defineExpose({ swapColours, mircColours, toolbarState, currentFg, currentBg, outline, halfBlockEditing });
</script>
