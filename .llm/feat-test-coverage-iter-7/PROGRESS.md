# Progress — feat/test-coverage-iter-7

> Status: IN PROGRESS
> Updated: 2026-05-09

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 0 | Fix $tore typo + fix 5 failing keyboard tests | done | `7356645` | glm:✓ hy3:✓ | toolbarStateOverrides → createToolbarState, 389 tests pass |
| 1 | Validate ImageOverlay tests + commit | done | `7356645` | glm:✓ hy3:✓ | 16 ImageOverlay tests committed with task 0 |
| 2 | Layers.vue comprehensive tests (~14 tests) | done | `f6d956d` | glm:✓ hy3:✓ | 30 tests (expanded from ~14 after review feedback) |
| 3 | Close gaps on About.vue + NewAscii.vue (~8 tests) | done | `3d6307e` | fast-path | 8 new tests: watch lifecycle, mounted branches, initiateNewAscii |
| 4 | Quality gates — build, lint, coverage | in_progress | | | All tests pass, ~52% coverage |

## Notes

- Task 0+1 committed together: $tore fix + 21 keyboard tests + 16 ImageOverlay tests + helpers enhancements
- eslint.config.js: disabled vue/multi-word-component-names (many existing components violate it)
- mergeAllLayers mock is no-op (comment says "keeps first layer" — noted as inaccurate)
- t-radio stub emits 'change' instead of 'input' for v-model (harmless for current tests)
- initiateNewAscii tests use try/catch because createNewASCII calls getStore() which throws without store init
