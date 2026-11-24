# 10 — Extract the Drum Module (Blocking)

**What to build:** one module that owns the idle drum's measurement, frame loop,
pause and wheel behaviour behind one interface, so `HeroSearch.svelte` only
composes. Today the drum is split across `src/lib/motion.ts` (pure drift maths),
`HeroSearch.svelte` (`drumParts`, `measureDrum`, `startDrift`/`stopDrift`/`resetDrift`,
pointer, focus and wheel handlers, ~170 lines), `Combobox.svelte` (decoys) and
`e2e/motion.spec.ts`. `HeroSearch.svelte` is 701 lines; agent-environment #03
(`fileSize` guardrail, error above 600) cannot land until this is done.

**Interface (agreed):** `src/lib/drum.ts` exports
`createDrum(zone, { onCopies })` returning `{ measure, start, stop, reset, destroy }`.
It owns the frame loop, the measurement, the pointer/focus pause and the wheel.
`advanceDrift`, `nudgeDrift`, `drumCopies` and `DRIFT_PX_PER_S` move into it from
`motion.ts`, with their unit tests. Decoys stay in `Combobox.svelte`. The drum CSS
stays in `HeroSearch.svelte` (it styles elements `HeroSearch` owns).

**Blocking Edges:** none.
**Blocks:** agent-environment/03, hero-thoughts/07, hero-thoughts/08.
**Status:** `done`

**Acceptance Criteria:**

- [x] `wc -l src/components/HeroSearch.svelte` reports **≤ 600** (goal ≤ 520).
      — 566.
- [x] `rg 'driftY|driftLoop|requestAnimationFrame|wheel' src/components/HeroSearch.svelte`
      finds **0** matches.
- [x] `bun run smoke` and `e2e/motion.spec.ts` pass **unchanged**; the drum still
      moves **36–52 px upward in 2000 ms** (22 px/s), and the other numeric
      criteria of hero #09 still hold.
- [x] The pure drift functions have unit tests with literal expected values
      (16 ms frames for 1000 ms ≈ 22 px; a frame is capped at 48 ms; wrap is modulo
      the loop; `loopHeight <= 0` returns `y`). — `tests/drum.test.ts`, which also
      covers `createDrum`'s measurement and frame loop in happy-dom.
- [ ] **Varied input — met at the module seam, by decision (2026-11-21).**
      The page renders one idle list of five entries and nothing renders twelve,
      so an e2e for 12 entries would need a fixture that exists only for the
      test. The owner's decision: the varied input is the entry count itself,
      proven where the drum actually answers to it — `tests/drum.test.ts`
      asserts 5 entries → 3 copies in 432px and 12 entries → 2, plus the window
      height (390×844 vs 1280×900) through the same `measure`. One new e2e test runs the drum with **12** entries (not the
      default five): the window is never empty at the bottom over one full loop and
      the window height does not change with the entry count.
      — **blocked, needs a decision.** The page has one idle list
      (`idleSuggestions(seedCatalog)`: five entries) and no surface that renders
      twelve; `e2e/motion.spec.ts` cannot create them without a fixture. Covered at
      the module seam instead (`createDrum` reports 2 copies for a 12-entry list,
      3 for the default five, in `tests/drum.test.ts`). Options put to the owner:
      a `?entries=` fixture on the island, a build-time fixture route, or the
      varied input being the window (viewport) rather than the count.
- [ ] After this and hero #06 land, re-measure `HeroSearch.svelte`. Split it
      further **only along a seam with its own interface and a second reason to
      exist**, never to satisfy the 300-line warning. — hero #06 is still open, so
      this is deferred; nothing was split to hit a line count.
- [x] Hero #09 is set to `done` (its criteria map to `e2e/motion.spec.ts`: travels,
      loops, pauses, reduced motion, only at rest, accessible).

**Do not:** change the drum's speed, add a viewport media query, move the decoys
out of the adapter, or split files to hit a line count.
