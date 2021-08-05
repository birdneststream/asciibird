<template>
  <t-modal
    name="paste-ascii-modal"
    header="Import from Clipboard"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'paste-ascii')"
  >
    Title
    <t-input
      type="text"
      name="title"
      v-model="title"
      max="128"
    />

    <t-textarea
      v-model="pasteContent"
      name="paste-ascii"
      rows="10"
    />

    <template v-slot:footer>
      <div
        class="flex justify-between"
      >
        <t-button 
          type="button"
          @click="$store.commit('closeModal', 'paste-ascii')">
          Cancel
        </t-button>
        <t-button
          type="button"
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
        >
          Import Clipboard
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
//
import { parseMircAscii } from '../../ascii';

export default {
  name: 'PasteAsciiModal',
  created() {},
  data: () => ({
    pasteContent: '',
    title: 'clipboard.txt',
  }),
  computed: {
    showPasteAscii() {
      return this.$store.getters.modalState.pasteAscii;
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
      this.$modal.show('paste-ascii-modal');
      // this.$store.commit('openModal', 'paste-ascii')
    },
    close() {
      console.log("close")
      this.pasteContent = '';
      this.title = 'clipboard.txt';
      this.$modal.hide('paste-ascii-modal');
      
    },
    importPasteAscii() {
      parseMircAscii(this.pasteContent, this.title);     
      this.close()
    },
  },
};
</script>
