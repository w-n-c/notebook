# 05 — Import Letterboxd and StoryGraph into the PDS

**What to build:** a one-time, throwaway-grade script that migrates the owner's
exports into the PDS: Letterboxd → Popfeed `social.popfeed.feed.review`,
StoryGraph → Bookhive `buzz.bookhive.book`. StoryGraph is being dropped; there is
no outbound sync to either service (see Non-goals in `../spec.md`).

**Owner-verified, lightly specced:** the owner checks the mapping on a dry run;
no heavy test suite is required.

**Blocking Edges:** Blocked by hosting/01.
**Blocks:** hero-thoughts/08.

**Acceptance Criteria:**

- [ ] Default run is a dry run: it prints every mapped record and writes nothing
      to the PDS (checked by running it against an empty repo and listing it).
- [ ] The owner has read the dry-run output and approved it; the approval is
      recorded in this ticket before `--write` is run.
- [ ] `--write` authenticates with an app password read from the environment; no
      credential is committed (`git grep` for the password finds nothing).
- [ ] Raw exports live in a gitignored `data/raw/` (`git check-ignore data/raw`
      exits 0); `profile.csv` is never read.
- [ ] Known mapping gaps are surfaced in the dry run, not hidden: the Letterboxd
      export is believed to carry no TMDB/IMDb ID (unverified, login-gated), and
      Bookhive's `hiveId` may not be derivable.
- [ ] After `--write`, `listRecords` shows the same count as the dry run printed.

**Status:** `open`
**Blocked by:** hosting/01
