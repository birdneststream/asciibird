<template>
  <div id="app">
    <div v-show="menuBarVisible">
      <vue-file-toolbar-menu :content="myMenu" />
    </div>

    <NewAscii />
    <Options v-if="asciibirdMeta.length" />
    <EditAscii v-if="asciibirdMeta.length" />
    <PasteAscii />
    <ImageOverlay v-if="asciibirdMeta.length" />

    <KeyboardShortcuts
      :selected-blocks="selectedBlocks"
      :selecting="selecting"
      :is-showing-dialog="isShowingDialog"
      @updatecanvas="updatecanvas"
      :is-inputting-brush-size="this.isInputtingBrushSize"
      :canvas-x="canvasX"
      :canvas-y="canvasY"
      @triggerbrush="triggerbrush"
    />

    <!-- <t-dialog
      name="dialog-posthttp"
      title="Enter URL"
      text="Enter URL for POST command"
      icon="question"
      :clickToClose="false"
      :showCloseButton="true"
      :disableBodyScroll="true"
      @closed="postHttp()"
    > 
      <t-input v-model="lastPostURL" />
    </t-dialog> -->

    <context-menu ref="menu" class="z-50">
      <ul>
        <li
          @click="$store.commit('openModal', 'new-ascii')"
          class="ab-context-menu-item"
          @contextmenu.prevent
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

        <li @click="startImport('mirc')" class="ab-context-menu-item">
          Import mIRC from File
        </li>
        <li
          @click="startExport('file')"
          class="ab-context-menu-item border-b"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to File
        </li>
        <li
          class="ab-context-menu-item"
          @click="$store.commit('openModal', 'paste-ascii')"
        >
          Import mIRC from Clipboard
        </li>
        <li
          class="ab-context-menu-item"
          @click="startExport('clipboard')"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to Clipboard
        </li>
        <li
          class="ab-context-menu-item border-b"
          @click="startExport('post')"
          v-if="asciibirdMeta.length"
        >
          Export mIRC to HTTP POST
        </li>
        <li
          @click="exportAsciibirdState()"
          class="ab-context-menu-item"
          v-if="asciibirdMeta.length"
        >
          Save Asciibird State
        </li>
        <li @click="startImport('asb')" class="ab-context-menu-item">
          Load Asciibird State
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
                ><span class="material-icons" style="font-size: 16px"
                  >close</span
                ></t-button
              >
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
        :brush="drawBrush"
      />

      <Toolbar v-show="toolbarState.visible" :y-offset="scrollOffset" />

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
        v-if="toolbarState.isChoosingChar"
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
          top-1/2
          left-1/2
          transform
          -translate-x-1/2 -translate-y-1/2
          text-center
        "
        @mouseup.right="openContextMenu"
        @contextmenu.prevent
      >
        <BrushCanvas :blocks="this.splashAscii()" />
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
import Options from "./components/modals/Options.vue";
import ImageOverlay from "./components/modals/ImageOverlay.vue";
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
  filterNullBlocks,
  getBlocksWidth,
  emptyBlock,
  canvasToPng,
} from "./ascii";

import VueFileToolbarMenu from "vue-file-toolbar-menu";

export default {
  async created() {
    // Load from irc watch if present in the URL bar
    checkForGetRequest();
    var isThis = this;
    window.addEventListener("scroll", function (event) {
      isThis.scrollOffset = this.scrollY;
    });
    this.mirror.x = this.toolbarState.mirrorX;
    this.mirror.y = this.toolbarState.mirrorY;
  },
  destroyed() {
    window.removeEventListener("scroll", function (event) {
      isThis.scrollOffset = this.scrollY;
    });
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
  },
  name: "Dashboard",
  data: () => ({
    canvasX: null,
    canvasY: null,
    dashboardX: 0,
    dashboardY: 0,
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
    isShowingDialog: false,
    drawBrush: false,
    happy: false,
    mirror: {
      x: false,
      y: false,
    },
    diffBlocks: {
      l: 0,
      old: [],
      new: [],
    },
  }),
  computed: {
    isDefault() {
      return this.currentTool.name === "default";
    },
    isSelecting() {
      return this.currentTool.name === "select";
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
    // options() {
    //   return this.$store.getters.options;
    // },

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
    selectedLayer() {
      return this.$store.getters.selectedLayer;
    },
    canToggleLayer() {
      return this.currentAsciiLayers.length > 1;
      // We want to avoid hiding all the layers, so if there's only one
      // visible left, we have to disable the buttons
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
    // Toolbar menu
    myMenu() {
      let menu = [];

      menu.push({
        text: "File",
        hotkey: "0",
        icon: "insert_drive_file",
        menu: [
          {
            text: "New ASCII",
            click: () => this.$store.commit("openModal", "new-ascii"),
            icon: "fiber_new",
            disabled: !this.isDefault,
            hotkey: "n",
          },
        ],
      });

      if (this.asciibirdMeta.length) {
        menu[0].menu.push({
          text: "Close ASCII",
          click: () => this.closeTab(this.currentTab),
          icon: "close",
          hotkey: "ctrl+q",
        });

        menu.push({
          text: "Edit",
          hotkey: "0",
          icon: "edit",
          menu: [
            {
              text: "Edit ASCII",
              click: () => this.$store.commit("openModal", "edit-ascii"),
              icon: "edit",
              hotkey: "ctrl+e",
            },
            {
              is: "separator",
            },
            {
              text: "Undo",
              click: () => this.$store.commit("undoBlocks"),
              icon: "undo",
              hotkey: "ctrl+z",
            },
            {
              text: "Redo",
              click: () => this.$store.commit("redoBlocks"),
              icon: "redo",
              hotkey: "ctrl+y",
            },
            {
              is: "separator",
            },
            {
              text: "Copy Selection",
              click: () => {
                this.$store.commit(
                  "selectBlocks",
                  filterNullBlocks(this.selectedBlocks)
                );
                this.selectedBlocks = [];
                this.$toasted.show("Copied blocks!", {
                  type: "success",
                  icon: "fa-check-circle",
                });
              },
              icon: "content_copy",
              disabled:
                !this.selectedBlocks.length &&
                !this.isSelected &&
                !this.isSelecting,
              hotkey: "ctrl+c",
            },
            {
              text: "Cut Selection",
              click: () => {
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

                  this.$store.commit(
                    "selectBlocks",
                    filterNullBlocks(this.selectedBlocks)
                  );

                  this.selectedBlocks = [];

                  // Reset and hide the select after successful copy
                  this.dispatchBlocks();

                  // this.$store.commit(
                  //   "updateAsciiBlocks",
                  //   this.currentAsciiLayerBlocks
                  // );

                  this.$emit("updatecanvas");

                  this.$toasted.show("Cut blocks!", {
                    type: "success",
                    icon: "fa-check-circle",
                  });
                }
              },
              icon: "content_cut",
              disabled:
                !this.selectedBlocks.length &&
                !this.isSelected &&
                !this.isSelecting,
              hotkey: "ctrl+x",
            },
            {
              text: "Paste Select as Brush",
              click: () => {
                this.$store.commit("pushBrushHistory", this.brushBlocks);
                this.$store.commit("brushBlocks", this.selectBlocks);
                this.$store.commit("changeTool", 4);
              },
              icon: "content_paste",
              disabled: !this.selectedBlocks.length,
              hotkey: "ctrl+v",
            },
            {
              text: "Delete Selected Blocks",
              click: () => {
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

                  // Reset and hide the select after successful copy
                  this.dispatchBlocks();

                  this.$emit("updatecanvas");
                  this.selectedBlocks = [];
                  this.$toasted.show("Deleted blocks!", {
                    type: "success",
                    icon: "fa-check-circle",
                  });
                }
              },
              icon: "delete_sweep",
              disabled:
                !this.selectedBlocks.length &&
                !this.isSelected &&
                !this.isSelecting,
              hotkey: "Delete",
            },
          ],
        });

        menu.push({
          text: "View",
          icon: "preview",
          menu: [
            {
              text: "Windows",
              icon: "desktop",
              // Show Hide Things
              menu: [
                {
                  text: `${this.tabsVisible ? "Hide" : "Show"} Tabs`,
                  icon: this.tabsVisible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+t",
                  click: (e) => {
                    this.$store.commit("changeTabsVisible", !this.tabsVisible);
                  },
                },
                {
                  text: `${this.menuBarVisible ? "Hide" : "Show"} Toolbar Menu`,
                  icon: this.menuBarVisible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+m",
                  click: (e) => {
                    this.$store.commit(
                      "changeMenuBarVisible",
                      !this.menuBarVisible
                    );
                  },
                },
                {
                  is: "separator",
                },
                {
                  text: `${
                    this.debugPanelState.visible ? "Hide" : "Show"
                  } Debug Panel`,
                  icon: this.debugPanelState.visible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+d",
                  click: (e) => {
                    this.$store.commit(
                      "toggleDebugPanel",
                      !this.debugPanelState.visible
                    );
                  },
                },
                {
                  text: `${
                    this.brushLibraryState.visible ? "Hide" : "Show"
                  } Brush Library`,
                  icon: this.brushLibraryState.visible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+b",
                  click: (e) => {
                    this.$store.commit(
                      "toggleBrushLibrary",
                      !this.brushLibraryState.visible
                    );
                  },
                },
                {
                  text: `${
                    this.layersLibraryState.visible ? "Hide" : "Show"
                  } Layers`,
                  icon: this.layersLibraryState.visible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+l",
                  click: (e) => {
                    this.layersLibraryState.visible =
                      !this.layersLibraryState.visible;
                    this.$store.commit(
                      "changeLayersLibraryState",
                      this.layersLibraryState
                    );
                  },
                },
                {
                  text: `${
                    this.toolbarState.visible ? "Hide" : "Show"
                  } Toolbar`,
                  icon: this.toolbarState.visible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+n",
                  click: (e) => {
                    this.toolbarState.visible = !this.toolbarState.visible;
                    this.$store.commit("changeToolBarState", this.toolbarState);
                  },
                },
                {
                  text: `${
                    this.brushPreviewState.visible ? "Hide" : "Show"
                  } Brush Preview`,
                  icon: this.brushPreviewState.visible
                    ? "check_box"
                    : "check_box_outline_blank",
                  hotkey: "ctrl+alt+e",
                  click: (e) => {
                    this.brushPreviewState.visible =
                      !this.brushPreviewState.visible;
                    this.$store.commit(
                      "changeBrushPreviewState",
                      this.brushPreviewState
                    );
                  },
                },
              ],
            },
            {
              text: "Toggle Grid",
              icon: this.gridView ? "check_box" : "check_box_outline_blank",
              hotkey: "alt+g",
              click: (e) => {
                this.$store.commit("toggleGridView", !this.gridView);
                this.$toasted.show(
                  `Grid view ${this.gridView ? "enabled" : "disabled"}`
                );
              },
            },
            {
              text: "Mirror X",
              hotkey: "alt+x",
              icon: this.toolbarState.mirrorX
                ? "check_box"
                : "check_box_outline_blank",
              click: (e) => {
                this.mirror.x = !this.toolbarState.mirrorX;
                this.$store.commit("updateMirror", this.mirror);
                this.$toasted.show(
                  `Mirror Y ${this.mirror.y ? "enabled" : "disabled"}`
                );
              },
            },
            {
              text: "Mirror Y",
              icon: this.toolbarState.mirrorY
                ? "check_box"
                : "check_box_outline_blank",
              hotkey: "alt+y",
              click: (e) => {
                this.mirror.y = !this.toolbarState.mirrorY;
                this.$store.commit("updateMirror", this.mirror);
                this.$toasted.show(
                  `Mirror Y ${this.mirror.y ? "enabled" : "disabled"}`
                );
              },
            },
            {
              text: "Update Brush",
              hotkey: "alt+u",
              icon: this.toolbarState.updateBrush
                ? "check_box"
                : "check_box_outline_blank",
              click: (e) => {
                this.$store.commit(
                  "toggleUpdateBrush",
                  !this.toolbarState.updateBrush
                );
                this.$toasted.show(
                  `Update Brush when colours or char changes ${
                    this.toolbarState.updateBrush ? "enabled" : "disabled"
                  }`
                );
              },
            },
            {
              is: "separator",
            },
            {
              text: "Flip Horizontal Brush",
              hotkey: "e",
              disabled: !this.isBrushing,
              icon: "swap_horiz",
              click: (e) => {
                this.$store.commit("flipRotateBlocks", { type: "flip" });
              },
            },
            {
              text: "Flip Vertical Brush",
              hotkey: "q",
              disabled: !this.isBrushing,
              icon: "swap_horiz",
              click: (e) => {
                this.$store.commit("flipRotateBlocks", { type: "rotate" });
              },
            },
            {
              is: "separator",
            },
            {
              text: "Swap FG and BG",
              hotkey: "alt+r",
              icon: "swap_horiz",
              click: (e) => {
                let bg = this.currentBg;
                let fg = this.currentFg;

                this.$store.commit("changeColourFg", bg);
                this.$store.commit("changeColourBg", fg);
              },
            },
            {
              text: "Change FG",
              hotkey: "alt+f",
              icon: "flip_to_front",
              click: (e) => {
                this.$store.commit(
                  "changeIsUpdatingFg",
                  !this.toolbarState.isChoosingFg
                );
              },
            },
            {
              text: "Change BG",
              hotkey: "alt+b",
              icon: "flip_to_back",
              click: (e) => {
                this.$store.commit(
                  "changeIsUpdatingBg",
                  !this.toolbarState.isChoosingBg
                );
              },
            },
            {
              text: "Change Char",
              hotkey: "alt+c",
              icon: "atm",
              click: (e) => {
                this.$store.commit(
                  "changeIsUpdatingChar",
                  !this.toolbarState.isChoosingChar
                );
              },
            },
            {
              is: "separator",
            },
            {
              text: "Options",
              icon: "settings",
              click: () => this.$store.commit("openModal", "options"),
              disabled: !this.isDefault,
              hotkey: "ctrl+o",
              // menu: [
              //   {
              //     text: "Show Options",
              //     click: () => this.$store.commit("openModal", "options"),
              //     icon: "settings",
              //   },
              // ],
            },
          ],
        });
      }

      menu.push({
        text: "Import",
        icon: "upload_file",
        menu: [
          {
            text: "mIRC File",
            click: () => this.startImport("mirc"),
            icon: "upload_file",
            hotkey: "ctrl+shift+o",
          },
          {
            text: "mIRC Clipboard",
            click: () => this.$store.commit("openModal", "paste-ascii"),
            hotkey: "ctrl+shift+v",
            icon: "copy_all",
          },
          {
            text: "ASCIIBIRD State",
            click: () => this.startImport("asb"),
            icon: "save_alt",
          },
        ],
      });

      if (this.asciibirdMeta.length) {
        menu.push(
          {
            text: "Export",
            icon: "save_alt",
            menu: [
              {
                text: "mIRC File",
                click: () => this.startExport("file"),
                icon: "download_file",
                hotkey: "ctrl+shift+f",
              },
              {
                text: "mIRC Clipboard",
                hotkey: "ctrl+shift+c",
                click: () => this.startExport("clipboard"),
                icon: "copy_all",
              },
              {
                text: "PNG Image",
                hotkey: "ctrl+shift+g",
                click: () => {
                  canvasToPng(
                    document.getElementById("canvas"),
                    this.currentAscii.title
                  );
                },
                icon: "image",
              },
              {
                text: "HTTP POST",
                click: () => this.startExport("post"),
                hotkey: "ctrl+shift+h",
                icon: "post_add",
              },
              {
                text: "ASCIIBIRD State",
                click: () => this.exportAsciibirdState(),
                icon: "save_alt",
              },
            ],
          },
          {
            text: "Layers",
            icon: "layers",
            menu: [
              // {
              //   text: "Change Layers",
              //   menu: this.asciiLayersMenu,
              // },
              {
                text: "Show/Hide Layer",
                click: () =>
                  this.$store.commit("toggleLayer", this.selectedLayer),
                icon: "panorama_fish_eye",
                hotkey: "ctrl+shift+t",
                disabled: !this.canToggleLayer,
              },
              {
                text: "Rename Layer",
                hotkey: "ctrl+shift+r",
                click: () =>
                  this.showLayerRename(
                    this.selectedLayer,
                    this.currentAsciiLayers[this.selectedLayer].label
                  ),
                icon: "text_rotation_none",
              },
              {
                text: "Add Layer",
                hotkey: "ctrl+shift+a",
                click: () => this.$store.commit("addLayer"),
                icon: "playlist_add",
              },
              {
                text: "Delete Layer",
                hotkey: "ctrl+shift+d",
                click: () =>
                  this.$store.commit("removeLayer", this.selectedLayer),
                icon: "delete_sweep",
                disabled: !this.canToggleLayer,
              },
              {
                text: "Move Layer Down",
                hotkey: "ctrl+shift+s",
                click: () => this.$store.commit("upLayer", this.selectedLayer),
                icon: "arrow_downward",
                disabled: !this.canToggleLayer,
              },
              {
                text: "Move Layer Up",
                hotkey: "ctrl+shift+w",
                click: () =>
                  this.$store.commit("downLayer", this.selectedLayer),
                icon: "arrow_upward",
                disabled: !this.canToggleLayer,
              },
              {
                text: "Merge All Layers",
                hotkey: "ctrl+shift+m",
                click: () => this.$store.commit("mergeAllLayers"),
                icon: "playlist_play",
                disabled: !this.canToggleLayer,
              },
            ],
          }
        );
      }

      return menu;
    },
  },
  watch: {
    // scrollOffset(val) {
    //   this.$refs.tabbar.style.top = val;
    //   this.toolbarString = `top: ${val}px`;
    // },
  },
  methods: {
    dispatchBlocks(blocks) {
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
          this.$store.commit("toggleDisableKeyboard", true);
          this.isShowingDialog = true;
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
                    console.log(response);
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
              this.isShowingDialog = false;
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
