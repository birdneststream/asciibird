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

      <Toolbar v-if="asciibirdMeta.length" />
      <DebugPanel v-if="asciibirdMeta.length" />

      <div class="border-gray-600">
        <!-- <router-view /> -->
        <Editor v-if="asciibirdMeta.length" />
      </div>
    </div>
  </div>
</template>

<script>
import Toolbar from "./components/Toolbar.vue";
import DebugPanel from "./components/DebugPanel.vue";
import Editor from "./views/Editor.vue";
export default {
  created() {
    this.mircColors = this.$store.getters.mircColors;
    this.charCodes = this.$store.getters.charCodes;
    this.asciibirdMeta = this.$store.getters.asciibirdMeta;
  },
  components: { Toolbar, DebugPanel, Editor },
  name: "Dashboard",
  data: () => ({
    forms: {
      createAscii: {
        width: 5,
        height: 5,
        title: "ascii",
      },
    },
    formsDefault: null,
    status: {
      createNew: false,
    },
    text: "ASCII",
    currentTab: 1,
    asciibirdMeta: [],
    mircColors: null,
    charCodes: null,

    asciiImport: "",
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

      fileReader.addEventListener("load", () => {
        // Max available colors
        const MIRC_MAX_COLORS = this.mircColors.length;

        // The current state of the colors
        let curBlock = {
          fg: null,
          bg: null,
          char: null,
        };

        // Object clone this to reset the block state
        let emptyCurBlock = {
          fg: null,
          bg: null,
          char: null,
        };

        // set asciiImport as the entire file contents as a string
        this.asciiImport = fileReader.result;

        // This will end up in the asciibirdMeta
        this.finalAscii = {
          width: false, // defined in: switch (curChar) case "\n":
          height: this.asciiImport.split("\n").length,
          title: filename,
          key: this.$store.getters.nextTabValue,
          blockWidth: 8 * this.$store.getters.blockSizeMultiplier,
          blockHeight: 13 * this.$store.getters.blockSizeMultiplier,
          blocks: this.create2DArray(this.asciiImport.split("\n").length),
        };

        // Turn the entire ascii string into an array
        let asciiStringArray = this.asciiImport.split("");

        // The proper X and Y value of the block inside the ASCII
        let asciiX = 0;
        let asciiY = 0;
        let firstColor = true;

        for (
          let charPos = 0;
          charPos <= this.asciiImport.length - 1;
          charPos++
        ) {
          let curChar = asciiStringArray[charPos];
         
          // Defining a small finite state machine
          // to detect the colour code
          switch (curChar) {
            case "\n":
              // Reset the colours here on a new line
              curBlock = {
                          fg: null,
                          bg: null,
                          char: null,
                        };
              asciiY++;

              // We can determine the width at the end of the first line
              if (!this.finalAscii.width) {
                this.finalAscii.width = asciiX - 1; // minus \n for the proper width
              }



              asciiX = 0;
              break;

            case "\u0003":
              curBlock = {
                          fg: null,
                          bg: null,
                          char: null,
                        };
              firstColor = true;
              curBlock.fg = ""
              curBlock.bg = ""
              // Pick up the colour here, then set it
              charPos++;

              for (let k = charPos; k <= k + 3; k++) {
                
                if (firstColor && asciiStringArray[k] === ",") {
                  firstColor = false;
                } else if (firstColor) {
                  if (curBlock.fg === null) {
                    curBlock.fg = asciiStringArray[k];
                  } else {
                    curBlock.fg =
                      "" + curBlock.fg + asciiStringArray[k];
                  }
                }

                if (!firstColor && asciiStringArray[k] !== ",") {
                  if (
                    !isNaN(
                      `${asciiStringArray[k]}${asciiStringArray[k + 1]}`
                    ) &&
                    `${asciiStringArray[k]}${asciiStringArray[k + 1]}` <=
                      MIRC_MAX_COLORS
                  ) {
                    // Is valid number
                    curBlock.bg = `${asciiStringArray[k]}${
                      asciiStringArray[k + 1]
                    }`;
                  } else {
                    //
                    curBlock.bg = `${asciiStringArray[k]}`;
                  }

                  // curBlock.char = `${asciiStringArray[k + 1]}`;
                  break;
                }
              }

              // Check colours
              // Given how we have the code above we may not need this
              //asciiX--;

              if (
                !isNaN(curBlock.fg) &&
                curBlock.fg >= 0 &&
                curBlock.fg <= MIRC_MAX_COLORS &&
                !isNaN(curBlock.bg) &&
                curBlock.bg >= 0 &&
                curBlock.bg <= MIRC_MAX_COLORS
              ) {
                // Block is good
                // console.log(`curBlock GOOD`, curBlock);

                // Minus X value if all good
                asciiX--;
                
                // this.finalAscii.blocks[asciiY][asciiX] = curBlock;
              } else {
                console.log(`curBlock BAD`, JSON.stringify(curBlock));
              }

              charPos++;
              break;

            default:
                curBlock.char = curChar
                asciiX++;

                // The console log shows the correct curBlock
                console.log(JSON.stringify({asciiY, asciiX, curBlock}))

                // Fk this js shit, serialising the curBlock works much better. Lost hours on this bs, fk.
                this.finalAscii.blocks[asciiY][asciiX] = JSON.parse(JSON.stringify(curBlock));

              break;
          } // End Switch

          // break;
        } // End loop charPos

        console.log(JSON.stringify(this.finalAscii.blocks))
        this.$store.commit("newAsciibirdMeta", this.finalAscii);

        // End file upload
      });

      this.asciiImportFile = files[0];
    },
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.asciibirdMeta.length}`;
      this.$modal.show("create-ascii-modal");
    },
    changeTab(key, value) {
      // Update the tab index in vuex store
      this.$store.commit("changeTab", key);
    },
    clearCache() {
      localStorage.clear();
      window.location.href = "/";
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
            bg: Math.floor(Math.random() * this.mircColors.length),
            fg: Math.floor(Math.random() * this.mircColors.length),
            char: this.charCodes[
              Math.floor(Math.random() * this.charCodes.length)
            ],
          });
        }
      }

      // console.log('payload', payload);

      this.$store.commit("newAsciibirdMeta", payload);
      this.$modal.hide("create-ascii-modal");
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
