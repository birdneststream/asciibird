<template>
  <ABModal
    :open="showNewAsciiModal"
    @close="modalStore.closeModal('new-ascii')"
    title="Create new ASCII"
  >
    <!--Card-->
    <div>
      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textarea"
          >
            Title
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            type="text"
            name="title"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="forms.createAscii.title"
            max="128"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Width and Height
          </label>
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="width"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="forms.createAscii.width"
            min="1"
          >
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="height"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="forms.createAscii.height"
            min="1"
          >
        </div>
      </div>
    </div>
    <!--/Card-->

    <template #footer>
      <div
        class="flex justify-between"
      >
        <button
          type="button"
          class="ab-button"
          @click="modalStore.closeModal('new-ascii')"
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
          @click="initiateNewAscii()"
        >
          <span
            class="material-icons relative top-2 pb-4"
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
import createNewASCII from '../../ascii';
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
  createNewASCII(forms);
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
