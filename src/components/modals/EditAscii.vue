<template>
  <ABModal
    :open="showEditAsciiModal"
    @close="store.closeModal('edit-ascii')"
    :title="currentAsciiEditingTitle"
  >
    <!--Card-->
    <div>
      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textarea"
          >
            Title
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            type="text"
            name="title"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="layer.title"
            max="128"
          >
        </div>
      </div>

      <div class="md:flex mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4"
            for="my-textfield"
          >
            Width and Height
          </label>
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="width"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="layer.width"
            min="1"
          >
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="height"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="layer.height"
            min="1"
          >
        </div>
      </div>
    </div>
    <!--/Card-->

    <template #footer>
      <div
        class="flex justify-between"
        @click="store.closeModal('edit-ascii')"
      >
        <button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span>  Cancel
        </button>
        <button
          type="button"
          @click="updateAscii()"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">save</span>  Update
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script>
import {
  fillNullBlocks,
} from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import ABModal from '../ABModal.vue';

export default {
  name: "EditAsciiModal",
  components: { ABModal },
  setup() {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    return { store, toast, dialog, clipboard };
  },
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
      return this.store.modalState.editAscii;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    selectedLayerIndex() {
      return this.currentAscii.selectedLayer;
    },
    currentAsciiEditingTitle() {
      return `Editing ASCII ${this.currentAscii.title}`;
    },
    currentAsciiLayers() {
      return this.store.currentAsciiLayers;
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
      this.store.changeAsciiWidthHeight({
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
    },
    close() {
      this.layer = {};
    },
  },
};
</script>
