# 22 — Extract the Index's Optional Sections

**What to build:** `scripts/lib/issues.ts:232-288` counts, sorts and formats in
one body, with two 15-line optional sections spread-ternaried into the line
array. Extract `renderVagueSection(entries)` and
`renderDanglingSection(edges)`, each returning its lines or `[]`. Rank 2 in
`slap-audit.md`; rules 1, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `renderIssueIndex` reads as: header → table rows → the two sections → join.
- [ ] `tests/issues.test.ts` passes unchanged, and `bun run issues` regenerates
      `.scratch/ISSUES.md` with no diff.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `renderVagueSection(entries)` and
`renderDanglingSection(edges)` return their lines or `[]`, so both spread
unconditionally; `findDanglingEdges` is called where it is used. The regenerated
`.scratch/ISSUES.md` is byte-identical to the previous one. Commit `f059325`.
