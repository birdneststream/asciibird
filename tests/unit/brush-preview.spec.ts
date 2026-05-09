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
import BrushPreview from '@/components/parts/BrushPreview.vue'
import {
  blockWidth,
  blockHeight,
  emptyBlock,
  maxBrushSize,
} from '@/ascii'
import LZString from 'lz-string'
import {
  createMockStore,
  createMountOptions,
  toastedMock,
  globalStubs,
} from './helpers'

const localVue = createLocalVue()

let store: any

function mountBrushPreview(extra: any = {}) {
  const opts = createMountOptions(store, {
    localVue,
    ...extra,
  })
  return mount(BrushPreview, opts)
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BrushPreview.vue', () => {
  // ─── Mounting ───────────────────────────────────────────────

  describe('mounting', () => {
    it('mounts successfully', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.exists()).toBe(true)
    })
  })

  // ─── Computed Properties ────────────────────────────────────

  describe('computed properties', () => {
    it('brushOptions returns 7 brush types', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.brushOptions).toEqual([
        'Square', 'Circle', 'Cross', 'Grid',
        'Inverted Grid', 'H lines', 'V lines',
      ])
    })

    it('blockWidth returns scaled width', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.blockWidth).toBe(blockWidth)
    })

    it('blockHeight returns scaled height', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.blockHeight).toBe(blockHeight)
    })

    it('blockSizeMultiplier reads from store', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.blockSizeMultiplier).toBe(1)
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
      // Use a store with empty blocks and no created() auto-create
      // Since created() auto-creates, we test the computed directly
      const wrapper = mountBrushPreview()
      // Force brushBlocks to empty
      wrapper.vm.$store.state.brushBlocks = LZString.compressToUTF16('[]')
      expect(wrapper.vm.brushBlocksEmpty).toBe(true)
    })

    it('brushBlocksEmpty returns false for non-empty blocks', () => {
      const wrapper = mountBrushPreview()
      // created() triggers createBlocks which pushes to store
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
      const wrapper = mountBrushPreview()
      // Set input and call createBlocks with 5x5
      wrapper.vm.brushSizeHeightInput = 5
      wrapper.vm.updateBrushSize()
      expect(wrapper.vm.middleY).toBe(2)
    })

    it('middleX calculates middle of brush width', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 5
      wrapper.vm.updateBrushSize()
      expect(wrapper.vm.middleX).toBe(2)
    })
  })

  // ─── Data ───────────────────────────────────────────────────

  describe('data', () => {
    it('has correct default values', () => {
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.canDrag).toBe(true)
      expect(wrapper.vm.blocks).toBeDefined()
      expect(wrapper.vm.isInputtingBrushSize).toBe(false)
      expect(wrapper.vm.panel).toBeTruthy()
    })
  })

  // ─── createBlocks Brush Types ───────────────────────────────

  describe('createBlocks', () => {
    function mountWithBrush(
      w: number,
      h: number,
      type: string,
    ) {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = w
      wrapper.vm.brushSizeHeightInput = h
      wrapper.vm.brushSizeTypeInput = type
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
      // Center should be filled (flood fill starts at middle)
      const midY = Math.floor(5 / 2)
      const midX = Math.floor(5 / 2)
      expect(blocks[midY][midX].fg).toBeDefined()
    })

    it('cross 3x3 creates diagonal pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'cross')
      const blocks = wrapper.vm.blocks
      // (0,0) always filled
      expect(blocks[0][0].fg).toBeDefined()
      // (2,2) should be filled (both even)
      expect(blocks[2][2].fg).toBeDefined()
      // (1,1) should be filled (both odd)
      expect(blocks[1][1].fg).toBeDefined()
    })

    it('cross 1x1 forces at least one block', () => {
      const wrapper = mountWithBrush(1, 1, 'cross')
      expect(wrapper.vm.blocks[0][0].fg).toBeDefined()
    })

    it('grid 3x3 creates checkerboard pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'grid')
      const blocks = wrapper.vm.blocks
      // (0,0) always filled
      expect(blocks[0][0].fg).toBeDefined()
    })

    it('inverted grid 3x3 creates inverted pattern', () => {
      const wrapper = mountWithBrush(3, 3, 'inverted grid')
      const blocks = wrapper.vm.blocks
      expect(blocks[0][0].fg).toBeDefined()
      // Even rows or even cols should have blocks
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

    it('commits brushBlocks to store', () => {
      const wrapper = mountBrushPreview()
      const commitSpy = vi.spyOn(store, 'commit')

      wrapper.vm.createBlocks()

      expect(commitSpy).toHaveBeenCalledWith(
        'brushBlocks', expect.any(Array),
      )
    })

    it('calls updateBrushSize before creating', () => {
      const wrapper = mountBrushPreview()
      const commitSpy = vi.spyOn(store, 'commit')

      wrapper.vm.createBlocks()

      expect(commitSpy).toHaveBeenCalledWith(
        'updateBrushSize', expect.objectContaining({
          brushSizeHeight: expect.any(Number),
          brushSizeWidth: expect.any(Number),
          brushSizeType: expect.any(String),
        }),
      )
    })
  })

  // ─── fillTool ───────────────────────────────────────────────

  describe('fillTool', () => {
    it('fills blocks within circle', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 5
      wrapper.vm.brushSizeHeightInput = 5
      wrapper.vm.brushSizeTypeInput = 'circle'
      wrapper.vm.createBlocks()

      const blocks = wrapper.vm.blocks
      // Center should be filled after circle creation + fill
      const midY = Math.floor(5 / 2)
      const midX = Math.floor(5 / 2)
      expect(blocks[midY][midX].bg).toBe(wrapper.vm.currentBg)
    })

    it('respects boundary: returns when y >= brushSizeHeight', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 3
      wrapper.vm.brushSizeHeightInput = 3
      wrapper.vm.updateBrushSize()

      // Set blocks manually for testing
      wrapper.vm.blocks = [
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
        [{ ...emptyBlock }, { ...emptyBlock }, { ...emptyBlock }],
      ]

      // Calling with y >= height should not modify anything
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
      // y=1 would be out of bounds for the blocks array
      const before = JSON.stringify(wrapper.vm.blocks)
      wrapper.vm.fillTool(1, 0)
      const after = JSON.stringify(wrapper.vm.blocks)
      expect(before).toBe(after)
    })
  })

  // ─── updateBrushSize ────────────────────────────────────────

  describe('updateBrushSize', () => {
    it('commits updateBrushSize with input values', () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.brushSizeWidthInput = 5
      wrapper.vm.brushSizeHeightInput = 7
      wrapper.vm.brushSizeTypeInput = 'circle'

      const commitSpy = vi.spyOn(store, 'commit')
      wrapper.vm.updateBrushSize()

      expect(commitSpy).toHaveBeenCalledWith('updateBrushSize', {
        brushSizeHeight: 7,
        brushSizeWidth: 5,
        brushSizeType: 'circle',
      })
    })
  })

  // ─── Panel State Methods ────────────────────────────────────

  describe('panel state methods', () => {
    it('onResize updates panel and commits to store', () => {
      const wrapper = mountBrushPreview()
      const commitSpy = vi.spyOn(store, 'commit')

      wrapper.vm.onResize(10, 20, 100, 200)

      expect(wrapper.vm.panel.x).toBe(10)
      expect(wrapper.vm.panel.y).toBe(20)
      expect(wrapper.vm.panel.w).toBe(100)
      expect(wrapper.vm.panel.h).toBe(200)
      expect(commitSpy).toHaveBeenCalledWith(
        'changeBrushPreviewState', wrapper.vm.panel,
      )
    })

    it('onDragStop updates panel position and commits', () => {
      const wrapper = mountBrushPreview()
      const commitSpy = vi.spyOn(store, 'commit')

      wrapper.vm.onDragStop(50, 60)

      expect(wrapper.vm.panel.x).toBe(50)
      expect(wrapper.vm.panel.y).toBe(60)
      expect(commitSpy).toHaveBeenCalledWith(
        'changeBrushPreviewState', wrapper.vm.panel,
      )
    })
  })

  // ─── Watchers ───────────────────────────────────────────────

  describe('watchers', () => {
    it('isInputtingBrushSize emits inputtingbrush event', async () => {
      const wrapper = mountBrushPreview()
      wrapper.vm.isInputtingBrushSize = true
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('inputtingbrush')).toBeTruthy()
      expect(wrapper.emitted('inputtingbrush')![0]).toEqual([true])
    })

    it('brushSizeWidth syncs to brushSizeWidthInput', async () => {
      const wrapper = mountBrushPreview()
      store.state.toolbarState.brushSizeWidth = 5
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.brushSizeWidthInput).toBe(5)
    })

    it('brushSizeHeight syncs to brushSizeHeightInput', async () => {
      const wrapper = mountBrushPreview()
      store.state.toolbarState.brushSizeHeight = 7
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.brushSizeHeightInput).toBe(7)
    })

    it('brushSizeType syncs to brushSizeTypeInput', async () => {
      const wrapper = mountBrushPreview()
      store.state.toolbarState.brushSizeType = 'circle'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.brushSizeTypeInput).toBe('circle')
    })

    it('brushSizeHeightInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      wrapper.vm.brushSizeHeightInput = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('brushSizeWidthInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      wrapper.vm.brushSizeWidthInput = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('brushSizeTypeInput triggers createBlocks on change', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      wrapper.vm.brushSizeTypeInput = 'circle'
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('canFg triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.targetingFg = false
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('canBg triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.targetingBg = false
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('canText triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.targetingChar = false
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('currentFg triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.currentColourFg = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('currentBg triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.currentColourBg = 5
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })

    it('currentChar triggers createBlocks when updateBrush is true', async () => {
      const wrapper = mountBrushPreview()
      const spy = vi.spyOn(wrapper.vm, 'createBlocks')
      store.state.toolbarState.selectedChar = 'X'
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── Created Lifecycle ──────────────────────────────────────

  describe('created lifecycle', () => {
    it('initializes panel from brushPreviewState', () => {
      store.state.brushPreviewState = {
        x: 100, y: 200, w: 300, h: 400, visible: true,
      }
      const wrapper = mountBrushPreview()
      expect(wrapper.vm.panel.x).toBe(100)
      expect(wrapper.vm.panel.y).toBe(200)
      expect(wrapper.vm.panel.w).toBe(300)
      expect(wrapper.vm.panel.h).toBe(400)
    })

    it('creates blocks when brushBlocks is empty', () => {
      store.state.brushBlocks = LZString.compressToUTF16('[]')
      const wrapper = mountBrushPreview()
      // created() should have called createBlocks which generates blocks
      expect(wrapper.vm.blocks.length).toBeGreaterThan(0)
    })
  })
})
