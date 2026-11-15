# 01: Deepen the Design Token & Virtual Stylesheet Module

**What to build:** Make `src/lib/tokens.ts` the single source of truth for design tokens and Layout Primitive defaults, move the CSS-variable naming helpers (`measureVarName`, `surfaceVarName`) into `src/plugins/layout-integration.ts`, narrow that module's public interface to `generateCss()` + `layoutTokens()`, and rewrite `tests/layout-integration.test.ts` to test through that interface only.

**Blocked by:** None (can start immediately).

**Blocks:** None. Independent of 02 and 03.

**Status:** done

## Context

`src/plugins/layout-integration.ts` currently exports 21 `build*` functions solely so tests can assert on internals. Meanwhile each Layout Primitive default is written three times: in the `.astro` frontmatter, in the generator's `.filter(([k]) => k !== '<default>')` comparisons, and implicitly via `attrValue(value, '<default>')`. The copies can silently drift (e.g. `Sidebar.astro` `contentMin = '1/2'`, `Switcher.astro` `threshold = 'measure'` / `limit = 4`).

The token file stays as one co-located module (each `as const` scale adjacent to its derived `keyof typeof` type, and the ~270-line file remains a single audit point); only the CSS-variable naming helpers leave the file. **Amendment:** it now lives at `src/lib/tokens.ts` (moved intact from `src/types/tokens.ts`, which was deleted) so the three deep domain modules sit side by side in `src/lib/`; the `types/` directory was a misnomer for a file of runtime values and helpers.

## Acceptance Criteria

- [x] `src/lib/tokens.ts` exports a single `primitiveDefaults` constant covering every Layout Primitive default:
  - `boxBorderWidth: 'thin'`, `centerMax: 'measure'`, `clusterJustify: 'flex-start'`, `clusterAlign: 'flex-start'`, `sidebarContentMin: '1/2'`, `switcherThreshold: 'measure'`, `switcherLimit: 4`, `coverMinHeight: 'full'`, `frameRatio: '16:9'`, `gridMin: 'm'`, `reelItemWidth: 'auto'`, `reelHeight: 'auto'`.
- [x] Every `src/components/layout/*.astro` frontmatter derives its prop default from `primitiveDefaults` (e.g. `contentMin = primitiveDefaults.sidebarContentMin`) and preserves the existing `attrValue(default, default)` omission behavior.
- [x] `measureVarName` and `surfaceVarName` are removed from `src/lib/tokens.ts` and defined privately inside `src/plugins/layout-integration.ts`.
- [x] `src/plugins/layout-integration.ts` exports exactly `generateCss` and `layoutTokens`; all `build*` helpers are non-exported and table-driven from `primitiveDefaults` + the token scales.
- [x] `generateCss()` emits `@layer base :root` variables and `@layer components` lookup rules byte-for-byte equivalent to the current output for every existing token and default (no visual/behavioral regression).
- [x] `tests/layout-integration.test.ts` imports only `generateCss` and `layoutTokens` from the integration and asserts through the generated CSS string:
  - all spacing/measure/border/color/typography/motion custom properties are present;
  - each lookup table (`[data-space]`, `[data-max]`, `[data-border]`, `[data-side-width]`, `[data-content-min]`, `[data-threshold]`, `[data-limit]`, `[data-min-height]`, `[data-ratio]`, `[data-min]`, `[data-item-width]`, `[data-height]`, `.box[data-surface]`) is emitted correctly;
  - parity: each Layout Primitive's frontmatter default equals the corresponding `primitiveDefaults` entry.
- [x] `bun test` and `bun run build` pass with 100% green assertions.
