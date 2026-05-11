# Progress — feat/fix-open-bugs-iter-1

> Status: COMPLETED
> Updated: 2026-05-11

## Tasks

| # | Task | Status | Commit | Review | Notes |
|---|------|--------|--------|--------|-------|
| 0 | Close Bug #21 on Gitea | done | N/A | fast-path | Comment added; issue #21 closed |
| 1 | Fix Bug #21 — Context menu scroll offset | done | 20f3da0 | glm:✓ kimi:✓ | clientX/clientY + boundary clamping; 6 callers + 5 tests updated |
| 2 | Fix Bug #23 — Half-block import background persistence | done | 1b755ad | fast-path | Removed \x03\x03 collapse pre-processing; 11 half-block tests added |
| 3 | Enhancement #24 — Brush tool line interpolation | done | 4713c7b | glm:✓ kimi:✓ | Bresenham utility + interpolateStroke() helper; 17 tests; DRY refactor |

## Notes
- mIRC spec (modern.ircdocs.horse): `\x03FG` preserves bg, only `\x03` alone resets both.
- Bug #23 root cause WAS in parseMircAscii — `.split(\x03\x03).join(\x03)` collapsed soft resets.
- Bug #21 (context menu), Bug #23 (half-block import), Enhancement #24 (Bresenham) all fixed/closed on Gitea.
- All 3 issues closed on Gitea with detailed root cause/implementation comments.
- Quality gates final: Lint 0 errors, 831/831 tests, build ✅, TypeScript ✅, Browser ✅

