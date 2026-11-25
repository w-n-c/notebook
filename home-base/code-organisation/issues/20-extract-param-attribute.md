# 20 — Extract `paramAttribute`

**What to build:** `packages/layout/src/layout.ts:30-49` orchestrates and, in the
same loop, carries three skip guards, a default comparison through `String()` and
the `true` → `''` coercion. Extract `paramAttribute(param, value)`: the value an
attribute gets, or `undefined` when it should be omitted. Rank 2 in
`slap-audit.md`; rules 1, 2.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `layout` reads as: spec → class attribute → one attribute per declared
      option; the coercion lives in the helper.
- [ ] Every generated wrapper's tests pass unchanged, and the built HTML is
      unchanged (`git diff --stat -- dist` prints nothing).
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `paramAttribute(param, value)` returns
`{ name, value } | null` — `null` for `undefined`, `false` and the default. The
`key === 'class'` skip stayed in the loop beside `!param`, so behaviour cannot
depend on no primitive declaring a `class` param. 361 site tests unchanged. Commit
`342b961`.
