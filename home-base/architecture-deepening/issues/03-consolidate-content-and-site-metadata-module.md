# 03: Consolidate the Content & Site Metadata Domain Module

**What to build:** Consolidate content schemas, collection queries, date formatting, and site metadata into a single deep, unit-testable `src/lib/content.ts`; delete `src/schemas/content.ts` and `src/config/site.ts`; keep `src/content.config.ts` as a thin Astro loader adapter; and update routes/components/tests to consume the unified module (including a single `<title>` separator).

**Blocked by:** None (can start immediately).

**Blocks:** None. Independent of 01 and 02.

**Status:** done

## Context

The content domain is split across `src/content.config.ts`, `src/schemas/content.ts`, `src/lib/content.ts`, and `src/config/site.ts`. `src/lib/content.ts` top-level-imports `astro:content`, so draft filtering, `pubDate` sorting, `formatDate`, and featured selection cannot be unit-tested without a full build. Routes repeat `.filter((p) => p.data.featured)`, `.slice(0, 3)`, and use inconsistent title separators (`Notes — Home Base` vs `Projects | Home Base`).

## Acceptance Criteria

- [x] `src/lib/content.ts` exports schemas and types: `notesSchema`, `NoteFrontmatter`, `PROJECT_CATEGORIES`, `projectSchema`, `Project`, `ProjectCategory`, `CATEGORY_LABELS`.
- [x] `src/lib/content.ts` exports site metadata: `SocialLink`, `SiteConfig`, `siteConfig`, and `formatPageTitle(pageTitle?: string)`.
- [x] `src/lib/content.ts` exports date/query helpers: `formatDate`, `getPublishedNotes`, `getRecentNotes(limit)`, `getPublishedProjects`, `getFeaturedProjects`.
- [x] Every query accepts an optional entries array (injectable seam):
  ```ts
  export async function getPublishedNotes(entries?: CollectionEntry<'notes'>[]): Promise<CollectionEntry<'notes'>[]>
  ```
  `astro:content`'s `getCollection` is loaded **only** via `await import('astro:content')` inside the query when `entries` is omitted; there is no top-level `astro:content` import in the module (`import type` for `CollectionEntry` is acceptable).
- [x] `src/schemas/content.ts` and `src/config/site.ts` are deleted; no file imports them.
- [x] `src/content.config.ts` remains a thin loader adapter importing `notesSchema`/`projectSchema` from `./lib/content`.
- [x] `formatPageTitle` is the single title formatter and uses the em dash: `formatPageTitle('Notes') === 'Notes — Home Base'`; `formatPageTitle()` (or the home page) yields the bare `siteConfig.title`.
- [x] `src/layouts/Layout.astro` derives its default `title`/`description` from `siteConfig`; `src/components/SiteNav.astro` (or any other consumer of site metadata) is updated.
- [x] All `src/pages/**/*.astro` routes import from `../lib/content` / `../../lib/content`, use `getFeaturedProjects()` and `getRecentNotes(3)` instead of inline filters/slices, and use `formatPageTitle()` for `<title>`.
- [x] `tests/notes.test.ts`, `tests/projects.test.ts`, and `tests/home-a11y.test.ts` import schemas/`siteConfig` from `src/lib/content.ts` (not the deleted paths).
- [x] New `bun test` coverage exercises the pure seam without a build: draft filtering, descending `pubDate` sort, `featured` filtering, `getRecentNotes(limit)`, `formatDate` (short/long, UTC), and `formatPageTitle`.
- [x] `bun test` and `bun run build` pass with 100% green assertions.
