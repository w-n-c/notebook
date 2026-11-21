# 01 — Research: Best Practice for Agentic Browser Testing

**Status:** `done` (2026-11-21, grilled with the owner)

**Outcome:** `.scratch/research/agentic-browser-testing.md`. Playwright
(`@playwright/test` under `bun --bun`, bun >= 1.4.3) with Playwright's own bundled
Chromium and Firefox; text-first looks via `ariaSnapshot()`; the real host
(`bun run preview`) started by Playwright's `webServer`. Stock, Developer Edition and
fork Firefoxes (Zen) cannot be driven by Playwright. Rejected alternatives and
sources are in the findings file.

**Acceptance Criteria:**

- [x] Findings file with a recommendation, rejected alternatives and primary-source
      links only.
- [x] A plan for ticket 02 (dependency, layout, commands).
- [x] Explicit answer to "can bun run it": yes from Playwright 1.65, bun >= 1.4.3.
- [ ] Left to #02 by design: token cost and time budgets (no primary source
      publishes numbers; #02 measures them).
