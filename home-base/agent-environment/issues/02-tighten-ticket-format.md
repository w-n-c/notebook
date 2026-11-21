# 02 — Tighten the Ticket Format: Behaviour Must Survive the Grill→Ticket Hop

**What to build:** `docs/agents/issue-tracker.md` ticket format and the grilling
skill's wrap-up, so the behaviours agreed in a grill reach the implementer as
checkable outcomes. The failure this fixes: spec said "~20px/s vertical loop";
ticket 04 said "idle drift is slow"; the implementer reads the ticket.

**Status:** `open`

**Acceptance Criteria:**

- [ ] `docs/agents/issue-tracker.md` → Ticket Format: every **Acceptance
      Criterion is an outcome a stranger could check in a browser or a test**,
      carries the number if the grill produced one (px/s, ms, count, size), and
      says *how it is observed*. "Slow", "smooth", "calm", "visible" alone fail.
- [ ] New optional ticket field **Reference:** `path:lines` of a prototype or
      sketch, with the fixed sentence "behaviour only, not conventions".
      The implementer reads the cited lines before writing code.
- [ ] A ticket whose spec has a numeric behaviour must repeat that number in its
      criteria (the spec is not guaranteed to be read, the ticket is).
- [ ] The `grilling` skill's last step: "restate every behaviour we agreed as an
      observable outcome with its number; anything that cannot be stated that way
      is not agreed yet."
- [ ] `scripts/lib/issues.ts` (pure, unit-tested): flag, non-fatally, an
      acceptance criterion that contains a vague-motion word (`slow`, `smooth`,
      `calm`, `gentle`, `subtle`) and no digit. Warn in `ISSUES.md`; test it.
