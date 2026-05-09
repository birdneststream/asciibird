<template>
  <ABModal
    :open="showNewAsciiModal"
    @close="store.closeModal('new-ascii')"
    title="Create new ASCII"
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
            v-model="forms.createAscii.title"
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
            v-model="forms.createAscii.width"
            min="1"
          >
        </div>
        <div class="md:w-1/3">
          <input
            type="number"
            name="height"
            class="ab-input form-input block w-full focus:bg-white"
            v-model="forms.createAscii.height"
            min="1"
          >
        </div>
      </div>
    </div>
    <!--/Card-->

    <template #footer>
      <div
        class="flex justify-between"
      >
        <button
          type="button"
          class="ab-button"
          @click="store.closeModal('new-ascii')"
        >
          <span class="material-icons relative top-2 pb-4">cancel</span> Cancel
        </button>
        <button
          type="button"
          class="ab-button"
          @click="initiateNewAscii()"
        >
          <span class="material-icons relative top-2 pb-4">save</span>  Create
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script>
import createNewASCII from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import ABModal from '../ABModal.vue';

export default {
  name: "NewAsciiModal",
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
    if (this.showNewAsciiModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({
    forms: {
      createAscii: {
        width: 80,
        height: 30,
        title: "ascii",
      },
    },
  }),
  computed: {
    showNewAsciiModal() {
      return this.store.modalState.newAscii;
    },
  },
  watch: {
    showNewAsciiModal(val) {
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
      this.forms.createAscii.title = `New ASCII ${
        this.store.asciibirdMeta.length + 1
      }`;
    },
    close() {
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = "New ASCII";
    },
    initiateNewAscii() {
      this.store.closeModal('new-ascii');
      this.forms.createAscii.height = Number.parseInt(this.forms.createAscii.height);
      this.forms.createAscii.width = Number.parseInt(this.forms.createAscii.width);
      createNewASCII(this.forms);
    },
  },
};
</script>
