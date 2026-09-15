// Tests for useMenuBar composable — menu structure + View toggle actions
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMenuBar } from '../../../src/composables/useMenuBar';
import { useDesktopStore } from '../../../src/store/desktop';
import { usePanelStore } from '../../../src/store/panels';
import { useToolbarStore } from '../../../src/store/toolbar';
import { useAsciiBirdStore } from '../../../src/store';
import { SHORTCUTS } from '../../../src/utils/shortcuts';

const stubActions = {
  startImport: vi.fn(),
  handleExport: vi.fn(),
  handleExportAnsi: vi.fn(),
  handleExportHtml: vi.fn(),
  handleExportPlainText: vi.fn(),
  handleCropToContent: vi.fn(),
};

describe('useMenuBar', () => {
  let desktopStore: ReturnType<typeof useDesktopStore>;
  let panelStore: ReturnType<typeof usePanelStore>;
  let toolbarStore: ReturnType<typeof useToolbarStore>;
  let store: ReturnType<typeof useAsciiBirdStore>;
  let menuBar: ReturnType<typeof useMenuBar>['menuBar'];

  beforeEach(() => {
    setActivePinia(createPinia());
    desktopStore = useDesktopStore();
    panelStore = usePanelStore();
    toolbarStore = useToolbarStore();
    store = useAsciiBirdStore();
    ({ menuBar } = useMenuBar(stubActions));
  });

  function viewItems() {
    const view = menuBar.value.find(m => m.label === 'View');
    if (!view) throw new Error('View menu missing');
    return view.items;
  }

  function findItem(text: string) {
    const item = viewItems().find(i => i.text.endsWith(text)
      || i.text.startsWith(text));
    if (!item) throw new Error(`View item not found: ${text}`);
    return item;
  }

  it('View menu exposes all 7 panel toggles with shortcut labels', () => {
    const expected: [string, string][] = [
      ['Menu Bar', SHORTCUTS.toggleMenuBar.label],
      ['Tabs', SHORTCUTS.toggleTabs.label],
      ['Debug', SHORTCUTS.toggleDebug.label],
      ['Brush Library', SHORTCUTS.toggleBrushLibrary.label],
      ['Layers', SHORTCUTS.toggleLayers.label],
      ['Toolbar', SHORTCUTS.toggleToolbar.label],
      ['Brush Preview', SHORTCUTS.toggleBrushPreview.label],
    ];
    for (const [text, label] of expected) {
      const item = findItem(text);
      expect(item.shortcut).toBe(label);
    }
    // No duplicates — exactly one item per toggle
    expect(viewItems().filter(i => i.text.includes('Debug'))).toHaveLength(1);
    expect(viewItems().filter(i => i.text.includes('Tabs'))).toHaveLength(1);
  });

  it('View menu toggle labels flip with visibility state', () => {
    expect(findItem('Menu Bar').text).toBe('Hide Menu Bar');
    desktopStore.changeMenuBarVisible(false);
    expect(findItem('Menu Bar').text).toBe('Show Menu Bar');
  });

  it('Export menu carries shortcut labels incl. restored PNG item', () => {
    const exportMenu = menuBar.value.find(m => m.label === 'Export')!;
    const texts = exportMenu.items.map(i => `${i.text} ${i.shortcut ?? ''}`);
    expect(texts.join('|')).toContain(`mIRC to Clipboard ${SHORTCUTS.exportClipboard.label}`);
    expect(texts.join('|')).toContain(`PNG Image ${SHORTCUTS.exportPng.label}`);
  });

  it('File menu carries restored Close ASCII item with label', () => {
    const fileMenu = menuBar.value.find(m => m.label === 'File')!;
    const close = fileMenu.items.find(i => i.text === 'Close ASCII');
    expect(close?.shortcut).toBe(SHORTCUTS.closeAscii.label);
  });

  it('clicking panel toggle menu items invokes matching store actions', () => {
    const deskSpy = vi.spyOn(desktopStore, 'changeTabsVisible');
    findItem('Tabs').click();
    expect(deskSpy).toHaveBeenCalledWith(false);

    const panelSpy = vi.spyOn(panelStore, 'toggleDebugPanel');
    findItem('Debug').click();
    expect(panelSpy).toHaveBeenCalledWith(true); // hidden by default
  });

  it('Layers/Preview/Toolbar toggles preserve panel geometry', () => {
    const before = { ...panelStore.layersLibrary };
    findItem('Layers').click();
    expect(panelStore.layersLibrary.visible).toBe(!before.visible);
    expect(panelStore.layersLibrary.x).toBe(before.x);
    expect(panelStore.layersLibrary.w).toBe(before.w);

    const tsBefore = { ...toolbarStore.toolbarState };
    findItem('Toolbar').click();
    expect(toolbarStore.toolbarState.visible)
      .toBe(!tsBefore.visible);
    expect(toolbarStore.toolbarState.x).toBe(tsBefore.x);
    expect(toolbarStore.toolbarState.h).toBe(tsBefore.h);
  });

  it('View items are disabled with zero tabs', () => {
    // menuBar computed reads store.asciibirdMeta (empty by default)
    expect(store.asciibirdMeta).toHaveLength(0);
    const item = findItem('Debug');
    expect(item.disabled).toBe(true);
  });
});
