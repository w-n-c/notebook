# 05 — JS-Geometry Standard and De-Staled Docs

**What to build:** one reviewer rule, and remove the measurements that went stale
twice because they were copied into prose.

**Blocking Edges:** none.
**Status:** `open`

**Acceptance Criteria:**

- [ ] `CODING_STANDARDS.md` gains one bullet: "Geometry measured in JS is a last
      resort; if CSS can express it, it must." It carves out transition-origin
      capture (`Layout.astro`, `ReturnToHero.astro`, the view-transition token in
      `HeroSearch`) as not layout.
- [ ] `docs/agents/browser.md`: the **5.8s** hook budget and the timing table are
      gone; so are the "~1.8s" motion cost and "15s for five entries, 45s for
      fifteen". The `look` sample uses placeholders (`hero: <h>px, <n> entries`).
      `rg -n '[0-9]+(\.[0-9]+)?s\b' docs/agents/browser.md` finds only the port
      and the `--ignore-lock` explanation.
- [ ] `docs/agents/verification.md`: "about **4s**" is gone.
