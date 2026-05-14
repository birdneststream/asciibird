import { computed, ref, watch } from 'vue';
import {
  calculateMircLineBytes,
  mergeLayers,
  IRC_WARN_THRESHOLD,
  IRC_ERROR_THRESHOLD,
  type IrcLineCheck,
} from '../ascii';
import { useAsciiBirdStore } from '../store';
import type { Block } from '../types';

/** Warning level for IRC line length indicator */
export type IrcWarningLevel = 'none' | 'warn' | 'error';

/** Return type for useIrcLineWarning composable */
export interface IrcLineWarningResult {
  /** Current warning level: none, warn (yellow), error (red) */
  level: IrcWarningLevel;
  /** Maximum byte count across all lines */
  maxBytes: number;
  /** Indices of lines exceeding the error threshold */
  overLimitLines: number[];
  /** Per-line byte lengths */
  lineByteLengths: number[];
}

const EMPTY_CHECK: IrcLineCheck = {
  lineByteLengths: [],
  overLimitLines: [],
  maxBytes: 0,
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Composable that provides debounced IRC line-length warning data.
 * Watches the current tab's layer data and recalculates with 300ms debounce.
 */
export function useIrcLineWarning() {
  const store = useAsciiBirdStore();

  // Cached result updated on debounce
  const checkResult = ref<IrcLineCheck>(EMPTY_CHECK);

  // Trigger recalculation when compressed layers change
  const layersCompressed = computed(
    () => store.asciibirdMeta[store.tab]?.layers ?? '',
  );

  watch(
    layersCompressed,
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        recalculate();
      }, 300);
    },
    { immediate: true },
  );

  function recalculate() {
    if (!store.asciibirdMeta.length) {
      checkResult.value = EMPTY_CHECK;
      return;
    }

    const layers = store.currentAsciiLayers;
    if (!layers || layers.length === 0) {
      checkResult.value = EMPTY_CHECK;
      return;
    }

    const mergedBlocks: Block[][] = mergeLayers();
    checkResult.value = calculateMircLineBytes(mergedBlocks);
  }

  const result = computed<IrcLineWarningResult>(() => {
    const { lineByteLengths, overLimitLines, maxBytes } = checkResult.value;

    if (lineByteLengths.length === 0) {
      return {
        level: 'none',
        maxBytes: 0,
        overLimitLines: [],
        lineByteLengths: [],
      };
    }

    const level: IrcWarningLevel =
      maxBytes > IRC_ERROR_THRESHOLD
        ? 'error'
        : maxBytes > IRC_WARN_THRESHOLD
          ? 'warn'
          : 'none';

    return { level, maxBytes, overLimitLines, lineByteLengths };
  });

  return { ircWarning: result };
}
