<template>
  <ABModal :open="showPasteAscii" @close="store.closeModal('paste-ascii')" title="Import from Clipboard">
    Title
    <input
      type="text"
      name="title"
      class="ab-input"
      v-model="title"
      max="128"
    />

    <textarea
      class="ab-input"
      v-model="pasteContent"
      name="paste-ascii"
      rows="10"
    ></textarea>

    <template #footer>
      <div class="flex justify-between">
        <button
          type="button"
          class="ab-button"
          @click="store.closeModal('paste-ascii')"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span> Cancel
        </button>
        <button
          type="button"
          class="ab-button"
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
        >
          <span class="material-icons relative top-2 pb-4">save</span> Import Clipboard
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script>
import { parseMircAscii } from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import ABModal from '../ABModal.vue';

export default {
  name: "PasteAsciiModal",
  components: { ABModal },
  setup() {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    return { store, toast, dialog, clipboard };
  },
  created() {},
  mounted() {
    if (this.showPasteAscii) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({
    pasteContent: "",
    title: "clipboard.txt",
  }),
  computed: {
    showPasteAscii() {
      return this.store.modalState.pasteAscii;
    },
    checkPasteContent() {
      return !this.pasteContent.length;
    },
  },
  watch: {
    showPasteAscii(val, old) {
      if (val === true) {
        this.open();
      }

      if (val === false) {
        this.close();
      }
    },
  },
  methods: {
    open() {
    },
    close() {
      this.pasteContent = "";
      this.title = "clipboard.txt";
    },
    async importPasteAscii() {
      await parseMircAscii(this.pasteContent, this.title);
      this.close();
    },
  },
};
</script>
