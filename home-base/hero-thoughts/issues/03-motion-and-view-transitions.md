# 03 — Cinematic Navigation: Native View Transitions + a No-Router Fallback

**What to build:** The Thought Stream's idle drift and confidence-linked settle, plus the title↔heading morph and hero pan-out/pan-in across **real** page navigations — cross-document View Transitions where supported, and a `sessionStorage`-flagged entrance/exit fallback where not (Firefox). No client routing. (ADR 0010 decision 4.)

**Blocking Edges:** Blocked By #01, #02.
**Related:** `.scratch/pwa-loading` 01 — makes the destination load instantly and so closes the fallback's load seam; not a hard dependency.

**Acceptance Criteria:**

- [ ] Selecting a stream entry performs a **real navigation** to a URL-addressed page: the URL updates, back/forward and deep links are native, and no router is introduced. Entries are plain `<a>` links; the whole effect is pure enhancement.
- [ ] **Cross-document path (Chrome/Edge, Safari):** `@view-transition { navigation: auto }` opts in; the destination `<h1>` is named statically, the clicked entry's title is named in `pageswap`, and the home hero is named so `::view-transition-old/new(hero)` pans out on departure and back on return — a true snapshot morph.
- [ ] **Fallback path (Firefox / no cross-document support):** the click handler stores `{ rect, viewId, ts }` in `sessionStorage` and plays a short (~200ms) exit before `location.assign`; the destination's parser-blocking inline `<head>` script reads the token **before first paint**, sets `<html data-vt>` plus the source rect, and glides the `<h1>`/hero in from it; the token is cleared afterwards.
- [ ] The two paths never both run — feature-detect cross-document support (e.g. `'onpageswap' in window`) and verify on Chromium **and** Firefox.
- [ ] No first-paint regression: the fallback start state is applied before paint (no flash or jump), measured against the static baseline.
- [ ] Reduced-motion resolves both paths to an instant navigation; the fallback never runs.
- [ ] Search settle defaults to a fast in-place snap (~250–350ms, spring); the longer searching spin is used only for low-confidence queries and spins only **real adjacent index entries** — no invented filler.
- [ ] Idle drift is slow, pauses on hover/focus, and freezes under reduced-motion.
- [ ] `bun test` + `bun run build` green; axe 0 violations.

**Status:** `open`
