# 01 — Service Worker Shell & Offline-Capable Navigation

**What to build:** Register a service worker that precaches the static shell and hashed assets and serves page navigations from cache — instantly on repeat visits and offline — so clicking a view entry is not gated on a slow network. Include a web manifest for installability and an offline fallback page. (`.scratch/pwa-loading/spec.md`.)

**Blocking Edges:** None.
**Related:** Improves hero-thoughts #04's fallback load seam; not a hard dependency. Output lands in the build output, outside `src/`, so guardrails are unaffected.

**Acceptance Criteria:**

- [ ] `public/manifest.webmanifest` + icons; the site is installable and passes the Lighthouse PWA checks.
- [ ] The precache list is **generated at build time** (Astro integration or `vite-plugin-pwa`), so hashed asset names are always current; there is no hand-maintained `public/sw.js` list.
- [ ] Navigation cache lookups ignore the query string, so `/view/music` and `/view/music?from=hero` share one entry.
- [ ] The worker precaches the shell and hashed assets on install; navigation requests are cache-first with a background revalidate; non-navigation assets are stale-while-revalidate.
- [ ] A repeat visit to `/` and to a `/view/[category]` page works offline; an offline fallback is served for uncached navigations.
- [ ] Caches are versioned and stale caches are purged on activate; the update policy (`skipWaiting`/`clientsClaim` vs. prompt) is decided and documented so a stale worker can't wedge a new build.
- [ ] The site behaves exactly as today when service workers are unavailable (no-JS / private mode) — pure enhancement.
- [ ] The hero-thoughts #04 fallback entrance still runs from a worker-served page, with no first-paint regression against the static baseline.
- [ ] `bun test` + `bun run build` green; axe 0 violations.

**Status:** `open`
