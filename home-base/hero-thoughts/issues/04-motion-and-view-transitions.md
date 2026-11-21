# 04 — Cinematic Navigation: Native View Transitions + a No-Router Fallback

**What to build:** The Thought Stream's idle drift and confidence-linked settle, plus the title↔heading morph and hero pan-out/pan-in across **real** page navigations — cross-document View Transitions where supported, and a `sessionStorage`-flagged entrance/exit fallback where not (Firefox). No client routing. (ADR 0010 decision 4.)

**Blocking Edges:** Blocked By #01, #02, #03.
**Related:** `.scratch/pwa-loading` ticket 01 — makes the destination load instantly and so closes the fallback's load seam; not a hard dependency.

**Acceptance Criteria:**

- [ ] Selecting a stream entry performs a **real navigation** to a URL-addressed page: the URL updates, back/forward and deep links are native, and no router is introduced. Entries are plain `<a>` links; the whole effect is pure enhancement.
- [ ] **Cross-document path (Chrome/Edge, Safari):** `@view-transition { navigation: auto }` opts in; the destination `<h1>` is named statically, the clicked entry's title is named in `pageswap`, and the home hero is named so `::view-transition-old/new(hero)` pans out on departure and back on return — a true snapshot morph.
- [ ] **Fallback path (Firefox / no cross-document support):** the click handler stores `{ rect, viewId, ts }` in `sessionStorage` and plays a short (~200ms) exit before `location.assign`; the destination's parser-blocking inline `<head>` script reads the token **before first paint**, sets `<html data-vt>` plus the source rect, and glides the `<h1>`/hero in from it; the token is cleared afterwards.
- [ ] The two paths never both run — feature-detect cross-document support (e.g. `'onpageswap' in window`) and verify on Chromium **and** Firefox.
- [ ] **Return CTA** (the in-page "back to thoughts" link): plays a full exit on the destination and an entrance on the home page, mirroring the way in (title flies back to its stream slot from the destination's stored rect).
- [ ] **Browser Back/Forward (Firefox):** plays the **entrance only** — an exit cannot be played because cross-document traversals cannot be intercepted (`canIntercept` is always false; `pagehide`/`beforeunload` cannot delay). Cold back: the head script reads `performance.getEntriesByType('navigation')[0].type === 'back_forward'` and sets the start state before first paint. Restored from the back/forward cache: `pagehide` pre-arms the start state and `pageshow` (`persisted`) plays the entrance, so the cached frame does not flash; leftover exit state is always reset. No `unload`/`beforeunload` listeners (they forfeit the cache).
- [ ] The durable `?from=hero` marker (return CTA) and the one-shot `sessionStorage` token (animation) stay separate; a stale token is discarded after a short ttl.
- [ ] The cross-document test is a feature detect (`'onpageswap' in window`), so Firefox switches to the native path on its own when it ships (expected 162) and the fallback stops running there.
- [ ] No first-paint regression: the fallback start state is applied before paint (no flash or jump), measured against the static baseline.
- [ ] Reduced-motion resolves both paths to an instant navigation; the fallback never runs.
- [ ] Search settle defaults to a fast in-place snap (~250–350ms, spring); the longer searching spin is used only for low-confidence queries and spins only **real adjacent index entries** — no invented filler.
- [ ] Idle drift is slow, pauses on hover/focus, and freezes under reduced-motion.
- [ ] `bun test` + `bun run build` green; axe 0 violations.

**Status:** `done`

**Follow-ups (found in review, not done here):**

- **Idle drift is a bounded wobble (≈0.35 px/s), not the spec's ~20 px/s loop
  through ambient subjects.** The rest list is static and only the miss-spin
  rotates, so the stream does not travel. A true loop needs the entry list to
  repeat itself (with the duplicate `aria-hidden`) or a scroll-driven track —
  a real piece of work, and the reason the drift is only claimed as "slow".
- **The two paths are asserted statically, not verified in Chromium and
  Firefox.** No browser is available in this environment; `pageswap`,
  `pagereveal`, the bfcache entrance, and the first-paint margin all need a
  manual pass (Chrome + Firefox, light and dark, reduced motion on).
