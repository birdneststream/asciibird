<template>
  <div
    id="app"
    @contextmenu.prevent
  >
    <div v-show="menuBarVisible">
      <div
        v-if="!isKeyboardDisabled"
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
      ref="asciiInput"
      type="file"
      style="display: none"
      @change="onImport()"
    >

    <template v-if="asciibirdMeta.length">
      <div
        v-if="tabsVisible"
        ref="tabbar"
        class="bg-gray-500 relative z-auto"
        :style="toolbarString"
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
        <BrushCanvas :blocks="getSplashAscii()" />
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

<script setup lang="ts">
import { computed, reactive, ref, watch, onUnmounted } from 'vue';
import hotkeys from 'hotkeys-js';
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

import {
  parseMircAscii,
  toolbarIcons,
  exportMirc,
  downloadFile,
  checkForGetRequest,
  splashAscii,
  checkIrcByteLimits,
} from './ascii';

import { useAsciiBirdStore } from './store';
import { useToast } from './composables/useToast';
import { useDialog } from './composables/useDialog';
import { useClipboard } from './composables/useClipboard';

import type { Block } from './types';

defineOptions({ name: 'Dashboard' });

const store = useAsciiBirdStore();
const { messages: toasts, show: toastShow } = useToast();
const { state: dialogState, confirm: dialogConfirm, prompt: dialogPrompt, ok: dialogOk, cancel: dialogCancel } = useDialog();
const { copyText } = useClipboard();

// Template refs
const menu = ref<InstanceType<typeof ContextMenu> | null>(null);
const asciiInput = ref<HTMLInputElement | null>(null);
const tabbar = ref<HTMLElement | null>(null);

// Reactive state
const canvasX = ref<number | null>(null);
const canvasY = ref<number | null>(null);
const importType = ref<string | null>(null);
const selectedBlocks = ref<Block[][]>([]);
const textEditing = ref<unknown>(null);
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
const toolbarString = ref('top: 0px;');
const lastPostURL = ref('');
const drawBrush = ref(false);
const resetSelect = ref(false);
const diffBlocks = reactive({
  l: 0,
  old: [] as unknown[],
  new: [] as unknown[],
});
const updateAscii = ref<unknown>(false);

// Scroll handler (defined here so it can be referenced in onUnmounted)
const scrollHandler = () => {
  scrollOffset.value = window.scrollY;
};

// Lifecycle equivalent to created()
checkForGetRequest();
window.addEventListener('scroll', scrollHandler);

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler);
});

// Computed
const isSelecting = computed(() => currentTool.value?.name === 'select');
const currentTool = computed(() => toolbarIcons[store.currentTool] ?? null);

const asciibirdMeta = computed(() => store.asciibirdMeta);
const debugPanelState = computed(() => store.debugPanel);
const currentAscii = computed(() => store.currentAscii);
const currentTab = computed(() => store.currentTab);
const selectBlocks = computed(() => store.selectBlocks);
const modalState = computed(() => store.modalState);
const isModalOpen = computed(() => store.isModalOpen);

const isKeyboardDisabled = computed(() => store.isKeyboardDisabled);
const selectedLayer = computed(() => store.selectedLayer);
const canToggleLayer = computed(() => currentAsciiLayers.value.length > 1);
const brushSizeHeight = computed(() => store.brushSizeHeight);
const brushSizeWidth = computed(() => store.brushSizeWidth);
const brushSizeType = computed(() => store.brushSizeType);
const currentFg = computed(() => store.currentFg);
const currentBg = computed(() => store.currentBg);
const currentChar = computed(() => store.currentChar);
const toolbarState = computed(() => store.toolbarState);
const brushBlocks = computed(() => store.brushBlocks);
const tabsVisible = computed(() => store.tabsVisible);
const menuBarVisible = computed(() => store.menuBarVisible);
const currentAsciiLayerBlocks = computed(() => currentSelectedLayer.value?.data ?? []);
const currentAsciiLayers = computed(() => store.currentAsciiLayers);
const selectedLayerIndex = computed(() => currentAscii.value?.selectedLayer ?? 0);
const brushLibraryState = computed(() => store.brushLibraryState);
const brushPreviewState = computed(() => store.brushPreviewState);
const layersLibraryState = computed(() => store.layersLibraryState);
const currentSelectedLayer = computed(() => currentAsciiLayers.value[currentAscii.value?.selectedLayer ?? 0]);
const isBrushing = computed(() => currentTool.value?.name === 'brush');
const isErasing = computed(() => currentTool.value?.name === 'eraser');
const isSelected = computed(() =>
  selecting.value.startX !== null &&
  selecting.value.startY !== null &&
  selecting.value.endX !== null &&
  selecting.value.endY !== null
);

const menuBar = computed(() => [
  {
    label: 'File',
    items: [
      { text: 'New ASCII', click: () => store.openModal('new-ascii') },
      { text: 'Import from File', click: () => startImport('mirc') },
      { text: 'Import from Clipboard', click: () => store.openModal('paste-ascii') },
      {
        text: 'Export to File',
        click: () => startExport('file'),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Export to Clipboard',
        click: () => startExport('clipboard'),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Export to HTTP POST',
        click: () => startExport('post'),
        disabled: !asciibirdMeta.value.length,
      },
    ],
  },
  {
    label: 'Edit',
    items: [
      {
        text: 'Edit ASCII',
        click: () => store.openModal('edit-ascii'),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Undo',
        click: () => store.undoBlocks(),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: 'Redo',
        click: () => store.redoBlocks(),
        disabled: !asciibirdMeta.value.length,
      },
    ],
  },
  {
    label: 'View',
    items: [
      {
        text: menuBarVisible.value ? 'Hide Menu Bar' : 'Show Menu Bar',
        click: () => store.changeMenuBarVisible(!menuBarVisible.value),
      },
      {
        text: tabsVisible.value ? 'Hide Tabs' : 'Show Tabs',
        click: () => store.changeTabsVisible(!tabsVisible.value),
      },
      {
        text: toolbarState.value.gridView ? 'Disable Grid' : 'Enable Grid',
        click: () => store.toggleGridView(!toolbarState.value.gridView),
        disabled: !asciibirdMeta.value.length,
      },
      {
        text: debugPanelState.value.visible ? 'Hide Debug' : 'Show Debug',
        click: () => store.toggleDebugPanel(!debugPanelState.value.visible),
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      { text: 'Options', click: () => store.openModal('options') },
      { text: 'Image Overlay', click: () => store.openModal('overlay'), disabled: !asciibirdMeta.value.length },
    ],
  },
  {
    label: 'Help',
    items: [
      { text: 'About', click: () => store.openModal('about') },
      { text: 'Help', click: () => store.openModal('help') },
    ],
  },
]);

// Watch
watch(isModalOpen, (val) => {
  if (val) {
    hotkeys.deleteScope('all');
  }
});

watch(isKeyboardDisabled, (val) => {
  if (val) {
    hotkeys.deleteScope('all');
  }
});

watch(currentTool, (val, old) => {
  if (old?.name === 'select') {
    selectedBlocks.value = [];
  }
});

// Methods
function getSplashAscii() {
  return splashAscii;
}

function updateAsciiDetails(widthHeight: unknown) {
  updateAscii.value = widthHeight;
}

function dispatchBlocks() {
  diffBlocks.old = (diffBlocks.old as unknown[][]).flat();
  diffBlocks.new = (diffBlocks.new as unknown[][]).flat();

  store.updateAsciiBlocksAsync({
    blocks: currentAsciiLayerBlocks.value,
    diff: { ...diffBlocks } as { l: number; old: unknown[]; new: unknown[] },
  });

  diffBlocks.l = selectedLayerIndex.value;
  diffBlocks.new = [];
  diffBlocks.old = [];
}

function storeDiffBlocks(x: number, y: number, oldBlock: Block, newBlock: Block) {
  const oldArr = diffBlocks.old as unknown[][];
  const newArr = diffBlocks.new as unknown[][];

  if (!oldArr[y]) {
    oldArr[y] = [];
  }

  if (!oldArr[y][x]) {
    oldArr[y][x] = {
      x,
      y,
      b: { ...oldBlock },
    };
  }

  if (!newArr[y]) {
    newArr[y] = [];
  }

  if (!newArr[y][x]) {
    newArr[y][x] = {
      x,
      y,
      b: { ...newBlock },
    };
  }
}

function showLayerRename(key: number, label: string) {
  store.toggleDisableKeyboard(true);
  dialogPrompt({
    title: 'Rename Layer',
    text: 'Please input your new layer name',
    inputValue: label,
  }).then((result: { input: string; isOk: boolean }) => {
    if (!result.input.length) {
      toastShow('You must enter a layer name!', {
        type: 'error',
      });
      store.toggleDisableKeyboard(false);
      return;
    }

    if (result.isOk) {
      updateLayerName(key, result.input);
    }

    store.toggleDisableKeyboard(false);
  });
}

function updateLayerName(key: number, label: string) {
  store.updateLayerName({ key, label });
}

function triggerbrush() {
  drawBrush.value = !drawBrush.value;
}

function inputtingbrush(val: boolean) {
  isInputtingBrushSize.value = val;
}

function buttonStyle(key: number) {
  return currentTab.value === key
    ? 'text-sm pl-1 p-1 h-10 text-white border border-transparent shadow-sm hover:bg-blue-500 bg-gray-900'
    : 'text-sm pl-1 p-1 h-10 text-white border border-transparent shadow-sm hover:bg-blue-500 bg-gray-400';
}

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  menu.value?.open(e);
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

function startImport(type: string) {
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

function startExport(type: string) {
  const ascii = exportMirc();

  const checkLines = checkIrcByteLimits(ascii.output.join(''));

  if (checkLines.length) {
    const displayLines = checkLines.join(', ');
    toastShow(
      `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
      { type: 'error', duration: 1200 }
    );
  }

  switch (type) {
    case 'clipboard':
      copyText(ascii.output.join('')).then(
        () => {
          toastShow('Copied mIRC to clipboard!', { type: 'success' });
        },
        () => {
          toastShow('Error when copying mIRC to clipboard!', {
            type: 'error',
          });
        }
      );
      break;

    default:
    case 'file':
      downloadFile(ascii.output.join(''), ascii.filename, 'text/plain');
      break;

    case 'post':
      store.toggleDisableKeyboard(true);
      dialogPrompt({
        title: 'HTTP Post your Ascii',
        text: 'Please input the URL for the HTTP Post sir',
        inputValue: lastPostURL.value,
      }).then((result: { input?: string; isOk: boolean }) => {
        if (result.input === undefined) {
          toastShow('Come on bro. Get it together.', {
            type: 'error',
          });
          store.toggleDisableKeyboard(false);
          return;
        }

        if (result.isOk) {
          const asciiPost = exportMirc();
          lastPostURL.value = result.input;
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: asciiPost.output.join(''),
          };
          fetch(lastPostURL.value, requestOptions)
            .then((response) => {
              if (response.status === 200 || response.status === 201) {
                toastShow('POSTed ascii!', { type: 'success' });
              } else {
                toastShow(
                  `Error: ${response.status} ${response.statusText}`,
                  { type: 'error' }
                );
              }
            })
            .catch((error) => {
              toastShow(`Error: ${JSON.stringify(error)}`, {
                type: 'error',
              });
            });
        }

        store.toggleDisableKeyboard(false);
      });

      break;
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

// Expose for parent / external access
// In <script setup>, top-level bindings are automatically exposed
defineExpose({
  dispatchBlocks,
  storeDiffBlocks,
  showLayerRename,
  updateLayerName,
  triggerbrush,
  selectedBlocks,
  textEditing,
  drawBrush,
  diffBlocks,
  isBrushing,
  isErasing,
  isSelected,
  currentTool,
  currentFg,
  currentBg,
  currentChar,
  toolbarState,
  brushBlocks,
  selectBlocks,
  brushSizeWidth,
  brushSizeHeight,
  brushSizeType,
  currentAsciiLayers,
  currentSelectedLayer,
  currentAsciiLayerBlocks,
  canToggleLayer,
  selectedLayer,
  selectedLayerIndex,
  isSelecting,
  asciibirdMeta,
  currentAscii,
  currentTab,
  updateCanvas,
  updateAscii,
  resetSelect,
  selecting,
  isInputtingBrushSize,
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
