// @vitest-environment jsdom
// Shared test utilities for ASCIIBIRD component tests.
// Updated for Vue 3 + Pinia (no more Vuex).

import { vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import LZString from 'lz-string'
import {
  create2DArray,
  emptyBlock,
  cyrb53,
} from '@/ascii'
import type { AsciiStoreAccess, ModalStoreAccess } from '@/types/store'

// ─── Shared component stubs ──────────────────────────────────────

export const globalStubs = {
  ABModal: {
    template:
      '<div class="ab-modal"><slot /><slot name="footer" /></div>',
    props: ['open', 'title'],
  },
  BrushCanvas: {
    template: '<div class="brush-canvas-stub"><slot /></div>',
  },
  Layers: {
    template: '<div class="layers-stub"><slot /></div>',
  },
  Colours: {
    template: '<div class="colours-stub"><slot /></div>',
  },
  ContextMenu: {
    name: 'ContextMenu',
    template: '<div class="context-menu-stub"><slot /></div>',
    methods: {
      open: vi.fn(),
      close: vi.fn(),
    },
  },
  MainBrushCanvas: {
    template: '<div class="main-brush-canvas-stub" />',
  },
  // Headless UI component stubs
  Dialog: { template: '<div><slot /></div>' },
  DialogPanel: { template: '<div><slot /></div>' },
  TransitionRoot: { template: '<div><slot /></div>' },
  TransitionChild: { template: '<div><slot /></div>' },
  Menu: { template: '<div><slot /></div>' },
  MenuButton: { template: '<button><slot /></button>' },
  MenuItems: { template: '<div><slot /></div>' },
  MenuItem: { template: '<div><slot /></div>' },
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
  }) as any

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

// ─── Mock store factory (Pinia-compatible) ────────────────────────
//
// In Pinia, the store is a plain object where:
//   - State properties are direct properties
//   - Getters are computed properties (direct access)
//   - Actions are methods
//
// For testing ascii.ts (which uses setStore/getStore), we create
// a mock object that mimics the Pinia store's public API.

export interface MockStoreConfig {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  extraActions?: Record<string, Function>
}

/**
 * Create a mock toolbar store for component tests.
 * Separated from the main store since toolbar state was extracted.
 */
export function createMockToolbarStore(
  overrides: Record<string, any> = {},
) {
  const toolbarState = createToolbarState(overrides.toolbarState)
  const tState: Record<string, any> = {
    toolbarState,
    _brushBlocks: overrides._brushBlocks
      ?? LZString.compressToUTF16(JSON.stringify([])),
    brushHistory: overrides.brushHistory ?? [],
    _selectBlocks: overrides._selectBlocks
      ?? LZString.compressToUTF16(JSON.stringify([])),
    brushLibrary: overrides.brushLibrary ?? [],
  }

  return {
    ...tState,

    // Getters
    get currentTool() { return toolbarState.currentTool },
    get isTargettingBg() { return toolbarState.targetingBg },
    get isTargettingFg() { return toolbarState.targetingFg },
    get isTargettingChar() { return toolbarState.targetingChar },
    get currentFg() { return toolbarState.currentColourFg },
    get currentBg() { return toolbarState.currentColourBg },
    get currentChar() { return toolbarState.selectedChar },
    get brushSizeHeight() { return toolbarState.brushSizeHeight },
    get brushSizeWidth() { return toolbarState.brushSizeWidth },
    get brushSizeType() { return toolbarState.brushSizeType },
    get brushBlocks() {
      return JSON.parse(
        LZString.decompressFromUTF16(tState._brushBlocks as string),
      )
    },
    get selectBlocks() {
      return JSON.parse(
        LZString.decompressFromUTF16(tState._selectBlocks as string),
      )
    },

    // Actions
    changeColourFg(c: number) {
      toolbarState.currentColourFg = c
      toolbarState.isUpdating = false
      toolbarState.isChoosingFg = false
    },
    changeColourBg(c: number) {
      toolbarState.currentColourBg = c
      toolbarState.isUpdating = false
      toolbarState.isChoosingBg = false
    },
    changeChar(c: string) {
      toolbarState.selectedChar = c
      toolbarState.isUpdating = false
      if (!toolbarState.persistCharPanel) {
        toolbarState.isChoosingChar = false
      }
    },
    changeTool(idx: number) {
      toolbarState.currentTool = idx
    },
    persistCharPanel(val: boolean) {
      toolbarState.persistCharPanel = val
    },
    changeIsUpdatingFg(val: boolean) {
      toolbarState.isChoosingFg = val
    },
    changeIsUpdatingBg(val: boolean) {
      toolbarState.isChoosingBg = val
    },
    changeIsUpdatingChar(val: boolean) {
      toolbarState.isChoosingChar = val
    },
    changeTargetingFg(val: boolean) {
      toolbarState.targetingFg = val
    },
    changeTargetingBg(val: boolean) {
      toolbarState.targetingBg = val
    },
    changeTargetingChar(val: boolean) {
      toolbarState.targetingChar = val
    },
    updateToolBarState(p: any) {
      Object.assign(toolbarState, p)
    },
    updateMirror(p: any) {
      toolbarState.mirrorX = p.x
      toolbarState.mirrorY = p.y
    },
    updateBrushSize(p: any) {
      if (p.brushSizeHeight !== undefined) {
        toolbarState.brushSizeHeight = p.brushSizeHeight
      }
      if (p.brushSizeWidth !== undefined) {
        toolbarState.brushSizeWidth = p.brushSizeWidth
      }
      if (p.brushSizeType !== undefined) {
        toolbarState.brushSizeType = p.brushSizeType
      }
    },
    setBrushBlocks(blocks: any) {
      tState._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      )
    },
    setSelectBlocks(blocks: any) {
      tState._selectBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      )
    },
    toggleGridView(val: boolean) {
      toolbarState.gridView = val
    },
    toggleHalfBlockEditing(val: boolean) {
      toolbarState.halfBlockEditing = val
    },
    toggleUpdateBrush(val: boolean) {
      toolbarState.updateBrush = val
    },
    changeToolBarState(p: any) {
      toolbarState.x = p.x
      toolbarState.y = p.y
      toolbarState.w = p.w
      toolbarState.h = p.h
      toolbarState.visible = p.visible
    },
    changeToolBarDraggable(val: boolean) {
      toolbarState.draggable = val
    },
    flipRotateBlocks() {},
    pushBrushHistory(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      if (!tState.brushHistory.some((b: any) => b.hash === hash)) {
        tState.brushHistory.push({
          blocks: LZString.compressToUTF16(
            JSON.stringify(blocks),
          ),
          hash,
        })
      }
    },
    pushBrushLibrary(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      if (!tState.brushLibrary.some((b: any) => b.hash === hash)) {
        tState.brushLibrary.push({
          blocks: LZString.compressToUTF16(
            JSON.stringify(blocks),
          ),
          hash,
        })
      }
    },
    removeBrushLibrary(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      tState.brushLibrary = tState.brushLibrary.filter(
        (b: any) => b.hash !== hash,
      )
    },
    removeBrushHistory(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      tState.brushHistory = tState.brushHistory.filter(
        (b: any) => b.hash !== hash,
      )
    },
    upBrush(key: number) {
      if (key > 0) {
        const temp = tState.brushLibrary[key]
        tState.brushLibrary[key] = tState.brushLibrary[key - 1]
        tState.brushLibrary[key - 1] = temp
      }
    },
    downBrush(key: number) {
      if (key < tState.brushLibrary.length - 1) {
        const temp = tState.brushLibrary[key]
        tState.brushLibrary[key] = tState.brushLibrary[key + 1]
        tState.brushLibrary[key + 1] = temp
      }
    },
  }
}

/**
 * Create a mock modal store for component tests.
 * Separated from the main store since modal state was extracted.
 */
export function createMockModalStore(
  overrides: Record<string, any> = {},
) {
  const defaultState = {
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
  }

  const state = { ...defaultState, ...overrides }

  return {
    ...state,
    get isModalOpen() {
      return Object.values(state.modalState).some((v: any) => v)
    },
    openModal(name: string) {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) state.modalState[map[name]] = true
    },
    closeModal(name: string) {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) state.modalState[map[name]] = false
    },
    toggleDisableKeyboard(val: boolean | null = null) {
      state.isKeyboardDisabled =
        val === null ? !state.isKeyboardDisabled : val
    },
  }
}

export function createMockPanelStore(
  overrides: Record<string, any> = {},
) {
  const defaultState = {
    debugPanel: {
      x: 100, y: 100, h: 200, w: 300, visible: false,
    },
    brushLibrary: {
      x: 200, y: 150, h: 250, w: 350, visible: true, tab: 0,
    },
    brushPreview: {
      x: 50, y: 50, h: 190, w: 250, visible: true,
    },
    layersLibrary: {
      x: 300, y: 100, h: 190, w: 350, visible: true,
    },
  }

  const state = { ...defaultState, ...overrides }

  return {
    ...state,
    changeDebugPanelState(p: any) { Object.assign(state.debugPanel, p) },
    toggleDebugPanel(v: boolean) { state.debugPanel.visible = v },
    changeBrushLibraryState(p: any) { Object.assign(state.brushLibrary, p) },
    changeBrushPreviewState(p: any) { Object.assign(state.brushPreview, p) },
    toggleBrushLibrary(v: boolean) { state.brushLibrary.visible = v },
    changeLayersLibraryState(p: any) { Object.assign(state.layersLibrary, p) },
  }
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
    _brushBlocks: LZString.compressToUTF16(JSON.stringify([])),
    _selectBlocks: LZString.compressToUTF16(JSON.stringify([])),
    panelState: {
      toolbar: { x: 10, y: 40 },
      debugPanel: { x: 10, y: 40 },
      brushLibrary: { x: 10, y: 40 },
      layersLibrary: { x: 10, y: 40 },
      brushPreview: { x: 10, y: 40 },
    },
  }

  const state = { ...defaultState, ...overrides }

  // Create a Pinia-compatible mock store object.
  // State properties are writable (spread first), then derived getters
  // override only the computed ones. Actions mutate state directly.
  const store: Record<string, any> = {
    // ─── State (direct writable properties) ──────────
    ...state,

    // ─── Derived Getters (read-only, computed) ───────
    get currentFg() { return state.toolbarState.currentColourFg },
    get currentBg() { return state.toolbarState.currentColourBg },
    get currentChar() { return state.toolbarState.selectedChar },
    get currentTool() { return state.toolbarState.currentTool },
    get persistCharPanel() {
      return state.toolbarState.persistCharPanel
    },
    get isTargettingFg() { return state.toolbarState.targetingFg },
    get isTargettingBg() { return state.toolbarState.targetingBg },
    get isTargettingChar() {
      return state.toolbarState.targetingChar
    },
    get isModalOpen() {
      return Object.values(state.modalState).some((v: any) => v)
    },
    get currentAscii() {
      return state.asciibirdMeta[state.tab] || false
    },
    get currentAsciiLayers() {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta) return []
      return JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
    },
    get currentAsciiLayersWidthHeight() {
      const layers = JSON.parse(
        LZString.decompressFromUTF16(
          state.asciibirdMeta[state.tab]?.layers || '',
        ),
      )
      return layers.length > 0
        ? { width: layers[0].width, height: layers[0].height }
        : { width: 0, height: 0 }
    },
    get selectedLayer() {
      return state.asciibirdMeta[state.tab]?.selectedLayer ?? 0
    },
    get debugPanel() { return state.debugPanelState },
    get brushBlocks() {
      return JSON.parse(
        LZString.decompressFromUTF16(state._brushBlocks),
      )
    },
    get _brushBlocks() { return state._brushBlocks },
    set _brushBlocks(val: string) { state._brushBlocks = val },
    get _selectBlocks() { return state._selectBlocks },
    set _selectBlocks(val: string) { state._selectBlocks = val },
    get imageOverlay() {
      return state.asciibirdMeta[state.tab]?.imageOverlay
    },
    get selectBlocks() {
      return JSON.parse(
        LZString.decompressFromUTF16(state._selectBlocks),
      )
    },
    get brushSizeHeight() {
      return state.toolbarState.brushSizeHeight
    },
    get brushSizeWidth() {
      return state.toolbarState.brushSizeWidth
    },
    get brushSizeType() {
      return state.toolbarState.brushSizeType
    },

    // ─── Actions (mutate state directly) ─────────────
    closeModal(name: string) {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) state.modalState[map[name]] = false
      state.isKeyboardDisabled = false
    },
    openModal(name: string) {
      const map: Record<string, string> = {
        'new-ascii': 'newAscii',
        'edit-ascii': 'editAscii',
        'paste-ascii': 'pasteAscii',
        'options': 'options',
        'overlay': 'overlay',
        'about': 'about',
        'help': 'help',
      }
      if (map[name]) state.modalState[map[name]] = true
      state.isKeyboardDisabled = true
    },
    changeTool(idx: number) {
      state.toolbarState.currentTool = idx
    },
    changeColourFg(c: number) {
      state.toolbarState.currentColourFg = c
    },
    changeColourBg(c: number) {
      state.toolbarState.currentColourBg = c
    },
    changeChar(c: string) {
      state.toolbarState.selectedChar = c
    },
    updateOptions(opts: any) {
      state.options = opts
    },
    updateMirror(p: any) {
      state.toolbarState.mirrorX = p.x
      state.toolbarState.mirrorY = p.y
    },
    toggleGridView() {
      state.toolbarState.gridView = !state.toolbarState.gridView
    },
    toggleHalfBlockEditing(v: boolean) {
      state.toolbarState.halfBlockEditing = v
    },
    toggleUpdateBrush() {
      state.toolbarState.updateBrush = !state.toolbarState.updateBrush
    },
    changeToolBarState(p: any) {
      Object.assign(state.toolbarState, p)
    },
    changeDebugPanelState(p: any) {
      Object.assign(state.debugPanelState, p)
    },
    changeBrushLibraryState(p: any) {
      Object.assign(state.brushLibraryState, p)
    },
    changeLayersLibraryState(p: any) {
      Object.assign(state.layersLibraryState, p)
    },
    changeAsciiWidthHeight(p: any) {
      const meta = state.asciibirdMeta[state.tab]
      if (meta) {
        meta.layers = LZString.compressToUTF16(
          JSON.stringify(p.layers),
        )
      }
    },
    updateAsciiTitle(t: string) {
      state.asciibirdMeta[state.tab].title = t
    },
    newAsciibirdMeta(meta: any) {
      state.asciibirdMeta.push(meta)
      state.tab = state.asciibirdMeta.length - 1
    },
    setBrushBlocks(blocks: any) {
      state._brushBlocks = LZString.compressToUTF16(
        JSON.stringify(blocks),
      )
    },
    pushBrushLibrary(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      if (!state.brushLibrary.some((b: any) => b.hash === hash)) {
        state.brushLibrary.push({
          blocks: LZString.compressToUTF16(
            JSON.stringify(blocks),
          ),
          hash,
        })
      }
    },
    removeBrushLibrary(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      state.brushLibrary = state.brushLibrary.filter(
        (b: any) => b.hash !== hash,
      )
    },
    removeBrushHistory(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      state.brushHistory = state.brushHistory.filter(
        (b: any) => b.hash !== hash,
      )
    },
    upBrush(key: number) {
      if (key > 0) {
        const temp = state.brushLibrary[key]
        state.brushLibrary[key] = state.brushLibrary[key - 1]
        state.brushLibrary[key - 1] = temp
      }
    },
    downBrush(key: number) {
      if (key < state.brushLibrary.length - 1) {
        const temp = state.brushLibrary[key]
        state.brushLibrary[key] = state.brushLibrary[key + 1]
        state.brushLibrary[key + 1] = temp
      }
    },
    updateImageOverlay(payload: any) {
      const meta = state.asciibirdMeta[state.tab]
      if (meta) meta.imageOverlay = payload
    },
    changeLayer(idx: number) {
      const meta = state.asciibirdMeta[state.tab]
      if (meta) meta.selectedLayer = idx
    },
    toggleLayer(idx: number) {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (layers[idx]) layers[idx].visible = !layers[idx].visible
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
    },
    removeLayer(idx: number) {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      layers.splice(idx, 1)
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
      if (meta.selectedLayer >= layers.length) {
        meta.selectedLayer = layers.length - 1
      }
    },
    addLayer() {
      const meta = state.asciibirdMeta[state.tab]
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
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
    },
    mergeAllLayers() {
      // Simplified mock — just keeps first layer
    },
    upLayer(idx: number) {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta || idx <= 0) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      const temp = layers[idx]
      layers[idx] = layers[idx - 1]
      layers[idx - 1] = temp
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
    },
    downLayer(idx: number) {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (idx >= layers.length - 1) return
      const temp = layers[idx]
      layers[idx] = layers[idx + 1]
      layers[idx + 1] = temp
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
    },
    updateLayerName(payload: any) {
      const meta = state.asciibirdMeta[state.tab]
      if (!meta) return
      const layers = JSON.parse(
        LZString.decompressFromUTF16(meta.layers),
      )
      if (layers[payload.key]) {
        layers[payload.key].label = payload.label
      }
      meta.layers = LZString.compressToUTF16(
        JSON.stringify(layers),
      )
    },
    toggleDisableKeyboard(val: boolean) {
      state.isKeyboardDisabled = val
    },
    undoBlocks() {
      // Simplified mock for keyboard shortcut tests
    },
    redoBlocks() {
      // Simplified mock for keyboard shortcut tests
    },
    changeIsUpdatingFg(val: boolean) {
      state.toolbarState.isChoosingFg = val
    },
    changeIsUpdatingBg(val: boolean) {
      state.toolbarState.isChoosingBg = val
    },
    changeIsUpdatingChar(val: boolean) {
      state.toolbarState.isChoosingChar = val
    },
    changeBrushPreviewState(p: any) {
      Object.assign(state.brushPreviewState, p)
    },
    changeToolBarDraggable(val: boolean) {
      state.toolbarState.draggable = val
    },
    pushBrushHistory(blocks: any) {
      const hash = cyrb53(JSON.stringify(blocks))
      if (!state.brushHistory.some((b: any) => b.hash === hash)) {
        state.brushHistory.push({
          blocks: LZString.compressToUTF16(
            JSON.stringify(blocks),
          ),
          hash,
        })
      }
    },
    updateBrushSize(p: any) {
      if (p.brushSizeHeight !== undefined) {
        state.toolbarState.brushSizeHeight = p.brushSizeHeight
      }
      if (p.brushSizeWidth !== undefined) {
        state.toolbarState.brushSizeWidth = p.brushSizeWidth
      }
      if (p.brushSizeType !== undefined) {
        state.toolbarState.brushSizeType = p.brushSizeType
      }
    },

    // Vuex compat aliases for tests that still use commit/dispatch
    commit: vi.fn((mutation: string, payload?: any) => {
      // Map old mutation names to new action names
      const actionMap: Record<string, string> = {
        'closeModal': 'closeModal',
        'openModal': 'openModal',
        'changeTool': 'changeTool',
        'changeColourFg': 'changeColourFg',
        'changeColourBg': 'changeColourBg',
        'changeChar': 'changeChar',
        'updateOptions': 'updateOptions',
        'updateMirror': 'updateMirror',
        'toggleGridView': 'toggleGridView',
        'toggleHalfBlockEditing': 'toggleHalfBlockEditing',
        'toggleUpdateBrush': 'toggleUpdateBrush',
        'changeToolBarState': 'changeToolBarState',
        'changeDebugPanelState': 'changeDebugPanelState',
        'changeBrushLibraryState': 'changeBrushLibraryState',
        'changeLayersLibraryState': 'changeLayersLibraryState',
        'changeAsciiWidthHeight': 'changeAsciiWidthHeight',
        'updateAsciiTitle': 'updateAsciiTitle',
        'newAsciibirdMeta': 'newAsciibirdMeta',
        'brushBlocks': 'setBrushBlocks',
        'setBrushBlocks': 'setBrushBlocks',
        'setSelectBlocks': 'setSelectBlocks',
        'pushBrushLibrary': 'pushBrushLibrary',
        'removeBrushLibrary': 'removeBrushLibrary',
        'removeBrushHistory': 'removeBrushHistory',
        'upBrush': 'upBrush',
        'downBrush': 'downBrush',
        'updateImageOverlay': 'updateImageOverlay',
        'changeLayer': 'changeLayer',
        'toggleLayer': 'toggleLayer',
        'removeLayer': 'removeLayer',
        'addLayer': 'addLayer',
        'mergeAllLayers': 'mergeAllLayers',
        'upLayer': 'upLayer',
        'downLayer': 'downLayer',
        'updateLayerName': 'updateLayerName',
        'toggleDisableKeyboard': 'toggleDisableKeyboard',
        'undoBlocks': 'undoBlocks',
        'redoBlocks': 'redoBlocks',
        'changeIsUpdatingFg': 'changeIsUpdatingFg',
        'changeIsUpdatingBg': 'changeIsUpdatingBg',
        'changeIsUpdatingChar': 'changeIsUpdatingChar',
        'changeBrushPreviewState': 'changeBrushPreviewState',
        'changeToolBarDraggable': 'changeToolBarDraggable',
        'pushBrushHistory': 'pushBrushHistory',
        'updateBrushSize': 'updateBrushSize',
      }
      const actionName = actionMap[mutation]
      if (actionName && typeof store[actionName] === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (store[actionName] as (...args: any[]) => any)(payload)
      }
    }),
    dispatch: vi.fn(),

    // Extra actions from config
    ...(config.extraActions || {}),
  }

  return store
}

// ─── Mock canvas ref factory ─────────────────────────────────────

export function createMockCanvasRef(
  width = 256,
  height = 256,
) {
  const mockCtx = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    fillStyle: '',
    font: '',
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: '',
    lineWidth: 1,
  }
  return {
    width,
    height,
    getContext: vi.fn(() => mockCtx),
    _mockCtx: mockCtx, // exposed for assertions
  }
}

// ─── Mount options factory (VTU v2 / Vue 3) ──────────────────────

export function createMountOptions(extra: any = {}) {
  return {
    global: {
      plugins: [createPinia()],
      stubs: globalStubs,
    },
    ...extra,
  }
}

// ─── Type-safe store accessors ────────────────────────────────────
// These helpers bridge the gap between mock store objects (typed as
// Record<string, any>) and the strict AsciiStoreAccess/ModalStoreAccess
// interfaces that ascii.ts requires. The mock objects implement the
// interfaces structurally but TypeScript can't verify index signatures
// against named interface properties.

/** Cast a mock store to AsciiStoreAccess for setStore() calls */
export function asAsciiStore(mock: ReturnType<typeof createMockStore>): AsciiStoreAccess {
  return mock as unknown as AsciiStoreAccess
}

/** Cast a mock store to ModalStoreAccess for setModalStore() calls */
export function asModalStore(mock: ReturnType<typeof createMockStore>): ModalStoreAccess {
  return mock as unknown as ModalStoreAccess
}

// ─── Vue Test Wrapper type for <script setup> components ────────
// VTU cannot type wrapper.vm for <script setup> components because
// the component's exposed interface is opaque. This helper provides
// a permissive vm type so tests can access computed properties and
// methods without type errors.

import type { VueWrapper } from '@vue/test-utils'

export type TestWrapper = VueWrapper<Record<string, any>>

/** Mount a component and return a wrapper with permissive vm typing */
export function wrapComponent(wrapper: VueWrapper<any>): TestWrapper {
  return wrapper as TestWrapper
}
