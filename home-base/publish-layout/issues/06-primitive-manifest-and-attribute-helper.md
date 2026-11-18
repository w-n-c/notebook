# 06 — Primitive Manifest & Typed Attribute Helper

**What to build:** Introduce the single source of truth for the Layout Primitive Contract and the typed helper that composes it. Add `packages/layout/src/primitives.ts` — the **Primitive Manifest** — declaring, per primitive, the class name and each parameter's `data-*` attribute, value scale, default, and CSS binding. Add `packages/layout/src/layout.ts` exporting `layout(primitive, options)`, typed from the manifest, returning `{ class, ...dataAttrs }`. Refactor the generator's value lookups and default fallbacks to derive from the manifest, which also emits the missing `.stack:not([data-space])` fallback. No consumer composes the helper yet (ADR 0007).

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** 07, 08.

**Status:** `done`

## Acceptance Criteria

- [x] `primitives.ts` declares all ten primitives (Box, Center, Cluster, Cover, Frame, Grid, Reel, Sidebar, Stack, Switcher): class name, each parameter's `data-*` attribute, value scale, default, and binding. It is the only place a primitive's attribute surface is written down; `primitiveDefaults` is now a compatibility projection of it.
- [x] `layout(primitive, options)` is exported from `@w-n-c/layout`; it imports no framework, returns a plain `Record<string, string>`, emits `class` plus one `data-*` per supplied parameter, and omits absent parameters.
- [x] Booleans emit presence attributes (`layout('cover', { noPad: true })` → `data-no-pad`); extra classes merge through an options `class` key.
- [x] A value equal to the parameter's default is omitted, leaving the `:not([data-*])` fallback to supply it.
- [x] Token-value checking is proven by a `@ts-expect-error` fixture covering a bad primitive name (`'stak'`), a bad parameter name (`spcae`), bad token values (`space: 'medium'`, `surface: 'acccent'`), and a parameter belonging to another primitive (`layout('stack', { surface })`); `bun run typecheck` fails if any directive stops suppressing a real error.
- [x] `buildValueLookups()` and `buildDefaultLookups()` derive from the manifest; every default with a CSS binding emits exactly one `:not([data-*])` fallback (the base rule handles `data-side`, which has a default but no binding).
- [x] The `Stack` `space` default is declared in the manifest and emitted as `.stack:not([data-space])`, so a raw `<div class="stack">` renders vertical rhythm; the other seven spacing-bearing primitives self-default the same way.
- [x] The bare `[data-space] { --space: var(--space-s); }` typo-tolerance rule is kept deliberately, with an explanatory comment on the manifest's `SPACE` binding.
- [x] A manifest↔CSS parity test asserts every bound parameter has a value lookup and every defaulted parameter a fallback, so the two cannot drift.
- [x] Emitted CSS changes only by the added `:not([data-space])` fallbacks, plus two behaviour-preserving normalisations: `.box:not([data-border])` now binds `var(--border-thin)` instead of the literal `1px`, and the Switcher limit rule writes `n+5` instead of `n + 5`.
- [x] `bun test` (121), `bun run check`, `bun run typecheck`, `bun run build`, and `scripts/git-guardrails.sh` green.
- [x] The wrappers keep working — only their `primitiveDefaults` import moves from `../tokens` to `../primitives`. No consumer composes the helper yet; that is ticket 07.
