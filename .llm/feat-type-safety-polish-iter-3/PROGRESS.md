# Progress — feat/type-safety-polish-iter-3

> Status: COMPLETED
> Updated: 2026-05-11

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 1 | Fix ESLint warnings (14 → 0) | done | 31cfede | fast-path | Removed unused store imports + configured argsIgnorePattern |
| 2 | Fix store/index.ts undo/redo type errors (11 → 0) | done | 7ae759c | fast-path | HistoryEntry type guard + decompressData generics |
| 3 | Replace `any` in ascii.ts with proper store types | done | 02efd8b | fast-path | AsciiStoreAccess + ModalStoreAccess interfaces |
| 4a | Fix helpers.ts mock factory types | done | 6ecbc2e | glm:✓ kimi:✓ | TestWrapper type + asAsciiStore/asModalStore cast helpers |
| 4b | Fix high-error test files (4 files, ~182 errors) | done | 6ecbc2e | glm:✓ kimi:✓ | main-brush-canvas, brush-preview, components, modals |
| 4c | Fix remaining test files (10 files, ~119 errors) | done | 6ecbc2e | glm:✓ kimi:✓ | All 14 test files now zero errors |
| 5 | Wire tsc --noEmit into pipeline | done | 8df3785 | fast-path | Added `yarn typecheck` script |

## Notes

- Eliminated all 312 TypeScript errors (11 source + 301 test)
- `tsc --noEmit` now passes with 0 errors
- 849/849 tests pass, build clean, browser verified
- `tsconfig.json` still has `strict: false` — strict mode is a future milestone
- Key design: `TestWrapper` type for VTU `<script setup>` vm access
- Key design: `AsciiStoreAccess`/`ModalStoreAccess` minimal interfaces break circular deps
- Code review: removed dead helpers and redundant `as string` casts
