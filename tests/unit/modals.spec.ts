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
import PasteAscii from '@/components/modals/PasteAscii.vue'
import EditAscii from '@/components/modals/EditAscii.vue'
import Options from '@/components/modals/Options.vue'
import {
  create2DArray,
  emptyBlock,
  maxBrushHistory,
  maxUndoHistory,
  tabLimit,
  setStore,
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
      '<input type="checkbox" @change="$emit(\'change\', $event)" />',
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
      '<textarea :value="value" @input="$emit(\'input\', $event.target.value)"><slot /></textarea>',
    props: ['value'],
  },
  'vue-draggable-resizable': {
    template: '<div class="vdr"><slot /></div>',
  },
  'vue-slider': {
    template: '<input type="range" />',
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

vi.stubGlobal('hotkeys', vi.fn((keys, scope, handler) => {
  if (typeof scope === 'function') return scope
  return handler
}))
vi.stubGlobal('hotkeys/filter', vi.fn(() => true))
vi.stubGlobal('hotkeys/setScope', vi.fn())
vi.stubGlobal('hotkeys/deleteScope', vi.fn())
vi.stubGlobal('hotkeys/unbind', vi.fn())

// ─── Helper: mock store factory ──────────────────────────────────────

function createToolbarState(overrides = {}) {
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
        else if (s.modalState[name] !== undefined)
          s.modalState[name] = false
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
        else if (s.modalState[name] !== undefined)
          s.modalState[name] = true
        s.isKeyboardDisabled = true
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
      updateOptions: (s: any, opts: any) => {
        s.options = opts
      },
      changeAsciiWidthHeight: (s: any, payload: any) => {
        const meta = s.asciibirdMeta[s.tab]
        if (meta) {
          meta.layers = LZString.compressToUTF16(
            JSON.stringify(payload.layers),
          )
        }
      },
      updateAsciiTitle: (s: any, title: string) => {
        s.asciibirdMeta[s.tab].title = title
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

// ─── PasteAscii.vue ──────────────────────────────────────────────

describe('PasteAscii.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    expect(wrapper.findComponent(PasteAscii).exists()).toBe(true)
  })

  it('has default data values', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.pasteContent).toBe('')
    expect(wrapper.vm.title).toBe('clipboard.txt')
  })

  it('checkPasteContent returns true when empty', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.checkPasteContent).toBe(true)
  })

  it('checkPasteContent returns false when content exists', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    wrapper.vm.pasteContent = '\x031,0Hello'
    expect(wrapper.vm.checkPasteContent).toBe(false)
  })

  it('computed showPasteAscii reads from store', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.showPasteAscii).toBe(false)
  })

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
  })

  it('close resets data and hides modal', () => {
    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    wrapper.vm.pasteContent = 'some content'
    wrapper.vm.title = 'custom.txt'
    wrapper.vm.close()
    expect(wrapper.vm.pasteContent).toBe('')
    expect(wrapper.vm.title).toBe('clipboard.txt')
    expect(modalMock.hide).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
  })

  it('importPasteAscii calls parseMircAscii and closes', async () => {
    // Initialize ascii store for parseMircAscii to work
    setStore({
      state: store.state,
      getters: store.getters,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
    } as any)

    const wrapper = shallowMount(
      PasteAscii,
      mountOptions(store),
    )
    wrapper.vm.pasteContent = '\x031,0Test'
    wrapper.vm.title = 'test.txt'

    await wrapper.vm.importPasteAscii()
    expect(wrapper.vm.pasteContent).toBe('')
    expect(modalMock.hide).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
  })
})

// ─── EditAscii.vue ───────────────────────────────────────────────

describe('EditAscii.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.findComponent(EditAscii).exists()).toBe(true)
  })

  it('computed showEditAsciiModal reads from store', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.showEditAsciiModal).toBe(false)
  })

  it('computed currentAsciiEditingTitle includes title', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.currentAsciiEditingTitle).toContain(
      'Test ASCII',
    )
  })

  it('computed currentAsciiLayers returns decompressed layers', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    const layers = wrapper.vm.currentAsciiLayers
    expect(layers).toHaveLength(1)
    expect(layers[0].width).toBe(3)
    expect(layers[0].height).toBe(3)
  })

  it('computed selectedLayerIndex returns selected layer', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.selectedLayerIndex).toBe(0)
  })

  it('computed currentSelectedLayer returns the selected layer', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    const layer = wrapper.vm.currentSelectedLayer
    expect(layer.label).toBe('Test Layer')
    expect(layer.width).toBe(3)
  })

  it('open sets layer data from current layer and shows modal', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    wrapper.vm.open()
    expect(wrapper.vm.layer.width).toBe(3)
    expect(wrapper.vm.layer.height).toBe(3)
    expect(wrapper.vm.layer.title).toBe('Test ASCII')
    expect(modalMock.show).toHaveBeenCalledWith(
      'edit-ascii-modal',
    )
  })

  it('close resets layer and hides modal', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    wrapper.vm.layer = { width: 10, height: 20, title: 'test' }
    wrapper.vm.close()
    expect(wrapper.vm.layer).toEqual({})
    expect(modalMock.hide).toHaveBeenCalledWith(
      'edit-ascii-modal',
    )
  })

  it('currentAsciiWidth returns layer width or 0', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.currentAsciiWidth).toBe(0) // layer is {}
    wrapper.vm.layer = { width: 5, height: 5, title: 'test' }
    expect(wrapper.vm.currentAsciiWidth).toBe(5)
  })

  it('currentAsciiHeight returns layer height or 0', () => {
    const wrapper = shallowMount(
      EditAscii,
      mountOptions(store),
    )
    expect(wrapper.vm.currentAsciiHeight).toBe(0) // layer is {}
    wrapper.vm.layer = { width: 5, height: 8, title: 'test' }
    expect(wrapper.vm.currentAsciiHeight).toBe(8)
  })
})

// ─── Options.vue ─────────────────────────────────────────────────

describe('Options.vue', () => {
  let store: any

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.findComponent(Options).exists()).toBe(true)
  })

  it('computed showOptionsModal reads from store', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.vm.showOptionsModal).toBe(false)
  })

  it('computed options returns store options', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.vm.options).toEqual(store.state.options)
    expect(wrapper.vm.options.fps).toBe(50)
    expect(wrapper.vm.options.undoLimit).toBe(50)
  })

  it('computed maxBrushHistory returns ascii constant', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.vm.maxBrushHistory).toBe(maxBrushHistory)
  })

  it('computed maxUndoHistory returns ascii constant', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.vm.maxUndoHistory).toBe(maxUndoHistory)
  })

  it('computed tabLimit returns ascii constant', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    expect(wrapper.vm.tabLimit).toBe(tabLimit)
  })

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith('options-modal')
  })

  it('close calls $modal.hide', () => {
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    wrapper.vm.close()
    expect(modalMock.hide).toHaveBeenCalledWith('options-modal')
  })

  it('clearCache clears localStorage and reloads', () => {
    const clearSpy = vi.spyOn(Storage.prototype, 'clear')
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    wrapper.vm.clearCache()

    expect(clearSpy).toHaveBeenCalled()
    expect(reloadSpy).toHaveBeenCalled()

    clearSpy.mockRestore()
  })

  it('updateOptions commits current options to store', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(
      Options,
      mountOptions(store),
    )
    wrapper.vm.updateOptions()
    expect(commitSpy).toHaveBeenCalledWith(
      'updateOptions',
      expect.objectContaining({ fps: 50 }),
    )
  })
})
