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
        {{ detectedFormat === 'ansi' ? 'Paste ANSI ASCII' : 'Paste mIRC ASCII' }}
      </label>
      <textarea
        class="ab-input"
        v-model="pasteContent"
        name="paste-ascii"
        rows="10"
        @input="detectFormat"
      />
      <p
        v-if="detectedFormat"
        class="mt-1 text-xs text-outline font-label-mono"
      >
        Detected: {{ detectedFormat === 'ansi' ? 'ANSI' : 'mIRC' }} format
      </p>
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
import { parseAnsiAscii, isAnsiContent } from '../../utils/ansiImport';
import ABModal from '../ABModal.vue';
import { useModalStore } from '../../store/modal';

const modalStore = useModalStore();

const pasteContent = ref('');
const title = ref('clipboard.txt');
const detectedFormat = ref<'mirc' | 'ansi' | ''>('');

const showPasteAscii = computed(() => modalStore.modalState.pasteAscii);
const checkPasteContent = computed(() => !pasteContent.value.length);

function close() {
  pasteContent.value = '';
  title.value = 'clipboard.txt';
  detectedFormat.value = '';
}

function detectFormat() {
  const content = pasteContent.value;
  if (!content) {
    detectedFormat.value = '';
    return;
  }
  if (isAnsiContent(content)) {
    detectedFormat.value = 'ansi';
  } else if (content.includes('\x03')) {
    detectedFormat.value = 'mirc';
  } else {
    detectedFormat.value = 'mirc'; // default to mIRC parser
  }
}

async function importPasteAscii() {
  if (detectedFormat.value === 'ansi') {
    await parseAnsiAscii(pasteContent.value, title.value);
  } else {
    await parseMircAscii(pasteContent.value, title.value);
  }
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
  detectedFormat,
  importPasteAscii,
  close,
});
</script>
