# Agentic browser testing: driver, Firefox, and how an agent looks

**Status:** findings for browser-testing #01 (closes it). Primary sources only.
**Date:** 2026-11-21
**Decision (grilled with the owner):** Playwright (`@playwright/test`, run under
`bun --bun`), with Playwright's **own** bundled Chromium and Firefox. No system or
branded browsers, no MCP server.

## Recommendation

Use `@playwright/test` with two browser projects (chromium, firefox) plus a narrow
profile. Browsers come from `bunx playwright install chromium firefox`
(`~/.cache/ms-playwright`; build 159 at time of writing). Agents "look" with text
(`locator.ariaSnapshot()`), and take an element screenshot only on request.

## Why Playwright's own Firefox, not the system one

- "Playwright's Firefox version matches the recent Firefox Stable build. Playwright
  doesn't work with the branded version of Firefox since it relies on patches."
  <https://playwright.dev/docs/browsers#firefox>
  So stock Firefox, Firefox Developer Edition and forks such as Zen are all out.
- `executablePath` for Chromium exists but: "Playwright only works with the
  bundled Chromium, Firefox or WebKit, use at your own risk."
  <https://playwright.dev/docs/api/class-browsertype#browser-type-launch>
  We therefore also use the bundled Chromium, not `/usr/bin/chromium`.
- Browser builds must match the npm version. nixpkgs `playwright-driver` was at
  1.64.1 while npm `latest` was 1.65.1, so a Nix-provided browser would force a pin.
  The AUR has the CLI (`playwright`) but no patched browsers that I found.

## Can bun run it?

Yes, from Playwright **1.65**: "The test runner now runs under Bun... Pass the
`--bun` flag... Our CI runs the test runner tests under Bun 1.4.3 on Linux." Known
divergences: no watch mode, `--tsconfig`/JSX options ignored, no custom ESM loaders,
stack traces lack async frames. <https://playwright.dev/docs/release-notes#version-165>
The repo was on bun 1.3.11, so the bump to >= 1.4.3 (pinned 1.4.5 via mise) is part
of #02.

## What an agent may assert

Per Playwright `TestOptions`: `colorScheme`, `reducedMotion`, `offline`,
`serviceWorkers`, `viewport`, all on both bundled browsers.
<https://playwright.dev/docs/api/class-testoptions> and
<https://playwright.dev/docs/emulation>
Motion over time is asserted by sampling in-page (rAF or computed style) via
`page.evaluate`. Cross-document view transitions run natively only in Chromium; the
no-router fallback is exercised in real Firefox and forced in Chromium.
Cross-document view-transition support in Firefox 159 was **not verified in primary
sources**: #02 must test for it (feature-detect `onpageswap`) rather than assume.

## How to look cheaply

- Playwright MCP describes "structured accessibility snapshots, bypassing the need
  for screenshots or visually-tuned models".
  <https://github.com/microsoft/playwright-mcp#playwright-mcp>
- Chrome DevTools MCP's `take_snapshot` doc says "Prefer taking a snapshot over
  taking a screenshot".
  <https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md>
- `locator.ariaSnapshot()` / `toMatchAriaSnapshot` are documented at
  <https://playwright.dev/docs/aria-snapshots>. **No primary source gives token-cost
  numbers**; #02 measures bytes and seconds and records them in `docs/agents/browser.md`.

## Rejected alternatives

| Option | Why not |
| --- | --- |
| Puppeteer + WebDriver BiDi | Drives stock Firefox, but its docs list no `emulateMediaFeatures`, `setOfflineMode` or `setBypassServiceWorker` on Firefox, and bun support is not documented. <https://pptr.dev/webdriver-bidi> |
| Chrome DevTools MCP | "Google Chrome and Chrome for Testing only"; no Firefox. An MCP tool schema also costs more context than a repo command. <https://github.com/ChromeDevTools/chrome-devtools-mcp#disclaimers> |
| Raw WebDriver BiDi client | Firefox speaks BiDi directly; Chromium needs the `chromium-bidi` wrapper or ChromeDriver. Two protocol paths to hand-maintain. Whether stock Firefox implements `emulation.setMediaFeaturesOverride` was **not confirmed**. <https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection> |
| Hand-rolled CDP (today's `smoke.ts`) | Chromium only, 263 lines, own server and waiting code. |
| System browsers via `executablePath` | Unsupported by Playwright (above). |

## Serving the page

Playwright's `webServer` config starts `bun run preview -- --port 4399
--host 127.0.0.1`, waits for readiness and stops it, so no bespoke
`startPreview()` helper is needed (it supersedes agent-environment #01's `serve.ts`).
`reuseExistingServer` is on locally and off under `CI=1`.
Differences between `astro preview` and `Bun.serve`/`python -m http.server`
(trailing-slash redirects, MIME types, headers, service-worker scope) were not
researched in primary sources; the point is moot because every run now goes through
the real host.

## Plan for #02

See `.scratch/browser-testing/issues/02-adopt-and-port-smoke.md`.
