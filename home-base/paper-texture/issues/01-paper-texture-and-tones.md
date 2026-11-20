# 01 — Paper Texture for the Whole Site, and Retuned Tones (Discussion First)

**What to build:** Decide, then build, a paper *texture* for the whole site (not only the hero) and retune the Theme's tones to suit. This ticket starts as a grilling/design discussion; implementation is blocked on its outcome. (ADR 0011, "Future".)

**Blocking Edges:** Blocked By hero-thoughts #03 (the Theme and `src/theme.ts` must exist).
**Blocks:** None.

**Questions to settle first:**

- Texture mechanism: SVG `feTurbulence` grain, a tiled image, or CSS gradients? Cost per page, behaviour under `prefers-reduced-data`, and print.
- Scope: site-wide on `body`, or per-Box/surface? How does it interact with `Box` surfaces and the `subtle`/`accent` fills?
- Tones: Radix Sand's light canvas (`#fdfdfc`) is nearly white; the prototype's cream is `#F6F1E7`. Generate a custom 12-step scale from the cream and terracotta seeds (e.g. via the Radix custom-palette tool or Leonardo), then re-run the contrast gate. Dark stays warm charcoal.
- UI Guide: the grain blend rule (`multiply` in light, `soft-light` at 2–3% in dark) may generalise; record whatever is decided in `docs/ui-guide.md`.

**Acceptance Criteria:**

- [ ] The decisions above are recorded (ADR 0011 amended, or a new ADR if the mechanism is a real fork).
- [ ] If tones change: `src/theme.ts` values are replaced, still passing the ADR 0011 pairing rules.
- [ ] If a texture ships: reduced-data and forced-colors are handled; axe still 0 violations; no inline styles.

**Status:** `open`
