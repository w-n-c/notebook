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
---

The design system I built is a set of Astro components — every layout primitive
writes a `data-*` attribute and a virtual stylesheet answers with a token rule.
Then I dropped an interactive island into the middle of the page, and the
framework boundary ate it. Svelte can't render an Astro component. So the hero
re-expresses `Sidebar` and `Stack` in its own scoped CSS, shares the same custom
properties, and pretends the primitive layer isn't there. The tokens cross the
boundary; the components don't. A design system is only as portable as its
weakest framework seam.

---

Ticket 07 deleted ten layout wrapper components because they kept drifting from
the source of truth. Ticket 10 generated ten layout wrapper components from the
source of truth. Same code, same names, same directory — and the difference is
everything. A hand-written wrapper is a *copy* of the manifest, and copies
rot: that is how the Stack's default spacing quietly lost its CSS fallback,
declared in three places and agreeing in none. A generated wrapper is a
*projection* of the manifest, and projections can't disagree with what they're
projected from. I spent two commits learning that the question was never
"components or no components". It was "who wrote the same fact down twice".

---

I moved the library's tests into the library, and then had to stop myself from
running them from the repo root. From the root they pass. From inside the
package they fail — because a library test that reads the host site's stylesheet
resolves the path from the root and finds it, and from the package directory it
doesn't. Same tests, same code, one of them lying. The working directory isn't a
convenience; it's the thing that decides whether a dependency is real or just
invisible. A boundary you can walk across without noticing isn't a boundary.
