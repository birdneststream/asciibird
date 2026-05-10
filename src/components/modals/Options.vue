<template>
  <ABModal
    :open="showOptionsModal"
    @close="store.closeModal('options')"
    title="ASCIIBIRD Options"
  >
    <div class="mt-6 lg:mt-0 rounded shadow bg-white">
      <div class="mb-4">
        <label class="ml-1">
          <span class="text-sm">FPS</span>
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.fps"
            @change="updateOptions"
            min="1"
            max="1000"
          >
        </label>
      </div>

      <div class="mb-4">
        <label class="ml-1">
          <span class="text-lg">Render Offscreen Blocks</span><br>
          <input
            type="checkbox"
            class="form-checkbox m-1"
            name="renderOffScreen"
            v-model="options.renderOffScreen"
            @change="updateOptions"
          >
          <small>ASCIIBIRD will avoid rendering blocks off screen to speed things
            up.
          </small>
        </label>
      </div>

      <div class="mb-4">
        <label class="ml-1">
          <span class="text-sm">Brush History Limit</span>
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.brushLimit"
            @change="updateOptions"
            min="1"
            :max="maxBrushHistory"
          >
        </label>
      </div>

      <div class="mb-4">
        <label class="ml-1">
          <span class="text-sm">Undo/Redo History Limit</span>
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.undoLimit"
            @change="updateOptions"
            min="1"
            :max="maxUndoHistory"
          >
        </label>
      </div>

      <div class="mb-4 border-t-2">
        <label class="ml-1">
          <span class="text-lg">Reset ASCIIBIRD state</span><br>
          <small>This will clear all data and start asciibird from a fresh
            state.</small><br>
          <div
            class="mt-1 p-2 bg-red-300 rounded-md cursor-pointer"
            @click="clearCache()"
          >
            Clear and Reset ASCIIBIRD
          </div>
        </label>
      </div>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
        @click="store.closeModal('options')"
      >
        <button
          type="button"
          class="ab-button"
        >
          <span
            class="material-icons relative top-2 pb-4"
            aria-hidden="true"
          >cancel</span>
          Cancel
        </button>
        <button
          type="button"
          class="ab-button"
        >
          <span
            class="material-icons relative top-2 pb-4"
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

const store = useAsciiBirdStore();

const showOptionsModal = computed(() => store.modalState.options);
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
