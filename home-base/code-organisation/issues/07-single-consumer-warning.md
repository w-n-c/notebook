# 07 — Single-Consumer Warning

**What to build:** a warn-tier guardrail, `single-consumer`, that notices a file in
a shared by-kind folder with exactly one consumer and says to move it next to that
consumer. This is how Notes, Projects, or any future Region gets noticed without
anyone remembering to look. See ADR 0013 decision 4.

**Blocked by:** #04, #05, #06
**Status:** `open`

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
