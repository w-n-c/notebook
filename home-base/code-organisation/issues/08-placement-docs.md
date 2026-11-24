# 08 — Placement Docs

**What to build:** an agent starting a task can find where a file belongs. One short
page in `docs/agents/` states the Region rule and the asset rule, a one-line pointer
in `AGENTS.md` leads to it, and the two asset generators say where their output
belongs and why. No file moves. See ADR 0013 decisions 2 and 7.

**Blocked by:** #04, #05
**Status:** `done` — 2026-11-24.

**Acceptance Criteria:**

- [ ] `docs/agents/placement.md` exists and contains: the default placement rule;
      the **2** reasons a file is shared (a second Region, or an enforced seam) and
      that "future-proofing" is not one; the one-entry-point rule; both guardrails
      by rule id (`region-boundary`, `single-consumer`); and a link to ADR 0013.
- [ ] It contains the asset rule as **3** cases: a file needing a stable URL →
      `public/`; a file a page imports and the whole site uses → `src/assets/`; a
      file only one Region uses → inside that Region.
- [ ] `AGENTS.md` gains **1** pointer line to the page and at most **3** inserted
      lines in total (`git diff --stat AGENTS.md`).
- [ ] `scripts/generate-paper.ts` and `scripts/generate-icons.ts` header comments
      both cite `docs/agents/placement.md` (`rg -l 'docs/agents/placement.md' scripts` lists **2** files), and no non-comment line in either file changed.
- [ ] `README.md`'s structure section lists `src/regions/hero`, `src/regions/shell`
      and `src/lib/site-content.ts`.

**Notes (implementation):**

- `docs/agents/placement.md` is 69 lines, in the `docs/agents/` house voice
  (tables where a table helps, no marketing). It also names the enforced
  locations (`src/pages/`, `src/layouts/`, `src/content/`, `packages/layout/`) so
  an agent adding a file reads one table instead of a rule plus a guess.
- `AGENTS.md`: one `### Placement` section at the end of the file, 3 inserted
  lines (blank, heading, pointer line). The heading sits directly above its line
  instead of after a second blank line: the 3-line budget was the constraint, and
  Prettier ignores markdown (`.prettierignore`), so nothing re-wraps it.
- The paper generator's header says `src/assets/` because `src/styles/global.css`
  references the tiles on the root, not because a page imports them. The AC's
  "a page imports it" would have been untrue for that generator, so the comment
  says "the site's own code imports or references" and the page keeps the AC's
  three cases.
- `README.md`: the `src/components/*` bullet was amended in place (it now says
  "shared by two or more Regions") and two Region bullets were added above it;
  the `src/lib/site-content.ts` bullet already existed and is unchanged.
- No file moved; no non-comment line changed in either generator (verified with
  `git diff -U0`).
