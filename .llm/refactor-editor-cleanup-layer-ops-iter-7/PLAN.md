# Plan — refactor/editor-cleanup-layer-ops-iter-7

> Branch: `refactor-editor-cleanup-layer-ops-iter-7`
> Created: 2026-05-15
> Status: APPROVED

## Summary
Iteration 7: Code quality improvements (shared utilities, type safety, dead code, undo history consolidation) plus two QoL features (layer merge-down/duplicate, plain text export). Zero open bugs.

## Tasks

### Task 1: Extract `eraseBlockProperties` utility
- Add `eraseBlockProperties(block, opts)` to `ascii.ts`
- Update 3 call sites: Editor.vue eraser (primary + mirror), MainBrushCanvas.vue eraseBlock
- Do NOT move `isEmptyBlock` — already centralized
- Do NOT touch `processSelect` null-deletion (semantically different)

### Task 2: Type safety and cleanup in Editor.vue
- Remove spurious `async` from 6 functions (drawRectangleBlock, drawIndicator, drawTextIndicator, drawBrushBlocks, eraser, drawGrid)
- Fix 47 non-null assertions in canvasKeyDown with `let sx/sy` locals + sync-back
- Remove unused props (brush, updateascii, canvasxy) + Dashboard binding
- Move misplaced import in BorderGenerator.vue

### Task 3: Extract per-format undo history helpers in store
- `pushBlockHistory(meta, diff)` for replaceColor/findReplaceAction (HistoryDiff format)
- `pushLegacyBlockHistory(meta, diff)` for updateAsciiBlocks (legacy BlockDiff format)
- Do NOT unify with withLayerMutation (different format)

### Task 4: Layer merge down + duplicate layer
- Add `mergeTwoLayers()` to ascii.ts
- Add `mergeLayerDown()` and `duplicateLayer()` store actions
- UI buttons + context menu in Layers.vue
- Shortcuts: Ctrl+Shift+M (merge down), Ctrl+Shift+D (duplicate)
- Tests for all new functions

### Task 5: Plain text export
- Add `exportPlainText()` to ascii.ts
- Add menu items in Dashboard.vue + Editor context menu
- No IRC byte limit checking needed
- Tests
