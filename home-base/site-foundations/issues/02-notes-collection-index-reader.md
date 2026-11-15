# 02: Notes Content Collection with Index and Reader Route

**What to build:** A full vertical slice for technical writing—an Astro Content Collection with strict Zod validation, representative seed notes from architectural discussions, a chronological `/notes` listing view, and a `/notes/[slug]` reader view capped to a comfortable typographic measure.

**Blocked by:** 01: Global Page Shell, Navigation, and Theme Container.

**Status:** done

- [x] `notes` collection configured via Astro 7 Content Layer API (`src/content.config.ts` with `glob()` loader, `entry.id`, `render(entry)`) backed by a shared Zod schema in `src/schemas/content.ts` (`title`, `description`, `pubDate`, `tags`, `draft` defaulting to `false`, optional `canonicalUrl`).
- [x] At least 2 seed technical notes included in the collection (e.g. Layout Tokens and Sovereign Open Web).
- [x] `/notes` filters out `draft: true` entries and displays notes sorted by publication date with title, `description`, date, and tag metadata.
- [x] `/notes/[slug]` dynamically renders markdown body wrapped inside `<Center>` to enforce readable character length (`--measure`).
- [x] Automated schema test imports `src/schemas/content.ts` directly in `bun test` and verifies that missing required frontmatter throws validation errors.
- [x] Pre-commit guardrails and `bun test` pass cleanly.
