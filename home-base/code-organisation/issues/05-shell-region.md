# 05 — Shell Region

**What to build:** the page chrome (`SiteHeader` and its `SiteNav`) becomes the
second **Region**, imported by `Layout.astro` through its entry point. It does not
go into `src/layouts/`: ADR 0003 and a guardrail make that directory pure
composition with no `<style>` block, and both components carry one. The rendered
site is unchanged. See ADR 0013 decisions 5 and 6.

**Blocked by:** #04
**Status:** `open`

**Acceptance Criteria:**

- [ ] `src/regions/shell/` contains exactly **3** files: `SiteHeader.astro`,
      `SiteNav.astro` and `index.ts`; `index.ts` exports exactly **1** symbol,
      `SiteHeader`.
- [ ] `rg -n 'SiteHeader|SiteNav' src` outside `src/regions/shell/` hits only
      `src/layouts/Layout.astro` (importing `../regions/shell`); `SiteNav` is
      imported only by `SiteHeader`.
- [ ] `src/components/` has no `SiteHeader.astro` or `SiteNav.astro`, and
      `src/layouts/` still contains exactly **1** file, `Layout.astro`.
- [ ] Tests only have path/import changes: `git diff -U0 tests e2e | rg '^[+-].*\b(expect|test|it|describe)\('` returns **0** hits.
- [ ] No living doc names the old paths: `rg -n 'components/(SiteHeader|SiteNav)' AGENTS.md CODING_STANDARDS.md README.md docs/agents` returns **0** hits.
- [ ] `bun scripts/check-guardrails.ts` exits **0** (the `<style>` blocks in the
      moved files are legal outside `src/layouts/`).
- [ ] `bun test`, `bun run typecheck`, `bun run build` exit **0**, and the e2e
      `navigation` spec passes.
