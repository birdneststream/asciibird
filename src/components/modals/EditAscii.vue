<template>
  <t-modal
    name="edit-ascii-modal"
    :header="currentAsciiEditingTitle"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'edit-ascii')"
  >

      <!--Card-->
      <div>
              <div class="md:flex mb-6">
                  <div class="md:w-1/3">
                      <label class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4" for="my-textarea">
                          Title
                      </label>
                  </div>
                  <div class="md:w-2/3">
                      
                          <t-input
                            type="text"
                            name="title"
                            class="form-input block w-full focus:bg-white"
                            v-model="layer.title"
                            max="128"
                          />

                  </div>
              </div>

              <div class="md:flex mb-6">
                  <div class="md:w-1/3">
                      <label class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4" for="my-textfield">
                          Width and Height
                      </label>
                  </div>
                  <div class="md:w-1/3">
                          <t-input
                            type="number"
                            name="width"
                            class="form-input block w-full focus:bg-white"
                            v-model="layer.width"
                            min="1"
                          />
                  </div>
                  <div class="md:w-1/3">
                        <t-input
                          type="number"
                          name="height"
                          class="form-input block w-full focus:bg-white"
                          v-model="layer.height"
                          min="1"
                        />
                  </div>

              </div>

      </div>
      <!--/Card-->

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'edit-ascii')"
      >
        <t-button type="button" class="ab-button"> <span class="material-icons relative top-2 pb-4">cancel</span>  Cancel </t-button>
        <t-button type="button" @click="updateAscii()" class="ab-button">
          <span class="material-icons relative top-2 pb-4">save</span>  Update
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import {
  fillNullBlocks,
} from "../../ascii";
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
      const canvasBlockHeight = Number.parseInt(this.layer.height);
      const canvasBlockWidth = Number.parseInt(this.layer.width);
      let layers = fillNullBlocks(canvasBlockHeight, canvasBlockWidth);
      this.$store.commit("changeAsciiWidthHeight", {
        width: canvasBlockWidth,
        height: canvasBlockHeight,
        layers: [...layers],
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
