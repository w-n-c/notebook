# Specification: Data Feeds — the Dynamic View's source of truth

**Status**: `open` — promoted ahead of the HeroThoughts dynamic-view work.

## Problem Statement

Every tier above "cached catalog" is currently a mock. `src/lib/resolution.ts`
resolves prompts against a hard-coded `seedCatalog`, and `/view/[category]`
renders a placeholder that says the real source "arrives in Phase 3". The
thought stream advertises `music`, `books`, `films`, `projects`, `notes`, but only
the last two have real content behind them.

ADR 0002 defines the Dynamic View as *a cached, direct match* over an index of
notes, projects, and external entity records. Nothing ingests those records yet,
so the stream cannot show real entries, and the dynamic/assembled tiers cannot be
built honestly.

## Solution

1. **An index, built at build time.** A single normalized record type for
   everything the site can answer about (notes and projects from content
   collections; external entities from a feed), collected into one index the
   resolution ladder reads. The index is a build artefact, not a runtime fetch:
   the site stays static.
2. **Feed sources behind an adapter.** Each external source (ATProto/PDS,
   Orama export, a hand-written JSON file) is one adapter with the same small
   interface — `load(): Promise<EntityRecord[]>` — so adding a source never
   changes the index or the ladder.
3. **Staleness is visible.** Records carry their `fetchedAt`; the build records
   when the index was generated. A feed that failed to load is reported at build
   time, not silently dropped.
4. **The stream reads the index, not a catalog constant.**

## Implementation Decisions

- The index lives behind one module (`src/lib/index.ts` or equivalent) exposing
  `entities()`, `byTerm(term)`, and `adjacent(entity)`; the ladder and the stream
  consume that interface only.
- Feed adapters are pure data-in/data-out where possible: parse and normalize,
  then return records. Network access sits in the thinnest possible adapter.
- The index ships as JSON (or an Astro content collection) so the resolution
  ladder stays synchronous and testable without I/O.
- No client-side fetching on the critical path: the hero must work offline and
  with JS disabled, as it does today.

## Ticket Map

| # | Ticket | Status |
| --- | --- | --- |
| 01 | Index & Feed Ingestion | open |
| 02 | Dynamic View Renders the Index | open (blocked by 01) |
| 03 | Assembled View from Real Adjacency | backlog |
| 04 | PDS Adapter | open (blocked by 01, hosting/01) |
| 05 | Import Letterboxd and StoryGraph into the PDS | open (blocked by hosting/01) |
| 06 | Add Watch/Read Items from the Site | open (blocked by hosting/01, 04, site deployed) |
| 07 | Deezer Inbound Sync | backlog (blocked by hosting/01, first edition live) |

## Source of truth

The PDS is the permanent home for entity records, in community lexicons: Bookhive
(books), Popfeed `review` (films), teal.fm `fm.teal.feed.play` (music). Ticket 01
builds the index and adapter seam with fixtures only; ticket 04 is the PDS
adapter. Raw exports never enter git (Letterboxd's `profile.csv` carries email,
name and location); the repo may be open-sourced later.

## Non-goals

- **No outbound sync to Letterboxd or StoryGraph.** StoryGraph is dropped (no
  API). Letterboxd has no personal write API, and a headless logged-in client
  conflicts with its Terms §6.11 (automated access). Both become one-time imports.
