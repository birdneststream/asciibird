<template>
  <div id="app">
    <t-modal
      name="create-ascii-modal"
      header="Create new ASCII"
      :clickToClose="false"
      :escToClose="false"
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

    <div>
      <t-button @click="createClick()" class="ml-1">New ASCII</t-button>
      <t-button @click="clearCache()" class="ml-1"
        >Clear and Refresh</t-button
      >
      <t-button @click="startImport('mirc')" class="ml-1">Import mIRC</t-button>
      <t-button @click="exportMirc()" class="ml-1" v-if="this.$store.getters.asciibirdMeta.length"
        >Export ASCII to mIRC</t-button
      >
      <t-button @click="exportAsciibirdState()" class="ml-1" v-if="this.$store.getters.asciibirdMeta.length"
        >Save Asciibird State</t-button
      >
      <t-button @click="startImport('asb')" class="ml-1"
        >Load Asciibird State</t-button
      >
      <!-- <t-button @click="startImport('ansi')" class="ml-1">Import ANSI</t-button> -->
      <input
        type="file"
        style="display: none"
        ref="asciiInput"
        @change="onImport()"
      />

      <t-button
        v-for="(value, key) in this.$store.getters.asciibirdMeta"
        v-bind:key="key"
        class="ml-1"
        @click="changeTab(key, value)"
        :disabled="false"
      >
        {{ value.title }}
      </t-button>

      <Toolbar
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-if="this.$store.getters.asciibirdMeta.length"
      />
      <DebugPanel
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-if="this.$store.getters.asciibirdMeta.length"
      />
      <Editor @coordsupdate="updateCoords" v-if="this.$store.getters.asciibirdMeta.length" />

      <CharPicker v-if="$store.getters.getToolbarState.isChoosingChar" />
      <ColourPicker
        v-if="
          $store.getters.getToolbarState.isChoosingFg ||
          $store.getters.getToolbarState.isChoosingBg
        "
      />

      <!-- <AsciiCursor :mousex="dashboardX" :mousey="dashboardY" :z="500" /> -->
    </div>
  </div>
</template>

<script>
import Toolbar from './components/Toolbar.vue';
import DebugPanel from './components/DebugPanel.vue';
import Editor from './views/Editor.vue';
// import * as Anser from "anser";
import CharPicker from './components/parts/CharPicker.vue';
import ColourPicker from './components/parts/ColourPicker.vue';
import AsciiCursor from './components/parts/AsciiCursor.vue';
// import pako from 'pako';

export default {
  async created() {
    // Load from irc watch if present in the URL bar
    const asciiUrl = new URL(location.href).searchParams.get('ircwatch');
    if (asciiUrl) {
      const res = await fetch(`https://irc.watch/ascii/txt/${asciiUrl}`);
      const asciiData = await res.text();
      this.mircAsciiImport(asciiData, asciiUrl);
      window.location.href = '/';
    }
  },
  components: {
    Toolbar, DebugPanel, Editor, CharPicker, ColourPicker, AsciiCursor
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
    currentTab: 1,
    canvasX: null,
    canvasY: null,
    dashboardX: 0,
    dashboardY: 0,
    importType: null,
  }),
  methods: {
    updateCoords(value) {
      this.canvasX = value.x;
      this.canvasY = value.y;
    },
    onImport() {
      const { files } = this.$refs.asciiInput;
      const filename = files[0].name;
      const fileReader = new FileReader();

      var _importType = this.importType
      fileReader.addEventListener('load', () => {
        
        switch(_importType) {

          case 'asb':
            this.importAsciibirdState(fileReader.result, filename)
            break;

          case 'mirc':
              this.mircAsciiImport(fileReader.result, filename);
            break;
        }

      });

      // This will fire the file reader 'load' event
      const asciiImport = fileReader.readAsText(files[0]);
    },
    startImport(type) {
      // For ANSI we'll need to add back in the
      // type cariable here
      this.importType = type
      console.log(this.importType)
      this.$refs.asciiInput.click();
    },
    // We can maybe try something different to import ANSI
    // asniImport(contents, filename) {
    //   let ansiArray = contents.split("\n");

    //   let ansiWidth = 0;

    //   this.finalAscii = {
    //     width: false, // defined in: switch (curChar) case "\n":
    //     height: contents.split("\r\n").length,
    //     title: filename,
    //     key: this.$store.getters.nextTabValue,
    //     blockWidth: 8 * this.$store.getters.blockSizeMultiplier,
    //     blockHeight: 13 * this.$store.getters.blockSizeMultiplier,
    //     blocks: this.create2DArray(contents.split("\r\n").length),
    //   };

    //   for (let i = 0; i <= ansiArray.length - 1; i++) {
    //     if (ansiWidth > 0 && this.finalAscii.width === false) {
    //       this.finalAscii.width = ansiWidth;
    //     }

    //     ansiWidth = 0;

    //     for (let j = 0; j <= ansiArray[i].length - 1; j++) {
    //       let ansiParse = Anser.ansiToJson(ansiArray[i]);

    //       for (let l = 0; l <= ansiParse.length - 1; l++) {
    //         var contentArray = ansiParse[l].content.split("");

    //         var curBlock = {
    //           fg: this.mircColours.indexOf(`rgb(${ansiParse[l].fg})`),
    //           bg: this.mircColours.indexOf(`rgb(${ansiParse[l].bg})`),
    //           char: null,
    //         };

    //         // If we had no matches in our mIRC RGB lookup, then we have to try match
    //         // the ASNI colours to the best mIRC colour

    //         if (curBlock.fg === -1) {
    //           switch (ansiParse[l].fg) {
    //             case "187, 187, 0": // orangeish yellow
    //               curBlock.fg = 8;
    //               break;

    //             case "187, 0, 0": // red
    //               curBlock.fg = 4;
    //               break;
    //           }
    //         }

    //         if (curBlock.bg === -1) {
    //           switch (ansiParse[l].bg) {
    //             case "187, 187, 0": // orangeish yellow
    //               curBlock.bg = 8;
    //               break;

    //             case "187, 0, 0": // red
    //               curBlock.bg = 4;
    //               break;
    //           }
    //         }

    //         for (let k = 0; k <= contentArray.length - 1; k++) {
    //           if (contentArray[k] === "\r") {
    //             continue;
    //           }

    //           this.mircColours.indexOf(`rgb(${ansiParse[l].fg})`);

    //           curBlock.char = contentArray[k];

    //           this.finalAscii.blocks[i][ansiWidth] = JSON.parse(
    //             JSON.stringify(curBlock)
    //           );

    //           ansiWidth++;
    //         }
    //       }
    //     }
    //   }

    //   this.$store.commit("newAsciibirdMeta", this.finalAscii);
    // },
    mircAsciiImport(contents, filename) {
      const MIRC_MAX_COLOURS = this.$store.getters.mircColours.length;

      // The current state of the Colours
      let curBlock = {
        fg: null,
        bg: null,
        char: null,
      };

      // set asciiImport as the entire file contents as a string
      const asciiImport = contents.split('\u0003\u0003').join('\u0003');

      // This will end up in the asciibirdMeta
      const finalAscii = {
        width: false, // defined in: switch (curChar) case "\n":
        height: asciiImport.split('\n').length,
        title: filename,
        key: this.$store.getters.nextTabValue,
        blockWidth: 8 * this.$store.getters.blockSizeMultiplier,
        blockHeight: 13 * this.$store.getters.blockSizeMultiplier,
        blocks: this.create2DArray(asciiImport.split('\n').length),
        x: 247, // the dragable ascii canvas x
        y: 24, // the dragable ascii canvas y
      };

      // Turn the entire ascii string into an array
      let asciiStringArray = asciiImport.split('');

      // The proper X and Y value of the block inside the ASCII
      let asciiX = 0;
      let asciiY = 0;

      // used to determine colours
      let colourChar1 = null;
      let colourChar2 = null;
      let parsedColour = null;

      // This variable just counts the amount of colour and char codes to minus
      // to get the real width
      let widthOfColCodes = 0;

      while (asciiStringArray.length) {
        const curChar = asciiStringArray[0];

        // Defining a small finite state machine
        // to detect the colour code
        switch (curChar) {
          case '\n':
            // Reset the colours here on a new line
            curBlock = {
              fg: null,
              bg: null,
              char: null,
            };

            // the Y value of the ascii
            asciiY++;

            // We can determine the width at the end of the first line
            // If for some reason like in aphex.txt the first line is
            // trimmed it will trim the entire ascii!
            if (!finalAscii.width) {
              finalAscii.width = asciiImport.split('\n')[0].length - 1 - widthOfColCodes; // minus \n for the proper width
            }

            // Resets the X value
            asciiX = 0;

            asciiStringArray.shift();
            break;

          case '\u0003':
            // Remove the colour char
            asciiStringArray.shift();
            widthOfColCodes++;

            // Attempt to work out bg
            colourChar1 = `${asciiStringArray[0]}`;
            colourChar2 = `${asciiStringArray[1]}`;
            parsedColour = parseInt(`${colourChar1}${colourChar2}`);

            // Work out the 01, 02 double digit codes
            if (parseInt(colourChar1) === 0 && parseInt(colourChar2) >= 0) {
              asciiStringArray.shift();
              widthOfColCodes += 1;
            }

            if (isNaN(parsedColour)) {
              curBlock.bg = parseInt(colourChar1);
              widthOfColCodes += 1;
              asciiStringArray.shift();
            } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
              curBlock.fg = parseInt(parsedColour);
              widthOfColCodes += parsedColour.toString().length;

              asciiStringArray = asciiStringArray.slice(
                parsedColour.toString().length,
                asciiStringArray.length,
              );
            }

            // No background colour
            if (asciiStringArray[0] !== ',') {
              break;
            } else {
              // Remove , from array
              asciiStringArray.shift();
            }

            // Attempt to work out bg
            colourChar1 = `${asciiStringArray[0]}`;
            colourChar2 = `${asciiStringArray[1]}`;
            parsedColour = parseInt(`${colourChar1}${colourChar2}`);

            if (
              !isNaN(colourChar1)
              && !isNaN(colourChar2)
              && parseInt(colourChar2) > parseInt(colourChar1)
              && !isNaN(parsedColour)
              && parseInt(parsedColour) < 10
            ) {
              parsedColour = parseInt(colourChar2);
              asciiStringArray.shift();
            }

            if (isNaN(parsedColour)) {
              curBlock.bg = parseInt(colourChar1);
              widthOfColCodes += 1;
              asciiStringArray.shift();
            } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
              curBlock.bg = parseInt(parsedColour);
              widthOfColCodes += parsedColour.toString().length;

              asciiStringArray = asciiStringArray.slice(
                parsedColour.toString().length,
                asciiStringArray.length,
              );

              break;
            }

            break;

          default:
            curBlock.char = curChar;
            asciiStringArray.shift();
            asciiX++;

            finalAscii.blocks[asciiY][asciiX - 1] = { ...curBlock };
            break;
        } // End Switch
      } // End loop charPos

      // Store the ASCII
      this.$store.commit('newAsciibirdMeta', finalAscii);

      // To show the ASCII after importing we get the last key
      // from the asciiBirdMeta array
      const keys = this.$store.getters.asciibirdMeta
        .map((v, k) => k)
        .filter((i) => i !== undefined);

      // Set the current tab and pop the array for the last value
      this.currentTab = keys.pop();
      this.$store.commit('changeTab', this.currentTab);

      // Update the browsers title to the ASCII filename
      document.title = `asciibird - ${this.$store.getters.currentAscii.title}`;
    },
    importAsciibirdState(fileContents, fileName) {
      // Import from a gzipped json file
      // let input;

      // try {
      //   // convert the incoming base64 -> binary
      //   const strData = fileContents;

      //   // split it into an array rather than a "string"
      //   const charData = strData.split('').map(function(x){return x.charCodeAt(0); });

      //   // var strData = String.fromCharCode.apply(null, pako.inflate(String.fromCharCode.apply(null, input).split("").map(function(x){return x.charCodeAt(0);})));
      //   input = pako.inflate(charData, { to: 'string' });  
        
      //   console.log(input);
      // } catch (err) {
      //   console.log(err);
      // }

      // console.log(fileContents)

      // No gz for now unless can get the above working
      this.$store.commit("changeState", Object.assign({},JSON.parse(fileContents)));
    },
    exportAsciibirdState() {
      // Download to a gzipped json file
      let output;

      try {
        // Make a gzipped JSON of the asciibird app state
        // While making a gzip bellow works, had some trouble gunzipping in importAsciibirdState(fileContents, fileName)
        // output = pako.gzip(JSON.stringify(this.$store.getters.getState), {level:"9"});
        output = JSON.stringify(this.$store.getters.getState);

        // Default timestamp for filename
        let today = new Date();
        let y = today.getFullYear();
        let m = today.getMonth() + 1; // JavaScript months are 0-based.
        let d = today.getDate();
        let h = today.getHours();
        let mi = today.getMinutes();
        let s = today.getSeconds();

        this.downloadToFile(output, `asciibird-${y}-${m}-${d}-${h}-${mi}-${s}.asb`, 'application/json');
      } catch (err) {
        console.log(err);
      }
    },
    exportMirc() {
      const { currentAscii } = this.$store.getters;
      const output = [];
      let curBlock = null;
      let prevBlock = { bg: -1, fg: -1 };

      for (let y = 0; y <= currentAscii.blocks.length - 1; y++) {
        for (let x = 0; x <= currentAscii.blocks[y].length - 1; x++) {
          curBlock = currentAscii.blocks[y][x];

          // If we have a difference between our previous block
          // we'll put a colour codes and continue as normal
          if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
            Object.assign(curBlock, currentAscii.blocks[y][x]);
            const zeroPad = (num, places) => String(num).padStart(places, '0');
            output.push(`\u0003${zeroPad(curBlock.fg ?? this.$store.getstate.options.defaultFg, 2)},${zeroPad(curBlock.bg ?? this.$store.getstate.options.defaultBg, 2)}`);
          }

          // null .chars will end up as space
          output.push(curBlock.char ?? ' ');
          prevBlock = currentAscii.blocks[y][x];
        }

        // We can never have a -1 colour code so we'll always
        // write one at the start of each line
        prevBlock = { bg: -1, fg: -1 };

        // New line except for the very last line
        if (y < currentAscii.blocks.length - 1) {
          output.push('\n');
        }
      }

      // Download to a txt file
      // Check if txt already exists and append it
      const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt' ? currentAscii.title : `${currentAscii.title}.txt`;
      this.downloadToFile(output.join(''), filename, 'text/plain');
    },
    downloadToFile(content, filename, contentType) {
      const downloadToFile = (content, filename, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });

        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();

        URL.revokeObjectURL(a.href);
      };
      
      return downloadToFile(content, filename, contentType)
    },
    createClick() {
      this.forms.createAscii.title = `New ASCII ${this.$store.getters.asciibirdMeta.length}`;
      this.$modal.show('create-ascii-modal');
    },
    changeTab(key, value) {
      // Update the tab index in vuex store
      this.currentTab = key;
      this.$store.commit('changeTab', key);
    },
    clearCache() {
      localStorage.clear();
      window.location.href = '/';
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
    captureMouse(event) {
        // clientX/Y gives the coordinates relative to the viewport in CSS pixels.
        // console.log("viewport", event.clientX);
        // console.log("viewport", event.clientY);

        // // pageX/Y gives the coordinates relative to the <html> element in CSS pixels.
        // console.log("element", event.pageX);
        // console.log("element", event.pageY);

        this.dashboardX = event.pageX
        this.dashboardY = event.pageY

        // // screenX/Y gives the coordinates relative to the screen in device pixels.
        // console.log("screen", event.screenX);
        // console.log("screen", event.screenY);
    }
  },
};
</script>
