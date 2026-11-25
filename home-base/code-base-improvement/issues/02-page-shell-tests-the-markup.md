# 02 — `page-shell` Tests the Shell's Markup

**What to build:** `tests/page-shell.test.ts` holds **14** text assertions, mostly
on `Layout.astro` and the shell Region's markup. Apply ticket #01's standard: keep
what *is* the artefact (an inline script's bytes, a declaration the browser needs),
move what stands in for behaviour onto the module or the built output.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] Every assertion in the file is classified as artefact or behaviour, and the
      behaviour ones are deleted (where `e2e/navigation.spec.ts`,
      `e2e/home-fidelity.spec.ts` or `e2e/narrow.spec.ts` already measures them) or
      rewritten against the module that exports the behaviour.
- [ ] No assertion reads `.svelte` or `.astro` source for a call, an attribute, a
      guard or a piece of state; built output (`dist/`) is still fair game.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
