# 06 — `recipes` Tests the Recipe Module

**What to build:** `tests/recipes.test.ts` holds **8** text assertions on
`src/styles/recipes.ts`. A recipe class is the artefact; the assertion should read
the exported recipe table rather than the file's text, and the rendered result
belongs to `e2e/recipes.spec.ts`.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] No assertion reads `recipes.ts` as text; the assertions go through the
      exported table (or `dist/` CSS where the subject is the emitted rule).
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
