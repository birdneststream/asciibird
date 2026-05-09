// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import LZString from 'lz-string'
import Editor from '@/views/Editor.vue'
import { useAsciiBirdStore } from '@/store/index'
import {
  setStore,
  createNewAscii,
  exportMirc,
  mergeLayers,
  cyrb53,
} from '@/ascii'

// Mock hotkeys-js global used by Editor.vue
vi.stubGlobal('hotkeys', vi.fn((keys, scope, handler) => {
  if (typeof scope === 'function') return scope
  return handler
}))
vi.stubGlobal('hotkeys/filter', vi.fn(() => true))
vi.stubGlobal('hotkeys/setScope', vi.fn())
vi.stubGlobal('hotkeys/deleteScope', vi.fn())
vi.stubGlobal('hotkeys/unbind', vi.fn())

describe('Editor.vue', () => {
  let wrapper
  let pinia
  let store

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      return 0
    })
    vi.spyOn(window, 'setTimeout').mockImplementation(() => {
      return 0
    })

    pinia = createPinia()
    pinia.use(createPersistedState())
    setActivePinia(pinia)

    store = useAsciiBirdStore()
    setStore(store)

    createNewAscii({
      createAscii: {
        title: 'New Test ASCII',
        width: 5,
        height: 5,
      },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    vi.restoreAllMocks()
  })

  it('create new ascii data is as expected', () => {
    wrapper = mount(Editor, {
      global: {
        plugins: [pinia],
      },
    })

    const meta = store.asciibirdMeta[0]

    expect(meta.title).toBe('New Test ASCII')
    expect(meta.history).toStrictEqual([])
    expect(meta.historyIndex).toBe(0)
    expect(meta.x).toBe(247)
    expect(meta.y).toBe(24)
    expect(meta.selectedLayer).toBe(0)
    expect(meta.imageOverlay).toStrictEqual({
      url: null,
      opacity: 95,
      asciiOpacity: 100,
      left: 0,
      top: 0,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    })

    const layers = JSON.parse(
      LZString.decompressFromUTF16(meta.layers),
    )
    expect(layers.length).toBe(1)
    expect(layers[0].width).toBe(5)
    expect(layers[0].height).toBe(5)
    expect(layers[0].visible).toBe(true)
    expect(layers[0].data.length).toBe(5)
    expect(layers[0].data[0].length).toBe(5)
  })

  it('new ascii exports as expected', () => {
    wrapper = mount(Editor, {
      global: {
        plugins: [pinia],
      },
    })

    const mircExportHash = cyrb53(
      exportMirc(mergeLayers()).output.join(''),
    )
    expect(mircExportHash).toEqual(182731023251036)
  })

  it('fill tool on new ascii and export', () => {
    wrapper = mount(Editor, {
      global: {
        plugins: [pinia],
      },
    })

    wrapper.vm.x = 1
    wrapper.vm.y = 1

    wrapper.vm.fill(false)

    const mircExportHash = cyrb53(
      exportMirc(mergeLayers()).output.join(''),
    )
    expect(mircExportHash).toEqual(8495140863968528)
  })
})
