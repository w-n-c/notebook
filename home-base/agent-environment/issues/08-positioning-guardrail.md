# 08 — `positioning` Guardrail

**What to build:** once Imposter, Icon and `positioned` exist, no component needs
`position:`. Rule id `positioning`, **empty allow-list**.

**Blocking Edges:** Blocked by design-system-architecture #08.
**Status:** `done`

**Acceptance Criteria:**

- [x] Flags `position:\s*(absolute|fixed|sticky|relative)` in `.astro` and
      `.svelte` under `src/` and `packages/`; `position: static` passes. CSS
      strings in `.ts` files are not scanned.
- [x] `tests/guardrails.test.ts`: a fixture per flagged value and one passing
      `position: static`.
- [x] The live-tree scan passes, with **0** allow-list entries.
