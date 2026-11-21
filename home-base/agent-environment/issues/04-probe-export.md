# 04 — `probe()`: One Way to Run a Throwaway Browser Script

**What to build:** agents wrote five throwaway scripts that each re-implemented
"start preview, wait, sample", and `pkill -f 'astro preview'` matched its own
shell (exit 143) and cancelled the run. Export `probe(fn, options?)` from
`e2e/lib/look.ts` (the public `withPage`: server up, page handed to `fn`, torn
down in `finally`).

**Blocking Edges:** none.
**Status:** `done`

**Acceptance Criteria:**

- [x] `e2e/lib/look.ts` exports `probe`; `look` and `shot` are built on it.
- [x] A spec calls `probe(async (page) => page.title())` against `/` and asserts
      the title is non-empty; after it returns, nothing listens on port **4399**.
      — the title half holds in `e2e/probe.spec.ts`. The port half **cannot hold
      inside a spec** (Playwright's `webServer` owns 4399 for the whole run, so
      by design the port still listens after any probe returns) and was observed
      from the CLI instead, where `probe` starts and stops the preview itself: a
      probe against `/` returned the title and `ss -lnt | grep 4399` printed
      nothing. The owner's decision (2026-11-21): that observation is the
      evidence; no second Playwright config.
- [x] `docs/agents/browser.md` says: "Probes use `probe()`; never start or `pkill`
      a preview by hand." and no longer says to extend `look.ts` for one-offs.
