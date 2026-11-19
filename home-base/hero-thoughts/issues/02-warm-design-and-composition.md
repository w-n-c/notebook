# 02 — Warm Design & Composition (Silhouette + Thought Stream)

**What to build:** Adopt the warm hand-crafted theme (light + dark) as Design Tokens, and compose the HeroThoughts surface as a left-facing Silhouette beside a drifting Thought Stream, with the generated and synthesized callouts — replacing the current enclosed-head / chip-swarm rendition. (ADR 0010, ADR 0011.)

**Blocking Edges:** Blocked By #01.
**Blocks:** #03.

**Acceptance Criteria:**

- [ ] Warm light + dark tokens land in `packages/layout/src/tokens.ts`: terracotta/sage/ochre accents, a `blueprint` border, an `ink-stroke`, and re-warmed neutral ramps; the retired stark palette is gone.
- [ ] Contrast for both color-schemes meets ADR 0011's table (AA minimum per role); the ratios are asserted in the layout test suite.
- [ ] The hero composes `prompt | Silhouette | Thought Stream`; the Silhouette is `aria-hidden` decoration, never a container; the responsive collapse matches the prototype (mobile shrinks the Silhouette, the stream stacks below the prompt).
- [ ] A generated Assembled View entry carries a visible "generated" tag; a Synthesized View carries a disclaimer tag in the speech zone; both are token-styled and easy to restyle.
- [ ] All entry labels and callout copy live in one module so they are editable without hunting through markup (placeholder strings are fine), including the **Open Question** lifecycle copy: asking ("let's see if I can get an answer"), accepted ("awaiting response"), deferred ("leave it with me"), and a failure line.
- [ ] Reduced-motion honoured; axe WCAG 2.1 AA 0 violations; guardrails green; no inline styles or bespoke classes in `src/pages/` or `src/layouts/`.

**Status:** `open`
