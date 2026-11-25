# 10 — `HeroSearch` Readability Refactor

**What to build:** `HeroSearch.svelte` is made readable under the new standard,
behaviour unchanged. It is not split and has no line target: its separable parts
(`drum`, `motion`, `resolution`, `copy`) are already out, and what remains is
orchestration over about ten shared `$state` variables. Four places mix levels of
abstraction and are the targets: the `options` derived (decoy-copy construction
inline in a ternary), the pointer-click effect (seven guard clauses, a DOM lookup
and the navigation call in one closure), the `pageswap`/`pagereveal` effect (DOM
querying, experimental-API casts and listener wiring together), and the
`suggestions` derived (a nested ternary over three states). See ADR 0013 decision 9.

**Blocked by:** #04, #09, `code-base-improvement/01`
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] Behaviour is preserved: the `hero-thoughts`, `view-transition`, `motion`,
      `drum`, `resolution` and `copy` tests pass, and the e2e `motion` and
      `navigation` specs pass.
- [ ] Tests change only by addition: `git diff --numstat -- tests e2e` shows **0**
      deleted lines. New `it`-blocks, or new test files, for the modules this ticket
      extracts are allowed — a new module with nothing permitted to test it is the
      smell `code-base-improvement/01` exists to kill. No existing assertion may be
      edited.
- [ ] The Region's public surface is unchanged: `index.ts` still exports **2**
      symbols and `HeroSearch`'s only prop is still the `silhouette` snippet.
- [ ] Each of the four targets reads as a router over named helpers. Observed by a
      `/code-review` Standards pass against ticket #09's section returning **0**
      findings on those four; the review output is pasted into this ticket when
      done.
- [ ] No helper wraps a lone trivial one-liner without naming domain intent
      (rule 5); the same review pass checks it.
- [ ] The ticket notes record whether the view-transition token handling shared with
      `ReturnToHero` (storing and decoding the token) moved into `motion.ts`, yes
      or no and why. Either answer passes; if yes, the tests above still pass
      unchanged.
- [ ] `bun scripts/check-guardrails.ts` exits **0**; the file's size is not a goal
      and may go up or down.

**Notes (implementation):**

Two new internal modules, and `index.ts` still exports **2** symbols
(`HeroThoughts`, `HeroSearch`) — the Region's surface did not move:

- `src/regions/hero/stream-options.ts` — `suggestionsFor({ spinning, resolution,
  idle, step })`, `speechCueFor({ spinning, resolution })`, `withDecoys(entries,
  copies)`. The fourth target was a nested ternary and so was `speechCue`
  (not in the ticket's list); both went, because leaving one nested ternary
  next to the extracted ones would have been an accident of where the ticket
  drew its line. `withDecoys` keeps the original floor: at least one duplicate
  set, since a loop with nothing to wrap onto is a list that ends.
- `src/regions/hero/view-transition.ts` — `reducedMotion(view?)`,
  `entryElement(root, viewId)`, `fallbackClick(event, view?)`,
  `storeViewToken(rect, viewId, storage?)`, `armExit(source)`,
  `nameEntryForNavigation(event, root?)`. This is the layer that reads the DOM;
  the experimental `pageswap`/`pagereveal` activation shapes are declared once
  here instead of cast at the call site. Each global has a parameter with a real
  default, so `tests/view-transition-dom.test.ts` drives them against
  `happy-dom` instead of mocking module state.

**The token question — yes, but not in `motion.ts`.** `storeToken` was
duplicated between `HeroSearch.svelte` and `ReturnToHero.astro` (ADR 0013's
promote-on-second-consumer), so it moved — to `view-transition.ts` as
`storeViewToken`, not to `motion.ts` as Q2 proposed. `motion.ts`'s own header
promises "No DOM access here — callers pass the storage string, the window-like
object"; a `sessionStorage` write inside it would have broken the contract that
makes its 30-odd pure tests possible. Both callers now share one implementation,
and `armExit` (the `data-vt-exit` attribute) went with it for the same reason.

**Tests only grew.** No existing assertion was edited or deleted:
`git diff --numstat -- tests e2e` prints nothing (the two new test files are
untracked). 354 tests pass, up from 333 — `tests/stream-options.test.ts` (10) and
`tests/view-transition-dom.test.ts` (11).

**The review pass.** Standards review against `CODING_STANDARDS.md` §Single Level
of Abstraction, run as a fresh-context subagent over the diff and the two new
modules. The first pass raised one finding — a one-line `onNavigation`
pass-through in target 3 that only re-forwarded its event to
`nameEntryForNavigation` — fixed by registering the module function itself, and
the second pass returned:

```
## Standards review — SLAP, ticket 10

Findings: 0

### Target 1 — options derived
`clean` — a router, because it picks the branch (`atRest && motionAllowed`) and
returns a named list either way, pushing the copy arithmetic into `withDecoys`.

### Target 2 — pointer-click effect
`clean` — a router, because it guards the zone, delegates the whole decision to
`fallbackClick` and the whole action to `navigate`, and only wires/unwires the
listener itself.

### Target 3 — pageswap/pagereveal effect
`clean` — verified: the listener is the imported `nameEntryForNavigation` itself
on both events, the `onNavigation` pass-through is gone, and the effect is a
router that only attaches and detaches.

### Target 4 — suggestions derived
`clean` — a router, because the three-state nested ternary is now one call to
`suggestionsFor`, which itself routes per state (`rotateEntries`,
`resolution.suggestions`, `idle`).

### Rule 5 — the new helpers
suggestionsFor, speechCueFor, withDecoys, reducedMotion, entryElement,
fallbackClick, storeViewToken, armExit, nameEntryForNavigation — all pass; each
either holds a real decision or has a second caller that earns the hop.
```

`bun scripts/check-guardrails.ts` exits **0**; `bash scripts/ci.sh` is green
through both browser columns; `HeroSearch.svelte` is 512 lines, down from 589,
and the two modules are 76 and 113.
