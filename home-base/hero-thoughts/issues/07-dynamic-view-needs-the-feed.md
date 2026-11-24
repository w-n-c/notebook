# 07 — Dynamic View Renders the Real Index

**What to build:** the Dynamic View stops being a placeholder and a mock tier.
Today `resolvePrompt()` returns a `dynamic` match against `seedCatalog`, the
entries are the catalog's own chip labels, and `/view/[category]` renders "This
view is a placeholder. The Orama-backed source that fills it arrives in Phase 3."

Once data-feeds #01 lands, the ladder resolves against the real index and the view
route renders those records; the stream's cached entries are real entities with
real URLs.

**Blocking Edges:** Blocked by data-feeds/01.
**Blocks:** hero-thoughts/08 (the mobile composition is designed against real entries).

**Acceptance Criteria:**

- [ ] `dynamic` resolution reads the index (data-feeds #01), not `seedCatalog`;
      a direct term match returns the real entity as an ordinary stream entry.
- [ ] `/view/[category]` renders the index's records for the matched term and
      drops the "arrives in Phase 3" placeholder copy.
- [ ] A term with no records is an honest miss (the existing `synthesized` /
      Open Question path), never an empty stream.
- [ ] `seedCatalog` and the placeholder copy are deleted or reduced to test
      fixtures; no production path reads them.
- [ ] `tests/resolution.test.ts` and `tests/view-transition.test.ts` fixtures move
      to the index seam; the stream's cached tag still marks a direct match.
- [ ] Full gate green, `bun run smoke` green.

**Status:** `open`
**Blocked by:** hero-thoughts/10, design-system-architecture/08, design-system-architecture/09 (retro 2026-11)
