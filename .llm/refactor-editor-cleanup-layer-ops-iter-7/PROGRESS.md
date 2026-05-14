# Progress — refactor/editor-cleanup-layer-ops-iter-7

> Status: IN PROGRESS
> Branch: `refactor-editor-cleanup-layer-ops-iter-7`
> Updated: 2026-05-15

## Summary
Iteration 7: Code quality improvements + layer operations + plain text export.

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 1 | Extract eraseBlockProperties utility | done | a1753a3 | fast-path | Skipped review: pure utility extraction + 3 call-site updates, 8 new tests |
| 2 | Type safety and cleanup in Editor.vue | in_progress | — | — | — |
| 3 | Extract undo history helpers in store | pending | — | — | — |
| 4 | Layer merge down + duplicate layer | pending | — | — | — |
| 5 | Plain text export | pending | — | — | — |

## Notes
- Task 1: 1313 tests pass (8 new), lint clean, build clean
