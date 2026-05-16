<template>
  <ABModal
    :open="showModal"
    @close="modalStore.closeModal('border-generator')"
    title="Add Border"
  >
    <div class="space-y-3">
      <!-- Border style selection -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="text-on-surface-variant font-label-mono">
          Style
        </label>
        <select
          v-model="borderStyle"
          class="ab-input"
        >
          <option
            v-for="s in styleOptions"
            :key="s.value"
            :value="s.value"
          >
            {{ s.label }}
          </option>
        </select>
      </div>

      <!-- Custom character input (visible only when style=custom) -->
      <div
        v-if="borderStyle === 'custom'"
        class="grid grid-cols-[120px_1fr] gap-sm items-center"
      >
        <label class="text-on-surface-variant font-label-mono">
          Char
        </label>
        <input
          type="text"
          class="ab-input w-16 text-center"
          v-model="customChar"
          maxlength="1"
        >
      </div>

      <!-- Padding -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="text-on-surface-variant font-label-mono">
          Padding
        </label>
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            v-model.number="padding"
            class="flex-1"
          >
          <span class="text-on-surface-variant font-label-mono w-6 text-center">
            {{ padding }}
          </span>
        </div>
      </div>

      <!-- Expand toggle -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="text-on-surface-variant font-label-mono">
          Mode
        </label>
        <div class="flex gap-2">
          <button
            type="button"
            :class="expandMode
              ? 'ab-button-active'
              : 'ab-button'"
            @click="expandMode = true"
          >
            Expand
          </button>
          <button
            type="button"
            :class="!expandMode
              ? 'ab-button-active'
              : 'ab-button'"
            @click="expandMode = false"
          >
            Overlay
          </button>
        </div>
      </div>

      <!-- Info text -->
      <div class="text-xs text-on-surface-variant/60 font-label-mono mt-2">
        {{ descriptionText }}
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <button
          type="button"
          class="ab-button inline-flex items-center gap-2"
          @click="modalStore.closeModal('border-generator')"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >cancel</span>
          Cancel
        </button>
        <button
          type="button"
          @click.stop="apply"
          :disabled="!canApply"
          class="ab-button inline-flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': !canApply }"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >border_style</span>
          Generate
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ABModal from '../ABModal.vue';
import { useModalStore } from '../../store/modal';
import { useAsciiBirdStore } from '../../store';
import { useToolbarStore } from '../../store/toolbar';
import { useToast } from '../../composables/useToast';
import {
  generateBorder,
  getBorderMinimumSize,
} from '../../utils/borderGenerator';
import type {
  BorderStyle, BorderStyleChars, BorderGeneratorResult,
} from '../../utils/borderGenerator';
import { fillNullBlocks, emptyBlock } from '../../ascii';
import type { Block } from '../../types';

defineOptions({ name: 'BorderGenerator' });

// ─── Pure helper functions for border application ──────────────

interface LayerData { data: Block[][]; width: number; height: number }

/**
 * Copy old layer content into a new larger layer with an offset.
 */
function copyWithOffset(
  layer: LayerData, oldData: Block[][] | undefined,
  newW: number, newH: number, ox: number, oy: number,
): void {
  if (!oldData) return;

  // Clear and copy with offset
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      layer.data[y][x] = { ...emptyBlock };
    }
  }
  for (let sy = 0; sy < Math.min(oldData.length, newH - oy); sy++) {
    const row = oldData[sy];
    const maxSx = Math.min(row?.length ?? 0, newW - ox);
    for (let sx = 0; sx < maxSx; sx++) {
      const src = row?.[sx];
      if (src && (src.fg !== undefined || src.bg !== undefined
        || src.char !== undefined)) {
        layer.data[sy + oy][sx + ox] = { ...src };
      }
    }
  }
}

/**
 * Apply border in expand mode — creates new layers sized to fit
 * the border, copies border into selected layer, offsets other layers.
 */
function applyExpandMode(
  result: BorderGeneratorResult,
  allLayers: LayerData[],
  selectedIdx: number,
): LayerData[] {
  const newW = result.width;
  const newH = result.height;
  const newLayers = fillNullBlocks(newH, newW);

  // Copy border result into the selected layer
  const targetLayer = newLayers[selectedIdx];
  if (targetLayer) {
    for (let y = 0; y < newH; y++) {
      for (let x = 0; x < newW; x++) {
        const src = result.blocks[y]?.[x];
        if (src) targetLayer.data[y][x] = { ...src };
      }
    }
  }

  // For other layers, offset their content
  for (let i = 0; i < newLayers.length; i++) {
    if (i === selectedIdx) continue;
    copyWithOffset(newLayers[i], allLayers[i]?.data, newW, newH,
      result.offsetX, result.offsetY);
  }

  return newLayers;
}

/**
 * Apply border in overlay mode — stamps border blocks over existing
 * content in the current layer.
 */
function applyOverlayMode(
  resultBlocks: Block[][],
  layerBlocks: Block[][],
): void {
  for (let y = 0; y < resultBlocks.length; y++) {
    for (let x = 0; x < resultBlocks[y].length; x++) {
      const src = resultBlocks[y][x];
      const dst = layerBlocks[y]?.[x];
      if (dst && (src.fg !== undefined || src.bg !== undefined
        || src.char !== undefined)) {
        if (src.char !== undefined) dst.char = src.char;
        if (src.fg !== undefined) dst.fg = src.fg;
        if (src.bg !== undefined) dst.bg = src.bg;
      }
    }
  }
}

// ─── Component setup ───────────────────────────────────────────

const modalStore = useModalStore();
const store = useAsciiBirdStore();
const toolbarStore = useToolbarStore();
const { show: toastShow } = useToast();

const showModal = computed(() => modalStore.modalState.borderGenerator);

const styleOptions = [
  { value: 'single', label: 'Single ┌─┐' },
  { value: 'double', label: 'Double ╔═╗' },
  { value: 'rounded', label: 'Rounded ╭─╮' },
  { value: 'block', label: 'Block ▄▀▄' },
  { value: 'thick', label: 'Solid ███' },
  { value: 'hash', label: 'Hash ###' },
  { value: 'star', label: 'Star *~*' },
  { value: 'custom', label: 'Custom' },
];

const borderStyle = ref<BorderStyle>('single');
const padding = ref(0);
const expandMode = ref(true);
const customChar = ref('+');

const currentAscii = computed(() => store.currentAscii);
const currentAsciiLayers = computed(() => store.currentAsciiLayers);
const selectedLayerIndex = computed(
  () => currentAscii.value?.selectedLayer ?? 0,
);
const currentSelectedLayer = computed(
  () => currentAsciiLayers.value[selectedLayerIndex.value],
);

const canvasWidth = computed(() => currentSelectedLayer.value?.width ?? 0);
const canvasHeight = computed(() => currentSelectedLayer.value?.height ?? 0);

const canApply = computed(() => {
  if (!expandMode.value) {
    const { minW, minH } = getBorderMinimumSize(padding.value);
    return canvasWidth.value >= minW && canvasHeight.value >= minH;
  }
  return true;
});

const descriptionText = computed(() => {
  if (expandMode.value) {
    return `Expands canvas to fit border around entire ASCII.`;
  }
  if (!canApply.value) {
    return 'Canvas too small for border with this padding. Reduce padding or use Expand mode.';
  }
  return 'Draws border over existing content within the canvas bounds.';
});

function apply() {
  if (!currentAscii.value || !currentSelectedLayer.value) return;

  const fg = toolbarStore.currentFg;
  const bg = toolbarStore.currentBg;

  // Build custom chars if needed
  let customChars: BorderStyleChars | undefined;
  if (borderStyle.value === 'custom' && customChar.value) {
    const c = customChar.value;
    customChars = { tl: c, t: c, tr: c, l: c, r: c, bl: c, b: c, br: c };
  }

  const layerBlocks = currentSelectedLayer.value.data;
  if (!layerBlocks || layerBlocks.length === 0) return;

  const result = generateBorder({
    blocks: layerBlocks,
    x: 0,
    y: 0,
    w: canvasWidth.value,
    h: canvasHeight.value,
    style: borderStyle.value,
    customChars,
    fg,
    bg,
    padding: padding.value,
    expand: expandMode.value,
  });

  if (expandMode.value) {
    const layers = applyExpandMode(
      result, currentAsciiLayers.value, selectedLayerIndex.value,
    );
    store.changeAsciiWidthHeight({ layers: [...layers] });
    toastShow(`Border added (${result.width}×${result.height})`);
  } else {
    applyOverlayMode(result.blocks, layerBlocks);
    store.updateAsciiBlocks({
      blocks: layerBlocks,
      diff: { l: selectedLayerIndex.value, old: [], new: [] },
    });
    toastShow('Border overlaid on canvas');
  }

  modalStore.closeModal('border-generator');
}

defineExpose({
  showModal,
  borderStyle,
  padding,
  expandMode,
  canApply,
  apply,
});
</script>
