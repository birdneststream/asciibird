# Progress — refactor/idb-all-stores-resize-handles

> Status: COMPLETED
> Branch: `refactor/idb-all-stores-resize-handles`
> Updated: 2026-05-14

## Summary

Iteration 2 of Phase 7. Two open Gitea issues: #43 (IDB migration) + #41 (canvas resize).

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 1 | Fix IDB migration guard (per-key) | done | 8089b73 | fast-path | Per-key migration guard replaces all-or-nothing hasIdbData check |
| 2 | Migrate all stores to IndexedDB (#43) | done | a3e92a2 | fast-path | All 5 stores now use IDB. PERSISTED_KEYS updated with 3 new keys |
| 3 | Extend ResizeHandlePosition + 8-dir resize (#41) | done | b39e099 | glm:✓ hy3:✓ | Invariant-based algorithm for all 8 handles + 7 new tests + Editor.vue callback fix |
| 4 | Add resize handle DOM + CSS (#41) | done | ec71301 | fast-path | 8 handle divs + CSS for all directions |
| 5 | Browser verify + close issues + merge | done | — | — | Browser verified: 0 console errors, 8 handles in DOM, all 5 stores in IDB, tabs persist across reload |

## Notes
