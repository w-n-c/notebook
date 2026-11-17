# 03 — Reconcile ADRs + Glossary to the New Layer Homes; Write the Extraction ADR

**What to build:** Extraction changes the layer homes that ADR 0001/0003/0005 name by path (`src/lib/tokens.ts`, `src/plugins/layout-integration.ts`, `src/components/layout/*.astro`). Update those references, and record the extraction decision itself as an ADR.

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** None.

**Status:** `open`

## Acceptance Criteria

- [ ] ADR 0001, 0003, and 0005 path references are updated to the new package locations (`packages/layout/...` / `@w-n-c/layout`); no document still points at moved `src/` paths as if they were authoritative.
- [ ] A new ADR records the extraction decision: publish the layout system as the workspace package `@w-n-c/layout`, site as first consumer. Include **Considered Options** (workspace vs separate repo vs in-place root export) and the **Consequences** (guardrail/test path coupling; dogfooding).
- [ ] `GLOSSARY.md` stays consistent with the extraction (no new context unless a `GLOSSARY-MAP.md` is warranted); the *Layout Primitive Contract*, *Theme*, and *Base Styles* entries remain accurate.
- [ ] `docs/adr/` numbering stays sequential (next free number).
