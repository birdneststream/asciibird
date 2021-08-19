<template>
  <div id="app">
    <NewAscii />
    <EditAscii v-if="asciibirdMeta.length" />
    <PasteAscii />

    <KeyboardShortcuts
      :selected-blocks="selectedBlocks"
      :text-editing="textEditing"
      :selecting="selecting"
      :showing-post-url="showingPostUrl"
      @updatecanvas="updatecanvas"
    />

    <context-menu :display="showContextMenu" ref="menu" class="z-50">
      <ul>
        <li
          @click="$store.commit('openModal', 'new-ascii')"
          class="ml-1"
          @contextmenu.prevent
        >
          New ASCII
        </li>
        <li
          @click="$store.commit('openModal', 'edit-ascii')"
          class="ml-1"
          v-if="asciibirdMeta.length"
        >
          Edit Ascii
        </li>
        <li
          @click="closeTab(currentTab)"
          class="ml-1 border-b"
          v-if="asciibirdMeta.length"
        >
          Close Ascii
        </li>
        <li @click="startImport('mirc')" class="ml-1">Import mIRC from File</li>
        <li
          @click="startExport('file')"
          class="ml-1 border-b"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to File
        </li>
        <li class="ml-1" @click="$store.commit('openModal', 'paste-ascii')">
          Import mIRC from Clipboard
        </li>
        <li
          class="ml-1 border-b"
          @click="startExport('clipboard')"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to Clipboard
        </li>
        <li
          class="ml-1 border-b"
          @click="startExport('post')"
          v-if="asciibirdMeta.length"
        >
          Post to HTTP
        </li>
        <li
          @click="exportAsciibirdState()"
          class="ml-1"
          v-if="asciibirdMeta.length"
        >
          Save Asciibird State
        </li>
        <li @click="startImport('asb')" class="ml-1">Load Asciibird State</li>
        <li @click="clearCache()" class="ml-1">Reset State</li>
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
      <div class="bg-gray-500 z-50">
        <t-button class="p-1 rounded-xl" @click="openContextMenu">
          :::
        </t-button>

        <span
          v-for="(value, key) in asciibirdMeta"
          :key="key"
          class="mr-2 z-50"
        >
          <t-button
            class="p-1 z-50"
            :class="buttonStyle(key)"
            @click="changeTab(key, value)"
          >
            {{ value.title }}

            <t-button class="z-50" @click="closeTab(key)"> X </t-button>
          </t-button>
        </span>
      </div>

      <Toolbar :canvas-x="canvasX" :canvas-y="canvasY" class="z-10" />
      <DebugPanel
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-if="debugPanelState.visible"
        class="z-10"
      />

      <Editor
        @coordsupdate="updateCoords"
        @selectedblocks="selectedblocks"
        @textediting="textediting"
        :update-canvas="updateCanvas"
        @selecting="updateSelecting"
        class="z-10"
      />

      <CharPicker v-if="toolbarState.isChoosingChar" class="z-10" />
      <ColourPicker
        v-if="toolbarState.isChoosingFg || toolbarState.isChoosingBg"
        class="z-10"
      />

      <BrushLibrary v-if="brushLibraryState.visible" class="z-10" />
      <BrushPreview class="z-10" />
      <LayersLibrary class="z-10" />
    </template>
    <template v-else>
      <div
        class="
          absolute
          top-1/2
          left-1/2
          transform
          -translate-x-1/2 -translate-y-1/2
          text-center
        "
        @mouseup.right="openContextMenu"
        @contextmenu.prevent
      >
        <h1 class="text-4xl">ASCIIBIRD</h1>
        <h3>Right click to start</h3>

        <BrushCanvas :blocks="splashAscii" />
      </div>
    </template>
  </div>
</template>

<script>
import LZString from "lz-string";
import Toolbar from "./components/Toolbar.vue";
import DebugPanel from "./components/DebugPanel.vue";
import BrushLibrary from "./components/BrushLibrary.vue";
import LayersLibrary from "./components/LayersLibrary.vue";
import Editor from "./views/Editor.vue";

import CharPicker from "./components/parts/CharPicker.vue";
import ColourPicker from "./components/parts/ColourPicker.vue";
import ContextMenu from "./components/parts/ContextMenu.vue";

import NewAscii from "./components/modals/NewAscii.vue";
import EditAscii from "./components/modals/EditAscii.vue";
import PasteAscii from "./components/modals/PasteAscii.vue";

import BrushCanvas from "./components/parts/BrushCanvas.vue";
import BrushPreview from "./components/parts/BrushPreview.vue";
import KeyboardShortcuts from "./components/parts/KeyboardShortcuts.vue";

import {
  parseMircAscii,
  toolbarIcons,
  exportMirc,
  downloadFile,
  checkForGetRequest,
  splashAscii,
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
    BrushLibrary,
    BrushCanvas,
    BrushPreview,
    KeyboardShortcuts,
    LayersLibrary,
  },
  name: "Dashboard",
  data: () => ({
    canvasX: null,
    canvasY: null,
    dashboardX: 0,
    dashboardY: 0,
    importType: null,
    showContextMenu: false,
    selectedBlocks: null,
    textEditing: null,
    updateCanvas: false,
    selecting: null,
    showingPostUrl: false,
  }),
  computed: {
    splashAscii() {
      return splashAscii;
    },
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
    brushLibraryState() {
      return this.$store.getters.brushLibraryState;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentTab() {
      return this.$store.getters.currentTab;
    },
  },
  methods: {
    buttonStyle(key) {
      return this.currentTab === key
        ? `text-sm pl-1 p-1 h-10 text-white border border-transparent shadow-sm hover:bg-blue-500 bg-gray-900`
        : `text-sm pl-1 p-1 h-10 text-white border border-transparent shadow-sm hover:bg-blue-500 bg-gray-400`;
    },
    openContextMenu(e) {
      e.preventDefault();
      this.$refs.menu.open(e);
    },
    updateCoords(value) {
      this.canvasX = value.x;
      this.canvasY = value.y;
    },
    selectedblocks(value) {
      this.selectedBlocks = value;
    },
    updateSelecting(value) {
      this.selecting = value;
    },
    textediting(value) {
      this.textEditing = value;
    },
    updatecanvas() {
      this.updateCanvas = !this.updateCanvas;
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
        this.$toasted.show(err, {
          type: "error",
        });
      }
    },
    startExport(type) {
      let ascii = exportMirc();

      switch (type) {
        case "clipboard":
          this.$copyText(ascii.output.join("")).then(
            (e) => {
              this.$toasted.show("Copied mIRC to clipboard!", {
                type: "success",
              });
            },
            (e) => {
              this.$toasted.show("Error when copying mIRC to clipboard!", {
                type: "error",
              });
            }
          );
          break;

        default:
        case "file":
          downloadFile(ascii.output.join(""), ascii.filename, "text/plain");
          break;
        case "post":
          this.showingPostUrl = true;
          this.$dialog
            .prompt("Enter URL", '"Enter URL for POST command', "question")
            .then((result) => {
              if (result.isOk) {
                const requestOptions = {
                  method: "POST",
                  headers: { "Content-Type": "application/octet-stream" },
                  body: ascii.output.join(""),
                };
                fetch(
                  this.lastPostURL ??
                    "http://localhost:9991/bot/efnet?target=%23jrh",
                  requestOptions
                )
                  .then((response) => this.$toasted.show("POSTed ascii!"))
                  .catch((error) => this.$toasted.show("Error POSTing"));
              }

              this.showingPostUrl = false;
            });
          break;
      }
    },
    changeTab(key) {
      // Update the tab index in vuex store
      this.$store.commit("changeTab", key);
    },
    closeTab(key) {
      this.$dialog
        .confirm({
          title: `Close ${this.asciibirdMeta[key].title}?`,
          text: "This action cannot be undone and the ASCII will be gone.",
          icon: "info",
        })
        .then((result) => {
          if (result.isOk) {
            this.$store.commit("closeTab", key);
          }
        });
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
