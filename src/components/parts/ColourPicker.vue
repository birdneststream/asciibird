<template>
  <div
    ref="panelEl"
    class="fixed floating-panel rounded-lg overflow-hidden flex flex-col"
    :style="[panelStyle, { zIndex: panelStore.panelZIndex('colourPicker') }]"
    style="width: 260px"
  >
    <PanelHeader
      ref="handleRef"
      title="Colors"
      icon="color_lens"
      minimizable
      @minimize="panelStore.minimizePanel('colourPicker')"
    />

    <div
      v-show="!panelStore.colourPicker.minimized"
      class="p-sm"
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

      <!-- Shade strip: lighter → darker variations of active color -->
      <div
        v-if="activeShades.length > 1"
        class="mt-2 pt-2 border-t border-outline-variant/30"
      >
        <span class="font-label-mono text-label-mono text-on-surface-variant/60 mb-1 block text-[10px]">
          Shades
        </span>
        <div class="flex gap-1">
          <button
            v-for="shadeIdx in activeShades"
            :key="shadeIdx"
            type="button"
            :style="{ backgroundColor: mircColours[shadeIdx] }"
            class="w-6 h-6 rounded border border-outline-variant hover:ring-2 hover:ring-primary transition-all"
            :class="shadeIdx === activeColorIndex ? 'ring-2 ring-primary' : ''"
            :aria-label="'Shade, mIRC color ' + shadeIdx"
            :title="'mIRC color ' + shadeIdx"
            @click="onColourChange(shadeIdx)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import PanelHeader from './PanelHeader.vue';
import { mircColours99 } from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';
import { usePanelStore } from '../../store/panels';
import { SHADE_MAP } from '../../utils/colorShades';

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);

/** Smart default position: fallback to toolbarStore.pickerPos for migration */
const initialPos = computed(() => {
  if (toolbarStore.pickerPos) return toolbarStore.pickerPos;
  return { x: panelStore.colourPicker.x, y: panelStore.colourPicker.y };
});

const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: initialPos.value,
  handle: computed(() => handleRef.value?.headerEl ?? null),
  onBringToFront: () => panelStore.bringToFront('colourPicker'),
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeColourPickerState({
    ...panelStore.colourPicker,
    x: newX,
    y: newY,
  });
});

const mircColours = mircColours99;

// ─── Shade strip state ─────────────────────────────────────────
// FG priority when both are active; default FG when neither.
const activeColorIndex = computed(() => {
  const ts = toolbarStore.toolbarState;
  if (ts.isChoosingBg && !ts.isChoosingFg) return toolbarStore.currentBg;
  return toolbarStore.currentFg;
});

const activeShades = computed(
  () => SHADE_MAP[activeColorIndex.value] ?? [],
);

// ─── Color change handler ───────────────────────────────────────

function onColourChange(colour: number) {
  if (toolbarStore.toolbarState.isChoosingFg) {
    toolbarStore.changeColourFg(colour);
  }

  if (toolbarStore.toolbarState.isChoosingBg) {
    toolbarStore.changeColourBg(colour);
  }
}
</script>
