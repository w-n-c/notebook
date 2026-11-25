# 04 — `copy` Tests the Copy Module

**What to build:** `tests/copy.test.ts` holds **10** text assertions reading the
copy module and the components that render it. Copy strings are data, so most of
these should assert on the exported value; anything that reads a component's
markup to find a string belongs on the built HTML or in `e2e/home-fidelity.spec.ts`.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] No assertion reads a `.svelte`/`.astro` file to find a string that the copy
      module exports; those assert on the export or on built HTML.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
