# 03 — Reconcile ADRs + Glossary to the New Layer Homes; Write the Extraction ADR

**What to build:** Extraction changes the layer homes that ADR 0001/0003/0005 name by path (`src/lib/tokens.ts`, `src/plugins/layout-integration.ts`, `src/components/layout/*.astro`). Update those references, and record the extraction decision itself as an ADR.

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout` (done).

**Blocks:** None.

**Status:** `done`

## Acceptance Criteria

- [x] ADR 0001, 0003, and 0005 path references are updated to the new package locations (`packages/layout/...` / `@w-n-c/layout`); no document still points at moved `src/` paths as if they were authoritative. ADR 0001 and 0005 gained "Amended by ADR 0009" status lines; ADR 0005's historical reference is annotated rather than silently rewritten. `docs/agents/issue-tracker.md` was repointed too (it named `src/lib/tokens.ts` as a trunk seam).
- [x] A new ADR records the extraction decision: `docs/adr/0009-extract-the-layout-system-as-a-workspace-package.md`, with **Considered Options** (workspace vs separate repo vs in-place root export) and **Consequences** (guardrail/test path coupling; dogfooding; the dangling `./layout-tokens.css` export).
- [x] `GLOSSARY.md` stays consistent with the extraction; the *Layout Primitive Contract*, *Theme*, and *Base Styles* entries remain accurate.
- [x] `docs/adr/` numbering stays sequential: 0009 is the next free number, and it is the last.

## What changed beyond the paths

Three glossary entries had quietly gone **wrong**, not just stale:

- **Attribute Helper** said "the library ships no components" — false since ADR 0008.
- **Layout Library** said "the publishable package" and omitted the wrappers.
- **Design System** said the site owns "its own Base Styles taste" — the Base Styles moved to the library in ticket 02, leaving the site only its prose rhythm and lead subtitle.

Two terms were added, because ADR 0008 made them load-bearing and nothing named
them:

- **Layout Primitive Wrapper** — the generated component that composes the contract by spreading the Attribute Helper; never declares a parameter, scale, or default of its own.
- **Wrapper Generator** — `generateWrappers()`, which emits them as source text and imports no framework.

*Layout Primitive Contract* gained the wrapper as a composer alongside the Helper.
*Theme* needed no change and got none.

## Verification

- Every remaining `src/lib/tokens.ts` / `src/plugins/layout-integration.ts` /
  `src/components/layout/*.astro` hit in the repo is now **deliberate history**:
  ADR 0009's Context (describing where things *were*), ADR 0007's note that the
  stale references were fixed, and ADR 0005's annotated historical sentence. No
  document presents a moved path as current.
- Gate green: 51 library tests + 92 site tests, `astro check` 0 errors, `tsc`
  clean, `svelte-check` 0/0, 10 pages built.

## Deviation: this ticket absorbed a test-suite split

Mid-ticket the user raised a principle: *"if those tests are testing just library
functionality they should be in the library — we wouldn't do a whole sweep of
tests to see if Tailwind is actually applying properly when we import it."* That
was correct, and it was blocking this ticket's own goal — `layout-integration.test.ts`
was asserting things about `src/styles/global.css`, a site file, from a file that
was supposed to be the library's.

The split is recorded as its own ticket (11) rather than buried here.
