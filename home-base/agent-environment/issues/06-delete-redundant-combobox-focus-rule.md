# 06 — Delete the Redundant Combobox Focus Rule

**What to build:** `Combobox.svelte:240` re-declares the global
`:focus-visible` outline (`packages/layout/src/layout-integration.ts:240`).
Delete it. `HeroSearch.svelte`'s `:focus-within` rule stays: the input's own
outline is deliberately `none` (`Combobox.svelte:197`).

**Blocking Edges:** none.
**Status:** `done`

**Acceptance Criteria:**

- [x] `rg 'focus-ring' src/components/ui/Combobox.svelte` finds **0** matches.
- [x] With keyboard focus on a stream entry, the outline is **2px** solid
      `--focus-ring` with **2px** offset, sampled via `getComputedStyle` in a
      `probe` or spec; `bun run shot / '[data-hero]'` shows the ring.
- [x] `bun test` and `bun run smoke` pass.
