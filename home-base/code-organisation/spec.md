# Code Organisation: Regions

The decisions are recorded in **ADR 0013** (`docs/adr/0013-regions-colocate-by-default-promote-on-second-consumer.md`)
and the glossary terms **Region**, **Content**, **Site Metadata** and **Copy**.
This folder holds the tickets that carry them out; there is no separate spec.

## Outcome in one paragraph

A file lives with the one Region that uses it (`src/regions/<name>/`, one
`index.ts` entry point). It is shared only when a second Region uses it or when
the repo enforces a seam on that kind of file (`src/components/ui/`,
`@w-n-c/layout`, `src/styles/`). Two Regions exist today: `hero` and `shell`.
Two new guardrails fence the rule, `file-size` counts code lines, `content.ts`
becomes `site-content.ts`, and `HeroSearch.svelte` is refactored for readability
(Single Level of Abstraction) instead of being split.

## Order

Free to start: 01, 02, 03, 09. Then 02 → 04 → 05; 01 + 04 + 05 → 06 → 07;
04 + 05 → 08; 04 + 09 → 10; 09 + 10 → 11. Tickets 01, 06 and 07 all edit
`scripts/lib/guardrails.ts`, which is why they are chained.

## Out of scope

Splitting `HeroSearch.svelte`; making Notes or Projects Regions (ticket 07's
warning will say when); moving anything between `public/` and `src/assets/`;
renaming `copy.ts`; a guardrail for readability (it is a reviewer standard).
