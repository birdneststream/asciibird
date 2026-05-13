<template>
  <ABModal
    :open="showEditAsciiModal"
    @close="modalStore.closeModal('edit-ascii')"
    :title="currentAsciiEditingTitle"
  >
    <!--Card-->
    <div>
      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block font-bold md:text-left mb-3 md:mb-0 pr-4 text-on-surface-variant"
            for="my-textarea"
          >
            Title
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            type="text"
            name="title"
            class="ab-input block w-full"
            v-model="layer.title"
            max="128"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block font-bold md:text-left mb-3 md:mb-0 pr-4 text-on-surface-variant"
            for="my-textfield"
          >
            Width and Height
          </label>
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="width"
            class="ab-input block w-full"
            v-model="layer.width"
            min="1"
          >
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="height"
            class="ab-input block w-full"
            v-model="layer.height"
            min="1"
          >
        </div>
      </div>
    </div>
    <!--/Card-->

    <template #footer>
      <div class="flex justify-between">
        <button
          type="button"
          class="ab-button"
          @click="modalStore.closeModal('edit-ascii')"
        >
          <span
            class="material-icons relative top-2 pb-4"
            aria-hidden="true"
          >cancel</span>
          Cancel
        </button>
        <button
          type="button"
          @click.stop="updateAscii()"
          class="ab-button"
        >
          <span
            class="material-icons relative top-2 pb-4"
            aria-hidden="true"
          >save</span>
          Update
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { fillNullBlocks } from '../../ascii';
import ABModal from '../ABModal.vue';
import { useAsciiBirdStore } from '../../store';
import { useModalStore } from '../../store/modal';
import { useToast } from '../../composables/useToast';

const store = useAsciiBirdStore();
const modalStore = useModalStore();
const { show: toastShow } = useToast();

const layer = ref<{ width: number; height: number; title: string }>({
  width: 0,
  height: 0,
  title: '',
});

const showEditAsciiModal = computed(() => modalStore.modalState.editAscii);
const currentAscii = computed(() => store.currentAscii);
const selectedLayerIndex = computed(() => currentAscii.value.selectedLayer || 0);
const currentAsciiEditingTitle = computed(() => `Editing ASCII ${currentAscii.value.title}`);
const currentAsciiLayers = computed(() => store.currentAsciiLayers);
const currentSelectedLayer = computed(
  () => currentAsciiLayers.value[selectedLayerIndex.value],
);

function open() {
  const selected = currentSelectedLayer.value;
  if (!selected || !selected.width || !selected.height) {
    toastShow('No valid layer selected. Please create or select a layer first.', {
      type: 'error',
    });
    modalStore.closeModal('edit-ascii');
    return;
  }

  layer.value = {
    width: selected.width,
    height: selected.height,
    title: currentAscii.value.title || '',
  };
}

function close() {
  layer.value = { width: 0, height: 0, title: '' };
}

function updateAscii() {
  const canvasBlockHeight = Number.parseInt(String(layer.value.height));
  const canvasBlockWidth = Number.parseInt(String(layer.value.width));

  if (
    Number.isNaN(canvasBlockHeight) ||
    Number.isNaN(canvasBlockWidth) ||
    canvasBlockHeight < 1 ||
    canvasBlockWidth < 1
  ) {
    toastShow('Width and height must be positive numbers.', {
      type: 'error',
    });
    return;
  }

  const layers = fillNullBlocks(canvasBlockHeight, canvasBlockWidth);
  store.changeAsciiWidthHeight({ layers: [...layers] });

  if (layer.value.title && layer.value.title !== currentAscii.value.title) {
    store.updateAsciiTitle(layer.value.title);
  }

  close();
}

watch(showEditAsciiModal, (val) => {
  if (val) {
    open();
  } else {
    close();
  }
}, { immediate: true });

const currentAsciiWidth = computed(() => layer.value.width || 0);
const currentAsciiHeight = computed(() => layer.value.height || 0);

defineExpose({
  showEditAsciiModal,
  layer,
  currentAsciiEditingTitle,
  currentAscii,
  selectedLayerIndex,
  currentAsciiLayers,
  currentSelectedLayer,
  currentAsciiWidth,
  currentAsciiHeight,
  updateAscii,
  open,
  close,
});
</script>
