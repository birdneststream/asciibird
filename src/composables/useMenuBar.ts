// Menu bar definition — extracted from Dashboard.vue
import { computed, ref, nextTick } from 'vue';
import { useAsciiBirdStore } from '../store';
import { useModalStore } from '../store/modal';
import { useDesktopStore } from '../store/desktop';
import { usePanelStore } from '../store/panels';
import { useToolbarStore } from '../store/toolbar';
import type { AppMenuBar } from '../types';

export interface MenuBarActions {
  startImport: (type: 'mirc' | 'asb' | 'ansi') => void;
  handleExport: (type: 'file' | 'clipboard' | 'post') => void;
  handleExportAnsi: () => void;
  handleExportHtml: (target: 'clipboard' | 'file') => void;
  handleExportPlainText: (target: 'clipboard' | 'file') => void;
  handleCropToContent: () => void;
}

// eslint-disable-next-line max-lines-per-function -- menu bar definition: static data literal with store access
export function useMenuBar(actions: MenuBarActions) {
  const store = useAsciiBirdStore();
  const modalStore = useModalStore();
  const desktopStore = useDesktopStore();
  const panelStore = usePanelStore();
  const toolbarStore = useToolbarStore();

  // ── Hover cascade state ────────────────────────────────────────
  const menuButtonRefs = ref<(HTMLButtonElement | null)[]>([]);
  const activeMenuIndex = ref<number | null>(null);

  function onMenuButtonMouseEnter(index: number) {
    if (activeMenuIndex.value !== null && activeMenuIndex.value !== index) {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true }),
      );
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

  // ── Computed values used in menu items ──────────────────────────
  const asciibirdMeta = computed(() => store.asciibirdMeta);
  const menuBarVisible = computed(() => desktopStore.menuBarVisible);
  const tabsVisible = computed(() => desktopStore.tabsVisible);
  const toolbarState = computed(() => toolbarStore.toolbarState);
  const debugPanelState = computed(() => panelStore.debugPanel);

  // ── Menu bar definition ────────────────────────────────────────
  // eslint-disable-next-line max-lines-per-function -- menu items: static data array
  const menuBar = computed<AppMenuBar[]>(() => [
    {
      label: 'File',
      items: [
        {
          text: 'New ASCII',
          click: () => modalStore.openModal('new-ascii'),
          shortcut: 'Ctrl+M',
        },
      ],
    },
    {
      label: 'Import',
      items: [
        {
          text: 'Paste from Clipboard',
          click: () => modalStore.openModal('paste-ascii'),
          shortcut: 'Ctrl+Shift+V',
        },
        {
          text: 'mIRC File',
          click: () => actions.startImport('mirc'),
          shortcut: 'Ctrl+Shift+O',
        },
        {
          text: 'ANSI File',
          click: () => actions.startImport('ansi'),
        },
      ],
    },
    {
      label: 'Export',
      items: [
        {
          text: 'mIRC to Clipboard',
          click: () => actions.handleExport('clipboard'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'mIRC File',
          click: () => actions.handleExport('file'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'ANSI File',
          click: () => actions.handleExportAnsi(),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'HTML File',
          click: () => actions.handleExportHtml('file'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'HTML to Clipboard',
          click: () => actions.handleExportHtml('clipboard'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'Plain Text to Clipboard',
          click: () => actions.handleExportPlainText('clipboard'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'Plain Text File',
          click: () => actions.handleExportPlainText('file'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'HTTP POST',
          click: () => actions.handleExport('post'),
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
        {
          text: 'Add Border...',
          click: () => modalStore.openModal('border-generator'),
          disabled: !asciibirdMeta.value.length,
        },
        {
          text: 'Crop to Content',
          click: () => actions.handleCropToContent(),
          disabled: !asciibirdMeta.value.length,
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
          text: toolbarState.value.gridView
            ? 'Disable Grid' : 'Enable Grid',
          click: () => toolbarStore.toggleGridView(
            !toolbarState.value.gridView,
          ),
          disabled: !asciibirdMeta.value.length,
          shortcut: 'Alt+G',
        },
        {
          text: debugPanelState.value.visible
            ? 'Hide Debug' : 'Show Debug',
          click: () => panelStore.toggleDebugPanel(
            !debugPanelState.value.visible,
          ),
        },
        {
          text: 'Zoom In',
          click: () => store.setBlockMultiplier(
            store.blockSizeMultiplier + 0.25,
          ),
          disabled: !asciibirdMeta.value.length,
          shortcut: 'Ctrl+=',
        },
        {
          text: 'Zoom Out',
          click: () => store.setBlockMultiplier(
            store.blockSizeMultiplier - 0.25,
          ),
          disabled: !asciibirdMeta.value.length,
          shortcut: 'Ctrl+-',
        },
        {
          text: 'Reset Zoom',
          click: () => store.setBlockMultiplier(1),
          disabled: !asciibirdMeta.value.length,
          shortcut: 'Ctrl+0',
        },
        {
          text: 'Reset Layout',
          click: () => {
            panelStore.resetAllPanelPositions();
            toolbarStore.resetToolbarPosition();
            toolbarStore.pickerPos = null;
            store.resetCanvasPosition();
          },
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

  return {
    menuBar,
    menuButtonRefs,
    activeMenuIndex,
    onMenuButtonMouseEnter,
    onMenuItemsOpen,
    onMenuBarMouseLeave,
  };
}
