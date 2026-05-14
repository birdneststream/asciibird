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
      <div class="grid grid-cols-16 gap-0">
        <template
          v-for="group in charGroups"
          :key="group.label"
        >
          <div class="col-span-16 text-xs font-semibold text-on-surface-variant/60 py-1 px-0.5 border-b border-outline-variant/30">
            {{ group.label }}
          </div>
          <button
            type="button"
            v-for="(char, keyChar) in group.chars"
            :key="group.label + '-' + keyChar"
            :style="charButtonStyle"
            class="flex items-center justify-center font-label-mono text-xs hover:ring-1 hover:ring-primary transition-all border border-outline-variant/20"
            @click="onCharChange(char)"
          >
            {{ char === " " ? "SP" : char }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import {
  charGroups,
  mircColours99,
  blockWidth,
  blockHeight,
} from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';
import { usePanelStore } from '../../store/panels';

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const el = ref<HTMLElement | null>(null);
const persistChars = ref(false);

/** Smart default position: adjacent to brush panel with bounds check */
const initialPos = computed(() => {
  if (toolbarStore.pickerPos) return toolbarStore.pickerPos;
  const bp = panelStore.brushPreview;
  const vpWidth = window?.innerWidth ?? 1280;
  const PICKER_W = 420;
  const rightEdge = bp.x + bp.w + 8 + PICKER_W;
  if (rightEdge > vpWidth) {
    return { x: bp.x, y: bp.y + bp.h + 8 };
  }
  return { x: bp.x + bp.w + 8, y: bp.y };
});

const { style, x, y, isDragging } = usePanelDraggable(el, {
  initialValue: initialPos.value,
});

// Only persist position on drag-end, not every pixel
watch(isDragging, (dragging) => {
  if (!dragging) {
    toolbarStore.setPickerPos({ x: x.value, y: y.value });
  }
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
