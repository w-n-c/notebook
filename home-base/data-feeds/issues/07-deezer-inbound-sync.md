# 07 — Deezer Inbound Sync

**What to build:** an ongoing import from Deezer (the owner's primary music
platform for now) into the PDS as teal.fm `fm.teal.feed.play` records.

**First step is a feasibility check, not code:** research found new Deezer
developer-app registration appears closed (community threads May–Jun 2026; not
confirmed on an official page), and the API's listening-history permission
(`listening_history`) has no documented depth. If an app cannot be registered,
fall back to Deezer's own data export or a scrobbler (e.g. multi-scrobbler) as the
source of `fm.teal.feed.play` records.

**Blocking Edges:** Blocked by hosting/01 and by the first edition of the site
being live (no ticket yet; plain-text blocker), so the hosting architecture is
known before choosing where the OAuth callback and background job run.
Until this lands, the `music` chip stays out of the thought stream.

**Acceptance Criteria (draft — to be settled once unblocked):**

- [ ] The feasibility finding (app registration possible or not, history depth)
      is written into this ticket with a source URL.
- [ ] A chosen source produces `fm.teal.feed.play` records visible through
      `listRecords` for the owner's DID.
- [ ] The `music` chip appears in the stream only when at least 1 play record
      exists in the index.

**Status:** `backlog`
**Blocked by:** hosting/01
