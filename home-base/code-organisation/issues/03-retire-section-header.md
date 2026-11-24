# 03 — Retire `SectionHeader`

**What to build:** the unused `SectionHeader` UI Pattern is deleted, together with
the one exception it forces: ADR 0012 lists its `text-underline-offset` as the only
declaration allowed to differ from the Recipes, and `tests/recipes.test.ts` asserts
exactly that. After this ticket no file keeps its own offset. This is the only
ticket in the feature that changes a test assertion, which is why it stands alone.

**Blocked by:** None (can start immediately).
**Status:** `done`

**Acceptance Criteria:**

- [ ] Before deleting, `rg -l SectionHeader src` lists only
      `src/components/SectionHeader.astro` itself (0 consumers). If anything else
      appears, stop and report instead of deleting.
- [ ] `src/components/SectionHeader.astro` is deleted and
      `rg -n 'SectionHeader|section-link' src tests e2e scripts docs/agents GLOSSARY.md CODING_STANDARDS.md` returns **0** hits.
- [ ] The `tests/recipes.test.ts` assertion that named `SectionHeader.astro` now
      asserts that **0** files keep their own `text-underline-offset`, and it passes.
- [ ] ADR 0012's exception table no longer has the `SectionHeader` row or its row
      in the offset count, and the ADR gains one dated line recording the
      amendment (not a silent edit).
- [ ] The glossary's **UI Pattern** definition no longer lists "section header" as
      an example.
- [ ] `bun test` and `bun run build` exit **0**.
