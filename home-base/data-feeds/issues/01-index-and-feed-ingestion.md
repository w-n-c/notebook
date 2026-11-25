# 01 — Index & Feed Ingestion

**What to build:** the index the Dynamic View was always supposed to read. Today
`src/lib/resolution.ts` resolves prompts against a hard-coded `seedCatalog` and
`/view/[category]` says the real source "arrives in Phase 3". This is that
source: one normalized record type, one index built at build time, and feed
adapters that fill it.

**Why now:** the thought stream advertises `music`, `books`, `films` with nothing
behind them, and `dynamic`/`assembled` cannot be built honestly without real
records. This is the blocker for hero-thoughts #07.

**Blocking Edges:** — (this is the trunk ticket; everything else in this feature
waits on it).

**Acceptance Criteria:**

- [ ] One record type for every answerable entity (notes, projects, external
      entities): id, term(s), title, href-or-external url, source, `fetchedAt`.
- [ ] An index module exposes a small interface — at minimum
      `entities()`, `byTerm(term)`, `adjacent(entity)` — and the resolution
      ladder plus the thought stream read *it* rather than `seedCatalog`.
- [ ] An entity's terms are its lowercased title, tags, genres and creator (author or
      main credit). `byTerm("dune")` returns the entity titled "Dune", and `byTerm`
      of a tag returns every entity carrying it (fixture test); a prompt equal to a
      term still scores 1 in `resolvePrompt` and resolves `dynamic`.
- [ ] `adjacent(entity)` returns only entities sharing at least 1 term, never the
      entity itself and never one absent from the index, sorted by shared-term
      count descending then title ascending (fixture of 5 entities with the
      expected order asserted). Semantic neighbours belong to hybrid-search.
- [ ] Notes and projects are indexed from the content collections (no hand-kept
      list), so adding a note makes it answerable with no other edit.
- [ ] The adapter interface is `load(): Promise<EntityRecord[]>`. A fixture adapter
      proves a new source needs no index change, and a fixture adapter that throws
      is a build-time error naming the source, never a silently empty index. The
      real PDS adapter is data-feeds/04 (needs no PDS to finish this ticket).
- [ ] The index is produced by the build (JSON or a content collection); the
      ladder stays synchronous and testable without I/O, and the hero still works
      with JS disabled and offline.
- [ ] Tests at the index seam: term lookup, adjacency (no invented entries), and
      a fixture adapter proving a new source needs no index change.
- [ ] `bun test` (both suites), `typecheck`, `check:svelte`, `build`, and
      `bun run smoke` green.

**Status:** `open`
