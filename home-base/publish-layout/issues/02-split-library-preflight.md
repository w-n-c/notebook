# 02 — Split Library-Owned Preflight Out of `global.css`

**What to build:** Separate the renderer-independent Preflight from the site's Home-Base taste. The library owns the mechanical resets and neutral typographic element defaults; this site keeps only its own flavor. Decide and implement the Preflight delivery shape (see spec Open Questions).

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** 04: Publishing (README documents Preflight).

**Status:** `open`

## Acceptance Criteria

- [ ] Preflight (mechanical resets + neutral typographic defaults) is generated/shipped by `@w-n-c/layout`, not hand-written in the site's `global.css`.
- [ ] The Preflight delivery shape is decided and documented: either `generateCss()` emits it into `@layer base` by default, or the package exposes a separate `preflight.css` / `generatePreflight()` subpath. Record the choice and the opt-out in the spec's Open Questions (resolve it).
- [ ] The site's `global.css` contains only site-owned bindings (`article` prose rhythm, `header h+p` lead subtitle, `theme-light`/`theme-dark`) plus the Preflight import — no duplicated resets.
- [ ] `@layer base, components, utilities;` order is emitted once, by the library.
- [ ] `bun test`, `bun run build`, axe WCAG AA, and `scripts/git-guardrails.sh` all remain green; the weird `max-inline-size: var(--max, var(--measure))` measure cap behaves identically.
