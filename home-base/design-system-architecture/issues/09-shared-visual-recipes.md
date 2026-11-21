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
**Blocks:** hero-thoughts #07, #08, data-feeds #02, paper-texture #01.
**Status:** `open` — **needs a grilling session with `docs/ui-guide.md` and the
seed data open.**

**Acceptance Criteria:**

- [ ] An ADR in `docs/adr/` records the mechanism, the library-vs-site rule, and
      the rejected alternatives.
- [ ] Every recipe in the seed data above is either shared (and its copies
      removed) or listed in the ADR as deliberately local, with the reason.
- [ ] The CSS declaration counts above drop to **≤ 1** per shared recipe:
      `rg -c '<declaration>' src` is checked for each.
- [ ] A shared name that is mistyped or unknown fails a guardrail, as unknown
      utility classes do today.
- [ ] `CODING_STANDARDS.md` gains the rule: re-styling something a shared recipe
      or adapter already styles is a defect.
