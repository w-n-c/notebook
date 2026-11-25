# 21 — Extract `collectEdges`

**What to build:** `scripts/lib/issues.ts:160-203` builds a record from path,
title and status regexes and, in the middle, scans prose lines for `Blocked by:` /
`Blocks:` edges with its own continuation rule. Extract
`collectEdges(lines): { blockedBy, blocks }`. Rank 2 in `slap-audit.md`;
rules 1, 3.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `parseIssue` reads as: identity from the path → title and status → the
      edges → the record; the line scanner is gone from its body.
- [ ] `tests/issues.test.ts` passes unchanged, including the wrapped-edge case.
- [ ] `bun run issues` regenerates `.scratch/ISSUES.md` with no diff.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/`.

**Notes (implementation):** `collectEdges(lines)` owns the scan and returns the
two sorted lists; `parseIssue` destructures it. The continuation comment moved
with the code. 28 issue tests unchanged and `bun run issues` regenerates the same
index. Commit `dcf4bde`.
