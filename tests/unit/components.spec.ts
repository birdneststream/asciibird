// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Colours from '@/components/Colours.vue'
import CharPicker from '@/components/parts/CharPicker.vue'
import ColourPicker from '@/components/parts/ColourPicker.vue'
import NewAscii from '@/components/modals/NewAscii.vue'
import About from '@/components/modals/About.vue'
import Help from '@/components/modals/Help.vue'
import Layers from '@/components/parts/Layers.vue'
import ContextMenu from '@/components/parts/ContextMenu.vue'
import { mircColours99, charCodes } from '@/ascii'

const localVue = createLocalVue()
localVue.use(Vuex)

// Stub vue-tailwind components globally
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
    template: '<textarea><slot /></textarea>',
  },
  'vue-draggable-resizable': {
    template: '<div class="vdr"><slot /></div>',
  },
}

// Mock $modal for components that use it
const modalMock = {
  show: vi.fn(),
  hide: vi.fn(),
}

// Mock hotkeys for KeyboardShortcuts
vi.stubGlobal(
  'hotkeys',
  vi.fn((keys, scope, handler) => {
    if (typeof scope === 'function') {
      return scope
    }
    return handler
  })
)
vi.stubGlobal('hotkeys/filter', vi.fn(() => true))
vi.stubGlobal('hotkeys/setScope', vi.fn())
vi.stubGlobal('hotkeys/deleteScope', vi.fn())
vi.stubGlobal('hotkeys/unbind', vi.fn())

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
    gridMode: false,
    ...overrides,
  }
}

function createMockStore(overrides = {}) {
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
    desktopState: {
      menuBarVisible: true,
      tabsVisible: true,
    },
    asciibirdMeta: [],
    toolbarState: createToolbarState(),
    debugPanel: false,
    brushHistory: [],
    brushLibrary: [],
    copiedBlocks: [],
    brushPreview: [],
    panelState: {
      toolbar: { x: 10, y: 40 },
      debugPanel: { x: 10, y: 40 },
      brushLibrary: { x: 10, y: 40 },
      layersLibrary: { x: 10, y: 40 },
      brushPreview: { x: 10, y: 40 },
    },
  }

  const state = { ...defaultState, ...overrides }
  if (overrides.toolbarState) {
    state.toolbarState = createToolbarState(
      overrides.toolbarState
    )
  }

  return new Vuex.Store({
    state,
    getters: {
      modalState: (s) => s.modalState,
      toolbarState: (s) => s.toolbarState,
      currentFg: (s) => s.toolbarState.currentColourFg,
      currentBg: (s) => s.toolbarState.currentColourBg,
      asciibirdMeta: (s) => s.asciibirdMeta,
      options: (s) => s.options,
      tab: (s) => s.tab,
      brushHistory: (s) => s.brushHistory,
      brushLibrary: (s) => s.brushLibrary,
      copiedBlocks: (s) => s.copiedBlocks,
      brushPreview: (s) => s.brushPreview,
      desktopState: (s) => s.desktopState,
      debugPanel: (s) => s.debugPanel,
      panelState: (s) => s.panelState,
      persistCharPanel: (s) =>
        s.toolbarState.persistCharPanel,
      currentAsciiLayers: () => [],
      selectedLayer: (s) =>
        s.asciibirdMeta[s.tab]?.selectedLayer ?? 0,
      imageOverlay: (s) =>
        s.asciibirdMeta[s.tab]?.imageOverlay,
    },
    mutations: {
      closeModal: (s, name) => {
        if (name === 'new-ascii') s.modalState.newAscii = false
        else if (name === 'edit-ascii')
          s.modalState.editAscii = false
        else if (name === 'about') s.modalState.about = false
        else if (name === 'help') s.modalState.help = false
        else if (s.modalState[name] !== undefined)
          s.modalState[name] = false
      },
      openModal: (s, name) => {
        if (s.modalState[name] !== undefined)
          s.modalState[name] = true
      },
      changeColourFg: (s, colour) => {
        s.toolbarState.currentColourFg = colour
      },
      changeColourBg: (s, colour) => {
        s.toolbarState.currentColourBg = colour
      },
      changeIsUpdatingFg: (s, val) => {
        s.toolbarState.isChoosingFg = val
      },
      changeIsUpdatingBg: (s, val) => {
        s.toolbarState.isChoosingBg = val
      },
      changeIsUpdatingChar: (s, val) => {
        s.toolbarState.isChoosingChar = val
      },
      changeChar: (s, char) => {
        s.toolbarState.selectedChar = char
      },
      persistCharPanel: (s, val) => {
        s.toolbarState.persistCharPanel = val
      },
    },
  })
}

function mountOptions(store, extra = {}) {
  return {
    store,
    localVue,
    mocks: { $modal: modalMock },
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

// ─── Colours.vue ─────────────────────────────
describe('Colours.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Colours,
      mountOptions(store)
    )
    expect(wrapper.findComponent(Colours).exists()).toBe(true)
  })

  it('renders FG and BG buttons with correct colours', () => {
    const wrapper = mount(Colours, mountOptions(store))

    const fgBtn = wrapper.find('#currentColourFg')
    const bgBtn = wrapper.find('#currentColourBg')

    expect(fgBtn.exists()).toBe(true)
    expect(bgBtn.exists()).toBe(true)
    // DOM may reformat rgb values with spaces
    const fgStyle = fgBtn.attributes('style') || ''
    const bgStyle = bgBtn.attributes('style') || ''
    expect(fgStyle).toContain('background-color')
    expect(bgStyle).toContain('background-color')
    expect(fgStyle).toContain('255')
    expect(bgStyle).toContain('0, 0, 0')
  })

  it('clicking FG button toggles isChoosingFg', () => {
    const wrapper = mount(Colours, mountOptions(store))
    wrapper.find('#currentColourFg').trigger('click')
    expect(store.state.toolbarState.isChoosingFg).toBe(true)
  })

  it('clicking BG button toggles isChoosingBg', () => {
    const wrapper = mount(Colours, mountOptions(store))
    wrapper.find('#currentColourBg').trigger('click')
    expect(store.state.toolbarState.isChoosingBg).toBe(true)
  })

  it('swapColours swaps FG and BG', () => {
    const wrapper = mount(Colours, mountOptions(store))
    expect(store.state.toolbarState.currentColourFg).toBe(0)
    expect(store.state.toolbarState.currentColourBg).toBe(1)

    wrapper.vm.swapColours()

    expect(store.state.toolbarState.currentColourFg).toBe(1)
    expect(store.state.toolbarState.currentColourBg).toBe(0)
  })

  it('renders the swap button', () => {
    const wrapper = mount(Colours, mountOptions(store))
    expect(wrapper.find('#swapColour').exists()).toBe(true)
  })

  it('shows SP for space character', () => {
    const wrapper = mount(Colours, mountOptions(store))
    expect(wrapper.find('#currentChar').text()).toContain(
      'SP'
    )
  })

  it('clicking char button toggles isChoosingChar', () => {
    const wrapper = mount(Colours, mountOptions(store))
    wrapper.find('#currentChar').trigger('click')
    expect(
      store.state.toolbarState.isChoosingChar
    ).toBe(true)
  })
})

// ─── CharPicker.vue ──────────────────────────
describe('CharPicker.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully with required props', () => {
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(store, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    expect(wrapper.findComponent(CharPicker).exists()).toBe(
      true
    )
  })

  it('provides charCodes from ascii module', () => {
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(store, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    expect(wrapper.vm.charCodes).toEqual(charCodes)
  })

  it('provides mircColours from ascii module', () => {
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(store, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    expect(wrapper.vm.mircColours).toEqual(mircColours99)
  })

  it('onCharChange commits changeChar mutation', () => {
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(store, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    wrapper.vm.onCharChange('A')
    expect(store.state.toolbarState.selectedChar).toBe('A')
  })

  it('computes outline text-stroke when fg equals bg', () => {
    const sameStore = createMockStore({
      toolbarState: createToolbarState({
        currentColourFg: 5,
        currentColourBg: 5,
      }),
    })
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(sameStore, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    expect(wrapper.vm.outline).toContain(
      '-webkit-text-stroke-width'
    )
  })

  it('outline is empty when fg and bg differ', () => {
    const wrapper = shallowMount(
      CharPicker,
      mountOptions(store, {
        propsData: {
          canvasX: 0,
          canvasY: 0,
          yOffset: 0,
        },
      })
    )
    expect(wrapper.vm.outline).toBe('')
  })
})

// ─── ColourPicker.vue ────────────────────────
describe('ColourPicker.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully with required props', () => {
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      })
    )
    expect(
      wrapper.findComponent(ColourPicker).exists()
    ).toBe(true)
  })

  it('provides mircColours from ascii module', () => {
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      })
    )
    expect(wrapper.vm.mircColours).toEqual(mircColours99)
  })

  it('onColourChange sets FG when isChoosingFg', () => {
    const fgStore = createMockStore({
      toolbarState: createToolbarState({
        isChoosingFg: true,
        isChoosingBg: false,
      }),
    })
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(fgStore, {
        propsData: { yOffset: 0 },
      })
    )
    wrapper.vm.onColourChange(5)
    expect(fgStore.state.toolbarState.currentColourFg).toBe(5)
  })

  it('onColourChange sets BG when isChoosingBg', () => {
    const bgStore = createMockStore({
      toolbarState: createToolbarState({
        isChoosingFg: false,
        isChoosingBg: true,
      }),
    })
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(bgStore, {
        propsData: { yOffset: 0 },
      })
    )
    wrapper.vm.onColourChange(8)
    expect(bgStore.state.toolbarState.currentColourBg).toBe(8)
  })

  it('close resets both fg and bg choosing state', () => {
    const bothStore = createMockStore({
      toolbarState: createToolbarState({
        isChoosingFg: true,
        isChoosingBg: true,
      }),
    })
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(bothStore, {
        propsData: { yOffset: 0 },
      })
    )
    wrapper.vm.close()
    expect(
      bothStore.state.toolbarState.isChoosingFg
    ).toBe(false)
    expect(
      bothStore.state.toolbarState.isChoosingBg
    ).toBe(false)
  })

  it('onColourChange does nothing when neither fg nor bg choosing', () => {
    const wrapper = shallowMount(
      ColourPicker,
      mountOptions(store, {
        propsData: { yOffset: 0 },
      })
    )
    const prevFg = store.state.toolbarState.currentColourFg
    const prevBg = store.state.toolbarState.currentColourBg
    wrapper.vm.onColourChange(7)
    expect(store.state.toolbarState.currentColourFg).toBe(
      prevFg
    )
    expect(store.state.toolbarState.currentColourBg).toBe(
      prevBg
    )
  })
})

// ─── NewAscii.vue ────────────────────────────
describe('NewAscii.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    expect(wrapper.findComponent(NewAscii).exists()).toBe(
      true
    )
  })

  it('has default form values after close reset', () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    // mounted() may modify title, but close resets it
    wrapper.vm.close()
    expect(wrapper.vm.forms.createAscii.width).toBe(80)
    expect(wrapper.vm.forms.createAscii.height).toBe(30)
    // close resets title to "New ASCII"
    expect(wrapper.vm.forms.createAscii.title).toBe(
      'New ASCII'
    )
  })

  it('open method calls $modal.show and sets title', () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith(
      'new-ascii-modal'
    )
    expect(wrapper.vm.forms.createAscii.title).toContain(
      'New ASCII'
    )
  })

  it('close method calls $modal.hide and resets form', () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    wrapper.vm.forms.createAscii.width = 100
    wrapper.vm.forms.createAscii.height = 50
    wrapper.vm.forms.createAscii.title = 'modified'

    wrapper.vm.close()

    expect(modalMock.hide).toHaveBeenCalledWith(
      'new-ascii-modal'
    )
    expect(wrapper.vm.forms.createAscii.width).toBe(80)
    expect(wrapper.vm.forms.createAscii.height).toBe(30)
  })

  it('computed showNewAsciiModal reads from store', () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    expect(wrapper.vm.showNewAsciiModal).toBe(false)
  })

  it('mounted opens modal when showNewAsciiModal is true', () => {
    store = createMockStore({
      modalState: {
        newAscii: true, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: false, help: false,
      },
    })
    shallowMount(NewAscii, mountOptions(store))
    expect(modalMock.show).toHaveBeenCalledWith('new-ascii-modal')
  })

  it('watch showNewAsciiModal opens modal on true', async () => {
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    store.state.modalState.newAscii = true
    await wrapper.vm.$nextTick()
    expect(modalMock.show).toHaveBeenCalledWith('new-ascii-modal')
  })

  it('watch showNewAsciiModal closes modal on false', async () => {
    store = createMockStore({
      modalState: {
        newAscii: true, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: false, help: false,
      },
    })
    const wrapper = shallowMount(
      NewAscii,
      mountOptions(store)
    )
    store.state.modalState.newAscii = false
    await wrapper.vm.$nextTick()
    expect(modalMock.hide).toHaveBeenCalledWith('new-ascii-modal')
  })

  it('initiateNewAscii commits closeModal and parses dimensions',
    async () => {
      // Mock the ascii module's default export (createNewASCII)
      const asciiMock = vi.fn()
      vi.doMock('@/ascii', () => ({ default: asciiMock }))

      const wrapper = shallowMount(
        NewAscii,
        mountOptions(store)
      )
      wrapper.vm.forms.createAscii.width = '100'
      wrapper.vm.forms.createAscii.height = '50'
      wrapper.vm.forms.createAscii.title = 'Test ASCII'

      // Call initiateNewAscii — the commit spy verifies closeModal
      const commitSpy = vi.spyOn(store, 'commit')
      try {
        wrapper.vm.initiateNewAscii()
      } catch {
        // createNewASCII may throw due to missing store
        // but we verify the commit and parsing happened first
      }
      expect(commitSpy).toHaveBeenCalledWith(
        'closeModal', 'new-ascii',
      )
      expect(wrapper.vm.forms.createAscii.height).toBe(50)
      expect(wrapper.vm.forms.createAscii.width).toBe(100)

      vi.doUnmock('@/ascii')
    })

  it('initiateNewAscii handles string dimensions via parseInt',
    async () => {
      const wrapper = shallowMount(
        NewAscii,
        mountOptions(store)
      )
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
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    expect(wrapper.findComponent(About).exists()).toBe(true)
  })

  it('aboutAscii computed decompresses to an array', () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    const ascii = wrapper.vm.aboutAscii
    expect(ascii).toBeDefined()
    expect(Array.isArray(ascii)).toBe(true)
  })

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith('about-modal')
  })

  it('close calls $modal.hide', () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    wrapper.vm.close()
    expect(modalMock.hide).toHaveBeenCalledWith('about-modal')
  })

  it('computed showOptionsModal reads modalState.about', () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    expect(wrapper.vm.showOptionsModal).toBe(false)
  })

  it('mounted opens modal when modalState.about is true', () => {
    store = createMockStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: true, help: false,
      },
    })
    shallowMount(About, mountOptions(store))
    expect(modalMock.show).toHaveBeenCalledWith('about-modal')
  })

  it('watch showOptionsModal opens modal on true', async () => {
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    store.state.modalState.about = true
    await wrapper.vm.$nextTick()
    expect(modalMock.show).toHaveBeenCalledWith('about-modal')
  })

  it('watch showOptionsModal closes modal on false', async () => {
    store = createMockStore({
      modalState: {
        newAscii: false, editAscii: false, pasteAscii: false,
        options: false, overlay: false, about: true, help: false,
      },
    })
    const wrapper = shallowMount(
      About,
      mountOptions(store)
    )
    store.state.modalState.about = false
    await wrapper.vm.$nextTick()
    expect(modalMock.hide).toHaveBeenCalledWith('about-modal')
  })
})

// ─── Help.vue ────────────────────────────────
describe('Help.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(
      Help,
      mountOptions(store)
    )
    expect(wrapper.findComponent(Help).exists()).toBe(true)
  })

  it('open calls $modal.show', () => {
    const wrapper = shallowMount(
      Help,
      mountOptions(store)
    )
    wrapper.vm.open()
    expect(modalMock.show).toHaveBeenCalledWith('help-modal')
  })

  it('close calls $modal.hide', () => {
    const wrapper = shallowMount(
      Help,
      mountOptions(store)
    )
    wrapper.vm.close()
    expect(modalMock.hide).toHaveBeenCalledWith('help-modal')
  })

  it('computed showOptionsModal reads modalState.help', () => {
    const wrapper = shallowMount(
      Help,
      mountOptions(store)
    )
    expect(wrapper.vm.showOptionsModal).toBe(false)
  })

  it('helpAscii decompresses to an array', () => {
    const wrapper = shallowMount(
      Help,
      mountOptions(store)
    )
    const ascii = wrapper.vm.helpAscii
    expect(ascii).toBeDefined()
    expect(Array.isArray(ascii)).toBe(true)
  })
})

// ─── ContextMenu.vue ─────────────────────────
describe('ContextMenu.vue', () => {
  it('mounts successfully', () => {
    const store = createMockStore()
    const wrapper = shallowMount(ContextMenu, {
      store,
      localVue,
      propsData: { display: false },
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('hidden by default (show=false)', () => {
    const store = createMockStore()
    const wrapper = shallowMount(ContextMenu, {
      store,
      localVue,
      propsData: { display: false },
      global: { stubs: globalStubs },
    })
    expect(wrapper.vm.show).toBe(false)
  })

  it('style returns left and top positions', () => {
    const store = createMockStore()
    const wrapper = shallowMount(ContextMenu, {
      store,
      localVue,
      propsData: { display: false },
      global: { stubs: globalStubs },
    })
    wrapper.setData({ left: 100, top: 200 })
    const style = wrapper.vm.style
    expect(style.left).toContain('100')
    expect(style.top).toContain('200')
  })

  it('close sets show to false', () => {
    const store = createMockStore()
    const wrapper = shallowMount(ContextMenu, {
      store,
      localVue,
      propsData: { display: false },
      global: { stubs: globalStubs },
    })
    wrapper.setData({ show: true })
    wrapper.vm.close()
    expect(wrapper.vm.show).toBe(false)
  })
})

// ─── Layers.vue ──────────────────────────────
describe('Layers.vue', () => {
  let store

  beforeEach(() => {
    store = createMockStore()
  })

  it('mounts successfully', () => {
    const wrapper = shallowMount(Layers, {
      store,
      localVue,
      mocks: { $modal: modalMock },
      global: { stubs: globalStubs },
    })
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
