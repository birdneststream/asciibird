import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePanelRegistry } from '@/composables/usePanelRegistry'
import { usePanelStore } from '@/store/panels'
import { useToolbarStore } from '@/store/toolbar'

describe('usePanelRegistry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns all 7 panels', () => {
    const { panels } = usePanelRegistry()
    expect(panels.value).toHaveLength(7)
    const ids = panels.value.map((p) => p.id)
    expect(ids).toContain('toolbar')
    expect(ids).toContain('debugPanel')
    expect(ids).toContain('brushLibrary')
    expect(ids).toContain('brushPreview')
    expect(ids).toContain('layersLibrary')
    expect(ids).toContain('colourPicker')
    expect(ids).toContain('charPicker')
  })

  it('each panel has required properties', () => {
    const { panels } = usePanelRegistry()
    for (const panel of panels.value) {
      expect(panel).toHaveProperty('id')
      expect(panel).toHaveProperty('name')
      expect(panel).toHaveProperty('icon')
      expect(panel).toHaveProperty('visible')
      expect(panel).toHaveProperty('minimized')
      expect(panel).toHaveProperty('isShowing')
    }
  })

  it('isShowing is true when visible and not minimized', () => {
    const { panels } = usePanelRegistry()
    const toolbar = panels.value.find((p) => p.id === 'toolbar')!
    expect(toolbar.visible).toBe(true)
    expect(toolbar.minimized).toBe(false)
    expect(toolbar.isShowing).toBe(true)
  })

  it('isShowing is false when minimized', () => {
    const panelStore = usePanelStore()
    panelStore.minimizePanel('brushPreview')
    const { panels } = usePanelRegistry()
    const brush = panels.value.find((p) => p.id === 'brushPreview')!
    expect(brush.minimized).toBe(true)
    expect(brush.visible).toBe(true)
    expect(brush.isShowing).toBe(false)
  })

  it('toggle minimizes a visible panel', () => {
    const { panels, toggle } = usePanelRegistry()
    toggle('layersLibrary')
    const layers = panels.value.find((p) => p.id === 'layersLibrary')!
    expect(layers.minimized).toBe(true)
    expect(layers.isShowing).toBe(false)
  })

  it('toggle restores a minimized panel', () => {
    const panelStore = usePanelStore()
    panelStore.minimizePanel('brushLibrary')
    const { panels, toggle } = usePanelRegistry()
    toggle('brushLibrary')
    const brushes = panels.value.find((p) => p.id === 'brushLibrary')!
    expect(brushes.minimized).toBe(false)
    expect(brushes.isShowing).toBe(true)
  })

  it('minimize sets minimized true', () => {
    const { panels, minimize } = usePanelRegistry()
    minimize('toolbar')
    const toolbar = panels.value.find((p) => p.id === 'toolbar')!
    expect(toolbar.minimized).toBe(true)
    expect(toolbar.visible).toBe(true)
  })

  it('restore clears minimized', () => {
    const toolbarStore = useToolbarStore()
    toolbarStore.minimizeToolbar()
    const { panels, restore } = usePanelRegistry()
    restore('toolbar')
    const toolbar = panels.value.find((p) => p.id === 'toolbar')!
    expect(toolbar.minimized).toBe(false)
  })

  it('resetPosition resets x/y coordinates', () => {
    const panelStore = usePanelStore()
    panelStore.brushPreview.x = 9999
    panelStore.brushPreview.y = 8888
    const { resetPosition } = usePanelRegistry()
    resetPosition('brushPreview')
    expect(panelStore.brushPreview.x).not.toBe(9999)
    expect(panelStore.brushPreview.y).not.toBe(8888)
  })

  it('hide sets visible false and minimized false', () => {
    const { panels, hide } = usePanelRegistry()
    hide('layersLibrary')
    const layers = panels.value.find((p) => p.id === 'layersLibrary')!
    expect(layers.visible).toBe(false)
    expect(layers.minimized).toBe(false)
    expect(layers.isShowing).toBe(false)
  })

  it('toggle restores a hidden panel to visible', () => {
    const { panels, hide, toggle } = usePanelRegistry()
    hide('layersLibrary')
    const layers = panels.value.find((p) => p.id === 'layersLibrary')!
    expect(layers.visible).toBe(false)
    toggle('layersLibrary')
    const restored = panels.value.find((p) => p.id === 'layersLibrary')!
    expect(restored.visible).toBe(true)
    expect(restored.minimized).toBe(false)
    expect(restored.isShowing).toBe(true)
  })

  describe('colourPicker toggle', () => {
    it('restores a hidden colourPicker to visible', () => {
      const panelStore = usePanelStore()
      const toolbarStore = useToolbarStore()
      panelStore.colourPicker.visible = false
      panelStore.colourPicker.minimized = false
      const { panels, toggle } = usePanelRegistry()
      toggle('colourPicker')
      const cp = panels.value.find((p) => p.id === 'colourPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(false)
      expect(cp.isShowing).toBe(true)
    })

    it('restores a minimized colourPicker', () => {
      const panelStore = usePanelStore()
      panelStore.minimizePanel('colourPicker')
      const { panels, toggle } = usePanelRegistry()
      toggle('colourPicker')
      const cp = panels.value.find((p) => p.id === 'colourPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(false)
      expect(cp.isShowing).toBe(true)
    })

    it('minimizes a visible colourPicker', () => {
      const panelStore = usePanelStore()
      panelStore.colourPicker.visible = true
      panelStore.colourPicker.minimized = false
      const { panels, toggle } = usePanelRegistry()
      toggle('colourPicker')
      const cp = panels.value.find((p) => p.id === 'colourPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(true)
      expect(cp.isShowing).toBe(false)
    })

    it('sets isChoosingFg when restoring and no mode active', () => {
      const panelStore = usePanelStore()
      const toolbarStore = useToolbarStore()
      panelStore.colourPicker.visible = false
      toolbarStore.changeIsUpdatingFg(false)
      toolbarStore.changeIsUpdatingBg(false)
      const { toggle } = usePanelRegistry()
      toggle('colourPicker')
      expect(toolbarStore.toolbarState.isChoosingFg).toBe(true)
    })

    it('clears fg/bg mode when minimizing', () => {
      const panelStore = usePanelStore()
      const toolbarStore = useToolbarStore()
      panelStore.colourPicker.visible = true
      panelStore.colourPicker.minimized = false
      toolbarStore.changeIsUpdatingFg(true)
      const { toggle } = usePanelRegistry()
      toggle('colourPicker')
      expect(toolbarStore.toolbarState.isChoosingFg).toBe(false)
      expect(toolbarStore.toolbarState.isChoosingBg).toBe(false)
    })
  })

  describe('charPicker toggle', () => {
    it('restores a hidden charPicker to visible', () => {
      const panelStore = usePanelStore()
      panelStore.charPicker.visible = false
      panelStore.charPicker.minimized = false
      const { panels, toggle } = usePanelRegistry()
      toggle('charPicker')
      const cp = panels.value.find((p) => p.id === 'charPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(false)
      expect(cp.isShowing).toBe(true)
    })

    it('restores a minimized charPicker', () => {
      const panelStore = usePanelStore()
      panelStore.minimizePanel('charPicker')
      const { panels, toggle } = usePanelRegistry()
      toggle('charPicker')
      const cp = panels.value.find((p) => p.id === 'charPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(false)
      expect(cp.isShowing).toBe(true)
    })

    it('minimizes a visible charPicker', () => {
      const panelStore = usePanelStore()
      panelStore.charPicker.visible = true
      panelStore.charPicker.minimized = false
      const { panels, toggle } = usePanelRegistry()
      toggle('charPicker')
      const cp = panels.value.find((p) => p.id === 'charPicker')!
      expect(cp.visible).toBe(true)
      expect(cp.minimized).toBe(true)
      expect(cp.isShowing).toBe(false)
    })

    it('sets isChoosingChar when restoring', () => {
      const panelStore = usePanelStore()
      const toolbarStore = useToolbarStore()
      panelStore.charPicker.visible = false
      toolbarStore.changeIsUpdatingChar(false)
      const { toggle } = usePanelRegistry()
      toggle('charPicker')
      expect(toolbarStore.toolbarState.isChoosingChar).toBe(true)
    })

    it('clears isChoosingChar when minimizing', () => {
      const panelStore = usePanelStore()
      const toolbarStore = useToolbarStore()
      panelStore.charPicker.visible = true
      panelStore.charPicker.minimized = false
      toolbarStore.changeIsUpdatingChar(true)
      const { toggle } = usePanelRegistry()
      toggle('charPicker')
      expect(toolbarStore.toolbarState.isChoosingChar).toBe(false)
    })
  })
})
