// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LZString from 'lz-string'
import LayersLibrary from '@/components/LayersLibrary.vue'
import DebugPanel from '@/components/DebugPanel.vue'
import BrushLibrary from '@/components/BrushLibrary.vue'
import Toolbar from '@/components/Toolbar.vue'
import {
  toolbarIcons,
  setStore,
} from '@/ascii'
import {
  toastedMock,
  copyTextMock,
  setupHotkeysMocks,
  createMockStore,
  createMockModalStore,
  createMockPanelStore,
  createMockToolbarStore,
  globalStubs,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null
let _mockPanelStore: any = null
let _mockToolbarStore: any = null

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))
vi.mock('@/store/modal', () => ({
  useModalStore: () => _mockModalStore,
}))
vi.mock('@/store/panels', () => ({
  usePanelStore: () => _mockPanelStore,
}))
vi.mock('@/store/toolbar', () => ({
  useToolbarStore: () => _mockToolbarStore,
}))


vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ show: toastedMock.show, messages: { value: [] } }),
}))

vi.mock('@/composables/useDialog', () => ({
  useDialog: () => ({
    confirm: vi.fn(() => Promise.resolve(true)),
    alert: vi.fn(() => Promise.resolve()),
  }),
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({ copyText: copyTextMock, copied: { value: false } }),
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

setupHotkeysMocks()

let store: any

function mountOpts(extra: Record<string, any> = {}) {
  return {
    global: {
      plugins: [createPinia()],
      stubs: globalStubs,
    },
    ...extra,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
  _mockStore = store
  _mockModalStore = createMockModalStore()
  _mockPanelStore = createMockPanelStore()
  _mockToolbarStore = createMockToolbarStore()
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
})

// ─── DebugPanel.vue ───────────────────────────────────────────

describe('DebugPanel.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.findComponent(DebugPanel).exists()).toBe(true)
  })

  it('computed getToolName returns current tool name', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.getToolName).toBe('default')
  })

  it('computed getToolName returns none for invalid tool', () => {
    _mockToolbarStore.toolbarState.currentTool = 99
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.getToolName).toBe('none')
  })

  it('computed currentFg returns fg color', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.currentFg).toBe(0)
  })

  it('computed currentBg returns bg color', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.currentBg).toBe(1)
  })

  it('computed mirrorX returns mirror state', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.mirrorX).toBe(false)
  })

  it('computed mirrorY returns mirror state', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    expect(wrapper.vm.mirrorY).toBe(false)
  })

  it('computed asciiStats returns state size string', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
    const stats = wrapper.vm.asciiStats
    expect(stats.stateSize).toContain('kb')
    const kbValue = parseFloat(stats.stateSize)
    expect(kbValue).toBeGreaterThan(0)
  })

  it('copyUriToClipboard calls copyText with compressed data', async () => {
    setStore(store)

    const wrapper = shallowMount(
      DebugPanel,
      mountOpts({ propsData: { canvasX: 0, canvasY: 0 } }),
    )
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
    _mockToolbarStore.pushBrushLibrary(blocks)
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

  it('saveToLibrary calls store.pushBrushLibrary', () => {
    const spy = vi.spyOn(_mockToolbarStore, 'pushBrushLibrary')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.saveToLibrary(blocks)
    expect(spy).toHaveBeenCalledWith(blocks)
    expect(toastedMock.show).toHaveBeenCalled()
  })

  it('removeFromLibrary calls store.removeBrushLibrary', () => {
    const spy = vi.spyOn(_mockToolbarStore, 'removeBrushLibrary')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.removeFromLibrary(blocks)
    expect(spy).toHaveBeenCalledWith(blocks)
  })

  it('removeFromHistory calls store.removeBrushHistory', () => {
    const spy = vi.spyOn(_mockToolbarStore, 'removeBrushHistory')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'X' }]]
    wrapper.vm.removeFromHistory(blocks)
    expect(spy).toHaveBeenCalledWith(blocks)
  })

  it('reuseBlocks sets brushBlocks and calls changeTool', () => {
    const changeToolSpy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
    wrapper.vm.reuseBlocks(blocks)
    expect(_mockToolbarStore.brushBlocks).toEqual(blocks)
    expect(changeToolSpy).toHaveBeenCalledWith(4)
    expect(toastedMock.show).toHaveBeenCalled()
  })

  it('changeTab updates panel and calls panelStore', () => {
    const spy = vi.spyOn(_mockPanelStore, 'changeBrushLibraryState')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.changeTab(0)
    expect(wrapper.vm.panel.tab).toBe(0)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 0 }),
    )
  })

  it('upBrush calls store.upBrush', () => {
    const blocks1 = [[{ fg: 1, bg: 0, char: 'A' }]]
    const blocks2 = [[{ fg: 2, bg: 0, char: 'B' }]]
    _mockToolbarStore.pushBrushLibrary(blocks1)
    _mockToolbarStore.pushBrushLibrary(blocks2)

    const spy = vi.spyOn(_mockToolbarStore, 'upBrush')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.upBrush(1)
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('downBrush calls store.downBrush', () => {
    const blocks1 = [[{ fg: 1, bg: 0, char: 'A' }]]
    const blocks2 = [[{ fg: 2, bg: 0, char: 'B' }]]
    _mockToolbarStore.pushBrushLibrary(blocks1)
    _mockToolbarStore.pushBrushLibrary(blocks2)

    const spy = vi.spyOn(_mockToolbarStore, 'downBrush')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    wrapper.vm.downBrush(0)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('computed isBrushing returns true when tool is brush', () => {
    _mockToolbarStore.toolbarState.currentTool = 4
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(toolbarIcons[4].name).toBe('brush')
    expect(wrapper.vm.isBrushing).toBe(true)
  })

  it('computed isErasing returns true when tool is eraser', () => {
    _mockToolbarStore.toolbarState.currentTool = 6
    const wrapper = shallowMount(
      BrushLibrary,
      mountOpts({ propsData: { yOffset: 0 } }),
    )
    expect(toolbarIcons[6].name).toBe('eraser')
    expect(wrapper.vm.isErasing).toBe(true)
  })
})

// ─── Toolbar.vue ─────────────────────────────────────────────────

describe('Toolbar.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.findComponent(Toolbar).exists()).toBe(true)
  })

  it('computed toolbarIcons returns ascii toolbar icons', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.vm.toolbarIcons).toEqual(toolbarIcons)
  })

  it('computed currentTool returns current tool object', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.vm.currentTool.name).toBe('default')
    expect(wrapper.vm.currentTool.icon).toBe('edit_off')
  })

  it('computed canFg returns targeting fg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.vm.canFg).toBe(true)
  })

  it('computed canBg returns targeting bg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.vm.canBg).toBe(true)
  })

  it('computed canText returns targeting char state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    expect(wrapper.vm.canText).toBe(true)
  })

  it('toggleMirrorX calls store.updateMirror with toggled x', () => {
    const spy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    wrapper.vm.toggleMirrorX()
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ x: true, y: false }),
    )
  })

  it('toggleMirrorY calls store.updateMirror with toggled y', () => {
    const spy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    const wrapper = shallowMount(
      Toolbar,
      mountOpts(),
    )
    wrapper.vm.toggleMirrorY()
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ x: false, y: true }),
    )
  })
})
