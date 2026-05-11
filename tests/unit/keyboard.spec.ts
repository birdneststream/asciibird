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
import KeyboardShortcuts from '@/components/parts/KeyboardShortcuts.vue'
import hotkeys from 'hotkeys-js'
import {
  createMockStore,
  createMockModalStore,
  createMockToolbarStore,
  createToolbarState,
  globalStubs,
  type TestWrapper,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null
let _mockToolbarStore: any = null

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
  }) as any
  fn.filter = vi.fn(() => true)
  fn.setScope = vi.fn()
  fn.deleteScope = vi.fn()
  fn.unbind = vi.fn()
  return { default: fn, __esModule: true }
})

vi.mock('@/store', () => ({
  useAsciiBirdStore: () => _mockStore,
}))
vi.mock('@/store/modal', () => ({
  useModalStore: () => _mockModalStore,
}))
vi.mock('@/store/toolbar', () => ({
  useToolbarStore: () => _mockToolbarStore,
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

function stw(opts: any): TestWrapper {
  return shallowMount(KeyboardShortcuts, opts) as TestWrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  capturedHandlers.clear()
  store = createMockStore()
  _mockStore = store
  _mockModalStore = createMockModalStore()
  _mockToolbarStore = createMockToolbarStore()
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
    const wrapper = stw(mountOpts())
    expect(wrapper.findComponent(KeyboardShortcuts).exists()).toBe(true)
  })

  it('registers wildcard handler in editor scope on created', () => {
    stw(mountOpts())
    const handler = getHandler('editor:*')
    expect(handler).toBeDefined()
  })

  it('registers escape handler in editor scope on created', () => {
    stw(mountOpts())
    const handler = getHandler('editor:Escape')
    expect(handler).toBeDefined()
  })

  it('sets scope to editor when disableKeyboard is false', () => {
    stw(mountOpts())
    expect((hotkeys as any).setScope).toHaveBeenCalledWith(
      'editor',
    )
  })

  it('sets scope to modals when disableKeyboard is true', () => {
    _mockModalStore = createMockModalStore({ isKeyboardDisabled: true })
    stw(mountOpts())
    expect((hotkeys as any).setScope).toHaveBeenCalledWith(
      'modals',
    )
  })

  it('disableKeyboard computed reads from store', () => {
    _mockModalStore = createMockModalStore({ isKeyboardDisabled: true })
    stw(mountOpts())
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
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { isChoosingChar: true, persistCharPanel: false },
      })
      stw(mountOpts())
      const spy = vi.spyOn(_mockToolbarStore, 'changeChar')
      const handler = getHandler('editor:*')
      const event = createEvent({ key: 'a' })
      handler!(event, {})
      expect(spy).toHaveBeenCalledWith('a')
    })

  it('wildcard handler calls changeTool for alt+number', () => {
    stw(mountOpts())
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '3', altKey: true })
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('wildcard handler emits updatecanvas for alt+number', () => {
    const wrapper = stw(mountOpts())
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
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingFg: true },
    })
    stw(mountOpts())
    const spy = vi.spyOn(_mockToolbarStore, 'changeColourFg')
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
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingBg: true },
    })
    stw(mountOpts())
    const spy = vi.spyOn(_mockToolbarStore, 'changeColourBg')
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
      _mockToolbarStore = createMockToolbarStore({
        toolbarState: { isChoosingChar: true },
      })
      stw(mountOpts())
      const fgSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingFg')
      const bgSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingBg')
      const charSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingChar')
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
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 2 },
    })
    stw(mountOpts())
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const handler = getHandler('editor:Escape')
    const event = createEvent({})
    handler!(event, {})
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('isDefault returns true when currentTool is 0', () => {
    const wrapper = stw(mountOpts())
    expect(wrapper.vm.isDefault).toBe(true)
  })

  it('haveOpenTabs returns true when currentAscii exists', () => {
    const wrapper = stw(mountOpts())
    expect(wrapper.vm.haveOpenTabs).toBe(true)
  })

  it('haveOpenTabs returns false when no currentAscii', () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    const wrapper = stw(mountOpts())
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

  it('wildcard handler does not preventDefault for unhandled keys', () => {
    stw(mountOpts())
    const handler = getHandler('editor:*')
    const event = createEvent({ key: 'z', ctrlKey: true })
    handler!(event, {})
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('wildcard handler calls preventDefault for handled keys', () => {
    store = createMockStore({
      toolbarState: createToolbarState({
        isChoosingChar: true,
        persistCharPanel: false,
      }),
    })
    _mockStore = store
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingChar: true, persistCharPanel: false },
    })
    stw(mountOpts())
    const handler = getHandler('editor:*')
    const event = createEvent({ key: 'a' })
    handler!(event, {})
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('cleanup uses unbind instead of deleteScope on unmount', () => {
    const wrapper = stw(mountOpts())
    wrapper.unmount()
    expect((hotkeys as any).unbind).toHaveBeenCalledWith('*', 'editor')
    expect((hotkeys as any).unbind).toHaveBeenCalledWith('Escape', 'editor')
    expect((hotkeys as any).deleteScope).not.toHaveBeenCalled()
  })
})

// ─── useGlobalShortcuts ─────────────────────────────────────────────

describe('useGlobalShortcuts', () => {
  // Separate captured handlers for global shortcuts tests
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const gsHandlers = new Map<string, Function[]>()

  let gsHotkeys: any

  beforeEach(async () => {
    vi.resetModules()
    gsHandlers.clear()
    store = createMockStore()
    _mockStore = store

    // Set up fresh mock for this test suite
    gsHotkeys = vi.fn((keys: any, scope: any, handler: any) => {
      if (typeof scope === 'function') {
        handler = scope
        scope = '*'
      }
      const key = `${scope}:${keys}`
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      if (!gsHandlers.has(key)) gsHandlers.set(key, [])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      gsHandlers.get(key)!.push(handler)
    })
    gsHotkeys.filter = vi.fn(() => true)
    gsHotkeys.setScope = vi.fn()
    gsHotkeys.deleteScope = vi.fn()
    gsHotkeys.unbind = vi.fn()

    vi.doMock('hotkeys-js', () => ({
      default: gsHotkeys,
      __esModule: true,
    }))
    vi.doMock('@/store', () => ({
      useAsciiBirdStore: () => _mockStore,
    }))
    vi.doMock('@/store/toolbar', () => ({
      useToolbarStore: () => _mockToolbarStore,
    }))
    _mockToolbarStore = createMockToolbarStore()
  })

  function getHandler(key: string) {
    return gsHandlers.get(key)?.[0]
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

  async function initShortcuts() {
    const mod = await import('@/composables/useGlobalShortcuts')
    mod.useGlobalShortcuts()
  }

  it('registers menu shortcuts in scope all', async () => {
    await initShortcuts()
    expect(getHandler('all:ctrl+z')).toBeDefined()
    expect(getHandler('all:ctrl+y')).toBeDefined()
    expect(getHandler('all:ctrl+shift+z')).toBeDefined()
    expect(getHandler('all:cmd+z')).toBeDefined()
    expect(getHandler('all:cmd+shift+z')).toBeDefined()
    expect(getHandler('all:cmd+y')).toBeDefined()
    expect(getHandler('all:ctrl+m')).toBeDefined()
    expect(getHandler('all:f1')).toBeDefined()
    expect(getHandler('all:shift+f1')).toBeDefined()
    expect(getHandler('all:ctrl+o')).toBeDefined()
    expect(getHandler('all:ctrl+shift+o')).toBeDefined()
    expect(getHandler('all:ctrl+shift+v')).toBeDefined()
    expect(getHandler('all:ctrl+e')).toBeDefined()
    expect(getHandler('all:alt+g')).toBeDefined()
  })

  it('registers tool shortcuts in scope editor', async () => {
    await initShortcuts()
    expect(getHandler('editor:b')).toBeDefined()
    expect(getHandler('editor:e')).toBeDefined()
    expect(getHandler('editor:f')).toBeDefined()
    expect(getHandler('editor:s')).toBeDefined()
    expect(getHandler('editor:t')).toBeDefined()
    expect(getHandler('editor:g')).toBeDefined()
  })

  it('ctrl+z calls undoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'undoBlocks')
    const handler = getHandler('all:ctrl+z')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('ctrl+y calls redoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'redoBlocks')
    const handler = getHandler('all:ctrl+y')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('ctrl+shift+z calls redoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'redoBlocks')
    const handler = getHandler('all:ctrl+shift+z')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('cmd+z calls undoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'undoBlocks')
    const handler = getHandler('all:cmd+z')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('cmd+shift+z calls redoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'redoBlocks')
    const handler = getHandler('all:cmd+shift+z')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('cmd+y calls redoBlocks', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'redoBlocks')
    const handler = getHandler('all:cmd+y')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalled()
  })

  it('ctrl+m opens new-ascii modal', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockModalStore, 'openModal')
    const handler = getHandler('all:ctrl+m')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalledWith('new-ascii')
  })

  it('f1 opens help modal', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockModalStore, 'openModal')
    const handler = getHandler('all:f1')!
    handler(createEvent({ shiftKey: false }), {})
    expect(spy).toHaveBeenCalledWith('help')
  })

  it('shift+f1 opens about modal', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockModalStore, 'openModal')
    const handler = getHandler('all:shift+f1')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalledWith('about')
  })

  it('tool shortcut b switches to brush (tool 4)', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const handler = getHandler('editor:b')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(4)
  })

  it('tool shortcut e switches to eraser (tool 6)', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const handler = getHandler('editor:e')!
    handler(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(6)
  })

  it('tool shortcuts suppressed when isChoosingChar', async () => {
    store = createMockStore({
      toolbarState: createToolbarState({ isChoosingChar: true }),
    })
    _mockStore = store
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { isChoosingChar: true },
    })
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    const handler = getHandler('editor:b')!
    handler(createEvent(), {})
    expect(spy).not.toHaveBeenCalled()
  })

  it('all handlers call preventDefault', async () => {
    await initShortcuts()
    const event = createEvent()
    const handler = getHandler('all:ctrl+z')!
    handler(event, {})
    expect(event.preventDefault).toHaveBeenCalled()
  })
})
