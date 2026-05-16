// Editor Actions composable — context menu, export, and helper methods.
//
// Encapsulates the action methods that were previously inline in
// Editor.vue. These methods handle context menu actions, exports,
// selection helpers, and dispatch logic.

import type { EditorState } from './useEditorState';
import type { Ref } from 'vue';
import type { Block } from '../types';
import { useModalStore } from '../store/modal';
import {
  canvasToPng as canvasToPngUtil,
  exportPlainText,
} from '../ascii';
import { downloadHtml } from '../utils/htmlExport';
import {
  selectionToGridRect,
  extractSelectionBlocks,
  copySelectionBlocks,
} from './useSelectionTransform';

// ─── Types ──────────────────────────────────────────────────────

/** Paste mode composable subset needed by actions */
export interface ActionsPasteMode {
  cutSelection: () => void;
  deleteSelection: () => void;
}

/** Color replace function type */
export type ContextMenuReplaceFn = (
  block: Block,
  bounds?: { x: number; y: number; w: number; h: number },
) => void;

/** Rendering methods needed by actions */
export interface ActionsRenderingDeps {
  clearToolCanvas: () => Promise<void>;
  delayRedrawCanvas: (force?: boolean) => Promise<void>;
}

/** Template refs needed by actions */
export interface ActionsTemplateRefs {
  canvasRef: Ref<HTMLCanvasElement | null>;
  editorMenu: Ref<{ open: (evt: { clientX: number; clientY: number }) => void } | null>;
}

/** Emit functions needed by actions */
export interface ActionsEmits {
  selecting: (val: Record<string, unknown>) => void;
  selectedblocks: (val: Block[][]) => void;
}

/** Options for useEditorActions */
export interface EditorActionsOptions {
  state: EditorState;
  rendering: ActionsRenderingDeps;
  pasteMode: ActionsPasteMode;
  refs: ActionsTemplateRefs;
  emit: ActionsEmits;
  toastShow: (msg: string, opts?: Record<string, unknown>) => void;
  contextMenuReplace: ContextMenuReplaceFn;
}

// ─── Composable ─────────────────────────────────────────────────

export function useEditorActions(opts: EditorActionsOptions) {
  const s = opts.state;
  const r = opts.rendering;
  const modalStore = useModalStore();

  // ─── Context Menu & Export ────────────────────────────────────

  function canvasToPng() {
    const canvas = opts.refs.canvasRef.value;
    if (canvas) {
      canvasToPngUtil(
        canvas,
        (s.currentAscii.value as { title: string })?.title ?? 'ascii',
      );
    }
  }

  function openContextMenu(e: MouseEvent) {
    e.preventDefault();
    opts.refs.editorMenu.value?.open({
      clientX: e.clientX,
      clientY: e.clientY,
    });
  }

  function contextMenuReplaceColor() {
    const block = s.asciiBlockAtXy.value;
    if (!block) return;
    const bounds = getSelectionBounds();
    if (bounds) {
      opts.contextMenuReplace(block, bounds);
    } else {
      opts.contextMenuReplace(block);
    }
  }

  function contextMenuCopySelection() {
    if (s.selectedBlocks.value.length > 0) {
      const didCopy = copySelectionBlocks(
        s.selecting.value,
        s.selectedBlocks.value,
        s.currentAsciiLayerBlocks.value,
        s.blockWidthComp.value,
        s.blockHeightComp.value,
        s.currentAsciiWidth.value,
        s.currentAsciiHeight.value,
        s.toolbarStore.setSelectBlocks,
      );
      if (didCopy) {
        opts.toastShow('Copied selection to clipboard', {
          type: 'success',
        });
      }
    }
  }

  function contextMenuCutSelection() {
    if (s.isSelecting.value && s.isSelected.value) {
      opts.pasteMode.cutSelection();
      r.delayRedrawCanvas(true);
      opts.toastShow('Cut selection to clipboard', {
        type: 'success',
      });
    }
  }

  function contextMenuDeleteSelection() {
    if (s.isSelecting.value && s.isSelected.value) {
      opts.pasteMode.deleteSelection();
      r.delayRedrawCanvas(true);
    }
  }

  function openBorderGenerator() {
    modalStore.openModal('border-generator');
  }

  function cropToContent() {
    const cropped = s.store.cropToContentAction();
    if (cropped) {
      opts.toastShow('Canvas cropped to content!', { type: 'success' });
    } else {
      opts.toastShow('Nothing to crop — content already fills edges.', {
        type: 'info',
      });
    }
  }

  function exportPlainTextClipboard() {
    try {
      const lines = exportPlainText();
      navigator.clipboard.writeText(lines.join('\n'));
      opts.toastShow('Plain text copied to clipboard!', {
        type: 'success',
      });
    } catch {
      opts.toastShow('Failed to copy plain text.', { type: 'error' });
    }
  }

  function exportHtmlFile() {
    try {
      const title = (s.currentAscii.value as { title: string })?.title ?? 'ascii';
      downloadHtml(title);
      opts.toastShow('Exported HTML file!', { type: 'success' });
    } catch {
      opts.toastShow('Failed to export HTML.', { type: 'error' });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────

  function warnInvisibleLayer() {
    if (!s.currentSelectedLayer.value.visible) {
      opts.toastShow('You are trying to edit an invisible layer!!', {
        type: 'error',
        icon: 'warning_amber',
        singleton: true,
      });
    }
  }

  function undo() {
    s.store.undoBlocks();
  }

  function redo() {
    s.store.redoBlocks();
  }

  async function resetSelectTool() {
    s.selecting.value.startX = null;
    s.selecting.value.startY = null;
    s.selecting.value.endX = null;
    s.selecting.value.endY = null;
    s.selecting.value.canSelect = false;

    s.selectedBlocks.value = [];
    await r.clearToolCanvas();
    await r.delayRedrawCanvas();
    opts.emit.selecting(s.selecting.value);
  }

  /**
   * Get the current selection bounds as grid coordinates.
   * Returns null if no valid selection exists.
   */
  function getSelectionBounds(): {
    x: number; y: number; w: number; h: number;
  } | null {
    if (!s.isSelected.value || !s.isSelecting.value) return null;
    const rect = selectionToGridRect(
      s.selecting.value,
      s.blockWidthComp.value,
      s.blockHeightComp.value,
      s.currentAsciiWidth.value,
      s.currentAsciiHeight.value,
    );
    if (!rect) return null;
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
  }

  // ─── Dispatch & Diff ──────────────────────────────────────────

  async function dispatchBlocks(clearDiff = false) {
    // .flat() converts the 2D diff array to 1D for store processing.
    // Type mismatch is intentional: store expects flat diff arrays.
    const flatOld = s.diffBlocks.old.flat();
    const flatNew = s.diffBlocks.new.flat();
    (s.diffBlocks as Record<string, unknown>).old = flatOld;
    (s.diffBlocks as Record<string, unknown>).new = flatNew;

    if (s.diffBlocks.new.length > 0) {
      const fg = s.toolbarStore.currentFg;
      const bg = s.toolbarStore.currentBg;
      s.toolbarStore.addRecentColor(fg);
      if (bg !== fg) {
        s.toolbarStore.addRecentColor(bg);
      }
    }

    s.store.updateAsciiBlocks({
      blocks: s.currentAsciiLayerBlocks.value,
      diff: { old: flatOld, new: flatNew, l: s.diffBlocks.l },
    });

    if (clearDiff) {
      s.diffBlocks.l = s.selectedLayerIndex.value;
      s.diffBlocks.new = [];
      s.diffBlocks.old = [];
    }
  }

  async function processSelect() {
    const rect = selectionToGridRect(
      s.selecting.value,
      s.blockWidthComp.value,
      s.blockHeightComp.value,
      s.currentAsciiWidth.value,
      s.currentAsciiHeight.value,
    );

    if (rect) {
      s.selectedBlocks.value = extractSelectionBlocks(
        s.currentAsciiLayerBlocks.value, rect,
      );
    }

    opts.emit.selectedblocks(s.selectedBlocks.value);
    opts.emit.selecting(s.selecting.value);
  }

  return {
    canvasToPng,
    openContextMenu,
    contextMenuReplaceColor,
    contextMenuCopySelection,
    contextMenuCutSelection,
    contextMenuDeleteSelection,
    openBorderGenerator,
    cropToContent,
    exportPlainTextClipboard,
    exportHtmlFile,
    warnInvisibleLayer,
    undo,
    redo,
    resetSelectTool,
    getSelectionBounds,
    dispatchBlocks,
    processSelect,
  };
}
