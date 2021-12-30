<template>
  <t-modal
    name="edit-ascii-modal"
    :header="currentAsciiEditingTitle"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'edit-ascii')"
  >
    <!-- Width
    <t-input type="number" name="width" v-model="layer.width" min="1" />

    Height
    <t-input type="number" name="height" v-model="layer.height" min="1" /> -->

    Title
    <t-input type="text" name="title" v-model="layer.title" max="128" />

    <hr class="mt-5 mb-5" />

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'edit-ascii')"
      >
        <t-button type="button" class="p-2"> Cancel </t-button>
        <t-button type="button" @click="updateAscii()" class="p-2">
          Update
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
export default {
  name: "EditAsciiModal",
  created() {},
  mounted() {
    if (this.showEditAsciiModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({
    layer: {},
  }),
  computed: {
    showEditAsciiModal() {
      return this.$store.getters.modalState.editAscii;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    selectedLayerIndex() {
      return this.currentAscii.selectedLayer;
    },
    currentAsciiEditingTitle() {
      return `Editing ASCII ${this.currentAscii.title}`;
    },
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    currentSelectedLayer() {
      return this.currentAsciiLayers[this.selectedLayerIndex];
    },
    currentAsciiWidth() {
      return this.layer.width || 0;
    },
    currentAsciiHeight() {
      return this.layer.height || 0;
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
      this.$store.commit("updateAsciiTitle", this.layer.title);
      this.$emit("updateAscii", {
        width: this.layer.width,
        height: this.layer.height,
      });
      this.close();
    },
    open() {
      this.layer = {
        width: this.currentSelectedLayer.width,
        height: this.currentSelectedLayer.height,
        title: this.currentAscii.title,
      };
      this.$modal.show("edit-ascii-modal");
    },
    close() {
      this.$modal.hide("edit-ascii-modal");
      this.layer = {};
    },
  },
};
</script>
