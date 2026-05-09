# Phase 3 — Canvas Component & Editor Test Coverage (Iter-1 Reset)

> Created: 2026-05-09 | Branch: feat/test-coverage-iter-1

## Summary

Continue Phase 3 (Comprehensive Test Coverage) by adding ~145-175 new tests for the 4 largest coverage gaps: Editor.vue (2262 lines, 17.86%), BrushPreview.vue (486 lines, 0%), MainBrushCanvas.vue (464 lines, 0%), and BrushCanvas.vue (326 lines, 26%). First fix discovered bugs (screenY typo, var→const) and enhance test infrastructure with a shared canvas mock factory. Target: push overall statement coverage from 51.85% → ≥65%.

## Tasks

### Task 0: Fix Bugs + Enhance Test Infrastructure
- Fix `var _this = this` → `const _this = this` in BrushCanvas.vue and MainBrushCanvas.vue
- Fix `screenY` → `targetY` bug in BrushPreview.vue (v lines brush type)
- Add `createMockCanvasRef()` to `tests/unit/helpers.ts`
- Add missing mutations: `changeBrushPreviewState`, `changeToolBarDraggable`, `pushBrushHistory`, `updateBrushSize`
- Verify all 427 existing tests still pass

### Task 1: BrushCanvas.vue Comprehensive Tests (~30-35 tests)
- New file: `tests/unit/brush-canvas.spec.ts`
- 14 computed properties, 11 watchers, 8 methods
- Test both prop modes: blocks=false and blocks=Block[][]

### Task 2: MainBrushCanvas.vue Comprehensive Tests (~35-40 tests)
- New file: `tests/unit/main-brush-canvas.spec.ts`
- 20+ computed properties, 12 methods, watchers
- Test processClick, addBlock, eraseBlock with flag combos

### Task 3: BrushPreview.vue Comprehensive Tests (~40-50 tests)
- New file: `tests/unit/brush-preview.spec.ts`
- createBlocks for all 7 brush types
- fillTool flood fill, watchers, panel state management

### Task 4: Editor.vue Computed & Method Tests (~40-50 tests)
- New file: `tests/unit/editor.spec.ts`
- 30+ computed properties, simpler methods
- NOT testing full canvas rendering pipeline

### Task 5: Coverage Verification & Final Report
- Run vitest --coverage, verify all tests pass
- Target: ≥65% overall statement coverage
