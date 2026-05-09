// @vitest-environment jsdom

import {
  mount,
  createLocalVue
} from '@vue/test-utils'
import Vuex from 'vuex'
import LZString from 'lz-string'
import Editor from '@/views/Editor.vue'
import vuexStore from '../../src/store/index'
import {
  createNewAscii,
  exportMirc,
  mergeLayers,
  cyrb53,
} from '../../src/ascii'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Editor.vue', () => {
  let store

  beforeEach(() => {
    store = vuexStore

    // make a new ascii
    createNewAscii({
      createAscii: {
        title: 'New Test ASCII',
        width: 5,
        height: 5,
      }
    })
  })

  it('create new ascii data is as expected', () => {
    mount(Editor, { store, localVue })

    const meta = store.getters.asciibirdMeta[0]

    // Verify structure (not exact compressed string — that's fragile)
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

    // Verify layers decompress correctly to 1 layer with correct dimensions
    const layers = JSON.parse(
      LZString.decompressFromUTF16(meta.layers)
    )
    expect(layers.length).toBe(1)
    expect(layers[0].width).toBe(5)
    expect(layers[0].height).toBe(5)
    expect(layers[0].visible).toBe(true)
    expect(layers[0].data.length).toBe(5)
    expect(layers[0].data[0].length).toBe(5)
  })

  it('new ascii exports as expected', () => {
    mount(Editor, { store, localVue })

    // Blank ascii exported to mIRC
    let mircExportHash = cyrb53(exportMirc(mergeLayers()).output.join(''))

    expect(mircExportHash).toEqual(182731023251036)
  })

  it('fill tool on new ascii and export', () => {
    const wrapper = mount(Editor, { store, localVue })

    wrapper.vm.x = 1
    wrapper.vm.y = 1

    wrapper.vm.fill(false)

    // Black canvas fill
    let mircExportHash = cyrb53(exportMirc(mergeLayers()).output.join(''))
    expect(mircExportHash).toEqual(8495140863968528)
  })
})
