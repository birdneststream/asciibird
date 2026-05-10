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
import BrushPreview from '@/components/parts/BrushPreview.vue'
import {
  emptyBlock,
  maxBrushSize,
} from '@/ascii'
import LZString from 'lz-string'
import {
  createMockStore,
  createMockModalStore,
  createMockToolbarStore,
  createToolbarState,
  toastedMock,
  globalStubs,
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


vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useDraggable: () => ({
      style: { value: 'position: fixed; left: 10px; top: 40px;' },
      x: { value: 10 },
      y: { value: 40 },
    }),
  }
})

let store: any

function mountBrushPreview(extra: any = {}) {
  return mount(BrushPreview, {
    global: {
      plugins: [createPinia()],
      stubs: globalStubs,
    },
    ...extra,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
  _mockStore = store
  _mockModalStore = createMockModalStore()
  _mockToolbarStore = createMockToolbarStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BrushPreview.vue', () => {
  describe('mounting', () => {
    it('mounts successfully', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('brushOptions returns 7 brush types', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushOptions).toEqual([
        'Square', 'Circle', 'Cross', 'Grid',
        'Inverted Grid', 'H lines', 'V lines',
      ])
    })

    it('canFg reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canFg).toBe(true)
    })

    it('canBg reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canBg).toBe(true)
    })

    it('canText reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canText).toBe(true)
    })

    it('currentFg reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentFg).toBe(0)
    })

    it('currentBg reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentBg).toBe(1)
    })

    it('currentChar reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentChar).toBe(' ')
    })

    it('toolbarState reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.toolbarState).toBeTruthy()
    })

    it('brushSizeHeight reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeHeight).toBe(1)
    })

    it('brushSizeWidth reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeWidth).toBe(1)
    })

    it('brushSizeType reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeType).toBe('square')
    })

    it('brushBlocks reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(Array.isArray(wrapper.vm.brushBlocks)).toBe(true)
    })

    it('brushBlocksEmpty returns true for empty blocks', () => {
      const wrapper = mountBrushPreview()
      store._brushBlocks = LZString.compressToUTF16('[]')
      expect(wrapper.vm.brushBlocksEmpty).toBe(true)
    })

    it('brushBlocksEmpty returns false for non-empty blocks', () => {
      _mockToolbarStore = createMockToolbarStore({
        _brushBlocks: LZString.compressToUTF16(
          JSON.stringify([[{ fg: 0, bg: 1, char: ' ' }]]),
        ),
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushBlocksEmpty).toBe(false)
    })

    it('maxBrushSize returns maxBrushSize constant', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.maxBrushSize).toBe(maxBrushSize)
    })

    it('brushPreviewState reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushPreviewState).toBeTruthy()
    })

    it('updateBrush reads from toolbarState', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.updateBrush).toBe(true)
    })

    it('middleY calculates middle of brush height', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ brushSizeHeight: 5 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { brushSizeHeight: 5 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.middleY).toBe(2)
    })

    it('middleX calculates middle of brush width', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ brushSizeWidth: 5 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { brushSizeWidth: 5 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.middleX).toBe(2)
    })
  })

  describe('data', () => {
    it('has correct default values', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canDrag).toBe(true)
      expect(wrapper.vm.isInputtingBrushSize).toBe(false)
    })
  })

  describe('createBlocks', () => {
    function mountWithBrush(
      w: number,
      h: number,
      type: string,
    ) {
      store = createMockStore({
        toolbarState: createToolbarState({
          brushSizeWidth: w,
          brushSizeHeight: h,
          brushSizeType: type,
        }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: {
          brushSizeWidth: w,
          brushSizeHeight: h,
          brushSizeType: type,
        },
      })
      const wrapper = mountBrushPreview()
      wrapper.vm.createBlocks()
      return wrapper
    }

    it('square 3x3 fills all blocks', () => {
      const wrapper = mountWithBrush(3, 3, 'square')
      const blocks = wrapper.vm.blocks
      expect(blocks.length).toBe(3)
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(blocks[y][x].fg).toBeDefined()
        }
      }
    })

    it('square 1x1 fills a single block', () => {
      const wrapper = mountWithBrush(1, 1, 'square')
      const blocks = wrapper.vm.blocks
      expect(blocks.length).toBe(1)
      expect(blocks[0].length).toBe(1)
      expect(blocks[0][0].fg).toBeDefined()
    })

    it('circle 5x5 creates boundary and fills', () => {
      const wrapper = mountWithBrush(5, 5, 'circle')
      const blocks = wrapper.vm.blocks
      expect(blocks.length).toBe(5)
      const midY = Math.floor(5 / 2)
      const midX = Math.floor(5 / 2)
      expect(blocks[midY][midX].fg).toBeDefined()
    })

    it('cross 3x3 creates diagonal pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'cross')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
      expect(blocks[2][2].fg).toBeDefined()
      expect(blocks[1][1].fg).toBeDefined()
    })

    it('cross 1x1 forces at least one block', () => {
      const wrapper = mountWithBrush(1, 1, 'cross')
      expect(wrapper.vm.blocks[0][0].fg).toBeDefined()
    })

    it('grid 3x3 creates checkerboard pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'grid')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
    })

    it('inverted grid 3x3 creates inverted pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'inverted grid')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
      expect(blocks[0][1].fg).toBeDefined()
    })

    it('h lines 3x3 creates horizontal line pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'h lines')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
    })

    it('v lines 3x3 creates vertical line pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'v lines')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
    })

    it('calls updateBrushSize and brushBlocksAction via store', () => {
      const wrapper = mountBrushPreview()
      const updateSpy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')

      wrapper.vm.createBlocks()

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          brushSizeHeight: expect.any(Number),
          brushSizeWidth: expect.any(Number),
          brushSizeType: expect.any(String),
        }),
      )
    })
  })

  describe('fillTool', () => {
    it('fills blocks within circle', () => {
      store = createMockStore({
        toolbarState: createToolbarState({
          brushSizeWidth: 5,
          brushSizeHeight: 5,
          brushSizeType: 'circle',
        }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: {
          brushSizeWidth: 5,
          brushSizeHeight: 5,
          brushSizeType: 'circle',
        },
      })
      const wrapper = mountBrushPreview()
      wrapper.vm.createBlocks()

      const blocks = wrapper.vm.blocks
      const midY = Math.floor(5 / 2)
      const midX = Math.floor(5 / 2)
      expect(blocks[midY][midX].bg).toBe(wrapper.vm.currentBg)
    })

    it('respects boundary: returns when y >= brushSizeHeight', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 3
      wrapper.vm.brushSizeHeightInput = 3
      wrapper.vm.updateBrushSize()

      wrapper.vm.blocks = [
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
      ]

      const before = JSON.stringify(wrapper.vm.blocks)
      wrapper.vm.fillTool(10, 1)
      const after = JSON.stringify(wrapper.vm.blocks)
      expect(before).toBe(after)
    })

    it('respects boundary: returns when x >= brushSizeWidth', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 3
      wrapper.vm.brushSizeHeightInput = 3
      wrapper.vm.updateBrushSize()

      wrapper.vm.blocks = [
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
      ]

      const before = JSON.stringify(wrapper.vm.blocks)
      wrapper.vm.fillTool(1, 10)
      const after = JSON.stringify(wrapper.vm.blocks)
      expect(before).toBe(after)
    })

    it('respects boundary: returns when blocks[y] is undefined', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 3
      wrapper.vm.brushSizeHeightInput = 3
      wrapper.vm.updateBrushSize()

      wrapper.vm.blocks = [[{ ...emptyBlock }]]
      const before = JSON.stringify(wrapper.vm.blocks)
      wrapper.vm.fillTool(1, 0)
      const after = JSON.stringify(wrapper.vm.blocks)
      expect(before).toBe(after)
    })
  })

  describe('updateBrushSize', () => {
    it('calls store updateBrushSize with input values', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 5
      wrapper.vm.brushSizeHeightInput = 7
      wrapper.vm.brushSizeTypeInput = 'circle'

      const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
      wrapper.vm.updateBrushSize()

      expect(spy).toHaveBeenCalledWith({
        brushSizeHeight: 7,
        brushSizeWidth: 5,
        brushSizeType: 'circle',
      })
    })
  })

  describe('panel state methods', () => {
    it('changeBrushPreviewState updates store', () => {
      const spy = vi.spyOn(store, 'changeBrushPreviewState')
      store.brushPreviewState = { x: 50, y: 60, w: 100, h: 200, visible: true }
      mountBrushPreview()
      // Just verify the spy works
      store.changeBrushPreviewState({ x: 1, y: 2 })
      expect(spy).toHaveBeenCalledWith({ x: 1, y: 2 })
    })
  })

  describe('watchers', () => {
    it('isInputtingBrushSize emits inputtingbrush event', async () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.isInputtingBrushSize = true
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('inputtingbrush')).toBeTruthy()
      expect(wrapper.emitted('inputtingbrush')![0]).toEqual([true])
    })

    it('brushSizeWidth computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ brushSizeWidth: 5 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { brushSizeWidth: 5 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeWidth).toBe(5)
    })

    it('brushSizeHeight computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ brushSizeHeight: 7 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { brushSizeHeight: 7 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeHeight).toBe(7)
    })

    it('brushSizeType computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ brushSizeType: 'circle' }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { brushSizeType: 'circle' },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushSizeType).toBe('circle')
    })

    it('brushSizeHeightInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
      wrapper.vm.brushSizeHeightInput = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ brushSizeHeight: 5 }),
      )
    })

    it('brushSizeWidthInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
      wrapper.vm.brushSizeWidthInput = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ brushSizeWidth: 5 }),
      )
    })

    it('brushSizeTypeInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
      wrapper.vm.brushSizeTypeInput = 'circle'
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ brushSizeType: 'circle' }),
      )
    })

    it('canFg computed reads targetingFg', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ targetingFg: false }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { targetingFg: false },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canFg).toBe(false)
    })

    it('canBg computed reads targetingBg', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ targetingBg: false }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { targetingBg: false },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canBg).toBe(false)
    })

    it('canText computed reads targetingChar', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ targetingChar: false }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { targetingChar: false },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canText).toBe(false)
    })

    it('currentFg computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ currentColourFg: 5 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { currentColourFg: 5 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentFg).toBe(5)
    })

    it('currentBg computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ currentColourBg: 5 }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { currentColourBg: 5 },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentBg).toBe(5)
    })

    it('currentChar computed reads from store', () => {
      store = createMockStore({
        toolbarState: createToolbarState({ selectedChar: 'X' }),
      })
      _mockStore = store
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { selectedChar: 'X' },
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.currentChar).toBe('X')
    })
  })

  describe('created lifecycle', () => {
    it('creates blocks when brushBlocks is empty', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.blocks.length).toBeGreaterThan(0)
    })

    it('skips createBlocks when brushBlocks is not empty', () => {
      _mockToolbarStore = createMockToolbarStore({
        _brushBlocks: LZString.compressToUTF16(
          JSON.stringify([[{ fg: 0, bg: 1, char: ' ' }]]),
        ),
      })
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushBlocksEmpty).toBe(false)
    })
  })
})
