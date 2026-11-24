# 11 — SLAP Audit of the Codebase

**What to build:** a ranked list of where the rest of the repo breaks the Single
Level of Abstraction standard, so fixes are chosen from evidence and not rewritten
wholesale. The audit changes no source file. Each violation worth fixing becomes its
own small refactor ticket with the same proof as ticket #10: behaviour preserved,
tests unchanged.

**Blocked by:** #09, #10
**Status:** `open`

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
