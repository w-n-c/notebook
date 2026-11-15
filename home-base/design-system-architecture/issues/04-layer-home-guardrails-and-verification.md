# 04: Layer-Home Guardrails and Accessibility Verification

**What to build:** Add fast, zero-LLM-token mechanical guardrails in `tests/` and `scripts/git-guardrails.sh` that enforce layer homes (tokens in `src/types/tokens.ts`, semantic element rules in `src/styles/global.css` `@layer base`, component styles in `src/components/`, `bits-ui` isolated in `src/components/ui/`, and pure composition without `<style>` blocks, bespoke classes, or structural DOM duplication in `src/layouts/` and `src/pages/`).

**Blocked by:** 03: Refactor `Layout.astro` and Page Routes to Pure Primitive & Pattern Composition.

**Blocks:** None.

**Status:** done

## Acceptance Criteria

- [x] `scripts/git-guardrails.sh` and `tests/page-shell.test.ts` reject:
  1. Inline `style="..."` attributes in `src/components/layout/*.astro`, `src/layouts/**/*.astro`, and `src/pages/**/*.astro`.
  2. Any `<style>` block in `src/layouts/**/*.astro` and `src/pages/**/*.astro`.
- [x] Automated architecture guardrail tests verify:
  1. `src/styles/global.css` contains no `@layer components` block and no `.class` selectors inside `@layer base`.
  2. `src/layouts/**/*.astro` and `src/pages/**/*.astro` only use allowed `@layer utilities` classes (`split-bottom`, `split-top`, `split-right`, `split-left`, `no-measure`, `visually-hidden`, `sr-only`, `theme-light`, `theme-dark`) when a `class` attribute is present.
  3. `bits-ui` is never imported outside `src/components/ui/**`.
  4. No multi-element DOM skeleton ($\ge 4$ nested tags) is duplicated $\ge 3$ times across `src/pages/**/*.astro`.
- [x] Contrast-ratio and `axe-core` WCAG 2.1 AA tests in `tests/home-a11y.test.ts` validate all semantic color/surface pairs from `src/types/tokens.ts` and verify 0 accessibility violations across all built `dist/**/*.html` routes.
- [x] `bun test` and `bun run build` pass with 100% green assertions.
