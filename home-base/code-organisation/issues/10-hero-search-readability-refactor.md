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

**Blocked by:** #04, #09
**Status:** `open`

**Acceptance Criteria:**

- [ ] Behaviour is preserved: the `hero-thoughts`, `view-transition`, `motion`,
      `drum`, `resolution` and `copy` tests pass, and the e2e `motion` and
      `navigation` specs pass.
- [ ] The tests are the proof: `git diff --stat -- tests e2e` prints **0** files.
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
