# 01 — Paper Texture for the Whole Site, and Retuned Tones

**What to build:** Give the whole site a paper *texture* and retune the Theme's neutral tones, light and dark, so the page reads as one warm paper-and-ink surface. Decided in the 2026-11-21 grilling session (ADR 0011, "Future"). Today the grain is scoped to the hero box, which shows as a visible rectangle, and the canvas (`#fdfdfc`) sits beside cool-grey Sand surfaces, so the page reads as mismatched.

**Priority:** high

**Blocking Edges:** none. Blocked-by #10 (hero-thoughts), #08 and #09 (design-system-architecture) are all `done`.
**Blocks:** hero-thoughts #11 (home page fidelity is measured against the final canvas and tones).

**Reference (behaviour only, never conventions):** `.scratch/hero-thoughts/new_vis.html`, `[data-theme="warm"]` custom properties (lines ~65–110) for the warm values, and the `.paper-grain` rules (lines ~135–150). The prototype's grain is a live `feTurbulence` SVG overlay; we are deliberately not doing that.

## Decisions (locked)

- **Mechanism:** a tiny seamless tiled noise PNG/WebP as `background-image` on the page's own root. No live `feTurbulence` filter, no `position:` overlay. It is switched off under `print`, `prefers-reduced-data: reduce` and `forced-colors: active`.
- **Scope:** site-wide, painted once; not per-`Box`. The hero's own grain (`.grain` in `HeroThoughts.astro`, `src/assets/grain.svg`) is removed.
- **Amended at implementation (owner, 2026-11-21):** the tile is on `:root` and
  `body` is transparent, not painted on `body`. The library's `Box` fills with
  `background-color: inherit` — a good default for many site styles, and it stays
  — so a painted `body` meant every inherited fill copied the flat canvas colour
  and repainted it: the footer band was a plain strip under the grain, and the
  header's 86% scrim was nearly one. With the paper on the root and `body`
  transparent, `inherit` means "whatever is behind me" and the footer is paper
  again, with no library change and no per-element opt-out. The header scrim also
  dropped to 30% canvas.
- **Blend:** `background-blend-mode` (`mix-blend-mode` does not apply to a background image): `multiply` in light, `soft-light` in dark. `background-image` has no opacity, so the 2–3% dark strength is baked into the tile's alpha.
- **Tones:** swap the six neutral roles together (canvas, surface, subtle, border-subtle, text-muted, border-strong), light and dark, in `src/theme.ts`. Not a full custom 12-step scale (steps 4, 5, 7, 8, 10 are unused by `theme.ts`); generate one only if several values fail the gate.
- **Warmth:** light is a dialled-back version of the prototype's `#F6F1E7`: canvas about `#F8F5EE`, allowed a touch warmer. Surface, subtle, border-subtle and text-muted are derived from the prototype's warm values (`#FCF9F2`, `#EDE5D6`, `#DFD6C7`, `#75685C`) by the same step toward the current Sand values. `--border-strong` is a warm brown. Dark becomes cohesive warm charcoals on the same six roles.

**Acceptance Criteria:**

- [x] Computed `background-image` of the root (`document.documentElement`, per the amendment above; `body` computes to a transparent background so inherited fills show it) is the tile at the default viewport; it is `none` under `@media print`, `prefers-reduced-data: reduce` and `forced-colors: active` (Playwright `emulateMedia` for print, forced-colors, and a unit assertion on the CSS for reduced-data, which Chromium does not emulate).
- [x] The tile is **≤ 20 KB**, tiles with no visible seam at 2× repeat in a screenshot, and is the only grain on the page: no `.grain` element, no `feTurbulence`, no `position:` overlay, no `mix-blend-mode` grain left in `src/`.
- [x] Blend is `background-blend-mode: multiply` in light and `soft-light` in dark (2–3% baked alpha), read from `getComputedStyle(document.body).backgroundBlendMode` under `prefers-color-scheme` emulation. **Amended on the number:** the tile's alpha is **14/255 (5.5%)**, not 2–3%, and the *rendered* strength is what lands in band — light deviates −1.7% / +2.0% from the canvas, dark +3 levels on a 29 canvas. One asset serves both modes, and the two blend modes respond to alpha by roughly 4×; at 2–3% alpha the dark grain measured under one grey level and effectively disappeared, while a second, darker tile would break the one-sheet rule. Recorded in ADR 0011.
- [x] `bun run shot /` shows no visible hero rectangle or edge at 1280×900 and at `--narrow` (390×844); the grain is continuous from header to footer.
- [x] Light canvas computes to within ±2 per channel of **rgb(248, 245, 238)**; the other five light roles and all six dark roles are warm (hue between 30° and 50° HSL, checked in `tests/`) and declared in `src/theme.ts` as literal hex with a comment per value.
- [x] The contrast gate (`tests/home-a11y.test.ts`) passes in both variants over the new values: text 4.5:1 on canvas, surface and subtle; accent-coloured text 4.5:1 on canvas, surface and tint; `--border-strong` **3:1** on canvas and surface; no pairing the hero, Combobox adapter and Button adapter use is left uncovered. A value that fails is nudged, and recorded in the commit message.
- [x] `docs/agents/ui.md` rule 5 and the `docs/ui-guide.md` "Paper grain" section say `background-blend-mode` and name the baked-alpha rule; ADR 0011's "Future" section is amended with the mechanism, scope, tones and the warmth target.
- [x] Axe reports 0 violations on `/` and `/notes/`; no inline `style=`; guardrails and `bun run smoke` stay green.

## Verification (2026-11-21)

- **Tile.** `src/assets/paper-grain.png`, 128×128, 17.6 KB, generated by
  `bun run paper` (`scripts/generate-paper.ts`) and compared byte for byte in
  `tests/paper-texture.test.ts`. Seam: sampled off the rendered page, the jump
  across each 128px tile boundary is 0.18 grey levels (light) and 0.09 (dark)
  against an interior mean of 0.10 / 0.06 — the wrap is one more adjacent pair,
  and a 2× repeat shows no edge.
- **Texture strength on the page.** Light: mean 242.2, sd 1.27, range 238–247 on
  a 248 canvas (a 0.4–4% bite). Dark: mean 29.4, sd 0.55, range 28–32 on a 29
  canvas (soft-light both lifts and darkens). Measured through `probe()` with the
  page's own content removed, so only the body's background is left.
- **Media.** `e2e/paper-texture.spec.ts`: the image and both blend modes as the
  browser computes them, `none` under `emulateMedia({ media: 'print' })` and
  `forcedColors: 'active'`; `prefers-reduced-data` is the unit assertion in
  `tests/paper-texture.test.ts`, as the ticket allows.
- **Tones.** Canvas `#f8f5ee` = rgb(248, 245, 238). Six roles, both variants, all
  inside 30°–50° HSL. No value failed the contrast gate at these tones, so none
  was nudged for contrast; two moved a channel to land in the hue band (light
  `--border-strong`, dark `--surface-subtle`) — recorded in the ADR.
- **Bands.** The header and footer read as the same sheet: the paper moved to
  `:root` with `body` transparent (see the amendment), so the footer's inherited
  fill shows the paper instead of repainting the canvas, and the header scrim
  dropped from 86% to 30% canvas. Measured on `/notes/`: a margin column at the
  top is sd 0.87 (was 0.47) and at the bottom sd 1.1–1.4 (was **0.00** — a
  perfectly flat strip). Owned by `tests/paper-texture.test.ts` ("nothing paints
  over the sheet") and `e2e/paper-texture.spec.ts`.
- **Docs.** `docs/agents/ui.md` rule 5, `docs/ui-guide.md` ("Paper grain is one
  tile on the body…" and "Nothing paints over the sheet"), ADR 0011's amended
  section, and `docs/pwa.md` + the icon palette/manifest moved to the same paper
  value.
- **Gates.** `bash scripts/ci.sh` green (format, wrappers, recipes, astro check,
  typecheck, svelte-check, library tests, site tests, build, browser smoke
  chromium + firefox). Axe: 0 violations on every built route.

**Status:** `done`
