# Phase 3: Comprehensive Test Coverage — Iteration 7

## Summary
Phase 3 test coverage continues. 355 tests pass with 46.33% statement coverage.
Core engine (ascii.ts: 95.42%) and store (definitions.ts: 97.95%) are well-covered.
This iteration fixes 5 failing keyboard tests by correcting the `toolbarStateOverrides`
pattern to use the existing `createToolbarState` API, commits the $tore bug fix,
adds Layers.vue comprehensive tests, closes gaps on About/NewAscii, and targets
~52% overall coverage.

## Tasks

### Task 0: Fix $tore Typo + Fix 5 Failing Keyboard Tests
- Layers.vue: `this.$tore` → `this.$store` (already in uncommitted)
- keyboard.spec.ts: Change `toolbarStateOverrides` to `toolbarState: createToolbarState({...})`
- 5 tests to fix: isChoosingFg, isChoosingBg, isChoosingChar, escape handler, isTextEditing

### Task 1: Validate ImageOverlay Tests + Commit
- 14 ImageOverlay.vue tests already in uncommitted modals.spec.ts
- Verify they pass, commit together with Task 0

### Task 2: Layers.vue Comprehensive Tests (~14 tests)
- New file tests/unit/layers.spec.ts
- Test computed: currentAsciiLayers, selectedLayer, toolbarState, imageOverlay,
  imageOverlayUrl, isLastVisibleLayer
- Test methods: openImageOverlayModal, changeLayer, selectBestLayer
- Test template: layer list, visibility toggles, add/remove buttons, disabled states
- Out of scope: showLayerRename (needs $dialog mock)

### Task 3: Close Gaps on About.vue + NewAscii.vue (~8 tests)
- About.vue: watch lifecycle, mounted branch (~3 tests)
- NewAscii.vue: initiateNewASCII edge cases (~5 tests)

### Task 4: Quality Gates
- All ~411+ tests pass
- Build succeeds, lint clean
- Coverage ~52% overall
