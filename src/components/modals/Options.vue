<template>
  <t-modal
    name="options-modal"
    header="ASCIIBIRD Options"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'options')"
  >


    <template v-slot:default>

        <div>

            <ul>
                <li> Redraw canvas speed? </li>
                <li>Render blocks off screen</li>

                <li>Undo history?</li>


                <div class="mt-3 p-2 bg-red-300 rounded-md cursor-pointer" @click="clearCache()">Clear and Reset ASCIIBIRD</div>
            </ul>
        </div>

    </template>



    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'options')"
      >
        <t-button
          type="button"
          class="p-2"
        >
          Cancel
        </t-button>
        <t-button
          type="button"
          class="p-2"
          @click="initiateNewAscii()"
        >
          Ok
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>

export default {
  name: "Options",
  created() {},
  mounted() {
    if (this.showOptionsModal) {
      this.open()
    } else {
      this.close()
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
    showOptionsModal() {
      return this.$store.getters.modalState.options;
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
      this.forms.createAscii.title = `New ASCII ${
        this.$store.getters.asciibirdMeta.length + 1
      }`;
    },
    close() {
      this.$modal.hide("options-modal");
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = "New ASCII";
    },
    clearCache() {
      localStorage.clear();
      window.location.reload()
    },
  },
};
</script>
