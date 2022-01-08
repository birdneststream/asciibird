<template>
  <t-modal
    name="new-ascii-modal"
    header="Create new ASCII"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'new-ascii')"
  >

      <!--Card-->
      <div>
              <div class="md:flex mb-6">
                  <div class="md:w-1/3">
                      <label class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4" for="my-textarea">
                          Title
                      </label>
                  </div>
                  <div class="md:w-2/3">
                      
                          <t-input
                            type="text"
                            name="title"
                            class="form-input block w-full focus:bg-white"
                            v-model="forms.createAscii.title"
                            max="128"
                          />

                  </div>
              </div>

              <div class="md:flex mb-6">
                  <div class="md:w-1/3">
                      <label class="block text-gray-600 font-bold md:text-left mb-3 md:mb-0 pr-4" for="my-textfield">
                          Width and Height
                      </label>
                  </div>
                  <div class="md:w-1/3">
                          <t-input
                            type="number"
                            name="width"
                            class="form-input block w-full focus:bg-white"
                            v-model="forms.createAscii.width"
                            min="1"
                          />
                  </div>
                  <div class="md:w-1/3">
                        <t-input
                          type="number"
                          name="height"
                          class="form-input block w-full focus:bg-white"
                          v-model="forms.createAscii.height"
                          min="1"
                        />
                  </div>

              </div>

      </div>
      <!--/Card-->

    <template v-slot:footer>
      <div
        class="flex justify-between"
        
      >
        <t-button type="button" class="ab-button" @click="$store.commit('closeModal', 'new-ascii')"> <span class="material-icons relative top-2 pb-4">cancel</span> Cancel </t-button>
        <t-button type="button" class="ab-button" @click="initiateNewAscii()">
          <span class="material-icons relative top-2 pb-4">save</span>  Create
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import createNewASCII from "../../ascii";

export default {
  name: "NewAsciiModal",
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
      
      this.$modal.show("new-ascii-modal");
      this.forms.createAscii.title = `New ASCII ${
        this.$store.getters.asciibirdMeta.length + 1
      }`;
    },
    close() {
      this.$modal.hide("new-ascii-modal");
      this.forms.createAscii.width = 80;
      this.forms.createAscii.height = 30;
      this.forms.createAscii.title = "New ASCII";
    },
    initiateNewAscii() {
      this.$store.commit('closeModal', 'new-ascii')
      this.forms.createAscii.height = Number.parseInt(this.forms.createAscii.height)
      this.forms.createAscii.width = Number.parseInt(this.forms.createAscii.width)
      createNewASCII(this.forms);
    },
  },
};
</script>
