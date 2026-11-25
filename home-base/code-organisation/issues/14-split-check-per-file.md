# 14 — Split `checkPerFile` Into Named Checks

**What to build:** `scripts/lib/guardrails.ts:527-633` delegates five rules to
functions and inlines five more, one of which (`global.css` layer) carries a
comment-stripping and URL-blanking pass of its own. Extract
`checkGlobalCssLayer`, `checkAdapterSeam` and `checkUtilityClasses`, so
`checkPerFile` is a list of calls. Rank 1 in `slap-audit.md`; rules 1, 4.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `checkPerFile` contains no regex matching, no message string and no loop.
- [ ] `tests/guardrails.test.ts` passes unchanged: **73** tests, and the live-tree
      scan still reports zero violations.
- [ ] `bun scripts/check-guardrails.ts` exits **0**.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** Six helpers, not three: the AC forbids message
strings in `checkPerFile`, so `checkInlineStyle`, `checkStyleBlock`,
`checkUtilityClasses`, `checkGlobalCssLayer` (+ `namesClassSelector` for the
comment/URL stripping), `checkBitsUiIsolation` and `checkAdapterSeam` each own
one rule. `checkPerFile` is now an 11-line array. 73 guardrail tests unchanged;
live tree still clean. Commit `2d3b5bc`.
