# 02 — Split Library-Owned Base Styles Out of `global.css`

**What to build:** Separate the renderer-independent Base Styles from the site's Home-Base taste. The library owns the mechanical resets and neutral typographic element defaults; this site keeps only its own flavor. Delivery is settled — Base Styles ship inside the core stylesheet (see the spec's "Base Styles delivery").

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** 04: Publishing (README documents Base Styles).

**Status:** `done`

## Acceptance Criteria

- [x] Base Styles (mechanical resets + neutral typographic defaults) are generated/shipped by `@w-n-c/layout`, not hand-written in the site's `global.css`. `buildBaseStyles()` in `packages/layout/src/layout-integration.ts` emits them.
- [x] `generateCss()` emits Base Styles into `@layer base` alongside the tokens (one import); no separate `base.css` / `generateBase()` subpath.
- [x] The site's `global.css` contains only site-owned bindings (`article` prose rhythm, `header h+p` lead subtitle, `theme-light`/`theme-dark`) — no duplicated resets. It fell from 230 lines to 42.
- [x] `@layer base, components, utilities;` order is emitted once, by the library, as the first line of `generateCss()`.
- [x] `bun test` (144), `bun run build` (10 pages), axe WCAG 2.1 AA, and `scripts/git-guardrails.sh` all remain green; the weird `max-inline-size: var(--max, var(--measure))` measure cap behaves identically.

## What moved, and what stayed

The line drawn is **mechanical vs. brand**:

| Stays in the library (`@layer base`) | Stays in the site |
| --- | --- |
| `* { box-sizing: border-box; max-inline-size: var(--max, var(--measure)) }` | `header :is(h1, h2) + p` — the lead subtitle |
| `*, *::before, *::after { border-style: solid; border-width: 0 }` | `article > * + *` — prose rhythm |
| `body`, `h1`–`h4`, `p`/`dl`/`dd`, `a`, `hr`, `code`/`pre`, `:focus-visible` | `article > :is(h2, h3, h4)` — heading rhythm |
| `html, body, div, … { max-inline-size: none }`, `img`, `pre` | `.theme-light` / `.theme-dark` |
| `@media (prefers-reduced-motion: reduce)` | |
| `:is(ul, ol)[data-space]` (the contract's list reset) | |

The library also gained `@layer utilities` (`buildUtilityRules()`), because the
splitters (`.split-*` / `[data-split-*]`), the measure opt-out, and
`visually-hidden`/`sr-only` are part of the contract rather than site taste. They
were sitting in the site's stylesheet by accident of where the contract used to live.

Two things were deliberately **dropped** as duplicates: `global.css`'s
`:root { color-scheme: light dark; }`, which `buildColorVariables()` already emits,
and the `@layer base, components, utilities;` statement, now the library's.

## Verification

The risk in a move like this is silent cascade change, so it was checked
mechanically rather than by eye:

- Built `HEAD` before the change and kept `dist/_astro/PageHeader.*.css`, then
  built after and compared the two **rule-by-rule** (parsed into
  `(layer, selector) → declarations` multisets, order- and file-independent):
  **0 of 165 pairs differ.** The split changed where rules are *authored*, not
  what ships.
- The built stylesheet is 24 bytes smaller — exactly the two dropped duplicates.
- Layer order in the built CSS is unchanged: `base` → `components` → `utilities`.
  (Worth noting: Astro's minifier *strips* the bare `@layer …;` statement, so
  order in the built output comes from first appearance. The library still emits
  the statement so dev-time and unminified consumers get it explicitly.)
- axe WCAG 2.1 AA over built routes: unchanged, 0 violations.
- `tests/page-shell.test.ts`'s "Global Styles" block was repointed from
  `global.css` to `generateCss()` — it was asserting the resets lived in the
  site, which is precisely the thing this ticket changed.
- `tests/layout-integration.test.ts` gained three blocks: Base Styles contents,
  the contract utilities, and the **site ↔ library split** (asserting the site
  stylesheet contains no reset, and that the library carries no brand opinion).

## Note on "the library import"

The site's single import of the library stylesheet is unchanged and still
implicit: `astro.config.mjs` wires `layoutTokens()`, which injects
`virtual:layout-tokens.css` via `injectScript('page-ssr', …)`. `global.css` does
not `@import` anything; the library's CSS arrives through that injection. That is
the "one import" the spec settled on.
