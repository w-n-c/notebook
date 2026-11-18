# 08 — Guardrail: Validate `data-*` Against the Manifest

**What to build:** Teach the guardrail engine the contract. Add a `data-attributes` rule that validates every primitive `data-*` attribute in `.astro` and `.svelte` against the Primitive Manifest — an unknown attribute on a primitive class, or a value outside the parameter's scale, is a violation. Admit the primitive class vocabulary to the classes permitted in layouts and pages, and validate class tokens passed through `layout()` options. This is the machine check that replaces the deleted wrappers' type safety, and it also covers the islands, which the wrappers never did.

**Blocked by:** 06: Primitive Manifest & Typed Attribute Helper.

**Blocks:** —

**Status:** `open`

## Acceptance Criteria

- [ ] A new `data-attributes` rule in `GUARDRAIL_RULES`, wired into `verifyGuardrails` and the pre-commit adapter (`scripts/check-guardrails.ts`).
- [ ] In both `.astro` and `.svelte` it flags an unknown attribute (`data-spcae="m"`) and a value outside its scale (`data-space="medium"`, `data-surface="acccent"`), and passes a valid value.
- [ ] The rule derives its scales from the manifest (imported from `@w-n-c/layout`), not a second hand-written table; the engine stays pure (no filesystem or process access).
- [ ] The primitive class vocabulary is admitted where layouts and pages compose the contract, so a typo'd `class="stak"` is still flagged.
- [ ] Class tokens in `layout(primitive, { class: '…' })` options are validated against the same set.
- [ ] `tests/guardrails.test.ts` covers each case with in-memory fixtures; the live `src/` tree scan stays green; `scripts/git-guardrails.sh` green.
