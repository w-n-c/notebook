# 17 — Extract the Wheel Delta

**What to build:** `src/regions/hero/drum.ts:250-259` computes the scroll delta
with a three-state `deltaMode` ternary between its guards and its write. Extract
`wheelDeltaPx(event, viewportHeight)`: line mode is `WHEEL_LINE_PX`, page mode the
viewport height, pixel mode 1. Rank 2 in `slap-audit.md`; rules 1, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `wheelDeltaPx` is pure and exported, and `onWheel` reads as: parts → delta →
      nudge → write.
- [ ] New assertions in `tests/drum.test.ts` for the three modes are additions;
      the existing ones do not change.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `wheelDeltaPx(event, viewportHeight)` is exported and
pure, beside `advanceDrift` / `nudgeDrift`; `onWheel` is parts → delta → nudge →
write. The test imports it on a second line from the same module, because the
existing import is already over the formatter's width and editing it would show a
deleted line — this ticket's proof is an additions-only diff under `tests/`.
26 drum tests, 0 deleted lines. Commit `3943e13`.
