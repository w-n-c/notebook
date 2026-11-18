# 07 — Retire the `.astro` Wrappers; Migrate Consumers to the Contract

**What to build:** Delete `packages/layout/src/astro/` and the `./astro/*` export, and rewrite every consumer to compose the Layout Primitive Contract directly — `{...layout('stack', { space: 'm' })}` in `.astro`, the same call in Svelte islands. Update the guardrail predicate and the tests that referenced the wrappers, and carry the wrappers' behavioural documentation (per-primitive when-to-use, the Stack splitting notes) into the library README (ticket 04).

**Blocked by:** 06: Primitive Manifest & Typed Attribute Helper.

**Blocks:** —

**Status:** `open`

## Acceptance Criteria

- [ ] `packages/layout/src/astro/` is deleted and the `./astro/*` entry is gone from `packages/layout/package.json`'s `exports`.
- [ ] No `@w-n-c/layout/astro` import remains in the repo; every primitive usage in `src/` composes the contract (Attribute Helper or raw attributes).
- [ ] `scripts/lib/guardrails.ts`'s `isLayoutPrimitive` predicate and its `inline-style` branch are removed or retargeted; `tests/guardrails.test.ts` and `tests/layout-integration.test.ts` no longer reference the wrappers.
- [ ] The `Primitive Defaults Parity` test is deleted — superseded by ticket 06's manifest↔CSS parity, which cannot drift because there is only one declaration.
- [ ] The wrappers' JSDoc is preserved in the library README or the manifest; no when-to-use guidance is lost.
- [ ] Built `dist/**/*.html` is visually identical to before; axe WCAG 2.1 AA remains 0 violations.
- [ ] `bun test`, `bun run check`, `bun run typecheck`, `bun run build`, and `scripts/git-guardrails.sh` green.
