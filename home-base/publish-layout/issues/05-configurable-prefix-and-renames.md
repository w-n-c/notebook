# 05 — Configurable Prefix / Rename Support (Default Bare)

**What to build:** Support namespacing the primitive identity class without changing the default. `generateCss({ prefix })` emits prefixed class rules (e.g. `.hb-stack`); the `.astro` wrappers and the Svelte/HTML emitters read the same prefix from one source so emitted markup and generated CSS never disagree. Full renames (arbitrary class names per primitive) are a later extension.

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** None.

**Status:** `open (backlog)`

## Acceptance Criteria

- [ ] `generateCss({ prefix: '' })` is byte-identical to today's output (default stays bare).
- [ ] `generateCss({ prefix: 'hb-' })` emits `.hb-stack`, `.hb-switcher`, etc., with `data-*` lookups unaffected.
- [ ] The prefix is declared in one place and threaded to the wrappers/emitters so a generated stylesheet and its markup can never drift.
- [ ] Tests cover default (bare) and a non-empty prefix.
- [ ] README documents prefix usage as the collision-avoidance path for host projects that already define `.grid`/`.box`.
