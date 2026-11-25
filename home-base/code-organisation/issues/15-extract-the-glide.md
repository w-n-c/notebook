# 15 — Extract the Glide Target and Its Origin

**What to build:** `src/layouts/Layout.astro:182-214` (`play`) resolves a target
through a three-step fallback chain with a loop, computes a centre offset and
scale, writes three custom properties, then reveals. Extract
`resolveGlideTarget(token)` and `writeGlideOrigin(target, rect)` inside the same
inline script, leaving `play` as: resolve → write origin → reveal. Rank 2 in
`slap-audit.md`; rules 1, 2, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] The inline script still imports nothing: the helpers live in the same
      `<script>`, so the no-router fallback keeps working with the bundle absent.
- [ ] `e2e/navigation.spec.ts` passes in both browser columns — the fallback path
      is measured there, and it is the reason this file is edited carefully.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `resolveGlideTarget(viewId)` returns the entry or
falls back to the page title then the hero (the loop now returns on match instead
of guarding `!target`); `writeGlideOrigin(target, rect)` writes `--vt-x/y/s`.
Still one inline `<script>` with no imports. `e2e/navigation.spec.ts` passes both
paths. Commit `5431d9d`.
