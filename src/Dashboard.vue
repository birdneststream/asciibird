<template>
  <div
    id="app"
    @contextmenu.prevent
  >
    <div v-show="menuBarVisible">
      <div
        v-if="!(isModalOpen || isKeyboardDisabled)"
        class="flex bg-gray-800 text-white text-sm"
      >
        <Menu
          v-for="menuItem in menuBar"
          :key="menuItem.label"
          as="div"
          class="relative"
        >
          <MenuButton class="px-3 py-1 hover:bg-gray-600">
            {{ menuItem.label }}
          </MenuButton>
          <MenuItems class="absolute mt-0 bg-gray-900 shadow-lg rounded-b min-w-48 z-50">
            <MenuItem
              v-for="item in menuItem.items"
              :key="item.text"
              v-slot="{ active }"
            >
              <button
                :class="[active ? 'bg-gray-700' : '', 'block w-full text-left px-4 py-1 text-sm text-white']"
                @click="item.click"
                :disabled="item.disabled"
              >
                {{ item.text }}
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>

    <NewAscii v-if="modalState.newAscii" />
    <Options v-if="asciibirdMeta.length && modalState.options" />

    <About v-if="modalState.about" />
    <Help v-if="modalState.help" />
    <EditAscii
      v-if="asciibirdMeta.length && modalState.editAscii"
      @update-ascii="updateAsciiDetails"
    />
    <PasteAscii v-if="modalState.pasteAscii" />
    <ImageOverlay v-if="asciibirdMeta.length && modalState.overlay" />

    <KeyboardShortcuts
      :selected-blocks="selectedBlocks"
      :selecting="selecting"
      @updatecanvas="updatecanvas"
      :is-inputting-brush-size="isInputtingBrushSize"
      :canvas-x="canvasX"
      :canvas-y="canvasY"
    />

    <context-menu
      ref="menu"
      class="z-50"
    >
      <ul>
        <li
          @click="store.openModal('new-ascii')"
          class="ab-context-menu-item"
        >
          New ASCII
        </li>
        <li
          @click="store.openModal('edit-ascii')"
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
          @click="store.openModal('options')"
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
          @click="store.openModal('paste-ascii')"
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
          <button
            class="ab-button p-1 z-40"
            :class="buttonStyle(key)"
            @click="changeTab(key, value)"
          >
            <span>
              <span class="material-icons relative">insert_drive_file</span>
              <span class="bottom-1 relative pl-1 pr-1">{{ value.title }}</span>
              <button
                class="ab-button relative bottom-1 z-40 rounded-3xl h-5"
                @click="closeTab(key)"
              ><span
                class="material-icons"
                style="font-size: 16px"
              >close</span></button>
            </span>
          </button>
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
        class="absolute left-1/2 transform -translate-x-1/2 text-center"
        @mouseup.right="openContextMenu"
      >
        <BrushCanvas :blocks="splashAscii()" />
      </div>
    </template>

    <!-- Toast notifications -->
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="msg in toasts"
          :key="msg.id"
          :class="[
            'px-4 py-2 rounded shadow-lg text-white text-sm',
            msg.type === 'error' ? 'bg-red-500' : msg.type === 'success' ? 'bg-green-500' : 'bg-blue-500',
          ]"
        >
          {{ msg.text }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Global dialog -->
    <ABModal
      :open="dialogState.visible"
      @close="dialogCancel"
    >
      <div class="text-center space-y-3">
        <h3 class="text-lg font-semibold">
          {{ dialogState.title }}
        </h3>
        <p v-if="dialogState.text">
          {{ dialogState.text }}
        </p>
        <input
          v-if="dialogState.mode === 'prompt'"
          v-model="dialogState.inputValue"
          class="ab-input mt-3"
        >
      </div>
      <template #footer>
        <div class="flex justify-center space-x-4 p-3">
          <button
            class="ab-button"
            @click="dialogCancel"
          >
            Cancel
          </button>
          <button
            class="ab-button bg-blue-500 hover:bg-blue-600"
            @click="dialogOk"
          >
            OK
          </button>
        </div>
      </template>
    </ABModal>
  </div>
</template>

<script>
import LZString from "lz-string";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/vue";
import { TransitionGroup } from "vue";

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
import ABModal from "./components/ABModal.vue";

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
  checkIrcByteLimits,
} from "./ascii";

import { useAsciiBirdStore } from "./store";
import { useToast } from "./composables/useToast";
import { useDialog } from "./composables/useDialog";
import { useClipboard } from "./composables/useClipboard";

export default {
  setup() {
    const store = useAsciiBirdStore();
    const { messages: toasts, show: toastShow } = useToast();
    const { state: dialogState, confirm: dialogConfirm, prompt: dialogPrompt, ok: dialogOk, cancel: dialogCancel } = useDialog();
    const { copyText } = useClipboard();
    return {
      store,
      toasts,
      toastShow,
      dialogState,
      dialogConfirm,
      dialogPrompt,
      dialogOk,
      dialogCancel,
      copyText,
    };
  },
  async created() {
    checkForGetRequest();
    this.scrollHandler = () => {
      this.scrollOffset = window.scrollY;
    };
    window.addEventListener("scroll", this.scrollHandler);
    this.mirror.x = this.toolbarState.mirrorX;
    this.mirror.y = this.toolbarState.mirrorY;
  },
  unmounted() {
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
    About,
    Help,
    ABModal,
    'Menu': Menu,
    'MenuButton': MenuButton,
    'MenuItems': MenuItems,
    'MenuItem': MenuItem,
    TransitionGroup,
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
      return toolbarIcons[this.store.currentTool] ?? null;
    },

    asciibirdMeta() {
      return this.store.asciibirdMeta;
    },
    debugPanelState() {
      return this.store.debugPanel;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    currentTab() {
      return this.store.currentTab;
    },
    imageOverlay() {
      return this.store.imageOverlay || false;
    },
    imageOverlayUrl() {
      return this.imageOverlay.url
        ? this.imageOverlay.url.split("/").pop()
        : "";
    },
    selectBlocks() {
      return this.store.selectBlocks;
    },
    modalState() {
      return this.store.modalState;
    },
    isModalOpen() {
      return this.store.isModalOpen;
    },

    asciiLayersMenu() {
      let menu = [];

      for (let i in [...this.currentAsciiLayers]) {
        menu.push({
          text: this.currentAsciiLayers[i].label,
          click: () =>
            this.store.changeLayer(
              this.currentAsciiLayers.length - i
            ),
        });
      }

      return menu.reverse();
    },
    isKeyboardDisabled() {
      return this.store.isKeyboardDisabled;
    },
    selectedLayer() {
      return this.store.selectedLayer;
    },
    canToggleLayer() {
      return this.currentAsciiLayers.length > 1;
    },
    brushSizeHeight() {
      return this.store.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.store.brushSizeWidth;
    },
    brushSizeType() {
      return this.store.brushSizeType;
    },
    gridView() {
      return this.toolbarState.gridView;
    },
    canFg() {
      return this.store.isTargettingFg;
    },
    canBg() {
      return this.store.isTargettingBg;
    },
    canText() {
      return this.store.isTargettingChar;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    currentChar() {
      return this.store.currentChar;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    brushBlocks() {
      return this.store.brushBlocks;
    },
    tabsVisible() {
      return this.store.tabsVisible;
    },
    menuBarVisible() {
      return this.store.menuBarVisible;
    },
    currentAsciiLayerBlocks() {
      return this.currentSelectedLayer.data;
    },
    currentAsciiLayers() {
      return this.store.currentAsciiLayers;
    },
    selectedLayerIndex() {
      return this.currentAscii.selectedLayer || 0;
    },
    brushLibraryState() {
      return this.store.brushLibraryState;
    },
    brushPreviewState() {
      return this.store.brushPreviewState;
    },
    layersLibraryState() {
      return this.store.layersLibraryState;
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
    // Menu bar definition for Headless UI Menu
    menuBar() {
      return [
        {
          label: "File",
          items: [
            { text: "New ASCII", click: () => this.store.openModal("new-ascii") },
            { text: "Import from File", click: () => this.startImport("mirc") },
            { text: "Import from Clipboard", click: () => this.store.openModal("paste-ascii") },
            {
              text: "Export to File",
              click: () => this.startExport("file"),
              disabled: !this.asciibirdMeta.length,
            },
            {
              text: "Export to Clipboard",
              click: () => this.startExport("clipboard"),
              disabled: !this.asciibirdMeta.length,
            },
            {
              text: "Export to HTTP POST",
              click: () => this.startExport("post"),
              disabled: !this.asciibirdMeta.length,
            },
          ],
        },
        {
          label: "Edit",
          items: [
            {
              text: "Edit ASCII",
              click: () => this.store.openModal("edit-ascii"),
              disabled: !this.asciibirdMeta.length,
            },
            {
              text: "Undo",
              click: () => this.store.undoBlocks(),
              disabled: !this.asciibirdMeta.length,
            },
            {
              text: "Redo",
              click: () => this.store.redoBlocks(),
              disabled: !this.asciibirdMeta.length,
            },
          ],
        },
        {
          label: "View",
          items: [
            {
              text: this.menuBarVisible ? "Hide Menu Bar" : "Show Menu Bar",
              click: () => this.store.changeMenuBarVisible(!this.menuBarVisible),
            },
            {
              text: this.tabsVisible ? "Hide Tabs" : "Show Tabs",
              click: () => this.store.changeTabsVisible(!this.tabsVisible),
            },
            {
              text: this.toolbarState.gridView ? "Disable Grid" : "Enable Grid",
              click: () => this.store.toggleGridView(!this.toolbarState.gridView),
              disabled: !this.asciibirdMeta.length,
            },
            {
              text: this.debugPanelState.visible ? "Hide Debug" : "Show Debug",
              click: () => this.store.toggleDebugPanel(!this.debugPanelState.visible),
            },
          ],
        },
        {
          label: "Tools",
          items: [
            { text: "Options", click: () => this.store.openModal("options") },
            { text: "Image Overlay", click: () => this.store.openModal("overlay"), disabled: !this.asciibirdMeta.length },
          ],
        },
        {
          label: "Help",
          items: [
            { text: "About", click: () => this.store.openModal("about") },
            { text: "Help", click: () => this.store.openModal("help") },
          ],
        },
      ];
    },
  },
  watch: {
    isModalOpen(val) {
      if (val) {
        hotkeys.deleteScope("all");
      }
    },
    isKeyboardDisabled(val) {
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
    splashAscii() {
      return splashAscii;
    },
    updateAsciiDetails(widthHeight) {
      this.updateAscii = widthHeight;
    },
    dispatchBlocks() {
      this.diffBlocks.old = this.diffBlocks.old.flat();
      this.diffBlocks.new = this.diffBlocks.new.flat();

      this.store.updateAsciiBlocksAsync({
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
    showLayerRename(key, label) {
      this.store.toggleDisableKeyboard(true);
      this.dialogPrompt({
        title: "Rename Layer",
        text: "Please input your new layer name",
        inputValue: label,
      }).then((result) => {
        if (!result.input.length) {
          this.toastShow("You must enter a layer name!", {
            type: "error",
          });
          this.store.toggleDisableKeyboard(false);
          return;
        }

        if (result.isOk) {
          this.updateLayerName(key, result.input);
        }

        this.store.toggleDisableKeyboard(false);
      });
    },
    updateLayerName(key, label) {
      this.store.updateLayerName({ key, label });
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

      fileReader.readAsText(files[0]);
    },
    startImport(type) {
      this.importType = type;
      this.$refs.asciiInput.click();
    },
    importAsciibirdState(fileContents) {
      try {
        const contents = JSON.parse(
          LZString.decompressFromEncodedURIComponent(fileContents)
        );
        this.store.changeState({ ...contents });
      } catch {
        this.toastShow("Failed to import ASCIIBIRD state. File may be corrupted.", {
          type: "error",
        });
      }
    },
    exportAsciibirdState() {
      let output;

      try {
        output = LZString.compressToEncodedURIComponent(
          JSON.stringify(this.store.state)
        );

        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth() + 1;
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
        this.toastShow(String(err), { type: "error" });
      }
    },
    startExport(type) {
      let ascii = exportMirc();

      const checkLines = checkIrcByteLimits(ascii.output.join(""));

      if (checkLines.length) {
        const displayLines = checkLines.join(", ");
        this.toastShow(
          `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
          { type: "error", duration: 1200 }
        );
      }

      switch (type) {
        case "clipboard":
          this.copyText(ascii.output.join("")).then(
            () => {
              this.toastShow("Copied mIRC to clipboard!", { type: "success" });
            },
            () => {
              this.toastShow("Error when copying mIRC to clipboard!", {
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
          this.store.toggleDisableKeyboard(true);
          this.dialogPrompt({
            title: "HTTP Post your Ascii",
            text: "Please input the URL for the HTTP Post sir",
            inputValue: this.lastPostURL,
          }).then((result) => {
            if (result.input === undefined) {
              this.toastShow("Come on bro. Get it together.", {
                type: "error",
              });
              this.store.toggleDisableKeyboard(false);
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
                    this.toastShow("POSTed ascii!", { type: "success" });
                  } else {
                    this.toastShow(
                      `Error: ${response.status} ${response.statusText}`,
                      { type: "error" }
                    );
                  }
                })
                .catch((error) => {
                  this.toastShow(`Error: ${JSON.stringify(error)}`, {
                    type: "error",
                  });
                });
            }

            this.store.toggleDisableKeyboard(false);
          });

          break;
      }
    },
    changeTab(key) {
      this.store.changeTab(key);
    },
    closeTab(key) {
      this.dialogConfirm({
        title: `Close ${this.asciibirdMeta[key].title}?`,
        text: "This action cannot be undone and the ASCII will be gone.",
      }).then((result) => {
        if (result.isOk) {
          this.store.closeTab(key);
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

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
