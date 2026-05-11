<template>
  <div>
    <div class="ab-card overflow-x-scroll h-full">
      <div
        :style="`height: ${blocksWidthHeight.h}px;width: ${blocksWidthHeight.w}px;`"
      >
        <canvas
          ref="canvasEl"
          :id="canvasName"
          class="previewcanvas"
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
          @mouseup.right="openContextMenu"
        />
      </div>

      <context-menu
        ref="contextMenuRef"
        class="z-50"
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
            Export Brush to mIRC Clipboard
          </li>
          <li
            @click="startExport('file')"
            class="ab-context-menu-item"
          >
            Export Brush to mIRC File
          </li>
          <li
            @click="saveToLibrary()"
            class="ab-context-menu-item"
          >
            Save to Library
          </li>
        </ul>
      </context-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Block } from '../../types'
import {
  mircColours99,
  blockWidth,
  blockHeight,
  cyrb53,
  getBlocksWidth,
  filterNullBlocks,
  canvasToPng as canvasToPngUtil,
  exportMirc,
  downloadFile,
} from '../../ascii'
import ContextMenu from './ContextMenu.vue'
import { useAsciiBirdStore } from '../../store'
import { useToolbarStore } from '../../store/toolbar'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'

// ─── Props ──────────────────────────────────────────────
const props = withDefaults(
  defineProps<{ blocks?: Block[][] | false }>(),
  { blocks: false },
)

// ─── Composables ────────────────────────────────────────
const store = useAsciiBirdStore()
const toolbarStore = useToolbarStore()
const { show: toastShow } = useToast()
const { copyText } = useClipboard()

// ─── Refs ───────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement>()
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()
const ctx = ref<CanvasRenderingContext2D | null>(null)
const redraw = ref(true)

// Timer IDs for delayRedrawCanvas cleanup
let pendingTimeout: ReturnType<typeof setTimeout> | null = null
let pendingFrame: number | null = null

// ─── Computed ───────────────────────────────────────────
const renderBlockWidth = computed(
  () => blockWidth * store.blockSizeMultiplier,
)
const renderBlockHeight = computed(
  () => blockHeight * store.blockSizeMultiplier,
)
const getBlocks = computed(() =>
  props.blocks === false ? toolbarStore.brushBlocks : props.blocks,
)
const isMainCanvas = computed(() => props.blocks === false)
const hash = computed(() => cyrb53(JSON.stringify(getBlocks.value)))
const canvasName = computed(() => `${hash.value}-brush-canvas`)
const canvasRef = canvasEl
const blocksWidthHeight = computed(() => ({
  w: getBlocksWidth(getBlocks.value) * renderBlockWidth.value,
  h: (getBlocks.value?.length ?? 0) * renderBlockHeight.value,
}))

// ─── Watcher (consolidated) ─────────────────────────────
watch(
  () => [
    store.blockSizeMultiplier,
    getBlocks.value,
    store.currentAscii,
    toolbarStore.brushSizeHeight,
    toolbarStore.brushSizeWidth,
    toolbarStore.isTargettingBg,
    toolbarStore.isTargettingFg,
    toolbarStore.isTargettingChar,
    toolbarStore.currentFg,
    toolbarStore.currentBg,
    toolbarStore.currentChar,
  ],
  () => delayRedrawCanvas(),
)

// ─── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  if (canvasEl.value) {
    // willReadFrequently: frequent redraws benefit from software-backed canvas.
    ctx.value = canvasEl.value.getContext('2d', { willReadFrequently: true })
  }
  delayRedrawCanvas()
})

// ─── Methods ────────────────────────────────────────────
function openContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenuRef.value?.open({
    clientX: e.clientX,
    clientY: e.clientY,
  })
}

function startExport(type: string) {
  const ascii = exportMirc(getBlocks.value)
  switch (type) {
    case 'clipboard':
      copyText(ascii.output.join('')).then(
        () => {
          toastShow('Copied mIRC brush to clipboard!', { type: 'success' })
        },
        () => {
          toastShow('Error when copying mIRC to clipboard!', { type: 'error' })
        },
      )
      contextMenuRef.value?.close()
      break

    default:
    case 'file':
      downloadFile(
        ascii.output.join(''),
        `brush-${hash.value}.txt`,
        'text/plain',
      )
      contextMenuRef.value?.close()
      break
  }
}

function saveToLibrary() {
  toolbarStore.pushBrushLibrary(getBlocks.value)
  toastShow('Saved brush to Library', { type: 'success' })
  contextMenuRef.value?.close()
}

function canvasToPng() {
  if (!canvasEl.value) return
  canvasToPngUtil(canvasEl.value, `brush-${hash.value}.png`)
  contextMenuRef.value?.close()
}

function drawPreview() {
  if (!canvasRef.value || !ctx.value) return

  const c = ctx.value
  c.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  c.fillStyle = mircColours99[1]
  c.font = '13px Hack'

  const blocks = getBlocks.value
  if (!blocks) return

  const bw = getBlocksWidth(blocks)
  const rw = renderBlockWidth.value
  const rh = renderBlockHeight.value

  for (let y = 0; y < blocks.length; y++) {
    for (let x = 0; x < bw; x++) {
      if (blocks[y]?.[x]) {
        const curBlock = blocks[y][x]

        if (curBlock.bg !== undefined) {
          c.fillStyle = mircColours99[curBlock.bg]
          c.fillRect(x * rw, y * rh, rw, rh)
        }

        c.fillStyle =
          curBlock.fg !== undefined ? mircColours99[curBlock.fg] : '#FFFFFF'

        if (curBlock.char !== undefined) {
          c.fillText(curBlock.char, x * rw, y * rh + rh - 3)
        }
      }
    }
  }
}

function delayRedrawCanvas() {
  if (redraw.value) {
    redraw.value = false

    // Cancel any previous pending redraw
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout)
    }
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame)
    }

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null
        drawPreview()
        redraw.value = true
      })
    }, 1000 / store.options.fps)
  }
}

onUnmounted(() => {
  if (pendingTimeout !== null) {
    clearTimeout(pendingTimeout)
    pendingTimeout = null
  }
  if (pendingFrame !== null) {
    cancelAnimationFrame(pendingFrame)
    pendingFrame = null
  }
})

// ─── Expose for test compatibility ──────────────────────
defineExpose({
  // State
  ctx,
  redraw,
  canvasRef,
  // Computed
  blockWidth: renderBlockWidth,
  blockHeight: renderBlockHeight,
  blockSizeMultiplier: computed(() => store.blockSizeMultiplier),
  currentAscii: computed(() => store.currentAscii),
  toolbarState: computed(() => toolbarStore.toolbarState),
  isTargettingBg: computed(() => toolbarStore.isTargettingBg),
  isTargettingFg: computed(() => toolbarStore.isTargettingFg),
  isTargettingChar: computed(() => toolbarStore.isTargettingChar),
  currentFg: computed(() => toolbarStore.currentFg),
  currentBg: computed(() => toolbarStore.currentBg),
  currentChar: computed(() => toolbarStore.currentChar),
  brushSizeHeight: computed(() => toolbarStore.brushSizeHeight),
  brushSizeWidth: computed(() => toolbarStore.brushSizeWidth),
  brushSizeType: computed(() => toolbarStore.brushSizeType),
  options: computed(() => store.options),
  mircColours: mircColours99,
  hash,
  canvasName,
  getBlocks,
  isMainCanvas,
  blocksWidthHeight,
  // Methods
  getBlocksWidth,
  filterNullBlocks,
  openContextMenu,
  startExport,
  saveToLibrary,
  canvasToPng,
  drawPreview,
  delayRedrawCanvas,
})
</script>
