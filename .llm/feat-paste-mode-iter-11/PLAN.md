# Plan: Selection Copy/Cut/Paste/Delete with Ghost Preview

> Created: 2026-05-15 | Branch: feat/paste-mode-iter-11

## Summary
Add proper copy/cut/paste/delete for selections with a ghost preview paste mode.
Addresses the biggest usability gap — currently Ctrl+V just loads blocks as brush.

## Analysis
- Zero open Gitea issues
- useClipboard.ts already exists (system text clipboard) → new file: usePasteMode.ts
- toolbarStore.selectBlocks already stores copied blocks (IndexedDB-persisted) → use as backing store
- useSelectionTransform exports selectionToGridRect() + extractSelectionBlocks() → reuse
- Editor.vue is 2200 lines → paste mode logic goes in composable, minimal Editor changes

## Tasks

### Task 1: Create usePasteMode composable
- **Files:** src/composables/usePasteMode.ts (NEW)
- **Details:**
  - Follow established dep injection pattern (like useGradientTool)
  - Reuse selectionToGridRect + extractSelectionBlocks from useSelectionTransform
  - Use toolbarStore.selectBlocks as backing store (not new Ref)
  - State: isPasteMode ref (add to useEditorState)
  - Methods: startPasteMode(), confirmPaste(x, y), cancelPasteMode()
  - drawPastePreview(ctx, gridX, gridY, bw, bh) — semi-transparent block rendering
  - cutSelection(gridRect, layerBlocks) → copy + return erase diffs
  - deleteSelection(gridRect, layerBlocks) → return erase diffs only
  - All preview operations use existing FPS throttle
  - Clear coordinate system: composable uses grid coords, drawing converts to pixels
- **Tests:** tests/unit/composables/usePasteMode.spec.ts
- **Depends:** none

### Task 2: Integrate paste mode into Editor.vue
- **Files:** src/views/Editor.vue, src/composables/useEditorState.ts
- **Details:**
  - Add isPasteMode ref to useEditorState
  - Instantiate usePasteMode composable in Editor.vue
  - Early-return in canvasMouseDown when isPasteMode (confirm paste)
  - Early-return in onCanvasMouseMove when isPasteMode (draw preview)
  - Add case for Escape in hotkeys to cancel paste mode
  - Add case for Delete key to clear selection contents
  - Watch for tool changes and tab changes → cancel paste mode
- **Tests:** Editor integration test updates
- **Depends:** Task 1

### Task 3: Keyboard shortcuts and event handlers
- **Files:** src/composables/useGlobalShortcuts.ts, src/Dashboard.vue
- **Details:**
  - Ctrl+V: Dispatch asciibird:paste-blocks → Editor enters paste mode
  - Ctrl+X: Dispatch asciibird:cut-blocks → copy + erase selection
  - Delete (in editor scope): Dispatch asciibird:delete-selection → clear selection
  - Dashboard: Add cutBlocksHandler, update copyBlocksHandler
  - Keep "load as brush" accessible via Shift+Ctrl+B (new binding)
- **Tests:** Shortcut dispatch tests
- **Depends:** Task 1, Task 2

### Task 4: Context menu entries
- **Files:** src/views/Editor.vue (context menu template)
- **Details:**
  - "Paste Selection" (when clipboard has blocks) — Ctrl+V
  - "Copy" (when selection exists) — Ctrl+C
  - "Cut" (when selection exists) — Ctrl+X
  - "Delete Selection" (when selection exists) — Delete
  - Named "Paste Selection" to distinguish from "Paste ASCII" import modal
- **Tests:** Visual verification in browser
- **Depends:** Task 2, Task 3

### Task 5: Tests and browser verification
- **Files:** tests/unit/composables/usePasteMode.spec.ts (new), existing test updates
- **Details:**
  - Full unit tests for usePasteMode composable
  - Ctrl+V no longer switches to brush tool (regression test)
  - Full browser verification via Chrome DevTools MCP
- **Depends:** Task 1-4
