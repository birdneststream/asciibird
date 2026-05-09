// Clipboard composable — replaces vue-clipboard2 $copyText
import { useClipboard as useVueUseClipboard } from '@vueuse/core';

export function useClipboard() {
  const { copy, copied } = useVueUseClipboard();

  const copyText = (text: string): Promise<void> => {
    return copy(text);
  };

  return { copyText, copied };
}
