// Menu definition composable for ASCIIBIRD Dashboard
// Extracted from Dashboard.vue to reduce component size.
// Note: This is temporary for Vue 2 Options API — will become a proper
// composable with injected dependencies in Phase 5 (Vue 3 + Composition API).

import {
  filterNullBlocks,
  canvasToPng,
  maxBrushSize,
} from '../ascii';

/**
 * Context object providing reactive state and methods from Dashboard.vue
 */
export interface MenuContext {
  // Store access
  store: {
    commit: (mutation: string, _payload?: any) => void;
    dispatch: (action: string, _payload?: any) => void;
    getters: Record<string, any>;
  };

  // Toast notifications
  toasted: {
    show: (_message: string, _options?: Record<string, any>) => void;
  };

  // Dialog prompts
  dialog: {
    confirm: (_options: Record<string, any>) => Promise<any>;
    prompt: (_options: Record<string, any>) => Promise<any>;
  };

  // Clipboard
  copyText: (_text: string) => Promise<any>;

  // Reactive state (accessed as getters)
  isMacLike: boolean;
  asciibirdMeta: any[];
  currentTab: number;
  currentTool: { name: string };
  isSelecting: boolean;
  isBrushing: boolean;
  isErasing: boolean;
  isSelected: boolean;
  selectedBlocks: any[];
  selectBlocks: any[];
  brushBlocks: any[];
  canFg: boolean;
  canBg: boolean;
  canText: boolean;
  currentFg: number;
  currentBg: number;
  currentChar: string;
  brushSizeHeight: number;
  brushSizeWidth: number;
  brushSizeType: string;
  gridView: boolean;
  toolbarState: any;
  debugPanelState: any;
  brushLibraryState: any;
  brushPreviewState: any;
  layersLibraryState: any;
  tabsVisible: boolean;
  menuBarVisible: boolean;
  selectedLayer: number;
  canToggleLayer: boolean;
  currentAsciiLayers: any[];
  currentAscii: any;
  currentAsciiLayerBlocks: any[][];
  selectedLayerIndex: number;
  mirror: { x: boolean; y: boolean };

  // Callbacks
  onChangeTab: (_key: number) => void;
  onCloseTab: (_key: number) => void;
  onShowLayerRename: (_key: number, _label: string) => void;
  onUpdateLayerName: (_key: number, _label: string) => void;
  onStartImport: (_type: string) => void;
  onStartExport: (_type: string) => void;
  onExportAsciibirdState: () => void;
  onResetSelect: () => void;
  onUpdateCanvas: () => void;
  onClearSelectedBlocks: () => void;
  onDeleteSelectedBlocks: () => void;
}

/**
 * Build the main application menu structure.
 * Returns an array of top-level menu items for vue-file-toolbar-menu.
 */
export function useMenuDefinition(ctx: MenuContext): any[] {
  const menu: any[] = [];
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  const store = ctx.store;

  // ─── File Menu ─────────────────────────────────────────────
  menu.push({
    text: 'File',
    hotkey: '0',
    icon: 'insert_drive_file',
    menu: [
      {
        text: 'New ASCII',
        click: () => store.commit('openModal', 'new-ascii'),
        icon: 'fiber_new',
        hotkey: `${macKey}+m`,
      },
    ],
  });

  if (ctx.asciibirdMeta.length) {
    // Extended File menu when a document is open
    menu[0].menu.push(
      {
        text: 'Close ASCII',
        click: () => ctx.onCloseTab(ctx.currentTab),
        icon: 'close',
        hotkey: `${macKey}+r`,
      },
      {
        text: 'Change ASCII',
        icon: 'tab',
        menu: buildChangeAsciiMenu(ctx),
      },
    );

    // ─── Edit Menu ────────────────────────────────────────────
    menu.push(buildEditMenu(ctx));

    // ─── View Menu ────────────────────────────────────────────
    menu.push(buildViewMenu(ctx));
  }

  // ─── Import Menu ──────────────────────────────────────────
  menu.push(buildImportMenu(ctx));

  if (ctx.asciibirdMeta.length) {
    // ─── Export Menu ──────────────────────────────────────────
    menu.push(buildExportMenu(ctx));

    // ─── Layers Menu ──────────────────────────────────────────
    menu.push(buildLayersMenu(ctx));

    // ─── Help Menu ────────────────────────────────────────────
    menu.push({
      text: 'Help',
      icon: 'help',
      menu: [
        {
          text: 'Help',
          click: () => store.commit('openModal', 'help'),
          hotkey: 'F1',
          icon: 'help',
        },
        {
          text: 'About ASCIIBIRD',
          click: () => store.commit('openModal', 'about'),
          hotkey: 'shift+F1',
          icon: 'help_outline',
        },
      ],
    });
  }

  return menu;
}

// ─── Sub-menu builders ────────────────────────────────────────

function buildChangeAsciiMenu(ctx: MenuContext): any[] {
  const menu: any[] = [];
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  for (const [i, ascii] of ctx.asciibirdMeta.entries()) {
    menu.push({
      text: ascii.title,
      click: () => ctx.onChangeTab(i),
      icon: 'insert_drive_file',
      hotkey: `${macKey}+shift+${i}`,
    });
  }
  return menu;
}

function buildEditMenu(ctx: MenuContext): any {
  const store = ctx.store;
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';

  return {
    text: 'Edit',
    icon: 'edit',
    menu: [
      {
        text: 'Edit ASCII',
        click: () => store.commit('openModal', 'edit-ascii'),
        icon: 'edit',
        hotkey: `${macKey}+e`,
      },
      { is: 'separator' },
      {
        text: 'Undo',
        click: () => store.commit('undoBlocks'),
        icon: 'undo',
        hotkey: `${macKey}+z`,
      },
      {
        text: 'Redo',
        click: () => store.commit('redoBlocks'),
        icon: 'redo',
        hotkey: `${macKey}+y`,
      },
      { is: 'separator' },
      buildCopyMenuItem(ctx),
      buildCutMenuItem(ctx),
      buildPasteMenuItem(ctx),
      buildDeleteMenuItem(ctx),
      buildSaveBrushMenuItem(ctx),
    ],
  };
}

function buildCopyMenuItem(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  return {
    text: 'Copy Selection',
    click: () => {
      ctx.store.commit(
        'selectBlocks',
        filterNullBlocks(ctx.selectedBlocks),
      );
      ctx.onResetSelect();
      ctx.onClearSelectedBlocks();
      ctx.toasted.show('Copied blocks!', {
        type: 'success',
        icon: 'content_copy',
      });
    },
    icon: 'content_copy',
    disabled: !ctx.isSelecting || !ctx.selectedBlocks.length,
    hotkey: `${macKey}+c`,
  };
}

function buildCutMenuItem(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  return {
    text: 'Cut Selection',
    click: () => {
      if (ctx.selectedBlocks.length) {
        ctx.onDeleteSelectedBlocks();
        ctx.store.commit(
          'selectBlocks',
          filterNullBlocks(ctx.selectedBlocks),
        );
        ctx.onResetSelect();
        ctx.onClearSelectedBlocks();
        ctx.onUpdateCanvas();
        ctx.toasted.show('Cut blocks!', {
          type: 'success',
          icon: 'content_cut',
        });
      }
    },
    icon: 'content_cut',
    disabled: !ctx.isSelecting || !ctx.selectedBlocks.length,
    hotkey: `${macKey}+x`,
  };
}

function buildPasteMenuItem(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  return {
    text: 'Paste Select as Brush',
    click: () => {
      ctx.store.commit('pushBrushHistory', ctx.brushBlocks);
      ctx.store.commit('brushBlocks', ctx.selectBlocks);
      ctx.store.commit('changeTool', 4);
      ctx.onResetSelect();
      ctx.onClearSelectedBlocks();
      ctx.store.commit('selectBlocks', []);
    },
    icon: 'content_paste',
    disabled: !ctx.selectBlocks.length,
    hotkey: `${macKey}+v`,
  };
}

function buildDeleteMenuItem(ctx: MenuContext): any {
  return {
    text: 'Delete Selected Blocks',
    click: () => {
      if (ctx.selectedBlocks.length) {
        ctx.onDeleteSelectedBlocks();
        ctx.onUpdateCanvas();
        ctx.onResetSelect();
        ctx.onClearSelectedBlocks();
        ctx.store.commit('selectBlocks', []);
        ctx.toasted.show('Deleted blocks!', {
          type: 'success',
          icon: 'delete_sweep',
        });
      }
    },
    icon: 'delete_sweep',
    disabled: !ctx.isSelected && !ctx.selectedBlocks.length,
    hotkey: 'Delete',
  };
}

function buildSaveBrushMenuItem(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  return {
    text: 'Save Selection/Brush to Library',
    click: () => {
      if (ctx.isBrushing) {
        ctx.store.commit(
          'pushBrushLibrary',
          filterNullBlocks(ctx.brushBlocks),
        );
      }
      if (ctx.selectedBlocks.length && ctx.isSelecting) {
        ctx.onResetSelect();
        ctx.store.commit(
          'pushBrushLibrary',
          filterNullBlocks(ctx.selectedBlocks),
        );
        ctx.onClearSelectedBlocks();
      }
      ctx.toasted.show('Saved brush to Library!', {
        type: 'success',
        icon: 'brush',
      });
    },
    icon: 'brush',
    disabled: (!ctx.isBrushing
      && !(ctx.selectedBlocks.length || ctx.isSelecting)),
    hotkey: `${macKey}+b`,
  };
}

/** Shared helper: delete selected blocks from the layer */
function buildViewMenu(ctx: MenuContext): any {
  const store = ctx.store;
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  const altKey = ctx.isMacLike ? 'command+alt' : 'ctrl+alt';

  return {
    text: 'View',
    icon: 'preview',
    menu: [
      {
        text: 'Windows',
        icon: 'desktop',
        menu: [
          buildToggleMenuItem(
            `${ctx.tabsVisible ? 'Hide' : 'Show'} Tabs`,
            ctx.tabsVisible,
            () => store.commit('changeTabsVisible', !ctx.tabsVisible),
            `${altKey}+t`,
          ),
          buildToggleMenuItem(
            `${ctx.menuBarVisible ? 'Hide' : 'Show'} Toolbar Menu`,
            ctx.menuBarVisible,
            () => store.commit('changeMenuBarVisible', !ctx.menuBarVisible),
            `${altKey}+m`,
          ),
          { is: 'separator' },
          buildToggleMenuItem(
            `${ctx.debugPanelState.visible ? 'Hide' : 'Show'} Debug Panel`,
            ctx.debugPanelState.visible,
            () => store.commit('toggleDebugPanel', !ctx.debugPanelState.visible),
            `${altKey}+d`,
          ),
          buildToggleMenuItem(
            `${ctx.brushLibraryState.visible ? 'Hide' : 'Show'} Brush Library`,
            ctx.brushLibraryState.visible,
            () => store.commit('toggleBrushLibrary', !ctx.brushLibraryState.visible),
            `${altKey}+b`,
          ),
          buildToggleMenuItem(
            `${ctx.layersLibraryState.visible ? 'Hide' : 'Show'} Layers`,
            ctx.layersLibraryState.visible,
            () => store.commit('changeLayersLibraryState', {
              ...ctx.layersLibraryState,
              visible: !ctx.layersLibraryState.visible,
            }),
            `${altKey}+l`,
          ),
          buildToggleMenuItem(
            `${ctx.toolbarState.visible ? 'Hide' : 'Show'} Toolbar`,
            ctx.toolbarState.visible,
            () => store.commit('changeToolBarState', {
              ...ctx.toolbarState,
              visible: !ctx.toolbarState.visible,
            }),
            `${altKey}+n`,
          ),
          buildToggleMenuItem(
            `${ctx.brushPreviewState.visible ? 'Hide' : 'Show'} Brush Preview`,
            ctx.brushPreviewState.visible,
            () => store.commit('changeBrushPreviewState', {
              ...ctx.brushPreviewState,
              visible: !ctx.brushPreviewState.visible,
            }),
            `${altKey}+e`,
          ),
        ],
      },
      buildToggleMenuItem(
        'Toggle Grid',
        ctx.gridView,
        () => {
          store.commit('toggleGridView', !ctx.gridView);
          ctx.toasted.show(`Grid view ${!ctx.gridView ? 'enabled' : 'disabled'}`);
        },
        'alt+g',
      ),
      buildToggleMenuItem(
        'Mirror X',
        ctx.toolbarState.mirrorX,
        () => {
          ctx.mirror.x = !ctx.toolbarState.mirrorX;
          store.commit('updateMirror', ctx.mirror);
          ctx.toasted.show(`Mirror X ${ctx.mirror.x ? 'enabled' : 'disabled'}`);
        },
        'alt+x',
      ),
      buildToggleMenuItem(
        'Mirror Y',
        ctx.toolbarState.mirrorY,
        () => {
          ctx.mirror.y = !ctx.toolbarState.mirrorY;
          store.commit('updateMirror', ctx.mirror);
          ctx.toasted.show(`Mirror Y ${ctx.mirror.y ? 'enabled' : 'disabled'}`);
        },
        'alt+y',
      ),
      buildToggleMenuItem(
        'Update Brush',
        ctx.toolbarState.updateBrush,
        () => {
          store.commit('toggleUpdateBrush', !ctx.toolbarState.updateBrush);
          ctx.toasted.show(
            `Update Brush when colours or char changes ${
              ctx.toolbarState.updateBrush ? 'enabled' : 'disabled'
            }`,
          );
        },
        'alt+u',
      ),
      { is: 'separator' },
      {
        text: 'Flip Horizontal Brush',
        hotkey: 'e',
        disabled: !ctx.isBrushing,
        icon: 'swap_horiz',
        click: () => store.commit('flipRotateBlocks', { type: 'flip' }),
      },
      {
        text: 'Flip Vertical Brush',
        hotkey: 'q',
        disabled: !ctx.isBrushing,
        icon: 'swap_horiz',
        click: () => store.commit('flipRotateBlocks', { type: 'rotate' }),
      },
      {
        text: 'Increase Brush Size',
        hotkey: `${macKey}+]`,
        disabled: !ctx.isBrushing && !ctx.isErasing,
        icon: 'add',
        click: () => {
          if (
            ctx.brushSizeHeight < maxBrushSize && ctx.brushSizeHeight >= 1
            && ctx.brushSizeWidth < maxBrushSize && ctx.brushSizeWidth >= 1
          ) {
            store.commit('updateBrushSize', {
              brushSizeHeight: parseInt(String(ctx.brushSizeHeight)) + 1,
              brushSizeWidth: parseInt(String(ctx.brushSizeWidth)) + 1,
              brushSizeType: ctx.brushSizeType,
            });
          }
        },
      },
      {
        text: 'Decrease Brush Size',
        hotkey: `${macKey}+[`,
        disabled: !ctx.isBrushing && !ctx.isErasing,
        icon: 'remove',
        click: () => {
          if (
            ctx.brushSizeHeight <= maxBrushSize && ctx.brushSizeHeight > 1
            && ctx.brushSizeWidth <= maxBrushSize && ctx.brushSizeWidth > 1
          ) {
            store.commit('updateBrushSize', {
              brushSizeHeight: parseInt(String(ctx.brushSizeHeight)) - 1,
              brushSizeWidth: parseInt(String(ctx.brushSizeWidth)) - 1,
              brushSizeType: ctx.brushSizeType,
            });
          }
        },
      },
      { is: 'separator' },
      {
        text: 'Swap FG and BG',
        hotkey: 'alt+r',
        icon: 'swap_horiz',
        click: () => {
          const bg = ctx.currentBg;
          const fg = ctx.currentFg;
          store.commit('changeColourFg', bg);
          store.commit('changeColourBg', fg);
        },
      },
      {
        text: 'Change FG',
        hotkey: 'alt+f',
        icon: 'flip_to_front',
        click: () => store.commit('changeIsUpdatingFg', !ctx.toolbarState.isChoosingFg),
      },
      {
        text: 'Change BG',
        hotkey: 'alt+b',
        icon: 'flip_to_back',
        click: () => store.commit('changeIsUpdatingBg', !ctx.toolbarState.isChoosingBg),
      },
      {
        text: 'Change Char',
        hotkey: 'alt+c',
        icon: 'atm',
        click: () => store.commit('changeIsUpdatingChar', !ctx.toolbarState.isChoosingChar),
      },
      { is: 'separator' },
      {
        text: 'Options',
        icon: 'settings',
        click: () => store.commit('openModal', 'options'),
        disabled: ctx.currentTool.name !== 'default',
        hotkey: `${macKey}+o`,
      },
    ],
  };
}

function buildImportMenu(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';
  return {
    text: 'Import',
    icon: 'upload_file',
    menu: [
      {
        text: 'File',
        click: () => ctx.onStartImport('mirc'),
        icon: 'upload_file',
        hotkey: `${macKey}+shift+o`,
      },
      {
        text: 'Clipboard',
        click: () => ctx.store.commit('openModal', 'paste-ascii'),
        hotkey: `${macKey}+shift+v`,
        icon: 'copy_all',
      },
      {
        text: 'ASCIIBIRD State',
        click: () => ctx.onStartImport('asb'),
        icon: 'save_alt',
      },
    ],
  };
}

function buildExportMenu(ctx: MenuContext): any {
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';

  return {
    text: 'Export',
    icon: 'save_alt',
    menu: [
      {
        text: 'File',
        click: () => ctx.onStartExport('file'),
        icon: 'download_file',
        hotkey: `${macKey}+shift+f`,
      },
      {
        text: 'Clipboard',
        hotkey: `${macKey}+shift+c`,
        click: () => ctx.onStartExport('clipboard'),
        icon: 'copy_all',
      },
      {
        text: 'PNG Image',
        hotkey: `${macKey}+shift+g`,
        click: () => {
          canvasToPng(
            document.getElementById('canvas') as HTMLCanvasElement,
            ctx.currentAscii.title,
          );
        },
        icon: 'image',
      },
      {
        text: 'HTTP POST',
        click: () => ctx.onStartExport('post'),
        hotkey: `${macKey}+shift+h`,
        icon: 'post_add',
      },
      {
        text: 'ASCIIBIRD State',
        click: () => ctx.onExportAsciibirdState(),
        icon: 'save_alt',
      },
    ],
  };
}

function buildLayersMenu(ctx: MenuContext): any {
  const store = ctx.store;
  const macKey = ctx.isMacLike ? 'command' : 'ctrl';

  return {
    text: 'Layers',
    icon: 'layers',
    menu: [
      {
        text: 'Show/Hide Layer',
        click: () => store.commit('toggleLayer', ctx.selectedLayer),
        icon: 'panorama_fish_eye',
        hotkey: `${macKey}+shift+t`,
        disabled: !ctx.canToggleLayer,
      },
      {
        text: 'Rename Layer',
        hotkey: `${macKey}+shift+r`,
        click: () => ctx.onShowLayerRename(
          ctx.selectedLayer,
          ctx.currentAsciiLayers[ctx.selectedLayer].label,
        ),
        icon: 'text_rotation_none',
      },
      {
        text: 'Add Layer',
        hotkey: `${macKey}+shift+a`,
        click: () => store.commit('addLayer'),
        icon: 'playlist_add',
      },
      {
        text: 'Delete Layer',
        hotkey: `${macKey}+shift+d`,
        click: () => store.commit('removeLayer', ctx.selectedLayer),
        icon: 'delete_sweep',
        disabled: !ctx.canToggleLayer,
      },
      {
        text: 'Move Layer Down',
        hotkey: `${macKey}+shift+s`,
        click: () => store.commit('upLayer', ctx.selectedLayer),
        icon: 'arrow_downward',
        disabled: !ctx.canToggleLayer,
      },
      {
        text: 'Move Layer Up',
        hotkey: `${macKey}+shift+w`,
        click: () => store.commit('downLayer', ctx.selectedLayer),
        icon: 'arrow_upward',
        disabled: !ctx.canToggleLayer,
      },
      {
        text: 'Merge All Layers',
        hotkey: `${macKey}+shift+m`,
        click: () => store.commit('mergeAllLayers'),
        icon: 'playlist_play',
        disabled: !ctx.canToggleLayer,
      },
    ],
  };
}

// ─── Helpers ────────────────────────────────────────────────

function buildToggleMenuItem(
  text: string,
  checked: boolean,
  click: () => void,
  hotkey: string,
): any {
  return {
    text,
    icon: checked ? 'check_box' : 'check_box_outline_blank',
    hotkey,
    click,
  };
}
