# 01 — Research: Best Practice for Agentic Browser Testing

**What to build:** a findings file (use the `research` skill; primary sources
only) answering, for *this* repo (bun + Astro static site, Svelte islands,
headless Chromium available at `/usr/bin/chromium`, Firefox at `/usr/bin/firefox`,
agents driven from a terminal harness):

1. **Which driver?** Playwright (`@playwright/test` run under node; is bun
   supported for the runner and for `playwright-core` alone?), Puppeteer, the
   Chrome DevTools MCP server, or WebDriver BiDi. Which one drives **both**
   Chromium and Firefox (we need the Firefox no-router path verified in a real
   Firefox, not emulated in Chromium)?
2. **What may an agent assert?** Motion (position over time, rAF-driven and CSS),
   hydration (console errors, element exists *after* hydration), view
   transitions (cross-document, native and fallback), reduced motion and colour
   scheme emulation, offline / service worker, a narrow viewport.
3. **How does an agent *look* cheaply?** Screenshot cost in tokens, element-level
   screenshots, accessibility-tree snapshots as text instead of images, video or
   frame strips, visual diffs against a reference (the prototype's rendered
   frame). What do the tool's own docs recommend for LLM-driven use?
4. **How is the page served?** Confirm the real host is `astro preview`
   (`bun run preview -- --port N`) and what differs from `Bun.serve` /
   `python3 -m http.server` (trailing-slash redirects, MIME types, headers,
   service-worker scope). Recommend one way, including picking a free port and
   waiting for readiness.
5. **Where does it run?** Pre-commit (fast, needs a build), `ci.sh`, or on demand.
   Cost per run today: build ~2s, smoke ~12s.

**Acceptance Criteria:**

- [ ] `.scratch/research/agentic-browser-testing.md` with a recommendation, the
      rejected alternatives and why, and links to primary sources only.
- [ ] A concrete plan for ticket 02: dependency, file layout, the three or four
      commands an agent will use, and the budget (seconds, tokens per look).
- [ ] An explicit answer to "can bun run it, or does it need node?"
**Status:** `open`
