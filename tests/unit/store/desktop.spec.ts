import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDesktopStore } from '@/store/desktop';

describe('useDesktopStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('menuBarVisible is true by default', () => {
      const store = useDesktopStore();
      expect(store.menuBarVisible).toBe(true);
    });

    it('tabsVisible is true by default', () => {
      const store = useDesktopStore();
      expect(store.tabsVisible).toBe(true);
    });
  });

  describe('changeMenuBarVisible', () => {
    it('hides menu bar', () => {
      const store = useDesktopStore();
      store.changeMenuBarVisible(false);
      expect(store.menuBarVisible).toBe(false);
    });

    it('shows menu bar', () => {
      const store = useDesktopStore();
      store.changeMenuBarVisible(false);
      store.changeMenuBarVisible(true);
      expect(store.menuBarVisible).toBe(true);
    });
  });

  describe('changeTabsVisible', () => {
    it('hides tabs', () => {
      const store = useDesktopStore();
      store.changeTabsVisible(false);
      expect(store.tabsVisible).toBe(false);
    });

    it('shows tabs', () => {
      const store = useDesktopStore();
      store.changeTabsVisible(false);
      store.changeTabsVisible(true);
      expect(store.tabsVisible).toBe(true);
    });
  });
});
