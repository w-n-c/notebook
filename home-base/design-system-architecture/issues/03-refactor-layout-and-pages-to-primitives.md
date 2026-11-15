# 03: Refactor `Layout.astro` and Page Routes to Pure Primitive & Pattern Composition

**What to build:** Refactor `src/layouts/Layout.astro` and all 5 routes in `src/pages/` (`/`, `/notes`, `/notes/[slug]`, `/projects`, `/projects/[slug]`) to compose `Layout Primitive`s (`Cover`, `Box`, `Center`, `Stack`, `Cluster`, `Grid`) and `UI Pattern`s (`SiteNav`, `PageHeader`, `SectionHeader`, `EntryCard`, `MetricList`, `TagList`), removing all `<style>` blocks and bespoke CSS classes from `src/layouts/` and `src/pages/`.

**Blocked by:** 02: Semantic `@layer base` Axioms and Reusable UI Pattern Modules.

**Blocks:** 04: Layer-Home Guardrails and Accessibility Verification.

**Status:** done

## Acceptance Criteria

- [x] `src/layouts/Layout.astro` uses `<Cover as="body" space="l" noPad>` for the `100dvh` viewport shell, `<Box as="header" padding="s" borderWidth="none">` wrapping `<Center max="wide" gutters="m"><SiteNav /></Center>`, `<Center as="main" id="main-content" max="wide" gutters="m" data-cover-center><slot /></Center>`, and `<Box as="footer" padding="m" borderWidth="none">`.
- [x] `src/layouts/Layout.astro` contains zero `<style>` blocks and zero bespoke CSS classes.
- [x] `src/pages/index.astro`, `src/pages/notes/index.astro`, and `src/pages/projects/index.astro` use `PageHeader`, `SectionHeader`, `EntryCard`, `MetricList`, and `TagList` with zero bespoke classes (`.lead`, `.card-meta`, `.surface-card`, `.card-grid`, `.notes-list`, `.social-list`, etc. all removed).
- [x] `src/pages/notes/[slug].astro` and `src/pages/projects/[slug].astro` wrap their article contents in `<Center as="article"><Stack space="l">...</Stack></Center>` using `PageHeader`, `<hr />`, `MetricList`, and semantic `<article>` prose rhythm (removing `.note-header`, `.note-body`, `.prose`, `.back-link`).
- [x] All existing route and content tests (`bun test`) and static build (`bun run build`) pass cleanly.
