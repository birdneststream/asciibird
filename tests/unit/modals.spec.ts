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
import PasteAscii from '@/components/modals/PasteAscii.vue'
import EditAscii from '@/components/modals/EditAscii.vue'
import Options from '@/components/modals/Options.vue'
import ImageOverlay from '@/components/modals/ImageOverlay.vue'
import {
  maxBrushHistory,
  maxUndoHistory,
  tabLimit,
  setStore,
} from '@/ascii'
import {
  toastedMock,
  copyTextMock,
  setupHotkeysMocks,
  createMockStore,
  globalStubs,
} from './helpers'

let _mockStore: any = null

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toastedMock.show,
}))

vi.mock('@/composables/useDialog', () => ({
  useDialog: () => ({
    confirm: vi.fn(() => Promise.resolve(true)),
    alert: vi.fn(() => Promise.resolve()),
  }),
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => copyTextMock,
}))

setupHotkeysMocks()

let store: any

function mountOpts(extra: any = {}) {
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
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── PasteAscii.vue ──────────────────────────────────────────────

describe('PasteAscii.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    expect(wrapper.findComponent(PasteAscii).exists()).toBe(true)
  })

  it('has default data values', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    expect(wrapper.vm.pasteContent).toBe('')
    expect(wrapper.vm.title).toBe('clipboard.txt')
  })

  it('checkPasteContent returns true when empty', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    expect(wrapper.vm.checkPasteContent).toBe(true)
  })

  it('checkPasteContent returns false when content exists', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    wrapper.vm.pasteContent = '\x031,0Hello'
    expect(wrapper.vm.checkPasteContent).toBe(false)
  })

  it('computed showPasteAscii reads from store', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    expect(wrapper.vm.showPasteAscii).toBe(false)
  })

  it('close resets data', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    wrapper.vm.pasteContent = 'some content'
    wrapper.vm.title = 'custom.txt'
    wrapper.vm.close()
    expect(wrapper.vm.pasteContent).toBe('')
    expect(wrapper.vm.title).toBe('clipboard.txt')
  })

  it('importPasteAscii calls parseMircAscii and closes', async () => {
    setStore(store)

    const wrapper = shallowMount(PasteAscii, mountOpts())
    wrapper.vm.pasteContent = '\x031,0Test'
    wrapper.vm.title = 'test.txt'

    await wrapper.vm.importPasteAscii()
    expect(wrapper.vm.pasteContent).toBe('')
  })

  it('computed showPasteAscii returns correct value when true', () => {
    _mockStore = createMockStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: true,
        options: false, overlay: false, about: false, help: false,
      },
    })
    store = _mockStore
    const wrapper = shallowMount(PasteAscii, mountOpts())
    expect(wrapper.vm.showPasteAscii).toBe(true)
  })
})

// ─── EditAscii.vue ───────────────────────────────────────────────

describe('EditAscii.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.findComponent(EditAscii).exists()).toBe(true)
  })

  it('computed showEditAsciiModal reads from store', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.showEditAsciiModal).toBe(false)
  })

  it('computed currentAsciiEditingTitle includes title', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.currentAsciiEditingTitle).toContain(
      'Test ASCII',
    )
  })

  it('computed currentAsciiLayers returns decompressed layers', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    const layers = wrapper.vm.currentAsciiLayers
    expect(layers).toHaveLength(1)
    expect(layers[0].width).toBe(3)
  })

  it('computed selectedLayerIndex returns selected layer', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.selectedLayerIndex).toBe(0)
  })

  it('computed currentSelectedLayer returns the selected layer', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.currentSelectedLayer.label).toBe(
      'Test Layer',
    )
  })

  it('open sets layer data', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.open()
    expect(wrapper.vm.layer.width).toBe(3)
    expect(wrapper.vm.layer.height).toBe(3)
    expect(wrapper.vm.layer.title).toBe('Test ASCII')
  })

  it('close resets layer', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.layer = { width: 10, height: 20, title: 'test' }
    wrapper.vm.close()
    expect(wrapper.vm.layer).toEqual({})
  })

  it('currentAsciiWidth returns layer width or 0', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.currentAsciiWidth).toBe(0)
    wrapper.vm.layer = { width: 5, height: 5, title: 'test' }
    expect(wrapper.vm.currentAsciiWidth).toBe(5)
  })

  it('currentAsciiHeight returns layer height or 0', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    expect(wrapper.vm.currentAsciiHeight).toBe(0)
    wrapper.vm.layer = { width: 5, height: 8, title: 'test' }
    expect(wrapper.vm.currentAsciiHeight).toBe(8)
  })

  it('updateAscii calls store.changeAsciiWidthHeight', () => {
    setStore(store)

    const spy = vi.spyOn(store, 'changeAsciiWidthHeight')
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.layer = { width: 5, height: 5, title: 'Test' }

    wrapper.vm.updateAscii()

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 5,
        height: 5,
        layers: expect.any(Array),
      }),
    )
  })
})

// ─── Options.vue ─────────────────────────────────────────────────

describe('Options.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.findComponent(Options).exists()).toBe(true)
  })

  it('computed showOptionsModal reads from store', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.showOptionsModal).toBe(false)
  })

  it('computed options returns store options', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.options).toEqual(store.options)
    expect(wrapper.vm.options.fps).toBe(50)
  })

  it('computed maxBrushHistory returns ascii constant', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.maxBrushHistory).toBe(maxBrushHistory)
  })

  it('computed maxUndoHistory returns ascii constant', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.maxUndoHistory).toBe(maxUndoHistory)
  })

  it('computed tabLimit returns ascii constant', () => {
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.tabLimit).toBe(tabLimit)
  })

  it('clearCache clears localStorage and reloads', () => {
    const clearSpy = vi.spyOn(Storage.prototype, 'clear')
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    const wrapper = shallowMount(Options, mountOpts())
    wrapper.vm.clearCache()

    expect(clearSpy).toHaveBeenCalled()
    expect(reloadSpy).toHaveBeenCalled()

    clearSpy.mockRestore()
  })

  it('updateOptions calls store.updateOptions', () => {
    const spy = vi.spyOn(store, 'updateOptions')
    const wrapper = shallowMount(Options, mountOpts())
    wrapper.vm.updateOptions()
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ fps: 50 }),
    )
  })

  it('computed showOptionsModal returns true when store has options=true', () => {
    _mockStore = createMockStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: false,
        options: true, overlay: false, about: false, help: false,
      },
    })
    store = _mockStore
    const wrapper = shallowMount(Options, mountOpts())
    expect(wrapper.vm.showOptionsModal).toBe(true)
  })
})

// ─── ImageOverlay.vue ────────────────────────────────────────────

describe('ImageOverlay.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.findComponent(ImageOverlay).exists()).toBe(true)
  })

  it('computed showOverlayModal reads from store', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.vm.showOverlayModal).toBe(false)
  })

  it('computed imageOverlay returns overlay object from store', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    const overlay = wrapper.vm.imageOverlay
    expect(overlay).toBeDefined()
    expect(overlay.opacity).toBe(95)
    expect(overlay.asciiOpacity).toBe(100)
    expect(overlay.visible).toBe(false)
  })

  it('computed imageOverlay returns empty object when no meta', () => {
    _mockStore = createMockStore({ asciibirdMeta: [] })
    store = _mockStore
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.vm.imageOverlay).toEqual({})
  })

  it('computed showOverlayModal returns true when store has overlay=true', () => {
    _mockStore = createMockStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: false,
        options: false, overlay: true, about: false, help: false,
      },
    })
    store = _mockStore
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.vm.showOverlayModal).toBe(true)
  })

  it('computed showOverlayModal returns false when store has overlay=false', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.vm.showOverlayModal).toBe(false)
  })

  it('imageOverlay computed returns overlay properties', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    const overlay = wrapper.vm.imageOverlay
    expect(overlay).toBeDefined()
    expect(typeof overlay.opacity).toBe('number')
    expect(typeof overlay.size).toBe('number')
  })

  it('renders ABModal component', () => {
    const wrapper = shallowMount(ImageOverlay, mountOpts())
    expect(wrapper.find('.ab-modal').exists()).toBe(true)
  })
})
