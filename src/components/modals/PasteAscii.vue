<template>
  <ABModal
    :open="showPasteAscii"
    @close="store.closeModal('paste-ascii')"
    title="Import from Clipboard"
  >
    Title
    <input
      type="text"
      name="title"
      class="ab-input"
      v-model="title"
      max="128"
    >

    <textarea
      class="ab-input"
      v-model="pasteContent"
      name="paste-ascii"
      rows="10"
    />

    <template #footer>
      <div class="flex justify-between">
        <button
          type="button"
          class="ab-button"
          @click="store.closeModal('paste-ascii')"
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
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
        >
          <span
            class="material-icons relative top-2 pb-4"
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
import { useAsciiBirdStore } from '../../store';

const store = useAsciiBirdStore();

const pasteContent = ref('');
const title = ref('clipboard.txt');

const showPasteAscii = computed(() => store.modalState.pasteAscii);
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
