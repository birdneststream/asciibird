<template>
  <div class="relative flex items-center justify-between w-full">
    <!-- FG swatch -->
    <button
      type="button"
      :style="{ backgroundColor: mircColours[currentFg] }"
      class="w-14 h-14 rounded border border-outline-variant flex items-center justify-center text-sm font-label-mono transition-transform active:scale-95"
      id="currentColourFg"
      @click="toolbarStore.changeIsUpdatingFg(!toolbarState.isChoosingFg)"
    >
      FG
    </button>

    <!-- Swap button -->
    <button
      type="button"
      class="w-8 h-8 rounded bg-surface-container-highest border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors z-10"
      id="swapColour"
      @click="swapColours()"
    >
      <span
        class="material-icons text-sm"
        aria-hidden="true"
      >swap_horiz</span>
    </button>

    <!-- BG swatch + Char -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        :style="{ backgroundColor: mircColours[currentBg] }"
        class="w-14 h-14 rounded border border-outline-variant flex items-center justify-center text-sm font-label-mono transition-transform active:scale-95"
        id="currentColourBg"
        @click="toolbarStore.changeIsUpdatingBg(!toolbarState.isChoosingBg)"
      >
        BG
      </button>

      <button
        type="button"
        :style="charButtonStyle"
        class="w-14 h-14 rounded border border-outline-variant flex items-center justify-center text-sm font-label-mono transition-transform active:scale-95"
        id="currentChar"
        :disabled="halfBlockEditing"
        @click="toolbarStore.changeIsUpdatingChar(!toolbarState.isChoosingChar)"
      >
        {{ toolbarState.selectedChar === " " ? "SP" : toolbarState.selectedChar }}
      </button>
    </div>
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
  const outlineColor = currentBg.value === 0 ? 'black' : 'white';
  if (currentFg.value === currentBg.value) {
    return `0.5px ${outlineColor}`;
  }
  return '';
});

const charButtonStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: mircColours[currentBg.value],
    color: mircColours[currentFg.value],
  };
  const stroke = outline.value;
  if (stroke) {
    style.webkitTextStrokeWidth = stroke.split(' ')[0];
    style.webkitTextStrokeColor = stroke.split(' ')[1];
  }
  return style;
});

function swapColours() {
  const bg = currentBg.value;
  const fg = currentFg.value;
  toolbarStore.changeColourFg(bg);
  toolbarStore.changeColourBg(fg);
}

defineExpose({ swapColours, mircColours, toolbarState, currentFg, currentBg, outline, halfBlockEditing });
</script>
