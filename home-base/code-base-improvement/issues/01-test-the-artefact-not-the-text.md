# 01 — Test the Artefact, Not the Text

**What to build:** the standard that stops the suite asserting on component source,
and its first application: the two Hero test files that block
`code-organisation/10`. The rule goes in `CODING_STANDARDS.md`; the inventory of
files that still break it lives in `.scratch/code-base-improvement/README.md`, not
in the standards.

The suite currently asserts on `HeroSearch.svelte`'s text — `expect(island).toContain('createDrum(')`,
`toContain("source.setAttribute('data-vt-exit', '')")`, `toContain('reducedMotion()')`
— so any refactor that moves a call into a helper turns the suite red while
behaviour is unchanged. That is the thing `code-organisation/10` exists to do.

**Blocked by:** None
**Status:** `done` — 2026-11-24.

**Acceptance Criteria:**

- [ ] `CODING_STANDARDS.md` gains one section, "Test the Artefact, Not the Text",
      with **4** numbered rules: (1) text may be asserted only when it *is* the
      artefact; (2) text standing in for behaviour is asserted on the module that
      exports it, on `dist/` output, or in a browser; (3) deleting a test whose
      behaviour a real-browser spec already measures is coverage moving to one
      owner, not coverage lost; (4) an assertion that needs a file's *shape* to
      pass is the signal to extract the behaviour into a module.
- [ ] The section says it is enforced by review and not by a guardrail, and why in
      one sentence. It contains **1** worked example and **no** inventory of files.
- [ ] `rg -n "read\('src/regions/hero|readFileSync\(resolve\(ROOT, 'src/regions/hero" tests/view-transition.test.ts tests/hero-thoughts.test.ts`
      prints **0** lines (today: **13** `it`-blocks read that source — 5 in
      `tests/view-transition.test.ts`, 8 in `tests/hero-thoughts.test.ts`).
      `tests/copy.test.ts:80` reads `ReturnToHero.astro` and is ticket #04's, not
      this ticket's.
- [ ] Each removed assertion is dispositioned as one of: deleted because
      `e2e/motion.spec.ts` or `e2e/navigation.spec.ts` measures the behaviour;
      rewritten as a test of the exported module (`motion.ts`, `view-transition.ts`);
      or re-pointed at built CSS through the existing `siteCss()` helper.
- [ ] No behaviour is lost: `bun test ./tests` passes, and
      `bun run smoke -- e2e/motion.spec.ts e2e/navigation.spec.ts e2e/home-fidelity.spec.ts e2e/narrow.spec.ts`
      passes.
- [ ] `bun scripts/check-guardrails.ts` exits **0** and `bash scripts/ci.sh` is
      green.
- [ ] The six remaining files are recorded as tickets 02–07 with their assertion
      counts; none of them is implemented here.

**Notes (implementation):**

- Both files keep every `it`-block they had (16 + 19 = **35**); what changed is
  what the assertions read. 333 tests pass, up from 316.
- **Deleted, because a browser spec measures the behaviour:** `createDrum(` and
  `requestAnimationFrame` (→ `e2e/motion.spec.ts`), the exit arming
  `source.setAttribute('data-vt-exit', '')` and the `data-spinning` attribute
  (→ `e2e/navigation.spec.ts`), the island's `prefers-reduced-motion: reduce` and
  `reducedMotion()` calls (→ the emitted media query plus `e2e/navigation.spec.ts`),
  the `{#if canClear}` template shape (→ `e2e/home-fidelity.spec.ts`'s Clear test),
  and `mix-blend-mode`/`grain.svg` (→ the built-HTML `div.grain` check that stays).
- **Rewritten as module tests:** `supportsCrossDocumentViewTransition({})`/
  `(undefined)`/`({ onpageswap: null })`; the spin's invariant as
  `rotateEntries(idleSuggestions(seedCatalog), 1)` returning the catalog's own
  entries reordered; the copy dependency as
  `resolvePrompt(...).speechCue === SPEECH_CUES.synthesized`.
- **Re-pointed at the artefact:** every CSS claim now reads `dist/*.css` — the
  drum offset (`--drum-y`), the settle timing, the reduced-motion freeze, the
  silhouette's ink and its two stroke widths (the dark one thinner), the stream
  mask, the prompt's `--border-control`, and the `@container hero (width>=65ch)`
  query with its threshold pinned to `measureSteps.measure`.
- `siteCss()` moved into `tests/helpers/build.ts` so both files use one
  implementation of "read the emitted CSS".
- One assertion got **stronger** on the way out: "no viewport query" used to scan
  one component's `<style>` block and now scans every stylesheet the site emits.
- The assertion counts in `.scratch/code-base-improvement/README.md` are the
  starting point, not the contract; tickets 02–07 own the remaining six files.

