# 06 — Primitive Manifest & Typed Attribute Helper

**What to build:** Introduce the single source of truth for the Layout Primitive Contract and the typed helper that composes it. Add `packages/layout/src/primitives.ts` — the **Primitive Manifest** — declaring, per primitive, the class name and each parameter's `data-*` attribute, value scale, and default. Add `packages/layout/src/layout.ts` exporting `layout(primitive, options)`, typed from the manifest, returning `{ class, ...dataAttrs }`. Refactor the generator's default and per-primitive value lookups to derive from the manifest, which also emits the missing `.stack:not([data-space])` fallback. No consumer changes yet — the wrappers keep working (ADR 0007).

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`.

**Blocks:** 07, 08.

**Status:** `open`

## Acceptance Criteria

- [ ] `primitives.ts` declares all ten primitives (Box, Center, Cluster, Cover, Frame, Grid, Reel, Sidebar, Stack, Switcher): class name, each parameter's `data-*` attribute, its value scale, and its default. It is the only place a primitive's attribute surface is written down.
- [ ] `layout(primitive, options)` is exported from `@w-n-c/layout`; it imports no framework, returns a plain `Record<string, string>`, emits `class` plus one `data-*` per supplied parameter, and omits absent parameters.
- [ ] Booleans emit presence attributes (`layout('cover', { noPad: true })` → `data-no-pad`); extra classes merge through an options `class` key.
- [ ] Token-value checking is proven by a `@ts-expect-error` fixture covering a bad primitive name (`'stak'`), a bad parameter name (`spcae`), and bad token values (`space: 'medium'`, `surface: 'acccent'`); deleting any `@ts-expect-error` breaks `bun run typecheck`.
- [ ] `buildPrimitiveDefaultLookups()` and the per-primitive value lookups derive from the manifest; every manifest default emits exactly one `:not([data-*])` rule.
- [ ] The `Stack` `space` default is declared in the manifest and emitted as a `.stack:not([data-space])` rule, so a raw `<div class="stack">` renders vertical rhythm.
- [ ] Decision recorded: the bare `[data-space] { --space: var(--space-s); }` typo-tolerance rule is either removed (an unknown value then yields no `--space`) or kept deliberately with a comment.
- [ ] Emitted CSS changes only by the added default fallbacks; no built route changes visually.
- [ ] `bun test`, `bun run check`, `bun run build`, and `scripts/git-guardrails.sh` remain green; the wrappers and all consumers are untouched.
