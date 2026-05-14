<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <context-menu
        ref="editorMenu"
        class="z-picker"
      >
        <ul>
          <li
            @click="canvasToPng()"
            class="ab-context-menu-item"
          >
            Save as PNG
          </li>
          <li
            @click="startExport('clipboard')"
            class="ab-context-menu-item"
          >
            Export ASCII to mIRC Clipboard
          </li>
          <li
            @click="startExport('file')"
            class="ab-context-menu-item"
          >
            Export ASCII to mIRC File
          </li>
          <template v-if="isSelected && isSelecting">
            <li class="ab-context-menu-separator" />
            <li
              @click="applySelectionTransform('rotate-cw')"
              class="ab-context-menu-item"
            >
              Rotate 90° CW
              <span class="ab-shortcut">Ctrl+Shift+&gt;</span>
            </li>
            <li
              @click="applySelectionTransform('rotate-ccw')"
              class="ab-context-menu-item"
            >
              Rotate 90° CCW
              <span class="ab-shortcut">Ctrl+Shift+&lt;</span>
            </li>
            <li
              @click="applySelectionTransform('flip-h')"
              class="ab-context-menu-item"
            >
              Flip Horizontal
              <span class="ab-shortcut">Ctrl+Shift+H</span>
            </li>
            <li
              @click="applySelectionTransform('flip-v')"
              class="ab-context-menu-item"
            >
              Flip Vertical
              <span class="ab-shortcut">Ctrl+Shift+X</span>
            </li>
            <li class="ab-context-menu-separator" />
            <li
              @click="contextMenuReplaceColor()"
              class="ab-context-menu-item"
            >
              Replace Color in Selection
              <span class="ab-shortcut">R</span>
            </li>
          </template>
          <li class="ab-context-menu-separator" />
          <li
            @click="openBorderGenerator()"
            class="ab-context-menu-item"
          >
            Add Border...
          </li>
        </ul>
      </context-menu>

      <div
        ref="editorPanel"
        :style="panelStyle"
        @pointerdown="canvasPanel.onDragPointerDown"
      >
        <canvas
          id="overlay-image"
          :style="imageOverlayStyle"
          :width="currentAsciiWidth * blockWidthComp"
          :height="currentAsciiHeight * blockHeightComp"
        />

        <canvas
          ref="canvasRef"
          id="canvas"
          class="canvas"
          :style="canvasTransparent"
          :width="currentAsciiWidth * blockWidthComp"
          :height="currentAsciiHeight * blockHeightComp"
        />

        <canvas
          ref="canvastoolsRef"
          id="canvastools"
          class="canvastools"
          :width="currentAsciiWidth * blockWidthComp"
          :height="currentAsciiHeight * blockHeightComp"
          @mousemove="canvasMouseMove"
          @mousedown.left="canvasMouseDown"
          @mouseup.left="canvasMouseUp"
          @mouseup.right="openContextMenu"
          @touchmove="canvasMouseMove"
          @touchend="canvasMouseUp"
          @touchstart="canvasMouseDown"
        />

        <!-- Resize handles — visible only with default tool -->
        <template v-if="isDefault">
          <div
            class="ab-resize-handle ab-resize-handle-tl"
            @pointerdown.stop="canvasPanel.startResize('tl')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-tm"
            @pointerdown.stop="canvasPanel.startResize('tm')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-tr"
            @pointerdown.stop="canvasPanel.startResize('tr')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-ml"
            @pointerdown.stop="canvasPanel.startResize('ml')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-mr"
            @pointerdown.stop="canvasPanel.startResize('mr')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-bl"
            @pointerdown.stop="canvasPanel.startResize('bl')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-bm"
            @pointerdown.stop="canvasPanel.startResize('bm')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-br"
            @pointerdown.stop="canvasPanel.startResize('br')($event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAsciiBirdStore } from '../store';
import { usePanelStore } from '../store/panels';
import { useToolbarStore } from '../store/toolbar';
import { useModalStore } from '../store/modal';
import { useToast } from '../composables/useToast';
import { useCanvasPanel } from '../composables/useCanvasPanel';
import { useMainCanvasRenderer } from '../composables/useMainCanvasRenderer';
import { useExportAscii } from '../composables/useExportAscii';
import { useFpsThrottle } from '../composables/useFpsThrottle';
import { useSelectionTransform } from '../composables/useSelectionTransform';
import { useColorReplace } from '../composables/useColorReplace';
import { useGradientTool } from '../composables/useGradientTool';
import { useMatchHighlight } from '../composables/useMatchHighlight';
import hotkeys from 'hotkeys-js';

import ContextMenu from '../components/parts/ContextMenu.vue';

import {
  toolbarIcons,
  mircColours99,
  filterNullBlocks,
  blockWidth,
  blockHeight,
  maxBrushSize,
  fillNullBlocks,
  getBlocksWidth,
  checkVisible,
  mergeLayers,
  canvasToPng as canvasToPngUtil,
  cyrb53,
  emptyBlock,
  isEmptyBlock,
  eraseBlockProperties,
  iterativeFill,
  iterativeFillHalfBlock,
} from '../ascii';

import { getMirrorPositions, applyMirrored, applyMirroredHalfBlock } from '../utils/mirror';
import { bresenhamLine } from '../utils/bresenham';
import { storeDiffBlocks as storeDiffBlockFn } from '../utils/diffBlocks';
import { getCanvasFont } from '../utils/canvasFont';
import { HalfBlockGrid } from '../utils/halfBlockGrid';
import type { DiffBlocks } from '../utils/diffBlocks';
import type { Block } from '../types';
import type { TransformType } from '../utils/transformBlocks';

defineOptions({ name: 'Editor' });

// ─── Props & Emits ──────────────────────────────────────────────
const props = withDefaults(defineProps<{
  updateCanvas?: boolean;
  yOffset?: number;
  resetSelect?: boolean;
}>(), {
  updateCanvas: false,
  yOffset: 0,
  resetSelect: false,
});

const emit = defineEmits<{
  coordsupdate: [value: { x: number; y: number }];
  selectedblocks: [value: Block[][]];
  selecting: [value: {
    startX: number | null;
    startY: number | null;
    endX: number | null;
    endY: number | null;
    canSelect: boolean;
  }];
  textediting: [value: {
    startX: number | null;
    startY: number | null;
  }];
}>();

// ─── Store & Composables ────────────────────────────────────────
const store = useAsciiBirdStore();
const panelStore = usePanelStore();
const toolbarStore = useToolbarStore();
const modalStore = useModalStore();
const { show: toastShow } = useToast();
const { renderBlock, clearMainCanvas } = useMainCanvasRenderer();
const { startExport } = useExportAscii({
  checkLimits: true,
  label: 'mIRC',
});
const {
  replaceColorSource,
  isReplacePicking,
  pickSource,
  applyReplace,
  resetReplace,
  contextMenuReplace,
} = useColorReplace();

// ─── Match Highlight (Find & Replace) ──────────────────────────
const { drawHighlights: drawMatchHighlights } = useMatchHighlight();

// ─── Template Refs ──────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvastoolsRef = ref<HTMLCanvasElement | null>(null);
const editorMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const editorPanel = ref<HTMLElement | null>(null);

// ─── Canvas Contexts (NOT reactive — performance critical) ──────
let ctx: CanvasRenderingContext2D | null = null;
let toolCtx: CanvasRenderingContext2D | null = null;

// ─── FPS-Throttled Redraw ─────────────────────────────────────────
// (useFpsThrottle handles its own timer cleanup on unmount)

// ─── Reactive State ─────────────────────────────────────────────
const canvasSize = reactive({ width: 512, height: 512 });
const x = ref(0);
const y = ref(0);
const isTopHalf = ref(true);
const top = ref<number | false>(false);
const canTool = ref(false);
const textEditing = ref<{ startX: number | null; startY: number | null }>({
  startX: null,
  startY: null,
});
const selecting = ref({
  startX: null as number | null,
  startY: null as number | null,
  endX: null as number | null,
  endY: null as number | null,
  canSelect: false,
});
const isMouseOnCanvas = ref(false);
const selectedBlocks = ref<Block[][]>([]);
const diffBlocks = reactive<DiffBlocks>({
  l: 0,
  old: [],
  new: [],
});
const canvasHash = ref<number | null>(null);
const lastBrushX = ref(-1);
const lastBrushY = ref(-1);

// ─── Computed ───────────────────────────────────────────────────
const blockSizeMultiplier = computed(() => store.blockSizeMultiplier);
const blockWidthComp = computed(() => blockWidth * blockSizeMultiplier.value);
const blockHeightComp = computed(() => blockHeight * blockSizeMultiplier.value);

const currentAscii = computed(() => store.currentAscii);
const currentAsciiLayers = computed(() => store.currentAsciiLayers);
const selectedLayerIndex = computed(
  () => currentAscii.value.selectedLayer || 0,
);
const currentSelectedLayer = computed(
  () => currentAsciiLayers.value[selectedLayerIndex.value] || [],
);
const currentAsciiLayerBlocks = computed(
  () => currentSelectedLayer.value.data,
);

const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);
const canFg = computed(() => toolbarStore.isTargettingFg);
const canBg = computed(() => toolbarStore.isTargettingBg);
const canText = computed(() => toolbarStore.isTargettingChar);
const currentFg = computed(() => toolbarStore.currentFg);
const currentBg = computed(() => toolbarStore.currentBg);
const currentChar = computed(() => toolbarStore.currentChar);

const isTextEditing = computed(() => currentTool.value.name === 'text');
const isEraserFill = computed(() => currentTool.value.name === 'fill-eraser');
const isFill = computed(() => currentTool.value.name === 'fill');
const isTextEditingValues = computed(
  () => textEditing.value.startX !== null && textEditing.value.startY !== null,
);
const isSelecting = computed(() => currentTool.value.name === 'select');
const isDefault = computed(() => currentTool.value.name === 'default');
const isBrushing = computed(() => currentTool.value.name === 'brush');
const isErasing = computed(() => currentTool.value.name === 'eraser');
const isSelected = computed(
  () =>
    selecting.value.startX !== null &&
    selecting.value.startY !== null &&
    selecting.value.endX !== null &&
    selecting.value.endY !== null,
);

const brushBlocks = computed(() => toolbarStore.brushBlocks);
const canvasX = computed(() => x.value * blockWidthComp.value);
const canvasY = computed(() => y.value * blockHeightComp.value);
const toolbarState = computed(() => toolbarStore.toolbarState);
const mirrorX = computed(() => toolbarState.value.mirrorX);
const mirrorY = computed(() => toolbarState.value.mirrorY);
const debugPanelState = computed(() => panelStore.debugPanel);
const selectBlocks = computed(() => toolbarStore.selectBlocks);
const options = computed(() => store.options);
const haveSelectBlocks = computed(() => !!selectBlocks.value.length);
const brushLibraryState = computed(() => panelStore.brushLibrary);
const gridView = computed(() => toolbarState.value.gridView);
const halfBlockEditing = computed(() => toolbarState.value.halfBlockEditing);

// ─── FPS-Throttled Canvas Redraw ─────────────────────────────────
// redrawCanvas is a hoisted async function declaration — safe to
// reference directly before the definition appears in source order.
const { scheduleRedraw: delayRedrawCanvas, cancelRedraw } = useFpsThrottle(
  redrawCanvas,
  () => options.value.fps,
);

const asciiBlockAtXy = computed(() => {
  return currentAsciiLayerBlocks.value[y.value] &&
    currentAsciiLayerBlocks.value[y.value][x.value]
    ? currentAsciiLayerBlocks.value[y.value][x.value]
    : false;
});

const currentAsciiWidth = computed(
  () => currentSelectedLayer.value.width,
);
const currentAsciiHeight = computed(() =>
  currentSelectedLayer.value.height > 2184
    ? 2184
    : currentSelectedLayer.value.height,
);

// ─── Gradient Tool ────────────────────────────────────────────────
// Must be after currentAsciiLayerBlocks/Width/Height computed definitions.
const {
  gradientStart,
  isGradientPicking,
  setStartPoint,
  applyGradient,
  cancelGradient,
} = useGradientTool({
  currentAsciiLayerBlocks,
  currentAsciiWidth,
  currentAsciiHeight,
  recordDiff,
});

// ─── Selection Transform ─────────────────────────────────────────
// useSelectionTransform provides rotate/flip operations on the
// selected area. It references hoisted function declarations.
const selectionTransform = useSelectionTransform({
  selecting,
  selectedBlocks,
  blockWidthComp,
  blockHeightComp,
  currentAsciiWidth,
  currentAsciiHeight,
  currentAsciiLayerBlocks,
  selectedLayerIndex,
  updateAsciiBlocks: store.updateAsciiBlocks.bind(store),
  setSelectBlocks: toolbarStore.setSelectBlocks.bind(toolbarStore),
  redrawCanvas: async () => { await delayRedrawCanvas(true); },
  clearToolCanvas,
  redrawSelect,
});

/** Apply a transform to the current selection (context menu + shortcuts) */
async function applySelectionTransform(type: TransformType) {
  await selectionTransform.applyTransform(type);
}

const imageOverlay = computed(() => store.imageOverlay);

const imageOverlayStyle = computed(() => {
  const overlay = imageOverlay.value;
  let repeat = 'background-repeat: no-repeat;';
  let stretched = 'background-size: 100%;';
  const left = `left: ${overlay.left}%;`;
  const topVal = `top: ${overlay.top}%;`;

  if (overlay.repeatx && overlay.repeaty) {
    repeat = 'background-repeat: repeat;';
  }
  if (overlay.repeatx && !overlay.repeaty) {
    repeat = 'background-repeat: repeat-x;';
  }
  if (!overlay.repeatx && overlay.repeaty) {
    repeat = 'background-repeat: repeat-y;';
  }

  if (overlay.stretched) {
    stretched = 'background-size: 100%;';
  } else {
    stretched = `background-size: ${overlay.size}%;`;
  }

  return overlay.visible
    ? `background-image: url('${overlay.url}'); ${stretched} ${repeat} ${left} ${topVal} opacity: ${overlay.opacity / 100}; z-index: -1; position: absolute;`
    : 'position: absolute;';
});

const canvasTransparent = computed(() =>
  imageOverlay.value.visible
    ? `opacity: ${imageOverlay.value.asciiOpacity / 100};`
    : 'opacity: 1;',
);

// ─── Canvas Panel (Drag + Resize with snap-to-grid) ─────────────
const canvasPanel = useCanvasPanel({
  snapX: blockWidthComp,
  snapY: blockHeightComp,
  disabled: computed(() => !isDefault.value),
  initialX: currentAscii.value?.x ?? 0,
  initialY: currentAscii.value?.y ?? 0,
  initialWidth: currentAsciiWidth.value * blockWidthComp.value,
  initialHeight: currentAsciiHeight.value * blockHeightComp.value,
  onDragMove: (_dx: number, dy: number) => {
    top.value = dy;
  },
  onDragStop: async (dx: number, dy: number) => {
    top.value = dy;
    store.changeAsciiCanvasState({ x: dx, y: dy });
    await delayRedrawCanvas();
  },
  onResizeStop: async (
    left: number,
    topVal: number,
    width: number,
    height: number,
  ) => {
    const canvasBlockHeight = Math.floor(
      height / blockHeightComp.value,
    );
    const canvasBlockWidth = Math.floor(
      width / blockWidthComp.value,
    );
    const layers = fillNullBlocks(canvasBlockHeight, canvasBlockWidth);

    top.value = topVal;
    canvasSize.width = width;
    canvasSize.height = height;

    store.changeAsciiCanvasState({ x: left, y: topVal });
    store.changeAsciiWidthHeight({ layers: [...layers] });

    toastShow(`${canvasBlockWidth} x ${canvasBlockHeight}`);
    await delayRedrawCanvas(true);
  },
});

const panelStyle = computed(() => canvasPanel.style.value);

// ─── Watchers ───────────────────────────────────────────────────
watch(currentAsciiHeight, (val) => {
  canvasSize.height = val * blockHeightComp.value;
});

watch(currentAsciiWidth, (val) => {
  canvasSize.width = val * blockWidthComp.value;
});

// Watch tab index for tab switches — resets panel position from stored x/y.
// Canvas redraws are handled by currentAsciiLayerBlocks watcher (L410).
// Canvas resize is handled by currentAsciiWidth/currentAsciiHeight watchers (L376-382).
watch(() => store.tab, (newTab) => {
    const meta = store.asciibirdMeta[newTab];
    if (!meta) return;

    canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
    canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;

    canvasPanel.setPosition(meta.x ?? 0, meta.y ?? 0);
    canvasPanel.setDimensions(
      currentAsciiWidth.value * blockWidthComp.value,
      currentAsciiHeight.value * blockHeightComp.value,
    );
  });

watch(() => props.resetSelect, () => {
  resetSelectTool();
});

watch(currentSelectedLayer, (val) => {
  if (val && val.visible) {
    warnInvisibleLayer();
  }
});

watch(currentAsciiLayerBlocks, async () => {
  await delayRedrawCanvas();
});

// Re-layout canvas when zoom multiplier changes
watch(blockSizeMultiplier, () => {
  canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
  canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;
  canvasPanel.setDimensions(
    currentAsciiWidth.value * blockWidthComp.value,
    currentAsciiHeight.value * blockHeightComp.value,
  );
  delayRedrawCanvas(true);
});

watch(currentTool, async () => {
  warnInvisibleLayer();

  // Half-block mode: block text, select, and gradient tools
  if (halfBlockEditing.value) {
    if (currentTool.value.name === 'text') {
      toastShow('Text mode is not available in half-block editing mode');
      toolbarStore.changeTool(0);
      return;
    }
    if (currentTool.value.name === 'select') {
      toastShow('Selection is not available in half-block editing mode');
      toolbarStore.changeTool(0);
      return;
    }
    if (currentTool.value.name === 'gradient') {
      toastShow('Gradient fill is not available in half-block editing mode');
      toolbarStore.changeTool(0);
      return;
    }
  }

  switch (currentTool.value.name) {
    case 'default':
      textEditing.value.startX = null;
      textEditing.value.startY = null;
      resetSelectTool();
      await clearToolCanvas();
      break;

    case 'text':
      textEditing.value.startX = x.value;
      textEditing.value.startY = y.value;
      break;
  }
});

watch(isMouseOnCanvas, async (val, old) => {
  if (val !== old) {
    if (!isSelecting.value) {
      await clearToolCanvas();
      await dispatchBlocks(true);
      canTool.value = false;
      await delayRedrawCanvas();
    }
  }
});

watch(gridView, async (val, old) => {
  if (val !== old) {
    await clearToolCanvas();
  }
});

watch(brushBlocks, async () => {
  await clearToolCanvas();
  if (isMouseOnCanvas.value && isBrushing.value) {
    await drawBrush();
  }
});

watch(isTextEditing, async (val) => {
  if (val === false) {
    await dispatchBlocks(true);
  }
});

watch(textEditing, (val) => {
  emit('textediting', val);
}, { deep: true });

watch(() => props.updateCanvas, async () => {
  await clearToolCanvas();
  await drawTextIndicator();
  await drawIndicator();
  await delayRedrawCanvas();
});

watch(selecting, (val) => {
  emit('selecting', val);
}, { deep: true });

watch(() => props.yOffset, async () => {
  await delayRedrawCanvas(true);
});

watch(selectedLayerIndex, (val, old) => {
  if (val !== old) {
    diffBlocks.l = val;
  }
});

watch(currentAsciiLayers, async () => {
  await delayRedrawCanvas(true);
});

watch(halfBlockEditing, async (active) => {
  if (active) {
    // Entering half-block mode — enforce constraints

    // Force brush to 1×1
    toolbarStore.updateBrushSize({
      brushSizeWidth: 1,
      brushSizeHeight: 1,
      brushSizeType: 'square',
    });

    // If text tool is active, switch to default
    if (currentTool.value.name === 'text') {
      toolbarStore.changeTool(0);
      textEditing.value.startX = null;
      textEditing.value.startY = null;
    }

    // If select tool is active, reset selection and switch to default
    if (currentTool.value.name === 'select') {
      toolbarStore.changeTool(0);
      resetSelectTool();
    }

    // Ensure FG targeting is on
    if (!canFg.value) {
      toolbarStore.changeTargetingFg(true);
    }
  }

  if (gridView.value) {
    await clearToolCanvas();
    drawGrid();
  }
});

// ─── Hotkeys (register + cleanup) ──────────────────────────────
hotkeys('*', 'editor', async function (event) {
  event.preventDefault();

  if (isTextEditing.value) {
    await canvasKeyDown(event.key);
    return;
  }

  // Shift+Arrow: nudge selection by 1 block
  if (
    event.shiftKey &&
    isSelected.value &&
    selectedBlocks.value.length > 0
  ) {
    switch (event.key) {
      case 'ArrowUp':
        await selectionTransform.applyNudge(0, -1);
        return;
      case 'ArrowDown':
        await selectionTransform.applyNudge(0, 1);
        return;
      case 'ArrowLeft':
        await selectionTransform.applyNudge(-1, 0);
        return;
      case 'ArrowRight':
        await selectionTransform.applyNudge(1, 0);
        return;
    }
  }

  // Escape: cancel replace-color pick state
  if (event.key === 'Escape' && isReplacePicking.value) {
    resetReplace();
    return;
  }

  // Escape: cancel gradient pick state
  if (event.key === 'Escape' && isGradientPicking.value) {
    cancelGradient();
    await clearToolCanvas();
    return;
  }

  if (isBrushing.value || isErasing.value) {
    switch (event.key) {
      case 'ArrowUp':
        y.value--;
        await drawBrush(isErasing.value);
        break;
      case 'ArrowDown':
        y.value++;
        await drawBrush(isErasing.value);
        break;
      case 'ArrowLeft':
        x.value--;
        await drawBrush(isErasing.value);
        break;
      case 'ArrowRight':
        x.value++;
        await drawBrush(isErasing.value);
        break;
      case ' ':
        canTool.value = true;
        if (isBrushing.value) {
          await drawBrush(false);
        } else {
          await eraser();
        }
        canTool.value = false;
        await dispatchBlocks(true);
        break;
    }
  }
});

// ─── Lifecycle ──────────────────────────────────────────────────
// Ctrl+Scroll zoom handler — hoisted to setup scope for cleanup
let wheelHandler: ((e: WheelEvent) => void) | null = null;

// Selection transform event handler
let selectionTransformHandler: ((e: Event) => void) | null = null;

// Scroll-to handler for Find & Replace navigation
let scrollToHandler: ((e: Event) => void) | null = null;

onMounted(async () => {
  const canvas = canvasRef.value;
  if (canvas) {
    // willReadFrequently: canvas reset pattern (canvas.width = canvas.width)
    // triggers implicit readback; hint avoids repeated Chrome warnings.
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.font = getCanvasFont(store.blockSizeMultiplier);
  }
  const tools = canvastoolsRef.value;
  if (tools) {
    // willReadFrequently: tools canvas also uses width-reset clear pattern.
    toolCtx = tools.getContext('2d', { willReadFrequently: true });
  }

  // Ctrl+Scroll zoom — passive:false needed to preventDefault browser zoom
  wheelHandler = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      store.setBlockMultiplier(store.blockSizeMultiplier + delta);
    }
  };
  editorPanel.value?.addEventListener('wheel', wheelHandler, { passive: false });

  // Selection transform shortcuts (dispatched from useGlobalShortcuts)
  selectionTransformHandler = (e: Event) => {
    const type = (e as CustomEvent).detail as TransformType;
    if (isSelecting.value && isSelected.value) {
      applySelectionTransform(type);
    }
  };
  window.addEventListener(
    'asciibird:selection-transform',
    selectionTransformHandler,
  );

  // Find & Replace scroll-to handler
  scrollToHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail.x !== undefined && detail.y !== undefined) {
      x.value = detail.x;
      y.value = detail.y;
      delayRedrawCanvas();
    }
  };
  window.addEventListener('asciibird:scroll-to', scrollToHandler);

  await delayRedrawCanvas();
});

onUnmounted(() => {
  hotkeys.unbind('*', 'editor');
  canvasPanel.cleanup();
  cancelRedraw();
  if (wheelHandler) {
    editorPanel.value?.removeEventListener('wheel', wheelHandler);
    wheelHandler = null;
  }
  if (selectionTransformHandler) {
    window.removeEventListener(
      'asciibird:selection-transform',
      selectionTransformHandler,
    );
    selectionTransformHandler = null;
  }
  if (scrollToHandler) {
    window.removeEventListener('asciibird:scroll-to', scrollToHandler);
    scrollToHandler = null;
  }
});

// ─── Init (equivalent to created() — runs during setup) ─────────
if (currentAsciiLayerBlocks.value) {
  canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
  canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;
  // delayRedrawCanvas will be called in onMounted
}

// ─── Methods ────────────────────────────────────────────────────
// startExport is provided by useExportAscii composable

function canvasToPng() {
  const canvas = canvasRef.value;
  if (canvas) {
    canvasToPngUtil(canvas, currentAscii.value.title);
  }
}

 function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  editorMenu.value?.open({ clientX: e.clientX, clientY: e.clientY });
 }

 /**
  * Context menu "Replace Color in Selection" handler.
  * Uses the block under cursor as source, current FG/BG as target,
  * scoped to the current selection bounds.
  */
 function contextMenuReplaceColor() {
   const block = asciiBlockAtXy.value;
   if (!block) return;
   const bounds = getSelectionBounds();
   if (bounds) {
     contextMenuReplace(block, bounds);
   } else {
     contextMenuReplace(block);
   }
 }

 /** Open the border generator modal from context menu */
 function openBorderGenerator() {
   modalStore.openModal('border-generator');
 }

async function canvasKeyDown(char: string) {
  const rawX = textEditing.value.startX;
  const rawY = textEditing.value.startY;
  if (rawX === null || rawY === null) return;

  let sx = rawX;
  let sy = rawY;

  const data = currentAsciiLayerBlocks.value;
  if (data[sy] && data[sy][sx]) {
    let targetBlock = data[sy][sx];
    let oldBlock: Block = {};

    switch (char) {
      case 'Backspace':
        if (data[sy][sx - 1]) {
          targetBlock = data[sy][sx - 1];

          oldBlock = { ...targetBlock };

          delete data[sy][sx - 1]['char'];

          recordDiff(sx, sy, oldBlock, data[sy][sx - 1]);

          sx -= 1;
        }

      // eslint-disable-next-line no-fallthrough
      case 'Delete':
        if (data[sy][sx]) {
          targetBlock = data[sy][sx];

          oldBlock = { ...targetBlock };

          delete data[sy][sx]['char'];

          recordDiff(sx, sy, oldBlock, targetBlock);
        }

        applyMirrored(
          sx, sy,
          currentAsciiWidth.value, currentAsciiHeight.value,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            const block = data[my]?.[mx];
            if (!block) return;
            oldBlock = { ...block };
            delete block['char'];
            recordDiff(mx, my, oldBlock, block);
          },
        );

        break;

      case 'Enter':
        if (data[sy + 1]?.[0]) {
          sx = 0;
          sy += 1;
        }
        break;

      case 'ArrowUp':
        if (data[sy - 1]?.[sx]) {
          sy -= 1;
        }
        break;

      case 'ArrowDown':
        if (data[sy + 1]?.[sx]) {
          sy += 1;
        }
        break;

      case 'ArrowLeft':
        if (data[sy]?.[sx - 1]) {
          sx -= 1;
        }
        break;

      case 'ArrowRight':
        if (data[sy]?.[sx + 1]) {
          sx += 1;
        }
        break;

      default:
        if (char.length === 1) {
          oldBlock = { ...targetBlock };
          targetBlock.char = char;

          if (canFg.value) {
            targetBlock.fg = currentFg.value;
          }

          recordDiff(sx, sy, oldBlock, targetBlock);

          applyMirrored(
            sx, sy,
            currentAsciiWidth.value, currentAsciiHeight.value,
            mirrorX.value, mirrorY.value,
            (mx, my) => {
              const block = data[my]?.[mx];
              if (!block) return;
              oldBlock = { ...block };
              if (canFg.value) {
                block.fg = currentFg.value;
              }
              block.char = char;
              recordDiff(mx, my, oldBlock, block);
            },
          );

          if (data[sy]?.[sx + 1]) {
            sx += 1;
          } else {
            sx = 0;

            if (sy < currentAsciiHeight.value) {
              sy += 1;
            }
          }
        }

        break;
    }
  }

  textEditing.value.startX = sx;
  textEditing.value.startY = sy;

  await clearToolCanvas();
  await drawTextIndicator();
  await drawIndicator();
  await delayRedrawCanvas();
}

function warnInvisibleLayer() {
  if (!currentSelectedLayer.value.visible) {
    toastShow('You are trying to edit an invisible layer!!', {
      type: 'error',
      icon: 'warning_amber',
      singleton: true,
    });
  }
}

function checkVisibleFn(topVal: number) {
  return checkVisible(topVal, topVal - blockHeightComp.value);
}

function undo() {
  store.undoBlocks();
}

function redo() {
  store.redoBlocks();
}

async function resetSelectTool() {
  selecting.value.startX = null;
  selecting.value.startY = null;
  selecting.value.endX = null;
  selecting.value.endY = null;
  selecting.value.canSelect = false;

  selectedBlocks.value = [];
  await clearToolCanvas();
  await delayRedrawCanvas();
  emit('selecting', selecting.value);
}

async function redrawSelect() {
  if (currentAsciiLayerBlocks.value.length && isSelected.value && toolCtx) {
    await clearToolCanvas();
    toolCtx.fillStyle = mircColours99[0];

    toolCtx.fillRect(
      selecting.value.startX!,
      selecting.value.startY!,
      selecting.value.endX! - selecting.value.startX!,
      selecting.value.endY! - selecting.value.startY!,
    );

    toolCtx.setLineDash([6]);
    toolCtx.strokeRect(
      selecting.value.startX!,
      selecting.value.startY!,
      selecting.value.endX! - selecting.value.startX!,
      selecting.value.endY! - selecting.value.startY!,
    );
  }
}

function mergeLayersFn() {
  return mergeLayers();
}

function drawGrid() {
  if (!toolCtx) return;
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;
  const w = canvasSize.width;
  const h = canvasSize.height;

  toolCtx.beginPath();

  for (let gx = 1; gx <= w; gx += bw) {
    toolCtx.moveTo(gx, 0);
    toolCtx.lineTo(gx, h);
  }

  toolCtx.strokeStyle = 'rgba(40, 40, 40, 1)';
  toolCtx.lineWidth = 1;
  toolCtx.setLineDash([1]);

  toolCtx.stroke();

  toolCtx.beginPath();
  for (let gy = 1; gy <= h; gy += halfBlockEditing.value ? (bh / 2) : bh) {
    toolCtx.moveTo(0, gy);
    toolCtx.lineTo(w, gy);
  }

  toolCtx.stroke();
}

async function redrawCanvas(force = false) {
  if (!ctx) return;
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;

  if (currentAsciiLayers.value.length) {
    let cx = 0;
    let cy = 0;
    let canvasXVal = 0;
    let canvasYVal = 0;
    let curBlock = {} as Block;

    if (
      diffBlocks.new.length &&
      !canTool.value &&
      !isTextEditing.value &&
      !isFill.value &&
      !isBrushing.value
    ) {
      outer: for (const i in diffBlocks.new) {
        const entry = diffBlocks.new[i];
        canvasXVal = bw * entry.x;
        canvasYVal = bh * entry.y;
        curBlock = { ...entry.b };

        for (
          let j = currentAsciiLayers.value.length - 1;
          j >= diffBlocks.l;
          j--
        ) {
          const layer = currentAsciiLayers.value[j];
          if (layer.data[entry.y][entry.x] && j !== diffBlocks.l) {
            continue outer;
          }
        }

        renderBlock(
          ctx,
          curBlock,
          canvasXVal,
          canvasYVal,
          bw,
          bh,
          mircColours99,
          {
            canBg: canBg.value,
            canFg: canFg.value,
            canText: canText.value,
            fallbackChar:
              currentAsciiLayerBlocks.value[entry.y][entry.x].char || ' ',
          },
        );
      }

      diffBlocks.l = selectedLayerIndex.value;
      diffBlocks.new = [];
      diffBlocks.old = [];

      canvasHash.value = cyrb53(JSON.stringify(mergeLayersFn()));
    } else {
      const merged = mergeLayersFn();
      const tempHash = cyrb53(JSON.stringify(merged));

      if (tempHash === canvasHash.value && !force) {
        return;
      }

      canvasHash.value = tempHash;
      clearMainCanvas(ctx, canvasRef.value, canvasSize.width, canvasSize.height, blockSizeMultiplier.value);

      for (cy = 0; cy < currentAsciiHeight.value + 1; cy++) {
        canvasYVal = bh * cy;

        if (
          options.value.renderOffScreen &&
          top.value !== false &&
          !checkVisibleFn(top.value + canvasYVal - props.yOffset!)
        ) {
          continue;
        }

        for (cx = 0; cx < currentAsciiWidth.value + 1; cx++) {
          canvasXVal = bw * cx;

          curBlock = { ...merged[cy][cx] };

          renderBlock(
            ctx,
            curBlock,
            canvasXVal,
            canvasYVal,
            bw,
            bh,
            mircColours99,
          );
        }
      }
    }
  }

  // Draw Find & Replace match highlights on the tool canvas
  if (toolCtx && canvastoolsRef.value) {
    drawMatchHighlights(
      toolCtx,
      0,
      0,
      canvastoolsRef.value.width,
      canvastoolsRef.value.height,
      bw,
      bh,
    );
  }
}

async function dispatchBlocks(clearDiff = false) {
  diffBlocks.old = diffBlocks.old.flat();
  diffBlocks.new = diffBlocks.new.flat();

  // Record colors used for the recent colors strip
  if (diffBlocks.new.length > 0) {
    const fg = toolbarStore.currentFg;
    const bg = toolbarStore.currentBg;
    toolbarStore.addRecentColor(fg);
    if (bg !== fg) {
      toolbarStore.addRecentColor(bg);
    }
  }

  store.updateAsciiBlocks({
    blocks: currentAsciiLayerBlocks.value,
    diff: { ...diffBlocks },
  });

  if (clearDiff) {
    diffBlocks.l = selectedLayerIndex.value;
    diffBlocks.new = [];
    diffBlocks.old = [];
  }
}

async function canvasMouseUp() {
  if (isDefault.value) return;

  switch (currentTool.value.name) {
    case 'brush':
    case 'eraser':
      canTool.value = false;
      lastBrushX.value = -1;
      lastBrushY.value = -1;
      await dispatchBlocks(true);
      break;

    case 'fill-eraser':
    case 'fill':
      canTool.value = false;
      break;

    case 'select':
      selecting.value.canSelect = false;
      await processSelect();
      break;

    case 'text':
      textEditing.value.startX = x.value;
      textEditing.value.startY = y.value;
      break;
  }
}

/**
 * Get the current selection bounds as grid coordinates {x, y, w, h}.
 * Returns null if no valid selection exists.
 */
function getSelectionBounds(): { x: number; y: number; w: number; h: number } | null {
  if (!isSelected.value || !isSelecting.value) return null;

  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;

  const startX = Math.floor(selecting.value.startX! / bw);
  const startY = Math.floor(selecting.value.startY! / bh);
  const endX = Math.ceil(selecting.value.endX! / bw);
  const endY = Math.ceil(selecting.value.endY! / bh);

  const x1 = Math.max(0, Math.min(startX, endX));
  const y1 = Math.max(0, Math.min(startY, endY));
  const x2 = Math.min(currentAsciiWidth.value, Math.max(startX, endX));
  const y2 = Math.min(currentAsciiHeight.value, Math.max(startY, endY));

  if (x2 <= x1 || y2 <= y1) return null;

  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

async function canvasMouseDown() {
  if (isDefault.value) return;

  if (asciiBlockAtXy.value && currentTool.value) {
    const targetBlock = asciiBlockAtXy.value;

    switch (currentTool.value.name) {
      case 'select':
        selecting.value.startX = canvasX.value;
        selecting.value.startY = canvasY.value;
        selecting.value.canSelect = true;
        await clearToolCanvas();
        break;

      case 'fill':
        fill();
        canTool.value = false;
        await dispatchBlocks(true);
        break;

      case 'fill-eraser':
        fill(true);
        await dispatchBlocks(true);
        break;

      case 'brush':
        canTool.value = true;
        lastBrushX.value = x.value;
        lastBrushY.value = y.value;
        await drawBrush();
        break;

      case 'eraser':
        canTool.value = true;
        lastBrushX.value = x.value;
        lastBrushY.value = y.value;
        await eraser();
        break;

      case 'dropper':
        if (toolbarState.value.halfBlockEditing) {
          // Half-block mode: sample colour at specific half
          const halfY = y.value * 2 + (isTopHalf.value ? 0 : 1);
          const grid = new HalfBlockGrid(currentAsciiLayerBlocks.value);
          const sampledColour = grid.getColour(x.value, halfY);
          if (canFg.value) {
            toolbarStore.changeColourFg(sampledColour);
          } else if (canBg.value) {
            toolbarStore.changeColourBg(sampledColour);
          }
        } else {
          // Standard full-block dropper
          if (canFg.value) {
            toolbarStore.changeColourFg(
              targetBlock.fg === undefined ? currentFg.value : targetBlock.fg,
            );
          }
          if (canBg.value) {
            toolbarStore.changeColourBg(
              targetBlock.bg === undefined ? currentBg.value : targetBlock.bg,
            );
          }
          if (canText.value) {
            toolbarStore.changeChar(
              targetBlock.char === undefined
                ? currentChar.value
                : targetBlock.char,
            );
          }
        }
        toolbarStore.changeTool(0);
        break;

      case 'replace-color':
        if (toolbarState.value.halfBlockEditing) {
          toastShow('Color replace is not available in half-block mode', {
            type: 'error',
          });
          break;
        }
        if (!isReplacePicking.value) {
          // Click 1: pick source colors from the clicked block
          pickSource(targetBlock);
        } else {
          // Click 2: apply replacement
          const selection = getSelectionBounds();
          applyReplace(selection ?? undefined);
        }
        break;

      case 'gradient':
        if (toolbarState.value.halfBlockEditing) {
          toastShow('Gradient fill is not available in half-block mode', {
            type: 'error',
          });
          break;
        }
        if (!isGradientPicking.value) {
          // Click 1: set start point
          setStartPoint(x.value, y.value);
        } else {
          // Click 2: apply gradient from start to current position
          applyGradient(x.value, y.value, currentAsciiLayerBlocks.value);
          canTool.value = false;
          await dispatchBlocks(true);
          await delayRedrawCanvas(true);
        }
        break;
    }
  }
}

/**
 * Bresenham interpolation: fill gaps from fast mouse movement.
 * Applies the given function at each intermediate grid cell between the
 * last brush position and the current x/y. Skips first (already painted)
 * and last (handled by the final draw call after this returns).
 *
 * Note: Temporarily mutates x/y refs during interpolation. This is safe
 * because no watchers in this component depend on x/y, and the only
 * computed (asciiBlockAtXy) correctly recalculates for intermediate
 * positions to check grid bounds.
 */
async function interpolateStroke(
  applyFn: () => Promise<void>,
): Promise<void> {
  if (
    !canTool.value ||
    lastBrushX.value < 0 ||
    lastBrushY.value < 0 ||
    (lastBrushX.value === x.value && lastBrushY.value === y.value)
  ) {
    return;
  }

  const points = bresenhamLine(
    lastBrushX.value, lastBrushY.value,
    x.value, y.value,
  );

  for (let i = 1; i < points.length - 1; i++) {
    const savedX = x.value;
    const savedY = y.value;
    x.value = points[i].x;
    y.value = points[i].y;
    await applyFn();
    x.value = savedX;
    y.value = savedY;
  }
}

async function canvasMouseMove(e: MouseEvent) {
  if (isDefault.value) return;

  const lastX = x.value;
  const lastY = y.value;

  if (e.offsetX >= 0) {
    x.value = e.offsetX;
  }
  if (e.offsetY >= 0) {
    y.value = e.offsetY;
    isTopHalf.value = Math.floor(e.offsetY / (blockHeightComp.value / 2)) % 2 === 0;
  }

  x.value = Math.floor(x.value / blockWidthComp.value);
  y.value = Math.floor(y.value / blockHeightComp.value);

  if (x.value === lastX && y.value === lastY && !halfBlockEditing.value) {
    return;
  }

  emit('coordsupdate', { x: x.value, y: y.value });

  if (asciiBlockAtXy.value) {
    switch (currentTool.value.name) {
      case 'brush':
        if (isMouseOnCanvas.value) {
          await interpolateStroke(drawBrush);
          await clearToolCanvas();
          await drawBrush();
          await delayRedrawCanvas();
          lastBrushX.value = x.value;
          lastBrushY.value = y.value;
        }
        break;

      case 'eraser':
        await clearToolCanvas();
        if (isMouseOnCanvas.value) {
          await interpolateStroke(eraser);
          await drawBrush(true);
          await delayRedrawCanvas();
          await eraser();
          lastBrushX.value = x.value;
          lastBrushY.value = y.value;
        }
        break;

      case 'select':
        if (selecting.value.canSelect) {
          selecting.value.endX = canvasX.value + blockWidthComp.value;
          selecting.value.endY = canvasY.value + blockHeightComp.value;
          await redrawSelect();
        }
        if (!isSelected.value) {
          await redrawSelect();
        }
        break;

      case 'text':
        await clearToolCanvas();
        await drawIndicator();
        if (isTextEditingValues.value) {
          await drawTextIndicator();
        }
        break;

      case 'dropper':
        await clearToolCanvas();
        await drawIndicator();
        break;

      case 'fill':
      case 'fill-eraser':
        await clearToolCanvas();
        await drawIndicator();
        break;

      case 'replace-color':
        await clearToolCanvas();
        await drawIndicator();
        // Show source color indicator when pick is active
        if (isReplacePicking.value && replaceColorSource.value && toolCtx) {
          const bw = blockWidthComp.value;
          // Draw source FG color swatch above cursor
          if (replaceColorSource.value.fg !== null) {
            toolCtx.fillStyle = mircColours99[replaceColorSource.value.fg];
            toolCtx.fillRect(
              canvasX.value, canvasY.value - 6,
              bw / 2, 4,
            );
          }
          // Draw source BG color swatch above cursor
          if (replaceColorSource.value.bg !== null) {
            toolCtx.fillStyle = mircColours99[replaceColorSource.value.bg];
            toolCtx.fillRect(
              canvasX.value + bw / 2, canvasY.value - 6,
              bw / 2, 4,
            );
          }
        }
        break;

      case 'gradient':
        await clearToolCanvas();
        await drawIndicator();
        // Show bounding rectangle from start point to cursor
        if (isGradientPicking.value && gradientStart.value && toolCtx) {
          const bw = blockWidthComp.value;
          const bh = blockHeightComp.value;
          const sx = gradientStart.value.x * bw;
          const sy = gradientStart.value.y * bh;
          toolCtx.strokeStyle = mircColours99[toolbarStore.currentFg];
          toolCtx.lineWidth = 2;
          toolCtx.setLineDash([4, 4]);
          toolCtx.strokeRect(
            Math.min(sx, canvasX.value),
            Math.min(sy, canvasY.value),
            Math.abs(canvasX.value - sx) + bw,
            Math.abs(canvasY.value - sy) + bh,
          );
          // Draw start color swatch
          toolCtx.fillStyle = mircColours99[toolbarStore.currentFg];
          toolCtx.fillRect(sx, sy, bw, bh);
          toolCtx.fillStyle = mircColours99[toolbarStore.currentBg];
          toolCtx.fillRect(canvasX.value, canvasY.value, bw, bh);
        }
        break;
    }
  }
}

async function clearToolCanvas() {
  if (toolCtx) {
    toolCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    const tools = canvastoolsRef.value;
    if (tools) {
      // eslint-disable-next-line no-self-assign
      tools.width = tools.width;
    }
    if (gridView.value) {
      await drawGrid();
    }
  }
}

// delayRedrawCanvas is provided by useFpsThrottle composable

async function processSelect() {
  let sx = 0;
  let sy = 0;
  let curBlock: Block = {};
  selectedBlocks.value = [];

  if (selecting.value.endY! < selecting.value.startY!) {
    const end = selecting.value.endY!;
    const start = selecting.value.startY!;
    selecting.value.startY = end;
    selecting.value.endY = start;
  }

  if (selecting.value.endX! < selecting.value.startX!) {
    const end = selecting.value.endX!;
    const start = selecting.value.startX!;
    selecting.value.startX = end;
    selecting.value.endX = start;
  }

  for (sy = 0; sy < currentAsciiHeight.value; sy++) {
    if (
      sy > Math.floor(selecting.value.startY! / blockHeightComp.value) - 1 &&
      sy < Math.floor(selecting.value.endY! / blockHeightComp.value)
    ) {
      if (!selectedBlocks.value[sy]) {
        selectedBlocks.value[sy] = [];
      }

      for (sx = 0; sx < currentAsciiWidth.value; sx++) {
        if (
          sx > Math.ceil(selecting.value.startX! / blockWidthComp.value) - 1 &&
          sx <= Math.ceil(selecting.value.endX! / blockWidthComp.value) - 1
        ) {
          if (
            currentAsciiLayerBlocks.value[sy] &&
            currentAsciiLayerBlocks.value[sy][sx]
          ) {
            if (currentAsciiLayerBlocks.value[sy][sx].bg === null) {
              delete currentAsciiLayerBlocks.value[sy][sx]['bg'];
            }
            if (currentAsciiLayerBlocks.value[sy][sx].fg === null) {
              delete currentAsciiLayerBlocks.value[sy][sx]['fg'];
            }
            if (currentAsciiLayerBlocks.value[sy][sx].char === null) {
              delete currentAsciiLayerBlocks.value[sy][sx]['char'];
            }

            curBlock = { ...currentAsciiLayerBlocks.value[sy][sx] };

            if (!selectedBlocks.value[sy][sx]) {
              selectedBlocks.value[sy][sx] = { ...curBlock };
            }
          }
        }
      }
    }
  }

  emit('selectedblocks', selectedBlocks.value);
  emit('selecting', selecting.value);
}

function drawRectangleBlock(rx: number, ry: number) {
  if (!toolCtx) return;
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;
  const block = asciiBlockAtXy.value as Block | false;
  let indicatorColour = 1;

  if (block && typeof block === 'object') {
    indicatorColour = block.bg === 0 ? 1 : 0;
    if (block.bg === 8) {
      indicatorColour = 1;
    }
  }

  // Half-block mode: draw half-height indicator
  if (toolbarState.value.halfBlockEditing) {
    const halfH = bh / 2;
    const yOff = isTopHalf.value ? 0 : halfH;
    toolCtx.fillStyle = mircColours99[indicatorColour];
    toolCtx.fillRect(rx * bw, ry * bh + yOff, bw, halfH);
    toolCtx.setLineDash([1, 2]);
    toolCtx.strokeRect(rx * bw, ry * bh + yOff, bw, halfH);
    return;
  }

  toolCtx.fillStyle = mircColours99[indicatorColour];
  toolCtx.fillRect(rx * bw, ry * bh, bw, bh);
  toolCtx.setLineDash([1, 2]);
  toolCtx.strokeRect(rx * bw, ry * bh, bw, bh);
}

function drawIndicator() {
  const positions = getMirrorPositions(
    x.value, y.value,
    currentAsciiWidth.value, currentAsciiHeight.value,
    mirrorX.value && isTextEditing.value,
    mirrorY.value && isTextEditing.value,
  );
  for (const pos of positions) {
    drawRectangleBlock(pos.x, pos.y);
  }
}

function drawTextIndicator() {
  const tx = textEditing.value.startX;
  const ty = textEditing.value.startY;
  if (tx === null || ty === null) return;

  const positions = getMirrorPositions(
    tx, ty,
    currentAsciiWidth.value, currentAsciiHeight.value,
    mirrorX.value, mirrorY.value,
  );
  for (const pos of positions) {
    drawRectangleBlock(pos.x, pos.y);
  }
}

function drawBrushBlocks(
  brushX: number,
  brushY: number,
  brushBlock: Block,
  target: string | null = null,
  plain = false,
) {
  if (!toolCtx) return;
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;
  const arrayY = brushY / bh;
  const arrayX = brushX / bw;
  const asciiWidth = currentAsciiWidth.value;
  const asciiHeight = currentAsciiHeight.value;
  const tBlock = currentAsciiLayerBlocks.value[arrayY]?.[arrayX];
  if (!tBlock) return;

  if (plain) {
    let indicatorColour = tBlock.bg === 0 ? 1 : 0;
    if (tBlock.bg === 8) {
      indicatorColour = 1;
    }
    toolCtx.fillStyle = mircColours99[indicatorColour];
    toolCtx.fillRect(brushX, brushY, bw, bh);

    applyMirrored(
      arrayX, arrayY, asciiWidth, asciiHeight,
      mirrorX.value, mirrorY.value,
      (mx, my) => {
        toolCtx.fillRect(
          mx * bw, my * bh, bw, bh,
        );
      },
    );
    return;
  }

  switch (target) {
    case 'bg':
      toolCtx.fillStyle =
        brushBlock.bg !== undefined
          ? mircColours99[brushBlock.bg]
          : 'rgba(255,255,255,0.4)';
      break;

    case 'fg':
      toolCtx.fillStyle =
        brushBlock.fg !== undefined
          ? mircColours99[brushBlock.fg]
          : '#FFFFFF';
      break;

    default:
      if (canText.value && brushBlock.char !== undefined) {
        toolCtx.font = getCanvasFont(blockSizeMultiplier.value);
        toolCtx.fillStyle = canFg.value
          ? mircColours99[brushBlock.fg]
          : '#FFFFFF';
        toolCtx.fillText(brushBlock.char, brushX, brushY + bh - 3);

        applyMirrored(
          arrayX, arrayY, asciiWidth, asciiHeight,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            toolCtx.fillText(
              brushBlock.char!,
              mx * bw,
              my * bh + bh - 3,
            );
          },
        );
      }

      if (canText.value && canTool.value) {
        tBlock['char'] = brushBlock['char'];

        applyMirrored(
          arrayX, arrayY, asciiWidth, asciiHeight,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            if (
              currentAsciiLayerBlocks.value[my] &&
              currentAsciiLayerBlocks.value[my][mx] &&
              (x.value !== mx || y.value !== my)
            ) {
              const charOb = { ...currentAsciiLayerBlocks.value[my][mx] };
              currentAsciiLayerBlocks.value[my][mx].char = brushBlock.char;
              recordDiff(mx, my, charOb, brushBlock);
            }
          },
        );
      }

      return;
  }

  if (canBg.value && target === 'bg') {
    toolCtx.setLineDash([1, 2]);
    toolCtx.strokeRect(brushX, brushY, bw, bh);
    toolCtx.fillRect(brushX, brushY, bw, bh);

    applyMirrored(
      arrayX, arrayY, asciiWidth, asciiHeight,
      mirrorX.value, mirrorY.value,
      (mx, my) => {
        toolCtx.fillRect(
          mx * bw, my * bh, bw, bh,
        );
        toolCtx.setLineDash([1, 2]);
        toolCtx.strokeRect(
          mx * bw, my * bh, bw, bh,
        );
      },
    );
  }

  if (canTool.value && brushBlock[target!] !== undefined) {
    tBlock[target!] = brushBlock[target!];

    applyMirrored(
      arrayX, arrayY, asciiWidth, asciiHeight,
      mirrorX.value, mirrorY.value,
      (mx, my) => {
        if (
          currentAsciiLayerBlocks.value[my] &&
          currentAsciiLayerBlocks.value[my][mx] &&
          (x.value !== mx || y.value !== my)
        ) {
          const ob = { ...currentAsciiLayerBlocks.value[my][mx] };
          currentAsciiLayerBlocks.value[my][mx][target!] = brushBlock[target!];
          recordDiff(mx, my, ob, brushBlock);
        }
      },
    );
  }

  toolCtx.restore();
}

async function drawHalfBlocks(brushX: number, brushY: number) {
  if (!toolCtx) return;
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;

  // Compute half-block coordinates from pixel position
  const coord = HalfBlockGrid.fromPixels(brushX, brushY, bw, bh);
  const blockY = Math.floor(coord.y / 2);
  const blockX = coord.x;

  if (
    !currentAsciiLayerBlocks.value[blockY] ||
    !currentAsciiLayerBlocks.value[blockY][blockX]
  ) {
    toolCtx.restore();
    return;
  }

  // Snapshot old block before mutation
  const ob = { ...currentAsciiLayerBlocks.value[blockY][blockX] };

  // Draw canvas preview
  toolCtx.font = getCanvasFont(blockSizeMultiplier.value);
  toolCtx.fillStyle = mircColours99[currentFg.value];
  toolCtx.fillText(
    coord.y % 2 === 0 ? '\u2580' : '\u2584',
    brushX,
    brushY + bh - 3,
  );

  if (canTool.value) {
    // Use HalfBlockGrid to set the colour at half-block granularity
    const grid = new HalfBlockGrid(currentAsciiLayerBlocks.value);
    grid.setColour(coord.x, coord.y, currentFg.value);

    recordDiff(blockX, blockY, ob, currentAsciiLayerBlocks.value[blockY][blockX]);

    // Mirror positions at half-block granularity
    applyMirroredHalfBlock(
      coord.x, coord.y,
      currentAsciiWidth.value, currentAsciiHeight.value,
      mirrorX.value, mirrorY.value,
      (mx, mHalfY, mBlockY) => {
        const mRow = currentAsciiLayerBlocks.value[mBlockY];
        if (!mRow || mRow[mx] === undefined) return;
        const mOb = { ...mRow[mx] };
        grid.setColour(mx, mHalfY, currentFg.value);
        recordDiff(mx, mBlockY, mOb, mRow[mx]);
      },
    );
  }

  toolCtx.restore();
}

async function drawBrush(plain = false) {
  await clearToolCanvas();
  const bw = blockWidthComp.value;
  const bh = blockHeightComp.value;
  let brushDiffX = 0;
  let xLength: number | false = false;

  for (let i = 0; i <= brushBlocks.value.length; i++) {
    if (brushBlocks.value[i] && xLength === false) {
      brushDiffX = Math.floor(brushBlocks.value[i].length / 2) * bw;
      xLength = brushBlocks.value[i].length;
      break;
    }
  }

  const brushDiffY = Math.floor(brushBlocks.value.length / 2) * bh;

  for (let by = 0; by < brushBlocks.value.length; by++) {
    if (!brushBlocks.value[by]) continue;

    for (let bx = 0; bx < xLength; bx++) {
      if (
        !brushBlocks.value[by][bx] ||
        isEmptyBlock(brushBlocks.value[by][bx])
      ) {
        continue;
      }

      const brushBlock = brushBlocks.value[by][bx];

      if (
        brushBlock.char !== undefined &&
        brushBlock.char === ' ' &&
        brushBlock.bg === undefined &&
        brushBlock.fg === undefined
      ) {
        continue;
      }

      const brushX = x.value * bw + bx * bw - brushDiffX;
      const brushY = y.value * bh + by * bh - brushDiffY;

      const arrayY = brushY / bh;
      const arrayX = brushX / bw;

      if (
        currentAsciiLayerBlocks.value[arrayY] &&
        currentAsciiLayerBlocks.value[arrayY][arrayX]
      ) {
        const ob = { ...currentAsciiLayerBlocks.value[arrayY][arrayX] };

        if (!plain) {
          if (toolbarState.value.halfBlockEditing) {
            await drawHalfBlocks(brushX, brushY);
          } else {
            if (canBg.value) {
              await drawBrushBlocks(brushX, brushY, brushBlock, 'bg');
            }
            if (canFg.value) {
              await drawBrushBlocks(brushX, brushY, brushBlock, 'fg');
            }
            await drawBrushBlocks(brushX, brushY, brushBlock, null);
          }

          if (canTool.value && !toolbarState.value.halfBlockEditing) {
            recordDiff(arrayX, arrayY, ob, brushBlock);
          }
        } else if (isErasing.value) {
          await drawBrushBlocks(brushX, brushY, brushBlock, null, true);
        }
      }
    }
  }
}

function recordDiff(
  sx: number,
  sy: number,
  oldBlock: Block,
  newBlock: Block,
): void {
  storeDiffBlockFn(diffBlocks, sx, sy, oldBlock, newBlock);
}

function eraser() {
  if (canTool.value) {
    const bw = blockWidthComp.value;
    const bh = blockHeightComp.value;

    // ── Half-block eraser path ──
    if (toolbarState.value.halfBlockEditing) {
      const grid = new HalfBlockGrid(currentAsciiLayerBlocks.value);
      const halfY = y.value * 2 + (isTopHalf.value ? 0 : 1);

      // Primary erase position
      const row = currentAsciiLayerBlocks.value[y.value];
      if (row && row[x.value] !== undefined) {
        const ob = { ...row[x.value] };
        grid.setColour(x.value, halfY, 99);
        recordDiff(x.value, y.value, ob, row[x.value]);
      }

      // Mirror positions
      applyMirroredHalfBlock(
        x.value, halfY,
        currentAsciiWidth.value, currentAsciiHeight.value,
        mirrorX.value, mirrorY.value,
        (mx, mHalfY, mBlockY) => {
          const mRow = currentAsciiLayerBlocks.value[mBlockY];
          if (!mRow || mRow[mx] === undefined) return;
          const mOb = { ...mRow[mx] };
          grid.setColour(mx, mHalfY, 99);
          recordDiff(mx, mBlockY, mOb, mRow[mx]);
        },
      );
      return;
    }

    // ── Standard full-block eraser path ──
    const brushDiffX =
      Math.floor(brushBlocks.value[0].length / 2) * bw;
    const brushDiffY =
      Math.floor(brushBlocks.value.length / 2) * bh;

    for (let ey = 0; ey < brushBlocks.value.length; ey++) {
      for (let ex = 0; ex < brushBlocks.value[0].length; ex++) {
        const brushX =
          x.value * bw + ex * bw - brushDiffX;
        const brushY =
          y.value * bh + ey * bh - brushDiffY;

        const arrayY = brushY / bh;
        const arrayX = brushX / bw;

        if (currentAsciiLayerBlocks.value[arrayY] === undefined) continue;

        if (
          currentAsciiLayerBlocks.value[arrayY][arrayX] === undefined ||
          isEmptyBlock(brushBlocks.value[ey][ex])
        ) {
          continue;
        }

        const tBlock = currentAsciiLayerBlocks.value[arrayY][arrayX];
        const ob = { ...currentAsciiLayerBlocks.value[arrayY][arrayX] };

        eraseBlockProperties(tBlock, {
          fg: canFg.value,
          bg: canBg.value,
          char: canText.value,
        });

        recordDiff(arrayX, arrayY, ob, tBlock);

        applyMirrored(
          arrayX, arrayY,
          currentAsciiWidth.value, currentAsciiHeight.value,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            const block = currentAsciiLayerBlocks.value[my]?.[mx];
            if (!block) return;
            const mOb = { ...block };
            eraseBlockProperties(block, {
              fg: canFg.value,
              bg: canBg.value,
              char: canText.value,
            });
            recordDiff(mx, my, mOb, block);
          },
        );
      }
    }
  }
}

function fill(eraser = false) {
  // Half-block fill path
  if (toolbarState.value.halfBlockEditing) {
    const bh = blockHeightComp.value;
    const halfY = Math.floor(
      (y.value * bh + (isTopHalf.value ? 0 : bh / 2)) / (bh / 2),
    );
    // 99 = EMPTY_COLOUR (transparent) — acts as eraser in half-block mode
    const fillColour = eraser ? 99 : currentFg.value;

    const changes = iterativeFillHalfBlock(
      currentAsciiLayerBlocks.value,
      halfY,
      x.value,
      fillColour,
    );

    for (const change of changes) {
      if (
        change.old.bg !== change.new.bg ||
        change.old.fg !== change.new.fg ||
        change.old.char !== change.new.char
      ) {
        recordDiff(change.x, change.y, change.old, change.new);
      }
    }
    return;
  }

  // Standard full-block fill path
  if (!canBg.value && !canFg.value && !canText.value) {
    toastShow('Select at least one fill target (FG/BG/Text)', {
      type: 'error',
    });
    return;
  }

  const fillColor: Block = {
    bg: currentBg.value,
    fg: currentFg.value,
    char: currentChar.value,
  };
  const current = { ...(asciiBlockAtXy.value as Block) };
  if (!canBg.value) {
    delete fillColor['bg'];
  }
  if (!canText.value) {
    delete fillColor['char'];
  }
  if (JSON.stringify(current) === JSON.stringify(fillColor) && !eraser) {
    return;
  }

  const changes = iterativeFill(
    currentAsciiLayerBlocks.value,
    y.value,
    x.value,
    current,
    fillColor,
    canBg.value,
    canFg.value,
    canText.value,
    eraser,
  );

  // Only record diffs for cells that actually changed
  for (const change of changes) {
    if (
      change.old.bg !== change.new.bg ||
      change.old.fg !== change.new.fg ||
      change.old.char !== change.new.char
    ) {
      recordDiff(change.x, change.y, change.old, change.new);
    }
  }
}

// ─── Expose for test compatibility ──────────────────────────────
defineExpose({
  // Reactive state
  x,
  y,
  isTopHalf,
  top,
  canTool,
  textEditing,
  selecting,
  isMouseOnCanvas,
  selectedBlocks,
  diffBlocks,
  canvasHash,
  canvasSize,
  // Computed
  blockWidth: blockWidthComp,
  blockHeight: blockHeightComp,
  blockSizeMultiplier,
  currentAscii,
  currentAsciiLayers,
  selectedLayerIndex,
  currentSelectedLayer,
  currentAsciiLayerBlocks,
  currentTool,
  canFg,
  canBg,
  canText,
  currentFg,
  currentBg,
  currentChar,
  isTextEditing,
  isEraserFill,
  isFill,
  isTextEditingValues,
  isSelecting,
  isDefault,
  isBrushing,
  isErasing,
  isSelected,
  brushBlocks,
  canvasX,
  canvasY,
  toolbarState,
  mirrorX,
  mirrorY,
  debugPanelState,
  selectBlocks,
  options,
  haveSelectBlocks,
  mircColours99,
  brushLibraryState,
  gridView,
  halfBlockEditing,
  asciiBlockAtXy,
  maxBrushSize,
  currentAsciiWidth,
  currentAsciiHeight,
  imageOverlay,
  imageOverlayStyle,
  canvasTransparent,
  emptyBlock,
  updateCanvas: props.updateCanvas ?? false,
  // Methods
  startExport,
  canvasToPng,
  openContextMenu,
  canvasKeyDown,
  warnInvisibleLayer,
  checkVisible: checkVisibleFn,
  undo,
  redo,
  resetSelectTool,
  redrawSelect,
  mergeLayers: mergeLayersFn,
  drawGrid,
  redrawCanvas,
  dispatchBlocks,
  canvasMouseUp,
  canvasMouseDown,
  canvasMouseMove,
  clearToolCanvas,
  delayRedrawCanvas,
  getBlocksWidth,
  filterNullBlocks,
  processSelect,
  drawRectangleBlock,
  drawIndicator,
  drawTextIndicator,
  drawBrushBlocks,
  drawHalfBlocks,
  drawBrush,
  recordDiff,
  eraser,
  fill,
  applySelectionTransform,
  selectionTransform,
  // Template refs
  canvasRef,
  canvastoolsRef,
  editorMenu,
  editorPanel,
  // Canvas panel composable
  canvasPanel,
  // Store
  store,
});
</script>

<style scoped>
/* Resize handles — visible only when default tool is active */
.ab-resize-handle {
  position: absolute;
  z-index: 10;
  background: rgba(100, 116, 139, 0.4);
  transition: background-color 0.15s;
}

.ab-resize-handle:hover {
  background: rgba(59, 130, 246, 0.7);
}

/* Bottom-right corner */
.ab-resize-handle-br {
  right: -4px;
  bottom: -4px;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}

/* Bottom-left corner */
.ab-resize-handle-bl {
  left: -4px;
  bottom: -4px;
  width: 10px;
  height: 10px;
  cursor: nesw-resize;
}

/* Top-right corner */
.ab-resize-handle-tr {
  right: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  cursor: nesw-resize;
}

/* Top-left corner */
.ab-resize-handle-tl {
  left: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}

/* Bottom-middle edge */
.ab-resize-handle-bm {
  left: 50%;
  bottom: -4px;
  width: 20px;
  height: 8px;
  transform: translateX(-50%);
  cursor: ns-resize;
}

/* Top-middle edge */
.ab-resize-handle-tm {
  left: 50%;
  top: -4px;
  width: 20px;
  height: 8px;
  transform: translateX(-50%);
  cursor: ns-resize;
}

/* Middle-right edge */
.ab-resize-handle-mr {
  right: -4px;
  top: 50%;
  width: 8px;
  height: 20px;
  transform: translateY(-50%);
  cursor: ew-resize;
}

/* Middle-left edge */
.ab-resize-handle-ml {
  left: -4px;
  top: 50%;
  width: 8px;
  height: 20px;
  transform: translateY(-50%);
  cursor: ew-resize;
}
</style>
