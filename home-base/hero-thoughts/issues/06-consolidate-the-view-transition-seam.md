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
or a new navigation affordance.
**Status:** `open` — **needs a grilling session before implementation.**

**Acceptance Criteria:**

- [ ] One exported predicate decides the path (native / fallback / instant), and
      every caller asks it; no `'onpageswap' in window` or `matchMedia` check
      survives outside that module and the pre-paint script.
- [ ] The `data-view-id` lookup is one function taking (view id, root) → element,
      used by every caller that can import it.
- [ ] The inline scripts shrink to: read the token, hand it to the module's
      start-state function, call the module's play function. Their remaining
      literals (key, ttl) are asserted against the module by a test.
- [ ] The service-worker registration and the motion scripts move out of
      `Layout.astro` into their own components/modules; the layout returns to
      composition only.
- [ ] Behaviour is unchanged: `bun run smoke` (both the native and the forced
      fallback legs) stays green, and `tests/view-transition.test.ts` keeps its
      assertions, updated only for the new locations.

**Questions for the grilling session:**

- Is the seam a *module* (`src/lib/motion.ts` gaining DOM helpers) or an *adapter*
  (a small `src/lib/view-transition.ts` that owns elements and events, leaving
  `motion.ts` pure and unit-testable)? The pure module is currently testable
  without a DOM, which is worth keeping.
- Where does the pre-paint script's copy live — a string constant in the module
  that Astro inlines, so the duplication disappears entirely?
- Does the playing script belong in the layout at all, or in the hero (only the
  hero has a `data-hero` to glide) plus a generic destination hook?
