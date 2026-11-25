# 06 — Add Watch/Read Items from the Site

**What to build:** a form on the owner's own site to add a film or a book, which
publishes a Popfeed `review` or Bookhive `book` record straight to the owner's
PDS using atproto browser OAuth (`@atproto/oauth-client-browser`: PKCE + DPoP, no
server needed; the `client_id` must be an HTTPS URL serving
`client-metadata.json`, so the final site URL must be known).

**Why:** the goal is for the site to be the place the owner logs what they watch
and read, with the PDS as the permanent home.

**Blocking Edges:** Blocked by hosting/01, data-feeds/04, and the site being
deployed at its final URL (no ticket yet; plain-text blocker).

**Acceptance Criteria (draft — to be settled in a grilling session once
unblocked):**

- [ ] The form's UX is decided first: title search or lookup source (e.g. TMDB
      for films), what fields are required, rating scale, and the signed-out
      state.
- [ ] Only the owner's DID can publish; other sessions see no form.
- [ ] A record published from the form appears in `listRecords` for the owner's
      DID (checked with `curl`).
- [ ] The form keeps working or degrades cleanly with JS disabled and offline;
      the rest of the hero is unchanged.
- [ ] `bun run smoke` covers sign-in-free rendering; axe and contrast stay green.

**Status:** `open` — **needs a grilling session once unblocked.**
**Blocked by:** hosting/01, data-feeds/04
