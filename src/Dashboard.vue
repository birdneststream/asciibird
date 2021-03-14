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
      <t-button @click="createClick()" class="ml-1">New ASCII</t-button>
      <t-button @click="clearCache()" class="ml-1">Clear and Refresh</t-button>
      <t-button @click="startImport('mirc')" class="ml-1">Import mIRC</t-button>
      <t-button @click="startImport('ansi')" class="ml-1">Import ANSI</t-button>
      <input
        type="file"
        style="display: none"
        ref="asciiInput"
        @change="onImport()"
      />

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
import * as Anser from "anser";

export default {
  async created() {
    this.mircColors = this.$store.getters.mircColors;
    this.charCodes = this.$store.getters.charCodes;
    this.asciibirdMeta = this.$store.getters.asciibirdMeta;

    let asciiUrl = new URL(location.href).searchParams.get("ircwatch");
    if (asciiUrl) {
      let res = await fetch(`https://irc.watch/ascii/txt/${asciiUrl}`);
      console.log({ asciiData, asciiUrl });
      let asciiData = await res.text();
      this.mircAsciiImport(asciiData, asciiUrl);
      window.location.href = "/";
    }
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
    refresh: false,
    asciiImport: "",
    finalAscii: null,
    asciiArray: [],
    imageUrl: null,
    parseColor: false,
    colorCode: false,
    importBlocks: null,
    importFormat: null,
  }),
  methods: {
    onImport() {
      const { files } = this.$refs.asciiInput;
      const filename = files[0].name;
      const fileReader = new FileReader();
      this.asciiImport = fileReader.readAsText(files[0]);

      fileReader.addEventListener("load", () => {
        switch (this.importFormat) {
          case "ansi":
            this.asniImport(fileReader.result, filename);
            break;

          case "mirc":
            this.mircAsciiImport(fileReader.result, filename);
            break;
        }

        this.importFormat = null;
      });

      this.asciiImportFile = files[0];
    },
    startImport(type) {
      this.importFormat = type;
      this.$refs.asciiInput.click();
    },
    asniImport(contents, filename) {
      let ansiArray = contents.split("\n");

      let ansiWidth = 0;

      this.finalAscii = {
        width: false, // defined in: switch (curChar) case "\n":
        height: contents.split("\r\n").length,
        title: filename,
        key: this.$store.getters.nextTabValue,
        blockWidth: 8 * this.$store.getters.blockSizeMultiplier,
        blockHeight: 13 * this.$store.getters.blockSizeMultiplier,
        blocks: this.create2DArray(contents.split("\r\n").length),
      };

      for (let i = 0; i <= ansiArray.length - 1; i++) {
        if (ansiWidth > 0 && this.finalAscii.width === false) {
          this.finalAscii.width = ansiWidth;
        }

        ansiWidth = 0;

        for (let j = 0; j <= ansiArray[i].length-1; j++) {
          let ansiParse = Anser.ansiToJson(ansiArray[i]);

          for (let l = 0; l <= ansiParse.length-1; l++) {
            var contentArray = ansiParse[l].content.split("");

            var curBlock = {
              fg: ansiParse[l].fg,
              bg: ansiParse[l].bg,
              char: null,
            };

            for (let k = 0; k <= contentArray.length-1; k++) {

              if (contentArray[k] === "\r") {
                continue
              }

              curBlock.char = contentArray[k];

              this.finalAscii.blocks[i][ansiWidth] = JSON.parse(
                JSON.stringify(curBlock)
              );

              ansiWidth++;
            }
          }
        }
      }

      this.$store.commit("newAsciibirdMeta", this.finalAscii);
    },
    mircAsciiImport(contents, filename) {
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
      this.asciiImport = contents;

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
      let firstColor = false;
      let secondColor = false;

      let colorChar1 = null;
      let colorChar2 = null;
      var parsedColor = null;

      var theWidth = 0;

      for (let charPos = 0; charPos <= this.asciiImport.length - 1; charPos++) {
        let curChar = asciiStringArray[0];

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

            //
            asciiY++;

            // We can determine the width at the end of the first line
            if (!this.finalAscii.width) {
              this.finalAscii.width =
                this.asciiImport.split("\n")[0].length - 1 - theWidth; // minus \n for the proper width
            }

            // Resets the X value
            asciiX = 0;

            asciiStringArray.shift();
            break;

          case "\u0003":
            firstColor = false;
            secondColor = false;

            // CC
            if (
              asciiStringArray[0] === "\u0003" &&
              asciiStringArray[1] === "\u0003"
            ) {
              curBlock = {
                fg: null,
                bg: null,
                char: null,
              };

              console.log("Got CC");
              continue;
            }

            asciiStringArray.shift();
            theWidth++;

            if (!firstColor) {
              colorChar1 = `${asciiStringArray[0]}`;
              colorChar2 = `${asciiStringArray[1]}`;
              parsedColor = parseInt(`${colorChar1}${colorChar2}`);

              if (parsedColor <= MIRC_MAX_COLORS && parsedColor >= 0) {
                curBlock.fg = parseInt(parsedColor);
                firstColor = true;
                theWidth += parsedColor.toString().length;

                asciiStringArray = asciiStringArray.slice(
                  parsedColor.toString().length,
                  asciiStringArray.length
                );
              }
            }

            colorChar1 = null;
            colorChar2 = null;
            parsedColor = null;

            // No background colour
            if (asciiStringArray[0] !== ",") {
              secondColor = true;
              break;
            } else {
              asciiStringArray.shift();
            }

            if (!secondColor) {
              colorChar1 = `${asciiStringArray[0]}`;
              colorChar2 = `${asciiStringArray[1]}`;
              parsedColor = parseInt(`${colorChar1}${colorChar2}`);

              if (parsedColor <= MIRC_MAX_COLORS && parsedColor >= 0) {
                curBlock.bg = parseInt(parsedColor);
                theWidth += parsedColor.toString().length;

                asciiStringArray = asciiStringArray.slice(
                  parsedColor.toString().length,
                  asciiStringArray.length
                );

                break;
              }
            }

            break;

          default:
            curBlock.char = curChar;
            asciiStringArray.shift();
            asciiX++;
            // Fk this js shit, serialising the curBlock works much better. Lost hours on this bs, fk.

            this.finalAscii.blocks[asciiY][asciiX - 1] = JSON.parse(
              JSON.stringify(curBlock)
            );

            break;
        } // End Switch

        // break;
      } // End loop charPos

      this.$store.commit("newAsciibirdMeta", this.finalAscii);
    },
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.asciibirdMeta.length}`;
      this.$modal.show("create-ascii-modal");
    },
    changeTab(key, value) {
      // Update the tab index in vuex store
      this.currentTab = key;
      this.refresh = !this.refresh;
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
      this.refresh = !this.refresh;
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
