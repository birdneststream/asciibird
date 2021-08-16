<template>
  <t-modal
    name="edit-ascii-modal"
    :header="currentAsciiEditingTitle"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'edit-ascii')"
  >
    Width
    <t-input
      type="number"
      name="width"
      v-model="currentAsciiWidth"
      min="1"
    />

    Height
    <t-input
      type="number"
      name="height"
      v-model="currentAsciiHeight"
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

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'edit-ascii')"
      >
        <t-button type="button">
          Cancel
        </t-button>
        <t-button
          type="button"
          @click="updateAscii()"
        >
          Update
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
export default {
  name: "EditAsciiModal",
  created() {
    this.forms.editAscii = this.currentAscii;
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
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    currentSelectedLayer() {
      return this.currentAsciiLayers[this.currentAscii.selectedLayer];
    },
    currentAsciiWidth() {
      return this.currentSelectedLayer.width;
    },
    currentAsciiHeight() {
      return this.currentSelectedLayer.height;
    },
  },
  watch: {
    showEditAsciiModal(val) {
      if (val === true) {
        this.open();
      }

      if (val === false) {
        this.close();
      }
    },
  },
  methods: {
    updateAscii() {
      this.$store.commit("updateAscii", this.forms.editAscii);
      this.close();
    },
    open() {
      this.forms.editAscii = this.currentAscii;
      this.$modal.show("edit-ascii-modal");
    },
    close() {
      this.$modal.hide("edit-ascii-modal");
    },
  },
};
</script>
