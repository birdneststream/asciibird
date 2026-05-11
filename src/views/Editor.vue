<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <context-menu
        ref="editorMenu"
        class="z-50"
      >
        <ul>
          <li
            @click="canvasToPng()"
            class="ml-1 text-sm hover:bg-gray-400"
          >
            Save as PNG
          </li>
          <li
            @click="startExport('clipboard')"
            class="ml-1 text-sm hover:bg-gray-400"
          >
            Export ASCII to mIRC Clipboard
          </li>
          <li
            @click="startExport('file')"
            class="ml-1 text-sm hover:bg-gray-400"
          >
            Export ASCII to mIRC File
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
            class="ab-resize-handle ab-resize-handle-br"
            @pointerdown.stop="canvasPanel.startResize('br')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-bm"
            @pointerdown.stop="canvasPanel.startResize('bm')($event)"
          />
          <div
            class="ab-resize-handle ab-resize-handle-mr"
            @pointerdown.stop="canvasPanel.startResize('mr')($event)"
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
import { useToast } from '../composables/useToast';
import { useClipboard } from '../composables/useClipboard';
import { useCanvasPanel } from '../composables/useCanvasPanel';
import { useMainCanvasRenderer } from '../composables/useMainCanvasRenderer';
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
  exportMirc,
  downloadFile,
  cyrb53,
  emptyBlock,
  iterativeFill,
  checkIrcByteLimits,
} from '../ascii';

import { getMirrorPositions, applyMirrored } from '../utils/mirror';
import { bresenhamLine } from '../utils/bresenham';
import { storeDiffBlocks as storeDiffBlockFn } from '../utils/diffBlocks';
import type { DiffBlocks } from '../utils/diffBlocks';
import type { Block } from '../types';

defineOptions({ name: 'Editor' });

// ─── Props & Emits ──────────────────────────────────────────────
const props = withDefaults(defineProps<{
  updateCanvas?: boolean;
  yOffset?: number;
  canvasxy?: string;
  brush?: boolean;
  updateascii?: boolean;
  resetSelect?: boolean;
}>(), {
  updateCanvas: false,
  yOffset: 0,
  canvasxy: '',
  brush: false,
  updateascii: false,
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
const { show: toastShow } = useToast();
const { copyText } = useClipboard();
const { renderBlock, clearMainCanvas } = useMainCanvasRenderer();

// ─── Template Refs ──────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvastoolsRef = ref<HTMLCanvasElement | null>(null);
const editorMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const editorPanel = ref<HTMLElement | null>(null);

// ─── Canvas Contexts (NOT reactive — performance critical) ──────
let ctx: CanvasRenderingContext2D | null = null;
let toolCtx: CanvasRenderingContext2D | null = null;

// Timer IDs for delayRedrawCanvas cleanup
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingFrame: number | null = null;

// ─── Reactive State ─────────────────────────────────────────────
const canvasSize = reactive({ width: 512, height: 512 });
const x = ref(0);
const y = ref(0);
const atTopHalf = ref(0);
const top = ref<number | false>(false);
const redraw = ref(true);
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
const isUsingKeyboard = ref(false);
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
const canvasX = computed(() => x.value * blockWidth);
const canvasY = computed(() => y.value * blockHeight);
const toolbarState = computed(() => toolbarStore.toolbarState);
const mirrorX = computed(() => toolbarState.value.mirrorX);
const mirrorY = computed(() => toolbarState.value.mirrorY);
const debugPanelState = computed(() => panelStore.debugPanel);
const selectBlocks = computed(() => toolbarStore.selectBlocks);
const options = computed(() => store.options);
const haveSelectBlocks = computed(() => !!selectBlocks.value.length);
const mircColours = computed(() => mircColours99);
const brushLibraryState = computed(() => panelStore.brushLibrary);
const gridView = computed(() => toolbarState.value.gridView);
const halfBlockEditing = computed(() => toolbarState.value.halfBlockEditing);

const asciiBlockAtXy = computed(() => {
  return currentAsciiLayerBlocks.value[y.value] &&
    currentAsciiLayerBlocks.value[y.value][x.value]
    ? currentAsciiLayerBlocks.value[y.value][x.value]
    : false;
});

const maxBrushSizeComp = computed(() => maxBrushSize);

const currentAsciiWidth = computed(
  () => currentSelectedLayer.value.width,
);
const currentAsciiHeight = computed(() =>
  currentSelectedLayer.value.height > 2184
    ? 2184
    : currentSelectedLayer.value.height,
);

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

const emptyBlockComp = computed(() => emptyBlock);

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
    _left: number,
    _topVal: number,
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

    top.value = _topVal;
    canvasSize.width = width;
    canvasSize.height = height;

    store.changeAsciiWidthHeight({ layers: [...layers] });

    toastShow(`${canvasBlockWidth} x ${canvasBlockHeight}`);
    await delayRedrawCanvas(true);
  },
});

const panelStyle = computed(() => canvasPanel.style.value);

// ─── Watchers ───────────────────────────────────────────────────
watch(currentAsciiHeight, (val) => {
  canvasSize.height = val * blockHeight;
});

watch(currentAsciiWidth, (val) => {
  canvasSize.width = val * blockWidth;
});

watch(currentAscii, async (val, old) => {
    if (JSON.stringify(val) !== JSON.stringify(old)) {
      canvasSize.width = currentAsciiWidth.value * blockWidth;
      canvasSize.height = currentAsciiHeight.value * blockHeight;

      // Reset panel position on tab switch
      canvasPanel.setPosition(val?.x ?? 0, val?.y ?? 0);
      canvasPanel.setDimensions(
        currentAsciiWidth.value * blockWidthComp.value,
        currentAsciiHeight.value * blockHeightComp.value,
      );

      await delayRedrawCanvas();
    }
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

watch(currentTool, async () => {
  warnInvisibleLayer();

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

watch(halfBlockEditing, () => {
  if (gridView.value) {
    clearToolCanvas();
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
  const canvas = canvasRef.value;
  if (canvas) {
    // willReadFrequently: canvas reset pattern (canvas.width = canvas.width)
    // triggers implicit readback; hint avoids repeated Chrome warnings.
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.font = '13px Hack';
  }
  const tools = canvastoolsRef.value;
  if (tools) {
    // willReadFrequently: tools canvas also uses width-reset clear pattern.
    toolCtx = tools.getContext('2d', { willReadFrequently: true });
  }
  await delayRedrawCanvas();
});

onUnmounted(() => {
  hotkeys.unbind('*', 'editor');
  canvasPanel.cleanup();

  // Clean up pending canvas redraw timers
  if (pendingTimeout !== null) {
    clearTimeout(pendingTimeout);
    pendingTimeout = null;
  }
  if (pendingFrame !== null) {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }
});

// ─── Init (equivalent to created() — runs during setup) ─────────
if (currentAsciiLayerBlocks.value) {
  canvasSize.width = currentAsciiWidth.value * blockWidth;
  canvasSize.height = currentAsciiHeight.value * blockHeight;
  // delayRedrawCanvas will be called in onMounted
}

// ─── Methods ────────────────────────────────────────────────────
function startExport(type: string) {
  const ascii = exportMirc();

  const checkLines = checkIrcByteLimits(ascii.output.join(''));

  if (checkLines.length) {
    const displayLines = checkLines.join(', ');
    toastShow(
      `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
      { type: 'error', position: 'bottom-center', duration: 1200 },
    );
  }

  switch (type) {
    case 'clipboard':
      copyText(ascii.output.join('')).then(
        () => {
          toastShow('Copied mIRC to clipboard!', { type: 'success' });
        },
        () => {
          toastShow('Error when copying mIRC to clipboard!', {
            type: 'error',
          });
        },
      );
      break;

    default:
    case 'file':
      downloadFile(ascii.output.join(''), ascii.filename, 'text/plain');
      break;
  }
}

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

async function canvasKeyDown(char: string) {
  if (
    currentAsciiLayerBlocks.value[textEditing.value.startY!] &&
    currentAsciiLayerBlocks.value[textEditing.value.startY!][textEditing.value.startX!]
  ) {
    let targetBlock =
      currentAsciiLayerBlocks.value[textEditing.value.startY!][
        textEditing.value.startX!
      ];
    let oldBlock: Block = {};

    switch (char) {
      case 'Backspace':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY!][
            textEditing.value.startX! - 1
          ]
        ) {
          targetBlock =
            currentAsciiLayerBlocks.value[textEditing.value.startY!][
              textEditing.value.startX! - 1
            ];

          oldBlock = { ...targetBlock };

          delete currentAsciiLayerBlocks.value[textEditing.value.startY!][
            textEditing.value.startX! - 1
          ]['char'];

          recordDiff(
            textEditing.value.startX!,
            textEditing.value.startY!,
            oldBlock,
            currentAsciiLayerBlocks.value[textEditing.value.startY!][
              textEditing.value.startX! - 1
            ],
          );

          textEditing.value.startX! -= 1;
        }

      // eslint-disable-next-line no-fallthrough
      case 'Delete':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY!][
            textEditing.value.startX!
          ]
        ) {
          targetBlock =
            currentAsciiLayerBlocks.value[textEditing.value.startY!][
              textEditing.value.startX!
            ];

          oldBlock = { ...targetBlock };

          delete currentAsciiLayerBlocks.value[textEditing.value.startY!][
            textEditing.value.startX!
          ]['char'];

          recordDiff(
            textEditing.value.startX!,
            textEditing.value.startY!,
            oldBlock,
            targetBlock,
          );
        }

        applyMirrored(
          textEditing.value.startX!, textEditing.value.startY!,
          currentAsciiWidth.value, currentAsciiHeight.value,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            const block = currentAsciiLayerBlocks.value[my]?.[mx];
            if (!block) return;
            oldBlock = { ...block };
            delete block['char'];
            recordDiff(mx, my, oldBlock, block);
          },
        );

        break;

      case 'Enter':
        if (currentAsciiLayerBlocks.value[textEditing.value.startY! + 1]?.[0]) {
          textEditing.value.startX = 0;
          textEditing.value.startY! += 1;
        }
        break;

      case 'ArrowUp':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY! - 1]?.[
            textEditing.value.startX!
          ]
        ) {
          textEditing.value.startY! -= 1;
        }
        break;

      case 'ArrowDown':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY! + 1]?.[
            textEditing.value.startX!
          ]
        ) {
          textEditing.value.startY! += 1;
        }
        break;

      case 'ArrowLeft':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY!]?.[
            textEditing.value.startX! - 1
          ]
        ) {
          textEditing.value.startX! -= 1;
        }
        break;

      case 'ArrowRight':
        if (
          currentAsciiLayerBlocks.value[textEditing.value.startY!]?.[
            textEditing.value.startX! + 1
          ]
        ) {
          textEditing.value.startX! += 1;
        }
        break;

      default:
        if (char.length === 1) {
          oldBlock = { ...targetBlock };
          targetBlock.char = char;

          if (canFg.value) {
            targetBlock.fg = currentFg.value;
          }

          recordDiff(
            textEditing.value.startX!,
            textEditing.value.startY!,
            oldBlock,
            targetBlock,
          );

          applyMirrored(
            textEditing.value.startX!, textEditing.value.startY!,
            currentAsciiWidth.value, currentAsciiHeight.value,
            mirrorX.value, mirrorY.value,
            (mx, my) => {
              const block = currentAsciiLayerBlocks.value[my]?.[mx];
              if (!block) return;
              oldBlock = { ...block };
              if (canFg.value) {
                block.fg = currentFg.value;
              }
              block.char = char;
              recordDiff(mx, my, oldBlock, block);
            },
          );

          if (
            currentAsciiLayerBlocks.value[textEditing.value.startY!]?.[
              textEditing.value.startX! + 1
            ]
          ) {
            textEditing.value.startX!++;
          } else {
            textEditing.value.startX = 0;

            if (textEditing.value.startY! < currentAsciiHeight.value) {
              textEditing.value.startY!++;
            }
          }
        }

        break;
    }
  }

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
    toolCtx.fillStyle = mircColours.value[0];

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

async function drawGrid() {
  if (!toolCtx) return;
  const w = canvasSize.width;
  const h = canvasSize.height;

  toolCtx.beginPath();

  for (let gx = 1; gx <= w; gx += blockWidth) {
    toolCtx.moveTo(gx, 0);
    toolCtx.lineTo(gx, h);
  }

  toolCtx.strokeStyle = 'rgba(40, 40, 40, 1)';
  toolCtx.lineWidth = 1;
  toolCtx.setLineDash([1]);

  toolCtx.stroke();

  toolCtx.beginPath();
  for (let gy = 1; gy <= h; gy += halfBlockEditing.value ? (blockHeight / 2) : blockHeight) {
    toolCtx.moveTo(0, gy);
    toolCtx.lineTo(w, gy);
  }

  toolCtx.stroke();
}

async function redrawCanvas(force = false) {
  if (!ctx) return;
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
        canvasXVal = blockWidth * entry.x;
        canvasYVal = blockHeight * entry.y;
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
          blockWidth,
          blockHeight,
          mircColours.value,
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
      clearMainCanvas(ctx, canvasRef.value, canvasSize.width, canvasSize.height);

      for (cy = 0; cy < currentAsciiHeight.value + 1; cy++) {
        canvasYVal = blockHeight * cy;

        if (
          options.value.renderOffScreen &&
          top.value !== false &&
          !checkVisibleFn(top.value + canvasYVal - props.yOffset!)
        ) {
          continue;
        }

        for (cx = 0; cx < currentAsciiWidth.value + 1; cx++) {
          canvasXVal = blockWidth * cx;

          curBlock = { ...merged[cy][cx] };

          renderBlock(
            ctx,
            curBlock,
            canvasXVal,
            canvasYVal,
            blockWidth,
            blockHeight,
            mircColours.value,
          );
        }
      }
    }
  }
}

async function dispatchBlocks(clearDiff = false) {
  diffBlocks.old = diffBlocks.old.flat();
  diffBlocks.new = diffBlocks.new.flat();

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
        toolbarStore.changeTool(0);
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
    atTopHalf.value = Math.floor(e.offsetY / (blockHeight / 2)) % 2 === 0 ? 1 : 0;
  }

  x.value = Math.floor(x.value / blockWidth);
  y.value = Math.floor(y.value / blockHeight);

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
          selecting.value.endX = canvasX.value + blockWidth;
          selecting.value.endY = canvasY.value + blockHeight;
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

async function delayRedrawCanvas(force = false) {
  if (redraw.value) {
    redraw.value = false;

    // Cancel any previous pending redraw
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout);
    }
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
    }

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;
      pendingFrame = requestAnimationFrame(async () => {
        pendingFrame = null;
        try {
          await redrawCanvas(force);
        } finally {
          redraw.value = true;
        }
      });
    }, 1000 / options.value.fps);
  }
}

function getBlocksWidthFn(blocks: Block[][]) {
  return getBlocksWidth(blocks);
}

function filterNullBlocksFn(blocks: Block[][]) {
  return filterNullBlocks(blocks);
}

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
      sy > Math.floor(selecting.value.startY! / blockHeight) - 1 &&
      sy < Math.floor(selecting.value.endY! / blockHeight)
    ) {
      if (!selectedBlocks.value[sy]) {
        selectedBlocks.value[sy] = [];
      }

      for (sx = 0; sx < currentAsciiWidth.value; sx++) {
        if (
          sx > Math.ceil(selecting.value.startX! / blockWidth) - 1 &&
          sx <= Math.ceil(selecting.value.endX! / blockWidth) - 1
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

async function drawRectangleBlock(rx: number, ry: number) {
  if (!toolCtx) return;
  const block = asciiBlockAtXy.value as Block | false;
  let indicatorColour = 1;

  if (block && typeof block === 'object') {
    indicatorColour = block.bg === 0 ? 1 : 0;
    if (block.bg === 8) {
      indicatorColour = 1;
    }
  }

  toolCtx.fillStyle = mircColours.value[indicatorColour];
  toolCtx.fillRect(rx * blockWidth, ry * blockHeight, blockWidth, blockHeight);
  toolCtx.setLineDash([1, 2]);
  toolCtx.strokeRect(rx * blockWidth, ry * blockHeight, blockWidth, blockHeight);
}

async function drawIndicator() {
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

async function drawTextIndicator() {
  const positions = getMirrorPositions(
    textEditing.value.startX!, textEditing.value.startY!,
    currentAsciiWidth.value, currentAsciiHeight.value,
    mirrorX.value, mirrorY.value,
  );
  for (const pos of positions) {
    drawRectangleBlock(pos.x, pos.y);
  }
}

async function drawBrushBlocks(
  brushX: number,
  brushY: number,
  brushBlock: Block,
  target: string | null = null,
  plain = false,
) {
  if (!toolCtx) return;
  const arrayY = brushY / blockHeight;
  const arrayX = brushX / blockWidth;
  const asciiWidth = currentAsciiWidth.value;
  const asciiHeight = currentAsciiHeight.value;
  const tBlock = currentAsciiLayerBlocks.value[arrayY]?.[arrayX];
  if (!tBlock) return;

  if (plain) {
    let indicatorColour = tBlock.bg === 0 ? 1 : 0;
    if (tBlock.bg === 8) {
      indicatorColour = 1;
    }
    toolCtx.fillStyle = mircColours.value[indicatorColour];
    toolCtx.fillRect(brushX, brushY, blockWidth, blockHeight);

    applyMirrored(
      arrayX, arrayY, asciiWidth, asciiHeight,
      mirrorX.value, mirrorY.value,
      (mx, my) => {
        toolCtx.fillRect(
          mx * blockWidth, my * blockHeight, blockWidth, blockHeight,
        );
      },
    );
    return;
  }

  switch (target) {
    case 'bg':
      toolCtx.fillStyle =
        brushBlock.bg !== undefined
          ? mircColours.value[brushBlock.bg]
          : 'rgba(255,255,255,0.4)';
      break;

    case 'fg':
      toolCtx.fillStyle =
        brushBlock.fg !== undefined
          ? mircColours.value[brushBlock.fg]
          : '#FFFFFF';
      break;

    default:
      if (canText.value && brushBlock.char !== undefined) {
        toolCtx.font = 'Hack 13px';
        toolCtx.fillStyle = canFg.value
          ? mircColours.value[brushBlock.fg]
          : '#FFFFFF';
        toolCtx.fillText(brushBlock.char, brushX, brushY + blockHeight - 3);

        applyMirrored(
          arrayX, arrayY, asciiWidth, asciiHeight,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            toolCtx.fillText(
              brushBlock.char!,
              mx * blockWidth,
              my * blockHeight + blockHeight - 3,
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
    toolCtx.strokeRect(brushX, brushY, blockWidth, blockHeight);
    toolCtx.fillRect(brushX, brushY, blockWidth, blockHeight);

    applyMirrored(
      arrayX, arrayY, asciiWidth, asciiHeight,
      mirrorX.value, mirrorY.value,
      (mx, my) => {
        toolCtx.fillRect(
          mx * blockWidth, my * blockHeight, blockWidth, blockHeight,
        );
        toolCtx.setLineDash([1, 2]);
        toolCtx.strokeRect(
          mx * blockWidth, my * blockHeight, blockWidth, blockHeight,
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
  const arrayY = brushY / blockHeight;
  const arrayX = brushX / blockWidth;

  const tBlock = currentAsciiLayerBlocks.value[arrayY][arrayX];
  const ob = { ...currentAsciiLayerBlocks.value[arrayY][arrayX] };

  const topChar = '\u2580'; // ▀
  const bottomChar = '\u2584'; // ▄
  const fullChar = ' ';

  toolCtx.font = 'Hack 13px';
  toolCtx.fillStyle = mircColours.value[currentFg.value];
  toolCtx.fillText(
    atTopHalf.value ? topChar : bottomChar,
    brushX,
    brushY + blockHeight - 3,
  );

  if (canTool.value) {
    if (
      (tBlock.char === topChar && !atTopHalf.value) ||
      (tBlock.char === bottomChar && atTopHalf.value)
    ) {
      if (currentFg.value === tBlock.fg) {
        tBlock['bg'] = currentFg.value;
        tBlock['char'] = fullChar;
      } else {
        tBlock['bg'] = currentFg.value;
        tBlock['char'] = !atTopHalf.value ? topChar : bottomChar;
      }
    } else {
      tBlock['fg'] = currentFg.value;
      tBlock['char'] = atTopHalf.value ? topChar : bottomChar;
    }

    await recordDiff(arrayX, arrayY, ob, tBlock);
  }

  toolCtx.restore();
}

async function drawBrush(plain = false) {
  await clearToolCanvas();
  let brushDiffX = 0;
  let xLength: number | false = false;

  for (let i = 0; i <= brushBlocks.value.length; i++) {
    if (brushBlocks.value[i] && xLength === false) {
      brushDiffX = Math.floor(brushBlocks.value[i].length / 2) * blockWidth;
      xLength = brushBlocks.value[i].length;
      break;
    }
  }

  const brushDiffY = Math.floor(brushBlocks.value.length / 2) * blockHeight;

  for (let by = 0; by < brushBlocks.value.length; by++) {
    if (!brushBlocks.value[by]) continue;

    for (let bx = 0; bx < xLength; bx++) {
      if (
        !brushBlocks.value[by][bx] ||
        JSON.stringify(brushBlocks.value[by][bx]) === '{}'
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

      const brushX = x.value * blockWidth + bx * blockWidth - brushDiffX;
      const brushY = y.value * blockHeight + by * blockHeight - brushDiffY;

      const arrayY = brushY / blockHeight;
      const arrayX = brushX / blockWidth;

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

          if (canTool.value) {
            await recordDiff(arrayX, arrayY, ob, brushBlock);
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

async function eraser() {
  if (canTool.value) {
    const brushDiffX =
      Math.floor(brushBlocks.value[0].length / 2) * blockWidth;
    const brushDiffY =
      Math.floor(brushBlocks.value.length / 2) * blockHeight;

    for (let ey = 0; ey < brushBlocks.value.length; ey++) {
      for (let ex = 0; ex < brushBlocks.value[0].length; ex++) {
        const brushX =
          x.value * blockWidth + ex * blockWidth - brushDiffX;
        const brushY =
          y.value * blockHeight + ey * blockHeight - brushDiffY;

        const arrayY = brushY / blockHeight;
        const arrayX = brushX / blockWidth;

        if (currentAsciiLayerBlocks.value[arrayY] === undefined) continue;

        if (
          currentAsciiLayerBlocks.value[arrayY][arrayX] === undefined ||
          JSON.stringify(brushBlocks.value[ey][ex]) === '{}'
        ) {
          continue;
        }

        const tBlock = currentAsciiLayerBlocks.value[arrayY][arrayX];
        const ob = { ...currentAsciiLayerBlocks.value[arrayY][arrayX] };

        if (canFg.value && tBlock.fg !== undefined) {
          delete tBlock['fg'];
        }
        if (canBg.value && tBlock.bg !== undefined) {
          delete tBlock['bg'];
        }
        if (canText.value && tBlock.char !== undefined) {
          delete tBlock['char'];
        }

        recordDiff(arrayX, arrayY, ob, tBlock);

        applyMirrored(
          arrayX, arrayY,
          currentAsciiWidth.value, currentAsciiHeight.value,
          mirrorX.value, mirrorY.value,
          (mx, my) => {
            const block = currentAsciiLayerBlocks.value[my]?.[mx];
            if (!block) return;
            const mOb = { ...block };
            if (canFg.value && block.fg !== undefined) {
              delete block['fg'];
            }
            if (canBg.value && block.bg !== undefined) {
              delete block['bg'];
            }
            if (canText.value && block.char !== undefined) {
              delete block['char'];
            }
            recordDiff(mx, my, mOb, block);
          },
        );
      }
    }
  }
}

function fill(eraser = false) {
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
  atTopHalf,
  top,
  redraw,
  canTool,
  textEditing,
  selecting,
  isMouseOnCanvas,
  selectedBlocks,
  diffBlocks,
  isUsingKeyboard,
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
  mircColours,
  brushLibraryState,
  gridView,
  halfBlockEditing,
  asciiBlockAtXy,
  maxBrushSize: maxBrushSizeComp,
  currentAsciiWidth,
  currentAsciiHeight,
  imageOverlay,
  imageOverlayStyle,
  canvasTransparent,
  emptyBlock: emptyBlockComp,
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
  getBlocksWidth: getBlocksWidthFn,
  filterNullBlocks: filterNullBlocksFn,
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

/* Bottom-middle edge */
.ab-resize-handle-bm {
  left: 50%;
  bottom: -4px;
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
</style>
