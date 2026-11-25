# 05 — Real Notes & Projects

**What to build:** replace the site's scaffolding content with the owner's real
notes and projects. Today `src/content/notes/` holds three entries (one is the
`draft: true` filtering fixture `draft-roadmap`, two are short architecture
notes about this site) and `src/content/projects/` holds two. The thought stream
and the Dynamic View are designed against real entries, so they need real ones.

**Why now:** hero-thoughts/08 (mobile composition) is designed against real
entries, and hero-thoughts/07 renders the index of them. Thin placeholder
content makes both designs lie.

**Authorship:** the owner writes or supplies the content. An agent may
structure, format and validate it against the collection schemas, but never
invents notes or projects.

**Out of scope (deliberately):** tag taxonomy and per-entry term mapping. Those
are decided afterwards, from the content as it actually exists.

**Blocking Edges:** Blocks hero-thoughts/07 and hero-thoughts/08. Not blocked.

**Acceptance Criteria:**

- [ ] Every published note and project in the collections is owner-approved
      content; no scaffolding entry is reachable at `/notes/*` or `/projects/*`
      (checked by listing the built routes in `dist/`).
- [ ] The `draft: true` fixture still exists somewhere the tests use it, and the
      build emits no route for it (existing `tests/notes.test.ts` stays green).
- [ ] Every entry passes the collection schema (`bun run build` green).
- [ ] At least 5 published notes and 3 published projects (counted from the
      built `/notes/*` and `/projects/*` routes in `dist/`).
- [ ] No private or doxworthy detail (employer-internal names, addresses,
      credentials) appears in any committed entry; the owner has read each one.
- [ ] `bun test`, `typecheck`, `build` green.

**Status:** `open`
