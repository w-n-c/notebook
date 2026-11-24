# 04 — Hero Region

**What to build:** the home-page Hero becomes the first **Region**: everything only
it uses lives in one folder with one public entry point, and the rest of the site
imports it through that entry point. The page renders and behaves exactly as
before; only locations and import paths change. `HeroSearch.svelte` is moved, not
split and not edited beyond its import lines. See ADR 0013 decisions 1, 3, 5, 7.

**Blocked by:** #02
**Status:** `done` — 2026-11-24; see the notes at the end.

**Acceptance Criteria:**

- [ ] `src/regions/hero/` contains exactly **12** files: `HeroThoughts.astro`,
      `HeroSearch.svelte`, `PromptField.svelte`, `StateTag.svelte`,
      `ReturnToHero.astro`, `drum.ts`, `motion.ts`, `resolution.ts`, `copy.ts`,
      `navigation.ts`, `silhouette.svg` and `index.ts`
      (`fd -t f . src/regions/hero | wc -l` prints 12).
- [ ] `src/regions/hero/index.ts` exports exactly **2** symbols: `HeroThoughts` and
      `ReturnToHero`.
- [ ] Outside `src/regions/hero/`, the only importers of the Region are
      `src/layouts/Layout.astro` and `src/pages/index.astro`, each importing
      `../regions/hero` and nothing deeper
      (`rg -n 'regions/hero' src` outside the Region shows exactly those 2 files).
- [ ] The 5 hero components are gone from `src/components/`; `src/lib/` holds
      exactly **1** file, `site-content.ts` (`fd -t f . src/lib | wc -l` prints 1);
      `src/assets/silhouette.svg` does not exist.
- [ ] Tests and e2e specs only have path/import changes: `git diff -U0 tests e2e | rg '^[+-].*\b(expect|test|it|describe)\('` returns **0** hits.
- [ ] `HeroSearch.svelte` has only import lines changed
      (`git diff -M -U0 -- src/regions/hero/HeroSearch.svelte` shows no changed line
      outside an `import` / `} from` line).
- [ ] No living doc names a moved path: `rg -n 'src/lib/(drum|motion|resolution|copy|navigation)|components/(HeroThoughts|HeroSearch|PromptField|StateTag|ReturnToHero)' AGENTS.md CODING_STANDARDS.md README.md docs/agents` returns **0** hits. (Accepted ADRs are historical.)
- [ ] `bun test`, `bun run typecheck`, `bun run build` exit **0**, and the e2e
      `motion` and `navigation` specs pass (command in `docs/agents/browser.md`).
- [ ] `bun scripts/check-guardrails.ts` on the moved tree exits **0**.

**Notes (implementation):**

- The 12 files are there, `src/lib/` holds `site-content.ts` alone, `src/assets/`
  has no `silhouette.svg`, and `rg -ln 'regions/hero' src` prints exactly
  `src/layouts/Layout.astro` and `src/pages/index.astro`.
- **`src/env.d.ts` is new.** A `.ts` file cannot import an `.astro` component
  without an ambient declaration (Astro declares `astro:content`, not `*.astro`),
  so `tsc` failed on `index.ts` until `declare module '*.astro'` existed.
  `astro check` still resolves the real component and checks its props.
- **One guardrail predicate widened:** `isComponent` now covers `src/regions/` as
  well as `src/components/`, or `adapterSeam` would have silently stopped policing
  the five moved components.
- The AC's tests check finds **4** hits, all `describe(...)` titles that name a
  module path (`Navigation (src/lib/navigation.ts)` and three siblings). Renaming
  the module and leaving the title stale would be a lie in the test output, so the
  titles moved with the files; **0** `expect(` or `it(` lines changed.
- `HeroSearch.svelte` comments on lines 73 and 166 still say `src/lib/drum.ts`:
  the AC freezes every non-import line, so ticket 10 (which rewrites that file)
  is where they get fixed.
