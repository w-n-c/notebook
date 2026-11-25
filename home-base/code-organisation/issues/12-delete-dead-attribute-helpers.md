# 12 — Delete the Dead Attribute Helpers

**What to build:** `packages/layout/src/tokens.ts` exports `attrValue` and
`attrBool`, each a single ternary, and nothing in the tree calls either — they
survived the move onto `layout()`. Delete both. Rank 1 in `slap-audit.md`; rule 5.

**Blocked by:** #11
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `rg -n "attrValue|attrBool" packages src tests e2e scripts` prints **0** lines.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` pass with **0** changed lines
      under `tests/` and `e2e/` (`git diff --numstat -- tests e2e` prints nothing).
- [ ] `packages/layout/src/tokens.ts` loses exactly the two exports and the
      comment above them; nothing else in the file moves.

**Notes (implementation):** Deleted both exports and the blank line between them;
`packages/layout/src/tokens.ts` keeps `easings` and `Easing`. `rg` finds no
reference anywhere, including the generated wrappers. Commit `3f47b91`.
