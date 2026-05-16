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
import { getAsciiTitle } from '../utils/asciiTitle';
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

// ─── Module-level helpers ───────────────────────────────────────

/** Get the current selection bounds as grid coordinates. */
function getSelectionBounds(
  s: EditorState,
): { x: number; y: number; w: number; h: number } | null {
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

function canvasToPng(
  s: EditorState,
  canvasRef: Ref<HTMLCanvasElement | null>,
): void {
  const canvas = canvasRef.value;
  if (canvas) {
    canvasToPngUtil(
      canvas,
      getAsciiTitle(s.currentAscii.value),
    );
  }
}

function openContextMenu(
  editorMenu: ActionsTemplateRefs['editorMenu'],
  e: MouseEvent,
): void {
  e.preventDefault();
  editorMenu.value?.open({
    clientX: e.clientX,
    clientY: e.clientY,
  });
}

function doContextMenuReplaceColor(
  s: EditorState,
  replaceFn: ContextMenuReplaceFn,
): void {
  const block = s.asciiBlockAtXy.value;
  if (!block) return;
  const bounds = getSelectionBounds(s);
  if (bounds) {
    replaceFn(block, bounds);
  } else {
    replaceFn(block);
  }
}

function doContextMenuCopySelection(
  s: EditorState,
  toastShow: EditorActionsOptions['toastShow'],
): void {
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
      toastShow('Copied selection to clipboard', { type: 'success' });
    }
  }
}

function doContextMenuCutSelection(
  s: EditorState,
  r: ActionsRenderingDeps,
  pasteMode: ActionsPasteMode,
  toastShow: EditorActionsOptions['toastShow'],
): void {
  if (s.isSelecting.value && s.isSelected.value) {
    pasteMode.cutSelection();
    r.delayRedrawCanvas(true);
    toastShow('Cut selection to clipboard', { type: 'success' });
  }
}

function doContextMenuDeleteSelection(
  s: EditorState,
  r: ActionsRenderingDeps,
  pasteMode: ActionsPasteMode,
): void {
  if (s.isSelecting.value && s.isSelected.value) {
    pasteMode.deleteSelection();
    r.delayRedrawCanvas(true);
  }
}

function doExportPlainTextClipboard(
  s: EditorState,
  toastShow: EditorActionsOptions['toastShow'],
): void {
  try {
    const lines = exportPlainText();
    navigator.clipboard.writeText(lines.join('\n'));
    toastShow('Plain text copied to clipboard!', { type: 'success' });
  } catch {
    toastShow('Failed to copy plain text.', { type: 'error' });
  }
}

function doExportHtmlFile(
  s: EditorState,
  toastShow: EditorActionsOptions['toastShow'],
): void {
  try {
    const title = getAsciiTitle(s.currentAscii.value);
    downloadHtml(title);
    toastShow('Exported HTML file!', { type: 'success' });
  } catch {
    toastShow('Failed to export HTML.', { type: 'error' });
  }
}

function doCropToContent(
  s: EditorState,
  toastShow: EditorActionsOptions['toastShow'],
): void {
  const cropped = s.store.cropToContentAction();
  if (cropped) {
    toastShow('Canvas cropped to content!', { type: 'success' });
  } else {
    toastShow('Nothing to crop — content already fills edges.', {
      type: 'info',
    });
  }
}

function warnInvisibleLayer(
  s: EditorState,
  toastShow: EditorActionsOptions['toastShow'],
): void {
  if (!s.currentSelectedLayer.value.visible) {
    toastShow('You are trying to edit an invisible layer!!', {
      type: 'error',
      icon: 'warning_amber',
      singleton: true,
    });
  }
}

async function resetSelectTool(
  s: EditorState,
  r: ActionsRenderingDeps,
  emit: ActionsEmits,
): Promise<void> {
  s.selecting.value.startX = null;
  s.selecting.value.startY = null;
  s.selecting.value.endX = null;
  s.selecting.value.endY = null;
  s.selecting.value.canSelect = false;

  s.selectedBlocks.value = [];
  await r.clearToolCanvas();
  await r.delayRedrawCanvas();
  emit.selecting(s.selecting.value);
}

async function dispatchBlocks(
  s: EditorState,
  clearDiff = false,
): Promise<void> {
  const flatOld = s.diffBlocks.old.flat();
  const flatNew = s.diffBlocks.new.flat();

  if (flatNew.length > 0) {
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

async function processSelect(
  s: EditorState,
  emit: ActionsEmits,
): Promise<void> {
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

  emit.selectedblocks(s.selectedBlocks.value);
  emit.selecting(s.selecting.value);
}

// ─── Composable ─────────────────────────────────────────────────

export function useEditorActions(opts: EditorActionsOptions) {
  const s = opts.state;
  const r = opts.rendering;
  const modalStore = useModalStore();

  return {
    canvasToPng: () => canvasToPng(s, opts.refs.canvasRef),
    openContextMenu: (e: MouseEvent) => openContextMenu(opts.refs.editorMenu, e),
    contextMenuReplaceColor: () => doContextMenuReplaceColor(s, opts.contextMenuReplace),
    contextMenuCopySelection: () => doContextMenuCopySelection(s, opts.toastShow),
    contextMenuCutSelection: () => doContextMenuCutSelection(s, r, opts.pasteMode, opts.toastShow),
    contextMenuDeleteSelection: () => doContextMenuDeleteSelection(s, r, opts.pasteMode),
    openBorderGenerator: () => modalStore.openModal('border-generator'),
    cropToContent: () => doCropToContent(s, opts.toastShow),
    exportPlainTextClipboard: () => doExportPlainTextClipboard(s, opts.toastShow),
    exportHtmlFile: () => doExportHtmlFile(s, opts.toastShow),
    warnInvisibleLayer: () => warnInvisibleLayer(s, opts.toastShow),
    undo: () => s.store.undoBlocks(),
    redo: () => s.store.redoBlocks(),
    resetSelectTool: () => resetSelectTool(s, r, opts.emit),
    getSelectionBounds: () => getSelectionBounds(s),
    dispatchBlocks: (clear?: boolean) => dispatchBlocks(s, clear),
    processSelect: () => processSelect(s, opts.emit),
  };
}
