// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import KeyboardShortcuts from '@/components/parts/KeyboardShortcuts.vue'
import hotkeys from 'hotkeys-js'
import {
  createMockStore,
  createToolbarState,
  globalStubs,
} from './helpers'

let _mockStore: any = null

// Capture hotkeys handlers via the module mock
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const capturedHandlers = new Map<string, Function[]>()

vi.mock('hotkeys-js', () => {
  const fn = vi.fn((keys: any, scope: any, handler: any) => {
    if (typeof scope === 'function') {
      handler = scope
      scope = '*'
    }
    const key = `${scope}:${keys}`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    if (!(capturedHandlers as Map<string, Function[]>).has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      ;(capturedHandlers as Map<string, Function[]>).set(key, [])
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ;(capturedHandlers as Map<string, Function[]>).get(key)!.push(handler)
  })
  fn.filter = vi.fn(() => true)
  fn.setScope = vi.fn()
  fn.deleteScope = vi.fn()
  fn.unbind = vi.fn()
  return { default: fn, __esModule: true }
})

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))

let store: any

function mountOpts(extra: any = {}) {
  return {
    global: {
      plugins: [createPinia()],
      stubs: globalStubs,
    },
    props: {
      selectedBlocks: [],
      textEditing: false,
      selecting: { startX: -1, startY: -1, endX: -1, endY: -1 },
      isInputtingBrushSize: false,
      showingPostUrl: false,
      isShowingDialog: false,
      canvasX: 0,
      canvasY: 0,
    },
    ...extra,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  capturedHandlers.clear()
  store = createMockStore()
  _mockStore = store
})

afterEach(() => {
  vi.restoreAllMocks()
})

function getHandler(key: string) {
  const handlers = capturedHandlers.get(key)
  return handlers?.[0]
}

function createEvent(overrides: Record<string, any> = {}) {
  return {
    preventDefault: vi.fn(),
    key: '',
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    ...overrides,
  }
}

describe('KeyboardShortcuts.vue', () => {
  it('mounts successfully', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.findComponent(KeyboardShortcuts).exists()).toBe(true)
  })

  it('registers wildcard handler in editor scope on created', () => {
    shallowMount(KeyboardShortcuts, mountOpts())
    const handler = getHandler('editor:*')
    expect(handler).toBeDefined()
  })

  it('registers escape handler in editor scope on created', () => {
    shallowMount(KeyboardShortcuts, mountOpts())
    const handler = getHandler('editor:Escape')
    expect(handler).toBeDefined()
  })

  it('sets scope to editor when disableKeyboard is false', () => {
    shallowMount(KeyboardShortcuts, mountOpts())
    expect((hotkeys as any).setScope).toHaveBeenCalledWith(
      'editor',
    )
  })

  it('sets scope to modals when disableKeyboard is true', () => {
    store = createMockStore({ isKeyboardDisabled: true })
    _mockStore = store
    shallowMount(KeyboardShortcuts, mountOpts())
    expect((hotkeys as any).setScope).toHaveBeenCalledWith(
      'modals',
    )
  })

  it('disableKeyboard computed reads from store', () => {
    store = createMockStore({ isKeyboardDisabled: true })
    _mockStore = store
    shallowMount(KeyboardShortcuts, mountOpts())
    expect((hotkeys as any).setScope).toHaveBeenCalledWith(
      'modals',
    )
  })

  it('wildcard handler calls changeChar for single char when isChoosingChar',
    () => {
      store = createMockStore({
        toolbarState: createToolbarState({
          isChoosingChar: true,
          persistCharPanel: false,
        }),
      })
      _mockStore = store
      shallowMount(KeyboardShortcuts, mountOpts())
      const spy = vi.spyOn(store, 'changeChar')
      const handler = getHandler('editor:*')
      const event = createEvent({ key: 'a' })
      handler!(event, {})
      expect(spy).toHaveBeenCalledWith('a')
    })

  it('wildcard handler calls changeTool for alt+number', () => {
    shallowMount(KeyboardShortcuts, mountOpts())
    const spy = vi.spyOn(store, 'changeTool')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '3', altKey: true })
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('wildcard handler emits updatecanvas for alt+number', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '5', altKey: true })
    handler!(event, {})
    expect(wrapper.emitted('updatecanvas')).toBeTruthy()
  })

  it('wildcard handler calls changeColourFg when isChoosingFg', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ isChoosingFg: true }),
    })
    _mockStore = store
    shallowMount(KeyboardShortcuts, mountOpts())
    const spy = vi.spyOn(store, 'changeColourFg')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '5' })
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(5)
  })

  it('wildcard handler calls changeColourBg when isChoosingBg', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ isChoosingBg: true }),
    })
    _mockStore = store
    shallowMount(KeyboardShortcuts, mountOpts())
    const spy = vi.spyOn(store, 'changeColourBg')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '7' })
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(7)
  })

  it('escape handler calls changeIsUpdatingFg/Bg/Char when choosing',
    () => {
      store = createMockStore({
        toolbarState: createToolbarState({ isChoosingChar: true }),
      })
      _mockStore = store
      shallowMount(KeyboardShortcuts, mountOpts())
      const fgSpy = vi.spyOn(store, 'changeIsUpdatingFg')
      const bgSpy = vi.spyOn(store, 'changeIsUpdatingBg')
      const charSpy = vi.spyOn(store, 'changeIsUpdatingChar')
      const handler = getHandler('editor:Escape')
      const event = createEvent({})
      handler!(event, {})
      expect(fgSpy).toHaveBeenCalledWith(false)
      expect(bgSpy).toHaveBeenCalledWith(false)
      expect(charSpy).toHaveBeenCalledWith(false)
    })

  it('escape handler resets tool to default when non-default tool', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ currentTool: 2 }),
    })
    _mockStore = store
    shallowMount(KeyboardShortcuts, mountOpts())
    const spy = vi.spyOn(store, 'changeTool')
    const handler = getHandler('editor:Escape')
    const event = createEvent({})
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('isDefault returns true when currentTool is 0', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.isDefault).toBe(true)
  })

  it('haveOpenTabs returns true when currentAscii exists', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.haveOpenTabs).toBe(true)
  })

  it('haveOpenTabs returns false when no currentAscii', () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.haveOpenTabs).toBe(false)
  })

  it('disableKeyboard is true when isInputtingBrushSize', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts({
      props: {
        selectedBlocks: [],
        textEditing: false,
        selecting: {
          startX: -1, startY: -1, endX: -1, endY: -1,
        },
        isInputtingBrushSize: true,
        showingPostUrl: false,
        isShowingDialog: false,
        canvasX: 0,
        canvasY: 0,
      },
    }))
    expect(wrapper.vm.disableKeyboard).toBe(true)
  })
})
