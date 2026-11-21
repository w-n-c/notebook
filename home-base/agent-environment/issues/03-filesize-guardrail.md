# 03 — `fileSize` Guardrail with a Warn Tier

**What to build:** a mechanical size rule in `scripts/lib/guardrails.ts`, so a
component cannot silently grow to 700 lines (`HeroSearch.svelte` did).
`GuardrailViolation` gains `severity: 'warn' | 'error'`; `scripts/check-guardrails.ts`
prints warnings and fails only on errors.

**Blocking Edges:** Blocked by hero-thoughts #10 (`HeroSearch.svelte` is 701 lines).
**Status:** `done`

**Acceptance Criteria:**

- [x] New rule `file-size` covers `.svelte` and `.astro` under `src/` and
      `packages/`: **> 300 lines warns, > 600 lines errors**, no exemption list.
- [x] `tests/guardrails.test.ts` fixtures: **300** lines → no violation, **301** →
      one `warn`, **600** → one `warn`, **601** → one `error`.
- [x] A staged file with only warnings: `bun scripts/check-guardrails.ts` prints
      them and exits **0**; with an error it exits **1**.
      Observed: a staged 352-line `src/components/__probe/Big.svelte` printed
      `⚠️ [file-size] … 352 lines` and exited 0; padded to 603 lines it printed
      `❌ … 603 lines` and exited 1 (both probe files removed after).
- [x] The hook still says it out loud: the quiet runner swallows a passing
      step's output, which would have made the warn tier invisible, so
      `scripts/lib/step.sh` gained `KEEP_WARNINGS=1` (re-prints `⚠️` lines on
      success) and `git-guardrails.sh` sets it for the guardrail step.
- [x] The live-tree scan in `bun test` passes on the real tree.
