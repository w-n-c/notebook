# 01 — Paper Texture for the Whole Site, and Retuned Tones

**What to build:** Give the whole site a paper *texture* and retune the Theme's neutral tones, light and dark, so the page reads as one warm paper-and-ink surface. Decided in the 2026-11-21 grilling session (ADR 0011, "Future"). Today the grain is scoped to the hero box, which shows as a visible rectangle, and the canvas (`#fdfdfc`) sits beside cool-grey Sand surfaces, so the page reads as mismatched.

**Priority:** high

**Blocking Edges:** none. Blocked-by #10 (hero-thoughts), #08 and #09 (design-system-architecture) are all `done`.
**Blocks:** hero-thoughts #11 (home page fidelity is measured against the final canvas and tones).

**Reference (behaviour only, never conventions):** `.scratch/hero-thoughts/new_vis.html`, `[data-theme="warm"]` custom properties (lines ~65–110) for the warm values, and the `.paper-grain` rules (lines ~135–150). The prototype's grain is a live `feTurbulence` SVG overlay; we are deliberately not doing that.

## Decisions (locked)

- **Mechanism:** a tiny seamless tiled noise PNG/WebP as `background-image` on `body`. No live `feTurbulence` filter, no `position:` overlay. It is switched off under `print`, `prefers-reduced-data: reduce` and `forced-colors: active`.
- **Scope:** site-wide on `body` only; not per-`Box`. The hero's own grain (`.grain` in `HeroThoughts.astro`, `src/assets/grain.svg`) is removed.
- **Blend:** `background-blend-mode` (`mix-blend-mode` does not apply to a background image): `multiply` in light, `soft-light` in dark. `background-image` has no opacity, so the 2–3% dark strength is baked into the tile's alpha.
- **Tones:** swap the six neutral roles together (canvas, surface, subtle, border-subtle, text-muted, border-strong), light and dark, in `src/theme.ts`. Not a full custom 12-step scale (steps 4, 5, 7, 8, 10 are unused by `theme.ts`); generate one only if several values fail the gate.
- **Warmth:** light is a dialled-back version of the prototype's `#F6F1E7`: canvas about `#F8F5EE`, allowed a touch warmer. Surface, subtle, border-subtle and text-muted are derived from the prototype's warm values (`#FCF9F2`, `#EDE5D6`, `#DFD6C7`, `#75685C`) by the same step toward the current Sand values. `--border-strong` is a warm brown. Dark becomes cohesive warm charcoals on the same six roles.

**Acceptance Criteria:**

- [ ] Computed `background-image` of `body` is the tile at the default viewport; it is `none` under `@media print`, `prefers-reduced-data: reduce` and `forced-colors: active` (Playwright `emulateMedia` for print, forced-colors, and a unit assertion on the CSS for reduced-data, which Chromium does not emulate).
- [ ] The tile is **≤ 20 KB**, tiles with no visible seam at 2× repeat in a screenshot, and is the only grain on the page: no `.grain` element, no `feTurbulence`, no `position:` overlay, no `mix-blend-mode` grain left in `src/`.
- [ ] Blend is `background-blend-mode: multiply` in light and `soft-light` in dark (2–3% baked alpha), read from `getComputedStyle(document.body).backgroundBlendMode` under `prefers-color-scheme` emulation.
- [ ] `bun run shot /` shows no visible hero rectangle or edge at 1280×900 and at `--narrow` (390×844); the grain is continuous from header to footer.
- [ ] Light canvas computes to within ±2 per channel of **rgb(248, 245, 238)**; the other five light roles and all six dark roles are warm (hue between 30° and 50° HSL, checked in `tests/`) and declared in `src/theme.ts` as literal hex with a comment per value.
- [ ] The contrast gate (`tests/home-a11y.test.ts`) passes in both variants over the new values: text 4.5:1 on canvas, surface and subtle; accent-coloured text 4.5:1 on canvas, surface and tint; `--border-strong` **3:1** on canvas and surface; no pairing the hero, Combobox adapter and Button adapter use is left uncovered. A value that fails is nudged, and recorded in the commit message.
- [ ] `docs/agents/ui.md` rule 5 and the `docs/ui-guide.md` "Paper grain" section say `background-blend-mode` and name the baked-alpha rule; ADR 0011's "Future" section is amended with the mechanism, scope, tones and the warmth target.
- [ ] Axe reports 0 violations on `/` and `/notes/`; no inline `style=`; guardrails and `bun run smoke` stay green.

**Status:** `open`
