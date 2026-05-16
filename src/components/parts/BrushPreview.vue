<template>
  <div>
    <div
      ref="panelEl"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-[220px]"
      :style="[panelStyle, { zIndex: panelStore.panelZIndex('brushPreview') }]"
    >
      <PanelHeader
        ref="handleRef"
        title="Brush"
        icon="brush"
        show-status
        minimizable
        @minimize="panelStore.minimizePanel('brushPreview')"
      />

      <div class="p-sm flex flex-col gap-xs overflow-y-auto custom-scrollbar">
        <!-- Recent colors strip -->
        <div
          v-if="recentColors.length > 0"
          class="flex gap-0"
          role="toolbar"
          aria-label="Recent colors"
        >
          <button
            v-for="(colorIdx, i) in recentColorsDisplay"
            :key="i"
            type="button"
            class="w-4 h-4 flex-shrink-0 border border-outline-variant/30 hover:ring-1 hover:ring-primary transition-all"
            :style="{ backgroundColor: mircColours[colorIdx] }"
            :title="`Color ${colorIdx}`"
            :aria-label="`Recent color ${colorIdx}`"
            @click="toolbarStore.changeColourFg(colorIdx)"
            @contextmenu.prevent="toolbarStore.changeColourBg(colorIdx)"
          />
          <!-- Empty slots -->
          <div
            v-for="i in (12 - recentColors.length)"
            :key="'empty-' + i"
            class="w-4 h-4 flex-shrink-0 border border-dashed border-outline-variant/20"
          />
        </div>

        <!-- Colour swatches -->
        <div class="flex justify-center">
          <Colours class="w-full" />
        </div>

        <!-- Targeting checkboxes -->
        <div class="flex justify-between px-1">
          <Tooltip content="Ignore Foreground when Editing">
            <label class="flex items-center gap-1 cursor-pointer ab-checkbox-hover">
              <input
                v-model="toolbarStore.toolbarState.targetingFg"
                type="checkbox"
                class="ab-checkbox"
                name="targetingFg"
                :disabled="!canBg && !canText"
              >
              <span class="ab-checkbox-label">FG</span>
            </label>
          </Tooltip>

          <Tooltip
            :content="halfBlockEditing
              ? 'Disabled in half-block editing mode'
              : 'Ignore Background when Editing'"
          >
            <label
              class="flex items-center gap-1 cursor-pointer ab-checkbox-hover"
              :class="{ 'opacity-40': halfBlockEditing }"
            >
              <input
                v-model="toolbarStore.toolbarState.targetingBg"
                type="checkbox"
                class="ab-checkbox"
                name="targetingBg"
                :disabled="halfBlockEditing || (!canFg && !canText)"
              >
              <span class="ab-checkbox-label">BG</span>
            </label>
          </Tooltip>

          <Tooltip
            :content="halfBlockEditing
              ? 'Disabled in half-block editing mode'
              : 'Ignore Characters when Editing'"
          >
            <label
              class="flex items-center gap-1 cursor-pointer ab-checkbox-hover"
              :class="{ 'opacity-40': halfBlockEditing }"
            >
              <input
                v-model="toolbarStore.toolbarState.targetingChar"
                type="checkbox"
                class="ab-checkbox"
                name="targetingChar"
                :disabled="halfBlockEditing || (!canFg && !canBg)"
              >
              <span class="ab-checkbox-label">Text</span>
            </label>
          </Tooltip>
        </div>

        <div
          class="flex w-full gap-xs"
          :class="{ 'opacity-40': halfBlockEditing }"
        >
          <input
            type="number"
            name="width"
            class="ab-input w-1/2"
            v-model="brushSizeWidthInput"
            min="1"
            :max="maxBrushSize"
            :disabled="halfBlockEditing"
            @focus="isInputtingBrushSize = true"
            @blur="isInputtingBrushSize = false"
          >
          <input
            type="number"
            name="height"
            class="ab-input w-1/2"
            v-model="brushSizeHeightInput"
            min="1"
            :max="maxBrushSize"
            :disabled="halfBlockEditing"
            @focus="isInputtingBrushSize = true"
            @blur="isInputtingBrushSize = false"
          >
        </div>

        <div :class="{ 'opacity-40': halfBlockEditing }">
          <select
            class="ab-input w-full"
            v-model="brushSizeTypeInput"
            :disabled="halfBlockEditing"
            @pointerdown.stop
            @mousedown.stop
          >
            <option
              v-for="(label, i) in brushOptions"
              :key="brushKeys[i]"
              :value="brushKeys[i]"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div
          @mouseenter="canDrag = false"
          @mouseleave="canDrag = true"
        >
          <MainBrushCanvas />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePanelDraggable } from '../../composables/usePanelDraggable';
import { maxBrushSize, mircColours99, blockWidth, blockHeight } from '../../ascii';
import type { Block, ToolbarState } from '../../types';
import { useAsciiBirdStore } from '../../store';
import { useToolbarStore } from '../../store/toolbar';
import { usePanelStore } from '../../store/panels';
import {
  getBrushShapeLabels,
  getBrushShapeKeys,
  createBrushBlocks,
} from '../../utils/brushShapes';
import MainBrushCanvas from './MainBrushCanvas.vue';
import Colours from '../Colours.vue';
import PanelHeader from './PanelHeader.vue';
import Tooltip from './Tooltip.vue';

const props = defineProps<{ yOffset?: number }>();
const emit = defineEmits<{
  inputtingbrush: [value: boolean];
}>();

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const store = useAsciiBirdStore();
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);
const snapX = computed(() => blockWidth * store.blockSizeMultiplier);
const snapY = computed(() => blockHeight * store.blockSizeMultiplier);
const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.brushPreview.x,
    y: panelStore.brushPreview.y,
  },
  handle: computed(() => handleRef.value?.headerEl ?? null),
  onBringToFront: () => panelStore.bringToFront('brushPreview'),
  snapX,
  snapY,
});

// Sync drag position back to store for persistence
watch([dragX, dragY], ([newX, newY]) => {
  panelStore.changeBrushPreviewState({
    ...panelStore.brushPreview,
    x: newX,
    y: newY,
  });
});

const canDrag = ref(true);
const brushSizeHeightInput = ref(1);
const brushSizeWidthInput = ref(1);
const brushSizeTypeInput = ref('square');
const isInputtingBrushSize = ref(false);
const blocks = ref<Block[][]>([]);

// Brush options from the registry (labels for display, keys for values)
const brushOptions = getBrushShapeLabels();
const brushKeys = getBrushShapeKeys();

const brushSizeHeight = computed(() => toolbarStore.brushSizeHeight);
const brushSizeWidth = computed(() => toolbarStore.brushSizeWidth);
const brushSizeType = computed(() => toolbarStore.brushSizeType);
const brushBlocks = computed(() => toolbarStore.brushBlocks);
const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const currentChar = computed(() => toolbarStore.currentChar);
const canFg = computed(() => toolbarStore.isTargettingFg);
const canBg = computed(() => toolbarStore.isTargettingBg);
const canText = computed(() => toolbarStore.isTargettingChar);

const mircColours = mircColours99;
const recentColors = computed(() => toolbarStore.recentColors);
const recentColorsDisplay = computed(() => toolbarStore.recentColors.slice(0, 12));
const updateBrush = computed(() => toolbarStore.toolbarState.updateBrush);
const brushPreviewState = computed(() => panelStore.brushPreview);
const halfBlockEditing = computed(() => toolbarStore.toolbarState.halfBlockEditing);

const brushBlocksEmpty = computed(() => brushBlocks.value.length === 0);
const middleY = computed(() => Math.floor(brushSizeHeight.value / 2));
const middleX = computed(() => Math.floor(brushSizeWidth.value / 2));

// Initialization (was created())
brushSizeWidthInput.value = brushSizeWidth.value;
brushSizeHeightInput.value = brushSizeHeight.value;
brushSizeTypeInput.value = brushSizeType.value;
if (brushBlocksEmpty.value) {
  createBlocks();
}

watch(isInputtingBrushSize, (val) => {
  emit('inputtingbrush', val);
});

watch(brushSizeWidth, (val) => {
  brushSizeWidthInput.value = val;
});

watch(brushSizeHeight, (val) => {
  brushSizeHeightInput.value = val;
});

watch(brushSizeType, (val) => {
  brushSizeTypeInput.value = val;
});

watch(brushSizeHeightInput, (val, old) => {
  if (val !== old) createBlocks();
});

watch(brushSizeWidthInput, (val, old) => {
  if (val !== old) createBlocks();
});

watch(brushSizeTypeInput, (val, old) => {
  if (val !== old) createBlocks();
});

watch(canFg, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(canBg, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(canText, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(currentFg, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(currentBg, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(currentChar, (val, old) => {
  if (val !== old && updateBrush.value) createBlocks();
});

watch(brushBlocks, () => {
  toolbarStore.pushBrushHistory(brushBlocks.value);
});

watch(
  () => props.yOffset,
  (val) => {
    if (panelEl.value) {
      panelEl.value.style.top =
        `${Math.trunc(brushPreviewState.value.y + val)}px`;
    }
  },
);

function updateBrushSize() {
  toolbarStore.updateBrushSize({
    brushSizeHeight: brushSizeHeightInput.value,
    brushSizeWidth: brushSizeWidthInput.value,
    brushSizeType: brushSizeTypeInput.value as ToolbarState['brushSizeType'],
  });
}

function createBlocks() {
  updateBrushSize();

  const block: Block = {
    fg: currentFg.value,
    bg: currentBg.value,
    char: currentChar.value,
  };

  blocks.value = createBrushBlocks(
    brushSizeType.value,
    brushSizeWidth.value,
    brushSizeHeight.value,
    block,
  );

  toolbarStore.setBrushBlocks(blocks.value);
}

// Expose internals for testing
defineExpose({
  canDrag,
  blocks,
  brushSizeWidthInput,
  brushSizeHeightInput,
  brushSizeTypeInput,
  isInputtingBrushSize,
  brushOptions,
  brushKeys,
  brushSizeHeight,
  brushSizeWidth,
  brushSizeType,
  brushBlocks,
  brushBlocksEmpty,
  maxBrushSize,
  brushPreviewState,
  updateBrush,
  middleY,
  middleX,
  canFg,
  canBg,
  canText,
  currentFg,
  currentBg,
  currentChar,
  toolbarState: computed(() => toolbarStore.toolbarState),
  halfBlockEditing,
  updateBrushSize,
  createBlocks,
});
</script>
