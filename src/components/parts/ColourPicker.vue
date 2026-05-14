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
import { ref } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import { mircColours99 } from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';

const props = defineProps<{ yOffset?: number }>();
const toolbarStore = useToolbarStore();
const el = ref<HTMLElement | null>(null);

const { style } = usePanelDraggable(el, {
  initialValue: { x: 100, y: 100 + (props.yOffset || 0) },
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
