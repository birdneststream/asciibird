<template>
  <div id="app">
    <t-modal
      name="create-ascii-modal"
      header="Create new ASCII"
      :clickToClose=false
      :escToClose=false
      @before-closed="closeNewASCII"
    >

    <!-- Main Menu -->
    <t-input type="number" name="width" v-model="forms.createAscii.width" max="3" />
    <t-input type="number" name="height" v-model="forms.createAscii.height" max="4" />
    <t-input type="text" name="title" v-model="forms.createAscii.title" max="128" />

      <template v-slot:footer>
        <div class="flex justify-between" @click="$modal.hide('create-ascii-modal')">
          <t-button type="button">
            Cancel
          </t-button>
          <t-button type="button" @click="createNewASCII()">
            Ok
          </t-button>
        </div>
      </template>

    </t-modal>

    <h1 class="m-4 p-2">ASCIIBIRD</h1>
    <t-button @click="createClick()" class="ml-2">Add new ASCII</t-button>

    <t-button v-for="(value, key) in asciibirdMeta" v-bind:key="key" class="ml-2" @click="changeTab(key, value)">
      {{ value.title }} ({{ value.width }} / {{ value.height }})
    </t-button>

    <router-view/>

  </div>
</template>

<script>
export default {
  created() {
    this.asciibirdMeta = this.$store.state.asciibirdMeta;
  },
  name: 'Dashboard',
  data: () => ({
    forms: {
      createAscii: {
        width: 5,
        height: 5,
        title: 'ascii',
      },
    },
    formsDefault: null,
    status: {
      createNew: false,
    },
    text: 'ASCII',
    currentTab: 1,
    asciibirdMeta: [],

  }),
  // computed: {
  //   returnAsciiMetaIndex() {
  //     return this.$store.state.asciibirdMeta[this.currentTab];
  //   },
  // },
  methods: {
    createClick() {
      this.forms.createAscii.title = 'New ASCII';
      this.$modal.show('create-ascii-modal');
    },
    changeTab(key, value) {
      // Update the router title
      // if (this.$router.params.ascii !== key) {
      this.$router.replace({ name: 'editor', params: { ascii: `/${key}` } });
      // }

      // Update the tab index in vuex store
      this.$store.commit('changeTab', key);
    },
    createNewASCII() {
      const payload = {
        title: this.forms.createAscii.title,
        key: this.asciibirdMeta.length,
        width: this.forms.createAscii.width,
        height: this.forms.createAscii.height,
        blockWidth: 8,
        blockHeight: 13,
        blocks: this.create2DArray(this.forms.createAscii.height),
      };

      // Push all the default ASCII blocks
      for (let i = 0; i <= payload.width - 1; i++) {
        for (let j = 0; j <= payload.height - 1; j++) {
          payload.blocks[i].push({
            x: j,
            y: i,
            bg: '#000000',
            fg: '#FFFFFF',
            char: '*',
            bold: false,
            blinking: false,
          });
        }
      }

      this.$store.commit('newAsciibirdMeta', payload);
      this.$modal.hide('create-ascii-modal');
    },
    closeNewASCII({ params, cancel }) {
      this.forms.createAscii.width = 5;
      this.forms.createAscii.height = 5;
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
