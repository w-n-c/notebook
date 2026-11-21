# 08 — Mobile Composition of the Silhouette and the Stream

**What to build:** a deliberate narrow-screen composition, instead of the
desktop arrangement collapsing on its own. On desktop the order is
`prompt · Silhouette · Stream`, with the Silhouette facing left into the stream.
On a phone that column stack puts the drawing between the prompt and the stream,
squeezing both, and the 48vh stream window is mostly empty.

This needs design work with the docs, not a quick `Switcher` tweak: the
Silhouette's role changes between the two layouts (a boundary between two
columns → something else entirely when there is only one column), and ADR 0010
says the stream lives "behind the head", which a vertical stack cannot express.

**Blocking Edges:** Blocked by hero #06 (the motion seam, so the layout rules and
the play targets agree) and data-feeds #01 through hero #07 (the composition is
designed against real entries, not four placeholder chips).

**Acceptance Criteria (draft — to be settled in the grilling session):**

- [ ] The narrow composition is written down in ADR 0010 (or a new ADR) before any
      code: where the Silhouette goes, what it becomes, and what the stream's
      viewport is.
- [ ] No viewport media query in components; the layout is expressed through the
      Layout Primitives (ADR 0005) or a container-aware equivalent.
- [ ] The speech cue stays attached to the Silhouette's mouth in every layout, or
      the narrow layout states where it moves.
- [ ] The stream remains keyboard reachable, scrollable, and drifts only where the
      drift is visible; reduced motion still resolves to a still page.
- [ ] `bun run smoke` extended with a narrow viewport leg (390×844): hero visible,
      no horizontal overflow, title visible after navigation.
- [ ] Contrast and axe stay green at the narrow size.

**Status:** `open` — **needs a grilling session with the UI docs open.**
**Blocked by:** hero-thoughts #10, design-system-architecture #08 and #09 (retro 2026-11)

**Questions for the grilling session:**

- Does the Silhouette become a top rule above the prompt (the spec's original
  wording), or does it drop out of the flow and sit behind the stream as a
  watermark?
- Is the stream a fixed-height window on mobile at all, or does it grow with the
  page and let the page scroll (the hero becomes the page)?
- Where do the social links and the return CTA go when the hero fills the screen?
- Does the mobile layout still need the 20px/s drift, or does motion cost more
  than it earns on a small, scrolling screen?
