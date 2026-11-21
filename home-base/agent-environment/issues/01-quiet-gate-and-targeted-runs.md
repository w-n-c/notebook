# 01 — Quiet Gate, Targeted Runs, Real Server

**What to build:** cut the output the gate and hooks pour into agent context,
and stop agents inventing servers. Mechanical; one commit per bullet.

**Status:** `open`

**Acceptance Criteria:**

- [ ] **Quiet runner.** `scripts/ci.sh` and `scripts/git-guardrails.sh` run each
      step through a small shell helper that captures stdout+stderr to a temp file
      and prints one line (`✓ Typecheck (1.2s)`), dumping the captured output only
      on failure. Observed: a green `bash scripts/ci.sh` prints only lines of the
      form `✓ <step> (<n.n>s)`; `VERBOSE=1` prints full output.
- [ ] **Failures only.** Every `bun test` invocation in the scripts has
      `--only-failures`. Observed: `rg 'bun .*test' scripts/*.sh` shows the flag on
      every match; breaking one test on purpose produces a failure dump of **fewer
      than 60 lines**.
- [ ] **No whole-page failures.** `tests/lib/expect-text.ts` exports
      `expectIncludes(haystack, needle, label)`; on failure it prints the label and
      an excerpt of **at most 200 characters**, never the whole string. A unit test
      fails it on a 50 KB haystack and asserts the message is under 400 characters.
      `tests/hero-thoughts.test.ts`, `tests/view-transition.test.ts` and
      `tests/page-shell.test.ts` use it; `rg 'expect\(html\)\.(not\.)?toContain'`
      has no matches in those files.
- [ ] **Smoke in the hook, scoped.** `scripts/git-guardrails.sh` runs build + the
      Chromium smoke only when a staged path starts with `src/`, `public/`,
      `packages/layout/`, `e2e/`, `scripts/lib/` or equals `astro.config.mjs`,
      `playwright.config.ts`, `scripts/smoke.ts`, `package.json`, `bun.lock`.
      Observed: a docs-only scratch commit prints no smoke line; a commit touching
      `src/` does. (The smoke itself is built in browser-testing #02; until that
      lands the hook calls the current `bun run smoke`.)
- [ ] **Targeted runs documented.** `docs/agents/` has a short "While implementing"
      note: run the test files you changed (`bun test tests/x.test.ts`) and
      `bun run typecheck`; the full gate runs once at the end and again in the hook.
      The note states the suite takes about **4s** (the cost is output, not time).
- [ ] **The real server, documented.** `AGENTS.md` gains a `### Running the site`
      heading with exactly: "Serve the built site with `bun run preview`; never
      `python -m http.server` or an ad hoc server. For dev, run `bun run dev:log`
      in the background and read `.scratch/dev.log` for errors." `package.json` has
      `"dev:log": "mkdir -p .scratch && astro dev 2>&1 | tee .scratch/dev.log"`;
      `.scratch/` is already gitignored. `bun run format` leaves `AGENTS.md` short.

## Dropped (decided in the 2026-11-21 grill)

`scripts/lib/serve.ts`, `tests/serve.test.ts` and the "smoke serves through
`astro preview`" bullet. Playwright's `webServer` in browser-testing #02 starts
`bun run preview -- --port 4399 --host 127.0.0.1` itself; a second server helper
would duplicate it.

## Suggested order

Commit per bullet. `dev:log` + AGENTS.md first (nothing depends on them), then the
quiet runner, then `--only-failures`, then `expectIncludes`, then the hook scoping.
