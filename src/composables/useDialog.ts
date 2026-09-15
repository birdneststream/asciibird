// Dialog composable — replaces $dialog.confirm/prompt from vue-tailwind
import { ref } from 'vue';
import { useModalStore } from '../store/modal';

export interface DialogOptions {
  title?: string;
  text?: string;
  icon?: string;
  inputValue?: string;
  clickToClose?: boolean;
}

export interface DialogResult {
  isOk: boolean;
  input: string;
}

interface DialogState {
  visible: boolean;
  mode: 'confirm' | 'prompt';
  title: string;
  text: string;
  icon: string;
  inputValue: string;
  resolve: ((result: DialogResult) => void) | null;
}

const state = ref<DialogState>({
  visible: false,
  mode: 'confirm',
  title: '',
  text: '',
  icon: '',
  inputValue: '',
  resolve: null,
});

export function useDialog() {
  // Suppress global shortcuts while any dialog is visible so destructive
  // confirms can't be re-triggered (e.g. Ctrl+R while "Close ASCII?" is
  // open) and canvas shortcuts don't fire underneath the dialog.
  const modalStore = useModalStore();

  const confirm = (opts: DialogOptions): Promise<DialogResult> => {
    return new Promise((resolve) => {
      modalStore.toggleDisableKeyboard(true);
      state.value = {
        visible: true,
        mode: 'confirm',
        title: opts.title || 'Confirm',
        text: opts.text || '',
        icon: opts.icon || 'info',
        inputValue: '',
        resolve,
      };
    });
  };

  const prompt = (opts: DialogOptions): Promise<DialogResult> => {
    return new Promise((resolve) => {
      modalStore.toggleDisableKeyboard(true);
      state.value = {
        visible: true,
        mode: 'prompt',
        title: opts.title || 'Input',
        text: opts.text || '',
        icon: opts.icon || 'question',
        inputValue: opts.inputValue || '',
        resolve,
      };
    });
  };

  const ok = (input?: string) => {
    const resolve = state.value.resolve;
    state.value.visible = false;
    state.value.resolve = null;
    modalStore.toggleDisableKeyboard(false);
    if (resolve) {
      resolve({ isOk: true, input: input ?? state.value.inputValue });
    }
  };

  const cancel = () => {
    const resolve = state.value.resolve;
    state.value.visible = false;
    state.value.resolve = null;
    modalStore.toggleDisableKeyboard(false);
    if (resolve) {
      resolve({ isOk: false, input: '' });
    }
  };

  return { state, confirm, prompt, ok, cancel };
}
