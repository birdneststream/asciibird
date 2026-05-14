<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-[220px] z-40"
    >
      <PanelHeader
        ref="handleRef"
        title="Brush"
        show-status
      />

      <div class="p-sm flex flex-col gap-xs overflow-y-auto custom-scrollbar">
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

          <Tooltip content="Ignore Background when Editing">
            <label class="flex items-center gap-1 cursor-pointer ab-checkbox-hover">
              <input
                v-model="toolbarStore.toolbarState.targetingBg"
                type="checkbox"
                class="ab-checkbox"
                name="targetingBg"
                :disabled="!canFg && !canText"
              >
              <span class="ab-checkbox-label">BG</span>
            </label>
          </Tooltip>

          <Tooltip content="Ignore Characters when Editing">
            <label class="flex items-center gap-1 cursor-pointer ab-checkbox-hover">
              <input
                v-model="toolbarStore.toolbarState.targetingChar"
                type="checkbox"
                class="ab-checkbox"
                name="targetingChar"
                :disabled="!canFg && !canBg"
              >
              <span class="ab-checkbox-label">Text</span>
            </label>
          </Tooltip>
        </div>

        <div class="flex w-full gap-xs">
          <input
            type="number"
            name="width"
            class="ab-input w-1/2"
            v-model="brushSizeWidthInput"
            min="1"
            :max="maxBrushSize"
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
            @focus="isInputtingBrushSize = true"
            @blur="isInputtingBrushSize = false"
          >
        </div>

        <select
          class="ab-input w-full"
          v-model="brushSizeTypeInput"
        >
          <option
            v-for="opt in brushOptions"
            :key="opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>

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
import { emptyBlock, maxBrushSize } from '../../ascii';
import { useToolbarStore } from '../../store/toolbar';
import { usePanelStore } from '../../store/panels';
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
const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);
const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: {
    x: panelStore.brushPreview.x,
    y: panelStore.brushPreview.y,
  },
  handle: computed(() => handleRef.value?.headerEl ?? null),
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
const blocks = ref<Record<string, unknown>[][]>([]);

const brushOptions = [
  'Square',
  'Circle',
  'Cross',
  'Grid',
  'Inverted Grid',
  'H lines',
  'V lines',
];

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
const updateBrush = computed(() => toolbarStore.toolbarState.updateBrush);
const brushPreviewState = computed(() => panelStore.brushPreview);

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
    brushSizeType: brushSizeTypeInput.value,
  });
}

function createBlocks() {
  updateBrushSize();

  const brushHeight = brushSizeHeight.value;
  const brushWidth = brushSizeWidth.value;
  blocks.value = [];

  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  const block = {
    fg: currentFg.value,
    bg: currentBg.value,
    char: currentChar.value,
  };

  for (y = 0; y < brushHeight; y++) {
    blocks.value[y] = [];
    for (x = 0; x < brushWidth; x++) {
      switch (brushSizeType.value.toLowerCase()) {
        case 'cross':
          if (x === 0 && y === 0) {
            blocks.value[y][x] = { ...block };
            continue;
          }

          blocks.value[y][x] = { ...emptyBlock };

          if (blocks.value[y] && blocks.value[y][x]) {
            if (x % 2 === 0 && y % 2 === 0) {
              blocks.value[y][x] = { ...block };
            }

            if (x % 2 === 1 && y % 2 === 1) {
              blocks.value[y][x] = { ...block };
            }
          }

          break;

        case 'inverted grid':
          if (x === 0 && y === 0) {
            blocks.value[y][x] = { ...block };
            continue;
          }
          if (y % 2 === 0 || x % 2 === 0) {
            blocks.value[y][x] = { ...block };
          } else {
            blocks.value[y][x] = { ...emptyBlock };
          }
          break;

        case 'grid':
          if (x === 0 && y === 0) {
            blocks.value[y][x] = { ...block };
            continue;
          }

          if (x === brushWidth) {
            blocks.value[y][x] = { ...emptyBlock };
          } else {
            blocks.value[y][x] = { ...block };
          }

          targetX = x;

          if (y % 2 === 0) {
            targetX -= 1;
          }

          if (blocks.value[y] && blocks.value[y][targetX]) {
            if (y % 2 === 0 && x % 2 !== 0) {
              blocks.value[y][targetX] = { ...block };
            } else {
              blocks.value[y][targetX] = { ...emptyBlock };
            }
          }

          break;

        case 'h lines':
          if (x === 0 && y === 0) {
            blocks.value[y][x] = { ...block };
            continue;
          }

          if (x === brushWidth) {
            blocks.value[y][x] = { ...emptyBlock };
          } else {
            blocks.value[y][x] = { ...block };
          }

          targetX = x;

          if (y % 2 === 0) {
            targetX -= 1;
          }

          if (blocks.value[y] && blocks.value[y][targetX]) {
            if (y % 2 === 0) {
              if (targetX % 2 === 0) {
                blocks.value[y][targetX] = { ...block };
              }
            } else {
              blocks.value[y][targetX] = { ...emptyBlock };
            }
          }

          break;

        case 'v lines':
          if (x === 0 && y === 0) {
            blocks.value[y][x] = { ...block };
            continue;
          }

          if (x === brushWidth) {
            blocks.value[y][x] = { ...emptyBlock };
          } else {
            blocks.value[y][x] = { ...block };
          }

          targetY = y;

          if (targetY % 2 === 0) {
            targetY -= 1;
          }

          if (blocks.value[targetY] && blocks.value[targetY][x]) {
            if (targetY % 2 === 0) {
              if (x % 2 === 0) {
                blocks.value[targetY][x] = { ...block };
              }
            } else {
              blocks.value[targetY][x] = { ...emptyBlock };
            }
          }

          break;

        case 'square':
          blocks.value[y][x] = { ...block };
          break;

        case 'circle':
          blocks.value[y][x] = { ...emptyBlock };
          break;
      }
    }
  }

  switch (brushSizeType.value.toLowerCase()) {
    case 'circle': {
      let x1 = 0;
      let y1 = 0;

      for (let angle = 0; angle <= 360; angle += 1) {
        const radian = angle * ((Math.PI * 2) / 360);
        x1 = Math.round(
          (brushWidth - 1) * ((Math.cos(radian) + 1.0) / 2.0),
        );
        y1 = Math.round(
          (brushHeight - 1) * ((Math.sin(radian) + 1.0) / 2.0),
        );

        if (blocks.value[y1] && blocks.value[y1][x1]) {
          blocks.value[y1][x1] = { ...block };
        }
      }

      fill();
      break;
    }
  }

  toolbarStore.setBrushBlocks(blocks.value);
}

function fill() {
  fillTool(middleY.value, middleX.value);
}

function fillTool(startY: number, startX: number) {
  const maxY = brushSizeHeight.value;
  const maxX = brushSizeWidth.value;
  if (startY >= maxY || startX >= maxX) return;
  if (!blocks.value[startY] || blocks.value[startY][startX] === undefined) {
    return;
  }

  const targetBg = currentBg.value;
  const startBlock = blocks.value[startY][startX] as Record<string, unknown>;
  if (startBlock.bg === targetBg) return;

  // Iterative flood fill using explicit stack
  const visited = new Set<number>();
  const stack: Array<{ x: number; y: number }> = [
    { x: startX, y: startY },
  ];

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const key = pos.y * maxX + pos.x;

    if (visited.has(key)) continue;
    if (pos.y < 0 || pos.y >= maxY || pos.x < 0 || pos.x >= maxX) continue;

    const row = blocks.value[pos.y];
    if (!row || row[pos.x] === undefined) continue;

    const block = row[pos.x] as Record<string, unknown>;
    if (block.bg === targetBg) continue;

    visited.add(key);
    block.bg = currentBg.value;
    block.fg = currentFg.value;
    block.char = currentChar.value;

    stack.push({ x: pos.x - 1, y: pos.y });
    stack.push({ x: pos.x + 1, y: pos.y });
    stack.push({ x: pos.x, y: pos.y - 1 });
    stack.push({ x: pos.x, y: pos.y + 1 });
  }
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
  updateBrushSize,
  createBlocks,
  fillTool,
});
</script>
