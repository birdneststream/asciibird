// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Colours from '@/components/Colours.vue'
import CharPicker from '@/components/parts/CharPicker.vue'
import ColourPicker from '@/components/parts/ColourPicker.vue'
import NewAscii from '@/components/modals/NewAscii.vue'
import About from '@/components/modals/About.vue'
import Help from '@/components/modals/Help.vue'
import Layers from '@/components/parts/Layers.vue'
import ContextMenu from '@/components/parts/ContextMenu.vue'
import { mircColours99, charCodes, charGroups } from '@/ascii'
import {
  createMockStore,
  createMockModalStore,
  createMockToolbarStore,
  toastedMock,
  copyTextMock,
  globalStubs,
  setupHotkeysMocks,
  type TestWrapper,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null
let _mockToolbarStore: any = null

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))
vi.mock('@/store/modal', () => ({
  useModalStore: () => _mockModalStore,
}))
vi.mock('@/store/toolbar', () => ({
  useToolbarStore: () => _mockToolbarStore,
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

function tw<T extends abstract new (...args: any) => any>(
  component: T,
  opts: any,
): TestWrapper {
  return mount(component as any, opts) as TestWrapper
}

function stw<T extends abstract new (...args: any) => any>(
  component: T,
  opts: any,
): TestWrapper {
  return shallowMount(component as any, opts) as TestWrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  store = createMockStore()
  _mockStore = store
  _mockModalStore = createMockModalStore()
  _mockToolbarStore = createMockToolbarStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Colours.vue ─────────────────────────────
describe('Colours.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(Colours, mountOpts())
    expect(wrapper.findComponent(Colours).exists()).toBe(true)
  })

  it('renders FG and BG buttons with correct colours', () => {
    const wrapper = tw(Colours, mountOpts())

    const fgBtn = wrapper.find('#currentColourFg')
    const bgBtn = wrapper.find('#currentColourBg')

    expect(fgBtn.exists()).toBe(true)
    expect(bgBtn.exists()).toBe(true)
    const fgStyle = fgBtn.attributes('style') || ''
    const bgStyle = bgBtn.attributes('style') || ''
    expect(fgStyle).toContain('background-color')
    expect(bgStyle).toContain('background-color')
    expect(fgStyle).toContain('255')
    expect(bgStyle).toContain('0, 0, 0')
  })

  it('clicking FG button toggles isChoosingFg', () => {
    const wrapper = tw(Colours, mountOpts())
    wrapper.find('#currentColourFg').trigger('click')
    expect(_mockToolbarStore.toolbarState.isChoosingFg).toBe(true)
  })

  it('clicking BG button toggles isChoosingBg', () => {
    const wrapper = tw(Colours, mountOpts())
    wrapper.find('#currentColourBg').trigger('click')
    expect(_mockToolbarStore.toolbarState.isChoosingBg).toBe(true)
  })

  it('swapColours swaps FG and BG', () => {
    const wrapper = tw(Colours, mountOpts())
    expect(_mockToolbarStore.toolbarState.currentColourFg).toBe(0)
    expect(_mockToolbarStore.toolbarState.currentColourBg).toBe(1)

    wrapper.vm.swapColours()

    expect(_mockToolbarStore.toolbarState.currentColourFg).toBe(1)
    expect(_mockToolbarStore.toolbarState.currentColourBg).toBe(0)
  })

  it('renders the swap button', () => {
    const wrapper = tw(Colours, mountOpts())
    expect(wrapper.find('#swapColour').exists()).toBe(true)
  })

  it('shows SP for space character', () => {
    const wrapper = tw(Colours, mountOpts())
    expect(wrapper.find('#currentChar').text()).toContain('SP')
  })

  it('clicking char button toggles isChoosingChar', () => {
    const wrapper = tw(Colours, mountOpts())
    wrapper.find('#currentChar').trigger('click')
    expect(_mockToolbarStore.toolbarState.isChoosingChar).toBe(true)
  })
})

// ─── CharPicker.vue ──────────────────────────
describe('CharPicker.vue', () => {
  it('mounts successfully with required props', () => {
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    expect(wrapper.findComponent(CharPicker).exists()).toBe(true)
  })

  it('provides charGroups from ascii module', () => {
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    expect(wrapper.vm.charGroups).toEqual(charGroups)
  })

  it('provides mircColours from ascii module', () => {
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    expect(wrapper.vm.mircColours).toEqual(mircColours99)
  })

  it('onCharChange calls store.changeChar', () => {
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    wrapper.vm.onCharChange('A')
    expect(_mockToolbarStore.toolbarState.selectedChar).toBe('A')
  })

  it('computes outline text-stroke when fg equals bg', () => {
    _mockStore = createMockStore({
      toolbarState: { currentColourFg: 5, currentColourBg: 5 },
    })
    store = _mockStore
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentColourFg: 5, currentColourBg: 5 },
    })
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    expect(wrapper.vm.outline).toContain(
      '-webkit-text-stroke-width',
    )
  })

  it('outline is empty when fg and bg differ', () => {
    const wrapper = stw(
      CharPicker,
      mountOpts({
        props: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      }),
    )
    expect(wrapper.vm.outline).toBe('')
  })
})

// ─── ColourPicker.vue ────────────────────────
describe('ColourPicker.vue', () => {
  it('mounts successfully with required props', () => {
    const wrapper = stw(
      ColourPicker,
      mountOpts({
        props: { yOffset: 0 },
      }),
    )
    expect(wrapper.findComponent(ColourPicker).exists()).toBe(true)
  })

  it('provides mircColours from ascii module', () => {
    const wrapper = stw(
      ColourPicker,
      mountOpts({
        props: { yOffset: 0 },
      }),
    )
    expect(wrapper.vm.mircColours).toEqual(mircColours99)
  })

  it('onColourChange sets FG when isChoosingFg', () => {
    _mockStore = createMockStore({
      toolbarState: { isChoosingFg: true, isChoosingBg: false },
    })
    store = _mockStore
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingFg: true, isChoosingBg: false },
    })
    const wrapper = stw(
      ColourPicker,
      mountOpts({
        props: { yOffset: 0 },
      }),
    )
    wrapper.vm.onColourChange(5)
    expect(_mockToolbarStore.toolbarState.currentColourFg).toBe(5)
  })

  it('onColourChange sets BG when isChoosingBg', () => {
    _mockStore = createMockStore({
      toolbarState: { isChoosingFg: false, isChoosingBg: true },
    })
    store = _mockStore
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingFg: false, isChoosingBg: true },
    })
    const wrapper = stw(
      ColourPicker,
      mountOpts({
        props: { yOffset: 0 },
      }),
    )
    wrapper.vm.onColourChange(8)
    expect(_mockToolbarStore.toolbarState.currentColourBg).toBe(8)
  })

  it('onColourChange does nothing when neither fg nor bg choosing', () => {
    const wrapper = stw(
      ColourPicker,
      mountOpts({
        props: { yOffset: 0 },
      }),
    )
    const prevFg = _mockToolbarStore.toolbarState.currentColourFg
    const prevBg = _mockToolbarStore.toolbarState.currentColourBg
    wrapper.vm.onColourChange(7)
    expect(_mockToolbarStore.toolbarState.currentColourFg).toBe(prevFg)
    expect(_mockToolbarStore.toolbarState.currentColourBg).toBe(prevBg)
  })
})

// ─── NewAscii.vue ────────────────────────────
describe('NewAscii.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(NewAscii, mountOpts())
    expect(wrapper.findComponent(NewAscii).exists()).toBe(true)
  })

  it('has default form values after close reset', () => {
    const wrapper = stw(NewAscii, mountOpts())
    wrapper.vm.close()
    expect(wrapper.vm.forms.createAscii.width).toBe(80)
    expect(wrapper.vm.forms.createAscii.height).toBe(30)
    expect(wrapper.vm.forms.createAscii.title).toBe('New ASCII')
  })

  it('open method sets title', () => {
    const wrapper = stw(NewAscii, mountOpts())
    wrapper.vm.open()
    expect(wrapper.vm.forms.createAscii.title).toContain(
      'New ASCII',
    )
  })

  it('close method resets form', () => {
    const wrapper = stw(NewAscii, mountOpts())
    wrapper.vm.forms.createAscii.width = 100
    wrapper.vm.forms.createAscii.height = 50
    wrapper.vm.forms.createAscii.title = 'modified'

    wrapper.vm.close()

    expect(wrapper.vm.forms.createAscii.width).toBe(80)
    expect(wrapper.vm.forms.createAscii.height).toBe(30)
  })

  it('computed showNewAsciiModal reads from store', () => {
    const wrapper = stw(NewAscii, mountOpts())
    expect(wrapper.vm.showNewAsciiModal).toBe(false)
  })

  it('mounted calls open when showNewAsciiModal is true', () => {
    _mockStore = createMockStore({
      modalState: {
        newAscii: true, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: false, help: false,
      },
    })
    store = _mockStore
    const wrapper = stw(NewAscii, mountOpts())
    expect(wrapper.vm.forms.createAscii.title).toContain('New ASCII')
  })

  it('watch showNewAsciiModal calls open on true', async () => {
    const wrapper = stw(NewAscii, mountOpts())
    store.modalState.newAscii = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.forms.createAscii.title).toContain('New ASCII')
  })

  it('watch showNewAsciiModal calls close on false', async () => {
    _mockStore = createMockStore({
      modalState: {
        newAscii: true, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: false, help: false,
      },
    })
    store = _mockStore
    const wrapper = stw(NewAscii, mountOpts())
    store.modalState.newAscii = false
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.forms.createAscii.width).toBe(80)
    expect(wrapper.vm.forms.createAscii.height).toBe(30)
  })

  it('initiateNewAscii calls closeModal and parses dimensions', () => {
    const asciiMock = vi.fn()
    vi.doMock('@/ascii', () => ({ default: asciiMock }))

    const wrapper = stw(NewAscii, mountOpts())
    wrapper.vm.forms.createAscii.width = '100'
    wrapper.vm.forms.createAscii.height = '50'
    wrapper.vm.forms.createAscii.title = 'Test ASCII'

    const spy = vi.spyOn(_mockModalStore, 'closeModal')
    try {
      wrapper.vm.initiateNewAscii()
    } catch {
      // createNewASCII may throw due to missing store
    }
    expect(spy).toHaveBeenCalledWith('new-ascii')
    expect(wrapper.vm.forms.createAscii.height).toBe(50)
    expect(wrapper.vm.forms.createAscii.width).toBe(100)

    vi.doUnmock('@/ascii')
  })

  it('initiateNewAscii handles string dimensions via parseInt', () => {
    const wrapper = stw(NewAscii, mountOpts())
    wrapper.vm.forms.createAscii.width = '40'
    wrapper.vm.forms.createAscii.height = '15'
    try {
      wrapper.vm.initiateNewAscii()
    } catch {
      // createNewASCII may throw due to missing store
    }
    expect(wrapper.vm.forms.createAscii.width).toBe(40)
    expect(wrapper.vm.forms.createAscii.height).toBe(15)
  })
})

// ─── About.vue ───────────────────────────────
describe('About.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(About, mountOpts())
    expect(wrapper.findComponent(About).exists()).toBe(true)
  })

  it('aboutAscii computed decompresses to an array', () => {
    const wrapper = stw(About, mountOpts())
    const ascii = wrapper.vm.aboutAscii
    expect(ascii).toBeDefined()
    expect(Array.isArray(ascii)).toBe(true)
  })

  it('computed showAboutModal reads modalState.about', () => {
    const wrapper = stw(About, mountOpts())
    expect(wrapper.vm.showAboutModal).toBe(false)
  })

  it('computed showAboutModal returns true when store has about=true', () => {
    _mockModalStore = createMockModalStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: true, help: false,
      },
    })
    const wrapper = stw(About, mountOpts())
    expect(wrapper.vm.showAboutModal).toBe(true)
  })

  it('computed showAboutModal returns false when store has about=false', () => {
    const wrapper = stw(About, mountOpts())
    expect(wrapper.vm.showAboutModal).toBe(false)
  })
})

// ─── Help.vue ────────────────────────────────
describe('Help.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(Help, mountOpts())
    expect(wrapper.findComponent(Help).exists()).toBe(true)
  })

  it('computed showHelpModal reads modalState.help', () => {
    const wrapper = stw(Help, mountOpts())
    expect(wrapper.vm.showHelpModal).toBe(false)
  })
})

// ─── ContextMenu.vue ─────────────────────────
describe('ContextMenu.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(ContextMenu, {
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('hidden by default (show=false)', () => {
    const wrapper = stw(ContextMenu, {
      global: { stubs: globalStubs },
    })
    expect(wrapper.vm.show).toBe(false)
  })

  it('style returns left and top positions after open', () => {
    const wrapper = stw(ContextMenu, {
      global: { stubs: globalStubs },
    })
    wrapper.vm.open({ clientX: 100, clientY: 200 })
    const style = wrapper.vm.contextStyle
    expect(style.left).toContain('100')
    expect(style.top).toContain('200')
  })

  it('close sets show to false', () => {
    const wrapper = stw(ContextMenu, {
      global: { stubs: globalStubs },
    })
    wrapper.vm.open({ clientX: 100, clientY: 200 })
    wrapper.vm.close()
    expect(wrapper.vm.show).toBe(false)
  })
})

// ─── Layers.vue ──────────────────────────────
describe('Layers.vue', () => {
  it('mounts successfully', () => {
    const wrapper = stw(Layers, mountOpts())
    expect(wrapper.exists()).toBe(true)
  })
})

// ─── mircColours99 integrity ─────────────────
describe('ascii module constants', () => {
  it('mircColours99 has 99 entries', () => {
    expect(mircColours99.length).toBe(99)
  })

  it('charCodes is a non-empty array', () => {
    expect(Array.isArray(charCodes)).toBe(true)
    expect(charCodes.length).toBeGreaterThan(0)
  })

  it('first color is white', () => {
    expect(mircColours99[0]).toBe('rgb(255,255,255)')
  })

  it('second color is black', () => {
    expect(mircColours99[1]).toBe('rgb(0,0,0)')
  })
})
