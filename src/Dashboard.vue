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
          @click="startExport('file')"
          class="ml-1"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to File
        </li>
        <li class="ml-1" @click="$store.commit('openModal', 'paste-ascii')">
          Import mIRC from Clipboard
        </li>
        <li
          class="ml-1"
          @click="startExport('clipboard')"
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
        <li
          @click="$store.commit('openModal', 'edit-ascii')"
          class="ml-1"
          v-if="asciibirdMeta.length"
        >
          Edit Current Ascii
        </li>
      </ul>
    </context-menu>

    <span
      @mouseup.right="openContextMenu"
      @contextmenu.prevent
      style="width: 100%; height: 100%; position: absolute; z-index: -1"
    />

    <input
      type="file"
      style="display: none"
      ref="asciiInput"
      @change="onImport()"
    />

    <template v-if="asciibirdMeta.length">
      <t-button
        v-for="(value, key) in asciibirdMeta"
        :key="key"
        class="ml-1"
        @click="changeTab(key, value)"
        :disabled="false"
      >
        {{ value.title }}
      </t-button>

      <Toolbar :canvas-x="canvasX" :canvas-y="canvasY" />
      <DebugPanel
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-if="debugPanelState.visible"
      />
      <Editor @coordsupdate="updateCoords" />

      <CharPicker v-if="toolbarState.isChoosingChar" />
      <ColourPicker
        v-if="toolbarState.isChoosingFg || toolbarState.isChoosingBg"
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
import LZString from "lz-string";
import Toolbar from "./components/Toolbar.vue";
import DebugPanel from "./components/DebugPanel.vue";
import Editor from "./views/Editor.vue";

import CharPicker from "./components/parts/CharPicker.vue";
import ColourPicker from "./components/parts/ColourPicker.vue";
import ContextMenu from "./components/parts/ContextMenu.vue";

import NewAscii from "./components/modals/NewAscii.vue";
import EditAscii from "./components/modals/EditAscii.vue";
import PasteAscii from "./components/modals/PasteAscii.vue";

import {
  parseMircAscii,
  toolbarIcons,
  exportMirc,
  downloadFile,
  checkForGetRequest,
} from "./ascii";

export default {
  async created() {
    // Load from irc watch if present in the URL bar
    checkForGetRequest();
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
    PasteAscii,
  },
  name: "Dashboard",
  data: () => ({
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
      return toolbarIcons[this.$store.getters.currentTool] ?? null;
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
      return this.$store.getters.currentChar;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    asciibirdMeta() {
      return this.$store.getters.asciibirdMeta;
    },
    debugPanelState() {
      return this.$store.getters.debugPanel;
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

      const fileType = this.importType;
      fileReader.addEventListener("load", () => {
        switch (fileType) {
          case "asb":
            this.importAsciibirdState(fileReader.result, filename);
            break;

          default:
          case "mirc":
            parseMircAscii(fileReader.result, filename);
            break;
        }
      });

      // This will fire the file reader 'load' event
      fileReader.readAsText(files[0]);
    },
    startImport(type) {
      // For ANSI we'll need to add back in the
      // type cariable here
      this.importType = type;
      // console.log(this.importType);
      this.$refs.asciiInput.click();
    },
    importAsciibirdState(fileContents) {
      const contents = JSON.parse(
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

        downloadFile(
          output,
          `asciibird-${y}-${m}-${d}-${h}-${mi}-${s}.asb`,
          "application/gzip"
        );
      } catch (err) {
        console.log(err);
      }
    },
    startExport(type) {
      let ascii = exportMirc();

      switch (type) {
        case "clipboard":
          this.$copyText(ascii.output.join("")).then(
            (e) => {
              alert("Copied");
            },
            (e) => {
              alert("Can not copy");
            }
          );
          break;

        default:
        case "file":
          downloadFile(ascii.output.join(""), ascii.filename, "text/plain");
          break;
      }
    },
    changeTab(key) {
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
