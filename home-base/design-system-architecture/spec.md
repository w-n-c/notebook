# Specification: Design System Tokens, Semantic Base Axioms, UI Patterns, and Layer-Home Guardrails

**Status**: `done`

## Problem Statement

While Slice 1 established 10 Every Layout `Layout Primitive`s and the core public routes, two architectural gaps emerged:
1. **Bypassed Layout Primitives in Shell & Pages**: `src/layouts/Layout.astro` and `src/styles/global.css` wrote raw flexbox, padding, and margin rules (`body { display: flex; ... }`, `.site-header`, `.site-main`, `.site-footer`, `.note-header`, `.note-body`, `.tag`, `.metric-pill`) instead of composing existing primitives (`Cover`, `Box`, `Stack`).
2. **Missing Branding Design System & Scattered Ad-Hoc Classes**: Only geometric spacing/measures lived in `src/types/tokens.ts`. Colors, surfaces, font stacks, fluid typography scales, and motion durations/easings had no typed source of truth, leading to 18 bespoke BEM-style classes (`.lead`, `.card-meta`, `.surface-card`, `.category-label`, etc.) in `src/styles/global.css` and duplicated card/header markup across routes.

## Solution

Establish a unified, portable Design System and Component Toolkit that eliminates ad-hoc CSS across pages and layouts:
1. **Unified Branding & Layout Token Engine (`src/types/tokens.ts` → `virtual:layout-tokens.css`)**:
   - Define a **Two-Tier Color & Surface System** (Primitive Palette → Semantic Roles via `light-dark()`) for surfaces (`canvas`, `surface`, `subtle`, `accent`), foreground tones (`main`, `muted`, `accent`), borders (`subtle`, `strong`, `accent`), and focus rings.
   - Extend `Box.astro` (while keeping it strictly 4-sided per Every Layout) with a typed `surface?: SurfaceRole` prop (`data-surface`) that binds background, foreground, and border tokens contextually for its subtree.
   - Move the **Fluid Typography Scale** (`--step--1` through `--step-5`) into programmatic TypeScript computation in `src/types/tokens.ts`, alongside explicit **Font Stacks** (`--font-sans`, `--font-display`, `--font-mono`), **Font Weights** (`--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`), and **Line Heights** (`--leading-tight`, `--leading-snug`, `--leading-normal`).
   - Add **Motion & Animation Tokens** (`--duration-instant`, `--duration-fast`, `--duration-normal`, `--duration-slow`; `--ease-out`, `--ease-in-out`, `--ease-spring`) with global `@media (prefers-reduced-motion: reduce)` safety in `@layer base`.
2. **Semantic HTML Axioms in `@layer base` (Deleting `@layer components` from `global.css`)**:
   - Remove all 18 bespoke `.class` rules and the `@layer components` block from `src/styles/global.css`.
   - Bind typography, color, link, list, and divider defaults directly to semantic HTML elements in `@layer base` (`body`, `h1`–`h4`, `header :is(h1, h2) + p`, `:is(h1, h2, h3, h4) a`, `time`, `small`, `dt`, `dd`, `dl`, `code`, `pre`, `hr`, `:focus-visible`, and `:is(.cluster, .grid, .stack, .reel):is(ul, ol)`).
3. **Reusable `UI Pattern` & `UI Adapter` Modules (`src/components/`)**:
   - Extract multi-element toolkit archetypes (`SiteNav.astro`, `PageHeader.astro`, `SectionHeader.astro`, `EntryCard.astro`, `MetricList.astro`, and upgraded `TagList.astro`) so styling for each content structure lives in one singular spot.
   - Reserve `src/components/ui/` as the strict `UI Adapter` seam for `bits-ui` headless primitives.
4. **Pure Composition in `src/layouts/` and `src/pages/` + Zero-Token Layer-Home Guardrails**:
   - Refactor `Layout.astro` to use `<Cover as="body" space="l" noPad>` and borderless 4-sided `<Box>` landmarks with `SiteNav`.
   - Refactor all 5 route files in `src/pages/` to compose `Layout Primitive`s and `UI Pattern`s with zero `<style>` blocks and zero bespoke classes.
   - Enforce layer-home invariants in `bun test` and `scripts/git-guardrails.sh` (no `<style>` or inline styles in `src/pages/` & `src/layouts/`, no `@layer components` or `.class` selectors in `global.css` `@layer base`, `bits-ui` isolated to `src/components/ui/`, and DOM skeleton deduplication across pages).

## Implementation Decisions

### 1. Token Architecture (`src/types/tokens.ts` & `src/plugins/layout-integration.ts`)
- **Two-Tier Color & Surface Model**:
  - **Primitive Palette (`palette`)**: Raw hex/OKLCH scales for neutral light/dark tones and brand accent hues.
  - **Semantic Roles**:
    - Surfaces (`surfaceRoles`): `canvas`, `surface`, `subtle`, `accent` (emitting `--surface-canvas`, `--surface-elevated`, `--surface-subtle`, `--surface-accent`, plus `--bg-canvas` and `--surface-bg` aliases for backward compatibility).
    - Foreground Tones (`textTones`): `--text-main`, `--text-muted`, `--text-accent`.
    - Borders & Focus (`borderTones`): `--border-subtle` (aliased to `--border-color`), `--border-strong`, `--border-accent`, `--focus-ring`.
  - **`Box` Surface Lookup (`[data-surface]`)**:
    - `Box.astro` stays strictly 4-sided (`padding` and `borderWidth`) and adds `surface?: SurfaceRole` (`'canvas' | 'surface' | 'subtle' | 'accent'`), emitting `data-surface`.
    - `virtual:layout-tokens.css` emits `.box[data-surface="..."]` rules in `@layer components` that set `background-color`, `color`, and local `--text-main`, `--text-muted`, and `--border-color` variables.
- **Typography Tokens**:
  - Programmatic fluid clamp helper `fluidClamp(minPx, maxPx, minVwPx = 320, maxVwPx = 1440)` in `src/types/tokens.ts` generates `--step--1` through `--step-5`.
  - Font families: `--font-sans`, `--font-display`, `--font-mono`.
  - Font weights: `--font-weight-normal` (`400`), `--font-weight-medium` (`500`), `--font-weight-semibold` (`600`), `--font-weight-bold` (`700`).
  - Line heights: `--leading-tight` (`1.15`), `--leading-snug` (`1.3`), `--leading-normal` (`1.6`).
- **Motion Tokens**:
  - Durations: `--duration-instant` (`0ms`), `--duration-fast` (`120ms`), `--duration-normal` (`200ms`), `--duration-slow` (`350ms`).
  - Easings: `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), `--ease-in-out` (`cubic-bezier(0.65, 0, 0.35, 1)`), `--ease-spring` (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

### 2. Semantic Base Rules (`src/styles/global.css`)
- `@layer base` contains only `:root` fallback/color-scheme setup and semantic element selectors (no `.class` selectors):
  - `body`: `font-family: var(--font-sans); font-size: var(--step-0); line-height: var(--leading-normal); background-color: var(--bg-canvas); color: var(--text-main);`
  - `h1, h2, h3, h4`: `font-family: var(--font-display); font-weight: var(--font-weight-bold);` with `--step-4`..`--step-1` and tight/snug line heights.
  - `:is(h1, h2, h3, h4) a`: `color: inherit; text-decoration: none;` with hover/focus-visible underline (`text-underline-offset: 0.2em`).
  - `header :is(h1, h2) + p`: `font-size: var(--step-1); color: var(--text-muted);` (automatic lead subtitle styling).
  - `time, small, dt`: `font-size: var(--step--1); color: var(--text-muted);`
  - `dl, dd`: `margin: 0;` and `dd { font-weight: var(--font-weight-semibold); }`
  - `code, pre, kbd, samp`: `font-family: var(--font-mono);`
  - `hr`: `border-block-start: var(--border-thin) solid var(--border-color); inline-size: 100%; margin: 0;`
  - `:is(ul, ol)[data-space]`: `list-style: none; margin: 0; padding: 0;` (targets any `<ul/ol>` rendered by a `Layout Primitive` such as `Cluster`, `Grid`, `Stack`, or `Reel` without using `.class` selectors in `@layer base`).
  - `:focus-visible`: `outline: var(--border-thick, 2px) solid var(--focus-ring); outline-offset: 2px;`
  - `@media (prefers-reduced-motion: reduce)`: collapses `--duration-fast`, `--duration-normal`, `--duration-slow` to `0.01ms` and disables smooth scroll.
- `@layer components` is completely removed from `src/styles/global.css`.
- `@layer utilities` retains only layout splitters (`split-*` / `[data-split-*]`), measure opt-out (`no-measure` / `[data-no-measure]`), screen-reader utilities (`visually-hidden`, `sr-only`), and theme overrides (`theme-light`, `theme-dark`).

### 3. UI Patterns & Page Shell (`src/components/` & `src/layouts/Layout.astro`)
- `Layout.astro`:
  - Uses `<Cover as="body" space="l" noPad>` for the `100dvh` sticky-footer viewport shell.
  - Uses `<Box as="header" padding="s" borderWidth="none">`, `<Center as="main" id="main-content" max="wide" gutters="m" data-cover-center>`, and `<Box as="footer" padding="m" borderWidth="none">`.
  - Delegates primary brand and navigation rendering/styling to `src/components/SiteNav.astro`.
  - Contains **zero `<style>` blocks**.
- `UI Pattern` modules in `src/components/`:
  - `SiteNav.astro`: Brand link and accessible primary navigation list using `Cluster` and `split-right`.
  - `PageHeader.astro`: Semantic `<header>` wrapping `<Stack space="s">` with optional back-link/eyebrow slot, `<h1>`, optional `lead` copy, and optional metadata/actions slot.
  - `SectionHeader.astro`: `<Cluster justify="space-between" align="baseline" space="s">` with `<h2>` and trailing section link.
  - `EntryCard.astro`: `<Box as={as} padding="m" surface={surface}>` + `<Stack space="s">` rendering optional meta header row, linked heading (`h2` or `h3`), description, optional body slot, and `split-bottom` footer slot.
  - `MetricList.astro`: Renders `<dl>` metrics either as compact `<Cluster as="dl">` pills (`<Box padding="xs" surface="canvas">`) or as a `<Grid as="dl" min="xs">` stat grid (`<Box padding="s" surface="surface">`).
  - `TagList.astro`: Renders `<Cluster as="ul">` with `pill` variant items wrapped in `<Box as="li" padding="3xs" surface="subtle">`.

### 4. Layer-Home Guardrails (`tests/` & `scripts/git-guardrails.sh`)
- Enforce in `bun test` and pre-commit:
  1. Zero `<style>` blocks and zero inline `style="..."` attributes in `src/layouts/**/*.astro`, `src/pages/**/*.astro`, and `src/components/layout/*.astro` (inline styles forbidden in all three; `<style>` forbidden in `src/layouts/` and `src/pages/`).
  2. Zero `@layer components` blocks and zero `.class` selectors inside `@layer base` in `src/styles/global.css` (note: `:is(article, .prose)` is replaced by pure semantic `article` selectors in `@layer base`).
  3. Only allowed utility classes (`split-bottom`, `split-top`, `split-right`, `split-left`, `no-measure`, `visually-hidden`, `sr-only`, `theme-light`, `theme-dark`) may appear in `class="..."` attributes inside `src/pages/**/*.astro` and `src/layouts/**/*.astro`.
  4. `bits-ui` may only be imported inside `src/components/ui/**`.
  5. No multi-element DOM skeleton ($\ge 4$ nested tags) may be duplicated $\ge 3$ times across `src/pages/**/*.astro`.
