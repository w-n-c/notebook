# 02 — Tighten the Ticket Format: Behaviour Must Survive the Grill→Ticket Hop

**What to build:** `docs/agents/issue-tracker.md` ticket format and the grilling
skill's wrap-up, so the behaviours agreed in a grill reach the implementer as
checkable outcomes. The failure this fixes: spec said "~20px/s vertical loop";
ticket 04 said "idle drift is slow"; the implementer reads the ticket.

**Status:** `done`

**Acceptance Criteria:**

_Verified 2026-11-21: all five bullets already held in the tree (the format, the
`Reference:` field, the repeat-the-number rule, the `grilling` skill, and the
`VAGUE_WORDS` flag with its per-word fixtures in `tests/issues.test.ts`)._

- [x] `docs/agents/issue-tracker.md` → Ticket Format: every **Acceptance
      Criterion is an outcome a stranger could check in a browser or a test**,
      carries the number if the grill produced one (px/s, ms, count, size), and
      says *how it is observed*. "Slow", "smooth", "calm", "visible" alone fail.
- [x] New optional ticket field **Reference:** `path:lines` of a prototype or
      sketch, with the fixed sentence "behaviour only, not conventions".
      The implementer reads the cited lines before writing code.
- [x] A ticket whose spec has a numeric behaviour must repeat that number in its
      criteria (the spec is not guaranteed to be read, the ticket is).
- [x] (Done 2026-11-21 in `~/code/skills`, awaiting reinstall.) The `grilling` skill's last step: "restate every behaviour we agreed as an
      observable outcome with its number; anything that cannot be stated that way
      is not agreed yet."
- [x] `scripts/lib/issues.ts` (pure, unit-tested): flag, non-fatally, an
      acceptance criterion that contains a vague word (`slow`, `smooth`, `calm`,
      `gentle`, `subtle`, `seamless`, `fast`, `quick`, `soft`) and no digit. `visible`
      is deliberately **not** on the list (too common in non-motion criteria). Warn
      in `ISSUES.md`; test it with one failing and one passing fixture per word.
