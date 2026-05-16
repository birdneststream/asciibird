// Modal store — manages modal visibility and keyboard state
// Extracted from monolithic useAsciiBirdStore for separation of concerns

import { defineStore } from 'pinia';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import type { ModalState } from '../types';

/** Maps external modal identifiers to state property keys */
const MODAL_KEY_MAP: Record<string, keyof ModalState> = {
  'new-ascii': 'newAscii',
  'edit-ascii': 'editAscii',
  'paste-ascii': 'pasteAscii',
  'options': 'options',
  'overlay': 'overlay',
  'about': 'about',
  'help': 'help',
  'border-generator': 'borderGenerator',
};

export const useModalStore = defineStore('modal', {
  state: () => ({
    modalState: {
      newAscii: false,
      editAscii: false,
      pasteAscii: false,
      options: false,
      overlay: false,
      about: false,
      help: false,
      borderGenerator: false,
    } as ModalState,
    isKeyboardDisabled: false,
  }),

  getters: {
    isModalOpen: (state): boolean => {
      const keys = Object.keys(
        state.modalState,
      ) as (keyof ModalState)[];
      return keys.some(key => state.modalState[key]);
    },
  },

  actions: {
    openModal(type: string) {
      const key = MODAL_KEY_MAP[type];
      if (key) this.modalState[key] = true;
    },
    closeModal(type: string) {
      const key = MODAL_KEY_MAP[type];
      if (key) this.modalState[key] = false;
    },
    toggleDisableKeyboard(payload: boolean | null = null) {
      this.isKeyboardDisabled =
        payload === null
          ? !this.isKeyboardDisabled
          : payload;
    },
  },

  persist: {
    key: 'asciibird-modal',
    storage: idbPersistAdapter,
    pick: ['isKeyboardDisabled'],
  },
});
