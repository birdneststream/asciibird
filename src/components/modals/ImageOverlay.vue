<template>
  <ABModal
    :open="showOverlayModal"
    @close="modalStore.closeModal('overlay')"
    title="ASCIIBIRD Nance Trace Mode"
  >
    <div>
      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          URL
        </label>
        <div>
          <input
            type="text"
            name="url"
            class="ab-input"
            v-model="imageOverlay.url"
          >
          <p class="py-1 text-body-sm text-outline">
            Note: ASCIIBIRD only supports URL images
          </p>
        </div>
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Visibility
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            class="ab-checkbox"
            name="visible"
            v-model="imageOverlay.visible"
          >
          <span class="text-on-surface-variant font-label-mono">Visible</span>
        </label>
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Overlay Opacity
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="imageOverlay.opacity"
          min="1"
          max="100"
        >
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          ASCII Opacity
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="imageOverlay.asciiOpacity"
          min="1"
          max="100"
        >
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Image Scale
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="imageOverlay.size"
          min="10"
          max="100"
        >
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Left
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="imageOverlay.left"
          min="-100"
          max="100"
        >
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Top
        </label>
        <input
          type="range"
          class="ab-range"
          v-model="imageOverlay.top"
          min="-100"
          max="100"
        >
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Fit To
        </label>
        <div class="flex gap-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              class="ab-radio"
              name="fitTo"
              :value="true"
              v-model="imageOverlay.stretched"
            >
            <span class="text-on-surface-variant font-label-mono">ASCII</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              class="ab-radio"
              name="fitTo"
              :value="false"
              v-model="imageOverlay.stretched"
            >
            <span class="text-on-surface-variant font-label-mono">Image Size</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-[140px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Repeat
        </label>
        <div class="flex gap-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="ab-checkbox"
              name="repeatx"
              v-model="imageOverlay.repeatx"
            >
            <span class="text-on-surface-variant font-label-mono">X</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="ab-checkbox"
              name="repeaty"
              v-model="imageOverlay.repeaty"
            >
            <span class="text-on-surface-variant font-label-mono">Y</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
        @click="modalStore.closeModal('overlay')"
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
import { computed, watch } from 'vue';
import ABModal from '../ABModal.vue';
import { useAsciiBirdStore } from '../../store';
import { useModalStore } from '../../store/modal';

const store = useAsciiBirdStore();
const modalStore = useModalStore();

const showOverlayModal = computed(() => modalStore.modalState.overlay);
const imageOverlay = computed(() => store.imageOverlay || {});

// Deep watch: auto-save overlay changes back to store
watch(imageOverlay, () => {
  store.updateImageOverlay(imageOverlay.value);
}, { deep: true });

defineExpose({ showOverlayModal, imageOverlay });
</script>
