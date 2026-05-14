<template>
  <ABModal
    :open="showModal"
    @close="close"
    title="Find and Replace"
  >
    <div class="space-y-3">
      <!-- Search section -->
      <div class="text-xs text-on-surface-variant font-label-mono uppercase tracking-wider">
        Find
      </div>

      <!-- Character search -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="searchCharEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            Character
          </span>
        </label>
        <div class="flex items-center gap-2">
          <input
            type="text"
            class="ab-input flex-1"
            v-model="searchChar"
            :disabled="!searchCharEnabled"
            placeholder="Character or pattern"
          >
          <button
            type="button"
            :class="useRegex
              ? 'ab-button-active text-xs px-2 py-1'
              : 'ab-button text-xs px-2 py-1'"
            @click="useRegex = !useRegex"
            :disabled="!searchCharEnabled"
          >
            .*
          </button>
        </div>
      </div>

      <!-- Foreground color search -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="searchFgEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            FG Color
          </span>
        </label>
        <input
          type="number"
          class="ab-input w-20"
          v-model.number="searchFg"
          min="0"
          max="98"
          :disabled="!searchFgEnabled"
        >
      </div>

      <!-- Background color search -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="searchBgEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            BG Color
          </span>
        </label>
        <input
          type="number"
          class="ab-input w-20"
          v-model.number="searchBg"
          min="0"
          max="98"
          :disabled="!searchBgEnabled"
        >
      </div>

      <!-- Error message for invalid regex -->
      <div
        v-if="regexError"
        class="text-xs text-error font-label-mono"
      >
        Invalid regex: {{ regexError }}
      </div>

      <!-- Match counter -->
      <div
        v-if="matchCount >= 0"
        class="text-xs text-on-surface-variant font-label-mono"
      >
        {{ matchCount === 0
          ? 'No matches found'
          : currentMatchIndex >= 0
            ? `Match ${currentMatchIndex + 1} of ${matchCount}`
            : `${matchCount} matches found`
        }}
      </div>

      <!-- Replace section -->
      <div class="text-xs text-on-surface-variant font-label-mono uppercase tracking-wider mt-2">
        Replace
      </div>

      <!-- Replace character -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="replaceCharEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            Character
          </span>
        </label>
        <input
          type="text"
          class="ab-input flex-1"
          v-model="replaceChar"
          :disabled="!replaceCharEnabled"
          placeholder="Replacement char"
        >
      </div>

      <!-- Replace FG -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="replaceFgEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            FG Color
          </span>
        </label>
        <input
          type="number"
          class="ab-input w-20"
          v-model.number="replaceFg"
          min="0"
          max="98"
          :disabled="!replaceFgEnabled"
        >
      </div>

      <!-- Replace BG -->
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center">
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="replaceBgEnabled"
            class="ab-checkbox"
          >
          <span class="text-on-surface-variant font-label-mono">
            BG Color
          </span>
        </label>
        <input
          type="number"
          class="ab-input w-20"
          v-model.number="replaceBg"
          min="0"
          max="98"
          :disabled="!replaceBgEnabled"
        >
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <button
            type="button"
            class="ab-button inline-flex items-center gap-1"
            @click="findPrev"
            :disabled="matchCount === 0"
          >
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >navigate_before</span>
            Prev
          </button>
          <button
            type="button"
            class="ab-button inline-flex items-center gap-1"
            @click="findNext"
            :disabled="matchCount === 0"
          >
            Next
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >navigate_next</span>
          </button>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="ab-button"
            @click="findMatches"
          >
            Find
          </button>
          <button
            type="button"
            class="ab-button inline-flex items-center gap-1"
            @click="replaceCurrent"
            :disabled="matchCount === 0 || !hasReplace"
          >
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >find_replace</span>
            Replace
          </button>
          <button
            type="button"
            class="ab-button inline-flex items-center gap-1"
            @click="replaceAll"
            :disabled="matchCount === 0 || !hasReplace"
          >
            Replace All
          </button>
        </div>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ABModal from '../ABModal.vue';
import { useModalStore } from '../../store/modal';
import { useAsciiBirdStore } from '../../store';
import { useDialog } from '../../composables/useDialog';
import { useToast } from '../../composables/useToast';
import type { FindCriteria, ReplaceSpec, MatchPosition } from '../../types';

defineOptions({ name: 'FindReplace' });

const modalStore = useModalStore();
const store = useAsciiBirdStore();
const { confirm: dialogConfirm } = useDialog();
const { show: toastShow } = useToast();

const showModal = computed(() => modalStore.modalState.findReplace);

// Search criteria
const searchCharEnabled = ref(false);
const searchChar = ref('');
const searchFgEnabled = ref(false);
const searchFg = ref(0);
const searchBgEnabled = ref(false);
const searchBg = ref(0);
const useRegex = ref(false);

// Replace criteria
const replaceCharEnabled = ref(false);
const replaceChar = ref('');
const replaceFgEnabled = ref(false);
const replaceFg = ref(0);
const replaceBgEnabled = ref(false);
const replaceBg = ref(0);

// Match state
const matches = ref<MatchPosition[]>([]);
const currentMatchIndex = ref(-1);
const matchCount = ref(-1); // -1 = not searched yet
const regexError = ref('');

const hasReplace = computed(() =>
  replaceCharEnabled.value
  || replaceFgEnabled.value
  || replaceBgEnabled.value,
);

// Build search criteria from UI state
function buildCriteria(): FindCriteria {
  const criteria: FindCriteria = {};
  if (searchCharEnabled.value && searchChar.value !== '') {
    criteria.char = searchChar.value;
    criteria.useRegex = useRegex.value;
  }
  if (searchFgEnabled.value) {
    criteria.fg = searchFg.value;
  }
  if (searchBgEnabled.value) {
    criteria.bg = searchBg.value;
  }
  return criteria;
}

// Build replacement spec from UI state
function buildReplacement(): ReplaceSpec {
  const spec: ReplaceSpec = {};
  if (replaceCharEnabled.value) {
    spec.char = replaceChar.value;
  }
  if (replaceFgEnabled.value) {
    spec.fg = replaceFg.value;
  }
  if (replaceBgEnabled.value) {
    spec.bg = replaceBg.value;
  }
  return spec;
}

// Get current layer blocks
function getCurrentBlocks() {
  const layers = store.currentAsciiLayers;
  const meta = store.currentAscii;
  if (!meta || !layers || !layers[meta.selectedLayer]) return null;
  return layers[meta.selectedLayer].data;
}

// Dispatch match positions for highlighting
function dispatchMatchHighlight() {
  window.dispatchEvent(new CustomEvent('asciibird:find-matches', {
    detail: {
      matches: matches.value,
      currentIndex: currentMatchIndex.value,
    },
  }));
}

function findMatches() {
  const criteria = buildCriteria();
  if (!criteria.char && criteria.fg === undefined
    && criteria.bg === undefined) {
    matchCount.value = -1;
    matches.value = [];
    currentMatchIndex.value = -1;
    regexError.value = '';
    dispatchMatchHighlight();
    return;
  }

  const blocks = getCurrentBlocks();
  if (!blocks) {
    matchCount.value = 0;
    matches.value = [];
    currentMatchIndex.value = -1;
    dispatchMatchHighlight();
    return;
  }

  const errorOut: { error?: { message: string; pattern: string } } = {};

  // Use the store action to find (no replacement)
  const result = store.findReplaceAction({
    criteria,
    errorOut,
  });

  if (errorOut.error) {
    regexError.value = errorOut.error.message;
    matchCount.value = 0;
    matches.value = [];
    currentMatchIndex.value = -1;
    dispatchMatchHighlight();
    return;
  }

  regexError.value = '';
  matches.value = result.matches;
  matchCount.value = result.matches.length;
  currentMatchIndex.value = result.matches.length > 0 ? 0 : -1;

  // Scroll to first match
  if (matches.value.length > 0) {
    scrollToMatch(0);
  }

  dispatchMatchHighlight();
}

function findNext() {
  if (matches.value.length === 0) return;
  currentMatchIndex.value = (currentMatchIndex.value + 1)
    % matches.value.length;
  scrollToMatch(currentMatchIndex.value);
  dispatchMatchHighlight();
}

function findPrev() {
  if (matches.value.length === 0) return;
  currentMatchIndex.value = currentMatchIndex.value <= 0
    ? matches.value.length - 1
    : currentMatchIndex.value - 1;
  scrollToMatch(currentMatchIndex.value);
  dispatchMatchHighlight();
}

function scrollToMatch(index: number) {
  const match = matches.value[index];
  if (!match) return;
  // Dispatch event for Editor to scroll to position
  window.dispatchEvent(new CustomEvent('asciibird:scroll-to', {
    detail: { x: match.x, y: match.y },
  }));
}

function replaceCurrent() {
  if (matches.value.length === 0 || currentMatchIndex.value < 0) return;

  const criteria = buildCriteria();
  const replacement = buildReplacement();
  const currentMatch = matches.value[currentMatchIndex.value];

  const result = store.findReplaceAction({
    criteria,
    replacement,
    scope: [currentMatch],
  });

  if (result.replaced > 0) {
    toastShow('Replaced 1 match', { type: 'success' });
  }

  // Re-find to update match list
  findMatches();
}

async function replaceAll() {
  if (matches.value.length === 0) return;

  const result = await dialogConfirm({
    title: 'Replace All?',
    text: `Replace ${matches.value.length} matches? This can be undone with Ctrl+Z.`,
  });

  if (!result.isOk) return;

  const criteria = buildCriteria();
  const replacement = buildReplacement();

  const replaceResult = store.findReplaceAction({
    criteria,
    replacement,
    scope: matches.value,
  });

  if (replaceResult.replaced > 0) {
    toastShow(
      `Replaced ${replaceResult.replaced} matches`,
      { type: 'success' },
    );
  }

  // Re-find to update match list
  findMatches();
}

function close() {
  // Clear match state on close
  matches.value = [];
  currentMatchIndex.value = -1;
  matchCount.value = -1;
  regexError.value = '';
  dispatchMatchHighlight();
  modalStore.closeModal('find-replace');
}

// Clear matches when search criteria change
watch(
  [searchChar, searchFg, searchBg, searchCharEnabled,
    searchFgEnabled, searchBgEnabled, useRegex],
  () => {
    matches.value = [];
    currentMatchIndex.value = -1;
    matchCount.value = -1;
    regexError.value = '';
    dispatchMatchHighlight();
  },
);
</script>
