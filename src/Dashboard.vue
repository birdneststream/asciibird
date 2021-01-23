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
      <t-input
        type="number"
        name="width"
        v-model="forms.createAscii.width"
        max="3"
      />
      <t-input
        type="number"
        name="height"
        v-model="forms.createAscii.height"
        max="4"
      />
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
        :disabled=false
      >
        {{ value.title }} ({{ value.width }} / {{ value.height }})
      </t-button>

      <div class="border-gray-600">
        <vue-draggable-resizable
          @dragging="onDrag"
          style="left: 70%; top: 10%"
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
        </vue-draggable-resizable>

        <router-view />
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
      'rgb(255,255,255)',
      'rgb(0,0,0)',
      'rgb(0,0,127)',
      'rgb(0,147,0)',
      'rgb(255,0,0)',
      'rgb(127,0,0)',
      'rgb(156,0,156)',
      'rgb(252,127,0)',
      'rgb(255,255,0)',
      'rgb(0,252,0)',
      'rgb(0,147,147)',
      'rgb(0,255,255)',
      'rgb(0,0,252)',
      'rgb(255,0,255)',
      'rgb(127,127,127)',
      'rgb(210,210,210)',
    ],
    charCodes: ['*', '-', '=', '+', '^', '#'],
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
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
          blockWidth: 8,
          blockHeight: 13,
          blocks: this.create2DArray(this.asciiImport.length),
        };

        for (let y = 0; y < this.asciiImport.length; y++) {
          const rowText = this.asciiImport[y].split('');

          for (let x = 0; x < rowText.length; x++) {
            switch (rowText[x]) {
              case '\u0003':
                this.parseColor = true;
                break;

              default:
                this.parseColor = false;
                break;
            }

            if (this.parseColor) {
              this.colorCode = (
                rowText[x + 1]
                + rowText[x + 2]
                + rowText[x + 3]
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
                char: rowText[x], 
              };
            }
          }

          this.colorCode = null;
        }

        this.$store.commit('newAsciibirdMeta', this.finalAscii);
      }); // End function

      this.asciiImportFile = files[0];
    },
    makeButtonClass(color) {
      return `background-color: ${color} !important;width:25px;height:25px;`;
    },
    onResize(x, y, width, height) {
      this.floating.x = x;
      this.floating.y = y;
      this.floating.width = width;
      this.floating.height = height;
    },
    onDrag(x, y) {
      this.floating.x = x;
      this.floating.y = y;
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
      for (let i = 0; i < payload.width; i++) {
        for (let j = 0; j < payload.height; j++) {
          payload.blocks[i].push({
            // x: j,
            // y: i,
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
