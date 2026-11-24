# 01 — `file-size` Counts Code Lines

**What to build:** the `file-size` guardrail stops taxing documentation. It counts
**code lines** (blank lines and comment-only lines excluded) and its tiers move to
**warn above 450, error above 800**. `HeroSearch.svelte` is 417 code lines, so it
stops warning; a 600-line file that is half comments does too. See ADR 0013
decision 9.

**Blocked by:** None (can start immediately).
**Status:** `open`

**Acceptance Criteria:**

- [ ] `FILE_SIZE_WARN` is **450** and `FILE_SIZE_ERROR` is **800**, and the
      violation message states both numbers and says "code lines".
- [ ] A line is not counted when it is blank or comment-only (`//`, a `/* … */`
      block including JSDoc, `<!-- … -->`); a line of code with a trailing comment
      is counted. Observed in `tests/guardrails.test.ts` fixtures.
- [ ] Fixtures: **450** code lines → no violation; **451** → one `warn`;
      **800** → one `warn`; **801** → one `error`; a file of **700** raw lines made
      of **400** code lines plus **300** comment/blank lines → no violation.
- [ ] `src/components/HeroSearch.svelte` (417 code lines when this ticket was
      written) reports **0** `file-size` violations: observed by running
      `bun scripts/check-guardrails.ts` on it.
- [ ] No doc under `docs/agents/`, `CODING_STANDARDS.md` or `AGENTS.md` still states
      the old 300/600 thresholds: `rg -n '\b(300|600)\b.{0,20}lines|lines.{0,20}\b(300|600)\b' docs/agents CODING_STANDARDS.md AGENTS.md` returns **0** hits.
- [ ] The live-tree scan in `bun test` passes on the real tree.
