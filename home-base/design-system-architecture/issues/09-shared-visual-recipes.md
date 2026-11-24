# 09 — Shared Visual Recipes (Discussion First, Blocking)

**What to build:** a decision, then its implementation. Layout is shared through
Layout Primitives; visual recipes (type, colour role, border, focus, link style)
are re-declared per component, so a change to one combination means editing every
copy. Decide the mechanism and which recipes are shared **before** more of the
site is built. Ends with an ADR.

**Seed data** (repeated declarations across `src/**/*.{svelte,astro}`):
`color: var(--text-muted)` ×8, `--text-main` ×6, `--text-accent` ×5;
`font-size: var(--step--1)` ×5; `font-weight: var(--font-weight-semibold, 600)` ×4;
the link trio (`text-decoration: none` ×5, `underline` ×4, `text-underline-offset` ×5);
control border `var(--border-thin, 1px) solid var(--border-strong)` ×2; the focus
ring is declared once globally (`layout-integration.ts:240`) and again at
`Combobox.svelte:240` (redundant) and `HeroSearch.svelte:597` (a `:focus-within`
rule that is needed).

**Agreed direction (to be confirmed in the session):** composite tokens for
single-value recipes (e.g. `--border-control`, `--focus-outline`); utility classes
or `data-*` attributes in `@layer utilities` for multi-declaration recipes (text
roles, link style), with a guardrail allow-list in the manner of
`ALLOWED_UTILITY_CLASSES`.

**Library vs site criterion:** a recipe goes in `@w-n-c/layout` only if it needs
nothing but library tokens and semantic roles **and** a site with a different
theme would still want it. Anything tied to this site's look stays in
`src/styles/` `@layer utilities`.

**Blocking Edges:** none.
**Blocks:** hero-thoughts/07, hero-thoughts/08, data-feeds/02, paper-texture/01.
**Status:** `done` — decided in the 2026-11-21 grilling session; recorded in
`docs/adr/0012-shared-visual-recipes.md`.

**Acceptance Criteria:**

- [x] An ADR in `docs/adr/` records the mechanism, the library-vs-site rule, and
      the rejected alternatives.
- [x] Every recipe in the seed data above is either shared (and its copies
      removed) or listed in the ADR as deliberately local, with the reason.
      The ADR's table names `.site-brand`, `SectionHeader`'s resting link,
      `StateTag`'s `data-state` ink and chip leading, and the two adapters.
- [x] The CSS declaration counts above drop to **≤ 1** per shared recipe:
      `rg -c '<declaration>' src` is checked for each, excluding the generated
      `src/styles/recipes.css` and the adapters (ADR 0012, "Counts after the
      migration"). Measured: muted 1 (`global.css` axiom), accent 1 (state),
      `step--1` **0**, semibold 1 (state), `none` 1 (`.site-brand`),
      `underline` 1 (state), offset 1 (`SectionHeader`), control border **0**,
      `--focus-ring` in site CSS **0**. `tests/recipes.test.ts` enforces the
      component half of that table on every run.
- [x] A shared name that is mistyped or unknown fails a guardrail, as unknown
      utility classes do today — no new rule was needed: the recipe classes are
      in `ALLOWED_UTILITY_CLASSES` (spread from the generated
      `scripts/lib/recipe-classes.ts`), so a typo is an unknown class.
- [x] `CODING_STANDARDS.md` gains the rule: re-styling something a shared recipe
      or adapter already styles is a defect.
