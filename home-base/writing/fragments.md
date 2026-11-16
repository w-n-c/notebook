# Home Base — writing fragments

Raw material mining for future posts. No structure, no audience, no voice yet.
Append fragments; the `writing-fragments` / `writing-shape` skills quarry this
pile later. See `AGENTS.md` → "Writing fragments".

---

A thing I keep noticing: I clear my agent sessions often, on purpose, and every
time I do, I worry the good stuff evaporates. But the fix was never "make the
agent remember" — the agent has no memory across sessions by design. The fix was
a line in AGENTS.md, a file that gets loaded every time whether the session is
fresh or not. The durable thing is the file, not the agent's head.

Leading-word candidate: *the durable thing is the file, not the session*.

---

Same shape, different problem: `.scratch/` is where all my specs, tickets, and
grilling outcomes live, and for a long time it was gitignored and lived on one
desktop with zero backup. The "issue tracker" was a single point of failure
disguised as a convention. The answer wasn't a better issue tool — it was
"issues as files, then back up the files." dspinellis/git-issue was already
pointing at this.

---

A three-cloud architecture spent one afternoon becoming two clouds and a
dormant third. Not by deleting anything — by actually reading the 2026 docs.
"What still needs Google Cloud?" turned out to be GPU training and nothing else,
so the heavy-compute fallback didn't get removed; it got put to sleep, the way a
container does, billing zero until something asks it to wake. The tool decision
was easy. The hard part was noticing that the architecture I'd been defending
was written against a previous year's limits.