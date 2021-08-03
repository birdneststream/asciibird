<template>
  <div id="app">
    <NewAscii />
    <EditAscii />
    <PasteAscii />

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
          v-if="asciibirdMeta.length"
        >
          Export mIRC to File
        </li>
        <li
          class="ml-1"
          @click="$store.commit('openModal', 'paste-modal')"
        >
          Import mIRC from Clipboard
        </li>
        <li
          class="ml-1"
          @click="exportMirc('clipboard')"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to Clipboard
        </li>
        <li
          @click="exportAsciibirdState()"
          class="ml-1"
          v-if="asciibirdMeta.length"
        >
          Save Asciibird State
        </li>
        <li @click="startImport('asb')" class="ml-1">Load Asciibird State</li>
        <li @click="$store.commit('openModal', 'edit-ascii')" class="ml-1" v-if="asciibirdMeta.length">Edit Current Ascii</li>
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

    <template v-if="asciibirdMeta.length">
      <t-button
        v-for="(value, key) in asciibirdMeta"
        v-bind:key="key"
        class="ml-1"
        @click="changeTab(key, value)"
        :disabled="false"
      >
        {{ value.title }}
      </t-button>

      <Toolbar :canvas-x="canvasX" :canvas-y="canvasY" />
      <DebugPanel :canvas-x="canvasX" :canvas-y="canvasY" v-if="debugPanelState.visible" />
      <Editor @coordsupdate="updateCoords" />

      <CharPicker v-if="toolbarState.isChoosingChar" />
      <ColourPicker
        v-if="
          toolbarState.isChoosingFg ||
          toolbarState.isChoosingBg
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

<script>
import Toolbar from "./components/Toolbar.vue";
import DebugPanel from "./components/DebugPanel.vue";
import Editor from "./views/Editor.vue";

import CharPicker from "./components/parts/CharPicker.vue";
import ColourPicker from "./components/parts/ColourPicker.vue";
import ContextMenu from "./components/parts/ContextMenu.vue";

import NewAscii from "./components/modals/NewAscii.vue";
import EditAscii from "./components/modals/EditAscii.vue";
import PasteAscii from "./components/modals/PasteAscii.vue";
import LZString from "lz-string";

import { parseMircAscii } from "./ascii.js" 

export default {
  async created() {
    // Load from irc watch if present in the URL bar
    const asciiUrlCdn = new URL(location.href).searchParams.get("ascii");
    if (asciiUrlCdn) {
      const res = await fetch(`https://ascii.jewbird.live/${asciiUrlCdn}`, {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      });

      const asciiData = await res.text();
      this.mircAsciiImport(asciiData, asciiUrlCdn);
    }

    const asciiUrl = new URL(location.href).searchParams.get("ircwatch");
    if (asciiUrl) {
      const res = await fetch(`https://irc.watch/ascii/txt/${asciiUrl}`, {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      });

      const asciiData = await res.text();
      this.mircAsciiImport(asciiData, asciiUrl);
    }

    const haxAscii = new URL(location.href).searchParams.get("haxAscii");
    if (haxAscii) {
      const res = await fetch(`https://art.h4x.life/${haxAscii}`, {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      });

      // Considers paths
      const asciiName = haxAscii.split('/').pop();
      const asciiData = await res.text();
      this.mircAsciiImport(asciiData, asciiName);
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
    EditAscii,
    PasteAscii
  },
  name: "Dashboard",
  data: () => ({
    showNewAsciiModal: false,
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
        this.$store.getters.toolbarIcons[
          this.$store.getters.currentTool
        ] ?? null
      );
    },
    icon() {
      return [
        this.currentTool.fa ?? "fas",
        this.currentTool.icon ?? "mouse-pointer",
      ];
    },
    options() {
      return this.$store.getters.options;
    },
    canFg() {
      return this.$store.getters.isTargettingFg;
    },
    canBg() {
      return this.$store.getters.isTargettingBg;
    },
    canText() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    currentChar() {
      return this.$store.getters.getChar;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    asciibirdMeta() {
      return this.$store.getters.asciibirdMeta;
    },
    debugPanelState() {
      return this.$store.getters.debugPanel
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
      fileReader.addEventListener("load", () => {
        switch (_importType) {
          case "asb":
            this.importAsciibirdState(fileReader.result, filename);
            break;

          case "mirc":
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
      // console.log(this.importType);
      this.$refs.asciiInput.click();
    },
    mircAsciiImport(contents, filename) {
      parseMircAscii(contents, filename)
    },
    importAsciibirdState(fileContents) {
      let contents = JSON.parse(
        LZString.decompressFromEncodedURIComponent(fileContents)
      );
      this.$store.commit("changeState", { ...contents });
    },
    exportAsciibirdState() {
      let output;

      try {
        output = LZString.compressToEncodedURIComponent(
          JSON.stringify(this.$store.getters.state)
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
          "application/gzip"
        );
      } catch (err) {
        console.log(err);
      }
    },
    exportMirc(type) {
      const { currentAscii } = this.$store.getters;
      let blocks = this.$store.getters.currentAsciiBlocks;
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
            const zeroPad = (num, places) => String(num).padStart(places, "0");
            output.push(
              `\u0003${zeroPad(
                curBlock.fg ?? this.options.defaultFg,
                2
              )},${zeroPad(
                curBlock.bg ?? this.options.defaultBg,
                2
              )}`
            );
          }

          // null .chars will end up as space
          output.push(curBlock.char ?? " ");
          prevBlock = blocks[y][x];
        }

        // We can never have a -1 colour code so we'll always
        // write one at the start of each line
        prevBlock = { bg: -1, fg: -1 };

        // New line except for the very last line
        if (y < blocks.length - 1) {
          output.push("\n");
        }
      }

      // Download to a txt file
      // Check if txt already exists and append it
      const filename =
        currentAscii.title.slice(currentAscii.title.length - 3) === "txt"
          ? currentAscii.title
          : `${currentAscii.title}.txt`;

      switch (type) {
        case "clipboard":
          this.$copyText(output.join("")).then(
            function (e) {
              alert("Copied");
              console.log(e);
            },
            function (e) {
              alert("Can not copy");
              console.log(e);
            }
          );
          break;

        default:
        case "file":
          this.downloadToFile(output.join(""), filename, "text/plain");
          break;
      }
    },
    downloadToFile(content, filename, contentType) {
      const downloadToFile = (content, filename, contentType) => {
        const a = document.createElement("a");
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
      this.$store.commit("changeTab", key);
    },
    clearCache() {
      localStorage.clear();
      window.location.href = "/";
    },
    captureMouse(event) {
      this.dashboardX = event.pageX;
      this.dashboardY = event.pageY;
    },
  },
};
</script>
