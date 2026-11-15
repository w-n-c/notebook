# 01: Branding Design System Tokens, Fluid Scale Generator, and Box Surface Context

**What to build:** Expand `src/types/tokens.ts` and `src/plugins/layout-integration.ts` (`virtual:layout-tokens.css`) from a geometry-only token module into the complete Design System Token Engine (two-tier color/surface palette, programmatic fluid typography scale, font stacks/weights/leadings, and motion durations/easings), and add the typed `surface` prop (`data-surface`) to `Box.astro`.

**Blocked by:** None (can start immediately).

**Blocks:** 02: Semantic `@layer base` Axioms and Reusable UI Pattern Modules.

**Status:** done

## Acceptance Criteria

- [x] `src/types/tokens.ts` defines the **Two-Tier Color & Surface System**:
  - Primitive palette (`palette`) with light/dark neutral and brand accent values meeting WCAG 2.1 AA contrast ratios.
  - Semantic Surface roles (`surfaceRoles`: `'canvas' | 'surface' | 'subtle' | 'accent'`), Foreground Tones (`textTones`: `main`, `muted`, `accent`), and Border/Focus tokens (`borderTones`: `subtle`, `strong`, `accent`, `focusRing`).
- [x] `src/types/tokens.ts` defines a programmatic `fluidClamp(minPx, maxPx, minVwPx, maxVwPx)` helper and generates the **Typography System** (`typeScale` for `step--1` through `step-5`, `fontFamilies` for `sans`, `display`, `mono`, `fontWeights` for `normal`, `medium`, `semibold`, `bold`, and `lineHeights` for `tight`, `snug`, `normal`).
- [x] `src/types/tokens.ts` defines the **Motion System** (`durations`: `instant`, `fast`, `normal`, `slow`; `easings`: `out`, `in-out`, `spring`).
- [x] `src/plugins/layout-integration.ts` emits all color/surface, typography, and motion custom properties into `@layer base :root` (preserving `--bg-canvas`, `--surface-bg`, `--text-main`, `--text-muted`, and `--border-color` variables so existing consumers and contrast tests remain unbroken) and emits `.box[data-surface="..."]` lookup rules into `@layer components`.
- [x] `src/components/layout/Box.astro` remains strictly 4-sided (`padding` and `borderWidth`) and adds an optional `surface?: SurfaceRole` prop bound to `data-surface={attrValue(surface)}`.
- [x] `tests/layout-integration.test.ts` verifies all new token scales, programmatic `fluidClamp` output, `:root` variable generation, and `.box[data-surface]` rules.
