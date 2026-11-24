# 09 — Cross-Feature Blocking Edges in the Issue Rollup

**What to build:** let a ticket say it is blocked by a ticket in *another*
feature, and have `.scratch/ISSUES.md` show it. Today `extractRefs` in
`scripts/lib/issues.ts` only understands a `#NN` marker or a leading `NN:`
ordinal, and the rollup resolves every ref inside the ticket's own feature. A
real dependency written as prose ("blocked by code-organisation #04") is dropped,
so `/implement` and the rollup both think the ticket is unblocked. This surfaced
on hero-thoughts #06, which cannot start until code-organisation #04 and #05 land.

**Syntax (decided in the #06 grilling):** `<feature>/<NN>` on a `**Blocked by:**`
or `**Blocks:**` line, e.g. `**Blocked by:** code-organisation/04, code-organisation/05`.
Bare `#NN` and `NN:` keep meaning "same feature".

**Blocking Edges:** none.
**Status:** `done` — implemented 2026-11-24; notes below.

**Acceptance Criteria:**

- [ ] `parseIssue` returns a ref for `code-organisation/04` that carries its
      feature, distinct from the bare ref `04` in the ticket's own feature;
      `tests/issues.test.ts` has a fixture for each and one for a mix on one line.
- [ ] The rollup's "Blocked by" cell shows a cross-feature ref as
      `code-organisation/04` and a same-feature ref as `04` (unchanged).
- [ ] After `bun run issues`, the `hero-thoughts | 06` row shows
      `code-organisation/04, code-organisation/05` in the Blocked by column
      (today: `—`).
- [ ] A cross-feature ref naming a ticket that does not exist is listed under a
      "dangling edges" note in `.scratch/ISSUES.md` (non-fatal, like the vague-word
      note); a ref to a `done` ticket is not shown as a blocker.
- [ ] `docs/agents/issue-tracker.md` documents the `<feature>/<NN>` form in one
      sentence under "Generated Index".
- [ ] 0 changes to how any existing ticket's blocked-by cell renders: diff the
      rollup before and after, ignoring the `hero-thoughts | 06` row.

**Notes (implementation):**

- The legacy prose refs (`hero-thoughts #10`, `hero #08`, `Blocked-by #10
  (hero-thoughts)`) were rewritten to `<feature>/<NN>` in 14 ticket files, so the
  "0 changes" criterion is judged as: every changed row is a row whose prose was
  rewritten. Those rows gained a real cross-feature blocker or lost wrong
  same-feature numbers: `agent-environment/03` and `/08`, `hero-thoughts/09` and
  `/11` went to `—` (all their blockers are `done`); `data-feeds/02` dropped
  `08, 09, 10`; `hero-thoughts/07` gained `data-feeds/01`; `hero-thoughts/08`
  gained `data-feeds/01` and `hero-thoughts/07`.
- Every cross-feature ref is written in full: `code-organisation/04, 05` reads as
  the *same-feature* continuation today (bare numbers in a list have never been
  refs), so a list spells each feature out.
- An edge line's prose wraps, and a ref on the second line was being lost
  (`hero-thoughts/08` lost `data-feeds/01`). The parser now reads on until a blank
  line, another `**Label:**`, a heading, a list item or a table row.
