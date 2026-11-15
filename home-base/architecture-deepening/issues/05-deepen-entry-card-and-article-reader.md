# 05: Deepen the EntryCard & Article Reader UI Pattern Modules

**What to build:** Deepen `src/components/EntryCard.astro` and the reader pages so callers no longer repeat meta/footer slot plumbing, so `<Content />` no longer needs an inner `<div>` wrapper, and so unused assets are removed.

**Blocked by:** None mechanically; **deferred** from the architecture review until Tickets 01–03 land and this is explicitly scheduled.

**Blocks:** None.

**Status:** done

**Deferred:** Yes — recorded backlog from the architecture review. Do not start until 01–03 are done and this is explicitly picked up. (Picked up and completed after Tickets 01–04.)

## Context

`EntryCard.astro` forces each caller to pass equivalent meta and footer markup, which has already drifted between the home page (`src/pages/index.astro`) and the projects index (`src/pages/projects/index.astro`). The reader pages (`src/pages/notes/[slug].astro`, `src/pages/projects/[slug].astro`) wrap rendered `<Content />` in an inner `<div>`, which forces `src/styles/global.css` to carry an `article > div > * + *` prose-rhythm selector instead of a pure `article` selector.

## Acceptance Criteria

- [x] `EntryCard.astro` exposes a single interface for meta rows (date/category/tags) and footer content so `/` and `/projects` produce identical card markup without caller-side slot plumbing.
- [x] The home and projects pages no longer duplicate meta/footer markup; drift between them is eliminated.
- [x] Reader pages stop wrapping `<Content />` in an inner `<div>`, and `src/styles/global.css` drops the `article > div > * + *` leak in favor of a pure semantic `article` selector.
- [x] Locally-unused assets are deleted after confirming zero references: `src/assets/astro.svg`, `src/assets/background.svg`, and the already-removed `src/components/Welcome.astro` (confirm/deletion via `rg`).
- [x] `bun test` and `bun run build` pass; rendered reader/entry content is visually equivalent (verified by existing route/a11y tests).
