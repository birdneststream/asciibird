<template>
  <div
    ref="panelEl"
    class="fixed floating-panel rounded-lg overflow-hidden flex flex-col"
    :style="[panelStyle, { zIndex: panelStore.panelZIndex('charPicker') }]"
    style="width: 480px"
  >
    <PanelHeader
      ref="handleRef"
      title="Characters"
      icon="text_fields"
      minimizable
      @minimize="panelStore.minimizePanel('charPicker')"
    >
      <template #right>
        <Tooltip content="Disable auto hide after selection">
          <button
            type="button"
            class="w-5 h-5 rounded flex items-center justify-center transition-colors"
            :class="toolbarStore.toolbarState.persistCharPanel
              ? 'text-primary bg-primary-container/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'"
            @click.stop="togglePersistChar"
          >
            <span
              class="material-icons"
              style="font-size: 14px"
              aria-hidden="true"
            >push_pin</span>
          </button>
        </Tooltip>
      </template>
    </PanelHeader>

    <div
      v-show="!panelStore.charPicker.minimized"
      class="p-sm flex flex-col gap-xs"
    >
      <div class="overflow-y-auto max-h-[420px] custom-scrollbar">
        <section
          v-for="(group, gi) in charGroups"
          :key="group.label"
          :class="gi > 0 ? 'mt-sm' : ''"
        >
          <div class="text-body-sm font-bold text-on-surface-variant/70 uppercase tracking-wider pb-xs mb-xs border-b border-outline-variant/30">
            {{ group.label }}
            <span class="font-normal text-on-surface-variant/40 ml-1">({{ group.chars.length }})</span>
          </div>
          <div class="flex flex-wrap gap-px">
            <button
              type="button"
              v-for="(char, ci) in group.chars"
              :key="group.label + '-' + ci"
              :style="charButtonStyle"
              class="flex items-center justify-center font-label-mono text-xs hover:ring-1 hover:ring-primary transition-all border border-outline-variant/20"
              :title="charName(char)"
              @click="onCharChange(char)"
            >
              {{ char === ' ' ? 'SP' : char }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import PanelHeader from './PanelHeader.vue';
import Tooltip from './Tooltip.vue';
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
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);

/** Smart default position: fallback to toolbarStore.pickerPos for migration */
const initialPos = computed(() => {
  if (toolbarStore.pickerPos) return toolbarStore.pickerPos;
  return { x: panelStore.charPicker.x, y: panelStore.charPicker.y };
});

const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: initialPos.value,
  handle: computed(() => handleRef.value?.headerEl ?? null),
  onBringToFront: () => panelStore.bringToFront('charPicker'),
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeCharPickerState({
    ...panelStore.charPicker,
    x: newX,
    y: newY,
  });
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
  const s: Record<string, string> = {
    backgroundColor: mircColours[currentBg.value],
    color: mircColours[currentFg.value],
    width: `${charBlockWidth.value}px`,
    height: `${charBlockHeight.value}px`,
  };
  if (outline.value) {
    outline.value.split(';').forEach((part) => {
      const [key, val] = part.split(':');
      if (key && val) {
        const camelKey = key.trim().replace(
          /-([a-z])/g,
          (_, letter: string) => letter.toUpperCase(),
        );
        s[camelKey] = val.trim();
      }
    });
  }
  return s;
});

function charName(char: string): string {
  if (char === ' ') return 'Space';
  return `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
}

function onCharChange(char: string) {
  toolbarStore.changeChar(char);
  // Auto-minimize after picking unless persist is on
  if (!toolbarStore.toolbarState.persistCharPanel) {
    panelStore.minimizePanel('charPicker');
  }
}

function togglePersistChar() {
  const val = !toolbarStore.toolbarState.persistCharPanel;
  toolbarStore.persistCharPanel(val);
}
</script>
