# Plan: Content-Preserving Resize & Final Cleanup
> Created: 2026-05-16 | Branch: fix/iter-10-content-preserving-resize

## Summary
Final iteration (10 of 10). Fix the silent data inconsistency bug when shrinking
canvas dimensions — layer data arrays remain larger than their width/height
metadata. Create a pure `resizeLayers` utility that properly preserves content
when growing and truncates when shrinking. Wire it to both the Edit ASCII modal
and the drag resize handles. Extract canvas pan logic into a composable.

## Tasks

### Task 1: Content-Preserving Resize Utility
- **Files:** `src/utils/resizeLayers.ts` (new), `tests/unit/resizeLayers.spec.ts` (new)
- Pure function: `resizeLayers(layers, newWidth, newHeight): Layer[]`
- Growing: preserve existing blocks, add empty blocks at edges
- Shrinking: truncate rows/columns to new dimensions
- Deep-clone blocks to avoid mutation, no store access
- Comprehensive tests including edge cases

### Task 2: Wire Resize Utility to EditAscii Modal
- **Files:** `src/components/modals/EditAscii.vue`
- Replace `fillNullBlocks()` with `resizeLayers()` in `updateAscii()`

### Task 3: Wire Resize Utility to Editor Resize Handles
- **Files:** `src/views/Editor.vue`
- Replace `fillNullBlocks()` with `resizeLayers()` in `onResizeStop`
- Add minimum dimension guard (clamp to 1x1)

### Task 4: Extract Canvas Pan to Composable
- **Files:** `src/composables/useCanvasPan.ts` (new), `src/views/Editor.vue`
- Extract: isPanning, panLastX, panLastY, startPan, doPan, onCanvasMouseMove, panCursorStyle
- ~40 line reduction in Editor.vue

### Task 5: Final Quality Pass & Browser Verification
- Run all quality gates
- Browser verification via Chrome DevTools MCP
- Verify canvas resize works correctly
