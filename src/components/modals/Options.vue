<template>
  <ABModal
    :open="showOptionsModal"
    @close="modalStore.closeModal('options')"
    title="ASCIIBIRD Options"
  >
    <div>
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          FPS
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="options.fps"
          @change="updateOptions"
          min="1"
          max="1000"
        >
      </div>

      <div class="mb-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            class="ab-checkbox"
            name="renderOffScreen"
            v-model="options.renderOffScreen"
            @change="updateOptions"
          >
          <span class="text-on-surface-variant font-label-mono">
            Render Offscreen Blocks
          </span>
        </label>
        <p class="mt-1 ml-6 text-on-surface-variant text-body-sm">
          ASCIIBIRD will avoid rendering blocks off screen to speed things up.
        </p>
      </div>

      <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Brush Limit
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="options.brushLimit"
          @change="updateOptions"
          min="1"
          :max="maxBrushHistory"
        >
      </div>

      <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Undo Limit
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="options.undoLimit"
          @change="updateOptions"
          min="1"
          :max="maxUndoHistory"
        >
      </div>

      <div class="mb-4 pt-4 border-t border-outline-variant">
        <label class="block mb-2">
          <span class="text-on-surface-variant font-label-mono">
            Reset ASCIIBIRD state
          </span>
        </label>
        <p class="text-on-surface-variant text-body-sm mb-2">
          This will clear all data and start asciibird from a fresh state.
        </p>
        <!-- TODO: also clear IDB stores (main + toolbar) -->
        <button
          type="button"
          class="px-3 py-2 rounded text-sm font-label-mono cursor-pointer transition-colors bg-error-container text-on-error-container hover:brightness-110"
          @click="clearCache()"
        >
          Clear and Reset ASCIIBIRD
        </button>
      </div>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
        @click="modalStore.closeModal('options')"
      >
        <button
          type="button"
          class="ab-button inline-flex items-center gap-2"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >cancel</span>
          Cancel
        </button>
        <button
          type="button"
          class="ab-button inline-flex items-center gap-2"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >save</span>
          Ok
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { maxBrushHistory, maxUndoHistory, tabLimit } from '../../ascii';
import ABModal from '../ABModal.vue';
import { useAsciiBirdStore } from '../../store';
import { useModalStore } from '../../store/modal';

const store = useAsciiBirdStore();
const modalStore = useModalStore();

const showOptionsModal = computed(() => modalStore.modalState.options);
const options = computed(() => store.options);

function clearCache() {
  localStorage.clear();
  window.location.reload();
}

function updateOptions() {
  store.updateOptions({ ...options.value });
}

defineExpose({
  showOptionsModal,
  options,
  maxBrushHistory,
  maxUndoHistory,
  tabLimit,
  clearCache,
  updateOptions,
});
</script>
