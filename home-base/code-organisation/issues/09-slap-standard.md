# 09 — Single Level of Abstraction Standard

**What to build:** the reviewer agent gets a readability standard to enforce. It is a
judgement call (what counts as one level of abstraction is not a pattern a linter
can match), so it belongs in `CODING_STANDARDS.md` and not in a guardrail. This is
the yardstick for tickets #10 and #11.

**Blocked by:** None (can start immediately).
**Status:** `open`

**Acceptance Criteria:**

- [ ] `CODING_STANDARDS.md` gains one section, "Single Level of Abstraction", with
      exactly **5** numbered rules: (1) every function reads at one abstraction level,
      orchestrators call named helpers and helpers hold the mechanics; (2) a
      function that chooses a path only routes, it does not carry multi-step setup
      inline; (3) extract cohesive clusters by intent, in verb-noun helpers, not to
      reach a line count; (4) top-level logic reads like a table of contents; (5)
      do not wrap a single trivial one-liner unless it names domain intent.
- [ ] The section says it is enforced by review and not by a guardrail, and says
      why in one sentence.
- [ ] It includes **1** worked example (a mixed-level block and its routed form),
      described without file paths or line numbers so it cannot go stale.
- [ ] It states that there is no line-count target for extraction.
- [ ] `CODING_STANDARDS.md` is under **1,000** lines (`wc -l`).
