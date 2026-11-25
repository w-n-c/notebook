# 18 — One Query in `nameEntryForNavigation`

**What to build:** `src/regions/hero/view-transition.ts:95-113` harvests every
`data-view-id` into an array, asks `findViewId` which matches, then queries the
DOM again for that id. Replace the pair with `entryForUrl(root, url)`: one pass
over `[data-view-id]` that matches on the way. Rank 2 in `slap-audit.md`; rules 1, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `nameEntryForNavigation` reads as: url → entry → name it; the id harvest is
      gone and `findViewId` is either reused once or dropped from this path.
- [ ] `tests/view-transition-dom.test.ts` passes unchanged.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `entryForUrl(root, url)` reads the entries once,
matches the id in memory, and returns the element from the same array;
`nameEntryForNavigation` is now two lines. `entryElement` stays as the by-id
primitive `goTo` uses, so its caller count is one — if a reviewer prefers, it
inlines into `goTo` in one line. `tests/view-transition-dom.test.ts` unchanged,
16 pass. Commit `408046e`.
