# 03 — Motion & Cross-Document View Transitions

**What to build:** The Thought Stream's idle drift, the confidence-linked search settle, and the cinematic title↔heading morph with hero pan-out/pan-in across real page navigations, using native cross-document View Transitions. (ADR 0010.)

**Blocking Edges:** Blocked By #01, #02.

**Acceptance Criteria:**

- [ ] Selecting a stream entry performs a real navigation to a URL-addressed page; back/forward, deep links, and no-JS all work (entries are plain links).
- [ ] `@view-transition { navigation: auto }` opts in; the destination `<h1>` is named statically, the clicked entry's title is named in `pageswap`, and the home hero is named so `::view-transition-old/new(hero)` pans out on departure and back in on return.
- [ ] The title↔`<h1>` shared-element morph works in both directions.
- [ ] Search settle defaults to a fast in-place snap (~250–350ms, spring); the longer searching spin (vertical motion blur) is used only for low-confidence queries and spins only **real adjacent entries** — no invented filler titles.
- [ ] Idle drift is slow, pauses on hover/focus, and freezes under reduced-motion.
- [ ] The `@view-transition` rule and its animations are guarded by `prefers-reduced-motion: no-preference`; unsupported browsers (Firefox stable) get a plain navigation with no breakage.
- [ ] `bun test` + `bun run build` green; axe 0 violations.

**Status:** `open`
