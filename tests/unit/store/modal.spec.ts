import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useModalStore } from '@/store/modal';

describe('useModalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('all modals are closed by default', () => {
      const store = useModalStore();
      expect(store.modalState.newAscii).toBe(false);
      expect(store.modalState.editAscii).toBe(false);
      expect(store.modalState.pasteAscii).toBe(false);
      expect(store.modalState.options).toBe(false);
      expect(store.modalState.overlay).toBe(false);
      expect(store.modalState.about).toBe(false);
      expect(store.modalState.help).toBe(false);
    });

    it('isKeyboardDisabled is false by default', () => {
      const store = useModalStore();
      expect(store.isKeyboardDisabled).toBe(false);
    });

    it('isModalOpen is false when all modals closed', () => {
      const store = useModalStore();
      expect(store.isModalOpen).toBe(false);
    });
  });

  describe('openModal', () => {
    it('opens new-ascii modal', () => {
      const store = useModalStore();
      store.openModal('new-ascii');
      expect(store.modalState.newAscii).toBe(true);
      expect(store.isModalOpen).toBe(true);
    });

    it('opens edit-ascii modal', () => {
      const store = useModalStore();
      store.openModal('edit-ascii');
      expect(store.modalState.editAscii).toBe(true);
    });

    it('opens paste-ascii modal', () => {
      const store = useModalStore();
      store.openModal('paste-ascii');
      expect(store.modalState.pasteAscii).toBe(true);
    });

    it('opens options modal', () => {
      const store = useModalStore();
      store.openModal('options');
      expect(store.modalState.options).toBe(true);
    });

    it('opens overlay modal', () => {
      const store = useModalStore();
      store.openModal('overlay');
      expect(store.modalState.overlay).toBe(true);
    });

    it('opens about modal', () => {
      const store = useModalStore();
      store.openModal('about');
      expect(store.modalState.about).toBe(true);
    });

    it('opens help modal', () => {
      const store = useModalStore();
      store.openModal('help');
      expect(store.modalState.help).toBe(true);
    });

    it('ignores unknown modal type', () => {
      const store = useModalStore();
      store.openModal('unknown');
      expect(store.isModalOpen).toBe(false);
    });
  });

  describe('closeModal', () => {
    it('closes open modal', () => {
      const store = useModalStore();
      store.openModal('new-ascii');
      expect(store.isModalOpen).toBe(true);
      store.closeModal('new-ascii');
      expect(store.modalState.newAscii).toBe(false);
      expect(store.isModalOpen).toBe(false);
    });

    it('closing unopened modal is a no-op', () => {
      const store = useModalStore();
      store.closeModal('new-ascii');
      expect(store.modalState.newAscii).toBe(false);
    });
  });

  describe('toggleDisableKeyboard', () => {
    it('toggles keyboard disabled state', () => {
      const store = useModalStore();
      expect(store.isKeyboardDisabled).toBe(false);
      store.toggleDisableKeyboard();
      expect(store.isKeyboardDisabled).toBe(true);
      store.toggleDisableKeyboard();
      expect(store.isKeyboardDisabled).toBe(false);
    });

    it('sets keyboard disabled to true', () => {
      const store = useModalStore();
      store.toggleDisableKeyboard(true);
      expect(store.isKeyboardDisabled).toBe(true);
    });

    it('sets keyboard disabled to false', () => {
      const store = useModalStore();
      store.toggleDisableKeyboard(true);
      store.toggleDisableKeyboard(false);
      expect(store.isKeyboardDisabled).toBe(false);
    });

    it('null toggles the state', () => {
      const store = useModalStore();
      store.toggleDisableKeyboard(null);
      expect(store.isKeyboardDisabled).toBe(true);
      store.toggleDisableKeyboard(null);
      expect(store.isKeyboardDisabled).toBe(false);
    });
  });

  describe('isModalOpen', () => {
    it('returns true when any modal is open', () => {
      const store = useModalStore();
      store.openModal('about');
      expect(store.isModalOpen).toBe(true);
    });

    it('returns false when all modals closed', () => {
      const store = useModalStore();
      store.openModal('about');
      store.closeModal('about');
      expect(store.isModalOpen).toBe(false);
    });

    it('returns true with multiple modals open', () => {
      const store = useModalStore();
      store.openModal('about');
      store.openModal('help');
      expect(store.isModalOpen).toBe(true);
      store.closeModal('about');
      expect(store.isModalOpen).toBe(true);
      store.closeModal('help');
      expect(store.isModalOpen).toBe(false);
    });
  });
});
