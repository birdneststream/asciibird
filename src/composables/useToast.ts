// Toast notification composable — replaces vue-toasted
import { ref } from 'vue';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
  duration: number;
}

const messages = ref<ToastMessage[]>([]);
let nextId = 0;

export function useToast() {
  const show = (
    text: string,
    opts: {
      type?: 'info' | 'success' | 'error';
      duration?: number;
      position?: string;
      icon?: string;
    } = {},
  ) => {
    const id = nextId++;
    const msg: ToastMessage = {
      id,
      text,
      type: opts.type || 'info',
      duration: opts.duration ?? 1200,
    };
    messages.value.push(msg);
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id);
    }, msg.duration);
  };

  return { messages, show };
}
