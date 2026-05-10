<template>
  <div>
    <div
      class="ab-card overflow-x-scroll overflow-y-scroll h-full"
      :h="blocksWidthHeight.h"
    >
      <div
        :style="`height: ${blocksWidthHeight.h}px;width: ${blocksWidthHeight.w}px;`"
        @mouseup.right="openContextMenu"
      >
        <canvas
          ref="brushcanvas"
          id="brushcanvas"
          class="brushcanvas"
          @mousemove="canvasMouseMove"
          @mousedown.left="processClick"
          @mouseup="canTool = false"
          :width="blocksWidthHeight.w"
          :height="blocksWidthHeight.h"
          @mouseenter="disableToolbarMoving"
          @mouseleave="enableToolbarMoving"
        />

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
              Export Brush to Clipboard
            </li>
            <li
              @click="startExport('file')"
              class="ab-context-menu-item"
            >
              Export Brush to File
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Block } from '../../types'
import ContextMenu from './ContextMenu.vue'
import {
  mircColours99,
  blockWidth,
  blockHeight,
  getBlocksWidth,
  filterNullBlocks,
  toolbarIcons,
  emptyBlock,
  canvasToPng as canvasToPngUtil,
  cyrb53,
  exportMirc,
  downloadFile,
} from '../../ascii'
import { useAsciiBirdStore } from '../../store'
import { useToast } from '../../composables/useToast'
import { useClipboard } from '../../composables/useClipboard'

// ─── Composables ────────────────────────────────────────
const store = useAsciiBirdStore()
const { show: toastShow } = useToast()
const { copyText } = useClipboard()

// ─── Refs ───────────────────────────────────────────────
const brushcanvas = ref<HTMLCanvasElement>()
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()
const ctx = ref<CanvasRenderingContext2D | null>(null)
const redraw = ref(true)
const canTool = ref(false)
const hasChanged = ref(false)
const x = ref(0)
const y = ref(0)

// ─── Computed ───────────────────────────────────────────
const canvasRef = brushcanvas
const renderBlockWidth = computed(
  () => blockWidth * store.blockSizeMultiplier,
)
const renderBlockHeight = computed(
  () => blockHeight * store.blockSizeMultiplier,
)
const brushBlocks = computed(() => store.brushBlocks)
const gridView = computed(() => store.toolbarState.gridView)
const currentTool = computed(() => toolbarIcons[store.currentTool] ?? null)
const isDefault = computed(() => currentTool.value?.name === 'default')
const isBrushing = computed(() => currentTool.value?.name === 'brush')
const isErasing = computed(() => currentTool.value?.name === 'eraser')
const hash = computed(() => cyrb53(JSON.stringify(brushBlocks.value)))
const blocksWidthHeight = computed(() => {
  const blocks = brushBlocks.value
  return {
    w: getBlocksWidth(blocks) * renderBlockWidth.value,
    h: (blocks?.length ?? 0) * renderBlockHeight.value,
  }
})

// ─── Watcher (consolidated) ─────────────────────────────
watch(
  () => [
    brushBlocks.value,
    store.currentAscii,
    store.brushSizeHeight,
    store.brushSizeWidth,
    store.isTargettingBg,
    store.isTargettingFg,
    store.isTargettingChar,
    store.currentFg,
    store.currentBg,
    store.currentChar,
    store.blockSizeMultiplier,
    gridView.value,
  ],
  () => delayRedrawCanvas(),
)

// ─── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  if (brushcanvas.value) {
    ctx.value = brushcanvas.value.getContext('2d')
  }
  delayRedrawCanvas()
})

// ─── Methods ────────────────────────────────────────────
function openContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenuRef.value?.open({ pageX: e.layerX, pageY: e.layerY })
}

function startExport(type: string) {
  const ascii = exportMirc(brushBlocks.value)
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
  store.pushBrushLibrary(brushBlocks.value)
  toastShow('Saved brush to Library', { type: 'success' })
  contextMenuRef.value?.close()
}

function canvasToPng() {
  if (!brushcanvas.value) return
  canvasToPngUtil(brushcanvas.value, `brush-${hash.value}.png`)
  contextMenuRef.value?.close()
}

function processClick(e: MouseEvent) {
  if (e.offsetX >= 0) {
    x.value = e.offsetX
  }
  if (e.offsetY >= 0) {
    y.value = e.offsetY
  }

  x.value = Math.floor(x.value / renderBlockWidth.value)
  y.value = Math.floor(y.value / renderBlockHeight.value)

  if (isErasing.value) {
    canTool.value = true
    hasChanged.value = true
    eraseBlock()
  }

  if (isBrushing.value) {
    canTool.value = true
    hasChanged.value = true
    addBlock()
  }
}

function drawGrid() {
  if (!ctx.value || !canvasRef.value) return
  const c = ctx.value
  const w = canvasRef.value.width
  const h = canvasRef.value.height

  c.beginPath()
  for (let gx = 0; gx <= w; gx += renderBlockWidth.value) {
    c.moveTo(gx, 0)
    c.lineTo(gx, h)
  }
  c.strokeStyle = 'rgba(0, 0, 0, 1)'
  c.lineWidth = 1
  c.setLineDash([1])
  c.stroke()

  c.beginPath()
  for (let gy = 0; gy <= h; gy += renderBlockHeight.value) {
    c.moveTo(0, gy)
    c.lineTo(w, gy)
  }
  c.stroke()
}

function drawPreview() {
  if (!canvasRef.value || !ctx.value) return

  const c = ctx.value
  c.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  c.fillStyle = mircColours99[1]
  c.font = '13px Hack'

  const blocks = brushBlocks.value
  if (!blocks) return

  const bw = getBlocksWidth(blocks)
  const rw = renderBlockWidth.value
  const rh = renderBlockHeight.value

  for (let by = 0; by < blocks.length; by++) {
    for (let bx = 0; bx < bw; bx++) {
      if (blocks[by]?.[bx]) {
        const curBlock = blocks[by][bx]

        if (curBlock.bg !== undefined) {
          c.fillStyle = mircColours99[curBlock.bg]
          c.fillRect(bx * rw, by * rh, rw, rh)
        }

        c.fillStyle =
          curBlock.fg !== undefined ? mircColours99[curBlock.fg] : '#FFFFFF'

        if (curBlock.char !== undefined) {
          c.fillText(curBlock.char, bx * rw, by * rh + rh - 3)
        }
      }
    }
  }

  if (gridView.value) {
    drawGrid()
  }
}

function delayRedrawCanvas() {
  if (redraw.value) {
    redraw.value = false
    setTimeout(() => {
      requestAnimationFrame(() => {
        drawPreview()
        redraw.value = true
      })
    }, 1000 / store.options.fps)
  }
}

function canvasMouseMove(e: MouseEvent) {
  if (canTool.value && (isErasing.value || isBrushing.value)) {
    processClick(e)
  }
}

function addBlock() {
  const block: Block = { ...emptyBlock }

  if (store.isTargettingBg) {
    block.bg = store.currentBg
  }
  if (store.isTargettingFg) {
    block.fg = store.currentFg
  }
  if (store.isTargettingChar) {
    block.char = store.currentChar
  }

  brushBlocks.value[y.value][x.value] = block
  delayRedrawCanvas()
}

function eraseBlock() {
  const target = brushBlocks.value[y.value]?.[x.value]
  if (!target) return

  if (store.isTargettingBg && target.bg !== undefined) {
    delete target.bg
  }
  if (store.isTargettingFg && target.fg !== undefined) {
    delete target.fg
  }
  if (store.isTargettingChar && target.char !== undefined) {
    delete target.char
  }

  delayRedrawCanvas()
}

function disableToolbarMoving() {
  canTool.value = false
  store.changeToolBarDraggable(false)
}

function enableToolbarMoving() {
  canTool.value = false

  if ((isErasing.value || isBrushing.value) && hasChanged.value) {
    store.setBrushBlocks(brushBlocks.value)
    store.changeToolBarDraggable(true)
    hasChanged.value = false
    toastShow('Saved brush to Library', { type: 'success' })
  }
}

// ─── Expose for test compatibility ──────────────────────
defineExpose({
  // State
  ctx,
  redraw,
  canvasRef,
  canTool,
  hasChanged,
  x,
  y,
  // Computed (store passthroughs for test compat)
  blockWidth: renderBlockWidth,
  blockHeight: renderBlockHeight,
  blockSizeMultiplier: computed(() => store.blockSizeMultiplier),
  currentAscii: computed(() => store.currentAscii),
  toolbarState: computed(() => store.toolbarState),
  isTargettingBg: computed(() => store.isTargettingBg),
  isTargettingFg: computed(() => store.isTargettingFg),
  isTargettingChar: computed(() => store.isTargettingChar),
  canFg: computed(() => store.isTargettingFg),
  canBg: computed(() => store.isTargettingBg),
  canText: computed(() => store.isTargettingChar),
  currentFg: computed(() => store.currentFg),
  currentBg: computed(() => store.currentBg),
  currentChar: computed(() => store.currentChar),
  brushSizeHeight: computed(() => store.brushSizeHeight),
  brushSizeWidth: computed(() => store.brushSizeWidth),
  brushSizeType: computed(() => store.brushSizeType),
  options: computed(() => store.options),
  mircColours: mircColours99,
  brushBlocks,
  gridView,
  currentTool,
  isDefault,
  isBrushing,
  isErasing,
  hash,
  blocksWidthHeight,
  contextMenuRef,
  // Methods
  getBlocksWidth,
  filterNullBlocks,
  openContextMenu,
  startExport,
  saveToLibrary,
  canvasToPng,
  processClick,
  drawGrid,
  drawPreview,
  delayRedrawCanvas,
  canvasMouseMove,
  addBlock,
  eraseBlock,
  disableToolbarMoving,
  enableToolbarMoving,
})
</script>
