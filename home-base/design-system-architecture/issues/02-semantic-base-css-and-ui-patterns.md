# 02: Semantic `@layer base` Axioms and Reusable UI Pattern Modules

**What to build:** Replace the 18 ad-hoc classes in `src/styles/global.css` (`@layer components`) with pure semantic HTML element rules in `@layer base` and reusable `UI Pattern` modules in `src/components/` (`SiteNav.astro`, `PageHeader.astro`, `SectionHeader.astro`, `EntryCard.astro`, `MetricList.astro`, and updated `TagList.astro`) so every content type has a single spot for styling and structure before refactoring pages.

**Blocked by:** 01: Branding Design System Tokens, Fluid Scale Generator, and Box Surface Context.

**Blocks:** 03: Refactor `Layout.astro` and Page Routes to Pure Primitive & Pattern Composition.

**Status:** done

## Acceptance Criteria

- [x] `src/styles/global.css` deletes its hardcoded `--step-*` and color definitions (now sourced from `virtual:layout-tokens.css`) and deletes the entire `@layer components` block.
- [x] `src/styles/global.css` `@layer base` uses only element/attribute selectors (zero `.class` selectors) to style:
  - `body` (`--font-sans`, `--step-0`, `--leading-normal`, `--bg-canvas`, `--text-main`).
  - `h1`–`h4` (`--font-display`, `--step-4`..`--step-1`, `--leading-tight` / `--leading-snug`) and `:is(h1, h2, h3, h4) a` (`color: inherit; text-decoration: none` with hover/focus underline).
  - `header :is(h1, h2) + p` (`--step-1`, `--text-muted` for lead subtitles).
  - `time, small, dt` (`--step--1`, `--text-muted`) and `dl, dd` (`margin: 0`, `dd` semibold).
  - `code, pre, kbd, samp` (`--font-mono`), `hr` (thin subtle block-start border), `:is(ul, ol)[data-space]` (`list-style: none; margin: 0; padding: 0`), `article > * + *` prose vertical rhythm, `:focus-visible` focus ring, and `@media (prefers-reduced-motion: reduce)` duration collapse.
- [x] Create `src/components/SiteNav.astro` encapsulating the brand link and primary navigation `Cluster` + active/hover link states.
- [x] Create `src/components/PageHeader.astro` composing `Stack` and `<header>` for page/article titles, optional back-link/eyebrow, optional lead subtitle, and metadata/action slots.
- [x] Create `src/components/SectionHeader.astro` composing `Cluster` (`justify="space-between" align="baseline"`) for section `<h2>` headings and trailing section links.
- [x] Create `src/components/EntryCard.astro` composing `<Box surface={surface} padding="m">` and `<Stack space="s">` for Note and Project summary cards (meta row, linked heading, description, optional body slot, `split-bottom` footer).
- [x] Create `src/components/MetricList.astro` rendering `<dl>` metrics in either `pill` (`Cluster` of `<Box padding="xs" surface="canvas">`) or `grid` (`Grid` of `<Box padding="s" surface="surface">`) variants.
- [x] Update `src/components/TagList.astro` to use `<Box as="li" padding="3xs" surface="subtle">` for the `pill` variant instead of `.tag`.
