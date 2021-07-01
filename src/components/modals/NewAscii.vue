<template>
  <t-modal
    name="create-ascii-modal"
    header="Create new ASCII"
    :clickToClose="false"
    :escToClose="true"
    @before-closed="closeNewASCII"
  >
    Width
    <t-input
      type="number"
      name="width"
      v-model="forms.createAscii.width"
      min="1"
    />

    Height
    <t-input
      type="number"
      name="height"
      v-model="forms.createAscii.height"
      min="1"
    />

    Title
    <t-input
      type="text"
      name="title"
      v-model="forms.createAscii.title"
      max="128"
    />

    <template v-slot:footer>
      <!--
        Why do you make it so clicking anywhere in the gray box closes the modal
      -->
      <div
        class="flex justify-between"
        @click="$modal.hide('create-ascii-modal')"
      >
        <t-button type="button"> Cancel </t-button>
        <t-button type="button" @click="createNewASCII()"> Ok </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import LZString from 'lz-string';

export default {
  name: 'NewAsciiModal',
  created() {},
  data: () => ({
    forms: {
      createAscii: {
        width: 80,
        height: 30,
        title: 'ascii',
      },
    },
  }),
  computed: {
    showNewAsciiModal() {
      return this.$store.getters.modalState.newAscii;
    },
  },
  watch: {
    showNewAsciiModal(val, old) {
      this.createClick();
    },
  },
  methods: {
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.$store.getters.asciibirdMeta.length + 1}`;
      this.$modal.show('create-ascii-modal');
    },
    createNewASCII() {
      const newAscii = {
        title: this.forms.createAscii.title,
        key: this.$store.getters.asciibirdMeta.length,
        width: this.forms.createAscii.width,
        height: this.forms.createAscii.height,
        blockWidth: 8,
        blockHeight: 13,
        history: [],
        redo: [],
        x: 247, // the dragable ascii canvas x
        y: 24, // the dragable ascii canvas y
        blocks: this.create2DArray(this.forms.createAscii.height),
      };

      // Push all the default ASCII blocks
      for (let x = 0; x < newAscii.width; x++) {
        for (let y = 0; y < newAscii.height; y++) {
          newAscii.blocks[y].push({
            bg: null,
            fg: null,
            char: null,
          });
        }
      }

      newAscii.blocks = LZString.compressToUTF16(JSON.stringify(newAscii.blocks));
      newAscii.history.push(newAscii.blocks);
      this.$store.commit('newAsciibirdMeta', newAscii);
      this.$store.commit('openModal', 'new-ascii');
      this.$modal.hide('create-ascii-modal');

      // To show the ASCII after importing we get the last key
      // from the asciiBirdMeta array
      const keys = this.$store.getters.asciibirdMeta
        .map((v, k) => k)
        .filter((i) => i !== undefined);

      // Set the current tab and pop the array for the last value
      this.currentTab = keys.pop();
      this.$store.commit('changeTab', this.currentTab);

      this.show = false;
    },
    closeNewASCII({ params, cancel }) {
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = 'New ASCII';
    },
    create2DArray(rows) {
      const arr = [];

      for (let i = 0; i < rows; i++) {
        arr[i] = [];
      }

      return arr;
    },
  },
};
</script>
