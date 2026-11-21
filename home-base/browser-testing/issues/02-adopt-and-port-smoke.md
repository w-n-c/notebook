# 02 — Adopt Playwright and Port `smoke.ts`

**Blocked by:** — (#01 is done; findings in `.scratch/research/agentic-browser-testing.md`).
**Blocks:** hero-thoughts #09 (its motion leg needs this harness).
**Status:** `open`

**What to build:** replace the 263-line hand-rolled CDP smoke with Playwright, so an
agent can verify in real Chromium **and real Firefox**, and can look at a page in
text. Read the findings file first.

## Acceptance Criteria

Each is checkable by running the stated command.

**Setup**
- [ ] `bun run setup` (`scripts/setup.sh`) exits 0 on a fresh clone, and exits 0
      again on a second run with no downloads. It exits non-zero with the message
      `mise use bun@1.4.5` when bun is below **1.4.3**. It runs `bun install` (which
      wires the git hooks), `bunx playwright install chromium firefox`, `astro sync`,
      and finishes by launching both browsers and closing them. It prints one line
      per step. It never passes `--with-deps` (apt-only); if a launch fails it prints
      the missing-library hint instead.
- [ ] `package.json` `engines.bun` is `>=1.4.3`; `.mise.toml` pins `bun = "1.4.5"`;
      `prepare` stays hooks-only (no browser download on a plain `bun install`).
- [ ] `README.md` has a "First time on a clone" block with `bun run setup`, and the
      Commands table lists `setup`, `smoke`, `look`, `shot`.
- [ ] `.tangled/workflows/ci.yml` runs `bun run setup` before `scripts/ci.sh`.

**Layout**
- [ ] `playwright.config.ts` at the root; specs in `e2e/*.spec.ts`, one file per
      concern (hydration, navigation, motion, narrow, offline); `bun test ./tests`
      does not collect `e2e/`.
- [ ] `webServer` runs `bun run preview -- --port 4399 --host 127.0.0.1`;
      `reuseExistingServer` true locally, false when `CI=1`.
- [ ] `e2e/` and `playwright.config.ts` are covered by `bun run typecheck`;
      `test-results/` and `playwright-report/` are git- and prettier-ignored.
- [ ] `scripts/smoke.ts` is a thin wrapper (`playwright test` with project and
      `CI` handling). The hand-rolled CDP, the `Bun.serve` static server and the
      browser discovery are deleted.

**Legs** (Chromium column; Firefox column marked)

| Leg | Chromium | Firefox |
| --- | --- | --- |
| Hydration: zero console errors and uncaught exceptions; hero island height **> 100px**; prompt input exists | yes | yes |
| Navigation lands visible, native path (target has height > 40px, opacity 1, no stale `data-vt`) | yes | only if `onpageswap` exists in Firefox; feature-detect, skip with a reason |
| Navigation lands visible, no-router fallback | forced (`onpageswap` removed) | real |
| Reduced motion resolves to a still page | yes | no |
| 390×844: no horizontal overflow (`scrollWidth <= clientWidth`), hero visible | yes | yes |
| Offline: after one online load, an offline reload of `/` and `/notes/` renders | yes | no |
| Motion numbers per hero-thoughts #09 | yes (added by #09) | no |

- [ ] A missing browser **fails** when `CI=1` and prints a loud skip otherwise.
- [ ] `scripts/git-guardrails.sh` runs the Chromium column only (trigger list is in
      agent-environment #01); `scripts/ci.sh` runs both; `bun run smoke -- --firefox`
      runs the Firefox column alone.

**Looking**
- [ ] `bun run look <path>` prints: the `ariaSnapshot()` of the page; console and
      page errors; viewport size; an overflow flag; the hero hydration state.
      Flags `--firefox`, `--narrow` (390×844), `--reduced-motion`. Run it against
      `/` and `/notes/` and paste the output into the PR.
- [ ] `bun run shot <path> [selector]` writes an element-level PNG under
      `.scratch/shots/` and prints only the file path.
- [ ] Both are implemented in `e2e/lib/look.ts`; specs reuse it.

**Doc**
- [ ] `docs/agents/browser.md` (one page): setup pointer; the four commands and
      flags; when to use `look` vs `shot`; the Chromium/Firefox coverage table above;
      **measured** wall-clock seconds for `look`, `shot`, the hook leg and the full
      `ci.sh` smoke, and **measured** bytes of a typical `look` (median of 3 runs
      each); the sentence "do not write new CDP or Playwright scripts; extend
      `e2e/lib/look.ts`". `AGENTS.md` gets one pointer line.
- [ ] **Time budget:** the hook's Chromium smoke leg is recorded at its measured
      median, and the budget written in the doc is that median **plus 50%**. If the
      measured median already exceeds **30s**, stop and report rather than shipping.

## Notes for the implementing agent

1. Spike first: run `bunx playwright --version` and one trivial spec under
   `bun --bun playwright test` before porting anything. If bun 1.4.5 cannot run the
   runner, stop and report; do not fall back to node silently.
2. Port the three existing legs faithfully (`scripts/smoke.ts` lines ~59-103); the
   assertions are the spec, the CDP plumbing is not.
3. Port 4399 is deliberate; do not make it dynamic.
4. This supersedes agent-environment #01's `serve.ts` plan.
