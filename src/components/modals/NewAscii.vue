<template>
  <ABModal
    :open="showNewAsciiModal"
    @close="modalStore.closeModal('new-ascii')"
    title="Create new ASCII"
  >
    <div>
      <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Title
        </label>
        <input
          type="text"
          name="title"
          class="ab-input"
          v-model="forms.createAscii.title"
          max="128"
        >
      </div>

      <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
        <label class="text-on-surface-variant font-label-mono">
          Width and Height
        </label>
        <div class="flex gap-sm">
          <input
            type="number"
            name="width"
            class="ab-input w-full"
            v-model="forms.createAscii.width"
            min="1"
            max="999"
          >
          <input
            type="number"
            name="height"
            class="ab-input w-full"
            v-model="forms.createAscii.height"
            min="1"
            max="999"
          >
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
      >
        <button
          type="button"
          class="ab-button inline-flex items-center gap-2"
          @click="modalStore.closeModal('new-ascii')"
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
          @click="initiateNewAscii()"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >save</span>
          Create
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { createNewAscii } from '../../ascii';
import ABModal from '../ABModal.vue';
import { useAsciiBirdStore } from '../../store';
import { useModalStore } from '../../store/modal';

const store = useAsciiBirdStore();
const modalStore = useModalStore();

const forms = reactive({
  createAscii: {
    width: 80,
    height: 30,
    title: 'ascii',
  },
});

const showNewAsciiModal = computed(() => modalStore.modalState.newAscii);

function open() {
  forms.createAscii.title = `New ASCII ${
    store.asciibirdMeta.length + 1
  }`;
}

function close() {
  forms.createAscii.width = 80;
  forms.createAscii.height = 30;
  forms.createAscii.title = 'New ASCII';
}

function initiateNewAscii() {
  modalStore.closeModal('new-ascii');
  forms.createAscii.height = Number.parseInt(
    String(forms.createAscii.height),
  );
  forms.createAscii.width = Number.parseInt(
    String(forms.createAscii.width),
  );
  createNewAscii(forms);
}

watch(showNewAsciiModal, (val) => {
  if (val) {
    open();
  } else {
    close();
  }
}, { immediate: true });

defineExpose({
  showNewAsciiModal,
  forms,
  initiateNewAscii,
  open,
  close,
});
</script>
