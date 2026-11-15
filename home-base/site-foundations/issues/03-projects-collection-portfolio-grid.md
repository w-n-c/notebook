# 03: Projects Case Study Collection with Portfolio Grid

**What to build:** A complete case-study showcase for engineering systems—a structured `projects` collection with metrics and architecture tags, representative seed production systems (Hospital RTLS Kafka Pipeline and Cloud Migration), a responsive `/projects` card grid using Every Layout primitives, and a dedicated `/projects/[slug]` deep-dive view.

**Blocked by:** 01: Global Page Shell, Navigation, and Theme Container.

**Status:** done

- [x] `projects` collection configured via Astro 7 Content Layer API (`src/content.config.ts` with `glob()` loader) backed by a shared Zod schema in `src/schemas/content.ts` validating `title`, `description`, `pubDate` (`z.coerce.date()`), `category` (`z.enum(['distributed-systems', 'cloud-infrastructure', 'ai-engineering'])`), `tags`, `featured` (boolean), `draft` (default `false`), optional `metrics` (`z.record(z.string(), z.string())`), and optional `repoUrl`.
- [x] At least 2 seed case studies included (Hospital RTLS Event-Driven Pipeline and Cloud Migration).
- [x] `/projects` filters out `draft: true` entries and renders project cards in a responsive `<Grid min="m">` where cards adapt to container width without media queries.
- [x] `/projects/[slug]` renders the complete case study with architecture tags, metric callouts, and links to source code.
- [x] Automated schema test imports `src/schemas/content.ts` directly in `bun test` and verifies valid project entries and rejects malformed records.
- [x] Pre-commit guardrails and `bun test` pass cleanly.
