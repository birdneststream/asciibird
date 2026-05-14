<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-picker floating-panel rounded-lg overflow-hidden p-sm"
  >
    <div class="grid grid-cols-10 gap-1">
      <button
        v-for="(value, keyColours) in mircColours"
        :key="keyColours"
        type="button"
        :style="{ backgroundColor: mircColours[keyColours] }"
        class="w-6 h-6 rounded border border-outline-variant hover:ring-2 hover:ring-primary transition-all"
        @click="onColourChange(keyColours)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import { mircColours99 } from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';
import { usePanelStore } from '../../store/panels';

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const el = ref<HTMLElement | null>(null);

/** Smart default position: adjacent to brush panel with bounds check */
const initialPos = computed(() => {
  if (toolbarStore.pickerPos) return toolbarStore.pickerPos;
  const bp = panelStore.brushPreview;
  const vpWidth = window?.innerWidth ?? 1280;
  const PICKER_W = 260;
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

function onColourChange(colour: number) {
  if (toolbarStore.toolbarState.isChoosingFg) {
    toolbarStore.changeColourFg(colour);
  }

  if (toolbarStore.toolbarState.isChoosingBg) {
    toolbarStore.changeColourBg(colour);
  }
}
</script>
