// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import LZString from 'lz-string'
import LayersLibrary from '@/components/LayersLibrary.vue'
import DebugPanel from '@/components/DebugPanel.vue'
import BrushLibrary from '@/components/BrushLibrary.vue'
import Toolbar from '@/components/Toolbar.vue'
import {
  toolbarIcons,
  blockWidth,
  blockHeight,
  setStore,
} from '@/ascii'
import {
  toastedMock,
  copyTextMock,
  setupHotkeysMocks,
  createMockStore,
  createMountOptions,
} from './helpers'

const localVue = createLocalVue()

setupHotkeysMocks()

let store: any

function mountOpts(extra: Record<string, any> = {}) {
  return createMountOptions(store, { localVue, ...extra })
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── LayersLibrary.vue ───────────────────────────────────────────

describe('LayersLibrary.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.findComponent(LayersLibrary).exists()).toBe(true)
  })

  it('computed blockWidth returns scaled block width', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.blockWidth).toBe(blockWidth)
  })

  it('computed blockHeight returns scaled block height', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.blockHeight).toBe(blockHeight)
  })

  it('computed layersLibraryState returns store state', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const state = wrapper.vm.layersLibraryState
    expect(state.x).toBe(10)
    expect(state.y).toBe(40)
  })

  it('onDragStop commits changeLayersLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onDragStop(50, 60)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeLayersLibraryState',
      expect.objectContaining({ x: 50, y: 60 }),
    )
  })

  it('onResize commits changeLayersLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      LayersLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onResize(10, 20, 300, 400)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeLayersLibraryState',
      expect.objectContaining({
        x: 10, y: 20, w: 300, h: 400,
      }),
    )
  })
})

// NOTE: DebugPanel template references `this.selecting` which is never
// declared as a prop, data, or computed — a pre-existing bug in the
// component. We inject a mock `selecting` object via data override so
// the template renders without error.

const debugPanelSelecting = {
  startX: null, startY: null, endX: null, endY: null,
}

function debugMountOpts(
  s: any, extra: Record<string, any> = {},
) {
  return createMountOptions(s, {
    localVue,
    propsData: { canvasX: 0, canvasY: 0 },
    data: () => ({ selecting: debugPanelSelecting }),
    ...extra,
  })
}

describe('DebugPanel.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.findComponent(DebugPanel).exists()).toBe(true)
  })

  it('computed getToolName returns current tool name', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.getToolName).toBe('default')
  })

  it('computed getToolName returns none for invalid tool', () => {
    store.state.toolbarState.currentTool = 99
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.getToolName).toBe('none')
  })

  it('computed currentFg returns fg color', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.currentFg).toBe(0)
  })

  it('computed currentBg returns bg color', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.currentBg).toBe(1)
  })

  it('computed mirrorX returns mirror state', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.mirrorX).toBe(false)
  })

  it('computed mirrorY returns mirror state', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    expect(wrapper.vm.mirrorY).toBe(false)
  })

  it('computed asciiStats returns state size string', () => {
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    const stats = wrapper.vm.asciiStats
    expect(stats.stateSize).toContain('kb')
    const kbValue = parseFloat(stats.stateSize)
    expect(kbValue).toBeGreaterThan(0)
  })

  it('onDragStop commits changeDebugPanelState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    wrapper.vm.onDragStop(100, 200)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeDebugPanelState',
      expect.objectContaining({ x: 100, y: 200 }),
    )
  })

  it('onResize commits changeDebugPanelState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    wrapper.vm.onResize(10, 20, 300, 400)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeDebugPanelState',
      expect.objectContaining({
        x: 10, y: 20, w: 300, h: 400,
      }),
    )
  })

  it('copyUriToClipboard calls $copyText with compressed data', async () => {
    setStore({
      state: store.state,
      getters: store.getters,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
    } as any)

    const wrapper = shallowMount(DebugPanel, debugMountOpts(store))
    await wrapper.vm.copyUriToClipboard()
    expect(copyTextMock).toHaveBeenCalledWith(
      expect.any(String),
    )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('Copied'),
      expect.any(Object),
    )
  })
})

// ─── BrushLibrary.vue ────────────────────────────────────────────

describe('BrushLibrary.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.findComponent(BrushLibrary).exists()).toBe(true)
  })

  it('computed brushHistory returns store history', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.brushHistory).toEqual([])
  })

  it('computed brushLibrary returns store library', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.brushLibrary).toEqual([])
  })

  it('computed libraryCount returns empty string when no brushes', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.libraryCount).toBe('')
  })

  it('computed libraryCount returns count when brushes exist', () => {
    const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
    store.commit('pushBrushLibrary', blocks)
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.libraryCount).toBe('(1)')
  })

  it('decompressBlock decompresses LZ-String data', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
    const compressed = LZString.compressToUTF16(
      JSON.stringify(blocks),
    )
    const result = wrapper.vm.decompressBlock(compressed)
    expect(result).toEqual(blocks)
  })

  it('saveToLibrary commits pushBrushLibrary', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.saveToLibrary(blocks)
    expect(commitSpy).toHaveBeenCalledWith(
      'pushBrushLibrary', blocks,
    )
    expect(toastedMock.show).toHaveBeenCalled()
  })

  it('removeFromLibrary commits removeBrushLibrary', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.removeFromLibrary(blocks)
    expect(commitSpy).toHaveBeenCalledWith(
      'removeBrushLibrary', blocks,
    )
  })

  it('removeFromHistory commits removeBrushHistory', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.removeFromHistory(blocks)
    expect(commitSpy).toHaveBeenCalledWith(
      'removeBrushHistory', blocks,
    )
  })

  it('reuseBlocks commits brushBlocks and changeTool', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
    wrapper.vm.reuseBlocks(blocks)
    expect(commitSpy).toHaveBeenCalledWith('brushBlocks', blocks)
    expect(commitSpy).toHaveBeenCalledWith('changeTool', 4)
    expect(toastedMock.show).toHaveBeenCalled()
  })

  it('changeTab updates panel and commits', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.changeTab(0)
    expect(wrapper.vm.panel.tab).toBe(0)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeBrushLibraryState',
      expect.objectContaining({ tab: 0 }),
    )
  })

  it('upBrush commits upBrush mutation', () => {
    const blocks1 = [[{ fg: 1, bg: 0, char: 'A' }]]
    const blocks2 = [[{ fg: 2, bg: 0, char: 'B' }]]
    store.commit('pushBrushLibrary', blocks1)
    store.commit('pushBrushLibrary', blocks2)

    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.upBrush(1)
    expect(commitSpy).toHaveBeenCalledWith('upBrush', 1)
  })

  it('downBrush commits downBrush mutation', () => {
    const blocks1 = [[{ fg: 1, bg: 0, char: 'A' }]]
    const blocks2 = [[{ fg: 2, bg: 0, char: 'B' }]]
    store.commit('pushBrushLibrary', blocks1)
    store.commit('pushBrushLibrary', blocks2)

    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.downBrush(0)
    expect(commitSpy).toHaveBeenCalledWith('downBrush', 0)
  })

  it('onDragStop commits changeBrushLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onDragStop(50, 60)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeBrushLibraryState',
      expect.objectContaining({ x: 50, y: 60 }),
    )
  })

  it('onResize commits changeBrushLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onResize(10, 20, 300, 400)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeBrushLibraryState',
      expect.objectContaining({
        x: 10, y: 20, w: 300, h: 400,
      }),
    )
  })

  it('computed isBrushing returns true when tool is brush', () => {
    store.state.toolbarState.currentTool = 4
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    // Verify the index assumption explicitly
    expect(toolbarIcons[4].name).toBe('brush')
    expect(wrapper.vm.isBrushing).toBe(true)
  })

  it('computed isErasing returns true when tool is eraser', () => {
    store.state.toolbarState.currentTool = 6
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    // Verify the index assumption explicitly
    expect(toolbarIcons[6].name).toBe('eraser')
    expect(wrapper.vm.isErasing).toBe(true)
  })
})

// ─── Toolbar.vue ─────────────────────────────────────────────────

describe('Toolbar.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.findComponent(Toolbar).exists()).toBe(true)
  })

  it('computed toolbarIcons returns ascii toolbar icons', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.toolbarIcons).toEqual(toolbarIcons)
  })

  it('computed currentTool returns current tool object', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.currentTool.name).toBe('default')
    expect(wrapper.vm.currentTool.icon).toBe('edit_off')
  })

  it('computed canFg returns targeting fg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.canFg).toBe(true)
  })

  it('computed canBg returns targeting bg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.canBg).toBe(true)
  })

  it('computed canText returns targeting char state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.canText).toBe(true)
  })

  it('computed mirrorX returns mirror state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.mirrorX).toBe(false)
  })

  it('computed mirrorY returns mirror state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.mirrorY).toBe(false)
  })

  it('computed gridView returns grid state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.gridView).toBe(false)
  })

  it('computed halfBlockEditing returns half block state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.halfBlockEditing).toBe(false)
  })

  it('computed updateBrush returns update brush state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.updateBrush).toBe(true)
  })

  it('tooltipName returns correct names for all tools', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(wrapper.vm.tooltipName({ name: 'default' }))
      .toBe('Default Mode')
    expect(wrapper.vm.tooltipName({ name: 'select' }))
      .toBe('Select Blocks')
    expect(wrapper.vm.tooltipName({ name: 'text' }))
      .toBe('Text Editing')
    expect(wrapper.vm.tooltipName({ name: 'fill' }))
      .toBe('Fill Blocks')
    expect(wrapper.vm.tooltipName({ name: 'brush' }))
      .toBe('Brush Blocks')
    expect(wrapper.vm.tooltipName({ name: 'dropper' }))
      .toBe('Block Picker')
    expect(wrapper.vm.tooltipName({ name: 'eraser' }))
      .toBe('Eraser Blocks')
    expect(wrapper.vm.tooltipName({ name: 'fill-eraser' }))
      .toBe('Fill Eraser Blocks')
  })

  it('updateMirror commits updateMirror to store', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.mirror = { x: true, y: false }
    wrapper.vm.updateMirror()
    expect(commitSpy).toHaveBeenCalledWith('updateMirror', {
      x: true, y: false,
    })
  })

  it('onDragStop commits changeToolBarState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onDragStop(50, 60)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeToolBarState',
      expect.objectContaining({ x: 50, y: 60, visible: true }),
    )
  })

  it('onResize commits changeToolBarState with dimensions', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      Toolbar,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.onResize(10, 20, 300, 400)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeToolBarState',
      expect.objectContaining({
        x: 10, y: 20, w: 300, h: 400, visible: true,
      }),
    )
  })
})
