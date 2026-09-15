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
  createMockDesktopStore,
  createMockPanelStore,
  createToolbarState,
  globalStubs,
  type TestWrapper,
} from './helpers'

let _mockStore: any = null
let _mockModalStore: any = null
let _mockToolbarStore: any = null
let _mockDesktopStore: any = null
let _mockPanelStore: any = null

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
vi.mock('@/store/desktop', () => ({
  useDesktopStore: () => _mockDesktopStore,
}))
vi.mock('@/store/panels', () => ({
  usePanelStore: () => _mockPanelStore,
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
  _mockDesktopStore = createMockDesktopStore()
  _mockPanelStore = createMockPanelStore()
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

  it('tool shortcuts suppressed when text tool is active (#37)', async () => {
    // Regression test for #37: keyboard shortcuts fire while typing in text mode.
    // Text tool is tool index 2 (toolbarIcons[2].name === 'text').
    // All single-key shortcuts (b, e, f, s, t, g) should be suppressed so
    // the character is typed onto the canvas instead.
    store = createMockStore({
      toolbarState: createToolbarState({ currentTool: 2 }),
    })
    _mockStore = store
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 2 },
    })
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'changeTool')
    // Test all tool shortcuts — none should fire
    for (const key of ['b', 'e', 'f', 's', 't', 'g']) {
      const handler = getHandler(`editor:${key}`)!
      handler(createEvent({ key }), {})
    }
    expect(spy).not.toHaveBeenCalled()
  })

  it('all handlers call preventDefault', async () => {
    await initShortcuts()
    const event = createEvent()
    const handler = getHandler('all:ctrl+z')!
    handler(event, {})
    expect(event.preventDefault).toHaveBeenCalled()
  })

  // ─── Export shortcuts (legacy restore) ─────────────────────────

  it('registers export shortcuts in scope all', async () => {
    await initShortcuts()
    expect(getHandler('all:ctrl+shift+c')).toBeDefined()
    expect(getHandler('all:ctrl+shift+f')).toBeDefined()
    expect(getHandler('all:ctrl+shift+g')).toBeDefined()
  })

  it('ctrl+shift+c dispatches export-clipboard event', async () => {
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+shift+c')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).toContain('asciibird:export-clipboard')
    dispatchSpy.mockRestore()
  })

  it('ctrl+shift+f dispatches export-file event', async () => {
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+shift+f')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).toContain('asciibird:export-file')
    dispatchSpy.mockRestore()
  })

  it('ctrl+shift+g dispatches export-png event', async () => {
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+shift+g')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).toContain('asciibird:export-png')
    dispatchSpy.mockRestore()
  })

  it('export shortcuts no-op with zero tabs open', async () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    for (const key of ['all:ctrl+shift+c', 'all:ctrl+shift+f', 'all:ctrl+shift+g']) {
      getHandler(key)!(createEvent(), {})
    }
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).not.toContain('asciibird:export-clipboard')
    expect(types).not.toContain('asciibird:export-file')
    expect(types).not.toContain('asciibird:export-png')
    dispatchSpy.mockRestore()
  })

  it('export shortcuts no-op while a modal is open', async () => {
    _mockModalStore = createMockModalStore({
      modalState: { newAscii: true },
    })
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    for (const key of ['all:ctrl+shift+c', 'all:ctrl+shift+f', 'all:ctrl+shift+g']) {
      getHandler(key)!(createEvent(), {})
    }
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).not.toContain('asciibird:export-clipboard')
    expect(types).not.toContain('asciibird:export-file')
    expect(types).not.toContain('asciibird:export-png')
    dispatchSpy.mockRestore()
  })

  // ─── Shortcut registry integrity ───────────────────────────────

  it('SHORTCUTS registry has unique, non-empty keys and labels', async () => {
    const { SHORTCUTS: S } = await import('@/utils/shortcuts')
    const entries = Object.values(S)
    expect(entries.length).toBeGreaterThan(0)
    const keySet = new Set<string>()
    const labelSet = new Set<string>()
    for (const def of entries) {
      expect(def.keys.length).toBeGreaterThan(0)
      expect(def.label.length).toBeGreaterThan(0)
      keySet.add(def.keys)
      labelSet.add(def.label)
    }
    // No duplicate combos or labels (would silently shadow in hotkeys-js)
    expect(keySet.size).toBe(entries.length)
    expect(labelSet.size).toBe(entries.length)
  })

  it('registered hotkey combos match the registry for wired shortcuts', async () => {
    const { SHORTCUTS: S } = await import('@/utils/shortcuts')
    await initShortcuts()
    for (const id of ['exportClipboard', 'exportFile', 'exportPng'] as const) {
      expect(getHandler(`all:${S[id].keys}`)).toBeDefined()
    }
  })

  // ─── Tab shortcuts (legacy restore) ────────────────────────────

  it('registers ctrl+r and ctrl+shift+0..9 tab shortcuts in scope all', async () => {
    await initShortcuts()
    expect(getHandler('all:ctrl+r')).toBeDefined()
    for (let i = 0; i <= 9; i++) {
      expect(getHandler(`all:ctrl+shift+${i}`)).toBeDefined()
    }
  })

  it('ctrl+r dispatches close-tab event', async () => {
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+r')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).toContain('asciibird:close-tab')
    dispatchSpy.mockRestore()
  })

  it('ctrl+r no-ops with zero tabs or while modal open', async () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+r')!(createEvent(), {})
    let types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).not.toContain('asciibird:close-tab')

    // Re-init with a modal open (clear stale handlers first —
    // getHandler returns the first captured handler per combo)
    gsHandlers.clear()
    _mockModalStore = createMockModalStore({ modalState: { options: true } })
    store = createMockStore()
    _mockStore = store
    await initShortcuts()
    getHandler('all:ctrl+r')!(createEvent(), {})
    types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).not.toContain('asciibird:close-tab')
    dispatchSpy.mockRestore()
  })

  it('ctrl+r no-ops while keyboard disabled (dialog open)', async () => {
    _mockModalStore = createMockModalStore({ isKeyboardDisabled: true })
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+r')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).not.toContain('asciibird:close-tab')
    dispatchSpy.mockRestore()
  })

  it('ctrl+shift+N switches to tab N (0-based, legacy parity)', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'changeTab')
    getHandler('all:ctrl+shift+0')!(createEvent(), {})
    getHandler('all:ctrl+shift+3')!(createEvent(), {})
    getHandler('all:ctrl+shift+9')!(createEvent(), {})
    // Mock store has 1 tab (index 0) — only ctrl+shift+0 fires changeTab
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('ctrl+shift+N no-ops when tab does not exist or modal open', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'changeTab')
    getHandler('all:ctrl+shift+5')!(createEvent(), {})
    expect(spy).not.toHaveBeenCalled()

    // Re-init with a modal open (clear stale handlers first —
    // getHandler returns the first captured handler per combo)
    gsHandlers.clear()
    _mockModalStore = createMockModalStore({ modalState: { help: true } })
    await initShortcuts()
    getHandler('all:ctrl+shift+0')!(createEvent(), {})
    expect(spy).not.toHaveBeenCalled()
  })

  // ─── Panel visibility shortcuts (legacy restore) ───────────────

  it('registers all panel visibility shortcuts in scope all', async () => {
    await initShortcuts()
    for (const combo of [
      'ctrl+alt+t', 'ctrl+alt+m', 'ctrl+alt+d', 'ctrl+alt+b',
      'ctrl+alt+l', 'ctrl+alt+n', 'ctrl+alt+e',
    ]) {
      expect(getHandler(`all:${combo}`)).toBeDefined()
    }
  })

  it('ctrl+alt+t toggles tabs visibility', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockDesktopStore, 'changeTabsVisible')
    getHandler('all:ctrl+alt+t')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(false) // default visible: true
  })

  it('ctrl+alt+m toggles menu bar visibility', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockDesktopStore, 'changeMenuBarVisible')
    getHandler('all:ctrl+alt+m')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(false)
  })

  it('ctrl+alt+d toggles debug panel', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockPanelStore, 'toggleDebugPanel')
    getHandler('all:ctrl+alt+d')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(true) // mock default visible: false
  })

  it('ctrl+alt+b toggles brush library', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockPanelStore, 'toggleBrushLibrary')
    getHandler('all:ctrl+alt+b')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(false) // mock default visible: true
  })

  it('ctrl+alt+l toggles layers with full panel state preserved', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockPanelStore, 'changeLayersLibraryState')
    getHandler('all:ctrl+alt+l')!(createEvent(), {})
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = spy.mock.calls[0][0] as Record<string, number | boolean>
    expect(arg.visible).toBe(false) // inverted from true
    // Position fields preserved — not a bare boolean
    expect(arg.x).toBe(300)
    expect(arg.w).toBe(350)
  })

  it('ctrl+alt+e toggles brush preview with full panel state preserved', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockPanelStore, 'changeBrushPreviewState')
    getHandler('all:ctrl+alt+e')!(createEvent(), {})
    const arg = spy.mock.calls[0][0] as Record<string, number | boolean>
    expect(arg.visible).toBe(false)
    expect(arg.x).toBe(50)
  })

  it('ctrl+alt+n toggles toolbar with full panel state preserved', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'changeToolBarState')
    getHandler('all:ctrl+alt+n')!(createEvent(), {})
    const arg = spy.mock.calls[0][0] as Record<string, number | boolean>
    expect(arg.visible).toBe(false) // toolbarState default visible: true
    expect(typeof arg.x).toBe('number')
    expect(typeof arg.h).toBe('number')
  })

  it('panel visibility shortcuts no-op with zero tabs or modal open', async () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    await initShortcuts()
    const deskSpy = vi.spyOn(_mockDesktopStore, 'changeTabsVisible')
    getHandler('all:ctrl+alt+t')!(createEvent(), {})
    expect(deskSpy).not.toHaveBeenCalled()

    gsHandlers.clear()
    _mockModalStore = createMockModalStore({ modalState: { options: true } })
    store = createMockStore()
    _mockStore = store
    await initShortcuts()
    const panelSpy = vi.spyOn(_mockPanelStore, 'toggleDebugPanel')
    getHandler('all:ctrl+alt+d')!(createEvent(), {})
    expect(panelSpy).not.toHaveBeenCalled()
  })

  it('panel visibility shortcuts no-op while keyboard disabled (dialog open)', async () => {
    _mockModalStore = createMockModalStore({ isKeyboardDisabled: true })
    await initShortcuts()
    const deskSpy = vi.spyOn(_mockDesktopStore, 'changeTabsVisible')
    getHandler('all:ctrl+alt+t')!(createEvent(), {})
    expect(deskSpy).not.toHaveBeenCalled()
  })

  // ─── Brush, mirror & colour shortcuts (legacy restore) ─────────

  it('registers brush/mirror/colour shortcuts in scope all', async () => {
    await initShortcuts()
    for (const combo of [
      'alt+x', 'alt+y', 'alt+u', 'ctrl+]', 'ctrl+[',
      'alt+r', 'alt+f', 'alt+b', 'alt+c', 'ctrl+b',
    ]) {
      expect(getHandler(`all:${combo}`)).toBeDefined()
    }
  })

  it('alt+x inverts only mirrorX axis', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    getHandler('all:alt+x')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith({ x: true, y: false })
  })

  it('alt+y inverts only mirrorY axis', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    getHandler('all:alt+y')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith({ x: false, y: true })
  })

  it('alt+y keeps mirrorX true when already enabled', async () => {
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { mirrorX: true, mirrorY: true },
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    getHandler('all:alt+y')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith({ x: true, y: false })
  })

  it('alt+u toggles updateBrush', async () => {
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'toggleUpdateBrush')
    getHandler('all:alt+u')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(false) // default: true
  })

  it('ctrl+] increases brush size when brush tool active', async () => {
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 4 }, // brush
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
    getHandler('all:ctrl+]')!(createEvent(), {})
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = spy.mock.calls[0][0] as Record<string, unknown>
    expect(arg.brushSizeHeight).toBe(2)
    expect(arg.brushSizeWidth).toBe(2)
    expect(arg.brushSizeType).toBeDefined()
  })

  it('ctrl+[ decreases brush size clamped at 1', async () => {
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 4 }, // brush
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
    getHandler('all:ctrl+[')!(createEvent(), {})
    const arg = spy.mock.calls[0][0] as Record<string, unknown>
    expect(arg.brushSizeHeight).toBe(1) // max(1, 1-1)
    expect(arg.brushSizeWidth).toBe(1)
  })

  it('brush size shortcuts no-op when tool is not brush/eraser', async () => {
    // Default tool 0 = 'default'
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 0 },
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
    getHandler('all:ctrl+]')!(createEvent(), {})
    getHandler('all:ctrl+[')!(createEvent(), {})
    expect(spy).not.toHaveBeenCalled()
  })

  it('ctrl+] also works for eraser tool', async () => {
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: { currentTool: 6 }, // eraser
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
    getHandler('all:ctrl+]')!(createEvent(), {})
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('ctrl+] clamps at maxBrushSize (50)', async () => {
    _mockToolbarStore = createMockToolbarStore({
      toolbarState: {
        currentTool: 4,
        brushSizeWidth: 50,
        brushSizeHeight: 50,
        brushSizeType: 'circle',
      },
    })
    gsHandlers.clear()
    await initShortcuts()
    const spy = vi.spyOn(_mockToolbarStore, 'updateBrushSize')
    getHandler('all:ctrl+]')!(createEvent(), {})
    const arg = spy.mock.calls[0][0] as Record<string, unknown>
    expect(arg.brushSizeHeight).toBe(50)
    expect(arg.brushSizeWidth).toBe(50)
    expect(arg.brushSizeType).toBe('circle')
  })

  it('brush/mirror/colour shortcuts no-op with zero tabs or modal open', async () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    await initShortcuts()
    const mirrorSpy = vi.spyOn(_mockToolbarStore, 'updateMirror')
    getHandler('all:alt+x')!(createEvent(), {})
    expect(mirrorSpy).not.toHaveBeenCalled()

    gsHandlers.clear()
    _mockModalStore = createMockModalStore({ modalState: { help: true } })
    store = createMockStore()
    _mockStore = store
    await initShortcuts()
    const swapSpy = vi.spyOn(_mockToolbarStore, 'changeColourFg')
    getHandler('all:alt+r')!(createEvent(), {})
    expect(swapSpy).not.toHaveBeenCalled()
  })

  it('alt+r swaps FG and BG without aliasing', async () => {
    await initShortcuts()
    const fgSpy = vi.spyOn(_mockToolbarStore, 'changeColourFg')
    const bgSpy = vi.spyOn(_mockToolbarStore, 'changeColourBg')
    getHandler('all:alt+r')!(createEvent(), {})
    // Default fg=0, bg=1 → fg becomes 1, bg becomes 0
    expect(fgSpy).toHaveBeenCalledWith(1)
    expect(bgSpy).toHaveBeenCalledWith(0)
  })

  it('alt+f/b/c toggle pickers', async () => {
    await initShortcuts()
    const fgSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingFg')
    const bgSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingBg')
    const charSpy = vi.spyOn(_mockToolbarStore, 'changeIsUpdatingChar')
    getHandler('all:alt+f')!(createEvent(), {})
    getHandler('all:alt+b')!(createEvent(), {})
    getHandler('all:alt+c')!(createEvent(), {})
    expect(fgSpy).toHaveBeenCalledWith(true) // default isChoosingFg: false
    expect(bgSpy).toHaveBeenCalledWith(true)
    expect(charSpy).toHaveBeenCalledWith(true)
  })

  it('ctrl+b dispatches save-brush-library event', async () => {
    await initShortcuts()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    getHandler('all:ctrl+b')!(createEvent(), {})
    const types = dispatchSpy.mock.calls.map(c => (c[0] as CustomEvent).type)
    expect(types).toContain('asciibird:save-brush-library')
    dispatchSpy.mockRestore()
  })

  // ─── Layer shortcuts (legacy restore, browser-reserved remaps) ─

  it('registers layer shortcuts in scope all', async () => {
    await initShortcuts()
    expect(getHandler('all:alt+v')).toBeDefined()
    expect(getHandler('all:ctrl+shift+a')).toBeDefined()
    expect(getHandler('all:ctrl+shift+s')).toBeDefined()
    expect(getHandler('all:ctrl+shift+up')).toBeDefined()
  })

  it('alt+v toggles the selected layer visibility', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'toggleLayer')
    getHandler('all:alt+v')!(createEvent(), {})
    expect(spy).toHaveBeenCalledWith(0) // selectedLayer default
  })

  it('ctrl+shift+a adds a layer', async () => {
    await initShortcuts()
    const spy = vi.spyOn(store, 'addLayer')
    getHandler('all:ctrl+shift+a')!(createEvent(), {})
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('ctrl+shift+s moves layer down via upLayer (legacy naming)', async () => {
    await initShortcuts()
    const upSpy = vi.spyOn(store, 'upLayer')
    const downSpy = vi.spyOn(store, 'downLayer')
    getHandler('all:ctrl+shift+s')!(createEvent(), {})
    expect(upSpy).toHaveBeenCalledWith(0)
    expect(downSpy).not.toHaveBeenCalled()
  })

  it('ctrl+shift+up moves layer up via downLayer (legacy naming)', async () => {
    await initShortcuts()
    const upSpy = vi.spyOn(store, 'upLayer')
    const downSpy = vi.spyOn(store, 'downLayer')
    getHandler('all:ctrl+shift+up')!(createEvent(), {})
    expect(downSpy).toHaveBeenCalledWith(0)
    expect(upSpy).not.toHaveBeenCalled()
  })

  it('layer shortcuts act on the current selectedLayer (dynamic read)', async () => {
    store = createMockStore()
    store.asciibirdMeta[0].selectedLayer = 2
    _mockStore = store
    await initShortcuts()
    const toggleSpy = vi.spyOn(store, 'toggleLayer')
    const upSpy = vi.spyOn(store, 'upLayer')
    const downSpy = vi.spyOn(store, 'downLayer')
    getHandler('all:alt+v')!(createEvent(), {})
    getHandler('all:ctrl+shift+s')!(createEvent(), {})
    getHandler('all:ctrl+shift+up')!(createEvent(), {})
    expect(toggleSpy).toHaveBeenCalledWith(2)
    expect(upSpy).toHaveBeenCalledWith(2)
    expect(downSpy).toHaveBeenCalledWith(2)
  })

  it('layer shortcuts no-op with zero tabs or modal open', async () => {
    store = createMockStore({ asciibirdMeta: [] })
    _mockStore = store
    await initShortcuts()
    const addSpy = vi.spyOn(store, 'addLayer')
    const upSpy = vi.spyOn(store, 'upLayer')
    getHandler('all:ctrl+shift+a')!(createEvent(), {})
    getHandler('all:ctrl+shift+s')!(createEvent(), {})
    expect(addSpy).not.toHaveBeenCalled()
    expect(upSpy).not.toHaveBeenCalled()

    gsHandlers.clear()
    _mockModalStore = createMockModalStore({ modalState: { help: true } })
    store = createMockStore()
    _mockStore = store
    await initShortcuts()
    const toggleSpy = vi.spyOn(store, 'toggleLayer')
    const downSpy = vi.spyOn(store, 'downLayer')
    getHandler('all:alt+v')!(createEvent(), {})
    getHandler('all:ctrl+shift+up')!(createEvent(), {})
    expect(toggleSpy).not.toHaveBeenCalled()
    expect(downSpy).not.toHaveBeenCalled()
  })
})
