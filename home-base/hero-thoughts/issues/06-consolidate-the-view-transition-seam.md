# 06 — Consolidate the View-Transition Seam (Blocking)

**What to build:** one module that owns the whole navigation-motion contract, so
the "is this a real navigation?" question and the "which entry is this URL?"
lookup are asked in one place instead of four.

Today the same three pieces are spread across `src/components/HeroSearch.svelte`,
`src/components/ReturnToHero.astro`, and the two inline scripts in
`src/layouts/Layout.astro`:

1. **The path decision.** `supportsCrossDocumentViewTransition(window) || reducedMotion()`
   appears in `navigate()`, in the pointer-click `$effect`, and in
   `ReturnToHero.astro`, each written separately. This is the decision that
   decides whether a click plays an exit; getting it out of step in one copy is a
   visible bug, not a style nit.
2. **The entry lookup.** "find the element whose `data-view-id` equals this URL"
   is implemented three times: `entryElement()` in the island, `nameEntry()` in
   the island, and `play()` in the layout's inline script (which cannot import,
   because it is parser-blocking).
3. **The token.** `KEY`/`TTL` are duplicated between `src/lib/motion.ts` and the
   pre-paint inline script, pinned only by a test — deliberate (the script must
   not be a module), but it should be the *only* such duplication.

`src/layouts/Layout.astro` is also doing three jobs (composition, the two motion
scripts, and the service-worker registration), which is the divergent change the
review flagged: the layout should compose, not implement.

**Blocking Edges:** Blocks hero #08 (mobile) and anything that adds a destination
or a new navigation affordance. **Blocked by** code-organisation #04 (hero
Region) and #05 (shell Region): the new files are created at their final paths.
**Status:** `open` — grilled 2026-11-24; decisions below, ready to implement.

## Decisions (grilling session)

- **Two files, not one.** `motion.ts` stays pure (no DOM); a new
  `view-transition.ts` is the DOM adapter. Both live in `src/regions/hero/`.
- **One predicate.** `navigationPath(env): 'native' | 'fallback' | 'instant'` in
  `motion.ts`; native wins over reduced motion. Glossary: **Navigation Path**.
- **Adapter surface.** `findEntry(url, root)` (normalises both sides with
  `pathOf`), `leaveTo(href, source)` (token, `data-vt-exit`, `EXIT_MS`, assign),
  `interceptLeave(event, href, source)` (the primary-click/modifier guard, a
  no-op unless the path is `'fallback'`), and the `pageswap`/`pagereveal` entry
  naming now in `HeroSearch`. `HeroSearch` and `ReturnToHero` only call these.
- **Inline scripts cannot import**, so the "hand it to the module's start-state
  function" bullet is reworded: they hold no key/ttl literal (`define:vars`
  injects `VIEW_TOKEN_KEY`/`VIEW_TOKEN_TTL_MS`), and a happy-dom test pins their
  logic to the module. The rect→offset→scale math becomes a pure
  `glideFrom(rect, box)` in `motion.ts`. The inline `play()` keeps an exact-match
  lookup because tokens are written already normalised; the test pins that.
- **Layout.** The hero Region exports `HeroThoughts`, `ReturnToHero`,
  `NavigationMotionArm` (head, inline) and `NavigationMotionPlay` (body end,
  inline). The shell Region exports `SiteHeader` and
  `ServiceWorkerRegistration`. `Layout.astro` composes only. The play script is
  global (destination pages glide their title in), not hero-only.
- **Docs.** Glossary term added. No new ADR; add one line to ADR 0010 decision 4
  pointing at `src/regions/hero/view-transition.ts` when the file exists.

**Acceptance Criteria:**

- [ ] `navigationPath` decides the path; no `'onpageswap' in` or
      `prefers-reduced-motion` survives in `.ts`/`.svelte`/`.astro` outside
      `motion.ts` and the two inline scripts. Unit-tested, including
      native-beats-reduced-motion.
- [ ] `findEntry(url, root)` is the one lookup for every importing caller;
      `/view/music/` and `https://host/view/music` both match `/view/music`.
- [ ] `leaveTo` is the one exit sequence (`EXIT_MS` 200, ≤250) and
      `interceptLeave` the one click guard; `HeroSearch` and `ReturnToHero` hold
      no copy of either.
- [ ] The head script has no `'hb:view'` or `4000` literal. A happy-dom test runs
      the built inline source: a fresh token (≤4000ms) arms `data-vt`,
      `data-vt-from` and the four `--vt-from-*` properties; a stale or malformed
      one arms nothing; `play()` finds the entry `findEntry` finds and writes
      `--vt-x/-y/-s` equal to `glideFrom` (scale clamped 0.25–1.5).
- [ ] Hero `index.ts` exports the four names above; shell `index.ts` exports
      `SiteHeader` and `ServiceWorkerRegistration`; `Layout.astro` has no inline
      `<script>`. The service worker registration moves unchanged.
- [ ] Behaviour unchanged: `bun run smoke` (native and forced-fallback legs)
      green; `tests/view-transition.test.ts` keeps its assertions, updated only
      for new locations and the key/ttl assertion.
- [ ] ADR 0010 decision 4 gains the one-line pointer.
