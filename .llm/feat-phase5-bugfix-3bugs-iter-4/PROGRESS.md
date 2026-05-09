# Progress — feat/phase5-bugfix-3bugs-iter-4

> Status: COMPLETED
> Updated: 2026-05-10

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 1 | Fix Bug #6 — toastShow crash (3 files) + copyText crash (2 files) | done | bdbf1df | glm:✓ hy3:✓ | Destructured useToast() and useClipboard() in BrushLibrary, DebugPanel, MainBrushCanvas |
| 2 | Fix Bug #5 — Swap colour overlaps BG | done | bdbf1df | glm:✓ hy3:✓ | margin-left: -75px → -86px, swap right=83px, BG left=85px, 2px gap |
| 3 | Fix Bug #7 — Menu bar disappears when modal open | done | bdbf1df | glm:✓ hy3:✓ | Decoupled isKeyboardDisabled from openModal/closeModal; v-if now only checks !isKeyboardDisabled |
| 4 | Browser verification + close Gitea issues | done | — | — | All 3 bugs verified fixed in browser; 667 tests pass |

## Notes

- HY3 review raised concern about keyboard shortcuts during modals after decoupling, but existing code already handles this via: (1) isModalOpen watcher deleting hotkeys scope, (2) KeyboardShortcuts component checking isModalOpen directly
- Also fixed useClipboard() destructuring in DebugPanel and MainBrushCanvas (same pattern as useToast)
- Updated test mocks in panels.spec.ts, main-brush-canvas.spec.ts, store.spec.ts to match destructured return values
- Browser verified: 0 console errors, swap has 2px gap from BG, menu bar visible during modal
