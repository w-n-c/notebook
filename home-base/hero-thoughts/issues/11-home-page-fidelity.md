# 11 — Home Page Fidelity to the Prototype: Type, Header, Prompt, Layout, Stream

**What to build:** Close the gap between the shipped home page and the Warm Hand-Crafted prototype (`.scratch/hero-thoughts/new_vis.html`, tab 02). #03 specified the composition and the roles but not the look; the page ships with system sans, a boxed ~700px hero, a nested-box prompt with two large pill buttons, a plain header, and hairline-ruled stream entries. Colours and the paper texture are paper-texture #01; this ticket is everything else. Decided in the 2026-11-21 grilling session.

**Priority:** high

**Blocking Edges:** Blocked By paper-texture #01 (canvas, tones and grain must be final so this is measured against them).
**Blocks:** None.

**Reference (behaviour only, never conventions):** `.scratch/hero-thoughts/new_vis.html` — warm tokens and fonts (lines ~65–110), `.prompt-input-wrap`, `.prompt-submit-btn`, `.prompt-clear-btn` (lines ~386–465), `.speech-pointer .warm-pointer` (~512–525), `.mind-item` and `.mind-item-title` (~700–740), header and theme/`quick-chip` styles (~200–270; **do not port the theme switcher or the TRY chips**). Port what it looks like; write it in this repo's conventions (tokens, `@layer`, Adapters, recipes). Per #03, none of the prototype's architecture-voice filler (eyebrow, `at://` meta lines, `[SSR ·]` tags) is ported.

## Decisions (locked)

- **Fonts:** Newsreader (roman + italic) for headings, stream titles and the speech line; DM Sans for body and UI; system monospace stays; no JetBrains Mono. Self-hosted (a shared CDN cache no longer exists: browsers partition HTTP caches per site, and same-origin fonts can be precached for offline). Declared in `src/styles/global.css` (`@font-face` plus `--font-sans` / `--font-display` in `@layer theme`); `theme.ts` stays colour-only; no library change. Site-wide.
- **Hero footprint:** no boxed column; spans the layout's `wide` column, vertically centred under the header; social links sit below it.
- **Prompt:** one input, no `Box` wrapper, no Ask pill; a small `↵` button inside; Clear appears only when there is something to clear, as a quiet text button; italic serif "Ask away" with the swoosh stays. Boundary is `--border-strong` (3:1), 1px, warm brown (ADR 0011 rule kept; not the prototype's low-contrast hairline).
- **Header:** same content (brand, Home, Notes, Projects), restyled; current page is a soft filled pill.
- **Stream and silhouette:** serif titles, spacing instead of hairline rules, no meta line until the data-feeds tickets supply real data; silhouette stroke near-ink and ~25% larger.

**Acceptance Criteria** (measured at 1280×900 in real Chromium unless stated; sampled with `probe()` (`e2e/lib/look.ts`) using `getComputedStyle` / `getBoundingClientRect`):

- [x] **Fonts.** `getComputedStyle(body).fontFamily` starts with `"DM Sans"`; a stream title's and `h1`'s start with `Newsreader`; the speech line is italic Newsreader. `document.fonts.check()` is true for all three faces after load.
- [ ] **Font budget.** Newsreader roman + italic and DM Sans are latin-subset woff2 totalling **≤ 160 KB**, `font-display: swap`, with a metric-adjusted fallback (`size-adjust`/`ascent-override`); static 400/500 weights are the fallback plan if the variable files exceed the budget. Cumulative layout shift on `/` is **< 0.02**.
- [x] **Offline.** The fonts are in the service worker precache; the offline leg of `bun run smoke` reloads `/` and `/notes/` offline and `document.fonts.check()` is still true.
- [x] **Left edge.** The hero's prompt left edge equals the brand link's left edge (**±1px**). No element on `/` has a visible box edge from the old hero container (no boxed ~700px column).
- [x] **Fit.** At 1280×900 `/` needs no vertical scroll (`document.scrollingElement.scrollHeight <= innerHeight`), with the social links below the hero.
- [x] **Prompt.** Input block-size **50–58px**; computed `border-radius` **8–12px**; border colour equals `--border-strong`; no `Box` wrapper or Ask pill remains; a `↵` button inside the input has accessible name "Ask".
- [x] **Clear.** The Clear button is **not in the DOM** on first paint, and is present after typing a character or after a submit; it renders as a text button (no fill, no border-radius ≥ 999px pill).
- [x] **Header.** Block-size **56–64px**, `border-block-end` 1px, DM Sans, translucent canvas. The current-page link has computed `border-radius` **≥ 999px**, a filled background, and `aria-current="page"`; there is no theme switcher and no suggestion chips.
- [x] **Stream.** Distance between consecutive entries' tops is **80–84px**; no entry has a bottom hairline; titles are Newsreader at **24–26px**; the idle drum still moves **36–52px** in 2000ms (hero-thoughts #09 spec unchanged and still passing).
- [x] **Silhouette.** Visible profile height **270–300px**; stroke colour is the `--site-ink-stroke` value, which is within a contrast ratio of **≥ 7:1** against the canvas (near-ink); the dark stroke is still ~0.25px thinner than light.
- [x] **Docs.** `docs/agents/ui.md` rule 4 and the `docs/ui-guide.md` "Light strokes on dark" section drop the "silverpoint / softer ink" reasoning and describe the near-ink stroke (the dark variant keeps its thinner width); the "Silverpoint, not chalk" comment in `HeroThoughts.astro` is rewritten to match.
- [x] **Mobile.** At 390×844: no horizontal overflow (`bun run look / -- --narrow` reports `overflow: none`), the stream stacks below the prompt, the input is full width.
- [x] **Other pages.** `bun run shot /notes/` and `/projects/` before and after are in `.scratch/shots/`, with no overflow, no clipped text, and axe at 0 violations (headings are now serif site-wide).
- [x] **Gates.** Axe WCAG 2.1 AA reports 0 violations on `/`; the contrast gate passes for every new foreground/background pairing; guardrails and `bun run smoke` stay green; no inline `style=`, no bespoke classes in `src/pages/` or `src/layouts/`.
- [ ] **Sign-off.** `bun run shot /` at 1280×900 and at `--narrow`, saved beside the prototype's Warm render in `.scratch/shots/` (`proto-warm-1280.png` exists); the status stays `in-progress` until the owner approves them.

**Open decision — CLS vs. the measure.** The layout half of the Font budget
criterion is not met, and cannot be while both locked decisions hold. `--measure`
is `ch` (Every Layout: the measure is a character count, and the Switcher's
threshold reads it), and DM Sans's "0" is 0.68em against Arial's 0.556em, so a
late swap widens every `ch`-measured column: measured CLS **0.0374** with the
font delayed 300ms (0 on a warm load, which is what the old test measured). It
was briefly "fixed" by re-binding `--measure*` to `rem`, which is a library
violation and has been reverted. The two ways out are `font-display: optional`
(no swap, no shift, fallback on slow first visits) and matching `size-adjust` to
`ch` instead of apparent size (no shift, text ~24% large during the swap window).
Owner's call; neither is implemented.

**Status:** `in-progress`
