# 07 — Single-Consumer Warning

**What to build:** a warn-tier guardrail, `single-consumer`, that notices a file in
a shared by-kind folder with exactly one consumer and says to move it next to that
consumer. This is how Notes, Projects, or any future Region gets noticed without
anyone remembering to look. See ADR 0013 decision 4.

**Blocked by:** #04, #05, #06
**Status:** `done` — 2026-11-24.

**Acceptance Criteria:**

- [ ] `single-consumer` is added to `GUARDRAIL_RULES` with severity **warn**. It
      covers `.astro`, `.svelte` and `.ts` files under `src/components/` and
      `src/lib/`, and exempts `src/components/ui/`, `src/styles/` and `src/regions/`.
- [ ] A consumer is a distinct importing file outside `tests/` and `e2e/`.
- [ ] Fixtures in `tests/guardrails.test.ts`: a file with **1** consumer → one
      `warn`; **2** consumers → none; **0** consumers → none; **1** consumer that
      is a test file → none; a `src/components/ui/` file with 1 consumer → none.
- [ ] The warning names the consumer and says to move the file next to it or into
      its Region (ADR 0013).
- [ ] Import resolution comes from the function ticket #06 added; `rg` finds **1**
      implementation of specifier-to-path resolution in `scripts/lib/`.
- [ ] The live-tree scan reports **0** `single-consumer` warnings on the real tree.
- [ ] A staged probe `src/components/__probe/Lonely.astro` imported by exactly one
      page makes the pre-commit step print `⚠️ [single-consumer]` and exit **0**;
      the probe files are removed afterwards.

**Notes (implementation):**

- Resolution is `resolveImportPath` from ticket #06 — `rg -n 'function resolveImportPath|split\(.\/.\).*pop' scripts/lib` finds one implementation and
  `single-consumer` calls it, so no second copy of the arithmetic exists.
- **The hook counts staged files only.** The adapter hands the engine the staged
  index, so the probe needed *both* files staged; a component committed alone has
  no visible consumers and stays quiet. That is the right failure direction (a
  missed warning, never a false one) and it matches the moment the warning is
  useful: a new component and its first consumer land in the same commit.
- The probe printed, verbatim:
  `⚠️ [single-consumer] src/components/__probe/Lonely.astro: Only src/pages/__probe.astro imports this file. Move it next to that consumer or into its Region (ADR 0013).`
  — then `1 warning(s). Commit allowed.` and exit **0**.
- The live tree has **0** warnings because every file still in a shared folder
  genuinely has two or more consumers: `MetricList` has 2 (`EntryCard` and the
  project page), `EntryCard` 2, `TagList` 3, `PageHeader` 6, `site-content.ts` 11.
  Nothing had to move to get there, which is the point of the warn tier.
