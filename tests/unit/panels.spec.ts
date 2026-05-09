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
import Vuex from 'vuex'
import LZString from 'lz-string'
import LayersLibrary from '@/components/LayersLibrary.vue'
import DebugPanel from '@/components/DebugPanel.vue'
import BrushLibrary from '@/components/BrushLibrary.vue'
import Toolbar from '@/components/Toolbar.vue'
import {
  toolbarIcons,
  blockWidth,
  blockHeight,
  create2DArray,
  emptyBlock,
  cyrb53,
} from '@/ascii'

const localVue = createLocalVue()
localVue.use(Vuex)

// ─── Shared stubs ────────────────────────────────────────────────────

const globalStubs = {
  't-button': {
    template:
      '<button class="t-button" @click="$emit(\'click\')"><slot /></button>',
  },
  't-card': {
    template: '<div class="t-card"><slot /></div>',
  },
  't-checkbox': {
    template:
      '<input type="checkbox" :checked="checked" @change="$emit(\'change\', $event)" />',
    props: ['checked'],
    model: { prop: 'checked', event: 'change' },
  },
  't-input': {
    template:
      '<input class="t-input" :value="value" @input="$emit(\'input\', $event.target.value)" />',
    props: ['value'],
  },
  't-modal': {
    template:
      '<div class="t-modal"><slot /><slot name="footer" /><slot name="default" /></div>',
  },
  't-select': {
    template: '<select><slot /></select>',
  },
  't-slider': {
    template: '<input type="range" />',
  },
  't-textarea': {
    template:
      '<textarea><slot /></textarea>',
  },
  't-dropdown': {
    template:
      '<div class="t-dropdown"><slot name="trigger" /><slot /></div>',
  },
  'vue-draggable-resizable': {
    template: '<div class="vdr"><slot /></div>',
  },
  'vue-slider': {
    template: '<input type="range" />',
  },
  'BrushCanvas': {
    template: '<div class="brush-canvas-stub"><slot /></div>',
  },
  'Layers': {
    template: '<div class="layers-stub"><slot /></div>',
  },
  'Colours': {
    template: '<div class="colours-stub"><slot /></div>',
  },
}

// ─── Shared mocks ────────────────────────────────────────────────────

const modalMock = {
  show: vi.fn(),
  hide: vi.fn(),
}

const toastedMock = {
  show: vi.fn(),
}

const copyTextMock = vi.fn(() => Promise.resolve())

vi.stubGlobal('hotkeys', vi.fn((keys, scope, handler) => {
  if (typeof scope === 'function') return scope
  return handler
}))
vi.stubGlobal('hotkeys/filter', vi.fn(() => true))
vi.stubGlobal('hotkeys/setScope', vi.fn())
vi.stubGlobal('hotkeys/deleteScope', vi.fn())
vi.stubGlobal('hotkeys/unbind', vi.fn())

// ─── Helper: mock store factory ──────────────────────────────────────

function createToolbarState(overrides: Record<string, any> = {}) {
  return {
    currentColourFg: 0,
    currentColourBg: 1,
    isChoosingFg: false,
    isChoosingBg: false,
    isChoosingChar: false,
    persistCharPanel: false,
    brushSizeWidth: 1,
    brushSizeHeight: 1,
    brushSizeType: 'square',
    selectedFg: 0,
    selectedBg: 1,
    selectedChar: ' ',
    isUpdating: false,
    currentTool: 0,
    targetingFg: true,
    targetingBg: true,
    targetingChar: true,
    mirrorX: false,
    mirrorY: false,
    halfBlockEditing: false,
    gridView: false,
    updateBrush: true,
    draggable: true,
    visible: true,
    x: 16,
    y: 30,
    h: 285,
    w: 200,
    ...overrides,
  }
}

function createMockStore(overrides: Record<string, any> = {}) {
  const defaultLayers = [{
    label: 'Test Layer',
    visible: true,
    width: 3,
    height: 3,
    data: create2DArray(3).map(row => {
      for (let x = 0; x < 3; x++) row.push({ ...emptyBlock })
      return row
    }),
  }]

  const defaultState = {
    ver: 1,
    modalState: {
      newAscii: false,
      editAscii: false,
      pasteAscii: false,
      options: false,
      overlay: false,
      about: false,
      help: false,
    },
    isKeyboardDisabled: false,
    options: {
      defaultBg: 1,
      defaultFg: 0,
      renderOffScreen: false,
      undoLimit: 50,
      brushLimit: 50,
      tabLimit: 12,
      fps: 50,
    },
    tab: 0,
    blockSizeMultiplier: 1,
    desktopState: {
      menuBarVisible: true,
      tabsVisible: true,
    },
    asciibirdMeta: [{
      title: 'Test ASCII',
      layers: LZString.compressToUTF16(JSON.stringify(defaultLayers)),
      selectedLayer: 0,
      imageOverlay: {
        url: null, opacity: 95, asciiOpacity: 100,
        left: 0, top: 0, position: 'centered',
        size: 100, repeatx: true, repeaty: true,
        visible: false, stretched: false,
      },
      history: [],
      historyIndex: 0,
      x: 247,
      y: 24,
    }],
    toolbarState: createToolbarState(),
    debugPanelState: {
      x: 10, y: 20, h: 30, w: 40, visible: true,
    },
    brushLibraryState: {
      x: 10, y: 40, h: 30, w: 40, visible: true, tab: 1,
    },
    layersLibraryState: {
      x: 10, y: 40, h: 30, w: 40, visible: true,
    },
    brushPreviewState: {
      x: 10, y: 40, h: 30, w: 40, visible: true,
    },
    debugPanel: false,
    brushHistory: [],
    brushLibrary: [],
    copiedBlocks: [],
    brushPreview: [],
    brushBlocks: LZString.compressToUTF16(JSON.stringify([])),
    selectBlocks: LZString.compressToUTF16(JSON.stringify([])),
    panelState: {
      toolbar: { x: 10, y: 40 },
      debugPanel: { x: 10, y: 40 },
      brushLibrary: { x: 10, y: 40 },
      layersLibrary: { x: 10, y: 40 },
      brushPreview: { x: 10, y: 40 },
    },
  }

  const state = { ...defaultState, ...overrides }

  return new Vuex.Store({
    state,
    getters: {
      modalState: (s: any) => s.modalState,
      toolbarState: (s: any) => s.toolbarState,
      currentFg: (s: any) => s.toolbarState.currentColourFg,
      currentBg: (s: any) => s.toolbarState.currentColourBg,
      currentChar: (s: any) => s.toolbarState.selectedChar,
      currentTool: (s: any) => s.toolbarState.currentTool,
      asciibirdMeta: (s: any) => s.asciibirdMeta,
      options: (s: any) => s.options,
      tab: (s: any) => s.tab,
      brushHistory: (s: any) => s.brushHistory,
      brushLibrary: (s: any) => s.brushLibrary,
      copiedBlocks: (s: any) => s.copiedBlocks,
      brushPreview: (s: any) => s.brushPreview,
      desktopState: (s: any) => s.desktopState,
      debugPanel: (s: any) => s.debugPanelState,
      panelState: (s: any) => s.panelState,
      blockSizeMultiplier: (s: any) => s.blockSizeMultiplier,
      persistCharPanel: (s: any) => s.toolbarState.persistCharPanel,
      isTargettingFg: (s: any) => s.toolbarState.targetingFg,
      isTargettingBg: (s: any) => s.toolbarState.targetingBg,
      isTargettingChar: (s: any) => s.toolbarState.targetingChar,
      brushLibraryState: (s: any) => s.brushLibraryState,
      layersLibraryState: (s: any) => s.layersLibraryState,
      brushPreviewState: (s: any) => s.brushPreviewState,
      isKeyboardDisabled: (s: any) => s.isKeyboardDisabled,
      isModalOpen: (s: any) =>
        Object.values(s.modalState).some((v: any) => v),
      currentAscii: (s: any) => s.asciibirdMeta[s.tab] || false,
      currentAsciiLayers: (s: any) => {
        const meta = s.asciibirdMeta[s.tab]
        if (!meta) return []
        return JSON.parse(
          LZString.decompressFromUTF16(meta.layers),
        )
      },
      currentAsciiLayersWidthHeight: (s: any) => {
        const meta = s.asciibirdMeta[s.tab]
        if (!meta) return { width: 0, height: 0 }
        const layers = JSON.parse(
          LZString.decompressFromUTF16(meta.layers),
        )
        return {
          width: layers[0]?.width ?? 0,
          height: layers[0]?.height ?? 0,
        }
      },
      selectedLayer: (s: any) =>
        s.asciibirdMeta[s.tab]?.selectedLayer ?? 0,
      imageOverlay: (s: any) =>
        s.asciibirdMeta[s.tab]?.imageOverlay,
      tabsVisible: (s: any) => s.desktopState.tabsVisible,
      menuBarVisible: (s: any) => s.desktopState.menuBarVisible,
      brushBlocks: (s: any) => JSON.parse(
        LZString.decompressFromUTF16(s.brushBlocks),
      ),
      selectBlocks: (s: any) => JSON.parse(
        LZString.decompressFromUTF16(s.selectBlocks),
      ),
      state: (s: any) => s,
    },
    mutations: {
      closeModal: (s: any, name: string) => {
        const map: Record<string, string> = {
          'new-ascii': 'newAscii',
          'edit-ascii': 'editAscii',
          'paste-ascii': 'pasteAscii',
          'options': 'options',
          'overlay': 'overlay',
          'about': 'about',
          'help': 'help',
        }
        if (map[name]) s.modalState[map[name]] = false
        s.isKeyboardDisabled = false
      },
      openModal: (s: any, name: string) => {
        const map: Record<string, string> = {
          'new-ascii': 'newAscii',
          'edit-ascii': 'editAscii',
          'paste-ascii': 'pasteAscii',
          'options': 'options',
          'overlay': 'overlay',
          'about': 'about',
          'help': 'help',
        }
        if (map[name]) s.modalState[map[name]] = true
        s.isKeyboardDisabled = true
      },
      changeTool: (s: any, idx: number) => {
        s.toolbarState.currentTool = idx
      },
      changeColourFg: (s: any, colour: number) => {
        s.toolbarState.currentColourFg = colour
      },
      changeColourBg: (s: any, colour: number) => {
        s.toolbarState.currentColourBg = colour
      },
      changeIsUpdatingFg: (s: any, val: boolean) => {
        s.toolbarState.isChoosingFg = val
      },
      changeIsUpdatingBg: (s: any, val: boolean) => {
        s.toolbarState.isChoosingBg = val
      },
      changeIsUpdatingChar: (s: any, val: boolean) => {
        s.toolbarState.isChoosingChar = val
      },
      changeChar: (s: any, char: string) => {
        s.toolbarState.selectedChar = char
      },
      persistCharPanel: (s: any, val: boolean) => {
        s.toolbarState.persistCharPanel = val
      },
      updateMirror: (s: any, payload: any) => {
        s.toolbarState.mirrorX = payload.x
        s.toolbarState.mirrorY = payload.y
      },
      toggleUpdateBrush: (s: any) => {
        s.toolbarState.updateBrush = !s.toolbarState.updateBrush
      },
      toggleGridView: (s: any) => {
        s.toolbarState.gridView = !s.toolbarState.gridView
      },
      toggleHalfBlockEditing: (s: any, val: boolean) => {
        s.toolbarState.halfBlockEditing = val
      },
      changeToolBarState: (s: any, payload: any) => {
        Object.assign(s.toolbarState, payload)
      },
      changeDebugPanelState: (s: any, payload: any) => {
        Object.assign(s.debugPanelState, payload)
      },
      changeBrushLibraryState: (s: any, payload: any) => {
        Object.assign(s.brushLibraryState, payload)
      },
      changeLayersLibraryState: (s: any, payload: any) => {
        Object.assign(s.layersLibraryState, payload)
      },
      brushBlocks: (s: any, blocks: any) => {
        s.brushBlocks = LZString.compressToUTF16(
          JSON.stringify(blocks),
        )
      },
      pushBrushLibrary: (s: any, blocks: any) => {
        const hash = cyrb53(JSON.stringify(blocks))
        if (!s.brushLibrary.some((b: any) => b.hash === hash)) {
          s.brushLibrary.push({
            blocks: LZString.compressToUTF16(
              JSON.stringify(blocks),
            ),
            hash,
          })
        }
      },
      removeBrushLibrary: (s: any, blocks: any) => {
        const hash = cyrb53(JSON.stringify(blocks))
        s.brushLibrary = s.brushLibrary.filter(
          (b: any) => b.hash !== hash,
        )
      },
      removeBrushHistory: (s: any, blocks: any) => {
        const hash = cyrb53(JSON.stringify(blocks))
        s.brushHistory = s.brushHistory.filter(
          (b: any) => b.hash !== hash,
        )
      },
      upBrush: (s: any, key: number) => {
        if (key > 0) {
          const temp = s.brushLibrary[key]
          s.brushLibrary[key] = s.brushLibrary[key - 1]
          s.brushLibrary[key - 1] = temp
        }
      },
      downBrush: (s: any, key: number) => {
        if (key < s.brushLibrary.length - 1) {
          const temp = s.brushLibrary[key]
          s.brushLibrary[key] = s.brushLibrary[key + 1]
          s.brushLibrary[key + 1] = temp
        }
      },
    },
  })
}

function mountOptions(store: any, extra: Record<string, any> = {}) {
  return {
    store,
    localVue,
    mocks: {
      $modal: modalMock,
      $toasted: toastedMock,
      $copyText: copyTextMock,
    },
    global: { stubs: globalStubs },
    ...extra,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── LayersLibrary.vue ───────────────────────────────────────────

describe('LayersLibrary.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.findComponent(LayersLibrary).exists()).toBe(true)
  })

  it('computed blockWidth returns scaled block width', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.blockWidth).toBe(blockWidth)
  })

  it('computed blockHeight returns scaled block height', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.blockHeight).toBe(blockHeight)
  })

  it('computed layersLibraryState returns store state', () => {
    const wrapper = shallowMount(
      LayersLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    const state = wrapper.vm.layersLibraryState
    expect(state.x).toBe(10)
    expect(state.y).toBe(40)
  })

  it('onDragStop commits changeLayersLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      LayersLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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

// ─── DebugPanel.vue ──────────────────────────────────────────────

describe('DebugPanel.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.findComponent(DebugPanel).exists()).toBe(true)
  })

  it('computed getToolName returns current tool name', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.getToolName).toBe('default')
  })

  it('computed getToolName returns none for invalid tool', () => {
    store.state.toolbarState.currentTool = 99
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.getToolName).toBe('none')
  })

  it('computed currentFg returns fg color', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.currentFg).toBe(0)
  })

  it('computed currentBg returns bg color', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.currentBg).toBe(1)
  })

  it('computed mirrorX returns mirror state', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.mirrorX).toBe(false)
  })

  it('computed mirrorY returns mirror state', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    expect(wrapper.vm.mirrorY).toBe(false)
  })

  it('computed asciiStats returns state size string', () => {
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    const stats = wrapper.vm.asciiStats
    expect(stats.stateSize).toContain('kb')
  })

  it('onDragStop commits changeDebugPanelState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    wrapper.vm.onDragStop(100, 200)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeDebugPanelState',
      expect.objectContaining({ x: 100, y: 200 }),
    )
  })

  it('onResize commits changeDebugPanelState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    wrapper.vm.onResize(10, 20, 300, 400)
    expect(commitSpy).toHaveBeenCalledWith(
      'changeDebugPanelState',
      expect.objectContaining({
        x: 10, y: 20, w: 300, h: 400,
      }),
    )
  })

  it('copyUriToClipboard calls $copyText with compressed data', async () => {
    // Need to set up ascii store for mergeLayers
    const { setStore } = await import('@/ascii')
    setStore({
      state: store.state,
      getters: store.getters,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
    } as any)

    const wrapper = shallowMount(
      DebugPanel,
      mountOptions(store, {
        propsData: { canvasX: 0, canvasY: 0 },
      }),
    )
    await wrapper.vm.copyUriToClipboard()
    // $copyText is called with the LZ-String compressed merged layers
    expect(copyTextMock).toHaveBeenCalledWith(
      expect.any(String),
    )
    // The toast is shown inside the $copyText().then() callback
    // Flush microtasks
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('Copied'),
      expect.any(Object),
    )
  })
})

// ─── BrushLibrary.vue ────────────────────────────────────────────

describe('BrushLibrary.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.findComponent(BrushLibrary).exists()).toBe(true)
  })

  it('computed brushHistory returns store history', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.brushHistory).toEqual([])
  })

  it('computed brushLibrary returns store library', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.brushLibrary).toEqual([])
  })

  it('computed libraryCount returns empty string when no brushes', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.libraryCount).toBe('')
  })

  it('computed libraryCount returns count when brushes exist', () => {
    const blocks = [[{ fg: 1, bg: 0, char: 'A' }]]
    store.commit('pushBrushLibrary', blocks)
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.libraryCount).toBe('(1)')
  })

  it('decompressBlock decompresses LZ-String data', () => {
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    wrapper.vm.downBrush(0)
    expect(commitSpy).toHaveBeenCalledWith('downBrush', 0)
  })

  it('onDragStop commits changeBrushLibraryState', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
    store.state.toolbarState.currentTool = 4 // brush tool index
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    // toolbarIcons[4] = brush
    expect(wrapper.vm.currentTool.name).toBe('brush')
    expect(wrapper.vm.isBrushing).toBe(true)
  })

  it('computed isErasing returns true when tool is eraser', () => {
    store.state.toolbarState.currentTool = 6 // eraser tool index
    const wrapper = shallowMount(
      BrushLibrary,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    // toolbarIcons[6] = eraser
    expect(wrapper.vm.currentTool.name).toBe('eraser')
    expect(wrapper.vm.isErasing).toBe(true)
  })
})

// ─── Toolbar.vue ─────────────────────────────────────────────────

describe('Toolbar.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.findComponent(Toolbar).exists()).toBe(true)
  })

  it('computed toolbarIcons returns ascii toolbar icons', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.toolbarIcons).toEqual(toolbarIcons)
  })

  it('computed currentTool returns current tool object', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.currentTool.name).toBe('default')
    expect(wrapper.vm.currentTool.icon).toBe('edit_off')
  })

  it('computed canFg returns targeting fg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.canFg).toBe(true)
  })

  it('computed canBg returns targeting bg state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.canBg).toBe(true)
  })

  it('computed canText returns targeting char state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.canText).toBe(true)
  })

  it('computed mirrorX returns mirror state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.mirrorX).toBe(false)
  })

  it('computed mirrorY returns mirror state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.mirrorY).toBe(false)
  })

  it('computed gridView returns grid state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.gridView).toBe(false)
  })

  it('computed halfBlockEditing returns half block state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.halfBlockEditing).toBe(false)
  })

  it('computed updateBrush returns update brush state', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.updateBrush).toBe(true)
  })

  it('tooltipName returns correct names for all tools', () => {
    const wrapper = shallowMount(
      Toolbar,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
      mountOptions(store, {
        propsData: { yOffset: 0 },
      }),
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
