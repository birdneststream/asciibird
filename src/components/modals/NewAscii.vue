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
          <t-button type="button" @click="createNewASCII()"> Ok </t-button>
        </div>
      </template>
    </t-modal>
</template>

<script>
export default {
  name: "NewAsciiModal",
  created() {},
  prop: ['showNewAsciiModal'],
  data: () => ({
    forms: {
      createAscii: {
        width: 5,
        height: 5,
        title: "ascii",
      },
    },
  }),
  watch: {
      showNewAsciiModal(val, old) {
          console.log(val, old)
          if (val === true) {
              this.createClick()
          }
      }
  },
  methods: {
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.$store.getters.asciibirdMeta.length}`;
      this.$modal.show("create-ascii-modal");
    },
    createNewASCII() {
      const payload = {
        title: this.forms.createAscii.title,
        key: this.$store.getters.asciibirdMeta.length,
        width: this.forms.createAscii.width,
        height: this.forms.createAscii.height,
        blockWidth: 8,
        blockHeight: 13,
        x: 247, // the dragable ascii canvas x
        y: 24, // the dragable ascii canvas y
        blocks: this.create2DArray(this.forms.createAscii.height),
      };

      // Push all the default ASCII blocks
      for (let x = 0; x < payload.width; x++) {
        for (let y = 0; y < payload.height; y++) {
          payload.blocks[y].push({
            bg: null,
            fg: null,
            char: null,
          });
        }
      }

      this.$store.commit("newAsciibirdMeta", payload);
      this.$modal.hide("create-ascii-modal");
      this.show = false
    },
    closeNewASCII({ params, cancel }) {
      this.forms.createAscii.width = 5;
      this.forms.createAscii.height = 5;
      this.forms.createAscii.title = "New ASCII";
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
