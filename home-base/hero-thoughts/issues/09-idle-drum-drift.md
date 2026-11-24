# 09 — The Idle Drum: a Slow, Seamless, Visible Scroll

**What to build:** the Thought Stream at rest is a *drum*: the entries travel
steadily upward at ~22px/s, loop without a seam, pause while the visitor hovers
or focuses, and stand still under reduced motion. Ticket 04 shipped a CSS
`alternate` translate of ±`--space-m` (`stream-drift` in `HeroSearch.svelte`)
that moves about 1px/s and never loops. It satisfies "slow" and delivers nothing
a person can see. This ticket replaces it.

**Reference (behaviour only, never conventions):** `.scratch/hero-thoughts/new_vis.html`
lines 1725–1800 (`renderIdle`, `startIdleDrift`, the hover/focus pause handlers).
Port what it *does*; write it in this repo's conventions (Svelte island, UI
Adapter, tokens, `@layer components`, no viewport media queries, no prototype
copy). The prototype is throwaway code: do not copy its structure.

**Blocking Edges:** Blocked by browser-testing/01 for the motion leg's harness
(if that has not landed, add the leg to `scripts/smoke.ts` as it stands).
**Status:** `done`

**Acceptance Criteria (each is observable in a browser; the number is the point):**

- [ ] **Travels.** At rest on `/`, sampling the first entry's
      `getBoundingClientRect().top` twice, 2000ms apart, shows it moved **between
      36 and 52 px** upward (22px/s, ±~20%), measured in real Chromium.
- [ ] **Loops without a seam.** Over one full loop period, the visible window is
      never empty at the bottom: the last visible entry's bottom edge is always
      ≥ the viewport's bottom edge, and the wrap is not visible as a jump (the
      first entry's `top` after the wrap equals its `top` before, ±1px).
- [ ] **Pauses.** While the pointer is over the stream, or any entry/input has
      keyboard focus inside the stream zone, displacement over 2000ms is **0**.
      It resumes when both stop.
- [ ] **Still under reduced motion.** With `prefers-reduced-motion: reduce`
      emulated, displacement is **0** and the DOM holds **one** copy of the
      entries (no decoy group).
- [ ] **Only at rest.** Not while a query is resolved, not during the searching
      spin (`stream-search`/`data-spinning`), not while a view is opening.
- [ ] **Accessible.** The looping copy is `aria-hidden`, `tabindex="-1"`, not a
      keyboard target, not in the listbox's option set; axe stays at 0 violations;
      Arrow-key navigation never lands on a decoy.
- [ ] `stream-drift` keyframes and its `animation:` line are deleted; the
      assertion in `tests/view-transition.test.ts` that matched
      `/stream-drift \d+s/` is replaced by the observable checks above.

**Steps for the implementing agent (red before green, one slice at a time):**

1. **Red — the pure part.** In `tests/motion.test.ts` add tests for a new pure
   `advanceDrift(y, dtMs, loopHeight, pxPerSecond = DRIFT_PX_PER_S)` in
   `src/lib/motion.ts`: 16ms frames for 1000ms advance ~22px; `dtMs` is capped at
   48 (a backgrounded tab must not jump); the result wraps modulo `loopHeight`;
   `loopHeight <= 0` returns `y` unchanged. Expected values are literals, not a
   recomputation of the formula. Export `DRIFT_PX_PER_S = 22`.
2. **Red — the observable part.** Add a motion leg to `scripts/smoke.ts` (or the
   browser-testing harness) asserting the Travels / Pauses / Reduced-motion
   criteria. Run it; it must fail on the current build.
3. **Green — adapter.** `src/components/ui/Combobox.svelte`: add an optional
   `decorative?: boolean` on `ComboboxOption`. A decorative option renders as a
   plain `<a aria-hidden="true" tabindex="-1" href=…>` carrying the same `item`
   snippet, *not* as a `Combobox.Item` (so bits-ui never registers it). Style it
   with the same selector as `a[data-combobox-item]` (add a `data-combobox-decoy`
   attribute and extend the selector). It carries no `data-view-id`.
4. **Green — island.** `src/components/HeroSearch.svelte`: when idle
   (no resolution, not spinning) and motion is allowed, `options` is the idle
   entries followed by the same entries with `decorative: true` and
   `value: "<value>::decoy"`. Drive an rAF loop that holds `driftY`, calls
   `advanceDrift`, and writes it to the stream container as a CSS variable
   (`--drum-y`) via `element.style.setProperty`. Children translate by
   `translate3d(0, calc(var(--drum-y, 0px) * -1), 0)` in a `:global(.thought-stream > *)`
   rule inside `@layer components`. The container keeps the mask and its height,
   so the edge fade does not move. Measure loop height once per idle mount as
   `firstDecoy.offsetTop - firstEntry.offsetTop`, after layout.
5. Pause on `mouseenter`/`focusin` of the stream zone, resume on
   `mouseleave`/`focusout` only if focus is not still inside. Cancel the rAF on
   unmount, when a query resolves, and when the spin starts; restart on Clear.
6. Delete `stream-drift`. Keep `stream-settle` and `stream-search`.
7. `bun run format`, then the gate (`bash scripts/ci.sh`) once at the end.

**Do not:** put a second `role="listbox"` or any duplicate `role="option"` in the
DOM; use `setInterval`; hard-code a duration literal in CSS; add a viewport media
query; or touch `new_vis.html`.
