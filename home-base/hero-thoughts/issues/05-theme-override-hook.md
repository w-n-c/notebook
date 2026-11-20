# 05 — Theme Override Hook in `@w-n-c/layout` (Shared Seam)

**What to build:** `layoutTokens({ theme })` in the library: typed semantic-role overrides plus namespaced extras, emitted in a `theme` layer after `base`, with the contrast gate running over the applied tokens. The warm palette itself stays out of the library (ADR 0011).

**Blocking Edges:** Blocked By #01.
**Blocks:** #03.

**Acceptance Criteria:**

- [ ] `layoutTokens({ theme })` accepts `{ light, dark }` pairs for the semantic roles only (surface canvas/surface/subtle/accent; text main/muted/accent; border subtle/strong/accent; focus ring) — the type rejects palette steps and unknown roles.
- [ ] A theme `extras` map is emitted as `--<prefix>-<name>` custom properties (the site uses `site`); the library gives them no meaning.
- [ ] The theme is emitted in `@layer theme`, with the layer order `base, theme, components, utilities`; the layer-order assertions in the library tests and any ADR/doc text naming the old order are updated.
- [ ] With no theme the output is unchanged except the layer declaration.
- [ ] The contrast gate (library tests and `tests/home-a11y.test.ts`) evaluates the library defaults with the theme applied, both variants, for every text-on-surface pair and for `--border-strong` at 3:1 on every surface; the gate fails on the library's own neutral `--border-strong` today (2.56 light, 1.91 dark), which this ticket fixes.
- [ ] The Theme glossary entry stays accurate (the library ships one neutral Theme, overridable); `bun test`, `bun run build`, `bun run typecheck` green.

**Status:** `open`
