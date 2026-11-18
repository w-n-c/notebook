# 09 — Type-Check Svelte in the Gate (`svelte-check`)

**What to build:** Add `svelte-check` so `.svelte` files are type-checked; today neither `astro check` nor `tsc --noEmit` inspects them, so the islands have no type coverage at all. Wire it into `scripts/ci.sh` and the pre-commit gate, and fix the errors it surfaces.

**Blocked by:** — (independent; complements 07/08).

**Blocks:** —

**Status:** `done`

## Acceptance Criteria

- [x] `svelte-check` is a devDependency with a dedicated script (`bun run check:svelte`); `scripts/ci.sh` and the pre-commit gate run it, and a `.svelte` type error fails the gate. It runs with `--fail-on-warnings`, because Svelte *prunes* selectors it believes are unused — a silent way to lose styling (ticket 10 hit exactly this).
- [x] `svelte-check` exits 0 over the tree (0 errors, 0 warnings).
- [x] The pre-existing `src/components/ui/Combobox.svelte` error is fixed — `input`/`content` were declared as direct children of bits-ui's `Combobox.Root`, which does not declare them, so they were passed as props into its `...restProps`. They are now declared inside the Root's children. Fixed in ticket 10; the built DOM is unchanged.
- [x] The ask-button defect that this ticket flagged as a possible shared root cause is gone — the user confirmed the Combobox works in the browser. No separate fix was needed beyond the snippet restructuring above.
- [x] ADR 0003's Mechanical Quality Gates list includes `svelte-check` (with `--fail-on-warnings`) and `bun run wrappers --check`. Written in ADR 0008's commit.
- [x] `bun test` (131), `bun run check` (0 errors, 62 files), `bun run typecheck`, `bun run check:svelte`, and `bun run build` (10 pages) green.
