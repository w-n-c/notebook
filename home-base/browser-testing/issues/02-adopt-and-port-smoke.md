# 02 — Adopt the Chosen Tool and Port `smoke.ts`

**Blocked by:** #01. **Status:** `open`

**What to build:** per #01's plan. At minimum:

- [ ] One shared helper (e.g. `scripts/lib/browser.ts`) owning: starting the
      browser, serving `dist/` with the real host (`bun run preview`), waiting for
      readiness, a `look(path)` that returns a cheap text snapshot, and
      `shot(path)` for the rare image. `scripts/smoke.ts` becomes assertions only.
- [ ] A Firefox leg that runs the no-router fallback in **real Firefox** (replace
      the `delete window.onpageswap` emulation if possible).
- [ ] Legs: hydration (no console error, island has height), navigation lands
      visible (native + fallback), motion (hero-thoughts #09's numbers), reduced
      motion, 390×844 narrow (no horizontal overflow).
- [ ] `docs/agents/browser.md` (one page): the commands, what each costs, when to
      use `look` vs `shot`. `AGENTS.md` gets one pointer line to it.
- [ ] The `/tmp` scripts agents wrote (`vt-probe.ts`, `vt-shots.ts`, `diag.ts`)
      are not needed any more: delete nothing in the repo, but the doc says
      "do not write new CDP scripts; extend the helper".
