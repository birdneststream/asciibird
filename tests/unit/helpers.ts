// @vitest-environment jsdom
// Shared test utilities for ASCIIBIRD component tests.

import { vi } from 'vitest'
import Vuex from 'vuex'
import Vue from 'vue'
import LZString from 'lz-string'
import {
  create2DArray,
  emptyBlock,
  cyrb53,
} from '@/ascii'

Vue.use(Vuex)

// ─── Shared component stubs ──────────────────────────────────────

export const globalStubs = {
  't-button': {
    template:
      '<button class="t-button" @click="$emit(\'click\')"><slot /></button>',
  },
  't-card': {
    template: '<div class="t-card"><slot /></div>',
  },
  't-checkbox': {
    template:
      '<input type="checkbox" :checked="checked" @change="$emit(\'change\', $event)" />',
    props: ['checked'],
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
    template:
      '<textarea :value="value" @input="$emit(\'input\', $event.target.value)"><slot /></textarea>',
    props: ['value'],
  },
  't-dropdown': {
    template:
      '<div class="t-dropdown"><slot name="trigger" /><slot /></div>',
  },
  'vue-draggable-resizable': {
    template: '<div class="vdr"><slot /></div>',
  },
  'vue-slider': {
    template: '<input type="range" />',
  },
  'BrushCanvas': {
    template: '<div class="brush-canvas-stub"><slot /></div>',
  },
  'Layers': {
    template: '<div class="layers-stub"><slot /></div>',
  },
  'Colours': {
    template: '<div class="colours-stub"><slot /></div>',
  },
  't-radio': {
    template:
      '<input type="radio" :checked="value" @change="$emit(\'change\', $event)" />',
    props: ['value'],
  },
  'ContextMenu': {
    template: '<div class="context-menu-stub"><slot /></div>',
    methods: {
      open: vi.fn(),
      close: vi.fn(),
    },
  },
}

// ─── Shared mock instances ────────────────────────────────────────

export const modalMock = {
  show: vi.fn(),
  hide: vi.fn(),
}

export const toastedMock = {
  show: vi.fn(),
}

export const copyTextMock = vi.fn(() => Promise.resolve())

// ─── Global stubs for hotkeys ─────────────────────────────────────

export function setupHotkeysMocks() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const capturedHandlers = new Map<string, Function[]>()

  const hotkeysFn = vi.fn((keys: any, scope: any, handler: any) => {
    if (typeof scope === 'function') {
      handler = scope
      scope = '*'
    }
    const key = `${scope}:${keys}`
    if (!capturedHandlers.has(key)) {
      capturedHandlers.set(key, [])
    }
    capturedHandlers.get(key)!.push(handler)
  })

  hotkeysFn.filter = vi.fn(() => true)
  hotkeysFn.setScope = vi.fn()
  hotkeysFn.deleteScope = vi.fn()
  hotkeysFn.unbind = vi.fn()

  vi.stubGlobal('hotkeys', hotkeysFn)
  vi.stubGlobal('hotkeys/filter', hotkeysFn.filter)
  vi.stubGlobal('hotkeys/setScope', hotkeysFn.setScope)
  vi.stubGlobal('hotkeys/deleteScope', hotkeysFn.deleteScope)
  vi.stubGlobal('hotkeys/unbind', hotkeysFn.unbind)

  return { capturedHandlers, hotkeysFn }
}

// ─── Toolbar state factory ────────────────────────────────────────

export function createToolbarState(overrides: Record<string, any> = {}) {
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
    gridView: false,
    updateBrush: true,
    draggable: true,
    visible: true,
    x: 16,
    y: 30,
    h: 285,
    w: 200,
    ...overrides,
  }
}

// ─── Mock store factory ───────────────────────────────────────────

export interface MockStoreConfig {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  extraMutations?: Record<string, Function>
}

export function createMockStore(
  overrides: Record<string, any> = {},
  config: MockStoreConfig = {},
) {
  const defaultLayers = [{
    label: 'Test Layer',
    visible: true,
    width: 3,
    height: 3,
    data: create2DArray(3).map(row => {
      for (let x = 0; x < 3; x++) row.push({ ...emptyBlock })
      return row
    }),
  }]

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
    blockSizeMultiplier: 1,
    desktopState: {
      menuBarVisible: true,
      tabsVisible: true,
    },
    asciibirdMeta: [{
      title: 'Test ASCII',
      layers: LZString.compressToUTF16(JSON.stringify(defaultLayers)),
      selectedLayer: 0,
      imageOverlay: {
        url: null, opacity: 95, asciiOpacity: 100,
        left: 0, top: 0, position: 'centered',
        size: 100, repeatx: true, repeaty: true,
        visible: false, stretched: false,
      },
      history: [],
      historyIndex: 0,
      x: 247,
      y: 24,
    }],
    toolbarState: createToolbarState(),
    debugPanelState: {
      x: 10, y: 20, h: 30, w: 40, visible: true,
    },
    brushLibraryState: {
      x: 10, y: 40, h: 30, w: 40, visible: true, tab: 1,
    },
    layersLibraryState: {
      x: 10, y: 40, h: 30, w: 40, visible: true,
    },
    brushPreviewState: {
      x: 10, y: 40, h: 30, w: 40, visible: true,
    },
    debugPanel: false,
    brushHistory: [],
    brushLibrary: [],
    copiedBlocks: [],
    brushPreview: [],
    brushBlocks: LZString.compressToUTF16(JSON.stringify([])),
    selectBlocks: LZString.compressToUTF16(JSON.stringify([])),
    panelState: {
      toolbar: { x: 10, y: 40 },
      debugPanel: { x: 10, y: 40 },
      brushLibrary: { x: 10, y: 40 },
      layersLibrary: { x: 10, y: 40 },
      brushPreview: { x: 10, y: 40 },
    },
  }

  const state = { ...defaultState, ...overrides }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const defaultMutations: Record<string, Function> = {
    closeModal: (s: any, name: string) => {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) s.modalState[map[name]] = false
      s.isKeyboardDisabled = false
    },
    openModal: (s: any, name: string) => {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) s.modalState[map[name]] = true
      s.isKeyboardDisabled = true
    },
    changeTool: (s: any, idx: number) => {
      s.toolbarState.currentTool = idx
    },
    changeColourFg: (s: any, c: number) => {
      s.toolbarState.currentColourFg = c
    },
    changeColourBg: (s: any, c: number) => {
      s.toolbarState.currentColourBg = c
    },
    changeChar: (s: any, c: string) => {
      s.toolbarState.selectedChar = c
    },
    updateOptions: (s: any, opts: any) => {
      s.options = opts
    },
    updateMirror: (s: any, p: any) => {
      s.toolbarState.mirrorX = p.x
      s.toolbarState.mirrorY = p.y
    },
    toggleGridView: (s: any) => {
      s.toolbarState.gridView = !s.toolbarState.gridView
    },
    toggleHalfBlockEditing: (s: any, v: boolean) => {
      s.toolbarState.halfBlockEditing = v
    },
    toggleUpdateBrush: (s: any) => {
      s.toolbarState.updateBrush = !s.toolbarState.updateBrush
    },
    changeToolBarState: (s: any, p: any) => {
      Object.assign(s.toolbarState, p)
    },
    changeDebugPanelState: (s: any, p: any) => {
      Object.assign(s.debugPanelState, p)
    },
    changeBrushLibraryState: (s: any, p: any) => {
      Object.assign(s.brushLibraryState, p)
    },
    changeLayersLibraryState: (s: any, p: any) => {
      Object.assign(s.layersLibraryState, p)
    },
    changeAsciiWidthHeight: (s: any, p: any) => {
      const meta = s.asciibirdMeta[s.tab]
      if (meta) {
        meta.layers = LZString.compressToUTF16(
          JSON.stringify(p.layers),
        )
      }
    },
    updateAsciiTitle: (s: any, t: string) => {
      s.asciibirdMeta[s.tab].title = t
    },
    brushBlocks: (s: any, blocks: any) => {
      s.brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      )
    },
    pushBrushLibrary: (s: any, blocks: any) => {
      const hash = cyrb53(JSON.stringify(blocks))
      if (!s.brushLibrary.some((b: any) => b.hash === hash)) {
        s.brushLibrary.push({
          blocks: LZString.compressToUTF16(
            JSON.stringify(blocks),
          ),
          hash,
        })
      }
    },
    removeBrushLibrary: (s: any, blocks: any) => {
      const hash = cyrb53(JSON.stringify(blocks))
      s.brushLibrary = s.brushLibrary.filter(
        (b: any) => b.hash !== hash,
      )
    },
    removeBrushHistory: (s: any, blocks: any) => {
      const hash = cyrb53(JSON.stringify(blocks))
      s.brushHistory = s.brushHistory.filter(
        (b: any) => b.hash !== hash,
      )
    },
    upBrush: (s: any, key: number) => {
      if (key > 0) {
        const temp = s.brushLibrary[key]
        s.brushLibrary[key] = s.brushLibrary[key - 1]
        s.brushLibrary[key - 1] = temp
      }
    },
    downBrush: (s: any, key: number) => {
      if (key < s.brushLibrary.length - 1) {
        const temp = s.brushLibrary[key]
        s.brushLibrary[key] = s.brushLibrary[key + 1]
        s.brushLibrary[key + 1] = temp
      }
    },
    updateImageOverlay: (s: any, payload: any) => {
      const meta = s.asciibirdMeta[s.tab]
      if (meta) meta.imageOverlay = payload
    },
    changeLayer: (s: any, idx: number) => {
      const meta = s.asciibirdMeta[s.tab]
      if (meta) meta.selectedLayer = idx
    },
    toggleLayer: (s: any, idx: number) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (layers[idx]) layers[idx].visible = !layers[idx].visible
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
    },
    removeLayer: (s: any, idx: number) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      layers.splice(idx, 1)
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
      if (meta.selectedLayer >= layers.length) {
        meta.selectedLayer = layers.length - 1
      }
    },
    addLayer: (s: any) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      layers.push({
        label: `Layer ${layers.length + 1}`,
        visible: true,
        width: layers[0]?.width || 3,
        height: layers[0]?.height || 3,
        data: create2DArray(layers[0]?.height || 3).map(
          (row: any[]) => {
            for (let x = 0; x < (layers[0]?.width || 3); x++) {
              row.push({ ...emptyBlock })
            }
            return row
          },
        ),
      })
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
    },
    mergeAllLayers: () => {
      // Simplified mock — just keeps first layer
    },
    upLayer: (s: any, idx: number) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta || idx <= 0) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      const temp = layers[idx]
      layers[idx] = layers[idx - 1]
      layers[idx - 1] = temp
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
    },
    downLayer: (s: any, idx: number) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (idx >= layers.length - 1) return
      const temp = layers[idx]
      layers[idx] = layers[idx + 1]
      layers[idx + 1] = temp
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
    },
    updateLayerName: (s: any, payload: any) => {
      const meta = s.asciibirdMeta[s.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (layers[payload.key]) layers[payload.key].label = payload.label
      meta.layers = LZString.compressToUTF16(JSON.stringify(layers))
    },
    toggleDisableKeyboard: (s: any, val: boolean) => {
      s.isKeyboardDisabled = val
    },
    undoBlocks: () => {
      // Simplified mock for keyboard shortcut tests
    },
    redoBlocks: () => {
      // Simplified mock for keyboard shortcut tests
    },
    changeIsUpdatingFg: (s: any, val: boolean) => {
      s.toolbarState.isChoosingFg = val
    },
    changeIsUpdatingBg: (s: any, val: boolean) => {
      s.toolbarState.isChoosingBg = val
    },
    changeIsUpdatingChar: (s: any, val: boolean) => {
      s.toolbarState.isChoosingChar = val
    },
  }

  const mutations = {
    ...defaultMutations,
    ...(config.extraMutations || {}),
  }

  return new Vuex.Store({
    state,
    getters: {
      modalState: (s: any) => s.modalState,
      toolbarState: (s: any) => s.toolbarState,
      currentFg: (s: any) => s.toolbarState.currentColourFg,
      currentBg: (s: any) => s.toolbarState.currentColourBg,
      currentChar: (s: any) => s.toolbarState.selectedChar,
      currentTool: (s: any) => s.toolbarState.currentTool,
      asciibirdMeta: (s: any) => s.asciibirdMeta,
      options: (s: any) => s.options,
      tab: (s: any) => s.tab,
      brushHistory: (s: any) => s.brushHistory,
      brushLibrary: (s: any) => s.brushLibrary,
      blockSizeMultiplier: (s: any) => s.blockSizeMultiplier,
      persistCharPanel: (s: any) => s.toolbarState.persistCharPanel,
      isTargettingFg: (s: any) => s.toolbarState.targetingFg,
      isTargettingBg: (s: any) => s.toolbarState.targetingBg,
      isTargettingChar: (s: any) => s.toolbarState.targetingChar,
      brushLibraryState: (s: any) => s.brushLibraryState,
      layersLibraryState: (s: any) => s.layersLibraryState,
      brushPreviewState: (s: any) => s.brushPreviewState,
      isKeyboardDisabled: (s: any) => s.isKeyboardDisabled,
      isModalOpen: (s: any) =>
        Object.values(s.modalState).some((v: any) => v),
      currentAscii: (s: any) => s.asciibirdMeta[s.tab] || false,
      currentAsciiLayers: (s: any) => {
        const meta = s.asciibirdMeta[s.tab]
        if (!meta) return []
        return JSON.parse(
          LZString.decompressFromUTF16(meta.layers),
        )
      },
      selectedLayer: (s: any) =>
        s.asciibirdMeta[s.tab]?.selectedLayer ?? 0,
      debugPanel: (s: any) => s.debugPanelState,
      state: (s: any) => s,
      brushBlocks: (s: any) => JSON.parse(
        LZString.decompressFromUTF16(s.brushBlocks),
      ),
      imageOverlay: (s: any) =>
        s.asciibirdMeta[s.tab]?.imageOverlay,
      selectBlocks: (s: any) => JSON.parse(
        LZString.decompressFromUTF16(s.selectBlocks),
      ),
      brushSizeHeight: (s: any) => s.toolbarState.brushSizeHeight,
      brushSizeWidth: (s: any) => s.toolbarState.brushSizeWidth,
      brushSizeType: (s: any) => s.toolbarState.brushSizeType,
    },
    mutations,
  })
}

// ─── Mount options factory ────────────────────────────────────────

export function createMountOptions(store: any, extra: any = {}) {
  return {
    store,
    mocks: {
      $modal: modalMock,
      $toasted: toastedMock,
      $copyText: copyTextMock,
    },
    global: { stubs: globalStubs },
    ...extra,
  }
}
