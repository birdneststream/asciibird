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
import PasteAscii from '@/components/modals/PasteAscii.vue'
import EditAscii from '@/components/modals/EditAscii.vue'
import Options from '@/components/modals/Options.vue'
import {
  maxBrushHistory,
  maxUndoHistory,
  tabLimit,
  setStore,
} from '@/ascii'
import {
  modalMock,
  setupHotkeysMocks,
  createMockStore,
  createMountOptions,
} from './helpers'

const localVue = createLocalVue()

setupHotkeysMocks()

let store: any

function mountOpts(extra: any = {}) {
  return createMountOptions(store, { localVue, ...extra })
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
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

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
  })

  it('close resets data and hides modal', () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
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
    setStore({
      state: store.state,
      getters: store.getters,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
    } as any)

    const wrapper = shallowMount(PasteAscii, mountOpts())
    wrapper.vm.pasteContent = '\x031,0Test'
    wrapper.vm.title = 'test.txt'

    await wrapper.vm.importPasteAscii()
    expect(wrapper.vm.pasteContent).toBe('')
    expect(modalMock.hide).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
  })

  it('watch showPasteAscii triggers open on true', async () => {
    const wrapper = shallowMount(PasteAscii, mountOpts())
    store.state.modalState.pasteAscii = true
    await wrapper.vm.$nextTick()
    expect(modalMock.show).toHaveBeenCalledWith(
      'paste-ascii-modal',
    )
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

  it('open sets layer data and shows modal', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.open()
    expect(wrapper.vm.layer.width).toBe(3)
    expect(wrapper.vm.layer.height).toBe(3)
    expect(wrapper.vm.layer.title).toBe('Test ASCII')
    expect(modalMock.show).toHaveBeenCalledWith(
      'edit-ascii-modal',
    )
  })

  it('close resets layer and hides modal', () => {
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.layer = { width: 10, height: 20, title: 'test' }
    wrapper.vm.close()
    expect(wrapper.vm.layer).toEqual({})
    expect(modalMock.hide).toHaveBeenCalledWith(
      'edit-ascii-modal',
    )
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

  it('updateAscii calls fillNullBlocks and commits mutations', () => {
    // Need setStore for fillNullBlocks used inside updateAscii
    setStore({
      state: store.state,
      getters: store.getters,
      commit: store.commit.bind(store),
      dispatch: store.dispatch.bind(store),
    } as any)

    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(EditAscii, mountOpts())
    wrapper.vm.layer = { width: 5, height: 5, title: 'Test' }

    wrapper.vm.updateAscii()

    expect(commitSpy).toHaveBeenCalledWith(
      'changeAsciiWidthHeight',
      expect.objectContaining({
        width: 5,
        height: 5,
        layers: expect.any(Array),
      }),
    )
    expect(modalMock.hide).toHaveBeenCalledWith(
      'edit-ascii-modal',
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
    expect(wrapper.vm.options).toEqual(store.state.options)
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

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(Options, mountOpts())
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith('options-modal')
  })

  it('close calls $modal.hide', () => {
    const wrapper = shallowMount(Options, mountOpts())
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

    const wrapper = shallowMount(Options, mountOpts())
    wrapper.vm.clearCache()

    expect(clearSpy).toHaveBeenCalled()
    expect(reloadSpy).toHaveBeenCalled()

    clearSpy.mockRestore()
  })

  it('updateOptions commits current options to store', () => {
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = shallowMount(Options, mountOpts())
    wrapper.vm.updateOptions()
    expect(commitSpy).toHaveBeenCalledWith(
      'updateOptions',
      expect.objectContaining({ fps: 50 }),
    )
  })

  it('watch showOptionsModal triggers open on true', async () => {
    const wrapper = shallowMount(Options, mountOpts())
    store.state.modalState.options = true
    await wrapper.vm.$nextTick()
    expect(modalMock.show).toHaveBeenCalledWith('options-modal')
  })
})
