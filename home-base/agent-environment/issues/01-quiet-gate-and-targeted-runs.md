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

## Steps for the implementing agent: the real server (do this bullet first)

1. **Verify the host works.** Run `bun run build`, then
   `bun run preview -- --port 4399 --host 127.0.0.1` in the background. `curl -sI`
   `/`, `/notes/`, and `/sw.js`: expect 200, and `/sw.js` served as JavaScript.
   Kill it. If the preview command fails or serves differently from `dist/`, stop
   and report; do not work around it.
2. **Write `scripts/lib/serve.ts`**, one exported function
   `startPreview(): Promise<{ url: string; stop(): Promise<void> }>` that:
   - finds a free port: `Bun.serve({ port: 0 })`, read `.port`, stop it;
   - spawns `bun run preview -- --port <port> --host 127.0.0.1` with
     `Bun.spawn`, stdout/stderr piped to a buffer (printed only if startup fails);
   - polls `fetch(url)` every 100ms until it returns 200, with a 15s timeout that
     throws and includes the captured output;
   - `stop()` kills the child and awaits exit. Callers use `try/finally`.
   - Add `tests/serve.test.ts` covering: returns a reachable URL, `stop()` frees
     the port, a failing command throws with its output (inject the command).
3. **Use it in `scripts/smoke.ts`**: replace its `Bun.serve` of `dist/` with
   `startPreview()`, stop in `finally`. Run `bun run smoke`; behaviour must be
   unchanged.
4. **`package.json`:** add `"dev:log": "mkdir -p .scratch && astro dev 2>&1 | tee .scratch/dev.log"`
   (match how `dev` is invoked now; confirm `.scratch/dev.log` is gitignored,
   add it if not).
5. **`AGENTS.md`:** add under a new `### Running the site` heading, this text and
   nothing more: "Serve the built site with `bun run preview`; never
   `python -m http.server` or an ad hoc server. For dev, run `bun run dev:log` in
   the background and read `.scratch/dev.log` for errors." Run `bun run format`
   and confirm `AGENTS.md` is still short.
6. Commit as one concern: "Serve smoke through the real preview host".
