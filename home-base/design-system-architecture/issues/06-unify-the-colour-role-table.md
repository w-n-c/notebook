# 06 — Unify the Colour-Role Vocabulary (Blocking)

**What to build:** one declaration of the colour roles, so that adding a role is a
one-file edit. Today the same vocabulary lives in three tables that must agree by
hand:

- `packages/layout/src/tokens.ts` — `surfaceRoles`, `textTones`, `borderTones`
  (the neutral base vocabulary).
- `packages/layout/src/theme.ts` — `themeRoles`, `defaultRoles`, `roleAliases`
  (the overridable seam, added in hero #05).
- `packages/layout/src/layout-integration.ts` — `buildColorVariables` (which
  colour variables actually get emitted).

ADR 0007's "one declaration, no second table" rule applies to the primitives; the
colour roles have quietly become the exception. Adding `--site-ink-stroke` in
hero #03 touched four places (the two above plus `src/theme.ts` and the contrast
gate), which is exactly the shotgun surgery the ADR forbids.

**Blocking Edges:** Blocks every future role or theme addition, including
`data-feeds` (new tag/state roles) and the mobile work in hero #08.
**Status:** done

**Acceptance Criteria:**

- [x] One table is the source of truth for the role names; the other modules
      derive from it (no third list to keep in step).
- [x] `themeRoles` is a view over that table, not a hand-maintained copy: a role
      added once appears in the base tokens, the theme override seam, the emitted
      CSS, and the contrast gate without edits elsewhere.
- [x] Aliases (`roleAliases`) either collapse into the same table or are deleted.
- [x] A test adds a role to the table and asserts it is emitted and overridable;
      removing it fails in exactly one place.
- [x] `bun test` (both suites), `typecheck`, and the contrast gate stay green.

**Questions for the grilling session:**

- Does the base vocabulary and the site's theme share one table, or is the neutral
  base a *subset* the theme extends?
- Where does the seam live: `tokens.ts` owning roles and `theme.ts` owning only
  the override values, or `theme.ts` owning both?
- Do `--site-*` extras stay separate (they are, by ADR 0011, site-only and
  namespaced) or join the table with a flag?
- Does `buildColorVariables` disappear entirely into the table's derived form?
