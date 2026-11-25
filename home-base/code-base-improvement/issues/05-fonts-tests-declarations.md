# 05 — `fonts` Tests the Declarations

**What to build:** `tests/fonts.test.ts` holds **9** text assertions on
`@font-face` declarations and font tokens. A declaration is the artefact, so the
work is mostly confirming that and replacing any assertion that reads a component
to find a font usage.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] Each assertion asserts on a declaration or on built CSS, not on a component's
      markup; anything else is moved to `e2e/typography.spec.ts` or deleted.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
