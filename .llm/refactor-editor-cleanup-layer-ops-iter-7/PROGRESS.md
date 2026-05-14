# Progress — refactor/editor-cleanup-layer-ops-iter-7

> Status: IN PROGRESS
> Branch: `refactor-editor-cleanup-layer-ops-iter-7`
> Updated: 2026-05-15

## Summary
Iteration 7: Code quality improvements + layer operations + plain text export.

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 1 | Extract eraseBlockProperties utility | done | a1753a3 | fast-path | 8 new tests, 3 call sites updated |
| 2 | Type safety and cleanup in Editor.vue | done | 5572075 | fast-path | Fixed 47 non-null assertions, removed 6 spurious async, 3 unused props |
| 3 | Extract undo history helpers in store | done | 1267ac6 | fast-path | pushHistoryDiff + pushLegacyDiff, ~14 net lines removed |
| 4 | Layer merge down + duplicate layer | done | 48d8dcb | fast-path | mergeTwoLayers + 2 store actions + UI + shortcuts, 11 new tests |
| 5 | Plain text export | done | 30f8401 | fast-path | exportPlainText + menu items + context menu, 10 new tests |

## Notes
- Task 1: 1313 tests (up from 1305)
- Task 2: Reduced Editor.vue by 59 net lines. canvasKeyDown uses local `let sx/sy` + sync-back.
- Task 3: Consolidated 3 duplicated history management patterns into 2 helpers
- Task 4: Ctrl+Shift+M = merge down, Ctrl+Shift+D = duplicate. Merge ↓ disabled on layer 0.
- Task 5: Plain text strips colors, trims trailing spaces/lines. Both clipboard and file export.
- Final: 1334 tests pass (29 new), lint clean, build clean, browser verified
