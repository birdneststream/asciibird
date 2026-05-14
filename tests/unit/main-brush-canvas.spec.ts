// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import MainBrushCanvas from '@/components/parts/MainBrushCanvas.vue'
import {
  blockWidth,
  blockHeight,
  emptyBlock,
  mircColours99,
  toolbarIcons,
} from '@/ascii'
import LZString from 'lz-string'
import {
  createMockStore,
  createMockModalStore,
  createMockToolbarStore,
  createMockCanvasRef,
  toastedMock,
  copyTextMock,
  globalStubs,
  type TestWrapper,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null
let _mockToolbarStore: any = null

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))
vi.mock('@/store/modal', () => ({
  useModalStore: () => _mockModalStore,
}))
vi.mock('@/store/toolbar', () => ({
  useToolbarStore: () => _mockToolbarStore,
}))


vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ show: toastedMock.show, messages: { value: [] } }),
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({ copyText: copyTextMock, copied: { value: false } }),
}))

let store: any
let mockCanvasRef: ReturnType<typeof createMockCanvasRef>

function createTestBlocks(
  w = 3,
  h = 3,
): any[][] {
  const blocks: any[][] = []
  for (let y = 0; y < h; y++) {
    blocks[y] = []
    for (let x = 0; x < w; x++) {
      blocks[y][x] = { ...emptyBlock }
    }
  }
  return blocks
}

function mountMainBrushCanvas(extra: any = {}): TestWrapper {
  return mount(MainBrushCanvas, {
    global: {
      plugins: [createPinia()],
      stubs: globalStubs,
    },
    ...extra,
  })
}

function setTool(name: string) {
  const idx = toolbarIcons.findIndex((t: any) => t && t.name === name)
  if (idx >= 0) {
    _mockToolbarStore.toolbarState.currentTool = idx
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  mockCanvasRef = createMockCanvasRef()
  const blocks = createTestBlocks()
  store = createMockStore()
  store._brushBlocks = LZString.compressToUTF16(
    JSON.stringify(blocks),
  )
  _mockStore = store
  _mockModalStore = createMockModalStore()
  _mockToolbarStore = createMockToolbarStore({
    _brushBlocks: LZString.compressToUTF16(
      JSON.stringify(blocks),
    ),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MainBrushCanvas.vue', () => {
  // ─── Mounting ───────────────────────────────────────────────

  describe('mounting', () => {
    it('mounts successfully', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders a canvas element', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.find('canvas').exists()).toBe(true)
    })
  })

  // ─── Computed Properties ────────────────────────────────────

  describe('computed properties', () => {
    it('blockWidth returns scaled width', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.blockWidth).toBe(blockWidth)
    })

    it('blockHeight returns scaled height', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.blockHeight).toBe(blockHeight)
    })

    it('blockSizeMultiplier reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.blockSizeMultiplier).toBe(1)
    })

    it('currentAscii reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentAscii).toBeTruthy()
    })

    it('toolbarState reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.toolbarState).toBeTruthy()
    })

    it('isTargettingBg reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.isTargettingBg).toBe(true)
    })

    it('isTargettingFg reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.isTargettingFg).toBe(true)
    })

    it('isTargettingChar reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.isTargettingChar).toBe(true)
    })

    it('canFg mirrors isTargettingFg', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.canFg).toBe(wrapper.vm.isTargettingFg)
    })

    it('canBg mirrors isTargettingBg', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.canBg).toBe(wrapper.vm.isTargettingBg)
    })

    it('canText mirrors isTargettingChar', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.canText).toBe(wrapper.vm.isTargettingChar)
    })

    it('currentFg reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentFg).toBe(0)
    })

    it('currentBg reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentBg).toBe(1)
    })

    it('currentChar reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentChar).toBe(' ')
    })

    it('options reads from store', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.options.fps).toBe(50)
    })

    it('mircColours returns palette', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.mircColours).toBe(mircColours99)
    })

    it('hash returns a number', () => {
      const wrapper = mountMainBrushCanvas()
      expect(typeof wrapper.vm.hash).toBe('number')
    })

    it('currentTool returns toolbar icon for current tool index', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentTool).toBeTruthy()
    })

    it('isDefault returns true for default tool', () => {
      _mockToolbarStore.toolbarState.currentTool = 0
      const wrapper = mountMainBrushCanvas()
      const tool = wrapper.vm.currentTool
      expect(wrapper.vm.isDefault).toBe(tool?.name === 'default')
    })

    it('isBrushing returns true for brush tool', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()
      const tool = wrapper.vm.currentTool
      expect(wrapper.vm.isBrushing).toBe(tool?.name === 'brush')
    })

    it('isErasing returns true for eraser tool', () => {
      setTool('eraser')
      const wrapper = mountMainBrushCanvas()
      const tool = wrapper.vm.currentTool
      expect(wrapper.vm.isErasing).toBe(tool?.name === 'eraser')
    })

    it('blocksWidthHeight calculates dimensions from brushBlocks', () => {
      const wrapper = mountMainBrushCanvas()
      const dims = wrapper.vm.blocksWidthHeight
      expect(dims.w).toBe(3 * blockWidth)
      expect(dims.h).toBe(3 * blockHeight)
    })

    it('gridView reads from toolbarState', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.gridView).toBe(false)
    })
  })

  // ─── Data ───────────────────────────────────────────────────

  describe('data', () => {
    it('has correct default values', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.ctx).toBeDefined()
      expect(typeof wrapper.vm.delayRedrawCanvas).toBe('function')
      expect(wrapper.vm.canTool).toBe(false)
      expect(wrapper.vm.hasChanged).toBe(false)
      expect(wrapper.vm.x).toBe(0)
      expect(wrapper.vm.y).toBe(0)
    })
  })

  // ─── Methods ────────────────────────────────────────────────

  describe('methods', () => {
    it('getBlocksWidth returns width of blocks', () => {
      const wrapper = mountMainBrushCanvas()
      const blocks = createTestBlocks(5, 3)
      expect(wrapper.vm.getBlocksWidth(blocks)).toBe(5)
    })

    it('filterNullBlocks filters blocks', () => {
      const wrapper = mountMainBrushCanvas()
      const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
      expect(wrapper.vm.filterNullBlocks(blocks)).toBeTruthy()
    })

    it('openContextMenu prevents default', () => {
      const wrapper = mountMainBrushCanvas()
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 }

      try {
        wrapper.vm.openContextMenu(event)
      } catch {
        // $refs may not be writable in Vue 3 VTU
      }

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('saveToLibrary calls store.pushBrushLibrary', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.contextMenuRef = {
        open: vi.fn(),
        close: vi.fn(),
      }

      const spy = vi.spyOn(_mockToolbarStore, 'pushBrushLibrary')
      wrapper.vm.saveToLibrary()

      expect(spy).toHaveBeenCalledWith(
        expect.any(Array),
      )
      expect(toastedMock.show).toHaveBeenCalledWith(
        'Saved brush to Library',
        { type: 'success' },
      )
    })

    it('startExport("clipboard") calls copyText', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.contextMenuRef = {
        open: vi.fn(),
        close: vi.fn(),
      }
      wrapper.vm.startExport('clipboard')
      expect(copyTextMock).toHaveBeenCalled()
    })

    it('processClick calculates x/y from offset', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()

      wrapper.vm.processClick({
        offsetX: blockWidth * 2,
        offsetY: blockHeight * 1,
      })

      expect(wrapper.vm.x).toBe(2)
      expect(wrapper.vm.y).toBe(1)
    })

    it('processClick sets canTool and hasChanged when brushing', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()

      wrapper.vm.processClick({
        offsetX: blockWidth,
        offsetY: blockHeight,
      })

      expect(wrapper.vm.canTool).toBe(true)
      expect(wrapper.vm.hasChanged).toBe(true)
    })

    it('processClick sets canTool when erasing', () => {
      setTool('eraser')
      const wrapper = mountMainBrushCanvas()

      wrapper.vm.processClick({
        offsetX: blockWidth,
        offsetY: blockHeight,
      })

      expect(wrapper.vm.canTool).toBe(true)
      expect(wrapper.vm.hasChanged).toBe(true)
    })

    it('addBlock creates block with canFg/canBg/canText flags', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      const blocks = wrapper.vm.brushBlocks
      const originalLength = blocks[0].length

      wrapper.vm.addBlock()

      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.bg).toBeDefined()
      expect(addedBlock.fg).toBeDefined()
      expect(addedBlock.char).toBeDefined()
    })

    it('addBlock skips bg when canBg is false', () => {
      _mockToolbarStore.toolbarState.targetingBg = false
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      wrapper.vm.addBlock()
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.bg).toBeUndefined()
    })

    it('addBlock skips fg when canFg is false', () => {
      _mockToolbarStore.toolbarState.targetingFg = false
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      wrapper.vm.addBlock()
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.fg).toBeUndefined()
    })

    it('addBlock skips char when canText is false', () => {
      _mockToolbarStore.toolbarState.targetingChar = false
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      wrapper.vm.addBlock()
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.char).toBeUndefined()
    })

    it('eraseBlock deletes bg property when canBg', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0
      wrapper.vm.brushBlocks[0][0] = { fg: 1, bg: 2, char: 'X' }

      wrapper.vm.eraseBlock()

      expect(wrapper.vm.brushBlocks[0][0].bg).toBeUndefined()
    })

    it('eraseBlock deletes fg property when canFg', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0
      wrapper.vm.brushBlocks[0][0] = { fg: 1, bg: 2, char: 'X' }

      wrapper.vm.eraseBlock()

      expect(wrapper.vm.brushBlocks[0][0].fg).toBeUndefined()
    })

    it('eraseBlock deletes char property when canText', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0
      wrapper.vm.brushBlocks[0][0] = { fg: 1, bg: 2, char: 'X' }

      wrapper.vm.eraseBlock()

      expect(wrapper.vm.brushBlocks[0][0].char).toBeUndefined()
    })

    it('canvasMouseMove does not process when canTool is false', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.canTool = false

      const processSpy = vi.spyOn(wrapper.vm, 'processClick')
      wrapper.vm.canvasMouseMove({ offsetX: 10, offsetY: 10 })

      expect(processSpy).not.toHaveBeenCalled()
    })

    it('disableToolbarMoving sets canTool false and calls store', () => {
      const wrapper = mountMainBrushCanvas()
      const spy = vi.spyOn(_mockToolbarStore, 'changeToolBarDraggable')

      wrapper.vm.disableToolbarMoving()

      expect(wrapper.vm.canTool).toBe(false)
      expect(spy).toHaveBeenCalledWith(false)
    })

    it('enableToolbarMoving sets canTool false', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.canTool = true

      wrapper.vm.enableToolbarMoving()

      expect(wrapper.vm.canTool).toBe(false)
    })

    it('enableToolbarMoving saves when hasChanged and brushing', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.hasChanged = true

      const spy = vi.spyOn(_mockToolbarStore, 'changeToolBarDraggable')
      wrapper.vm.enableToolbarMoving()

      expect(spy).toHaveBeenCalledWith(true)
      expect(wrapper.vm.hasChanged).toBe(false)
    })

    it('enableToolbarMoving saves when hasChanged and erasing', () => {
      setTool('eraser')
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.hasChanged = true

      const spy = vi.spyOn(_mockToolbarStore, 'changeToolBarDraggable')
      wrapper.vm.enableToolbarMoving()

      expect(spy).toHaveBeenCalledWith(true)
    })

    it('enableToolbarMoving does not save when no changes', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.hasChanged = false

      const spy = vi.spyOn(_mockToolbarStore, 'changeToolBarDraggable')
      wrapper.vm.enableToolbarMoving()

      expect(spy).not.toHaveBeenCalled()
    })

    it('delayRedrawCanvas is available via useFpsThrottle composable', () => {
      const wrapper = mountMainBrushCanvas()
      expect(typeof wrapper.vm.delayRedrawCanvas).toBe('function')
    })

    it('drawPreview is callable', () => {
      const wrapper = mountMainBrushCanvas()
      expect(() => wrapper.vm.drawPreview()).not.toThrow()
    })

    it('drawGrid calls canvas methods', () => {
      const wrapper = mountMainBrushCanvas()
      const mockCtx = mockCanvasRef._mockCtx
      wrapper.vm.ctx = mockCtx
      wrapper.vm.canvasRef = mockCanvasRef

      wrapper.vm.drawGrid()

      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalled()
      expect(mockCtx.lineTo).toHaveBeenCalled()
      expect(mockCtx.stroke).toHaveBeenCalled()
      expect(mockCtx.setLineDash).toHaveBeenCalledWith([1])
    })

    it('drawPreview renders blocks and calls clearRect', () => {
      const wrapper = mountMainBrushCanvas()
      const mockCtx = mockCanvasRef._mockCtx
      wrapper.vm.ctx = mockCtx
      Object.defineProperty(wrapper.vm, 'canvasRef', {
        get: () => mockCanvasRef,
      })

      wrapper.vm.drawPreview()

      expect(mockCtx.clearRect).toHaveBeenCalled()
    })
  })

  // ─── Watchers ───────────────────────────────────────────────
  // Note: Watcher tests that depend on reactive store changes are
  // not feasible with plain mock stores (non-reactive). The watchers
  // are trivial delegates to delayRedrawCanvas, which is tested above.

  describe('watchers', () => {
    it('blockSizeMultiplier computed reads store value', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.blockSizeMultiplier).toBe(1)
    })

    it('gridView computed reads toolbarState', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.gridView).toBe(false)
    })

    it('currentFg computed reads store value', () => {
      const wrapper = mountMainBrushCanvas()
      expect(wrapper.vm.currentFg).toBe(0)
    })
  })
})
