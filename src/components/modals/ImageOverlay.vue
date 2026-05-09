<template>
  <ABModal
    :open="showOverlayModal"
    @close="store.closeModal('overlay')"
    title="ASCIIBIRD Nance Trace Mode"
  >
    <!--Card-->
    <div>
      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textarea"
          >
            URL
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            type="text"
            name="url"
            class="ab-input"
            v-model="imageOverlay.url"
          >

          <p class="py-2 text-sm text-gray-600">
            Note: ASCIIBIRD only supports URL images
          </p>
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Visibility
          </label>
        </div>
        <div class="md:w-1/3">
          <label class="ml-1 w-1/3">
            <input
              type="checkbox"
              class="form-checkbox m-1"
              name="visible"
              v-model="imageOverlay.visible"
            >
            <span class="text-sm">Visible</span>
          </label>
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Overlay Transparency
          </label>
        </div>
        <div class="md:w-1/2">
          <input
            type="range"
            class="ab-range m-1"
            v-model="imageOverlay.opacity"
            min="1"
            max="100"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            ASCII Transparency
          </label>
        </div>
        <div class="md:w-1/2">
          <input
            type="range"
            class="ab-range m-1"
            v-model="imageOverlay.asciiOpacity"
            min="1"
            max="100"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Image Scale
          </label>
        </div>
        <div class="md:w-1/2">
          <input
            type="range"
            class="ab-range m-1"
            v-model="imageOverlay.size"
            min="10"
            max="100"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Left
          </label>
        </div>
        <div class="md:w-1/2">
          <input
            type="range"
            class="ab-range m-1"
            v-model="imageOverlay.left"
            min="-100"
            max="100"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Top
          </label>
        </div>
        <div class="md:w-1/2">
          <input
            type="range"
            class="ab-range m-1"
            v-model="imageOverlay.top"
            min="-100"
            max="100"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Fit To
          </label>
        </div>
        <div class="md:w-1/2">
          <label class="items-center">
            <input
              type="radio"
              name="options"
              :value="true"
              v-model="imageOverlay.stretched"
            >
            <span class="ml-2 text-sm">ASCII</span>
          </label>
          <label class="items-center ml-2">
            <input
              type="radio"
              name="options"
              :value="false"
              v-model="imageOverlay.stretched"
            >
            <span class="ml-2 text-sm">Image Size</span>
          </label>
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Repeat
          </label>
        </div>
        <div class="md:w-1/2">
          <label class="ml-1 w-1/3">
            <input
              type="checkbox"
              class="form-checkbox m-1"
              name="repeatx"
              v-model="imageOverlay.repeatx"
            >
            <span class="text-sm">X</span>
          </label>

          <label class="ml-1 w-1/3 pl-4">
            <input
              type="checkbox"
              class="form-checkbox m-1"
              name="repeatx"
              v-model="imageOverlay.repeaty"
            >
            <span class="text-sm">Y</span>
          </label>
        </div>
      </div>
    </div>
    <!--/Card-->

    <template #footer>
      <div
        class="flex justify-between"
        @click="store.closeModal('overlay')"
      >
        <button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span>
          Cancel
        </button>
        <button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">save</span>
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

const store = useAsciiBirdStore();

const showOverlayModal = computed(() => store.modalState.overlay);
const imageOverlay = computed(() => store.imageOverlay || {});

// Deep watch: auto-save overlay changes back to store
watch(imageOverlay, () => {
  store.updateImageOverlay(imageOverlay.value);
}, { deep: true });

defineExpose({ showOverlayModal, imageOverlay });
</script>
