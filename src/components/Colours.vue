<template>
  <div class="relative flex items-center justify-between w-full">
    <!-- FG swatch -->
    <button
      type="button"
      :style="{ backgroundColor: mircColours[currentFg] }"
      class="w-12 h-12 rounded border border-outline-variant flex items-center justify-center text-xs font-label-mono transition-transform active:scale-95"
      id="currentColourFg"
      @click="toggleFg"
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
        class="w-12 h-12 rounded border border-outline-variant flex items-center justify-center text-xs font-label-mono transition-transform active:scale-95"
        id="currentColourBg"
        @click="toggleBg"
      >
        BG
      </button>

      <button
        type="button"
        :style="charButtonStyle"
        class="w-12 h-12 rounded border border-outline-variant flex items-center justify-center text-xs font-label-mono transition-transform active:scale-95"
        id="currentChar"
        :disabled="halfBlockEditing"
        @click="toggleChar"
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
import { usePanelStore } from '../store/panels';

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();

const mircColours = mircColours99;

const toolbarState = computed(() => toolbarStore.toolbarState);
const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const halfBlockEditing = computed(() => toolbarState.value.halfBlockEditing);

/**
 * Check if the colour picker panel is actually showing on screen.
 * Must satisfy both: not minimized AND the isChoosing flag is active.
 */
function isColourPickerShowing(): boolean {
  return !panelStore.colourPicker.minimized
    && (toolbarState.value.isChoosingFg || toolbarState.value.isChoosingBg);
}

/** Show colour picker in FG mode, or dismiss if already showing in FG mode */
function toggleFg() {
  const showing = isColourPickerShowing() && toolbarState.value.isChoosingFg;
  if (showing) {
    toolbarStore.changeIsUpdatingFg(false);
    panelStore.minimizePanel('colourPicker');
  } else {
    toolbarStore.changeIsUpdatingFg(false);
    toolbarStore.changeIsUpdatingBg(false);
    toolbarStore.changeIsUpdatingFg(true);
    panelStore.restorePanel('colourPicker');
  }
}

/** Show colour picker in BG mode, or dismiss if already showing in BG mode */
function toggleBg() {
  const showing = isColourPickerShowing() && toolbarState.value.isChoosingBg;
  if (showing) {
    toolbarStore.changeIsUpdatingBg(false);
    panelStore.minimizePanel('colourPicker');
  } else {
    toolbarStore.changeIsUpdatingFg(false);
    toolbarStore.changeIsUpdatingBg(false);
    toolbarStore.changeIsUpdatingBg(true);
    panelStore.restorePanel('colourPicker');
  }
}

/** Show char picker, or dismiss if already showing */
function toggleChar() {
  const showing = !panelStore.charPicker.minimized
    && toolbarState.value.isChoosingChar;
  if (showing) {
    toolbarStore.changeIsUpdatingChar(false);
    panelStore.minimizePanel('charPicker');
  } else {
    toolbarStore.changeIsUpdatingChar(true);
    panelStore.restorePanel('charPicker');
  }
}

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

defineExpose({ swapColours, mircColours, toolbarState, currentFg, currentBg, outline, halfBlockEditing, toggleFg, toggleBg, toggleChar });
</script>
