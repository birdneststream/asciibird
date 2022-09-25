<template>
  <t-modal
    name="overlay-modal"
    header="ASCIIBIRD Nance Trace Mode"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'overlay')"
  >
    <template v-slot:default>
      <!--Card-->
      <div>
        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textarea"
            >
              URL
            </label>
          </div>
          <div class="md:w-2/3">
            <t-input
              type="text"
              name="url"
              v-model="imageOverlay.url"
            />

            <p class="py-2 text-sm text-gray-600">
              Note: ASCIIBIRD only supports URL images
            </p>
          </div>
        </div>

        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Visibility
            </label>
          </div>
          <div class="md:w-1/3">
            <label class="ml-1 w-1/3">
              <t-checkbox
                class="form-checkbox m-1"
                name="visible"
                v-model="imageOverlay.visible"
              />
              <span class="text-sm">Visible</span>
            </label>
          </div>
        </div>


        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Overlay Transparency
            </label>
          </div>
          <div class="md:w-1/2">
            <vue-slider
              class="m-1"
              v-model="imageOverlay.opacity"
              :min="1"
              :max="100"
            />
          </div>
        </div>

        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              ASCII Transparency
            </label>
          </div>
          <div class="md:w-1/2">
            <vue-slider
              class="m-1"
              v-model="imageOverlay.asciiOpacity"
              :min="1"
              :max="100"
            />
          </div>
        </div>

        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Image Scale
            </label>
          </div>
          <div class="md:w-1/2">
            <vue-slider
              class="m-1"
              v-model="imageOverlay.size"
              :min="10"
              :max="100"
            />
          </div>
        </div>


        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Left
            </label>
          </div>
          <div class="md:w-1/2">
            <vue-slider
              class="m-1"
              v-model="imageOverlay.left"
              :min="-100"
              :max="100"
            />
          </div>
        </div>

        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Top
            </label>
          </div>
          <div class="md:w-1/2">
            <vue-slider
              class="m-1"
              v-model="imageOverlay.top"
              :min="-100"
              :max="100"
            />
          </div>
        </div>


        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Fit To
            </label>
          </div>
          <div class="md:w-1/2">
            <label class="items-center">
              <t-radio
                name="options"
                :value="true"
                v-model="imageOverlay.stretched"
              />
              <span class="ml-2 text-sm">ASCII</span>
            </label>
            <label class="items-center ml-2">
              <t-radio
                name="options"
                :value="false"
                v-model="imageOverlay.stretched"
              />
              <span class="ml-2 text-sm">Image Size</span>
            </label>
          </div>
        </div>



        <div class="md:flex mb-6">
          <div class="md:w-1/3">
            <label
              class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
              for="my-textfield"
            >
              Repeat
            </label>
          </div>
          <div class="md:w-1/2">
            <label class="ml-1 w-1/3">
              <t-checkbox
                class="form-checkbox m-1"
                name="repeatx"
                v-model="imageOverlay.repeatx"
              />
              <span class="text-sm">X</span>
            </label>

            <label class="ml-1 w-1/3 pl-4">
              <t-checkbox
                class="form-checkbox m-1"
                name="repeatx"
                v-model="imageOverlay.repeaty"
              />
              <span class="text-sm">Y</span>
            </label>
          </div>
        </div>
      </div>
      <!--/Card-->
    </template>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'overlay')"
      >
        <t-button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span> Cancel
        </t-button>
        <t-button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">save</span> Ok
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import vueSlider from "vue-slider-component";

export default {
  name: "Overlay",
  components: {
    vueSlider,
  },
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
