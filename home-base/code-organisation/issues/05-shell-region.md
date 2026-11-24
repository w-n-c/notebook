# 05 — Shell Region

**What to build:** the page chrome (`SiteHeader` and its `SiteNav`) becomes the
second **Region**, imported by `Layout.astro` through its entry point. It does not
go into `src/layouts/`: ADR 0003 and a guardrail make that directory pure
composition with no `<style>` block, and both components carry one. The rendered
site is unchanged. See ADR 0013 decisions 5 and 6.

**Blocked by:** #04
**Status:** `done` — 2026-11-24.

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

**Notes (implementation):**

- `src/regions/shell/` holds the 3 files; `index.ts` exports `SiteHeader` alone.
  `SiteNav` is not exported: nothing outside the Region places it, and the ADR's
  rule is one public name per thing a page composes.
- `SiteNav` imported `../lib/site-content`, which is now two levels up
  (`../../lib/site-content`). That is the only line that changed besides the
  `Layout.astro` import and the three test paths.
- The AC's tests check finds **0** hits here — no test title named either file.
