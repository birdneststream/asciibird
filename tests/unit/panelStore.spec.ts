/**
 * Tests for Panel Store — new panel key operations.
 *
 * Covers: colourPicker and charPicker minimize/restore/reset.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePanelStore } from '../../src/store/panels';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('usePanelStore — new panel keys', () => {
  it('initializes with colourPicker and charPicker keys', () => {
    const store = usePanelStore();
    expect(store.colourPicker).toBeDefined();
    expect(store.charPicker).toBeDefined();
  });

  it('colourPicker defaults to hidden and not minimized', () => {
    const store = usePanelStore();
    expect(store.colourPicker.visible).toBe(false);
    expect(store.colourPicker.minimized).toBe(false);
  });

  it('charPicker defaults to hidden and not minimized', () => {
    const store = usePanelStore();
    expect(store.charPicker.visible).toBe(false);
    expect(store.charPicker.minimized).toBe(false);
  });

  it('togglePanelMinimize toggles colourPicker minimized', () => {
    const store = usePanelStore();
    store.colourPicker.visible = true;
    store.togglePanelMinimize('colourPicker');
    expect(store.colourPicker.minimized).toBe(true);
    store.togglePanelMinimize('colourPicker');
    expect(store.colourPicker.minimized).toBe(false);
  });

  it('minimizePanel sets charPicker minimized=true, visible=true', () => {
    const store = usePanelStore();
    store.minimizePanel('charPicker');
    expect(store.charPicker.minimized).toBe(true);
    expect(store.charPicker.visible).toBe(true);
  });

  it('restorePanel sets colourPicker minimized=false, visible=true', () => {
    const store = usePanelStore();
    store.minimizePanel('colourPicker');
    store.restorePanel('colourPicker');
    expect(store.colourPicker.minimized).toBe(false);
    expect(store.colourPicker.visible).toBe(true);
  });

  it('resetPanelPosition resets charPicker to defaults', () => {
    const store = usePanelStore();
    const origX = store.charPicker.x;
    const origY = store.charPicker.y;
    store.charPicker.x = 999;
    store.charPicker.y = 999;
    store.resetPanelPosition('charPicker');
    expect(store.charPicker.x).toBe(origX);
    expect(store.charPicker.y).toBe(origY);
  });

  it('bringToFront updates z-index for colourPicker', () => {
    const store = usePanelStore();
    store.bringToFront('colourPicker');
    expect(store.panelZIndex('colourPicker')).toBeGreaterThan(100);
  });

  it('all existing panel keys still work', () => {
    const store = usePanelStore();
    expect(store.debugPanel).toBeDefined();
    expect(store.brushLibrary).toBeDefined();
    expect(store.brushPreview).toBeDefined();
    expect(store.layersLibrary).toBeDefined();
  });
});
