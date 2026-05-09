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
import KeyboardShortcuts from '@/components/parts/KeyboardShortcuts.vue'
import {
  createMockStore,
  createMountOptions,
  createToolbarState,
  setupHotkeysMocks,
} from './helpers'

const localVue = createLocalVue()
Vue.use(Vuex)

let store: any
let hotkeysResult: ReturnType<typeof setupHotkeysMocks>

function mountOpts(extra: any = {}) {
  return createMountOptions(store, {
    localVue,
    propsData: {
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
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  hotkeysResult = setupHotkeysMocks()
  store = createMockStore()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function getHandler(key: string) {
  const handlers = hotkeysResult.capturedHandlers.get(key)
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

// ─── KeyboardShortcuts.vue ───────────────────────────────────────

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
    expect(hotkeysResult.hotkeysFn.setScope).toHaveBeenCalledWith(
      'editor',
    )
  })

  it('sets scope to modals when disableKeyboard is true', () => {
    store = createMockStore({ isKeyboardDisabled: true })
    shallowMount(KeyboardShortcuts, mountOpts())
    expect(hotkeysResult.hotkeysFn.setScope).toHaveBeenCalledWith(
      'modals',
    )
  })

  it('watch disableKeyboard calls hotkeys.setScope', async () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    store.state.isKeyboardDisabled = true
    await wrapper.vm.$nextTick()
    expect(hotkeysResult.hotkeysFn.setScope).toHaveBeenLastCalledWith(
      'modals',
    )
  })

  it('wildcard handler commits changeChar for single char when isChoosingChar',
    () => {
      store = createMockStore({
        toolbarState: createToolbarState({
          isChoosingChar: true,
          persistCharPanel: false,
        }),
      })
      shallowMount(KeyboardShortcuts, mountOpts())
      const commitSpy = vi.spyOn(store, 'commit')
      const handler = getHandler('editor:*')
      const event = createEvent({ key: 'a' })
      handler!(event, {})
      expect(commitSpy).toHaveBeenCalledWith('changeChar', 'a')
    })

  it('wildcard handler commits changeTool for alt+number', () => {
    shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '3', altKey: true })
    handler!(event, {})
    expect(commitSpy).toHaveBeenCalledWith('changeTool', 2)
  })

  it('wildcard handler emits updatecanvas for alt+number', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '5', altKey: true })
    handler!(event, {})
    expect(wrapper.emitted('updatecanvas')).toBeTruthy()
  })

  it('wildcard handler commits changeColourFg when isChoosingFg', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ isChoosingFg: true }),
    })
    shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '5' })
    handler!(event, {})
    expect(commitSpy).toHaveBeenCalledWith('changeColourFg', 5)
  })

  it('wildcard handler commits changeColourBg when isChoosingBg', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ isChoosingBg: true }),
    })
    shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    const handler = getHandler('editor:*')
    const event = createEvent({ key: '7' })
    handler!(event, {})
    expect(commitSpy).toHaveBeenCalledWith('changeColourBg', 7)
  })

  it('escape handler commits changeIsUpdatingFg/Bg/Char when choosing',
    () => {
      store = createMockStore({
        toolbarState: createToolbarState({ isChoosingChar: true }),
      })
      shallowMount(KeyboardShortcuts, mountOpts())
      const commitSpy = vi.spyOn(store, 'commit')
      const handler = getHandler('editor:Escape')
      const event = createEvent({})
      handler!(event, {})
      expect(commitSpy).toHaveBeenCalledWith('changeIsUpdatingFg', false)
      expect(commitSpy).toHaveBeenCalledWith('changeIsUpdatingBg', false)
      expect(commitSpy).toHaveBeenCalledWith(
        'changeIsUpdatingChar', false,
      )
    })

  it('escape handler resets tool to default when non-default tool', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ currentTool: 2 }),
    })
    shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    const handler = getHandler('editor:Escape')
    const event = createEvent({})
    handler!(event, {})
    expect(commitSpy).toHaveBeenCalledWith('changeTool', 0)
  })

  it('undo commits undoBlocks', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.undo()
    expect(commitSpy).toHaveBeenCalledWith('undoBlocks')
  })

  it('redo commits redoBlocks', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    const commitSpy = vi.spyOn(store, 'commit')
    wrapper.vm.redo()
    expect(commitSpy).toHaveBeenCalledWith('redoBlocks')
  })

  it('isDefault returns true when currentTool is 0', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.isDefault).toBe(true)
  })

  it('isTextEditing returns true when currentTool is text', () => {
    store = createMockStore({
      toolbarState: createToolbarState({ currentTool: 2 }),
    })
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.isTextEditing).toBe(true)
  })

  it('haveOpenTabs returns true when currentAscii exists', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.haveOpenTabs).toBe(true)
  })

  it('haveOpenTabs returns false when no currentAscii', () => {
    store = createMockStore({ asciibirdMeta: [] })
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts())
    expect(wrapper.vm.haveOpenTabs).toBe(false)
  })

  it('canvasXy returns prop coordinates', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts({
      propsData: {
        selectedBlocks: [],
        textEditing: false,
        selecting: {
          startX: -1, startY: -1, endX: -1, endY: -1,
        },
        isInputtingBrushSize: false,
        showingPostUrl: false,
        isShowingDialog: false,
        canvasX: 100,
        canvasY: 200,
      },
    }))
    expect(wrapper.vm.canvasXy).toEqual({ x: 100, y: 200 })
  })

  it('disableKeyboard is true when isInputtingBrushSize', () => {
    const wrapper = shallowMount(KeyboardShortcuts, mountOpts({
      propsData: {
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
