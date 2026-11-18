# 09 — Type-Check Svelte in the Gate (`svelte-check`)

**What to build:** Add `svelte-check` so `.svelte` files are type-checked; today neither `astro check` nor `tsc --noEmit` inspects them, so the islands have no type coverage at all. Wire it into `scripts/ci.sh` and the pre-commit gate, and fix the errors it surfaces.

**Blocked by:** — (independent; complements 07/08).

**Blocks:** —

**Status:** `open`

## Acceptance Criteria

- [ ] `svelte-check` is a devDependency with a dedicated script; `scripts/ci.sh` and the pre-commit gate run it, and a `.svelte` type error fails the gate.
- [ ] `svelte-check` exits 0 over the tree.
- [ ] The pre-existing `src/components/ui/Combobox.svelte` error (`'input'` is not in the bits-ui Select root props) is fixed — coordinate with the HeroThoughts ask-button defect, which may share a root cause.
- [ ] ADR 0003's Mechanical Quality Gates list is updated to include `svelte-check`.
- [ ] `bun test`, `bun run check`, `bun run typecheck`, and `bun run build` green.
