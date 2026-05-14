// Modal store — manages modal visibility and keyboard state
// Extracted from monolithic useAsciiBirdStore for separation of concerns

import { defineStore } from 'pinia';
import { idbPersistAdapter } from '../utils/idbPersistAdapter';
import type { ModalState } from '../types';

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
      switch (type) {
        case 'new-ascii':
          this.modalState.newAscii = true;
          break;
        case 'edit-ascii':
          this.modalState.editAscii = true;
          break;
        case 'paste-ascii':
          this.modalState.pasteAscii = true;
          break;
        case 'options':
          this.modalState.options = true;
          break;
        case 'overlay':
          this.modalState.overlay = true;
          break;
        case 'about':
          this.modalState.about = true;
          break;
        case 'help':
          this.modalState.help = true;
          break;
      }
    },
    closeModal(type: string) {
      switch (type) {
        case 'new-ascii':
          this.modalState.newAscii = false;
          break;
        case 'edit-ascii':
          this.modalState.editAscii = false;
          break;
        case 'paste-ascii':
          this.modalState.pasteAscii = false;
          break;
        case 'options':
          this.modalState.options = false;
          break;
        case 'overlay':
          this.modalState.overlay = false;
          break;
        case 'about':
          this.modalState.about = false;
          break;
        case 'help':
          this.modalState.help = false;
          break;
      }
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
