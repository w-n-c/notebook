# Context budget: tool-output cap, image cap, earlier compaction

Source: a `/retro` of a long coding session, filtered through the user's decisions below.

## Decisions (settled with the user before implementation)

1. **Config lives in `agent/limits.json`**, loaded by an extension (`agent/skill-models.json`
   precedent), not `settings.json` (schema-validated by Pi).
2. **Tool output cap**: any tool result is truncated to the first 60 and last 60 lines, or
   ~6000 tokens, whichever is smaller. The full text is written to a temp file and its path
   appears in the truncation note.
3. **Image cap**: at most 3 image reads per turn; the next one is *blocked* with a note
   pointing at a text or accessibility-tree snapshot. Warn once at 6 image reads per session.
4. **Compaction**: auto-compact interactive sessions at **140k** (not 120k); warn at **90k**
   with a one-line "commit and /clear between tickets" nudge. Non-interactive runs stay
   exempt (subagents are spawned `--mode json`).
5. **Subagent credit preflight is dropped.** The user was missing an OpenRouter setting; no
   preflight code is written.
6. **Image compression**: no new code. Pi already re-encodes images before they enter
   history. `agent/models.json` gets a tighter `inputLimits.images.resize` profile
   (1568 px long edge, JPEG 78) so uploads match the provider's standard resolution tier
   instead of being downscaled server-side.
7. **Skills** are edited in the `~/code/skills` fork, never the installed copy:
   - `code-review`: a missing or contradicted numeric spec value is a blocker and sorts
     first; run the repo's smoke/browser check before the two axes; ignore what a pre-commit
     hook already enforces.
   - `implement`: read every `Reference:` path in the ticket before coding; return a ticket
     whose acceptance criteria cannot be checked in a browser or a test; never mark a ticket
     done while a follow-up contradicts an acceptance criterion; use the targeted-run rule
     from `docs/agents/` and run the full gate once at the end; keep one wave per context;
     the coordinator stops and reports after a subagent failure instead of implementing the
     ticket itself.

## Acceptance criteria

- A tool result longer than the cap arrives truncated with head, tail, and a temp-file path;
  the temp file holds the untruncated text the hook received.
- Changing `agent/limits.json` changes all three behaviours without touching code.
- The 4th image read in a turn is refused with an actionable note; the session warn fires once.
- The footer shows green ≤90k, yellow ≤140k, red above; compaction fires at 140k, warn at 90k.
- `bun test` and `bun run typecheck` pass; README/GLOSSARY describe the new limits file.
