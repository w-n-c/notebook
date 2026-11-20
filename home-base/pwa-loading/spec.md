# Specification: PWA Loading & Fast Navigation

**Status**: `proposed`

## Problem Statement

Navigation between pages waits on the network. When a visitor clicks a
HeroThoughts entry on a slow connection, they sit on a blank/loading page — and
the no-router fallback transition (hero-thoughts 03) has a visible load seam for
exactly that reason. Repeat visits should be instant and the site should work
offline for the pages it has already served.

## Solution

A service worker that precaches the app shell and hashed assets and serves page
navigations from cache (cache-first, network-revalidate), plus a web manifest for
installability and an offline fallback. Where supported, Speculation Rules add
hover/viewport prefetch (and prerender) so a click is instant. No SSR is required
— the worker is entirely client-side and the site stays static by default.

## Implementation Decisions

- **Precache + cache-first navigations.** The worker precaches the shell and
  hashed assets on install; navigation requests are served cache-first with a
  background revalidate, assets stale-while-revalidate. Versioned cache; stale
  caches purged on activate.
- **Update policy.** Decide `skipWaiting`/`clientsClaim` behaviour so a new build
  isn't wedged behind an old worker (silent swap vs. refresh prompt) — record the
  call.
- **Offline fallback.** An offline page is served when a navigation misses cache
  and the network is down.
- **Speculation Rules (optional, Chromium-only).** Prefetch/prerender the
  destination on hover/viewport entry so the click is instantaneous; degrades to
  a normal navigation elsewhere.
- **Progressive enhancement.** Service workers are unsupported in some contexts
  (no-JS, private modes) — the site must behave exactly as today without one. The
  hero fallback entrance (hero-thoughts 03) must still run from a worker-served
  page with no first-paint regression.
- **Placement.** `public/sw.js` + `public/manifest.webmanifest` (outside `src/`,
  so the guardrail scan is untouched).

## Out of Scope

- Push notifications, background sync, offline editing.
- SSR or server endpoints.

## Ticket Map

| Ticket | Title | Status |
| --- | --- | --- |
| 01 | Service worker shell & offline-capable navigation | open |
