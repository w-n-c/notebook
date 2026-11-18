# 08 — Guardrail: Validate `data-*` Against the Manifest

**What to build:** Teach the guardrail engine the contract. Add a `data-attributes` rule that validates every primitive `data-*` attribute in `.astro` and `.svelte` against the Primitive Manifest — an unknown attribute on a primitive class, or a value outside the parameter's scale, is a violation. Admit the primitive class vocabulary to the classes permitted in layouts and pages, and validate class tokens passed through `layout()` options. This is the machine check that replaces the deleted wrappers' type safety, and it also covers the islands, which the wrappers never did.

**Blocked by:** 06: Primitive Manifest & Typed Attribute Helper.

**Blocks:** —

**Status:** `open` — **premise has weakened; re-scope before building.** See the note below.

## Premise check (2026-11-18)

This ticket was written when `layout()` was the *only* way to compose the contract and
had no type checking. Ticket 10's generated wrappers changed that: `.astro` and
`.svelte` consumers now get typed props, so the typo classes this rule was meant to
catch are already caught in the editor.

Measured raw composition across `src/` and `packages/` (`.astro` + `.svelte`,
excluding `layout()` calls): **zero**. Every primitive usage goes through a wrapper or
the Helper. So today the rule would police nothing in the site, and its
"admit the primitive class vocabulary to layouts/pages" criterion would only matter
if someone hand-wrote `class="stack"` — which currently would be *caught* (as a
non-utility class) rather than admitted.

What survives as genuine value:

- A **future** raw `data-*` composition, which nothing would otherwise check.
- The library's own wrappers, if the generator ever emits a bad parameter.
- `class="stak"`-style typos, already half-covered by the existing `utility-class` rule.

It is therefore worth doing for completeness of the contract story, but it is not the
highest-value remaining work in this feature — publishing is (tickets 02 → 04).

## Acceptance Criteria

- [ ] A new `data-attributes` rule in `GUARDRAIL_RULES`, wired into `verifyGuardrails` and the pre-commit adapter (`scripts/check-guardrails.ts`).
- [ ] In both `.astro` and `.svelte` it flags an unknown attribute (`data-spcae="m"`) and a value outside its scale (`data-space="medium"`, `data-surface="acccent"`), and passes a valid value.
- [ ] The rule derives its scales from the manifest (imported from `@w-n-c/layout`), not a second hand-written table; the engine stays pure (no filesystem or process access).
- [ ] The primitive class vocabulary is admitted where layouts and pages compose the contract, so a typo'd `class="stak"` is still flagged.
- [ ] Class tokens in `layout(primitive, { class: '…' })` options are validated against the same set.
- [ ] `tests/guardrails.test.ts` covers each case with in-memory fixtures; the live `src/` tree scan stays green; `scripts/git-guardrails.sh` green.
