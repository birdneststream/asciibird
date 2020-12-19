<template>
  <div id="app">

    <t-modal
      header="Create new ASCII"
    >

    <!-- Main Menu -->
    <input type="number" name="width" v-model="forms.createAscii.width" />
    <input type="number" name="height" v-model="forms.createAscii.height" />
    <input type="text" name="title" v-model="forms.createAscii.title" />

      <template v-slot:footer>
        <div class="flex justify-between">
          <t-button type="button">
            Cancel
          </t-button>
          <t-button type="button" @click="createNewASCII()">
            Ok
          </t-button>
        </div>
      </template>
    </t-modal>

    <t-button>Add new ASCII</t-button>

    <h1>ASCIIBIRD</h1>

    <div id="nav">
      <router-link  v-for="(value, key) in asciibirdMeta" v-bind:key="key" :to="value.title.replace(/([A-Z])([A-Z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase() "> {{ value.title }} |</router-link>
    </div>

    <router-view/>

  </div>
</template>

<script>
export default {
  created() {
    console.log('Created');
    this.asciibirdMeta = this.$store.state.asciibirdMeta;
  },
  name: 'HelloWorld',
  data: () => ({
    forms: {
      createAscii: {
        width: 80,
        height: 80,
        title: 'ascii',
      },
    },
    status: {
      createNew: false,
    },
    text: 'ASCII',
    currentTab: 0,
    asciibirdMeta: [],
  }),
  computed: {
    returnAsciiMetaIndex() {
      return this.$store.state.asciibirdMeta[this.currentTab];
    },
  },
  methods: {
    createClick() {
      this.dialog.heading = 'Create new ASCII';
      this.status.createNew = this.dialog.visible = true;
    },
    createNewASCII() {
      const payload = {
        title: this.forms.createAscii.title,
        key: this.asciibirdMeta.length + 1,
        ascii: {
          blocks: this.create2DArray(this.forms.createAscii.height),
          width: this.forms.createAscii.width,
          height: this.forms.createAscii.height,
        },
      };

      for (let i = 0; i <= payload.ascii.width - 1; i++) {
        for (let j = 0; j <= payload.ascii.height - 1; j++) {
          payload.ascii.blocks[i].push({
            bg: null,
            fg: null,
            char: null,
            bold: false,
            blinking: false,
          });
        }
      }

      this.$store.commit('newAsciibirdMeta', payload);

      console.log(this.$store.state.asciibirdMeta);

      // this.reset();
    },
    create2DArray(rows) {
      const arr = [];

      for (let i = 0; i < rows; i++) {
        arr[i] = [];
      }

      return arr;
    },
    // reset() {
    //   this.dialog.heading = "";
    //   this.status.createNew = this.dialog.visible = false;
    // },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
