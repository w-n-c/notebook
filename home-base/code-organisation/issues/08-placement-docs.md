# 08 — Placement Docs

**What to build:** an agent starting a task can find where a file belongs. One short
page in `docs/agents/` states the Region rule and the asset rule, a one-line pointer
in `AGENTS.md` leads to it, and the two asset generators say where their output
belongs and why. No file moves. See ADR 0013 decisions 2 and 7.

**Blocked by:** #04, #05
**Status:** `open`

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
