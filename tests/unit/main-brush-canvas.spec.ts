// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount, createLocalVue } from '@vue/test-utils'
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
  createMountOptions,
  createMockCanvasRef,
  toastedMock,
  copyTextMock,
  globalStubs,
} from './helpers'

const localVue = createLocalVue()

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

function mountMainBrushCanvas(extra: any = {}) {
  const opts = createMountOptions(store, {
    localVue,
    ...extra,
  })
  return mount(MainBrushCanvas, opts)
}

function setTool(name: string) {
  const idx = toolbarIcons.findIndex((t: any) => t && t.name === name)
  if (idx >= 0) {
    store.state.toolbarState.currentTool = idx
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  mockCanvasRef = createMockCanvasRef()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MainBrushCanvas.vue', () => {
  beforeEach(() => {
    const blocks = createTestBlocks()
    store = createMockStore()
    store.state.brushBlocks = LZString.compressToUTF16(
      JSON.stringify(blocks),
    )
  })

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
      store.state.toolbarState.currentTool = 0
      const wrapper = mountMainBrushCanvas()
      // Default tool is index 0
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
      // ctx is set in mounted()
      expect(wrapper.vm.ctx).toBeDefined()
      // redraw may be false after mounted() calls delayRedrawCanvas
      expect(typeof wrapper.vm.redraw).toBe('boolean')
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

    it('openContextMenu prevents default and opens menu', () => {
      const wrapper = mountMainBrushCanvas()
      const menuRef = { open: vi.fn(), close: vi.fn() }
      wrapper.vm.$refs['main-brush-menu'] = menuRef

      const event = { preventDefault: vi.fn(), layerX: 10, layerY: 20 }
      wrapper.vm.openContextMenu(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(menuRef.open).toHaveBeenCalledWith({
        pageX: 10,
        pageY: 20,
      })
    })

    it('saveToLibrary commits pushBrushLibrary', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.$refs['main-brush-menu'] = {
        open: vi.fn(),
        close: vi.fn(),
      }

      const commitSpy = vi.spyOn(store, 'commit')
      wrapper.vm.saveToLibrary()

      expect(commitSpy).toHaveBeenCalledWith(
        'pushBrushLibrary',
        expect.any(Array),
      )
      expect(toastedMock.show).toHaveBeenCalledWith(
        'Saved brush to Library',
        { type: 'success' },
      )
    })

    it('startExport("clipboard") calls $copyText', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.$refs['main-brush-menu'] = {
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

      // Block should have bg, fg, char since all targeting flags are true
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.bg).toBeDefined()
      expect(addedBlock.fg).toBeDefined()
      expect(addedBlock.char).toBeDefined()
    })

    it('addBlock skips bg when canBg is false', () => {
      store.state.toolbarState.targetingBg = false
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      wrapper.vm.addBlock()
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.bg).toBeUndefined()
    })

    it('addBlock skips fg when canFg is false', () => {
      store.state.toolbarState.targetingFg = false
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.x = 0
      wrapper.vm.y = 0

      wrapper.vm.addBlock()
      const addedBlock = wrapper.vm.brushBlocks[0][0]
      expect(addedBlock.fg).toBeUndefined()
    })

    it('addBlock skips char when canText is false', () => {
      store.state.toolbarState.targetingChar = false
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

    it('disableToolbarMoving sets canTool false and commits', () => {
      const wrapper = mountMainBrushCanvas()
      const commitSpy = vi.spyOn(store, 'commit')

      wrapper.vm.disableToolbarMoving()

      expect(wrapper.vm.canTool).toBe(false)
      expect(commitSpy).toHaveBeenCalledWith(
        'changeToolBarDraggable', false,
      )
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

      const commitSpy = vi.spyOn(store, 'commit')
      wrapper.vm.enableToolbarMoving()

      expect(commitSpy).toHaveBeenCalledWith(
        'brushBlocks', expect.any(Array),
      )
      expect(commitSpy).toHaveBeenCalledWith(
        'changeToolBarDraggable', true,
      )
      expect(wrapper.vm.hasChanged).toBe(false)
    })

    it('enableToolbarMoving saves when hasChanged and erasing', () => {
      setTool('eraser')
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.hasChanged = true

      const commitSpy = vi.spyOn(store, 'commit')
      wrapper.vm.enableToolbarMoving()

      expect(commitSpy).toHaveBeenCalledWith(
        'brushBlocks', expect.any(Array),
      )
    })

    it('enableToolbarMoving does not save when no changes', () => {
      setTool('brush')
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.hasChanged = false

      const commitSpy = vi.spyOn(store, 'commit')
      wrapper.vm.enableToolbarMoving()

      expect(commitSpy).not.toHaveBeenCalledWith(
        'brushBlocks', expect.anything(),
      )
    })

    it('delayRedrawCanvas debounces with redraw flag', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.redraw = true

      wrapper.vm.delayRedrawCanvas()
      expect(wrapper.vm.redraw).toBe(false)
    })

    it('delayRedrawCanvas skips when redraw is false', () => {
      const wrapper = mountMainBrushCanvas()
      wrapper.vm.redraw = false

      const drawSpy = vi.spyOn(wrapper.vm, 'drawPreview')
      wrapper.vm.delayRedrawCanvas()
      expect(drawSpy).not.toHaveBeenCalled()
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
      // canvasRef returns $refs.brushcanvas which may not exist
      // Set it directly
      Object.defineProperty(wrapper.vm, 'canvasRef', {
        get: () => mockCanvasRef,
      })

      wrapper.vm.drawPreview()

      expect(mockCtx.clearRect).toHaveBeenCalled()
    })
  })

  // ─── Watchers ───────────────────────────────────────────────

  describe('watchers', () => {
    it('watches blockSizeMultiplier', async () => {
      const wrapper = mountMainBrushCanvas()
      const spy = vi.spyOn(wrapper.vm, 'delayRedrawCanvas')
      store.state.blockSizeMultiplier = 2
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('watches gridView', async () => {
      const wrapper = mountMainBrushCanvas()
      const spy = vi.spyOn(wrapper.vm, 'delayRedrawCanvas')
      store.state.toolbarState.gridView = true
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('watches currentFg', async () => {
      const wrapper = mountMainBrushCanvas()
      const spy = vi.spyOn(wrapper.vm, 'delayRedrawCanvas')
      store.state.toolbarState.currentColourFg = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })
  })
})
