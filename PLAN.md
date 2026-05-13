# Plan: Extract Pure Main-Canvas Renderer from Editor.vue
> Created: 2026-05-11 | Branch: feat/pure-canvas-renderer-iter-4 | Progress: PROGRESS.md

## Summary
Extract **only the pure main-canvas grid rendering** from `Editor.vue` into a `useMainCanvasRenderer` composable. This is a tightly-scoped code-quality polish task: zero behavior changes, explicit API, visual regression verification, and a performance baseline.

## Analysis

### Current State
- **Zero open Gitea issues**; all README known bugs fixed in prior iterations
- **Phase 5 (Vue 3 migration) is COMPLETE** per AGENTS.md
- **849/849 tests pass**, build succeeds, lint is clean
- `Editor.vue` is **2129 lines**. The `redrawCanvas` function and its pure helpers (`drawGrid`, background fill, text rendering) are the most isolated rendering logic

### Why Narrow Scope?
Both plan reviewers identified that the original plan conflated three concerns:
1. **Pure rendering** (main grid) — safe to extract
2. **Mixed rendering + editing** (tool overlay with `storeDiffBlocks` calls) — violates single-responsibility
3. **CSS-based image overlay** — not canvas rendering at all

This iteration targets **only #1**.

### What Moves to the Composable
- `redrawCanvas` and its pure helpers: drawing background fills, foreground characters, grid lines, half-block cells
- **What stays in Editor.vue:** tool overlay (`canvastools`), event handlers, `diffBlocks` optimization state, undo/redo, image overlay CSS

### Composable API (defined upfront)
```ts
export interface MainRenderOptions {
  blocks: Block[][];
  colours: string[];
  blockWidth: number;
  blockHeight: number;
  gridMode: boolean;
  halfBlockEditing: boolean;
  transparentBg: boolean;
}

export function useMainCanvasRenderer() {
  function renderMainCanvas(
    ctx: CanvasRenderingContext2D,
    opts: MainRenderOptions,
  ): void;
  function clearMainCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void;
  return { renderMainCanvas, clearMainCanvas };
}
```

## Tasks

### Task 1: Create `useMainCanvasRenderer` composable with defined API
- **Files:** `src/composables/useMainCanvasRenderer.ts` (new)
- **Details:**
  - Extract `redrawCanvas` logic and pure drawing helpers from `Editor.vue`
  - Accept a `CanvasRenderingContext2D` and `MainRenderOptions` — no store access, no side effects
  - Preserve exact pixel math (text baseline offsets `blockHeight - 3`, grid line spacing, half-block dimensions)
  - Export `renderMainCanvas` and `clearMainCanvas`
- **Tests:** `tests/unit/composables/useMainCanvasRenderer.spec.ts`
  - Mock `CanvasRenderingContext2D` methods (`fillRect`, `fillText`, `strokeRect`, etc.)
  - Assert correct calls for: empty grid, colored blocks, grid mode on/off, half-block mode
  - Test does **not** verify pixels — visual regression handles that
- **Depends:** none

### Task 2: Integrate composable into `Editor.vue` and remove dead code
- **Files:** `src/views/Editor.vue`
- **Details:**
  - Instantiate `useMainCanvasRenderer()` in `Editor.vue` setup
  - Replace inline `redrawCanvas` body with call to `renderMainCanvas`
  - Remove pure drawing helper functions that moved to the composable
  - Keep `diffBlocks` incremental optimization, `canvasHash`, and all event handlers untouched
  - Target: reduce `Editor.vue` by **150–250 lines**
- **Tests:**
  - All 849 existing tests must pass without changes
  - If any test references an extracted helper via `defineExpose`, add a re-export shim in `Editor.vue` (to be removed in a future breaking-test iteration)
- **Depends:** Task 1

### Task 3: Performance baseline and regression check
- **Files:** N/A
- **Details:**
  - Before integration: measure `redrawCanvas` execution time on a large ASCII (200×100 blocks) using `performance.now()` in the browser console
  - After integration: run the same measurement
  - Acceptable threshold: ±5% variance. If >5% slower, investigate and optimize before merging
- **Depends:** Task 2

### Task 4: Visual regression verification via Playwright
- **Files:** N/A
- **Details:**
  - `yarn dev` on port 5180
  - Use Playwright MCP to navigate to `http://localhost:5180`
  - Create a test ASCII with varied colors, characters, and grid mode enabled
  - Take a screenshot of the canvas area
  - Compare with a pre-refactor baseline screenshot (or use a known checksum)
  - Verify pixel-identical rendering
  - Also check Chrome DevTools console on port 9230 for errors/warnings
- **Depends:** Task 2

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Pixel drift** | High | Exact pixel math preserved; visual regression screenshot catches any drift |
| **Performance regression** | Medium | Pre/post benchmark on large ASCII; composable has zero reactive overhead |
| **`defineExpose` test breakage** | Medium | Re-export shim for any moved functions; remove in future iteration |
| **Mock canvas brittleness** | Low | Mocks only verify method calls; visual regression verifies actual pixels |

## Out of Scope (future iterations)
- Tool overlay (`canvastools`) rendering — tightly coupled with mouse events and `storeDiffBlocks`
- Image overlay — CSS-based, not canvas
- Brush/eraser/fill tool logic — belongs in a `useEditorTools` composable, not a renderer

## Verification Checklist
- [ ] `yarn test` — 849+ tests pass
- [ ] `yarn build` — no errors or warnings
- [ ] `yarn lint` — clean
- [ ] Performance benchmark — within ±5% of pre-refactor
- [ ] Playwright screenshot — pixel-identical to baseline
- [ ] Chrome DevTools console — zero errors/warnings
- [ ] Editor.vue line count reduced by 150–250 lines
