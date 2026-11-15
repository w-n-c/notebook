# 04: Home Page Landing Bio and Accessibility Gate

**What to build:** The complete public home page (`/`) integrating bio, featured case studies, and recent notes into a cohesive landing presentation, verified by automated accessibility audits with zero WCAG AA violations.

**Blocked by:** 02: Notes Content Collection with Index and Reader Route, 03: Projects Case Study Collection with Portfolio Grid.

**Status:** done

- [x] `/` presents a concise bio (Senior Systems/Cloud engineer building in AI & open web) with social links (GitHub, LinkedIn, Bluesky) sourced from a typed `src/config/site.ts` module.
- [x] Displays all `featured: true` non-draft projects and the 3 most recent non-draft notes dynamically from their collections.
- [x] Automated accessibility audit (`axe-core` + `happy-dom` in `bun test`) runs against built `dist/**/*.html` routes (`/`, `/notes`, `/projects`, `/notes/[slug]`, `/projects/[slug]`) verifying 0 WCAG 2.1 AA structural/ARIA violations, paired with a deterministic contrast-ratio unit test on the hex tokens in `src/styles/global.css`.
- [x] Full build verification (`bun test` + `bun run build`) succeeds with zero errors. *(Note: `astro check` is deferred until Astro's new type-checker releases; re-enable once available.)*
- [x] Pre-commit guardrails pass cleanly.
