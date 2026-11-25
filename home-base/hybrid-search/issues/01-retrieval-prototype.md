# 01 — Retrieval Prototype

**What to build:** a throwaway prototype (not in `src/`; on a throwaway branch per the
prototype skill, with a pointer left on this ticket) that answers: can embeddings over
enriched records and passage-chunked notes answer "dark", "brooding" and "backtrack",
which model is good enough, and where does "we have data for this" end?

**Prerequisites from the owner (plain text, not tickets):** a text file of about 50
films, 30 books and 30 albums (title and year), and a TMDB API key. No PII: do not use
the Letterboxd or StoryGraph exports here. Notes and projects come from
`src/content/` in full.

**Blocking Edges:** none. **Blocks:** hybrid-search/02.

**Acceptance Criteria (counts are drafts; the owner may change them):**

- [ ] Enrichment runs for every listed title from Wikipedia/Wikidata, Open Library,
      MusicBrainz and TMDB; the report gives, per type, the number of titles with a
      non-empty description, and records the source and licence per record.
- [ ] Notes and projects are chunked at heading and code-fence boundaries; the report
      gives the chunk count and the min/median/max chunk length in characters.
- [ ] At least 2 embedding models are compared on a labelled set of at least 20
      in-domain queries (including `dark`, `brooding`, `cozy`, `backtrack`,
      `brooding movie`), judged by the owner; the report gives top-5 hit rate per model.
- [ ] Title-only embedding is compared with enriched embedding on the same queries
      (top-5 hit rate each), to show whether enrichment is needed.
- [ ] `brooding movie` returns only films and `brooding book` only books, by the type
      vocabulary filter (asserted over every query that carries a type word).
- [ ] At least 10 out-of-domain queries (e.g. current political events) are run too; the
      report shows the top score and the gap to the next result for all 30 queries and
      proposes an Assembled/Synthesized cutoff with its count of wrongly assembled and
      wrongly synthesized queries.
- [ ] Timings are recorded, with no pass/fail threshold: per-query embed latency (ms) cold
      and warm per model, and index size (MB); one run on a Cloudflare Container or
      Workers AI is included if the owner has an account ready.
- [ ] A verdict is written back onto this ticket: model, chunk size, whether enrichment is
      needed, and the proposed cutoff.

**Status:** `open`
