# Specification: Hybrid Search — semantic retrieval and assembled views

**Status**: `open` — prototype first; real tickets are written from the prototypes' verdicts.

## Problem Statement

The hero's resolution ladder (`src/regions/hero/resolution.ts`) matches a prompt
against a fixed term list (exact 1, substring 0.75, contained 0.6). That cannot
answer "dark" or "brooding" unless an entry is tagged so, and this site is meant to
showcase AI capability, so a fixed set of matchable terms is the wrong ceiling.
ADR 0002 is also stale against the glossary and ADR 0010: it describes two paths
(≥0.75 direct, <0.75 synthesized, <0.35 cold miss) and has no Assembled tier.

## Intended behaviour (agreed in the grill)

The four resolution states stay (glossary, ADR 0010):

- **Dynamic View** — a cached, direct match; deterministic, no LLM.
- **Assembled View** — anything the data can support: composed near-real-time from
  the prompt across films, books, music, notes and projects. `brooding` spans every
  type; `brooding movie` narrows to films; `backtrack` returns code snippets and
  discussion passages from notes. Persisted once built.
- **Synthesized View** — only when the site lacks the information to assemble a
  view (e.g. the owner's takes on current events): a guess, tagged "not from my
  notes".
- **Open Question** — a confident miss handed to the author.

The Assembled/Synthesized boundary is **"does the index hold data that supports the
requested view"**, not a fixed cosine number. ADR 0002's 0.75 / 0.35 thresholds are to
be reconsidered; small-model cosine scores cluster, so the boundary is expected to be
rank-based and calibrated on labelled in-domain and out-of-domain queries.

## Decisions so far

- Retrieval is embeddings plus a small type vocabulary (`movie`, `book`, `album`,
  `note`, `project`, `code`) that filters the results; no LLM is needed to retrieve.
- Notes are indexed at **passage level** (heading sections, code fences), each with
  an anchor back to its note.
- Films, books and albums are **enriched** from public sources (Wikipedia/Wikidata,
  Open Library, MusicBrainz, TMDB with a key and attribution) before embedding.
  Enrichment is derived data, kept apart from the PDS records, with source and
  licence recorded on each.
- An LLM **composes** the assembled view as a *view spec* (a schema-validated
  description of which pre-compiled components hold which records/passages, and the
  grouping, headings and captions). It never emits HTML or code. A deterministic
  composer is the baseline and fallback.
- Hosting is open: VPS service, Cloudflare Container, or Workers AI + Vectorize, behind
  one search interface, chosen after the prototypes measure real latency.
- A new record must become searchable without a full site rebuild (minutes are fine).

## Not agreed yet

- **Latency numbers.** The prototypes measure; no threshold until then. A playful
  assembly-loading animation is the fallback if assembly is slow.
- The view spec's shape (flat sections vs a nested primitive tree) and its transmission
  format (JSON spec rendered server-side vs shipped to the client).
- The embedding model and the Assembled/Synthesized cutoff.

## Ticket Map

| # | Ticket | Status |
| --- | --- | --- |
| 01 | Retrieval Prototype | open |
| 02 | Assembly Prototype | open (blocked by 01) |
