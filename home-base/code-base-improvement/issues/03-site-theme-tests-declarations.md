# 03 — `site-theme` Tests the Theme's Declarations

**What to build:** `tests/site-theme.test.ts` holds **11** text assertions on
`src/theme.ts` and the colour-role table. These are the closest to legitimate: a
declaration *is* the artefact. Check each one against ticket #01's standard and
move anything that asserts on a call or a shape rather than a declaration.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] Every assertion is classified; the ones that assert on behaviour rather than
      a declaration are rewritten against the exported value or deleted where the
      colour-role guardrail (`color-role-single-source`) already covers them.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
