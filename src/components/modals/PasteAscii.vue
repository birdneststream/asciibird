<template>
  <t-modal
    name="paste-ascii-modal"
    header="Import from Clipboard"
    :clickToClose="false"
    :escToClose="true"
  >
    Title
    <t-input type="text" name="title" v-model="title" max="128" />

    <t-textarea v-model="pasteContent" name="paste-ascii" rows="10" />

    <template v-slot:footer>
      <div
        class="flex justify-between"
      >
        <t-button type="button"> Cancel </t-button>
        <t-button
          type="button"
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
          >Import Clipboard</t-button
        >
      </div>
    </template>
  </t-modal>
</template>

<script>
//
import { parseMircAscii } from "../../ascii.js";

export default {
  name: "PasteAsciiModal",
  created() {},
  data: () => ({
    pasteContent: "",
    title: "clipboard.txt",
  }),
  computed: {
    showPasteModal() {
      return this.$store.getters.modalState.pasteModal;
    },
    checkPasteContent() {
      return !this.pasteContent.length ? true : false;
    },
  },
  watch: {
    showPasteModal(val, old) {
      if (val !== old) {
        this.pasteModal();
      }
    },
  },
  methods: {
    pasteModal() {
        this.$modal.show("paste-ascii-modal")
    },
    importPasteAscii() {
      parseMircAscii(this.pasteContent, this.title);     
      this.pasteContent = "";
      this.title = "clipboard.txt";
      this.$modal.hide("paste-ascii-modal");
    },
  },
};
</script>
