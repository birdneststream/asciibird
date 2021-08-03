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
      <div
        class="flex justify-between"
        @click="$modal.hide('create-ascii-modal')"
      >
        <t-button type="button"> Cancel </t-button>
        <t-button type="button" @click="initiateNewAscii()"> Ok </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import createNewASCII from "./../../ascii.js" 

export default {
  name: "NewAsciiModal",
  created() {},
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
      return this.$store.getters.modalState.newAscii;
    },
  },
  watch: {
    showNewAsciiModal(val, old) {
      this.createClick()
    },
  },
  methods: {
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.$store.getters.asciibirdMeta.length+1}`;
      this.$modal.show("create-ascii-modal");
    },
    initiateNewAscii() {
      createNewASCII(this.forms);
      this.$modal.hide("create-ascii-modal");
    },
    closeNewASCII({ params, cancel }) {
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = "New ASCII";
    },

  },
};
</script>
