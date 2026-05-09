<template>
  <ABModal :open="showOptionsModal" @close="store.closeModal('options')" title="ASCIIBIRD Options">
    <div class="mt-6 lg:mt-0 rounded shadow bg-white">
      <div class="mb-4">
        <label class="ml-1">
          <span class="text-sm">FPS</span>
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.fps"
            @change="updateOptions"
            min="1"
            max="1000"
          />
        </label>
      </div>

      <div class="mb-4">
        <label class="ml-1">
          <span class="text-lg">Render Offscreen Blocks</span><br>
          <input
            type="checkbox"
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
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.brushLimit"
            @change="updateOptions"
            min="1"
            :max="maxBrushHistory"
          />
        </label>
      </div>

      <div class="mb-4">
        <label class="ml-1">
          <span class="text-sm">Undo/Redo Histroy Limit</span>
          <input
            type="range"
            class="ab-range mt-10"
            v-model="options.undoLimit"
            @change="updateOptions"
            min="1"
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

    <template #footer>
      <div
        class="flex justify-between"
        @click="store.closeModal('options')"
      >
        <button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span> Cancel
        </button>
        <button
          type="button"
          class="ab-button"
        >
          <span class="material-icons relative top-2 pb-4">save</span> Ok
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script>
import { maxBrushHistory, maxUndoHistory, tabLimit } from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import ABModal from '../ABModal.vue';

export default {
  name: "Options",
  components: {
  },
  setup() {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    return { store, toast, dialog, clipboard };
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
      return this.store.modalState.options;
    },
    options() {
      return this.store.options;
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
    },
    close() {
    },
    clearCache() {
      localStorage.clear();
      window.location.reload();
    },
    updateOptions() {
      this.store.updateOptions({ ...this.options });
    },
  },
};
</script>
