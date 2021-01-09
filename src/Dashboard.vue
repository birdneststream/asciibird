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


    <div>
      <t-button @click="createClick()" class="ml-1">Add new ASCII</t-button>

      <t-button v-for="(value, key) in asciibirdMeta" v-bind:key="key" class="ml-1" @click="changeTab(key, value)">
        {{ value.title }} ({{ value.width }} / {{ value.height }})
      </t-button>

      <div class="border-gray-600">
        <router-view/>
      </div>

    </div>

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
    mircColors: [
        'rgb(255,255,255)', 'rgb(0,0,0)', 'rgb(0,0,127)', 'rgb(0,147,0)', 'rgb(255,0,0)',
        'rgb(127,0,0)', 'rgb(156,0,156)', 'rgb(252,127,0)', 'rgb(255,255,0)', 'rgb(0,252,0)',
        'rgb(0,147,147)', 'rgb(0,255,255)', 'rgb(0,0,252)', 'rgb(255,0,255)',
        'rgb(127,127,127)', 'rgb(210,210,210)'
      ],
    charCodes: [
      '*','-','=','+','^','#'
    ]

  }),
  // computed: {
  //   returnAsciiMetaIndex() {
  //     return this.$store.state.asciibirdMeta[this.currentTab];
  //   },
  // },
  methods: {
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.asciibirdMeta.length}`;
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
            bg: this.mircColors[Math.floor(Math.random() * this.mircColors.length)],
            fg: this.mircColors[Math.floor(Math.random() * this.mircColors.length)],
            char: this.charCodes[Math.floor(Math.random() * this.charCodes.length)],
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
