# 03 — `fileSize` Guardrail with a Warn Tier

**What to build:** a mechanical size rule in `scripts/lib/guardrails.ts`, so a
component cannot silently grow to 700 lines (`HeroSearch.svelte` did).
`GuardrailViolation` gains `severity: 'warn' | 'error'`; `scripts/check-guardrails.ts`
prints warnings and fails only on errors.

**Blocking Edges:** Blocked by hero-thoughts #10 (`HeroSearch.svelte` is 701 lines).
**Status:** `open`

**Acceptance Criteria:**

- [ ] New rule `file-size` covers `.svelte` and `.astro` under `src/` and
      `packages/`: **> 300 lines warns, > 600 lines errors**, no exemption list.
- [ ] `tests/guardrails.test.ts` fixtures: **300** lines → no violation, **301** →
      one `warn`, **600** → one `warn`, **601** → one `error`.
- [ ] A staged file with only warnings: `bun scripts/check-guardrails.ts` prints
      them and exits **0**; with an error it exits **1**.
- [ ] The live-tree scan in `bun test` passes on the real tree.
