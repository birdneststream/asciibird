<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-picker floating-panel rounded-lg overflow-hidden flex flex-col"
    style="width: 480px"
  >
    <PanelHeader
      ref="handleRef"
      title="Characters"
      icon="text_fields"
      @minimize="toolbarStore.setPickerPos(null)"
    />

    <div class="p-sm flex flex-col gap-xs">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="ab-checkbox"
          name="leave-open"
          v-model="persistChars"
          @click="changePersistChars"
        >
        <span class="text-body-sm text-on-surface-variant">Persist after changes</span>
      </label>

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
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);
const persistChars = ref(false);

/** Smart default position: adjacent to brush panel */
const initialPos = computed(() => {
  if (toolbarStore.pickerPos) return toolbarStore.pickerPos;
  const bp = panelStore.brushPreview;
  const vpWidth = window?.innerWidth ?? 1280;
  const PICKER_W = 480;
  const rightEdge = bp.x + bp.w + 8 + PICKER_W;
  if (rightEdge > vpWidth) {
    return { x: bp.x, y: bp.y + bp.h + 8 };
  }
  return { x: bp.x + bp.w + 8, y: bp.y };
});

const { style, x, y, isDragging } = usePanelDraggable(el, {
  initialValue: initialPos.value,
  handle: computed(() => handleRef.value?.headerEl ?? null),
});

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
}

function changePersistChars() {
  toolbarStore.persistCharPanel(!persistChars.value);
}
</script>
