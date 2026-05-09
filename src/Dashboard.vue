<template>
  <div
    id="app"
    @contextmenu.prevent
  >
    <div v-show="menuBarVisible">
      <vue-file-toolbar-menu
        :content="myMenu"
        v-if="!(isModalOpen || isKeyboardDisabled)"
      />
    </div>

    <NewAscii v-if="modalState.newAscii" />
    <Options v-if="asciibirdMeta.length && modalState.options" />

    <About v-if="modalState.about" />
    <Help v-if="modalState.help" />
    <EditAscii
      v-if="asciibirdMeta.length && modalState.editAscii"
      @updateAscii="updateAsciiDetails"
    />
    <PasteAscii v-if="modalState.pasteAscii" />
    <ImageOverlay v-if="asciibirdMeta.length && modalState.overlay" />

    <KeyboardShortcuts
      :selected-blocks="selectedBlocks"
      :selecting="selecting"
      @updatecanvas="updatecanvas"
      :is-inputting-brush-size="this.isInputtingBrushSize"
      :canvas-x="canvasX"
      :canvas-y="canvasY"
    />

    <context-menu
      ref="menu"
      class="z-50"
    >
      <ul>
        <li
          @click="$store.commit('openModal', 'new-ascii')"
          class="ab-context-menu-item"
        >
          New ASCII
        </li>
        <li
          @click="$store.commit('openModal', 'edit-ascii')"
          class="ab-context-menu-item"
          v-if="asciibirdMeta.length"
        >
          Edit Ascii
        </li>
        <li
          @click="closeTab(currentTab)"
          class="ab-context-menu-item border-b"
          v-if="asciibirdMeta.length"
        >
          Close Ascii
        </li>
        <li
          @click="$store.commit('openModal', 'options')"
          class="ab-context-menu-item border-b"
          v-if="asciibirdMeta.length"
        >
          Options
        </li>

        <li
          @click="startImport('mirc')"
          class="ab-context-menu-item"
        >
          Import from File
        </li>
        <li
          @click="startExport('file')"
          class="ab-context-menu-item border-b"
          v-if="asciibirdMeta.length"
        >
          Export to File
        </li>
        <li
          class="ab-context-menu-item"
          @click="$store.commit('openModal', 'paste-ascii')"
        >
          Import from Clipboard
        </li>
        <li
          class="ab-context-menu-item"
          @click="startExport('clipboard')"
          v-if="asciibirdMeta.length"
        >
          Export to Clipboard
        </li>
        <li
          class="ab-context-menu-item border-b"
          @click="startExport('post')"
          v-if="asciibirdMeta.length"
        >
          Export to HTTP POST
        </li>
        <li
          @click="exportAsciibirdState()"
          class="ab-context-menu-item"
          v-if="asciibirdMeta.length"
        >
          Save Asciibird State
        </li>
        <li
          @click="startImport('asb')"
          class="ab-context-menu-item"
        >
          Load Asciibird State
        </li>
      </ul>
    </context-menu>

    <span
      @mouseup.right="openContextMenu"
      style="width: 100%; height: 100%; position: absolute; z-index: -1"
    />

    <input
      type="file"
      style="display: none"
      ref="asciiInput"
      @change="onImport()"
    >

    <template v-if="asciibirdMeta.length">
      <div
        class="bg-gray-500 relative z-auto"
        ref="tabbar"
        :style="toolbarString"
        v-if="tabsVisible"
      >
        <span
          v-for="(value, key) in asciibirdMeta"
          :key="key"
          class="mr-2 z-40"
        >
          <t-button
            class="p-1 z-40"
            :class="buttonStyle(key)"
            @click="changeTab(key, value)"
          >
            <span>
              <span class="material-icons relative">insert_drive_file</span>
              <span class="bottom-1 relative pl-1 pr-1">{{ value.title }}</span>
              <t-button
                class="relative bottom-1 z-40 rounded-3xl h-5"
                @click="closeTab(key)"
              ><span
                class="material-icons"
                style="font-size: 16px"
              >close</span></t-button>
            </span>
          </t-button>
        </span>
      </div>

      <Editor
        @coordsupdate="updateCoords"
        @selectedblocks="selectedblocks"
        @textediting="textediting"
        :update-canvas="updateCanvas"
        @selecting="updateSelecting"
        :y-offset="scrollOffset"
        :updateascii="updateAscii"
        :reset-select="resetSelect"
      />

      <Toolbar
        v-show="toolbarState.visible"
        :y-offset="scrollOffset"
      />

      <DebugPanel
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-if="debugPanelState.visible"
        :y-offset="scrollOffset"
      />

      <BrushLibrary
        v-show="brushLibraryState.visible"
        :y-offset="scrollOffset"
      />

      <BrushPreview
        @inputtingbrush="inputtingbrush"
        :y-offset="scrollOffset"
        v-show="brushPreviewState.visible"
      />

      <LayersLibrary
        v-show="layersLibraryState.visible"
        :y-offset="scrollOffset"
      />

      <CharPicker
        v-show="toolbarState.isChoosingChar"
        class="z-50"
        :y-offset="scrollOffset"
      />
      <ColourPicker
        v-if="toolbarState.isChoosingFg || toolbarState.isChoosingBg"
        class="z-50"
        :y-offset="scrollOffset"
      />
    </template>
    <template v-else>
      <div
        class="
          absolute
          left-1/2
          transform
          -translate-x-1/2
          text-center

        "
        @mouseup.right="openContextMenu"
      >
        <BrushCanvas :blocks="this.splashAscii()" />
      </div>
    </template>
  </div>
</template>

<script>
// top-1/2
// -translate-y-1/2
// these css classes can put back to center smaller asciis

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
import Options from "./components/modals/Options.vue";
import ImageOverlay from "./components/modals/ImageOverlay.vue";
import EditAscii from "./components/modals/EditAscii.vue";
import PasteAscii from "./components/modals/PasteAscii.vue";
import About from "./components/modals/About.vue";
import Help from "./components/modals/Help.vue";

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
  getBlocksWidth,
  emptyBlock,
  checkIrcByteLimits,
} from "./ascii";

import { useMenuDefinition } from "./composables/useMenuDefinition";

import VueFileToolbarMenu from "vue-file-toolbar-menu";

export default {
  async created() {
    // Load from irc watch if present in the URL bar
    checkForGetRequest();
    this.scrollHandler = () => {
      this.scrollOffset = window.scrollY;
    };
    window.addEventListener("scroll", this.scrollHandler);
    this.mirror.x = this.toolbarState.mirrorX;
    this.mirror.y = this.toolbarState.mirrorY;
  },
  destroyed() {
    window.removeEventListener("scroll", this.scrollHandler);
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
    Options,
    ImageOverlay,
    VueFileToolbarMenu,
    About,
    Help,
  },
  name: "Dashboard",
  data: () => ({
    canvasX: null,
    canvasY: null,
    dashboardX: 0,
    dashboardY: 0,
    scrollHandler: null,
    importType: null,
    showContextMenu: false,
    selectedBlocks: [],
    textEditing: null,
    updateCanvas: false,
    selecting: {
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      canSelect: false,
    },
    isInputtingBrushSize: false,
    scrollOffset: 0,
    toolbarString: "top: 0px;",
    lastPostURL: "",
    drawBrush: false,
    happy: false,
    resetSelect: false,
    mirror: {
      x: false,
      y: false,
    },
    diffBlocks: {
      l: 0,
      old: [],
      new: [],
    },
    updateAscii: false,
  }),
  computed: {
    isMacLike: () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    isSelecting() {
      return this.currentTool.name === "select";
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool] ?? null;
    },

    asciibirdMeta() {
      return this.$store.getters.asciibirdMeta;
    },
    debugPanelState() {
      return this.$store.getters.debugPanel;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentTab() {
      return this.$store.getters.currentTab;
    },
    imageOverlay() {
      return this.$store.getters.imageOverlay || false;
    },
    imageOverlayUrl() {
      return this.imageOverlay.url
        ? this.imageOverlay.url.split("/").pop()
        : "";
    },
    selectBlocks() {
      return this.$store.getters.selectBlocks;
    },
    modalState() {
      return this.$store.getters.modalState;
    },
    isModalOpen() {
      return this.$store.getters.isModalOpen;
    },

    // Layers
    asciiLayersMenu() {
      let menu = [];

      for (let i in [...this.currentAsciiLayers]) {
        menu.push({
          text: this.currentAsciiLayers[i].label,
          click: () =>
            this.$store.commit(
              "changeLayer",
              this.currentAsciiLayers.length - i
            ),
        });
      }

      return menu.reverse();
    },
    isKeyboardDisabled() {
      return this.$store.getters.isKeyboardDisabled;
    },
    selectedLayer() {
      return this.$store.getters.selectedLayer;
    },
    canToggleLayer() {
      return this.currentAsciiLayers.length > 1;
      // We want to avoid hiding all the layers, so if there's only one
      // visible left, we have to disable the buttons
    },
    brushSizeHeight() {
      return this.$store.getters.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.$store.getters.brushSizeWidth;
    },
    brushSizeType() {
      return this.$store.getters.brushSizeType;
    },
    // Toolbar related
    gridView() {
      return this.toolbarState.gridView;
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
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    tabsVisible() {
      return this.$store.getters.tabsVisible;
    },
    menuBarVisible() {
      return this.$store.getters.menuBarVisible;
    },
    currentAsciiLayerBlocks() {
      return this.currentSelectedLayer.data;
    },
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    selectedLayerIndex() {
      return this.currentAscii.selectedLayer || 0;
    },
    brushLibraryState() {
      return this.$store.getters.brushLibraryState;
    },
    brushPreviewState() {
      return this.$store.getters.brushPreviewState;
    },
    layersLibraryState() {
      return this.$store.getters.layersLibraryState;
    },
    currentSelectedLayer() {
      return this.currentAsciiLayers[this.currentAscii.selectedLayer];
    },
    isBrushing() {
      return this.currentTool.name === "brush";
    },
    isErasing() {
      return this.currentTool.name === "eraser";
    },
    isSelected() {
      return (
        this.selecting.startX !== null &&
        this.selecting.startY !== null &&
        this.selecting.endX !== null &&
        this.selecting.endY !== null
      );
    },
    // Toolbar menu — delegated to composable
    myMenu() {
      return useMenuDefinition({
        store: this.$store,
        toasted: this.$toasted,
        dialog: this.$dialog,
        copyText: this.$copyText,
        isMacLike: this.isMacLike,
        asciibirdMeta: this.asciibirdMeta,
        currentTab: this.currentTab,
        currentTool: this.currentTool,
        isSelecting: this.isSelecting,
        isBrushing: this.isBrushing,
        isErasing: this.isErasing,
        isSelected: this.isSelected,
        selectedBlocks: this.selectedBlocks,
        selectBlocks: this.selectBlocks,
        brushBlocks: this.brushBlocks,
        canFg: this.canFg,
        canBg: this.canBg,
        canText: this.canText,
        currentFg: this.currentFg,
        currentBg: this.currentBg,
        currentChar: this.currentChar,
        brushSizeHeight: this.brushSizeHeight,
        brushSizeWidth: this.brushSizeWidth,
        brushSizeType: this.brushSizeType,
        gridView: this.gridView,
        toolbarState: this.toolbarState,
        debugPanelState: this.debugPanelState,
        brushLibraryState: this.brushLibraryState,
        brushPreviewState: this.brushPreviewState,
        layersLibraryState: this.layersLibraryState,
        tabsVisible: this.tabsVisible,
        menuBarVisible: this.menuBarVisible,
        selectedLayer: this.selectedLayer,
        canToggleLayer: this.canToggleLayer,
        currentAsciiLayers: this.currentAsciiLayers,
        currentAscii: this.currentAscii,
        currentAsciiLayerBlocks: this.currentAsciiLayerBlocks,
        selectedLayerIndex: this.selectedLayerIndex,
        mirror: this.mirror,
        onChangeTab: (key) => this.changeTab(key),
        onCloseTab: (key) => this.closeTab(key),
        onShowLayerRename: (key, label) => this.showLayerRename(key, label),
        onUpdateLayerName: (key, label) => this.updateLayerName(key, label),
        onExportAsciibirdState: () => this.exportAsciibirdState(),
        onStartImport: (type) => this.startImport(type),
        onStartExport: (type) => this.startExport(type),
        onResetSelect: () => { this.resetSelect = !this.resetSelect; },
        onUpdateCanvas: () => this.updatecanvas(),
        onClearSelectedBlocks: () => { this.selectedBlocks = []; },
        onDeleteSelectedBlocks: () => {
          if (this.selectedBlocks.length) {
            for (let y = 0; y < this.selectedBlocks.length + 1; y++) {
              for (
                let x = 0;
                x < getBlocksWidth(this.selectedBlocks) + 1;
                x++
              ) {
                if (this.selectedBlocks[y] && this.selectedBlocks[y][x]) {
                  let oldBlock = this.currentAsciiLayerBlocks[y][x];
                  this.currentAsciiLayerBlocks[y][x] = { ...emptyBlock };
                  this.storeDiffBlocks(x, y, oldBlock, { ...emptyBlock });
                }
              }
            }
            this.dispatchBlocks();
          }
        },
      });
    },
  },
  watch: {
    // scrollOffset(val) {
    //   this.$refs.tabbar.style.top = val;
    //   this.toolbarString = `top: ${val}px`;
    // },
    isModalOpen(val, _old) {
      if (val) {
        hotkeys.deleteScope("all");
      }
    },
    isKeyboardDisabled(val, _old) {
      if (val) {
        hotkeys.deleteScope("all");
      }
    },
    currentTool(val, old) {
      if (old === "select") {
        this.selectedBlocks = [];
      }
    },
  },
  methods: {
    updateAsciiDetails(widthHeight) {
      // From edit ascii modal to editor
      this.updateAscii = widthHeight;
    },
    dispatchBlocks() {
      this.diffBlocks.old = this.diffBlocks.old.flat();
      this.diffBlocks.new = this.diffBlocks.new.flat();

      this.$store.dispatch("updateAsciiBlocksAsync", {
        blocks: this.currentAsciiLayerBlocks,
        diff: { ...this.diffBlocks },
      });

      this.diffBlocks = {
        l: this.selectedLayerIndex,
        new: [],
        old: [],
      };
    },
    storeDiffBlocks(x, y, oldBlock, newBlock) {
      // For undo
      if (!this.diffBlocks.old[y]) {
        this.diffBlocks.old[y] = [];
      }

      if (!this.diffBlocks.old[y][x]) {
        this.diffBlocks.old[y][x] = {
          x: x,
          y: y,
          b: { ...oldBlock },
        };
      }

      if (!this.diffBlocks.new[y]) {
        this.diffBlocks.new[y] = [];
      }

      if (!this.diffBlocks.new[y][x]) {
        this.diffBlocks.new[y][x] = {
          x: x,
          y: y,
          b: { ...newBlock },
        };
      }
    },
    splashAscii() {
      return splashAscii;
    },
    showLayerRename(key, label) {
      this.$store.commit("toggleDisableKeyboard", true);
      this.$dialog
        .prompt({
          title: "Rename Layer",
          text: "Please input your new layer name",
          icon: "question",
          inputValue: label,
          clickToClose: false,
        })
        .then((result) => {
          if (!result.input.length) {
            this.$toasted.show("You must enter a layer name!", {
              type: "error",
            });
            this.$store.commit("toggleDisableKeyboard", false);
            return;
          }

          if (result.isOk) {
            this.updateLayerName(key, result.input);
          }

          this.$store.commit("toggleDisableKeyboard", false);
        });
    },
    updateLayerName(key, label) {
      this.$store.commit("updateLayerName", {
        key: key,
        label: label,
      });
    },
    triggerbrush() {
      this.drawBrush = !this.drawBrush;
    },
    inputtingbrush(val) {
      this.isInputtingBrushSize = val;
    },
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
      fileReader.addEventListener("load", async () => {
        switch (fileType) {
          case "asb":
            this.importAsciibirdState(fileReader.result, filename);
            break;

          default:
          case "mirc":
            await parseMircAscii(fileReader.result, filename);
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
      this.$refs.asciiInput.click();
    },
    importAsciibirdState(fileContents) {
      try {
        const contents = JSON.parse(
          LZString.decompressFromEncodedURIComponent(fileContents)
        );
        this.$store.commit("changeState", { ...contents });
      } catch (_err) {
        this.$toasted.show("Failed to import ASCIIBIRD state. File may be corrupted.", {
          type: "error",
          icon: "error",
        });
      }
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
      
      // Check line lengths for IRC compatibility
      const checkLines = checkIrcByteLimits(ascii.output.join(""));

      if (checkLines.length) {
        const displayLines = checkLines.join(", ");
        this.$toasted.show(
          `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
          {
            type: "error",
            position: "bottom-center",
            duration: 1200,
          }
        );
      }

      switch (type) {
        case "clipboard":
          this.$copyText(ascii.output.join("")).then(
            () => {
              this.$toasted.show("Copied mIRC to clipboard!", {
                type: "success",
              });
            },
            () => {
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
          this.$store.commit("toggleDisableKeyboard", true);
          this.$dialog
            .prompt({
              title: "HTTP Post your Ascii",
              text: "Please input the URL for the HTTP Post sir",
              icon: "question",
              inputValue: this.lastPostURL,
              clickToClose: false,
            })
            .then((result) => {
              if (result.input === undefined) {
                this.$toasted.show("Come on bro. Get it together.", {
                  type: "error",
                });
                this.$store.commit("toggleDisableKeyboard", false);
                return;
              }

              if (result.isOk) {
                let ascii = exportMirc();
                this.lastPostURL = result.input;
                const requestOptions = {
                  method: "POST",
                  headers: { "Content-Type": "application/octet-stream" },
                  body: ascii.output.join(""),
                };
                fetch(this.lastPostURL, requestOptions)
                  .then((response) => {
                    if (response.status === 200 || response.status === 201) {
                      this.$toasted.show("POSTed ascii!", {
                        type: "success",
                      });
                    } else {
                      this.$toasted.show(
                        `Error: ${response.status} ${response.statusText}`,
                        {
                          type: "error",
                        }
                      );
                    }
                  })
                  .catch((error) => {
                    this.$toasted.show(`Error: ${JSON.stringify(error)}`, {
                      type: "error",
                    });
                  });
              }

              this.$store.commit("toggleDisableKeyboard", false);
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
    captureMouse(event) {
      this.dashboardX = event.pageX;
      this.dashboardY = event.pageY;
    },
  },
};
</script>
