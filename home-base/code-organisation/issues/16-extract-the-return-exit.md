# 16 — Extract the Return CTA's Exit

**What to build:** `src/regions/hero/ReturnToHero.astro:36-51` — the `click`
handler holds four guards, a DOM lookup, `preventDefault`, a token write, an
attribute and a timer. Extract `playReturnExit(cta, title)` into the script, and
reuse the guard predicate `view-transition.ts` already names instead of
re-spelling it. Rank 2 in `slap-audit.md`; rules 1, 2.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] The handler reads as: claim the click → play the exit; the guards live in
      one named predicate.
- [ ] `tests/view-transition-dom.test.ts` passes unchanged, and any new assertion
      for the extracted predicate is an addition, not an edit.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** The guards became `narratableClick(event, view)` in
`view-transition.ts`, and `fallbackClick` is now that predicate plus the
`a[data-view-id]` lookup — one definition, two ends. `playReturnExit` takes the
event alone rather than the `(cta, title)` the ticket proposed: the handler never
reads the cta, and looking the title up is part of the work. Four added tests for
the predicate (13 → 16 in `view-transition-dom.test.ts`). Commit `142d0e1`.
