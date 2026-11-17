# 02 — Split Library-Owned Base Styles Out of `global.css`

**What to build:** Separate the renderer-independent Base Styles from the site's Home-Base taste. The library owns the mechanical resets and neutral typographic element defaults; this site keeps only its own flavor. Delivery is settled — Base Styles ship inside the core stylesheet (see the spec's "Base Styles delivery").

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** 04: Publishing (README documents Base Styles).

**Status:** `open`

## Acceptance Criteria

- [ ] Base Styles (mechanical resets + neutral typographic defaults) are generated/shipped by `@w-n-c/layout`, not hand-written in the site's `global.css`.
- [ ] `generateCss()` emits Base Styles into `@layer base` alongside the tokens (one import); no separate `base.css` / `generateBase()` subpath.
- [ ] The site's `global.css` contains only site-owned bindings (`article` prose rhythm, `header h+p` lead subtitle, `theme-light`/`theme-dark`) plus the library import — no duplicated resets.
- [ ] `@layer base, components, utilities;` order is emitted once, by the library.
- [ ] `bun test`, `bun run build`, axe WCAG AA, and `scripts/git-guardrails.sh` all remain green; the weird `max-inline-size: var(--max, var(--measure))` measure cap behaves identically.
