# 12 — Assembly Loading Experience

**What to build:** what the visitor sees while an Assembled View is being composed, if
assembly takes long enough to need it. The owner's idea: a playful, Rube-Goldberg-style
animation of the view being assembled, with text describing what is happening.

**Blocking Edges:** Blocked by hybrid-search/02 (its measured compose latency decides
whether this is needed and how long it must run).

**Acceptance Criteria (draft — to be settled in a grilling session):**

- [ ] The threshold in ms above which the loading experience appears is set from the
      measured latency in hybrid-search/02.
- [ ] Reduced motion resolves to static text describing the step, with no animation.
- [ ] The loading state is announced to assistive tech (a live region), checked by axe and
      a Playwright assertion.

**Status:** `backlog`
**Blocked by:** hybrid-search/02
