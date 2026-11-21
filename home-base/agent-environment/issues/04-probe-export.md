# 04 — `probe()`: One Way to Run a Throwaway Browser Script

**What to build:** agents wrote five throwaway scripts that each re-implemented
"start preview, wait, sample", and `pkill -f 'astro preview'` matched its own
shell (exit 143) and cancelled the run. Export `probe(fn, options?)` from
`e2e/lib/look.ts` (the public `withPage`: server up, page handed to `fn`, torn
down in `finally`).

**Blocking Edges:** none.
**Status:** `open`

**Acceptance Criteria:**

- [ ] `e2e/lib/look.ts` exports `probe`; `look` and `shot` are built on it.
- [ ] A spec calls `probe(async (page) => page.title())` against `/` and asserts
      the title is non-empty; after it returns, nothing listens on port **4399**.
- [ ] `docs/agents/browser.md` says: "Probes use `probe()`; never start or `pkill`
      a preview by hand." and no longer says to extend `look.ts` for one-offs.
