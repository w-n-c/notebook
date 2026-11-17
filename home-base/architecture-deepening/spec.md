# Specification: Deepening the Design-System, Guardrail, and Content Domain Modules

**Status**: `done`

## Problem Statement

A fresh-context architecture review of the current tree surfaced five clusters where related concepts are spread thin across many small modules, forcing callers or tests to know internal details. Two active symptoms prove the cost is already real:

1. **Design tokens & virtual stylesheet are shallow to test and duplicated at the edges.** `src/plugins/layout-integration.ts` exports 21 internal `build*` builders purely so `tests/layout-integration.test.ts` can assert on them, while Layout Primitive default values are hardcoded independently in `src/lib/tokens.ts` (implicitly), `src/plugins/layout-integration.ts` (lookup filters), and the 10 `src/components/layout/*.astro` frontmatter blocks. Those three copies can drift (e.g. `Sidebar.astro`'s `contentMin = '1/2'` and `Switcher.astro`'s defaults must be kept in lockstep with the generated `[data-*]` lookup tables by hand).
2. **Guardrail verification is split across a bash script and a test file that check different subsets of the same invariants.** `scripts/git-guardrails.sh` enforces only 2 of the ADR 0003 architectural rules on staged index contents (plus an untested secret regex), while `tests/page-shell.test.ts` enforces all of them against working-tree files and spawns temporary git repos to exercise the bash script. There is no single pure function describing "what the guardrails are".
3. **Content schemas, queries, and site metadata are spread across four shallow modules.** `src/content.config.ts`, `src/schemas/content.ts`, `src/lib/content.ts`, and `src/config/site.ts` each hold a fragment. `src/lib/content.ts` top-level-imports `astro:content`, which makes draft filtering, `pubDate` sorting, `formatDate`, and featured selection impossible to unit-test without running a full `astro build`. Routes re-implement `.filter((p) => p.data.featured)`, `.slice(0, 3)`, and inconsistent `<title>` separators (`—` vs `|`).
4. **Built-route & accessibility tests drift.** `ensureBuilt()` is a temporal ordering constraint two `describe` blocks forgot to call, and route tests duplicate `dist/` path plumbing, leave `happy-dom` windows unclosed, and repeat attribute-order regexes.
5. **Entry cards and article readers force boilerplate and leak styles.** `EntryCard.astro` makes callers repeat meta/footer slot plumbing (drifting between `/` and `/projects`), and reader pages wrap `<Content />` in an inner `<div>` that leaks `article > div > * + *` into `global.css`.

This spec executes Candidates 1–3 now and records Candidates 4–5 as deferred backlog tickets so nothing from the review is lost.

## Solution

Deepen the three highest-leverage clusters into single, testable domain modules, and capture the remaining two as backlog:

- **Ticket 01 — Token & Virtual Stylesheet module**: keep the whole token system co-located in `src/lib/tokens.ts` (path unchanged), add one `primitiveDefaults` source of truth, move the CSS-variable naming helpers into the integration, narrow `src/plugins/layout-integration.ts` to a 2-export public interface (`generateCss()`, `layoutTokens()`), and rewrite the test through that interface.
- **Ticket 02 — Guardrail verification module**: extract a pure `scripts/lib/guardrails.ts` that evaluates all ADR 0003 rules over an explicit `{ files, diff }` input, then drive it from two thin adapters (pre-commit bash over staged index contents, and `tests/guardrails.test.ts` over in-memory fixtures + the repo tree).
- **Ticket 03 — Content & site metadata module**: consolidate schemas, queries, date formatting, and site metadata into a single `src/lib/content.ts` with an injectable entry seam so every pure behavior is unit-testable in `bun test`; keep `src/content.config.ts` as the thin Astro loader adapter.
- **Tickets 04–05 — recorded backlog**: built-route/a11y test harness deepening and EntryCard/article-reader UI pattern deepening (including deleting unused `src/assets/*.svg`).

## Implementation Decisions

### Candidate 1 / Ticket 01 — Token & Virtual Stylesheet Module

> **Amendment (post-implementation):** the original decision was **Option A1** (keep the file at `src/types/tokens.ts` to avoid ADR/import churn). On reflection the file is mostly runtime values and helpers (`spaces`, `palette`, `primitiveDefaults`, `fluidClamp`, `attrValue`, `attrBool`), so `types/` was a misnomer. We adopted **Option A2**: the file moved intact to `src/lib/tokens.ts` and `src/types/` was deleted, leaving the three deep domain modules side by side (`lib/tokens.ts`, `lib/content.ts`, `lib/guardrails.ts`). The cohesion rule below (do not split `as const` scales from their derived types) is unchanged and is what forbids splitting, not moving.

- **The whole token file stays in one co-located module (`src/lib/tokens.ts`).** TypeScript best practice is to keep each `as const` runtime scale and its derived type (`keyof typeof …`) adjacent; splitting types from runtime values would make one file a shallow pass-through whose key list must be duplicated. At ~270 lines the file still fits one read and stays the single file to audit for re-theming.
- **Move `measureVarName` and `surfaceVarName` out of `src/lib/tokens.ts`** and into `src/plugins/layout-integration.ts`. They are CSS-variable naming details used only when synthesizing the virtual stylesheet and are not part of the token contract.
- **Add `primitiveDefaults` to `src/lib/tokens.ts`** as the single source of truth for Layout Primitive defaults:
  - `boxBorderWidth: 'thin'`, `centerMax: 'measure'`, `clusterJustify: 'flex-start'`, `clusterAlign: 'flex-start'`, `sidebarContentMin: '1/2'`, `switcherThreshold: 'measure'`, `switcherLimit: 4`, `coverMinHeight: 'full'`, `frameRatio: '16:9'`, `gridMin: 'm'`, `reelItemWidth: 'auto'`, `reelHeight: 'auto'`.
  - Each `src/components/layout/*.astro` frontmatter destructures its prop default from `primitiveDefaults` (e.g. `contentMin = primitiveDefaults.sidebarContentMin`), and the existing `attrValue(default, default)` omission behavior is preserved.
  - `generateCss()` derives its lookup tables and base-class declarations from `primitiveDefaults`, so the "default" value is emitted once rather than filtered by literal comparison in both the `.astro` files and the generator.
- **Narrow the public interface of `src/plugins/layout-integration.ts`** to exactly two exports: `generateCss()` and `layoutTokens()`. All `build*` helpers become private (non-exported) and are table-driven from `primitiveDefaults` + the token scales.
- **Rewrite `tests/layout-integration.test.ts`** to assert strictly through `generateCss()` and `layoutTokens()` (parse the returned CSS string and assert rules/variables), plus parity assertions that each `.astro` primitive default equals `primitiveDefaults`. No test imports of internal `build*` functions remain.

### Candidate 2 / Ticket 02 — Guardrail Verification Module (Option A)

- **New pure module `scripts/lib/guardrails.ts`.** Public interface:
  ```ts
  export interface GuardrailFile { path: string; content: string }
  export interface GuardrailViolation { rule: GuardrailRule; path: string; message: string }
  export function verifyGuardrails(input: { files: GuardrailFile[]; diff?: string }): GuardrailViolation[]
  export const GUARDRAIL_RULES
  export const ALLOWED_UTILITY_CLASSES
  export function extractLayerBlock(css: string, layer: string): string | null
  export function extractSubtreeFingerprints(astroSource: string, minDepth?: number): string[]
  ```
  It is free of `node:fs`, `node:child_process`, and Astro imports so it runs in tests and in the pre-commit adapter. (The originally sketched `verifyRepoTree(root)` was dropped because it would have required `node:fs`; adapters collect the file list instead.)
- **Rules covered by the module** (all of ADR 0003 §2 + §1 secret scanning), keyed by a stable `rule` id:
  1. `secret-pattern` — OpenAI/Anthropic/Gemini (`AIzaSy…`)/AWS (`AKIA…`)/generic bearer patterns in the provided `diff` (or file contents when no diff is supplied).
  2. `inline-style` — inline `style="…"` in `src/components/layout/**/*.astro`, `src/layouts/**/*.astro`, `src/pages/**/*.astro`.
  3. `style-block` — `<style>` blocks in `src/layouts/**/*.astro` and `src/pages/**/*.astro`.
  4. `utility-class` — non-utility `class="…"` values in `src/layouts/**/*.astro` and `src/pages/**/*.astro` (allow-list preserved from today: `split-bottom`, `split-top`, `split-right`, `split-left`, `no-measure`, `visually-hidden`, `sr-only`, `theme-light`, `theme-dark`), and dynamic `class={…}` / `class:list={…}`.
  5. `global-css-layer` — no `@layer components` block and no `.class` selectors inside `@layer base` in `src/styles/global.css`.
  6. `bits-ui-isolation` — `bits-ui` imports only under `src/components/ui/`.
  7. `dom-duplication` — no multi-element DOM skeleton (≥ 4 nested tags) repeated ≥ 3 times across `src/pages/**/*.astro` (reuse the existing fingerprint walker).
- **Thin adapter — pre-commit `scripts/git-guardrails.sh`**: gather staged index contents via `git show ":$file"` for changed `src/**` files, pass them plus `git diff --cached` to the verifier through a small `bun` entry point, fail on any violation, then run `bun test`. This replaces the bash `grep` implementation of rules 2–3 and adds rules 1, 4, 5, and 6 to the commit gate.
- **Thin adapter — `tests/guardrails.test.ts`**: unit-test every rule with fast in-memory fixtures (including secret detection, which today has no test) and additionally call `verifyRepoTree(ROOT)` to assert the live tree is clean.
- **Slim `tests/page-shell.test.ts`** to focus on the layout shell itself (`global.css` semantic axioms + `Layout.astro` built output), delegating architectural invariant assertions to `tests/guardrails.test.ts`. Remove the temp-git-repo subprocess tests for the bash script; the verifier already has direct fixture coverage.

### Candidate 3 / Ticket 03 — Content & Site Metadata Module (Option A)

- **Consolidate into `src/lib/content.ts`** and delete `src/schemas/content.ts` and `src/config/site.ts`:
  - Schemas: `notesSchema`, `NoteFrontmatter`, `PROJECT_CATEGORIES`, `projectSchema`, `Project`, `ProjectCategory`, `CATEGORY_LABELS`.
  - Site metadata: `SocialLink`, `SiteConfig`, `siteConfig`, plus a new `formatPageTitle(pageTitle?: string)`.
  - Dates/queries: `formatDate`, `getPublishedNotes`, `getRecentNotes(limit)`, `getPublishedProjects`, `getFeaturedProjects`.
- **Injectable entry seam.** Every query takes an optional `entries` argument:
  ```ts
  export async function getPublishedNotes(entries?: CollectionEntry<'notes'>[]): Promise<CollectionEntry<'notes'>[]>
  ```
  `astro:content`'s `getCollection` is loaded only via `await import('astro:content')` inside the query when `entries` is omitted. There is **no top-level `astro:content` import**, so `bun test` can exercise draft filtering, `pubDate` sorting, featured filtering, `formatDate`, and `formatPageTitle` with plain fixtures.
- **Keep `src/content.config.ts` as the thin Astro loader adapter**, importing `notesSchema`/`projectSchema` from `./lib/content`.
- **Unify page titles** through `formatPageTitle`: the canonical separator is the em dash (`—`), e.g. `formatPageTitle('Notes') === 'Notes — Home Base'`, and the home page uses `formatPageTitle()` / `siteConfig.title` with no suffix.
- **Update consumers**: `src/layouts/Layout.astro` (defaults derived from `siteConfig`), `src/components/SiteNav.astro` if it reads site metadata, and all `src/pages/**/*.astro` routes to import from `../lib/content` (or `../../lib/content`) and use `getFeaturedProjects()`, `getRecentNotes(3)`, and `formatPageTitle()`. Update test imports in `tests/notes.test.ts`, `tests/projects.test.ts`, and `tests/home-a11y.test.ts`.

### Candidates 4 & 5 — Recorded Backlog (Tickets 04–05)

- **Ticket 04** records deepening the built-route/a11y harness: make `ensureBuilt()` impossible to forget (auto-run in a `beforeAll` helper or build once at module scope), centralize `dist/` path resolution, close `happy-dom` windows, and share attribute-order-insensitive HTML matchers.
- **Ticket 05** records deepening `EntryCard.astro` + reader pages so callers do not repeat meta/footer slot plumbing, and so `<Content />` no longer needs an inner `<div>` wrapper (removing the `article > div > * + *` leak from `global.css`). Also delete unused `src/assets/astro.svg` and `src/assets/background.svg` (and the already-removed `src/components/Welcome.astro`) if confirmed dead.

## Ticket Map

| Ticket | Candidate | Title | Status |
| --- | --- | --- | --- |
| 01 | 1 | Deepen the Design Token & Virtual Stylesheet Module | open |
| 02 | 2 | Unify the Guardrail Verification Module | open |
| 03 | 3 | Consolidate the Content & Site Metadata Domain Module | open |
| 04 | 4 | Deepen the Built-Route & Accessibility Test Harness | open (deferred) |
| 05 | 5 | Deepen the EntryCard & Article Reader UI Pattern Modules | done |

## Verification

- `bun test` and `bun run build` pass with 100% green assertions after each ticket.
- `scripts/git-guardrails.sh` exits non-zero for a staged violation of any of the seven guardrail rules and zero for the clean tree.
- All three guest modules remain importable from their existing conventional paths (`src/lib/tokens.ts`, `scripts/lib/guardrails.ts`, `src/lib/content.ts`); no consumer imports a deleted module.
