# 11 — Home Page Fidelity to the Prototype: Type, Header, Prompt, Layout, Stream

**What to build:** Close the gap between the shipped home page and the Warm Hand-Crafted prototype (`.scratch/hero-thoughts/new_vis.html`, tab 02). #03 specified the composition and the roles but not the look; the page ships with system sans, a boxed ~700px hero, a nested-box prompt with two large pill buttons, a plain header, and hairline-ruled stream entries. Colours and the paper texture are paper-texture #01; this ticket is everything else. Decided in the 2026-11-21 grilling session.

**Priority:** high

**Blocking Edges:** Blocked By paper-texture/01 (canvas, tones and grain must be final so this is measured against them).
**Blocks:** None.

**Reference (behaviour only, never conventions):** `.scratch/hero-thoughts/new_vis.html` — warm tokens and fonts (lines ~65–110), `.prompt-input-wrap`, `.prompt-submit-btn`, `.prompt-clear-btn` (lines ~386–465), `.speech-pointer .warm-pointer` (~512–525), `.mind-item` and `.mind-item-title` (~700–740), header and theme/`quick-chip` styles (~200–270; **do not port the theme switcher or the TRY chips**). Port what it looks like; write it in this repo's conventions (tokens, `@layer`, Adapters, recipes). Per #03, none of the prototype's architecture-voice filler (eyebrow, `at://` meta lines, `[SSR ·]` tags) is ported.

## Decisions (locked)

- **Fonts:** Newsreader (roman + italic) for headings, stream titles and the speech line; DM Sans for body and UI; system monospace stays; no JetBrains Mono. Self-hosted (a shared CDN cache no longer exists: browsers partition HTTP caches per site, and same-origin fonts can be precached for offline). Declared in `src/styles/global.css` (`@font-face` plus `--font-sans` / `--font-display` in `@layer theme`); `theme.ts` stays colour-only; no library change. Site-wide.
- **Hero footprint:** no boxed column; spans the layout's `wide` column, vertically centred under the header. The profile links are not the hero's: they ride in the footer band with the copyright, where the Cover pins them to the bottom of the viewport (amended at sign-off, below).
- **Composition:** wide, `prompt | portrait | stream`, where the portrait zone is the cue and its swoosh **to the left of the head**, not the drawing alone. Narrow, the portrait leads: cue and head, then the prompt, then the stream (amended at sign-off, below).
- **Amended at sign-off (owner, 2026-11-23):** three changes, all owner calls. (1) The silhouette's **height is not specified** — the artwork's proportions are the artwork's business, so the 270–300px band and the leg that pinned it are gone; what remains gated is that it draws in `--site-ink-stroke`, clears 7:1 on the canvas, and is a quarter-pixel thinner in dark. (2) Narrow, the cue moves from under the prompt to the left of the head, with the prompt under the pair and the stream under that: the composition says who is speaking before it asks. (3) The profile links leave the hero's whitespace for the footer band beside the copyright, so they are pinned to the bottom and present on every page instead of floating under a hero that fills the screen.
- **Prompt:** one input, no `Box` wrapper, no Ask pill; a small `↵` button inside; Clear appears only when there is something to clear, as a quiet text button; italic serif "Ask away" with the swoosh stays. Boundary is `--border-strong` (3:1), 1px, warm brown (ADR 0011 rule kept; not the prototype's low-contrast hairline).
- **Header:** same content (brand, Home, Notes, Projects), restyled; current page is a soft filled pill.
- **Stream and silhouette:** serif titles, spacing instead of hairline rules, no meta line until the data-feeds tickets supply real data; silhouette stroke near-ink and ~25% larger.

**Acceptance Criteria** (measured at 1280×900 in real Chromium unless stated; sampled with `probe()` (`e2e/lib/look.ts`) using `getComputedStyle` / `getBoundingClientRect`):

- [x] **Fonts.** `getComputedStyle(body).fontFamily` starts with `"DM Sans"`; a stream title's and `h1`'s start with `Newsreader`; the speech line is italic Newsreader. `document.fonts.check()` is true for all three faces after load.
- [x] **Font budget.** Newsreader roman + italic and DM Sans are latin-subset woff2 totalling **≤ 160 KB**, `font-display: swap`, with a metric-adjusted fallback (`size-adjust`/`ascent-override`); static 400/500 weights are the fallback plan if the variable files exceed the budget. Cumulative layout shift on `/` is **< 0.05** (was 0.02; relaxed at sign-off, see below).
- [x] **Offline.** The fonts are in the service worker precache; the offline leg of `bun run smoke` reloads `/` and `/notes/` offline and `document.fonts.check()` is still true.
- [x] **Left edge.** The hero's prompt left edge equals the brand link's left edge (**±1px**). No element on `/` has a visible box edge from the old hero container (no boxed ~700px column).
- [x] **Fit.** At 1280×900 `/` needs no vertical scroll (`document.scrollingElement.scrollHeight <= innerHeight`), with the hero centred between the header and the footer band and the profile links **in that band**, beside the copyright (`main` holds no `a[rel]`).
- [x] **Prompt.** Input block-size **50–58px**; computed `border-radius` **8–12px**; border colour equals `--border-strong`; no `Box` wrapper or Ask pill remains; a `↵` button inside the input has accessible name "Ask".
- [x] **Clear.** The Clear button is **not in the DOM** on first paint, and is present after typing a character or after a submit; it renders as a text button (no fill, no border-radius ≥ 999px pill).
- [x] **Header.** Block-size **56–64px**, `border-block-end` 1px, DM Sans, translucent canvas. The current-page link has computed `border-radius` **≥ 999px**, a filled background, and `aria-current="page"`; there is no theme switcher and no suggestion chips.
- [x] **Stream.** Distance between consecutive entries' tops is **80–84px**; no entry has a bottom hairline; titles are Newsreader at **24–26px**; the idle drum still moves **36–52px** in 2000ms (hero-thoughts #09 spec unchanged and still passing).
- [x] **Silhouette.** No size assertion — the drawing is whatever the artwork says (owner amendment above); stroke colour is the `--site-ink-stroke` value, which is within a contrast ratio of **≥ 7:1** against the canvas (near-ink); the dark stroke is still ~0.25px thinner than light.
- [x] **Docs.** `docs/agents/ui.md` rule 4 and the `docs/ui-guide.md` "Light strokes on dark" section drop the "silverpoint / softer ink" reasoning and describe the near-ink stroke (the dark variant keeps its thinner width); the "Silverpoint, not chalk" comment in `HeroThoughts.astro` is rewritten to match.
- [x] **Mobile.** At 390×844: no horizontal overflow (`bun run look / -- --narrow` reports `overflow: none`), the composition reads top-down — **cue and head, then the prompt, then the stream** — with the cue to the left of the head (one row), and the input full width.
- [x] **Other pages.** `bun run shot /notes/` and `/projects/` before and after are in `.scratch/shots/`, with no overflow, no clipped text, and axe at 0 violations (headings are now serif site-wide).
- [x] **Gates.** Axe WCAG 2.1 AA reports 0 violations on `/`; the contrast gate passes for every new foreground/background pairing; guardrails and `bun run smoke` stay green; no inline `style=`, no bespoke classes in `src/pages/` or `src/layouts/`.
- [x] **Sign-off.** `bun run shot /` at 1280×900 and at `--narrow`, saved beside the prototype's Warm render in `.scratch/shots/` (`proto-warm-1280.png` exists); the status stays `in-progress` until the owner approves them. **Shots for approval:**
  `.scratch/shots/home-final-1280.png`, `.scratch/shots/home-final-390.png`
  (beside `proto-warm-1280.png` / `proto-warm-390.png`), taken against the
  final paper canvas after paper-texture #01.

**Decided at sign-off — CLS budget 0.05, not 0.02.** The remaining shift is the
`ch` measure doing its job: a late swap moves every `ch`-measured column because
DM Sans's "0" is 0.68em against Arial's 0.556em. Measured 0.0374 with the faces
delayed 300ms, 0 on a warm load. Google's Core Web Vitals call < 0.1 "good", so
the budget is set at half of that: the reflow is accepted rather than hidden by
re-binding `--measure` to `rem` (a library violation, reverted in 5f9aecb) or by
matching `size-adjust` to `ch` (which costs a 24%-oversized fallback).

**Re-measured against the final tones (2026-11-21, after paper-texture #01).**
`bun run smoke -- --all` is green, including every home-fidelity leg: the
80–84px stream pitch, 24–26px serif titles, the 50–58px prompt at 8–12px radius
bounded by `--border-strong`, the 56–64px header pill, the silhouette in
`--site-ink-stroke` (no size assertion, per the owner's sign-off amendment) and
the 0.25px-thinner dark stroke. The silhouette clears its 7:1 house rule on
the new canvas at 14.97:1 (light) / 15.05:1 (dark), and `bun run look / --
--narrow` reports `overflow: none` at 390×844. The two other pages are re-shot
with the new tones for the same approval: `.scratch/shots/notes-final-1280.png`
and `.scratch/shots/projects-final-1280.png` (no overflow, nothing clipped, axe
still 0 violations); nothing in this diff changes their type or layout.

**Note for the next pass (not a blocker):** `HeroSearch.svelte` is at 589 lines,
just under the guardrail's 600-line error (warn over 300). The portrait zone is
now its own idea — cue, swoosh, head — and it is the natural next extraction: a
`PortraitZone.svelte` taking the cue text, the guess tag and the silhouette
snippet would take the island back to ~560 and give the phone order one home.

**Status:** `done` — owner approved the sign-off shots (2026-11-24).
