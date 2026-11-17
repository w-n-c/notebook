# Specification: Site Shell, Content Collections, and Accessibility Gates

**Status**: `done`

## Problem Statement

The developer home base currently contains a robust set of 10 Every Layout primitives and virtual tokens, but lacks a coherent global site layout, structured content collections for notes and project case studies, and accessibility/type-check quality gates. Without these foundational elements, writing content or layering on the interactive Hero and hybrid search engine would lead to fractured layouts and schema drift.

## Solution

Deliver the baseline public web experience:
1. Evolve the global layout with responsive navigation, semantic document structure, and dark/light color scheme support using our existing Every Layout primitives.
2. Establish Astro Content Collections for Notes and Projects with strict validation schemas.
3. Build the core public routes: Home, Notes index + note entries, and Projects index + project case studies.
4. Integrate automated accessibility testing gates and continuous verification into the build pipeline.

## User Stories

1. As a site visitor, I want a persistent, responsive navigation bar, so that I can quickly transition between Home, Notes, and Projects on any screen size.
2. As a site visitor, I want the website to seamlessly honor my system color-scheme preference (dark/light), so that reading is comfortable across environments.
3. As a reader, I want to browse an index of technical writing and notes ordered chronologically, so that I can discover articles and thoughts.
4. As a reader, I want to read a full note or case study constrained to a comfortable typographic measure, so that long-form reading does not cause eye strain.
5. As a recruiter or engineering manager, I want to view a grid of production systems case studies with metrics, architectural tags, and links to source code, so that I can evaluate engineering capabilities.
6. As a reader using assistive technology (screen reader or keyboard navigation), I want all pages to follow strict WCAG 2.1 AA accessibility standards, so that navigation and content consumption are fully barrier-free.
7. As an author, I want markdown notes to be validated against a strict schema during compilation, so that typos in frontmatter or missing publication dates never break production builds.
8. As a developer, I want all page routes and `Layout Primitive`s to be strictly typed and checked via continuous verification, so that regressions are caught before deployment.

## Implementation Decisions

### Page Shell & Navigation
- Rewrite `src/layouts/Layout.astro` to wrap page content inside a responsive semantic structure, moving the `src/styles/global.css` import into `Layout.astro` and removing its unlayered `<style>` block.
- Navigation header uses the Cluster `Layout Primitive` with auto-margin splitters (`split-right`) to align primary branding and navigation links.
- In `src/styles/global.css`:
  - Apply `background-color: var(--bg-canvas); color: var(--text-main);` and standard typography tokens to `body`.
  - Exempt semantic container tags (`section, article, aside, ul, ol`) alongside `html, body, div, header, nav, main, footer` from the universal `65ch` measure cap so polymorphic `Layout Primitive`s (e.g. `<Grid as="ul">`, `<Cover as="section">`) expand to their container.
  - Provide vertical spacing rhythm for rendered markdown prose and `pre { overflow-x: auto; max-inline-size: 100%; }` so wide code blocks do not overflow mobile viewports.

### Content Collections Architecture
- Use Astro 7's Content Layer API (`src/content.config.ts` with `glob()` loaders, `entry.id`, and `render(entry)` from `astro:content`).
- Export pure Zod schemas from a standalone `src/schemas/content.ts` (importing `z` from `astro/zod`) so both `src/content.config.ts` and `bun test` unit tests share the exact same validation contracts without booting Vite.
- **Notes Collection**:
  - Schema requires `title`, `description`, `pubDate`, `tags` (array of strings), `draft` (boolean, default `false`), and an optional `canonicalUrl`.
  - Content lives as markdown/MDX files, filtered to exclude `draft: true` in public routes.
  - Dynamically generates single-entry routes matching each entry's `id`.
- **Projects Collection**:
  - Schema requires `title`, `description`, `pubDate` (`z.coerce.date()`), `category` (`z.enum(['distributed-systems', 'cloud-infrastructure', 'ai-engineering'])`), `tags`, `featured` (boolean flag), `draft` (boolean, default `false`), optional `metrics` (`z.record(z.string(), z.string())`), and optional `repoUrl`.
  - Case study entries are presented using the Grid and Box `Layout Primitive`s.

### Layout Contract & Component Standards
- Every page template must primarily use our Every Layout primitives (Stack, Box, Center, Cluster, Sidebar, Switcher, Cover, Frame, Grid, Reel) for flow and containment.
- If existing primitives prove insufficient for a layout concern, new primitives can be added following the same tokenized patterns. If 3 or more repetitions of the exact same layout composition pattern appear across the codebase, extract them into a dedicated composed component.
- The "zero inline styles" rule applies strictly to `Layout Primitive`s (`src/components/layout/*.astro`) so that higher-level display components retain the ability to override styles with inline declarations when no clean alternative exists. Display components should only use inline styles when the architectural complexity of an alternative outweighs the benefit.

### Quality Gates & Build Verification
- Run `axe-core` with `happy-dom` inside `bun test` against built `dist/**/*.html` routes to verify 0 WCAG 2.1 AA structural/ARIA violations, paired with a deterministic contrast-ratio unit test against the hex color tokens in `src/styles/global.css`.
- Verification gate enforces `bun test` and `bun run build`. `astro check` is temporarily deferred until Astro's new type-checker releases with support for newer TypeScript versions (re-enable once available).
- Pre-commit hook (`scripts/git-guardrails.sh`) inspects staged index contents (`git show ":$file"`) rather than working-tree files.

## Testing Decisions

- **What makes a good test**: Tests must verify externally observable behaviors—such as validating that invalid frontmatter rejects compilation with meaningful schema errors, that rendered pages provide semantic ARIA landmarks and sufficient color contrast, and that layout routes compile without broken references. Tests must not assert on internal variable naming or private file structure.
- **Modules to be tested**:
  - Content collection schemas (Zod frontmatter validation).
  - Page routes and layout templates (DOM structure, title/meta output, accessibility violations).
  - Pre-commit hook and verification harness.
- **Prior art in codebase**: `tests/layout-integration.test.ts` provides the pattern for testing token generation, cascade layers, and Astro integration hooks.

## Out of Scope

- The interactive HeroThoughts hero — the side-profile head silhouette with prompt and suggestion bubbles (deferred to Slice 2).
- Hybrid vector/BM25 search engine and Orama integration (deferred to Slice 3).
- ATProto decentralized feed ingestion and live notes sync (deferred to Milestone 2).
- Obsidian staging and automated agent scrubbing scripts (deferred to Slice 4).
- Serverless LLM synthesis endpoints and private notes authentication (deferred to Slice 5).

## Further Notes

All styling must continue to be driven through virtual layout tokens and cascade layers without re-introducing separate static CSS files or inline style hacks.
