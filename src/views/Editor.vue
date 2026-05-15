<template>
  <div>
    <div
      ref="scrollContainerRef"
      id="canvas-area"
      class="overflow-auto"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <editor-context-menu
        ref="editorMenu"
        :has-selection="isSelected && isSelecting"
        :have-select-blocks="haveSelectBlocks"
        @save-png="canvasToPng()"
        @export-mirc="startExport"
        @export-plain-text="exportPlainTextClipboard()"
        @export-html="exportHtmlFile()"
        @transform-selection="applySelectionTransform"
        @replace-color="contextMenuReplaceColor()"
        @copy-selection="contextMenuCopySelection()"
        @cut-selection="contextMenuCutSelection()"
        @delete-selection="contextMenuDeleteSelection()"
        @paste="pasteMode.startPasteMode()"
        @border-generator="openBorderGenerator()"
        @crop-to-content="cropToContent()"
      />

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
          @mousemove="onCanvasMouseMove"
          @mousedown.left="canvasMouseDown"
          @mouseup.left="canvasMouseUp"
          @mouseup.right="openContextMenu"
          @mousedown.middle.prevent="startPan"
          @touchmove="canvasMouseMove"
          @touchend="canvasMouseUp"
          @touchstart="canvasMouseDown"
          :style="panCursorStyle"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useEventListener } from '@vueuse/core';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { useModalStore } from '../store/modal';
import { useToast } from '../composables/useToast';
import { useCanvasPanel } from '../composables/useCanvasPanel';
import { useMainCanvasRenderer } from '../composables/useMainCanvasRenderer';
import { useExportAscii } from '../composables/useExportAscii';
import { useFpsThrottle } from '../composables/useFpsThrottle';
import {
  useSelectionTransform,
  selectionToGridRect,
  copySelectionBlocks,
} from '../composables/useSelectionTransform';
import { useColorReplace } from '../composables/useColorReplace';
import { useGradientTool } from '../composables/useGradientTool';
import { useShapeTool } from '../composables/useShapeTool';
import { useMatchHighlight } from '../composables/useMatchHighlight';
import { useEditorState } from '../composables/useEditorState';
import { useEditorRendering } from '../composables/useEditorRendering';
import { usePasteMode } from '../composables/usePasteMode';
import { useToolApplication } from '../composables/useToolApplication';
import hotkeys from 'hotkeys-js';

import EditorContextMenu from '../components/parts/EditorContextMenu.vue';

import {
  mircColours99,
  maxBrushSize,
  fillNullBlocks,
  getBlocksWidth,
  filterNullBlocks,
  canvasToPng as canvasToPngUtil,
  emptyBlock as emptyBlockFn,
  exportPlainText,
} from '../ascii';

import { applyMirrored } from '../utils/mirror';
import { bresenhamLine } from '../utils/bresenham';
import { drawShapePreview } from '../utils/shapePreview';
import { downloadHtml } from '../utils/htmlExport';
import { HalfBlockGrid } from '../utils/halfBlockGrid';
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

// ─── Shared Editor State ───────────────────────────────────────
const state = useEditorState();

// Destructure for template/method access
const {
  canvasSize, x, y, isTopHalf, top, canTool,
  textEditing, selecting, isMouseOnCanvas,
  selectedBlocks, diffBlocks, canvasHash,
  lastBrushX, lastBrushY, lastIsTopHalf,
  blockSizeMultiplier, blockWidthComp, blockHeightComp,
  currentAscii, currentAsciiLayers, selectedLayerIndex,
  currentSelectedLayer, currentAsciiLayerBlocks,
  currentTool, canFg, canBg, canText,
  currentFg, currentBg, currentChar,
  isTextEditing, isEraserFill, isFill, isTextEditingValues,
  isSelecting, isDefault, isBrushing, isErasing, isSelected,
  brushBlocks, canvasX, canvasY,
  toolbarState, mirrorX, mirrorY,
  debugPanelState, selectBlocks, options, haveSelectBlocks,
  brushLibraryState, gridView, halfBlockEditing,
  asciiBlockAtXy, currentAsciiWidth, currentAsciiHeight,
} = state;

// ─── Template Refs ──────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvastoolsRef = ref<HTMLCanvasElement | null>(null);
const editorMenu = ref<InstanceType<typeof EditorContextMenu> | null>(null);
const editorPanel = ref<HTMLElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);

// ─── Y-offset from props (not in useEditorState) ────────────────
const yOffsetComp = computed(() => props.yOffset);

// ─── Editor Rendering Composable ───────────────────────────────
const rendering = useEditorRendering(
  { ...state, yOffset: yOffsetComp },
  {
    canvasRef,
    canvastoolsRef,
    renderBlock,
    clearMainCanvas,
    drawHighlights: drawMatchHighlights,
  },
);

const {
  redrawCanvas, clearToolCanvas, drawGrid,
  drawIndicator, drawTextIndicator,
  drawRectangleBlock, redrawSelect,
} = rendering;

// ─── FPS-Throttled Canvas Redraw ─────────────────────────────────
const { scheduleRedraw: delayRedrawCanvas, cancelRedraw } = useFpsThrottle(
  redrawCanvas,
  () => options.value.fps,
);

// ─── Tool Application (brush, eraser, fill) ───────────────────────
const toolApp = useToolApplication({
  state: {
    x, y, isTopHalf, canTool, diffBlocks,
    currentAsciiLayerBlocks, currentAsciiWidth, currentAsciiHeight,
    blockWidthComp, blockHeightComp, blockSizeMultiplier,
    canFg, canBg, canText, currentFg, currentBg, currentChar,
    isErasing, brushBlocks, mirrorX, mirrorY, toolbarState,
    asciiBlockAtXy,
  },
  rendering: {
    getToolCtx: rendering.getToolCtx,
    clearToolCanvas,
    showError: (msg: string) => toastShow(msg, { type: 'error' }),
  },
});

const {
  drawBrush, drawBrushBlocks, drawHalfBlocks,
  eraser, fill, recordDiff,
} = toolApp;

// ─── Gradient Tool ────────────────────────────────────────────────
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

// ─── Shape Tool ──────────────────────────────────────────────────
const {
  shapeStart,
  isShapePicking,
  setShapeStart,
  applyShape,
  cancelShape,
} = useShapeTool({
  currentAsciiLayerBlocks,
  recordDiff,
});

// ─── Paste Mode ──────────────────────────────────────────────────
const pasteMode = usePasteMode({
  selecting,
  blockWidthComp,
  blockHeightComp,
  currentAsciiWidth,
  currentAsciiHeight,
  currentAsciiLayerBlocks,
  selectedLayerIndex,
  updateAsciiBlocks: store.updateAsciiBlocks.bind(store),
  redrawCanvas: async () => { await delayRedrawCanvas(true); },
  clearToolCanvas,
});

// ─── Selection Transform ─────────────────────────────────────────
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

const {
  applyTransform: applyTransformFn,
  applyNudge,
  extractSelectionBlocks,
} = selectionTransform;

/** Apply a transform to the current selection (context menu + shortcuts) */
async function applySelectionTransform(type: TransformType) {
  await applyTransformFn(type);
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

// ─── Middle-Click Pan State ─────────────────────────────────────
const isPanning = ref(false);
const panLastX = ref(0);
const panLastY = ref(0);
const panCursorStyle = computed(() =>
  isPanning.value ? 'cursor: grabbing;' : '',
);

function startPan(e: MouseEvent) {
  isPanning.value = true;
  panLastX.value = e.clientX;
  panLastY.value = e.clientY;
  // Listen for mouseup at document level so pan ends even
  // if the mouse is released outside the canvas element.
  const onMouseUp = () => {
    isPanning.value = false;
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mouseup', onMouseUp);
}

function doPan(e: MouseEvent) {
  if (!isPanning.value) return;
  const dx = panLastX.value - e.clientX;
  const dy = panLastY.value - e.clientY;
  panLastX.value = e.clientX;
  panLastY.value = e.clientY;
  const el = scrollContainerRef.value;
  if (el) {
    el.scrollBy(dx, dy);
  }
}

/** Canvas mousemove dispatcher: delegates to pan or tool handler */
function onCanvasMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    doPan(e);
    return;
  }
  canvasMouseMove(e);
}

// ─── Watchers ───────────────────────────────────────────────────
watch(currentAsciiHeight, (val) => {
  canvasSize.height = val * blockHeightComp.value;
});

watch(currentAsciiWidth, (val) => {
  canvasSize.width = val * blockWidthComp.value;
});

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

watch(blockSizeMultiplier, () => {
  canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
  canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;
  canvasPanel.setDimensions(
    currentAsciiWidth.value * blockWidthComp.value,
    currentAsciiHeight.value * blockHeightComp.value,
  );
  rendering.updateCanvasFont();
  delayRedrawCanvas(true);
});

watch(currentTool, async () => {
  warnInvisibleLayer();

  if (halfBlockEditing.value) {
    if (currentTool.value.name === 'text') {
      toastShow('Text mode is not available in half-block editing mode');
      toolbarStore.changeTool(0);
      return;
    }
    if (currentTool.value.name === 'gradient') {
      toastShow('Gradient fill is not available in half-block editing mode');
      toolbarStore.changeTool(0);
      return;
    }
    if (currentTool.value.name === 'shapes') {
      toastShow('Shape tools are not available in half-block editing mode');
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
    toolbarStore.updateBrushSize({
      brushSizeWidth: 1,
      brushSizeHeight: 1,
      brushSizeType: 'square',
    });

    if (currentTool.value.name === 'text') {
      toolbarStore.changeTool(0);
      textEditing.value.startX = null;
      textEditing.value.startY = null;
    }

    if (currentTool.value.name === 'select') {
      toolbarStore.changeTool(0);
      resetSelectTool();
    }

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
  // Skip modifier combos (Ctrl+Z, Ctrl+Y, Ctrl+C, etc.) — let
  // global shortcuts in scope 'all' handle them instead of routing
  // through canvasKeyDown which would type the raw character.
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  event.preventDefault();

  if (isTextEditing.value) {
    await canvasKeyDown(event.key);
    return;
  }

  if (
    event.shiftKey
    && isSelected.value
    && selectedBlocks.value.length > 0
  ) {
    switch (event.key) {
      case 'ArrowUp':
        await applyNudge(0, -1);
        return;
      case 'ArrowDown':
        await applyNudge(0, 1);
        return;
      case 'ArrowLeft':
        await applyNudge(-1, 0);
        return;
      case 'ArrowRight':
        await applyNudge(1, 0);
        return;
    }
  }

  if (event.key === 'Escape' && isReplacePicking.value) {
    resetReplace();
    return;
  }

  if (event.key === 'Escape' && isGradientPicking.value) {
    cancelGradient();
    await clearToolCanvas();
    return;
  }

  if (event.key === 'Escape' && isShapePicking.value) {
    cancelShape();
    await clearToolCanvas();
    return;
  }

  if (event.key === 'Escape' && pasteMode.isPasteMode.value) {
    pasteMode.cancelPasteMode();
    await clearToolCanvas();
    await delayRedrawCanvas();
    return;
  }

  // Delete key: clear selection contents
  if (event.key === 'Delete' && isSelecting.value && isSelected.value) {
    pasteMode.deleteSelection();
    await delayRedrawCanvas(true);
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

onMounted(async () => {
  rendering.initContexts();
  await delayRedrawCanvas();
});

onUnmounted(() => {
  hotkeys.unbind('*', 'editor');
  canvasPanel.cleanup();
  cancelRedraw();
  rendering.disposeContexts();
});

// ─── Auto-cleanup Event Listeners (VueUse) ─────────────────────

useEventListener(
  editorPanel,
  'wheel',
  (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      store.setBlockMultiplier(store.blockSizeMultiplier + delta);
    }
  },
  { passive: false },
);

useEventListener(
  window,
  'asciibird:selection-transform',
  (e: Event) => {
    const type = (e as CustomEvent).detail as TransformType;
    if (isSelecting.value && isSelected.value) {
      applySelectionTransform(type);
    }
  },
);

useEventListener(
  window,
  'asciibird:scroll-to',
  (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail.x !== undefined && detail.y !== undefined) {
      x.value = detail.x;
      y.value = detail.y;
      delayRedrawCanvas();
    }
  },
);

useEventListener(
  window,
  'asciibird:paste-blocks',
  () => {
    pasteMode.startPasteMode();
  },
);

useEventListener(
  window,
  'asciibird:cut-blocks',
  () => {
    if (isSelecting.value && isSelected.value) {
      pasteMode.cutSelection();
      delayRedrawCanvas(true);
    }
  },
);

// ─── Init (equivalent to created()) ────────────────────────────
if (currentAsciiLayerBlocks.value) {
  canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
  canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;
}

// ─── Methods: Context Menu & Export ────────────────────────────

function canvasToPng() {
  const canvas = canvasRef.value;
  if (canvas) {
    canvasToPngUtil(canvas, (currentAscii.value as { title: string })?.title ?? 'ascii');
  }
}

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  editorMenu.value?.open({ clientX: e.clientX, clientY: e.clientY });
}

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

  function contextMenuCopySelection() {
    if (selectedBlocks.value.length > 0) {
      const didCopy = copySelectionBlocks(
        selecting.value,
        selectedBlocks.value,
        currentAsciiLayerBlocks.value,
        blockWidthComp.value,
        blockHeightComp.value,
        currentAsciiWidth.value,
        currentAsciiHeight.value,
        toolbarStore.setSelectBlocks,
      );
      if (didCopy) {
        toastShow('Copied selection to clipboard', { type: 'success' });
      }
    }
  }

function contextMenuCutSelection() {
  if (isSelecting.value && isSelected.value) {
    pasteMode.cutSelection();
    delayRedrawCanvas(true);
    toastShow('Cut selection to clipboard', { type: 'success' });
  }
}

function contextMenuDeleteSelection() {
  if (isSelecting.value && isSelected.value) {
    pasteMode.deleteSelection();
    delayRedrawCanvas(true);
  }
}

function openBorderGenerator() {
  modalStore.openModal('border-generator');
}

function cropToContent() {
  const cropped = store.cropToContentAction();
  if (cropped) {
    toastShow('Canvas cropped to content!', { type: 'success' });
  } else {
    toastShow('Nothing to crop — content already fills edges.', {
      type: 'info',
    });
  }
}

function exportPlainTextClipboard() {
  try {
    const lines = exportPlainText();
    navigator.clipboard.writeText(lines.join('\n'));
    toastShow('Plain text copied to clipboard!', { type: 'success' });
  } catch {
    toastShow('Failed to copy plain text.', { type: 'error' });
  }
}

function exportHtmlFile() {
  try {
    const title = (currentAscii.value as { title: string })?.title ?? 'ascii';
    downloadHtml(title);
    toastShow('Exported HTML file!', { type: 'success' });
  } catch {
    toastShow('Failed to export HTML.', { type: 'error' });
  }
}

// ─── Methods: Text Editing ─────────────────────────────────────

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

// ─── Methods: Helpers ──────────────────────────────────────────

function warnInvisibleLayer() {
  if (!currentSelectedLayer.value.visible) {
    toastShow('You are trying to edit an invisible layer!!', {
      type: 'error',
      icon: 'warning_amber',
      singleton: true,
    });
  }
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

/**
 * Get the current selection bounds as grid coordinates.
 * Returns null if no valid selection exists.
 */
function getSelectionBounds(): {
  x: number; y: number; w: number; h: number;
} | null {
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

// ─── Methods: Mouse Event Handlers ─────────────────────────────

async function canvasMouseUp() {
  if (isDefault.value) return;

  switch (currentTool.value.name) {
    case 'brush':
    case 'eraser':
      canTool.value = false;
      lastBrushX.value = -1;
      lastBrushY.value = -1;
      lastIsTopHalf.value = true;
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

async function canvasMouseDown() {
  // Paste mode: confirm paste at cursor position
  if (pasteMode.isPasteMode.value) {
    pasteMode.confirmPaste(x.value, y.value);
    await delayRedrawCanvas(true);
    return;
  }

  if (isDefault.value) return;

  if (asciiBlockAtXy.value && currentTool.value) {
    const targetBlock = asciiBlockAtXy.value;

    switch (currentTool.value.name) {
      case 'select':
        selecting.value.startX = canvasX.value;
        // In half-block mode, start Y at half-block precision
        selecting.value.startY = halfBlockEditing.value
          ? canvasY.value + (isTopHalf.value ? 0 : blockHeightComp.value / 2)
          : canvasY.value;
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
        lastIsTopHalf.value = isTopHalf.value;
        await drawBrush();
        break;

      case 'eraser':
        canTool.value = true;
        lastBrushX.value = x.value;
        lastBrushY.value = y.value;
        lastIsTopHalf.value = isTopHalf.value;
        await eraser();
        break;

      case 'dropper':
        if (toolbarState.value.halfBlockEditing) {
          const halfY = y.value * 2 + (isTopHalf.value ? 0 : 1);
          const grid = new HalfBlockGrid(currentAsciiLayerBlocks.value);
          const sampledColour = grid.getColour(x.value, halfY);
          if (canFg.value) {
            toolbarStore.changeColourFg(sampledColour);
          } else if (canBg.value) {
            toolbarStore.changeColourBg(sampledColour);
          }
        } else {
          if (canFg.value) {
            toolbarStore.changeColourFg(
              targetBlock.fg === undefined
                ? currentFg.value
                : targetBlock.fg,
            );
          }
          if (canBg.value) {
            toolbarStore.changeColourBg(
              targetBlock.bg === undefined
                ? currentBg.value
                : targetBlock.bg,
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
          toastShow(
            'Color replace is not available in half-block mode',
            { type: 'error' },
          );
          break;
        }
        if (!isReplacePicking.value) {
          pickSource(targetBlock);
        } else {
          const selection = getSelectionBounds();
          applyReplace(selection ?? undefined);
        }
        break;

      case 'gradient':
        if (toolbarState.value.halfBlockEditing) {
          toastShow(
            'Gradient fill is not available in half-block mode',
            { type: 'error' },
          );
          break;
        }
        if (!isGradientPicking.value) {
          setStartPoint(x.value, y.value);
        } else {
          applyGradient(
            x.value, y.value,
            currentAsciiLayerBlocks.value,
          );
          canTool.value = false;
          await dispatchBlocks(true);
          await delayRedrawCanvas(true);
        }
        break;

      case 'shapes':
        if (toolbarState.value.halfBlockEditing) {
          toastShow(
            'Shape tools are not available in half-block mode',
            { type: 'error' },
          );
          break;
        }
        if (!isShapePicking.value) {
          setShapeStart(x.value, y.value);
        } else {
          applyShape(
            x.value, y.value,
            currentAsciiLayerBlocks.value,
          );
          canTool.value = false;
          await dispatchBlocks(true);
          await delayRedrawCanvas(true);
        }
        break;
    }
  }
}

async function interpolateStroke(
  applyFn: () => Promise<void>,
): Promise<void> {
  if (
    !canTool.value
    || lastBrushX.value < 0
    || lastBrushY.value < 0
    || (lastBrushX.value === x.value && lastBrushY.value === y.value)
  ) {
    return;
  }

  const savedIsTopHalf = isTopHalf.value;

  if (halfBlockEditing.value) {
    // In half-block mode, interpolate at half-block resolution.
    // Convert full-block coords to half-block coords (y*2 + half offset)
    // so Bresenham generates intermediate half-block positions.
    const lastHalfY = lastBrushY.value * 2
      + (lastIsTopHalf.value ? 0 : 1);
    const curHalfY = y.value * 2
      + (savedIsTopHalf ? 0 : 1);

    const points = bresenhamLine(
      lastBrushX.value, lastHalfY,
      x.value, curHalfY,
    );

    for (let i = 1; i < points.length - 1; i++) {
      const savedX = x.value;
      const savedY = y.value;
      x.value = points[i].x;
      y.value = Math.floor(points[i].y / 2);
      isTopHalf.value = points[i].y % 2 === 0;
      await applyFn();
      x.value = savedX;
      y.value = savedY;
    }
  } else {
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

  isTopHalf.value = savedIsTopHalf;
}

async function canvasMouseMove(e: MouseEvent) {
  // Update coordinates regardless of mode
  const lastX = x.value;
  const lastY = y.value;

  if (e.offsetX >= 0) {
    x.value = e.offsetX;
  }
  if (e.offsetY >= 0) {
    y.value = e.offsetY;
    isTopHalf.value = Math.floor(
      e.offsetY / (blockHeightComp.value / 2),
    ) % 2 === 0;
  }

  x.value = Math.floor(x.value / blockWidthComp.value);
  y.value = Math.floor(y.value / blockHeightComp.value);

  if (pasteMode.isPasteMode.value) {
    const toolCtx = rendering.getToolCtx();
    if (toolCtx) {
      await clearToolCanvas();
      pasteMode.drawPastePreview(
        toolCtx, x.value, y.value,
        blockWidthComp.value, blockHeightComp.value,
      );
    }
    emit('coordsupdate', { x: x.value, y: y.value });
    return;
  }

  if (isDefault.value) return;

  if (x.value === lastX && y.value === lastY && !halfBlockEditing.value) {
    return;
  }

  emit('coordsupdate', { x: x.value, y: y.value });

  if (asciiBlockAtXy.value) {
    const toolCtx = rendering.getToolCtx();
    switch (currentTool.value.name) {
      case 'brush':
        if (isMouseOnCanvas.value) {
          await interpolateStroke(drawBrush);
          await clearToolCanvas();
          await drawBrush();
          await delayRedrawCanvas();
          lastBrushX.value = x.value;
          lastBrushY.value = y.value;
          lastIsTopHalf.value = isTopHalf.value;
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
          lastIsTopHalf.value = isTopHalf.value;
        }
        break;

      case 'select':
        if (selecting.value.canSelect) {
          selecting.value.endX = canvasX.value + blockWidthComp.value;
          // In half-block mode, end Y at half-block precision
          selecting.value.endY = halfBlockEditing.value
            ? canvasY.value
              + (isTopHalf.value ? 0 : blockHeightComp.value / 2)
              + blockHeightComp.value / 2
            : canvasY.value + blockHeightComp.value;
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
        if (isReplacePicking.value
          && replaceColorSource.value
          && toolCtx) {
          const bw = blockWidthComp.value;
          if (replaceColorSource.value.fg !== null) {
            toolCtx.fillStyle = mircColours99[replaceColorSource.value.fg];
            toolCtx.fillRect(
              canvasX.value, canvasY.value - 6,
              bw / 2, 4,
            );
          }
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
        if (isGradientPicking.value
          && gradientStart.value
          && toolCtx) {
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
          toolCtx.fillStyle = mircColours99[toolbarStore.currentFg];
          toolCtx.fillRect(sx, sy, bw, bh);
          toolCtx.fillStyle = mircColours99[toolbarStore.currentBg];
          toolCtx.fillRect(
            canvasX.value, canvasY.value, bw, bh,
          );
        }
        break;

      case 'shapes':
        await clearToolCanvas();
        await drawIndicator();
        if (isShapePicking.value
          && shapeStart.value
          && toolCtx) {
          drawShapePreview({
            ctx: toolCtx,
            shapeType: toolbarStore.toolbarState.shapeType,
            startX: shapeStart.value.x,
            startY: shapeStart.value.y,
            endX: x.value,
            endY: y.value,
            blockWidth: blockWidthComp.value,
            blockHeight: blockHeightComp.value,
            strokeColor: mircColours99[toolbarStore.currentFg],
          });
        }
        break;
    }
  }
}

// ─── Methods: Dispatch & Diff ──────────────────────────────────

async function dispatchBlocks(clearDiff = false) {
  diffBlocks.old = diffBlocks.old.flat();
  diffBlocks.new = diffBlocks.new.flat();

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

async function processSelect() {
  const rect = selectionToGridRect(
    selecting.value,
    blockWidthComp.value,
    blockHeightComp.value,
    currentAsciiWidth.value,
    currentAsciiHeight.value,
  );

  if (rect) {
    selectedBlocks.value = extractSelectionBlocks(
      currentAsciiLayerBlocks.value, rect,
    );
  }

  emit('selectedblocks', selectedBlocks.value);
  emit('selecting', selecting.value);
}

// ─── Expose for test compatibility ─────────────────────────────
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
  emptyBlock: emptyBlockFn,
  isPasteMode: pasteMode.isPasteMode,
  updateCanvas: props.updateCanvas ?? false,
  // Methods
  startExport,
  canvasToPng,
  openContextMenu,
  canvasKeyDown,
  warnInvisibleLayer,
  checkVisible: rendering.checkVisibleFn,
  undo,
  redo,
  resetSelectTool,
  redrawSelect,
  mergeLayers: rendering.mergeLayersFn,
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

