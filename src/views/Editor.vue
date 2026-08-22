<template>
  <div>
    <div
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
        class="canvas-wrapper"
        :style="panelStyle"
        :class="{ 'is-dragging': canvasPanel.isDragging.value }"
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
          @mousemove="handleCanvasMouseMove"
          @mousedown.left="canvasMouseDown"
          @mouseup.left="canvasMouseUp"
          @mouseup.right="openContextMenu"
          @mousedown.middle.prevent="() => {}"
          @touchmove="canvasMouseMove"
          @touchend="canvasMouseUp"
          @touchstart="canvasMouseDown"
        />

        <!-- Resize handles — visible only with default tool -->
        <template v-if="isDefault">
          <div
            v-for="pos in resizeHandlePositions"
            :key="pos"
            :class="`ab-resize-handle ab-resize-handle-${pos}`"
            @pointerdown.stop="canvasPanel.startResize(pos)($event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted } from 'vue';
import { useEventListener } from '@vueuse/core';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { useToast } from '../composables/useToast';
import { useCanvasPanel } from '../composables/useCanvasPanel';
import { useMainCanvasRenderer } from '../composables/useMainCanvasRenderer';
import { useExportAscii } from '../composables/useExportAscii';
import { useFpsThrottle } from '../composables/useFpsThrottle';
import {
  useSelectionTransform,
} from '../composables/useSelectionTransform';
import { useColorReplace } from '../composables/useColorReplace';
import { useGradientTool } from '../composables/useGradientTool';
import { useShapeTool } from '../composables/useShapeTool';
import { useEditorState } from '../composables/useEditorState';
import { useEditorRendering } from '../composables/useEditorRendering';
import { usePasteMode } from '../composables/usePasteMode';
import { useToolApplication } from '../composables/useToolApplication';
import { useCanvasMouseHandlers } from '../composables/useCanvasMouseHandlers';
import { useEditorHotkeys } from '../composables/useEditorHotkeys';
import { useTextEditing } from '../composables/useTextEditing';
import { useEditorWatchers } from '../composables/useEditorWatchers';
import { useEditorActions } from '../composables/useEditorActions';

import EditorContextMenu from '../components/parts/EditorContextMenu.vue';

import {
  mircColours99,
  maxBrushSize,
  getBlocksWidth,
  filterNullBlocks,
  emptyBlock as emptyBlockFn,
} from '../ascii';

import { resizeLayers } from '../utils/resizeLayers';
import { buildImageOverlayStyle } from '../utils/imageOverlayStyle';

import type { Block } from '../types';
import type { TransformType } from '../utils/transformBlocks';

defineOptions({ name: 'Editor' });

/** Canvas resize handle positions for v-for rendering */
const resizeHandlePositions = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'] as const;

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
const { show: toastShow } = useToast();
const { renderBlock, clearMainCanvas } = useMainCanvasRenderer();
const { startExport } = useExportAscii({
  checkLimits: true,
  label: 'mIRC',
});
const { applyReplaceFromBlock } = useColorReplace();

// ─── Shared Editor State ───────────────────────────────────────
const state = useEditorState();

// Destructure for template/method access
const {
  canvasSize, x, y, isTopHalf, top, canTool,
  textEditing, selecting, isMouseOnCanvas,
  selectedBlocks, diffBlocks, canvasHash,
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

// ─── Y-offset from props (not in useEditorState) ────────────────
const yOffsetComp = computed(() => props.yOffset);

const rendering = useEditorRendering(
  { ...state, yOffset: yOffsetComp },
  {
    canvasRef,
    canvastoolsRef,
    renderBlock,
    clearMainCanvas,
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

// ─── Shared callback references ──────────────────────────────────
const updateAsciiBlocks = store.updateAsciiBlocks.bind(store);
const redrawCanvasForce = async () => { await delayRedrawCanvas(true); };

// ─── Paste Mode ──────────────────────────────────────────────────
const pasteMode = usePasteMode({
  selecting,
  blockWidthComp,
  blockHeightComp,
  currentAsciiWidth,
  currentAsciiHeight,
  currentAsciiLayerBlocks,
  selectedLayerIndex,
  updateAsciiBlocks,
  redrawCanvas: redrawCanvasForce,
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
  updateAsciiBlocks,
  setSelectBlocks: toolbarStore.setSelectBlocks.bind(toolbarStore),
  redrawCanvas: redrawCanvasForce,
  clearToolCanvas,
  redrawSelect,
});

const {
  applyTransform: applyTransformFn,
  applyNudge,
} = selectionTransform;

/** Apply a transform to the current selection (context menu + shortcuts) */
async function applySelectionTransform(type: TransformType) {
  await applyTransformFn(type);
}

// ─── Editor Actions (context menu, export, helpers) ───────────────
// Must be initialized before mouse handlers and watchers since they
// depend on dispatchBlocks, processSelect, resetSelectTool, etc.
const actions = useEditorActions({
  state,
  rendering: { clearToolCanvas, delayRedrawCanvas },
  pasteMode,
  refs: { canvasRef, editorMenu },
  emit: {
    selecting: (val) => emit('selecting', val),
    selectedblocks: (val) => emit('selectedblocks', val),
  },
  toastShow,
  applyReplaceFromBlock,
});

const {
  canvasToPng, openContextMenu,
  contextMenuReplaceColor, contextMenuCopySelection,
  contextMenuCutSelection, contextMenuDeleteSelection,
  openBorderGenerator, cropToContent,
  exportPlainTextClipboard, exportHtmlFile,
  warnInvisibleLayer, undo, redo,
  resetSelectTool, getSelectionBounds,
  dispatchBlocks, processSelect,
} = actions;

// ─── Canvas Mouse Handlers (extracted composable) ─────────────
const mouseHandlers = useCanvasMouseHandlers({
  state,
  tools: {
    pasteMode,
    colorReplace: {
      applyReplaceFromBlock,
    },
    gradientTool: {
      isGradientPicking,
      gradientStart,
      setStartPoint,
      applyGradient,
    },
    shapeTool: {
      isShapePicking,
      shapeStart,
      setShapeStart,
      applyShape,
    },
    toolApp: {
      drawBrush,
      eraser,
      fill,
    },
  },
  rendering: {
    getToolCtx: rendering.getToolCtx,
    clearToolCanvas,
    drawIndicator,
    drawTextIndicator,
    delayRedrawCanvas,
    redrawSelect,
  },
  callbacks: {
    dispatchBlocks,
    processSelect,
    getSelectionBounds,
  },
  emit: {
    coords: (v: { x: number; y: number }) => {
      emit('coordsupdate', v);
    },
  },
});

const {
  canvasMouseDown,
  canvasMouseUp,
  canvasMouseMove,
} = mouseHandlers;

// ─── Canvas Mouse Move Guard ────────────────────────────────────
// Suppresses tool mousemove during canvas panel drag (middle-click pan)
// to prevent brush previews and unnecessary redraws while panning.
function handleCanvasMouseMove(e: MouseEvent) {
  if (canvasPanel.isDragging.value) return;
  canvasMouseMove(e);
}

const imageOverlay = computed(() => store.imageOverlay);

const imageOverlayStyle = computed(() =>
  buildImageOverlayStyle(imageOverlay.value),
);

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
    // Clamp to minimum 1x1 to prevent zero-dimension crash
    const canvasBlockHeight = Math.max(1, Math.floor(
      height / blockHeightComp.value,
    ));
    const canvasBlockWidth = Math.max(1, Math.floor(
      width / blockWidthComp.value,
    ));
    const layers = resizeLayers(
      store.currentAsciiLayers,
      canvasBlockWidth,
      canvasBlockHeight,
    );

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

// ─── Watchers (extracted composable) ────────────────────────────
// useEditorWatchers registers all reactive watchers. Vue 3 auto-stops
// them on unmount. Function refs (resetSelectTool, warnInvisibleLayer,
// dispatchBlocks) are hoisted within the setup scope.

useEditorWatchers({
  state,
  rendering: {
    clearToolCanvas,
    delayRedrawCanvas,
    drawBrush,
    drawGrid,
    drawTextIndicator,
    drawIndicator,
    updateCanvasFont: rendering.updateCanvasFont,
  },
  canvasPanel,
  callbacks: {
    resetSelectTool,
    warnInvisibleLayer,
    dispatchBlocks,
  },
  props: {
    resetSelect: toRef(props, 'resetSelect'),
    updateCanvas: toRef(props, 'updateCanvas'),
    yOffset: toRef(props, 'yOffset'),
  },
  emit: {
    textediting: (val) => emit('textediting', val),
    selecting: (val) => emit('selecting', val),
  },
  toastShow,
});

// ─── Text Editing & Hotkeys (extracted composables) ──────────────
// canvasKeyDown is provided by useTextEditing composable.

const { canvasKeyDown } = useTextEditing({
  state: {
    textEditing, canFg, currentFg,
    currentAsciiLayerBlocks, currentAsciiWidth, currentAsciiHeight,
    mirrorX, mirrorY,
  },
  actions: {
    recordDiff,
    clearToolCanvas,
    drawTextIndicator,
    drawIndicator,
    delayRedrawCanvas,
  },
});

// Keyboard handler registered in 'editor' scope via useEditorHotkeys.
// Returns cleanup() for onUnmounted.

const { cleanup: cleanupHotkeys } = useEditorHotkeys({
  state: {
    isTextEditing, isSelected, isSelecting,
    isBrushing, isErasing, selectedBlocks,
    canTool, x, y,
  },
  tools: {
    pasteMode,
    gradientTool: {
      isGradientPicking,
      cancelGradient,
    },
    shapeTool: {
      isShapePicking,
      cancelShape,
    },
  },
  rendering: {
    clearToolCanvas,
    delayRedrawCanvas,
  },
  actions: {
    canvasKeyDown,
    applyNudge,
    drawBrush,
    eraser,
    dispatchBlocks,
  },
});

// ─── Lifecycle ──────────────────────────────────────────────────

onMounted(async () => {
  rendering.initContexts();
  await delayRedrawCanvas();
});

onUnmounted(() => {
  cleanupHotkeys();
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
    const type = (e as CustomEvent<TransformType>).detail;
    if (isSelecting.value && isSelected.value) {
      applySelectionTransform(type);
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

/** Check if a tool stroke or selection is in progress and should end */
function shouldEndStroke(): boolean {
  const tool = currentTool.value.name;
  return (canTool.value && (tool === 'brush' || tool === 'eraser'))
    || (tool === 'select' && selecting.value.canSelect);
}

// Document-level mouseup: ensures brush/eraser strokes and select
// drags end properly even when the mouse is released outside the
// canvas element. Left-button-only filter prevents right/middle
// clicks from interfering.
// See: Gitea issues #83, #84.
useEventListener(
  window,
  'mouseup',
  (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (shouldEndStroke()) canvasMouseUp();
  },
);

// Document-level touchend: mirrors window mouseup for touch devices.
useEventListener(
  window,
  'touchend',
  () => {
    if (shouldEndStroke()) canvasMouseUp();
  },
);

// ─── Init (equivalent to created()) ────────────────────────────
if (currentAsciiLayerBlocks.value) {
  canvasSize.width = currentAsciiWidth.value * blockWidthComp.value;
  canvasSize.height = currentAsciiHeight.value * blockHeightComp.value;
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
  updateCanvas: props.updateCanvas,
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

