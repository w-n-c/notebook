# Specification: Publish `@w-n-c/layout` — Framework-Agnostic Layout Primitive Library

**Status**: `open` — ready for implementation

## Problem Statement

ADR 0005 made the Layout Primitive contract framework-agnostic (class + `data-*`,
structural CSS in the virtual stylesheet), and the design-system spec called the
result "portable." But "portable" was never turned into a package: the tokens,
the generator, and the `.astro` wrappers still live inside this site's `src/`,
`package.json` has no identity, `exports`, or `files`, and the only way to
consume the CSS is through this Astro app's virtual module. The goal is to
replace Tailwind permanently across many projects, so the layout system must
become a real, publishable library — with this site as its first consumer.

## Solution

Extract the framework-agnostic layer into a **bun workspace package**
`packages/layout/` named **`@w-n-c/layout`**, and rewire this site to consume it
via the workspace link (dogfooding). The package ships:

1. **Design Tokens** + the generator (`generateCss`, `viteLayoutTokens`) — the
   `@layer base`/`@layer components` stylesheet.
2. **The Layout Primitive Contract** — global class + `data-*` rules.
3. **Base Styles** — renderer-independent mechanical resets + neutral
   typographic defaults.
4. **One neutral default Theme** — a single neutral ramp + a single accent,
   system fonts, fluid type scale — documented "override `:root` to rebrand."
5. **Optional Astro wrappers** as a convenience subpath export, not the contract.

This site becomes the first consumer, so the library cannot drift from real use.

## Implementation Decisions

### Package identity (settled)
- **Name**: `@w-n-c/layout` (scoped, public).
- **Exports map** (three entry points):
  - `@w-n-c/layout` → tokens, `generateCss`, `viteLayoutTokens`, token types.
  - `@w-n-c/layout/astro` → the `.astro` Layout Primitive wrappers (typed sugar
    over the contract, not the contract).
  - The CSS: `virtual:layout-tokens.css` (Vite) and a literal
    `@w-n-c/layout/layout-tokens.css` emitted at `prepack`.
- **Topology**: bun workspace at `packages/layout/`; site consumes via workspace
  link. Separate-repo extraction is deferred until a second consumer appears.

### Deliverable split (settled)
- **Library-owned**: mechanical tokens; primitive structure; the
  `@layer base, components, utilities;` order statement; generic utilities the
  primitives lean on (`split-*`, `no-measure`, `visually-hidden`/`sr-only`); the
  mechanical resets (`box-sizing`, `border-style: solid 0`, the measure cap,
  `color-scheme`, `prefers-reduced-motion`); neutral typographic defaults.
- **Site-owned**: Home-Base taste — `article` prose rhythm, the `header h+p`
  lead-subtitle rule, `theme-light`/`theme-dark` overrides, and anything added
  later.

### Base Styles delivery (settled)
- The library is **not functional without its Base Styles**: the mechanical
  resets (`box-sizing`, `border-style: solid 0`, the measure cap) are
  load-bearing for the Layout Primitive contract. They are therefore part of the
  **core stylesheet**, not an optional artifact — `generateCss()` emits them
  into `@layer base` alongside the tokens (one import, Tailwind-style). No
  separate `base.css` subpath.

### Theming (settled)
- Default Theme is the current neutral one (one neutral ramp + one accent,
  system fonts, fluid scale). Rebranding = re-declaring `--space-*`,
  `--surface-*`, `--text-*`, `--border-*`, `--font-*` at `:root`; the cascade
  wins. No programmatic TS config API in v1.
- Adding extra ramps/roles is a ~3-line library edit (data + one line in
  `buildColorVariables`). A downstream consumer cannot add a *new* semantic role
  from config — only override existing ones — which is the trigger for a future
  config API (deferred).

### Naming (settled)
- **Default: bare class names** (`.stack`, `.switcher`, …).
- Support `generateCss({ prefix })` and, later, full renames; default stays bare.

### Browser floor (settled)
- **Baseline 2024**, set by `light-dark()` (Chrome 123 / Safari 17.5 / Firefox
  120; ~91.6% global). `:has()` (Baseline 2023) and `@layer` (Baseline 2022) are
  older. No `prefers-color-scheme` fallback. Documented in the README.

## Out of Scope

- Separate repository and npm publish automation beyond `prepack` (revisit at the
  second consumer).
- Config API for new ramps/roles; programmatic Theme authoring.
- Per-framework adapters beyond Astro (SvelteKit/Nuxt/Next injection seams).
- Animations / View Transitions (still uncemented; tracked elsewhere).
- Orama, entity ingestion, and the ADR 0002 view pipeline.

## Ticket Map

| Ticket | Title | Status |
| --- | --- | --- |
| 01 | Workspace scaffold & extract `@w-n-c/layout` (atomic; trunk green) | open |
| 02 | Split library-owned Base Styles out of `global.css` | open |
| 03 | Reconcile ADRs + glossary to the new layer homes; write the extraction ADR | open |
| 04 | Publishing: prepack literal CSS, README, browser-floor doc, publish metadata | open |
| 05 | Configurable prefix / rename support (default bare) | open (backlog) |

## Verification

- `bun test` and `bun run build` green after every ticket; `scripts/git-guardrails.sh` clean.
- `tests/layout-integration.test.ts`, `tests/home-a11y.test.ts`, and
  `tests/guardrails.test.ts` resolve the library through the workspace package,
  not `src/`.
- The built `dist/**/*.html` routes are byte-equivalent (or visually equivalent)
  to before extraction — the move is a refactor, not a redesign.
- axe-core WCAG 2.1 AA remains 0 violations.
- `@w-n-c/layout` has no import of `astro/*` in its framework-agnostic entry
  points (only `@w-n-c/layout/astro` may).
