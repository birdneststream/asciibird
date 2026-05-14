<template>
  <ABModal
    :open="showHelpModal"
    @close="modalStore.closeModal('help')"
    title="ASCIIBIRD Help"
  >
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <span
        class="material-icons text-4xl text-on-surface-variant mb-4"
        aria-hidden="true"
      >menu_book</span>
      <p class="text-lg text-on-surface font-medium">
        Documentation is being updated.
      </p>
      <p class="text-base text-on-surface-variant mt-2">
        Coming soon!
      </p>
    </div>
  </ABModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../store/modal';
import ABModal from '../ABModal.vue';

const modalStore = useModalStore();

const showHelpModal = computed(() => modalStore.modalState.help);
</script>
