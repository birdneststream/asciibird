<template>
  <t-modal
    name="edit-ascii-modal"
    :header="currentAsciiEditingTitle"
    :clickToClose="false"
    :escToClose="true"
  >
    Width
    <t-input
      type="number"
      name="width"
      v-model="forms.editAscii.width"
      min="1"
    />

    Height
    <t-input
      type="number"
      name="height"
      v-model="forms.editAscii.height"
      min="1"
    />

    Title
    <t-input
      type="text"
      name="title"
      v-model="forms.editAscii.title"
      max="128"
    />

    <hr class="mt-5 mb-5">

    <p>Block Size Compressed: {{ asciiStats.sizeCompressed }} </p>
    <p>Block Size Uncompressed: {{ asciiStats.sizeUncompressed }} </p>
    <p>Percent Compressed: {{ asciiStats.sizePercentage }}% </p>

    <p>Undo: {{ asciiStats.redo }} </p>
    <p>Redo: {{ asciiStats.undo }} </p>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$modal.hide('edit-ascii-modal')"
      >
        <t-button type="button"> Cancel </t-button>
        <t-button type="button" @click="updateAscii()">Update</t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
export default {
  name: "EditAsciiModal",
  created() {
      this.forms.editAscii = this.currentAscii 
  },
  data: () => ({
    forms: {
      editAscii: {
        width: 80,
        height: 30,
        title: "ascii",
      },
    },
  }),
  computed: {
    showEditAsciiModal() {
      return this.$store.getters.modalState.editAscii;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiEditingTitle() {
        return `Editing ASCII ${this.currentAscii.title}`;
    },
    currentAsciiBlocks() {
        return this.$store.getters.currentAsciiBlocks
    },
    asciiStats() {
        let compressed = (this.currentAscii.blocks.length / 1024).toFixed(2);
        let uncompressed = ( JSON.stringify(this.currentAsciiBlocks).length / 1024).toFixed(2)
        return {
            sizeCompressed: compressed + 'kb',
            sizeUncompressed: uncompressed + 'kb',
            sizePercentage: (100 - (uncompressed / compressed)).toFixed(2),
            redo: this.currentAscii.redo.length,
            history: this.currentAscii.history.length
        }
    }
  },
  watch: {
    showEditAsciiModal(val, old) {
        if (val !== old) {
            this.showEditModal();
        }

        // this.showEditModal();
    },
  },
  methods: {
    showEditModal() {
    //   this.forms.editAscii.title = `Editing ASCII ${this.currentAscii.title}`;
        this.forms.editAscii = this.currentAscii 
      this.$modal.show("edit-ascii-modal");
    },
    updateAscii() {

        this.$store.commit("updateAscii", this.forms.editAscii);
        this.$modal.hide("edit-ascii-modal");
        return
    },
  },
};
</script>
