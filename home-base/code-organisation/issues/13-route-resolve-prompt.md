# 13 — Route `resolvePrompt` Through `rankCatalog`

**What to build:** `src/regions/hero/resolution.ts:125-149` inlines the score →
filter → sort pipeline between its tier guards, so the module's entry point does
two kinds of work. Move the pipeline into `rankCatalog(query, catalog)` and leave
`resolvePrompt` as a router over three tiers. Rank 1 in `slap-audit.md`; rules 1, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `resolvePrompt` reads as: empty query → synthesized; no ranked entries →
      synthesized; a top score of 1 → dynamic; otherwise assembled.
- [ ] `tests/resolution.test.ts` passes unchanged — its numbers are the proof the
      ranking is identical.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `rankCatalog(query, catalog)` holds the map/filter/
sort; `resolvePrompt` is `const ranked = query === '' ? [] : rankCatalog(...)`
then three tiers. The empty-query guard stayed a guard rather than a contract on
the helper, because an entry with an empty term would otherwise score 0.6 and
assemble itself. 24 resolution + stream-options tests unchanged. Commit `79987af`.
