<template>
  <t-modal
    name="options-modal"
    header="ASCIIBIRD Options"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'options')"
  >
    <template v-slot:default>
      <div class="mt-6 lg:mt-0 rounded shadow bg-white">
        <div class="mb-4">
          <label class="ml-1">
            <span class="text-sm">FPS</span>
            <vue-slider
              class="mt-10"
              v-model="options.fps"
              @dragend="updateOptions"
              :min="1"
              :max="1000"
            />
          </label>
        </div>

        <div class="mb-4">
          <label class="ml-1">
            <span class="text-lg">Render Offscreen Blocks</span><br>
            <t-checkbox
              class="form-checkbox m-1"
              name="renderOffScreen"
              v-model="options.renderOffScreen"
              @change="updateOptions"
            />
            <small>ASCIIBIRD will avoid rendering blocks off screen to speed things
              up.
            </small>
          </label>
        </div>

        <div class="mb-4">
          <label class="ml-1">
            <span class="text-sm">Brush Histroy Limit</span>
            <vue-slider
              class="mt-10"
              v-model="options.brushLimit"
              @dragend="updateOptions"
              :min="1"
              :max="maxBrushHistory"
            />
          </label>
        </div>

        <div class="mb-4">
          <label class="ml-1">
            <span class="text-sm">Undo/Redo Histroy Limit</span>
            <vue-slider
              class="mt-10"
              v-model="options.undoLimit"
              @dragend="updateOptions"
              :min="1"
              :max="maxUndoHistory"
            />
          </label>
        </div>

        <div class="mb-4 border-t-2">
          <label class="ml-1">
            <span class="text-lg">Reset ASCIIBIRD state</span><br>
            <small>This will clear all data and start asciibird from a fresh
              state.</small><br>
            <div
              class="mt-1 p-2 bg-red-300 rounded-md cursor-pointer"
              @click="clearCache()"
            >
              Clear and Reset ASCIIBIRD
            </div>
          </label>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'options')"
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
import { maxBrushHistory, maxUndoHistory, tabLimit } from "./../../ascii.js";

export default {
  name: "Options",
  components: {
    vueSlider,
  },
  created() {},
  mounted() {
    if (this.showOptionsModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({}),
  computed: {
    showOptionsModal() {
      return this.$store.getters.modalState.options;
    },
    options() {
      return this.$store.getters.options;
    },
    maxBrushHistory() {
      return maxBrushHistory;
    },
    maxUndoHistory() {
      return maxUndoHistory;
    },
    tabLimit() {
      return tabLimit;
    },
  },
  watch: {
    showOptionsModal(val) {
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
      this.$modal.show("options-modal");
    },
    close() {
      this.$modal.hide("options-modal");
    },
    clearCache() {
      localStorage.clear();
      window.location.reload();
    },
    updateOptions() {
      this.$store.commit("updateOptions", { ...this.options });
    },
  },
};
</script>
