<template>
  <ABModal
    :open="showPasteAscii"
    @close="modalStore.closeModal('paste-ascii')"
    title="Import from Clipboard"
  >
    <div class="grid grid-cols-[120px_1fr] gap-sm items-center mb-4">
      <label class="text-on-surface-variant font-label-mono">
        Title
      </label>
      <input
        type="text"
        name="title"
        class="ab-input"
        v-model="title"
        max="128"
      >
    </div>

    <div class="mb-2">
      <label class="block text-on-surface-variant font-label-mono mb-1">
        Paste mIRC ASCII
      </label>
      <textarea
        class="ab-input"
        v-model="pasteContent"
        name="paste-ascii"
        rows="10"
      />
    </div>

    <template #footer>
      <div class="flex justify-between">
        <button
          type="button"
          class="ab-button inline-flex items-center gap-2"
          @click="modalStore.closeModal('paste-ascii')"
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
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >save</span>
          Import Clipboard
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { parseMircAscii } from '../../ascii';
import ABModal from '../ABModal.vue';
import { useModalStore } from '../../store/modal';

const modalStore = useModalStore();

const pasteContent = ref('');
const title = ref('clipboard.txt');

const showPasteAscii = computed(() => modalStore.modalState.pasteAscii);
const checkPasteContent = computed(() => !pasteContent.value.length);

function close() {
  pasteContent.value = '';
  title.value = 'clipboard.txt';
}

async function importPasteAscii() {
  await parseMircAscii(pasteContent.value, title.value);
  close();
}

watch(showPasteAscii, (val) => {
  if (!val) {
    close();
  }
});

defineExpose({
  showPasteAscii,
  pasteContent,
  title,
  checkPasteContent,
  importPasteAscii,
  close,
});
</script>
