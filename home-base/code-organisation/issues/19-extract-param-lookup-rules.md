# 19 — Extract `paramLookupRules`

**What to build:** `packages/layout/src/layout-integration.ts:142-169` nests three
loops whose inner body decides the rule shape and assembles the declarations.
Extract `paramLookupRules(param, scope, scale)` so `buildValueLookups` is two
loops and a call. Rank 2 in `slap-audit.md`; rules 1, 2, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] The emitted CSS is byte-identical: `bun run build` then
      `git diff --stat -- dist` prints nothing after a fresh build.
- [ ] The library's own tests pass unchanged.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** Two helpers: `paramLookupRules(primitive, param)`
(the bare fallback, the scope, the per-key loop) and `keyLookup(param, selector,
key)` (hand-written rules, or a declaration plus its `also` properties). The
dedupe stayed in `buildValueLookups`. Build output byte-identical; library tests
unchanged. Commit `7b38815`.
