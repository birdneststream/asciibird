<template>
  <div id="app">
    <NewAscii />
    <Settings />

    <context-menu :display="showContextMenu" ref="menu">
      <ul>
        <li
          @click="$store.commit('openModal', 'new-ascii')"
          class="ml-1"
          @contextmenu.prevent
        >
          New ASCII
        </li>
        <li @click="clearCache()" class="ml-1">Clear and Refresh</li>
        <li @click="startImport('mirc')" class="ml-1">Import mIRC</li>
        <li
          @click="exportMirc('file')"
          class="ml-1"
          v-if="this.$store.getters.asciibirdMeta.length"
        >
          Export mIRC to File
        </li>
        <li
          class="ml-1"
          @click="exportMirc('clipboard')"
          v-if="this.$store.getters.asciibirdMeta.length"
        >
          Export mIRC to Clipboard
        </li>
        <li
          @click="exportAsciibirdState()"
          class="ml-1"
          v-if="this.$store.getters.asciibirdMeta.length"
        >
          Save Asciibird State
        </li>
        <li @click="startImport('asb')" class="ml-1">Load Asciibird State</li>
        <li
          @click="$store.commit('openModal', 'open-settings')"
          class="ml-1"
          @contextmenu.prevent
        >
        Settings...
        </li>
      </ul>
    </context-menu>

    <span
      @mouseup.right="openContextMenu"
      @contextmenu.prevent
      style="width: 100%; height: 100%; position: absolute; z-index: -1"
    ></span>

    <input
      type="file"
      style="display: none"
      ref="asciiInput"
      @change="onImport()"
    />

    <template v-if="this.$store.getters.asciibirdMeta.length">
      <t-button
        v-for="(value, key) in this.$store.getters.asciibirdMeta"
        v-bind:key="key"
        class="ml-1"
        @click="changeTab(key, value)"
        :disabled="false"
      >
        {{ value.title }}
      </t-button>

      <Toolbar :canvas-x="canvasX" :canvas-y="canvasY" />
      <DebugPanel :canvas-x="canvasX" :canvas-y="canvasY" />
      <Editor @coordsupdate="updateCoords" />

      <CharPicker v-if="$store.getters.getToolbarState.isChoosingChar" />
      <ColourPicker
        v-if="
          $store.getters.getToolbarState.isChoosingFg ||
          $store.getters.getToolbarState.isChoosingBg
        "
      />
    </template>
    <template v-else>
      <div style="left: 35%; top: 15%; position: absolute; z-index: -2">
        <h1 style="font-size: 72px; text-align: center">ASCIIBIRD</h1>
        <h1 style="font-size: 13px; text-align: center">
          Right click to start
        </h1>
      </div>
    </template>
  </div>
</template>

<style>
/* html {
  cursor: url('assets/mouse-pointer-solid.svg'), auto;
} */
</style>

<script>
import LZString from 'lz-string';
import Toolbar from './components/Toolbar.vue';
import DebugPanel from './components/DebugPanel.vue';
import Editor from './views/Editor.vue';

import CharPicker from './components/parts/CharPicker.vue';
import ColourPicker from './components/parts/ColourPicker.vue';
import ContextMenu from './components/parts/ContextMenu.vue';

import NewAscii from './components/modals/NewAscii.vue';
import Settings from './components/modals/Settings.vue';

export default {

  // load settings?
  beforeCreate() {
    // change the font
    document.body.style.fontFamily = this.$store.getters.getOptions.font;
  },

  async created() {
    // Load from irc watch if present in the URL bar
    const asciiUrlCdn = new URL(location.href).searchParams.get('ascii');
    if (asciiUrlCdn) {
      const res = await fetch(`https://ascii.jewbird.live/${asciiUrlCdn}`, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });

      const asciiData = await res.text();
      console.log({ asciiData, asciiUrlCdn });
      this.mircAsciiImport(asciiData, asciiUrlCdn);
      // window.location.href = "/";
    }

    const asciiUrl = new URL(location.href).searchParams.get('ircwatch');
    if (asciiUrl) {
      const res = await fetch(`https://irc.watch/ascii/txt/${asciiUrl}`, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });

      const asciiData = await res.text();
      console.log({ asciiData, asciiUrl });
      this.mircAsciiImport(asciiData, asciiUrl);
      // window.location.href = "/";
    }
  },
  components: {
    Toolbar,
    DebugPanel,
    Editor,
    CharPicker,
    ColourPicker,
    ContextMenu,
    NewAscii,
    Settings,
  },
  name: 'Dashboard',
  data: () => ({
    showNewAsciiModal: false,
    showSettingsModal: false,
    currentTab: 1,
    canvasX: null,
    canvasY: null,
    dashboardX: 0,
    dashboardY: 0,
    importType: null,
    showContextMenu: false,
  }),
  computed: {
    currentTool() {
      return (
        this.$store.getters.getToolbarIcons[
          this.$store.getters.getCurrentTool
        ] ?? null
      );
    },
    icon() {
      return [
        this.currentTool.fa ?? 'fas',
        this.currentTool.icon ?? 'mouse-pointer',
      ];
    },
  },
  methods: {
    openContextMenu(e) {
      e.preventDefault();
      this.$refs.menu.open(e);
    },
    updateCoords(value) {
      this.canvasX = value.x;
      this.canvasY = value.y;
    },
    async onImport() {
      const { files } = this.$refs.asciiInput;
      const filename = files[0].name;
      const fileReader = new FileReader();

      const _importType = this.importType;
      fileReader.addEventListener('load', () => {
        switch (_importType) {
          case 'asb':
            this.importAsciibirdState(fileReader.result, filename);
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
      this.importType = type;
      console.log(this.importType);
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
    onTriggeredEventHandler(payload) {
      console.log(`You have pressed CMD (CTRL) + ${payload.keyString}`);
    },
    mircAsciiImport(contents, filename) {
      const MIRC_MAX_COLOURS = this.$store.getters.mircColours.length;

      // The current state of the Colours
      let curBlock = {
        fg: null,
        bg: null,
        char: null,
      };

      // set asciiImport as the entire file contents as a string
      const asciiImport = contents
        .split('\u0003\u0003')
        .join('\u0003')
        .split('\u000F').join('')
        .split('\u0003\n')
        .join('\n')
        .split('\u0002\u0003')
        .join('\u0003');

      // This will end up in the asciibirdMeta
      const finalAscii = {
        width: false, // defined in: switch (curChar) case "\n":
        height: asciiImport.split('\n').length,
        title: filename,
        key: this.$store.getters.nextTabValue,
        blockWidth: 8 * this.$store.getters.blockSizeMultiplier,
        blockHeight: 13 * this.$store.getters.blockSizeMultiplier,
        blocks: this.create2DArray(asciiImport.split('\n').length),
        history: [],
        redo: [],
        x: 8 * 35, // the dragable ascii canvas x
        y: 13 * 2, // the dragable ascii canvas y
      };

      // Turn the entire ascii string into an array
      let asciiStringArray = asciiImport.split('');
      const linesArray = asciiImport.split('\n');

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

      // Better for colourful asciis
      let maxWidthLoop = 0;

      // Used before the loop, better for plain text
      let maxWidthFound = 0;

      for (let i = 0; i < linesArray.length; i++) {
        if (linesArray[i].length > maxWidthFound) {
          maxWidthFound = linesArray[i].length;
        }
      }

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

            if (linesArray[asciiY] && linesArray[asciiY].length > maxWidthLoop) {
              maxWidthLoop = linesArray[asciiY].length;
            }

            // the Y value of the ascii
            asciiY++;

            // Calculate widths mirc asciis vs plain text
            if (!finalAscii.width && widthOfColCodes > 0) {
              finalAscii.width = maxWidthLoop - widthOfColCodes; // minus \n for the proper width
            }

            if (!finalAscii.width && widthOfColCodes === 0) {
              // Plain text
              finalAscii.width = maxWidthFound; // minus \n for the proper width
            }

            // Resets the X value
            asciiX = 0;

            asciiStringArray.shift();
            widthOfColCodes = 0;
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
              widthOfColCodes += 1;
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
              widthOfColCodes += 1;
              asciiStringArray.shift();
            }

            if (
              parseInt(colourChar2) === parseInt(colourChar1)
              && parseInt(parsedColour) < 10
            ) {
              parsedColour = parseInt(colourChar1);
              asciiStringArray.shift();
              asciiStringArray.shift();
              widthOfColCodes += 2;

              curBlock.bg = parseInt(colourChar1);

              break;
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
      finalAscii.blocks = LZString.compressToUTF16(
        JSON.stringify(finalAscii.blocks),
      );
      finalAscii.history.push(finalAscii.blocks);
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
    importAsciibirdState(fileContents) {
      const contents = JSON.parse(
        LZString.decompressFromEncodedURIComponent(fileContents),
      );
      this.$store.commit('changeState', { ...contents });
    },
    exportAsciibirdState() {
      let output;

      try {
        output = LZString.compressToEncodedURIComponent(
          JSON.stringify(this.$store.getters.getState),
        );

        // Default timestamp for filename
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth() + 1; // JavaScript months are 0-based.
        const d = today.getDate();
        const h = today.getHours();
        const mi = today.getMinutes();
        const s = today.getSeconds();

        this.downloadToFile(
          output,
          `asciibird-${y}-${m}-${d}-${h}-${mi}-${s}.asb`,
          'application/gzip',
        );
      } catch (err) {
        console.log(err);
      }
    },
    exportMirc(type) {
      const { currentAscii } = this.$store.getters;
      const blocks = this.$store.getters.currentAsciiBlocks;
      const output = [];
      let curBlock = null;
      let prevBlock = { bg: -1, fg: -1 };

      for (let y = 0; y <= blocks.length - 1; y++) {
        if (y >= currentAscii.height) {
          continue;
        }

        for (let x = 0; x <= blocks[y].length - 1; x++) {
          if (x >= currentAscii.width) {
            continue;
          }

          curBlock = blocks[y][x];

          // If we have a difference between our previous block
          // we'll put a colour codes and continue as normal
          if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
            Object.assign(curBlock, blocks[y][x]);
            const zeroPad = (num, places) => String(num).padStart(places, '0');
            output.push(
              `\u0003${zeroPad(
                curBlock.fg ?? this.$store.getters.getOptions.defaultFg,
                2,
              )},${zeroPad(
                curBlock.bg ?? this.$store.getters.getOptions.defaultBg,
                2,
              )}`,
            );
          }

          // null .chars will end up as space
          output.push(curBlock.char ?? ' ');
          prevBlock = blocks[y][x];
        }

        // We can never have a -1 colour code so we'll always
        // write one at the start of each line
        prevBlock = { bg: -1, fg: -1 };

        // New line except for the very last line
        if (y < blocks.length - 1) {
          output.push('\n');
        }
      }

      // Download to a txt file
      // Check if txt already exists and append it
      const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt'
        ? currentAscii.title
        : `${currentAscii.title}.txt`;

      switch (type) {
        case 'clipboard':
          this.$copyText(output.join('')).then(
            (e) => {
              alert('Copied');
              console.log(e);
            },
            (e) => {
              alert('Can not copy');
              console.log(e);
            },
          );
          break;

        default:
        case 'file':
          this.downloadToFile(output.join(''), filename, 'text/plain');
          break;
      }
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

      return downloadToFile(content, filename, contentType);
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

      this.dashboardX = event.pageX;
      this.dashboardY = event.pageY;

      // // screenX/Y gives the coordinates relative to the screen in device pixels.
      // console.log("screen", event.screenX);
      // console.log("screen", event.screenY);
    },
  },
};
</script>
