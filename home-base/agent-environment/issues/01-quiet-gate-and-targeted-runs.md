# 01 — Quiet Gate, Targeted Runs, Real Server

**What to build:** cut the output the gate and hooks pour into agent context,
and stop agents inventing servers. Mechanical; one commit per bullet.

**Status:** `open`

**Acceptance Criteria:**

- [ ] **Quiet runner.** `scripts/ci.sh` and `scripts/git-guardrails.sh` run each
      step through a tiny helper (shell function) that captures stdout+stderr to a
      temp file and prints one line (`✓ Typecheck (1.2s)`), dumping the file only
      on failure. Full output is available with `VERBOSE=1`.
- [ ] **Failures only.** Every `bun test` invocation in the scripts uses
      `--only-failures` (Bun 1.3 supports it); in the quiet runner this is
      redundant for green runs but protects the red ones from 1,000-line dumps.
- [ ] **Truncate big-string assertions.** Where a test does
      `expect(html).toContain(…)` / `.not.toContain` on a whole built page or
      source file, assert on a derived boolean or a bounded excerpt instead
      (`expect(html.includes(x), 'home contains x').toBe(true)`), so a failure
      does not print the entire file. Start with `tests/hero-thoughts.test.ts`,
      `tests/view-transition.test.ts`, `tests/page-shell.test.ts`.
- [ ] **Smoke in the hook, scoped.** `scripts/git-guardrails.sh` runs
      `bun run build && bun run smoke` only when the staged set touches `src/`,
      `public/`, `astro.config.mjs`, `packages/layout/`, or `scripts/smoke.ts`.
      Docs-only and ticket-only commits skip it.
- [ ] **Targeted runs documented.** `docs/agents/` gets a short "While
      implementing" note: run the test files you changed (`bun test tests/x.test.ts`)
      and `bun run typecheck`; the full gate runs once, at the end, and again
      automatically in the hook. (The suite is ~4s; the cost is output, not time.)
- [ ] **The real server.** `AGENTS.md` gains one pointer line: run the built site
      with `bun run preview` (never `python -m http.server`, never an ad hoc
      `Bun.serve`), and iterate with `bun run dev`, teeing its output to
      `.scratch/dev.log` so an agent can read errors without a browser. Add a
      `dev:log` script that does the tee.
- [ ] `smoke.ts` serves `dist/` through `astro preview` on a free port rather than
      its own `Bun.serve` (the homemade server differs in trailing-slash and MIME
      handling). Done together with browser-testing #02 if that has landed.
