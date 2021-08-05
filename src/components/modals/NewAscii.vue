<template>
  <t-modal
    name="new-ascii-modal"
    header="Create new ASCII"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'new-ascii')"
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
        @click="$store.commit('closeModal', 'new-ascii')"
      >
        <t-button type="button">
          Cancel
        </t-button>
        <t-button
          type="button"
          @click="initiateNewAscii()"
        >
          Ok
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import createNewASCII from '../../ascii';

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
      this.$modal.show('new-ascii-modal');
      this.forms.createAscii.title = `New ASCII ${this.$store.getters.asciibirdMeta.length + 1}`;
    },
    close() {
      this.$modal.hide('new-ascii-modal');
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = 'New ASCII';
    },
    initiateNewAscii() {
      createNewASCII(this.forms);      
    },
  },
};
</script>
