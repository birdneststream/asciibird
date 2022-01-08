<template>
  <t-modal
    name="paste-ascii-modal"
    header="Import from Clipboard"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'paste-ascii')"
  >
    Title
    <t-input type="text" name="title" v-model="title" max="128" />

    <t-textarea v-model="pasteContent" name="paste-ascii" rows="10" />

    <template v-slot:footer>
      <div class="flex justify-between">
        <t-button
          type="button"
          class="ab-button"
          @click="$store.commit('closeModal', 'paste-ascii')"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span> Cancel
        </t-button>
        <t-button
          type="button"
          class="ab-button"
          @click="importPasteAscii()"
          :disabled="checkPasteContent"
        >
          <span class="material-icons relative top-2 pb-4">save</span> Import Clipboard
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
//
import { parseMircAscii } from "../../ascii";

export default {
  name: "PasteAsciiModal",
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
      this.$modal.show("paste-ascii-modal");
    },
    close() {
      this.pasteContent = "";
      this.title = "clipboard.txt";
      this.$modal.hide("paste-ascii-modal");
    },
    async importPasteAscii() {
      await parseMircAscii(this.pasteContent, this.title);
      this.close();
    },
  },
};
</script>
