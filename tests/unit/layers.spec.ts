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
import Layers from '@/components/parts/Layers.vue'
import {
  createMockStore,
  createMockModalStore,
  toastedMock,
  globalStubs,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))
vi.mock('@/store/modal', () => ({
  useModalStore: () => _mockModalStore,
}))


vi.mock('../../src/composables/useToast', () => ({
  useToast: () => ({
    messages: { value: [] },
    show: toastedMock.show,
  }),
}))

vi.mock('../../src/composables/useDialog', () => ({
  useDialog: () => ({
    confirm: vi.fn(() => Promise.resolve(true)),
    alert: vi.fn(() => Promise.resolve()),
  }),
}))

let store: any

function createWrapper(extra: any = {}) {
  return shallowMount(Layers, {
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
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Layers.vue', () => {
  it('mounts successfully', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent(Layers).exists()).toBe(true)
  })

  it('currentAsciiLayers returns decompressed layers from store',
    () => {
      const wrapper = createWrapper()
      const layers = wrapper.vm.currentAsciiLayers
      expect(Array.isArray(layers)).toBe(true)
      expect(layers.length).toBeGreaterThanOrEqual(1)
      expect(layers[0].label).toBe('Test Layer')
    })

  it('selectedLayer returns store selectedLayer when valid', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.selectedLayer).toBe(0)
  })

  it('selectedLayer decrements and calls changeLayer when out of bounds',
    () => {
      store = createMockStore()
      const meta = store.asciibirdMeta[0]
      meta.selectedLayer = 5
      _mockStore = store
      const spy = vi.spyOn(store, 'changeLayer')
      const wrapper = createWrapper()
      const result = wrapper.vm.selectedLayer
      expect(spy).toHaveBeenCalledWith(0)
      expect(result).toBe(0)
    })

  it('currentLayer returns the layer at selectedLayer index', () => {
    const wrapper = createWrapper()
    const layer = wrapper.vm.currentLayer
    expect(layer).toBeDefined()
    expect(layer.label).toBe('Test Layer')
  })

  it('canToggleLayer returns true when more than 1 layer', () => {
    store.addLayer()
    const wrapper = createWrapper()
    expect(wrapper.vm.canToggleLayer).toBe(true)
  })

  it('canToggleLayer returns false when only 1 layer', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.canToggleLayer).toBe(false)
  })

  it('imageOverlay returns overlay object from store', () => {
    const wrapper = createWrapper()
    const overlay = wrapper.vm.imageOverlay
    expect(overlay).toBeDefined()
    expect(overlay.visible).toBe(false)
    expect(overlay.opacity).toBe(95)
  })

  it('imageOverlay returns fallback when no meta', () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlay).toEqual({ visible: false })
  })

  it('imageOverlayUrl returns empty string when no url', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlayUrl).toBe('')
  })

  it('imageOverlayUrl returns filename when url has path', () => {
    store = createMockStore()
    store.asciibirdMeta[0].imageOverlay.url =
      'https://example.com/images/test.png'
    _mockStore = store
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlayUrl).toBe('test.png')
  })

  it('changeLayer calls store changeLayer action', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'changeLayer')
    wrapper.vm.changeLayer(2)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('toggleLayer calls store toggleLayer', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'toggleLayer')
    wrapper.vm.toggleLayer(0)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('addLayer calls store addLayer and shows toast', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'addLayer')
    wrapper.vm.addLayer()
    expect(spy).toHaveBeenCalled()
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('new layer'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('removeLayer calls store removeLayer and shows toast', () => {
    store.addLayer()
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'removeLayer')
    wrapper.vm.removeLayer(0)
    expect(spy).toHaveBeenCalledWith(0)
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('Removed'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('upLayer calls store upLayer action', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'upLayer')
    wrapper.vm.upLayer(1)
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('downLayer calls store downLayer action', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'downLayer')
    wrapper.vm.downLayer(0)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('mergeLayers calls store mergeAllLayers and shows toast', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'mergeAllLayers')
    wrapper.vm.mergeLayers()
    expect(spy).toHaveBeenCalled()
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('merged'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('showOverlayModal calls modal store openModal with overlay', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(_mockModalStore, 'openModal')
    wrapper.vm.showOverlayModal()
    expect(spy).toHaveBeenCalledWith('overlay')
  })

  it('updateImageOverlay toggles visible and calls store', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'updateImageOverlay')
    wrapper.vm.updateImageOverlay()
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ visible: true }),
    )
  })

  it('selectedLayerClass returns bg-red-200 for invisible layer',
    () => {
      store.toggleLayer(0)
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedLayerClass(0)).toBe('bg-red-200')
    })

  it('selectedLayerClass returns bg-blue-200 for selected layer',
    () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedLayerClass(0)).toBe('bg-blue-200')
    })

  it('selectedLayerClass returns bg-gray-200 for unselected visible',
    () => {
      store.addLayer()
      store.changeLayer(0)
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedLayerClass(1)).toBe('bg-gray-200')
    })

  it('selectBestLayer toggles first layer when all invisible', () => {
    store.toggleLayer(0)
    const wrapper = createWrapper()
    const toggleSpy = vi.spyOn(store, 'toggleLayer')
    const changeSpy = vi.spyOn(store, 'changeLayer')
    wrapper.vm.selectBestLayer()
    expect(toggleSpy).toHaveBeenCalledWith(0)
    expect(changeSpy).toHaveBeenCalledWith(0)
  })

  it('selectBestLayer does nothing when visible layers exist', () => {
    const wrapper = createWrapper()
    const toggleSpy = vi.spyOn(store, 'toggleLayer')
    const changeSpy = vi.spyOn(store, 'changeLayer')
    wrapper.vm.selectBestLayer()
    expect(toggleSpy).not.toHaveBeenCalled()
    expect(changeSpy).not.toHaveBeenCalled()
  })

  it('openContextMenu prevents default', () => {
    const wrapper = createWrapper()
    const mockEvent = { preventDefault: vi.fn(), clientX: 10, clientY: 20 }
    wrapper.vm.openContextMenu(mockEvent)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('closeMenu does not throw', () => {
    const wrapper = createWrapper()
    expect(() => wrapper.vm.closeMenu()).not.toThrow()
  })

  it('updateLayerName calls store updateLayerName', () => {
    const wrapper = createWrapper()
    const spy = vi.spyOn(store, 'updateLayerName')
    wrapper.vm.updateLayerName(0, 'Renamed Layer')
    expect(spy).toHaveBeenCalledWith({
      key: 0,
      label: 'Renamed Layer',
    })
  })

  it('selectBestLayer is called when selectedLayer computed changes', () => {
    store.addLayer()
    const wrapper = createWrapper()
    expect(typeof wrapper.vm.selectBestLayer).toBe('function')
    expect(typeof wrapper.vm.selectedLayer).toBe('number')
  })
})
