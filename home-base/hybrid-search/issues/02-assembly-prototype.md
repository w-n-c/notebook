# 02 — Assembly Prototype

**What to build:** a throwaway prototype (same rules as hybrid-search/01) that takes
retrieved results and composes an Assembled View spec two ways — a deterministic
composer and an LLM composer constrained to a JSON schema — so we can see what the LLM
adds, how long it takes, and what the spec should look like.

**Reference:** the Primitive Manifest (`publish-layout/06`) may generate the schema's
component and prop enums, since the components are self-styling and the layout
primitives are already typed.

**Blocking Edges:** Blocked by hybrid-search/01.
**Blocks:** hero-thoughts/12.

**Acceptance Criteria (counts are drafts; the owner may change them):**

- [ ] For at least 10 queries from the retrieval prototype (mixed-type, single-type and
      notes-passage queries), both composers produce a view spec.
- [ ] Every spec validates against the schema: the report gives the validation failures
      per composer out of 10.
- [ ] Two spec shapes are tried on the same 10 queries: a flat list of sections, and a
      nested tree of layout primitives.
- [ ] Each spec is rendered in a throwaway page with the real layout primitives, deterministic
      and LLM versions side by side, and the owner records which they prefer for each of the 10.
- [ ] Timings are recorded with no threshold: LLM compose latency (ms) per query, the
      token counts, and the cost.
- [ ] A verdict is written back onto this ticket: whether the LLM composer earns its latency,
      the recommended spec shape, and the transmission format (rendered server-side or JSON to
      the client).

**Status:** `open`
**Blocked by:** hybrid-search/01
