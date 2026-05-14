<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-picker floating-panel rounded-lg overflow-hidden"
  >
    <div class="p-sm">
      <label class="flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="checkbox"
          class="ab-checkbox"
          name="leave-open"
          v-model="persistChars"
          @click="changePersistChars"
        >
        <span class="text-body-sm text-on-surface-variant">Persist after character changes</span>
      </label>
      <div class="grid grid-cols-8 gap-1">
        <button
          type="button"
          v-for="(char, keyChar) in charCodes"
          :key="keyChar"
          :style="charButtonStyle"
          class="rounded border border-outline-variant flex items-center justify-center font-label-mono text-xs hover:ring-2 hover:ring-primary transition-all"
          @click="onCharChange(char)"
        >
          {{ char === " " ? "SP" : char }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import {
  charCodes,
  mircColours99,
  blockWidth,
  blockHeight,
} from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';

const props = defineProps<{
  canvasX?: number | null;
  canvasY?: number | null;
  yOffset?: number;
}>();

const toolbarStore = useToolbarStore();
const el = ref<HTMLElement | null>(null);
const persistChars = ref(false);

const { style } = usePanelDraggable(el, {
  initialValue: { x: 170, y: 100 + (props.yOffset || 0) },
});

const mircColours = mircColours99;

const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const charBlockWidth = computed(() => blockWidth * 2);
const charBlockHeight = computed(() => blockHeight * 2);

const outline = computed(() => {
  const outlineColor = currentBg.value === 0 ? 'black' : 'white';
  if (currentFg.value === currentBg.value) {
    return `-webkit-text-stroke-width: 0.5px;-webkit-text-stroke-color: ${outlineColor};`;
  }
  return '';
});

const charButtonStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: mircColours[currentBg.value],
    color: mircColours[currentFg.value],
    width: `${charBlockWidth.value}px`,
    height: `${charBlockHeight.value}px`,
  };
  if (outline.value) {
    const parts = outline.value.split(';');
    parts.forEach((part) => {
      const [key, val] = part.split(':');
      if (key && val) {
        const camelKey = key.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        style[camelKey] = val.trim();
      }
    });
  }
  return style;
});

function onCharChange(char: string) {
  toolbarStore.changeChar(char);
}

function changePersistChars() {
  toolbarStore.persistCharPanel(!persistChars.value);
}
</script>
