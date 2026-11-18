# Specification: Publish `@w-n-c/layout` — Framework-Agnostic Layout Primitive Library

**Status**: `in-progress` — tickets 01, 06–07, 09 and 10 landed (the package is extracted, the contract is manifest-driven, and generated wrappers ship for both frameworks); tickets 02–05 remain

## Problem Statement

ADR 0005 made the Layout Primitive contract framework-agnostic (class + `data-*`,
structural CSS in the virtual stylesheet), and the design-system spec called the
result "portable." But "portable" was never turned into a package: the tokens,
the generator, and the `.astro` wrappers still lived inside this site's `src/`,
`package.json` had no identity, `exports`, or `files`, and the only way to
consume the CSS was through this Astro app's virtual module. The goal is to
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
5. **No framework components** — a typed **Attribute Helper** (`layout()`) is the
   typed binding to the contract, spreadable in any renderer (ADR 0007).

This site becomes the first consumer, so the library cannot drift from real use.

## Implementation Decisions

### Package identity (settled)
- **Name**: `@w-n-c/layout` (scoped, public).
- **Exports map** (two entry points):
  - `@w-n-c/layout` → tokens, the Primitive Manifest, `layout()`, `generateCss`,
    `viteLayoutTokens`, token types.
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

### Contract composition (settled)
- **The contract is `class` + `data-*`**, declared once in the Primitive Manifest
  and composed either by spreading the typed **Attribute Helper**
  `layout(primitive, options)` → `{ class, ...dataAttrs }`, or through the
  **generated wrappers** at `@w-n-c/layout/astro/*` and `@w-n-c/layout/svelte/*`.
- **The wrappers are generated, never hand-written.** `bun run wrappers` emits one
  component per primitive per framework from the manifest; `--check` fails the gate
  on drift. A hand-written wrapper is a copy of the manifest and drifts from it
  (the `Stack` default did); a generated one cannot. The generator ships in the
  library, so a consumer can emit wrappers locally instead of importing the
  subpaths. See ADR 0008.
- **One Primitive Manifest** (`packages/layout/src/primitives.ts`) declares each
  primitive's class name, `data-*` parameters, value scales, and defaults; the
  Helper's types, the wrappers, the generator's lookups, and the guardrail all
  derive from it.
- **The contract is self-defaulting**: the generator emits the `:not([data-*])`
  fallback for every manifest default (fixing the `Stack` gap).
- **Two primitives on one element are nested, not stacked.** The Helper returns a
  single `class` and a later spread's `class` key wins, so it cannot compose two
  primitives on one element; nest instead (`Box` wrapping `Sidebar`). A bare-scoped
  utility such as `data-align` still passes through a wrapper's `...rest`.
- **A primitive's behaviour lives in the library, framework-agnostic, and is
  wired per framework.** The Reel is the only primitive with contract state CSS
  cannot reach — whether a track overflows is a *measurement* — so `src/reel.ts`
  exports the observer and each wrapper wires it its own way: Astro scans the
  document on `astro:page-load`, Svelte observes the single element it renders.
  Composing raw `class` + `data-*` means calling `observeReels()` yourself.
- **Enforcement**: a `data-attributes` guardrail validates `data-*` names and
  values in `.astro` and `.svelte`; the primitive class vocabulary is permitted
  in layouts and pages.
- **Verification**: `svelte-check` (with `--fail-on-warnings`) and
  `bun run wrappers --check` join the gate so the contract's checking reaches the
  islands and the wrappers cannot drift. Behaviour that needs script — the Reel's
  overflow state — is exported framework-agnostically and wired per framework.

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
| 01 | Workspace scaffold & extract `@w-n-c/layout` (atomic; trunk green) | done |
| 02 | Split library-owned Base Styles out of `global.css` | open |
| 03 | Reconcile ADRs + glossary to the new layer homes; write the extraction ADR | open |
| 04 | Publishing: prepack literal CSS, README, browser-floor doc, publish metadata | open |
| 05 | Configurable prefix / rename support (default bare) | open (backlog) |
| 06 | Primitive Manifest & typed Attribute Helper (`layout()`); generator derives from the manifest | done |
| 07 | Retire the `.astro` wrappers; migrate consumers to the contract | done |
| 08 | Guardrail: validate `data-*` against the manifest | open |
| 09 | Type-check Svelte in the gate (`svelte-check`) | done (ADR 0003 list pending) |
| 10 | Generated framework wrappers (Astro + Svelte) | done |

## Verification

- `bun test` and `bun run build` green after every ticket; `scripts/git-guardrails.sh` clean.
- `tests/layout-integration.test.ts`, `tests/home-a11y.test.ts`, and
  `tests/guardrails.test.ts` resolve the library through the workspace package,
  not `src/`.
- The built `dist/**/*.html` routes are byte-equivalent (or visually equivalent)
  to before extraction — the move is a refactor, not a redesign.
- axe-core WCAG 2.1 AA remains 0 violations.
- `svelte-check` passes over `.svelte` files (ticket 09).
- `@w-n-c/layout` has no import of `astro/*` in its framework-agnostic entry
  points (only `@w-n-c/layout/astro` may).
