<template>
  <div id="app">
    <t-modal
      name="create-ascii-modal"
      header="Create new ASCII"
      :clickToClose="false"
      :escToClose="false"
      @before-closed="closeNewASCII"
    >
      <!-- Main Menu -->
      Width
      <t-input
        type="number"
        name="width"
        v-model="forms.createAscii.width"
        max="3"
      />

      Height
      <t-input
        type="number"
        name="height"
        v-model="forms.createAscii.height"
        max="4"
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

    <div>
      <t-button @click="createClick()" class="ml-1">Add new ASCII</t-button>

      <t-button @click="clearCache()" class="ml-1">Clear and Refresh</t-button>

      <t-button @click="$refs.asciiInput.click()" class="ml-1"
        >Import ASCII</t-button
      >
      <input
        type="file"
        style="display: none"
        ref="asciiInput"
        @change="onAsciiImport()"
      />
      <h3>Content:</h3>
      <pre id="msg"></pre>

      <t-button
        v-for="(value, key) in asciibirdMeta"
        v-bind:key="key"
        class="ml-1"
        @click="changeTab(key, value)"
        :disabled="false"
      >
        {{ value.title }} ({{ value.width }} / {{ value.height }})
      </t-button>

        <!-- <vue-draggable-resizable
          @dragging="onDrag"
          style="left: 70%; top: 10%;z-index: 100;"
          :resizable="false"
          v-if="asciibirdMeta.length"
        >
          <t-card header="Tools and Stuff" style="height: 500px">
            <t-button
              type="button"
              v-for="(value, key) in mircColors"
              :key="key"
              :style="makeButtonClass(value)"
              class="border-gray-300 m-1"
            ></t-button>

            <hr />
            <h5>Brushes and Shit</h5>
            <hr />
          </t-card>
        </vue-draggable-resizable> -->

      <Toolbar v-if="asciibirdMeta.length" />

      <div class="border-gray-600">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Toolbar from "./components/Toolbar.vue";
export default {
  created() {
    this.mircColors = this.$store.state.mircColors
    this.charCodes = this.$store.state.charCodes
    this.asciibirdMeta = this.$store.state.asciibirdMeta
  },
  components: { Toolbar },
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
    mircColors: null,
    charCodes: null,

    asciiImport: '',
    finalAscii: null,
    asciiArray: [],
    imageUrl: null,
    parseColor: false,
    colorCode: false,
    importBlocks: null,
  }),
  methods: {
    onAsciiImport() {
      const { files } = this.$refs.asciiInput;
      const filename = files[0].name;
      const fileReader = new FileReader();
      this.asciiImport = fileReader.readAsText(files[0]);

      this.asciiArray = [];
      const tempBlocks = [];

      fileReader.addEventListener('load', () => {
        this.asciiImport = fileReader.result;
        this.asciiImport = this.asciiImport.split('\n');

        this.finalAscii = {
          width: this.asciiImport[0].split('').length,
          height: this.asciiImport.length,
          title: filename,
          blockWidth: 16,
          blockHeight: 26,
          blocks: this.create2DArray(this.asciiImport.length),
        };

        for (let y = 0; y < this.asciiImport.length; y++) {
          const rowX = this.asciiImport[y].split('');

          // console.log(rowX.length);
          if (rowX.length !== 0) {
            for (let x = 0; x < rowX.length; x++) {
              switch (rowX[x]) {
                case '\u0003':
                  this.parseColor = true;
                  break;

                default:
                  this.parseColor = false;
                  break;
              }

              if (this.parseColor) {
                this.colorCode = (
                  rowX[x + 1]
                  + rowX[x + 2]
                  + rowX[x + 3]
                ).split(',');

                x++;
                x++;
                x++;
                continue;
              } else if (!this.parseColor) {
                this.finalAscii.blocks[y][x] = {
                  // x,
                  // y,
                  bg: this.mircColors[this.colorCode[0]],
                  fg: this.mircColors[this.colorCode[1]],
                  char: rowX[x],
                };
              }
            }

            this.colorCode = null;
          } else {
            this.finalAscii.height--;
          }
        }

        // console.log('this.finalAscii', this.finalAscii);

        this.$store.commit('newAsciibirdMeta', this.finalAscii);
      }); // End function

      this.asciiImportFile = files[0];
    },


    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.asciibirdMeta.length}`;
      this.$modal.show('create-ascii-modal');
    },
    changeTab(key, value) {
      // Update the router title
      // if (this.$router.params[0] !== key) {
      this.$router.push({ name: 'editor', params: { ascii: key } });
      // }/

      // Update the tab index in vuex store
      this.$store.commit('changeTab', key);
    },
    clearCache() {
      localStorage.clear();
      window.location.href = '/';
    },
    createNewASCII() {
      const payload = {
        title: this.forms.createAscii.title,
        key: this.asciibirdMeta.length,
        width: this.forms.createAscii.width,
        height: this.forms.createAscii.height,
        blockWidth: 16,
        blockHeight: 26,
        blocks: this.create2DArray(this.forms.createAscii.height),
      };

      // Push all the default ASCII blocks
      for (let x = 0; x < payload.width; x++) {
        for (let y = 0; y < payload.height; y++) {
          payload.blocks[y].push({
            bg: this.mircColors[
              Math.floor(Math.random() * this.mircColors.length)
            ],
            fg: this.mircColors[
              Math.floor(Math.random() * this.mircColors.length)
            ],
            char: this.charCodes[
              Math.floor(Math.random() * this.charCodes.length)
            ],
          });
        }
      }

      // console.log('payload', payload);

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
