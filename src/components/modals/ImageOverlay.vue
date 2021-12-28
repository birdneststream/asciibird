<template>
  <t-modal
    name="overlay-modal"
    header="ASCIIBIRD Nance Trace Mode"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'overlay')"
  >
    <template v-slot:default>
      <div>
        <span class="text-sm"
          >URL <br /><small
            >Note: ASCIIBIRD only supports URL images</small
          ></span
        >

        <t-input type="text" name="url" v-model="imageOverlay.url" />
      </div>

      <div class="flex">
        <label class="ml-1 w-1/3">
          <t-checkbox
            class="form-checkbox m-1"
            name="visible"
            v-model="imageOverlay.visible"
          />
          <span class="text-sm">Visible</span>
        </label>

        <label class="ml-1 w-1/3">
          <span class="text-sm">Transparency</span>
          <t-input
            type="number"
            name="width"
            v-model="imageOverlay.opacity"
            min="1"
            max="100"
            class="m-1"
          />
        </label>

        <div class="flex">
          <label class="flex items-center">
            <t-radio
              name="options"
              :value="true"
              v-model="imageOverlay.stretched"
            />
            <span class="ml-2 text-sm">Fit to ASCII</span>
          </label>
          <label class="flex items-center ml-2">
            <t-radio
              name="options"
              :value="false"
              v-model="imageOverlay.stretched"
            />
            <span class="ml-2 text-sm">Original Size</span>
          </label>
        </div>
      </div>

      <div class="flex">
        <label class="ml-1 w-1/3">
          <t-checkbox
            class="form-checkbox m-1"
            name="repeatx"
            v-model="imageOverlay.repeatx"
          />
          <span class="text-sm">Repeat X</span>
        </label>

        <label class="ml-1 w-1/3">
          <t-checkbox
            class="form-checkbox m-1"
            name="repeatx"
            v-model="imageOverlay.repeaty"
          />
          <span class="text-sm">Repeat Y</span>
        </label>
      </div>
    </template>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'overlay')"
      >
        <t-button type="button" class="p-2"> Cancel </t-button>
        <t-button type="button" class="p-2"> Ok </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
export default {
  name: "Overlay",
  created() {},
  mounted() {
    if (this.showOverlayModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({}),
  computed: {
    showOverlayModal() {
      return this.$store.getters.modalState.overlay;
    },
    imageOverlay() {
      return this.$store.getters.imageOverlay || {};
    },
  },
  watch: {
    showOverlayModal(val) {
      if (val === true) {
        this.open();
      }

      if (val === false) {
        this.close();
      }
    },
    imageOverlay: {
      handler: function (val, old) {
        this.$store.commit("updateImageOverlay", this.imageOverlay);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      this.$modal.show("overlay-modal");
    },
    close() {
      this.$modal.hide("overlay-modal");
    },
  },
};
</script>
