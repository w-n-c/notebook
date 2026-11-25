# 04 — PDS Adapter

**What to build:** the feed adapter that reads the owner's atproto repo at build
time and normalizes its records into `EntityRecord`s, behind the interface
data-feeds/01 defines. The PDS is the source of truth; records use community
lexicons (ADR on entity records as atproto records): Bookhive
`buzz.bookhive.book` (books), Popfeed `social.popfeed.feed.review` (films), and
teal.fm `fm.teal.feed.play` (music, once data-feeds/07 lands).

**Why now:** this is what makes films and books answerable. It is a blocker for
hero-thoughts/08.

**Blocking Edges:** Blocked by data-feeds/01 and hosting/01.
**Blocks:** hero-thoughts/08.

**Acceptance Criteria:**

- [ ] The adapter reads records with the unauthenticated
      `com.atproto.repo.listRecords` for the DID in one config value; no secret
      is needed at build time.
- [ ] Pure mapping functions (lexicon record → `EntityRecord`) are unit-tested
      with recorded sample records, one per lexicon; the network call is the only
      untested line.
- [ ] A PDS that is unreachable or returns a malformed record fails the build
      with the source named (the DID or collection), never an empty index.
- [ ] `fetchedAt` on each record is the build's fetch time.
- [ ] An extra, unknown field on a record is ignored by the mapper, not an error.
- [ ] `bun test` (both suites), `typecheck`, `check:svelte`, `build` green.

**Status:** `open`
**Blocked by:** data-feeds/01, hosting/01
