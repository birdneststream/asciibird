# Plan: Extract Complexity Helpers to Eliminate ESLint Warnings

> Branch: `refactor/complexity-helpers`
> Created: 2026-05-16
> Status: APPROVED (GLM: CHANGES-ADDRESSED, Qwen: APPROVE, Hy3: APPROVE)

## Summary

Extract helper functions from 7 files to eliminate 9 of 12 ESLint complexity warnings.
All changes are pure extraction — code moves into named functions with zero behavior changes.

## Tasks (ordered lowest-risk-first)

1. **useMainCanvasRenderer.ts** — Extract `renderHalfBlock` from `renderBlock` (complexity 26)
2. **ansiImport.ts** — Extract SGR color parsing + CSI sequence parsing (complexity 30+30)
3. **useTextEditing.ts** — Extract keyboard handlers from `canvasKeyDown` (complexity 29)
4. **useEditorHotkeys.ts** — Extract hotkey handler branches (complexity 31)
5. **useEditorRendering.ts** — Extract `redrawCanvas` paths (complexity 24)
6. **useCanvasMouseHandlers.ts** — Extract `canvasMouseMove` handlers (complexity 34)
7. **useToolApplication.ts** — Extract brush rendering modes (complexity 23+22)

## Scoping Strategy

- **Module-scope extraction**: Tasks 1, 2 (pure functions, no closures)
- **Nested function extraction**: Tasks 3-7 (composable closures share reactive state)

## Verification (per task)

1. `yarn lint` — warning count decreases
2. `yarn test` — all 1554 tests pass
3. `yarn typecheck` — no new type errors
4. `yarn knip` — no new unused exports
5. Browser verify via Chrome DevTools MCP

## Deferred (iteration 3)

- `drawPastePreview` (26) — usePasteMode.ts
- `applyNudge` (23) — useSelectionTransform.ts
- `replaceColor` (21) — store/index.ts
