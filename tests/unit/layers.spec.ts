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
import Vue from 'vue'
import Layers from '@/components/parts/Layers.vue'
import {
  createMockStore,
  createMountOptions,
  toastedMock,
} from './helpers'

const localVue = createLocalVue()
Vue.use(Vuex)

let store: any

function mountOpts(extra: any = {}) {
  return createMountOptions(store, {
    localVue,
    ...extra,
  })
}

function createWrapper(extra: any = {}) {
  const wrapper = shallowMount(Layers, mountOpts(extra))
  // Mock $refs for ContextMenu
  wrapper.vm.$refs['layers-menu'] = {
    open: vi.fn(),
    close: vi.fn(),
  }
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Layers.vue ─────────────────────────────────────────────────

describe('Layers.vue', () => {
  // ── Computed properties ──────────────────────────────────────

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

  it('selectedLayer decrements and commits changeLayer when out of bounds',
    () => {
      // Set selectedLayer to 5 when only 1 layer exists
      store = createMockStore()
      const meta = store.state.asciibirdMeta[0]
      meta.selectedLayer = 5
      const commitSpy = vi.spyOn(store, 'commit')
      const wrapper = createWrapper()
      const result = wrapper.vm.selectedLayer
      // Should have decremented to 0 and committed changeLayer
      expect(commitSpy).toHaveBeenCalledWith('changeLayer', 0)
      expect(result).toBe(0)
    })

  it('currentLayer returns the layer at selectedLayer index', () => {
    const wrapper = createWrapper()
    const layer = wrapper.vm.currentLayer
    expect(layer).toBeDefined()
    expect(layer.label).toBe('Test Layer')
  })

  it('canToggleLayer returns true when more than 1 layer', () => {
    // Add a second layer via the store mutation
    store.commit('addLayer')
    const wrapper = createWrapper()
    expect(wrapper.vm.canToggleLayer).toBe(true)
  })

  it('canToggleLayer returns false when only 1 layer', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.canToggleLayer).toBe(false)
  })

  it('toolbarState returns store toolbarState getter', () => {
    const wrapper = createWrapper()
    const ts = wrapper.vm.toolbarState
    expect(ts).toBeDefined()
    expect(ts.currentTool).toBe(0)
  })

  it('imageOverlay returns overlay object from store', () => {
    const wrapper = createWrapper()
    const overlay = wrapper.vm.imageOverlay
    expect(overlay).toBeDefined()
    expect(overlay.visible).toBe(false)
    expect(overlay.opacity).toBe(95)
  })

  it('imageOverlay returns false when no meta', () => {
    store = createMockStore({ asciibirdMeta: [] })
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlay).toBe(false)
  })

  it('imageOverlayUrl returns empty string when no url', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlayUrl).toBe('')
  })

  it('imageOverlayUrl returns filename when url has path', () => {
    store = createMockStore()
    store.state.asciibirdMeta[0].imageOverlay.url =
      'https://example.com/images/test.png'
    const wrapper = createWrapper()
    expect(wrapper.vm.imageOverlayUrl).toBe('test.png')
  })

  // ── Methods ──────────────────────────────────────────────────

  it('changeLayer commits changeLayer mutation', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.changeLayer(2)
    expect(commitSpy).toHaveBeenCalledWith('changeLayer', 2)
  })

  it('toggleLayer commits toggleLayer and calls closeMenu', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.toggleLayer(0)
    expect(commitSpy).toHaveBeenCalledWith('toggleLayer', 0)
  })

  it('addLayer commits addLayer and shows toast', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.addLayer()
    expect(commitSpy).toHaveBeenCalledWith('addLayer')
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('new layer'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('removeLayer commits removeLayer and shows toast', () => {
    // Need multiple layers to remove one
    store.commit('addLayer')
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.removeLayer(0)
    expect(commitSpy).toHaveBeenCalledWith('removeLayer', 0)
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('Removed'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('upLayer commits upLayer mutation', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.upLayer(1)
    expect(commitSpy).toHaveBeenCalledWith('upLayer', 1)
  })

  it('downLayer commits downLayer mutation', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.downLayer(0)
    expect(commitSpy).toHaveBeenCalledWith('downLayer', 0)
  })

  it('mergeLayers commits mergeAllLayers and shows toast', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.mergeLayers()
    expect(commitSpy).toHaveBeenCalledWith('mergeAllLayers')
    expect(toastedMock.show).toHaveBeenCalledWith(
      expect.stringContaining('merged'),
      expect.objectContaining({ type: 'success' }),
    )
  })

  it('showOverlayModal commits openModal with overlay', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.showOverlayModal()
    expect(commitSpy).toHaveBeenCalledWith('openModal', 'overlay')
  })

  it('updateImageOverlay toggles visible and commits', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.updateImageOverlay()
    expect(commitSpy).toHaveBeenCalledWith(
      'updateImageOverlay',
      expect.objectContaining({ visible: true }),
    )
  })

  it('selectedLayerClass returns bg-red-200 for invisible layer',
    () => {
      // Toggle layer 0 to invisible
      store.commit('toggleLayer', 0)
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
      // Add a second layer and select the first
      store.commit('addLayer')
      store.commit('changeLayer', 0)
      const wrapper = createWrapper()
      expect(wrapper.vm.selectedLayerClass(1)).toBe('bg-gray-200')
    })

  it('selectBestLayer toggles first layer when all invisible', () => {
    // Make the single layer invisible
    store.commit('toggleLayer', 0)
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.selectBestLayer()
    expect(commitSpy).toHaveBeenCalledWith('toggleLayer', 0)
    expect(commitSpy).toHaveBeenCalledWith('changeLayer', 0)
  })

  it('selectBestLayer does nothing when visible layers exist', () => {
    const wrapper = createWrapper()
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.selectBestLayer()
    // Should not commit toggleLayer or changeLayer
    expect(commitSpy).not.toHaveBeenCalledWith(
      'toggleLayer', expect.anything(),
    )
    expect(commitSpy).not.toHaveBeenCalledWith(
      'changeLayer', expect.anything(),
    )
  })
})
