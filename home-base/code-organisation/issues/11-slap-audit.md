# 11 — SLAP Audit of the Codebase

**What to build:** a ranked list of where the rest of the repo breaks the Single
Level of Abstraction standard, so fixes are chosen from evidence and not rewritten
wholesale. The audit changes no source file. Each violation worth fixing becomes its
own small refactor ticket with the same proof as ticket #10: behaviour preserved,
tests unchanged.

**Blocked by:** #09, #10
**Status:** `done` — 2026-11-24

**Acceptance Criteria:**

- [ ] `.scratch/code-organisation/slap-audit.md` exists and states what it scanned:
      the directories and the count of files, and that generated wrappers
      (`packages/layout/src/astro/` and `packages/layout/src/svelte/`) and
      `HeroSearch.svelte` (done in #10) are excluded.
- [ ] Each entry has: `file:lines`, the function or derived name, which of the **5**
      rules it breaks, a proposed verb-noun helper name, and a rank of **1** (fix),
      **2** (worth fixing) or **3** (leave, with a one-line reason). Entries are
      ordered by rank.
- [ ] Rule 5 findings (helpers that are already over-fragmented) are listed too, not
      only missing extractions.
- [ ] `git status --porcelain -- src packages scripts e2e tests` prints **0** lines
      when the ticket is done (nothing modified outside `.scratch/`).
- [ ] Every rank 1 and rank 2 entry has its own ticket file in this folder, numbered
      from **12**, `Status: open`, `Blocked by: #11`, with "tests and e2e specs pass
      with 0 changed lines under `tests/` and `e2e/`" as a criterion. The count of
      tickets from 12 upward equals the count of rank 1 and rank 2 entries.

**Notes (implementation):**

The audit is `.scratch/code-organisation/slap-audit.md`. It states its scope
(**65** files under `src/`, **13** under `scripts/`, **9** under
`packages/layout/src/` minus the generated `astro/` and `svelte/` wrappers),
excludes `HeroSearch.svelte` (#10), and carries **16** entries: **3** rank 1,
**8** rank 2, **5** rank 3.

**Nothing was implemented**, as the ticket requires. Tickets **12–22** exist and
are `Status: open`, `Blocked by: #11` — one per rank 1 and rank 2 entry, so the
count matches by construction. `.scratch/ISSUES.md` was regenerated: **85**
tickets, and the eleven new rows are listed under `code-organisation`.

Two scan passes (one for `src/` + `scripts/`, one for the library) surfaced more
candidates than were promoted — in `reel.ts`, `theme.ts`, `colour.ts`,
`generate-paper.ts`, `generate-wrappers.ts`, `issues-index.ts` and `smoke.ts`.
Those were not verified by reading the code at the line, so they are named in the
audit's closing note rather than turned into tickets: a ticket written from a
guess costs more than the finding it claims.

Two things the audit found that were not on the ticket's agenda, both kept because
they are exactly what the standard is for:

- `attrValue`/`attrBool` in `packages/layout/src/tokens.ts` have **no caller
  anywhere** — dead exports that also break rule 5 (ticket #12).
- `nameEntryForNavigation` in the module ticket #10 had just created queries
  `[data-view-id]` twice to name one entry (ticket #18). The audit does not spare
  the week's own work.

`git status --porcelain -- src packages scripts e2e tests` prints **0** lines.
`.scratch/` is gitignored (`.gitignore:27`), so this ticket has no commit: the
audit and the eleven tickets are tracker artifacts, not repository history.
