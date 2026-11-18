# 07 — Retire the `.astro` Wrappers; Migrate Consumers to the Contract

**What to build:** Delete `packages/layout/src/astro/` and the `./astro/*` export, and rewrite every consumer to compose the Layout Primitive Contract directly — `{...layout('stack', { space: 'm' })}` in `.astro`, the same call in Svelte islands. Update the guardrail predicate and the tests that referenced the wrappers, and carry the wrappers' behavioural documentation (per-primitive when-to-use, the Stack splitting notes) into the library README (ticket 04).

**Blocked by:** 06: Primitive Manifest & Typed Attribute Helper.

**Blocks:** —

**Status:** `done` — but its central decision is **superseded by ticket 10**, which reinstates the wrappers as *generated* artifacts. What survives from 07: the manifest carries the wrappers' JSDoc, `isTemplate` replaced `isLayoutPrimitive`, `primitiveDefaults` and its parity test are gone, and the hand-written wrappers are deleted. What does not survive: "the library ships no components".

## Acceptance Criteria

- [x] `packages/layout/src/astro/` is deleted and the `./astro/*` entry is gone from `packages/layout/package.json`'s `exports`.
- [x] No `@w-n-c/layout/astro` import remains in the repo; every primitive usage in `src/` composes the contract (Attribute Helper or raw attributes).
- [x] `scripts/lib/guardrails.ts`'s `isLayoutPrimitive` predicate is replaced by `isTemplate`, which covers every `.astro` template and Svelte component under `src/` **or** `packages/`; the `inline-style` branch is retargeted onto it, so the rule is now strictly broader (it previously missed `src/components/`).
- [x] `tests/guardrails.test.ts` and `tests/layout-integration.test.ts` no longer reference the wrappers.
- [x] The `Primitive Defaults Parity` test is deleted — superseded by ticket 06's manifest↔CSS parity, which cannot drift because there is only one declaration. `primitiveDefaults` itself is deleted with it.
- [x] The wrappers' JSDoc is preserved as JSDoc on each entry of the Primitive Manifest (`packages/layout/src/primitives.ts`), including the Stack splitting notes, the Cover `data-cover-center` rule, and the Switcher quantity `limit`.
- [x] `bun test` (118), `bun run check` (0 errors, 47 files), `bun run typecheck`, `bun run build`, and `scripts/git-guardrails.sh` green.
- [x] Built `dist/**/*.html` is equivalent to before, and axe WCAG 2.1 AA remains 0 violations (see Verification).

## Verification: the built HTML did not change

Built at `HEAD` (the pre-refactor commit) in a git worktree and diffed against the
new build:

- **DOM structure** — every page's tag sequence and text, with all attributes and
  all `<script>`/`<style>` bodies removed, is byte-identical across all 10 routes.
- **Attributes** — canonicalised (sorted, Astro scope attributes and `astro-*`
  scope classes dropped, bare / `=""` / `="true"` treated as equal, island `uid`
  dropped, and any contract `data-*` equal to its manifest default dropped — which
  is exactly what `layout()` omits and the `:not([data-*])` fallback covers), all
  10 routes are byte-identical.
- **Stylesheet** — `dist/_astro/*.css` is **byte-identical**, so ticket 07 changed
  no CSS at all; the CSS deltas in the tree are ticket 06's.
- The one attribute that genuinely disappears is `slot="eyebrow"` on
  `projects/[slug]`: Astro consumes a literal `slot` attribute at compile time for
  slot assignment and does not re-render it, whereas the old `Cluster` component
  leaked it into the output through its prop spread. The eyebrow content still
  renders in the same position, and `slot` has no rendering effect here (there is
  no shadow DOM `<slot>`), so this is a net cleanup rather than a regression.

## Deviations

- **The Reel's progressive-enhancement `<script>` is not carried over.** `Reel.astro`
  shipped a 37-line DOM script that toggled `data-overflowing` (and `tabindex="0"`)
  on any `.reel` whose `scrollWidth > clientWidth`, driven by `ResizeObserver` /
  `MutationObserver` and Astro's `astro:page-load`. The library CSS still styles
  `.reel[data-overflowing]`, but nothing in the library or the site sets that
  attribute any more. The script was deliberately **not** moved into the library
  (a DOM script is not "just the styling", and it hardcodes Astro's `page-load`
  event) and deliberately **not** moved into `src/` (no page or component renders
  a Reel, so it would be dead code). The manifest's `reel` JSDoc now documents the
  enhancement as the consumer's job. **Reel is currently unused in this repo**, so
  nothing regresses today — but if a Reel is ever rendered, either the script needs
  a home or `.reel[data-overflowing]` needs deleting. Flagged for a decision.
