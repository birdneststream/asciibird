<template>
  <div
    id="app"
    @contextmenu.prevent
  >
    <div v-show="menuBarVisible">
      <div
        v-if="!isKeyboardDisabled"
        class="flex items-center border-b bg-surface-container text-on-surface border-outline-variant"
        @mouseleave="onMenuBarMouseLeave"
      >
        <h1 class="font-headline-md text-headline-md font-bold text-on-surface tracking-tight px-md select-none">
          ASCIIBIRD
        </h1>
        <Menu
          v-for="(menuItem, index) in menuBar"
          :key="menuItem.label"
          as="div"
          class="relative"
        >
          <MenuButton
            :ref="(el: ComponentPublicInstance | Element | null) => menuButtonRefs[index] = (el as ComponentPublicInstance)?.$el ?? el"
            class="px-3 py-1.5 text-sm transition-colors duration-150 hover:bg-surface-container-highest text-on-surface-variant"
            @mouseenter="onMenuButtonMouseEnter(index)"
          >
            {{ menuItem.label }}
          </MenuButton>
          <MenuItems
            class="absolute mt-0 shadow-panel rounded-b min-w-48 z-menu border bg-surface-container-high border-outline-variant"
            @focus="onMenuItemsOpen(index)"
          >
            <MenuItem
              v-for="item in menuItem.items"
              :key="item.text"
              :disabled="item.disabled"
              v-slot="{ active, disabled }"
            >
              <button
                :class="[
                  active ? 'bg-surface-container-highest' : '',
                  disabled ? 'opacity-50 cursor-not-allowed' : '',
                  'flex w-full items-center justify-between px-4 py-1 text-sm',
                ]"
                class="text-on-surface"
                @click="item.click"
              >
                <span>{{ item.text }}</span>
                <span
                  v-if="item.shortcut"
                  class="ml-4 text-xs text-outline"
                >{{ item.shortcut }}</span>
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
      @update-ascii="() => {}"
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
      class="z-picker"
    >
      <ul>
        <li
          @click="modalStore.openModal('new-ascii')"
          class="ab-context-menu-item"
        >
          New ASCII
        </li>
        <li
          @click="modalStore.openModal('edit-ascii')"
          class="ab-context-menu-item"
          v-if="asciibirdMeta.length"
        >
          Edit Ascii
        </li>
        <li
          @click="closeTab(currentTab)"
          class="ab-context-menu-item border-b border-outline-variant"
          v-if="asciibirdMeta.length"
        >
          Close Ascii
        </li>
        <li
          @click="modalStore.openModal('options')"
          class="ab-context-menu-item border-b border-outline-variant"
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
          @click="handleExport('file')"
          class="ab-context-menu-item border-b border-outline-variant"
          v-if="asciibirdMeta.length"
        >
          Export to File
        </li>
        <li
          class="ab-context-menu-item"
          @click="modalStore.openModal('paste-ascii')"
        >
          Import from Clipboard
        </li>
        <li
          class="ab-context-menu-item"
          @click="handleExport('clipboard')"
          v-if="asciibirdMeta.length"
        >
          Export to Clipboard
        </li>
        <li
          class="ab-context-menu-item border-b border-outline-variant"
          @click="handleExport('post')"
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

    <context-menu
      ref="tabMenu"
      class="z-picker"
    >
      <ul>
        <li
          @click="editTabFromMenu"
          class="ab-context-menu-item"
        >
          Edit Dimensions
        </li>
        <li
          @click="closeTabFromMenu"
          class="ab-context-menu-item"
        >
          Close Tab
        </li>
      </ul>
    </context-menu>

    <span
      @mouseup.right="openContextMenu"
      style="width: 100%; height: 100%; position: absolute; z-index: -1"
    />

    <input
      ref="asciiInput"
      type="file"
      style="display: none"
      @change="onImport()"
    >

    <template v-if="asciibirdMeta.length">
      <div
        v-if="tabsVisible"
        ref="tabbar"
        class="relative z-auto border-b bg-surface-container-low border-outline-variant h-9 flex items-stretch px-xs gap-px overflow-x-auto custom-scrollbar"
        style="top: 0px"
      >
        <div
          v-for="(value, key) in asciibirdMeta"
          :key="key"
          class="h-9 flex items-center gap-xs px-sm cursor-pointer transition-colors duration-150 min-w-[120px] max-w-[200px] group select-none"
          :class="tabClass(key)"
          @click="changeTab(key)"
          @mouseup.middle.prevent="closeTab(key)"
          @contextmenu.prevent="openTabContextMenu($event, key)"
        >
          <span
            class="material-icons text-sm flex-shrink-0"
            :class="key === currentTab ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'"
            aria-hidden="true"
          >
            insert_drive_file
          </span>
          <input
            v-if="isTabEditing(key)"
            data-inline-rename-input
            v-model="tabEditingName"
            class="font-label-mono text-label-mono bg-surface-container-lowest border border-primary rounded px-1 py-0 outline-none flex-1 min-w-0"
            @keydown.enter.stop="commitTabEdit"
            @keydown.escape.stop="cancelTabEdit"
            @blur="commitTabEdit"
            @click.stop
          >
          <span
            v-else
            class="font-label-mono text-label-mono truncate flex-1 min-w-0"
            :class="key === currentTab ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'"
            @dblclick.stop="startTabEdit(key, value.title)"
          >
            {{ value.title }}
          </span>
          <button
            class="material-icons text-sm inline-flex items-center justify-center transition-opacity flex-shrink-0"
            :class="[
              key === currentTab
                ? 'text-on-surface-variant hover:text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 focus:opacity-100',
            ]"
            style="font-size: 14px"
            aria-label="Close tab"
            @click.stop="closeTab(key)"
          >
            close
          </button>
        </div>
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
        v-show="toolbarState.visible && !toolbarState.minimized"
      />

      <DebugPanel
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        v-show="debugPanelState.visible && !debugPanelState.minimized"
        :y-offset="scrollOffset"
      />

      <BrushLibrary
        v-show="brushLibraryState.visible && !brushLibraryState.minimized"
        :y-offset="scrollOffset"
      />

      <BrushPreview
        @inputtingbrush="inputtingbrush"
        :y-offset="scrollOffset"
        v-show="brushPreviewState.visible && !brushPreviewState.minimized"
      />

      <LayersLibrary
        v-show="layersLibraryState.visible && !layersLibraryState.minimized"
        :y-offset="scrollOffset"
      />

      <CharPicker
        v-show="toolbarState.isChoosingChar"
        class="z-picker"
        :y-offset="scrollOffset"
      />
      <ColourPicker
        v-if="toolbarState.isChoosingFg || toolbarState.isChoosingBg"
        class="z-picker"
        :y-offset="scrollOffset"
      />
    </template>
    <template v-else>
      <div
        class="absolute left-1/2 transform -translate-x-1/2 text-center"
        @mouseup.right="openContextMenu"
      >
        <BrushCanvas :blocks="getSplashAscii()" />
      </div>
    </template>

    <!-- Toast notifications -->
    <div class="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-toast flex flex-col items-center gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="msg in toasts"
          :key="msg.id"
          :class="[
            'px-4 py-2 rounded shadow-lg text-sm',
            msg.type === 'error'
              ? 'bg-error text-on-error'
              : msg.type === 'success'
                ? 'bg-secondary-container text-on-secondary'
                : 'bg-primary-container text-white',
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
            class="ab-button bg-primary-container"
            @click="dialogOk"
          >
            OK
          </button>
        </div>
      </template>
    </ABModal>

    <!-- Status Bar -->
    <template v-if="asciibirdMeta.length">
      <StatusBar
        :canvas-x="canvasX"
        :canvas-y="canvasY"
        :layer-label="currentSelectedLayer?.label ?? null"
        :layer-index="selectedLayerIndex"
        :layer-count="currentAsciiLayers.length"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue';
import LZString from 'lz-string';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from '@headlessui/vue';


import Toolbar from './components/Toolbar.vue';
import DebugPanel from './components/DebugPanel.vue';
import BrushLibrary from './components/BrushLibrary.vue';
import LayersLibrary from './components/LayersLibrary.vue';
import Editor from './views/Editor.vue';

import CharPicker from './components/parts/CharPicker.vue';
import ColourPicker from './components/parts/ColourPicker.vue';
import ContextMenu from './components/parts/ContextMenu.vue';

import NewAscii from './components/modals/NewAscii.vue';
import Options from './components/modals/Options.vue';
import ImageOverlay from './components/modals/ImageOverlay.vue';
import EditAscii from './components/modals/EditAscii.vue';
import PasteAscii from './components/modals/PasteAscii.vue';
import About from './components/modals/About.vue';
import Help from './components/modals/Help.vue';
import ABModal from './components/ABModal.vue';

import BrushCanvas from './components/parts/BrushCanvas.vue';
import BrushPreview from './components/parts/BrushPreview.vue';
import KeyboardShortcuts from './components/parts/KeyboardShortcuts.vue';
import StatusBar from './components/parts/StatusBar.vue';

import {
  parseMircAscii,
  toolbarIcons,
  exportMirc,
  downloadFile,
  checkForGetRequest,
  splashAscii,
} from './ascii';

import { useAsciiBirdStore } from './store';
import { useModalStore } from './store/modal';
import { useDesktopStore } from './store/desktop';
import { usePanelStore } from './store/panels';
import { useToolbarStore } from './store/toolbar';
import { useToast } from './composables/useToast';
import { useDialog } from './composables/useDialog';
import { useExportAscii } from './composables/useExportAscii';
import { useGlobalShortcuts } from './composables/useGlobalShortcuts';
import { useInlineRename } from './composables/useInlineRename';
import type { Block, AppMenuBar } from './types';

defineOptions({ name: 'Dashboard' });

const store = useAsciiBirdStore();
const modalStore = useModalStore();
const desktopStore = useDesktopStore();
const panelStore = usePanelStore();
const toolbarStore = useToolbarStore();
const { messages: toasts, show: toastShow } = useToast();
const { state: dialogState, confirm: dialogConfirm, prompt: dialogPrompt, ok: dialogOk, cancel: dialogCancel } = useDialog();
const { startExport } = useExportAscii({ checkLimits: true });

// Register global keyboard shortcuts (menu + tool shortcuts)
useGlobalShortcuts();

// Tab inline rename composable
const {
  editingKey: _tabEditingKey,
  editingName: tabEditingName,
  startEdit: startTabEdit,
  commitEdit: commitTabEdit,
  cancelEdit: cancelTabEdit,
  isEditing: isTabEditing,
} = useInlineRename<number>(
  (key, newName) => {
    if (store.asciibirdMeta[key]) {
      store.asciibirdMeta[key].title = newName;
    }
  },
);

// Template refs
const menu = ref<InstanceType<typeof ContextMenu> | null>(null);
const tabMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const tabMenuTarget = ref<number>(0);
const asciiInput = ref<HTMLInputElement | null>(null);
const tabbar = ref<HTMLElement | null>(null);

// Reactive state
const canvasX = ref<number | null>(null);
const canvasY = ref<number | null>(null);
const importType = ref<'mirc' | 'asb' | null>(null);
const selectedBlocks = ref<Block[][]>([]);
const textEditing = ref<{
  startX: number | null;
  startY: number | null;
} | null>(null);
const updateCanvas = ref(false);
const selecting = ref({
  startX: null as number | null,
  startY: null as number | null,
  endX: null as number | null,
  endY: null as number | null,
  canSelect: false,
});
const isInputtingBrushSize = ref(false);
const scrollOffset = ref(0);
const lastPostURL = ref('');
const resetSelect = ref(false);
const updateAscii = ref(false);

// Menu hover cascading state
const menuButtonRefs = ref<(HTMLButtonElement | null)[]>([]);
const activeMenuIndex = ref<number | null>(null);

function onMenuButtonMouseEnter(index: number) {
  // If a menu is already open and user hovers a different button,
  // close the active menu by simulating an outside click (mousedown on
  // body triggers HUI's outside-click handler), then open the new menu.
  if (activeMenuIndex.value !== null && activeMenuIndex.value !== index) {
    document.body.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    // Double nextTick ensures Headless UI processes the close before
    // we trigger the open. Single nextTick is too early because HUI
    // needs to update its internal state from the outside-click.
    nextTick(() => {
      nextTick(() => {
        menuButtonRefs.value[index]?.click();
      });
    });
  }
}

function onMenuItemsOpen(index: number) {
  activeMenuIndex.value = index;
}

function onMenuBarMouseLeave() {
  activeMenuIndex.value = null;
}

// Scroll handler (defined here so it can be referenced in onUnmounted)
const scrollHandler = () => {
  scrollOffset.value = window.scrollY;
};

// Handler for Ctrl+Shift+O import shortcut (from useGlobalShortcuts)
const importFileHandler = () => {
  startImport('mirc');
};

// Handler for Ctrl+C copy blocks shortcut (from useGlobalShortcuts)
const copyBlocksHandler = () => {
  if (selectedBlocks.value.length > 0) {
    toolbarStore.setSelectBlocks(selectedBlocks.value);
    toastShow('Copied blocks to clipboard', { type: 'success' });
  }
};

// Lifecycle equivalent to created()
checkForGetRequest();
window.addEventListener('scroll', scrollHandler);
window.addEventListener('asciibird:import-file', importFileHandler);
window.addEventListener('asciibird:copy-blocks', copyBlocksHandler);

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler);
  window.removeEventListener('asciibird:import-file', importFileHandler);
  window.removeEventListener('asciibird:copy-blocks', copyBlocksHandler);
});

// Computed
const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool] ?? null);

const asciibirdMeta = computed(() => store.asciibirdMeta);
const debugPanelState = computed(() => panelStore.debugPanel);
const currentAscii = computed(() => store.currentAscii);
const currentTab = computed(() => store.currentTab);
const modalState = computed(() => modalStore.modalState);
const isKeyboardDisabled = computed(() => modalStore.isKeyboardDisabled);
const toolbarState = computed(() => toolbarStore.toolbarState);
const tabsVisible = computed(() => desktopStore.tabsVisible);
const menuBarVisible = computed(() => desktopStore.menuBarVisible);
const currentAsciiLayers = computed(() => store.currentAsciiLayers);
const selectedLayerIndex = computed(() => currentAscii.value?.selectedLayer ?? 0);
const brushLibraryState = computed(() => panelStore.brushLibrary);
const brushPreviewState = computed(() => panelStore.brushPreview);
const layersLibraryState = computed(() => panelStore.layersLibrary);
const currentSelectedLayer = computed(() => currentAsciiLayers.value[currentAscii.value?.selectedLayer ?? 0]);

const menuBar = computed<AppMenuBar[]>(() => [
  {
    label: 'File',
    items: [
      {
        text: 'New ASCII',
        click: () => modalStore.openModal('new-ascii'),
        shortcut: 'Ctrl+M',
      },
      {
        text: 'Import from File',
        click: () => startImport('mirc'),
        shortcut: 'Ctrl+Shift+O',
      },
      {
        text: 'Import from Clipboard',
        click: () => modalStore.openModal('paste-ascii'),
        shortcut: 'Ctrl+Shift+V',
      },
      {
        text: 'Export to File',
        click: () => handleExport('file'),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Export to Clipboard',
        click: () => handleExport('clipboard'),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Export to HTTP POST',
        click: () => handleExport('post'),
        disabled: !asciibirdMeta.value.length,
      },
    ],
  },
  {
    label: 'Edit',
    items: [
      {
        text: 'Edit ASCII',
        click: () => modalStore.openModal('edit-ascii'),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+E',
      },
      {
        text: 'Undo',
        click: () => store.undoBlocks(),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+Z',
      },
      {
        text: 'Redo',
        click: () => store.redoBlocks(),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+Y',
      },
    ],
  },
  {
    label: 'View',
    items: [
      {
        text: menuBarVisible.value ? 'Hide Menu Bar' : 'Show Menu Bar',
        click: () => desktopStore.changeMenuBarVisible(!menuBarVisible.value),
      },
      {
        text: tabsVisible.value ? 'Hide Tabs' : 'Show Tabs',
        click: () => desktopStore.changeTabsVisible(!tabsVisible.value),
      },
      {
        text: toolbarState.value.gridView ? 'Disable Grid' : 'Enable Grid',
        click: () => toolbarStore.toggleGridView(!toolbarState.value.gridView),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Alt+G',
      },
      {
        text: debugPanelState.value.visible ? 'Hide Debug' : 'Show Debug',
        click: () => panelStore.toggleDebugPanel(!debugPanelState.value.visible),
      },
      {
        text: 'Zoom In',
        click: () => store.setBlockMultiplier(store.blockSizeMultiplier + 0.25),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+=',
      },
      {
        text: 'Zoom Out',
        click: () => store.setBlockMultiplier(store.blockSizeMultiplier - 0.25),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+-',
      },
      {
        text: 'Reset Zoom',
        click: () => store.setBlockMultiplier(1),
        disabled: !asciibirdMeta.value.length,
        shortcut: 'Ctrl+0',
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        text: 'Options',
        click: () => modalStore.openModal('options'),
        shortcut: 'Ctrl+O',
      },
      {
        text: 'Image Overlay',
        click: () => modalStore.openModal('overlay'),
        disabled: !asciibirdMeta.value.length,
      },
    ],
  },
  {
    label: 'Help',
    items: [
      {
        text: 'About',
        click: () => modalStore.openModal('about'),
        shortcut: 'Shift+F1',
      },
      {
        text: 'Help',
        click: () => modalStore.openModal('help'),
        shortcut: 'F1',
      },
    ],
  },
]);

// Watch — scope transitions handled by useGlobalShortcuts composable
watch(currentTool, (val, old) => {
  if (old?.name === 'select') {
    selectedBlocks.value = [];
  }
});

// Methods
function getSplashAscii() {
  return splashAscii;
}

function inputtingbrush(val: boolean) {
  isInputtingBrushSize.value = val;
}

function tabClass(key: number) {
  return currentTab.value === key
    ? 'bg-surface-container-highest border-t-2 border-primary shadow-[inset_0_1px_0_rgba(173,198,255,0.1)]'
    : 'border-t-2 border-transparent hover:bg-surface-variant/30';
}

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  menu.value?.open({ clientX: e.clientX, clientY: e.clientY });
}

function openTabContextMenu(e: MouseEvent, key: number) {
  tabMenuTarget.value = key;
  tabMenu.value?.open({ clientX: e.clientX, clientY: e.clientY });
}

function editTabFromMenu() {
  tabMenu.value?.close();
  const key = tabMenuTarget.value;
  if (asciibirdMeta.value[key]) {
    changeTab(key);
    modalStore.openModal('edit-ascii');
  }
}

function closeTabFromMenu() {
  tabMenu.value?.close();
  closeTab(tabMenuTarget.value);
}

function updateCoords(value: { x: number; y: number }) {
  canvasX.value = value.x;
  canvasY.value = value.y;
}

function selectedblocks(value: Block[][]) {
  selectedBlocks.value = value;
}

function updateSelecting(value: typeof selecting.value) {
  selecting.value = { ...value };
}

function textediting(value: unknown) {
  textEditing.value = value;
}

function updatecanvas() {
  updateCanvas.value = !updateCanvas.value;
}

async function onImport() {
  const input = asciiInput.value;
  if (!input) return;

  const files = input.files;
  if (!files || !files.length) return;

  const filename = files[0].name;
  const fileReader = new FileReader();

  const fileType = importType.value;
  fileReader.addEventListener('load', async () => {
    switch (fileType) {
      case 'asb':
        importAsciibirdState(fileReader.result as string);
        break;

      default:
      case 'mirc':
        await parseMircAscii(fileReader.result as string, filename);
        break;
    }

    // Reset input so the same file can be imported again
    input.value = '';
  });

  fileReader.readAsText(files[0]);
}

function startImport(type: 'mirc' | 'asb') {
  importType.value = type;
  asciiInput.value?.click();
}

function importAsciibirdState(fileContents: string) {
  try {
    const contents = JSON.parse(
      LZString.decompressFromEncodedURIComponent(fileContents)
    );
    store.changeState({ ...contents });
  } catch {
    toastShow('Failed to import ASCIIBIRD state. File may be corrupted.', {
      type: 'error',
    });
  }
}

function exportAsciibirdState() {
  try {
    const output = LZString.compressToEncodedURIComponent(
      JSON.stringify(store.state)
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
      'application/gzip'
    );
  } catch (err) {
    toastShow(String(err), { type: 'error' });
  }
}

function handleExport(type: 'file' | 'clipboard' | 'post') {
  if (type === 'post') {
    modalStore.toggleDisableKeyboard(true);
    dialogPrompt({
      title: 'HTTP Post your Ascii',
      text: 'Please input the URL for the HTTP Post sir',
      inputValue: lastPostURL.value,
    }).then((result: { input?: string; isOk: boolean }) => {
      if (result.input === undefined) {
        toastShow('Come on bro. Get it together.', {
          type: 'error',
        });
        modalStore.toggleDisableKeyboard(false);
        return;
      }

      if (result.isOk) {
        const asciiText = exportMirc().output.join('');
        lastPostURL.value = result.input;
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: asciiText,
        };
        fetch(lastPostURL.value, requestOptions)
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              toastShow('POSTed ascii!', { type: 'success' });
            } else {
              toastShow(
                `Error: ${response.status} ${response.statusText}`,
                { type: 'error' },
              );
            }
          })
          .catch((error) => {
            toastShow(`Error: ${JSON.stringify(error)}`, {
              type: 'error',
            });
          });
      }

      modalStore.toggleDisableKeyboard(false);
    });
  } else {
    startExport(type as 'clipboard' | 'file');
  }
}

function changeTab(key: number) {
  store.changeTab(key);
}

function closeTab(key: number) {
  dialogConfirm({
    title: `Close ${asciibirdMeta.value[key]?.title ?? ''}?`,
    text: 'This action cannot be undone and the ASCII will be gone.',
  }).then((result: { isOk: boolean }) => {
    if (result.isOk) {
      store.closeTab(key);
    }
  });
}

// Expose — minimal surface for external access
// Dashboard is the root component; nothing currently accesses these
// but keeping a small subset for potential future use
defineExpose({
  asciibirdMeta,
  currentTab,
  updateCanvas,
  resetSelect,
  selecting,
  isInputtingBrushSize,
  selectedBlocks,
  textEditing,
  canvasX,
  canvasY,
});
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
