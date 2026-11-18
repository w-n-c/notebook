# 10 — Generated Framework Wrappers (Astro + Svelte)

**What to build:** Ship thin wrapper components for every Layout Primitive in
both frameworks, **generated from the Primitive Manifest** rather than written
by hand. `packages/layout/src/{astro,svelte}/` gains one wrapper per primitive;
`@w-n-c/layout` gains `./astro/*` and `./svelte/*` entry points over optional
peer dependencies; `bun run wrappers` emits them and `--check` fails the gate if
they are stale. Migrate every consumer back to wrapper syntax, and nest the one
multi-primitive element the Attribute Helper cannot express.

**Blocked by:** 06: Primitive Manifest & Typed Attribute Helper — the manifest is
what makes generation possible. Done.

**Blocks:** — (08's guardrail should now also understand wrapper props.)

**Status:** `done`

**Supersedes** ticket 07's "retire the wrappers" decision. See *Why this
reverses 07* below.

## Why this reverses 07

Ticket 07 deleted the hand-written `.astro` wrappers and migrated everything to
`{...layout(...)}`. Two things were wrong with that, and one thing was right:

- **Call-site readability regressed.** Per call site it is ~2.3× more verbose
  (`<Stack space="m">` 17 chars → `<div {...layout('stack', { space: 'm' })}>` 39).
  In aggregate the app was a wash (−290 chars, −1.5%) because deleting four
  per-primitive imports per file paid for the longer call sites — but the reading
  cost is real and lands on every site.
- **The helper cannot compose two primitives on one element.** `layout()` returns
  one primitive's `class`, and a later spread's `class` key overwrites an earlier
  one. `HeroConversation.svelte` had `class="prompt-bubble box sidebar"`, so the
  island that motivated ADR 0007 still hand-wrote raw `data-*` and was checked by
  nothing.
- **What was right:** the wrappers were dangerous because they were *hand-written
  duplicates* of the manifest. That is how `Stack`'s `space` default drifted and
  lost its CSS fallback. **Generated** wrappers cannot drift — the generator reads
  the manifest, so the only per-primitive fact a wrapper knows is its own name.

So the reason for ADR 0007's "ships no framework components" clause no longer
applies, and the sugar can ship with the library where every consumer gets it.

## Acceptance Criteria

- [x] `packages/layout/src/wrappers.ts` exports `generateWrappers(options)`, a pure
  function returning `path → source` for every primitive × framework. Options:
  `importPath`, `frameworks`, `primitives`. It imports no framework.
- [x] `bun run wrappers` writes the wrappers; `bun run wrappers --check` fails if
  they differ from the manifest **or** if a wrapper survives a primitive rename.
- [x] `packages/layout/src/{astro,svelte}/` holds 10 wrappers each; both are
  type-checked by the gate (`astro check` covers `packages/**/*.astro`; `svelte-check`
  covers the Svelte set).
- [x] `packages/layout/package.json` gains `./astro/*` and `./svelte/*` exports,
  with `astro` and `svelte` as **optional** peer dependencies, so importing `.`
  pulls in neither.
- [x] Every wrapper derives its props type from `Omit<LayoutOptions<'name'>, 'class'>`
  and its attributes from `layout('name', { … })` — no parameter is re-declared.
  `tests/wrappers.test.ts` asserts this for every primitive in both frameworks.
- [x] All 41 `.astro` call sites and the Svelte island compose through the wrappers.
- [x] The prompt bubble is **nested** — `Box` (surface + padding) wrapping `Sidebar`
  (the two-column arrangement) — rather than stacking two primitives on one element.
- [x] `svelte-check` is wired into `scripts/ci.sh` and the pre-commit gate with
  `--fail-on-warnings` (Svelte *prunes* selectors it believes are unused, silently
  dropping styling — that must fail). Ticket 09.
- [x] `bun test` (123), `bun run check` (0 errors, 60 files), `bun run typecheck`,
  `bun run check:svelte` (0 errors, 0 warnings), `bun run build` (10 pages) green.

## Verification: the generated wrappers reproduce the hand-written ones

Built `9999ee8` (the last commit *before* ticket 07 removed the hand-written
wrappers) in a git worktree and diffed the canonicalised DOM against this build:

- **9 of 10 routes are byte-identical** — tag sequence, text, and every attribute
  (classes sorted, Astro scope classes dropped, boolean spellings unified).
- **`index.html` differs only by the intended nesting**, plus the island's
  `svelte-kh8q69` scope class leaving the three now-`:global` elements.

That is the strongest available statement that generation lost nothing: the
generated wrappers are behaviourally the hand-written ones.

Two findings from the diff:

- Astro's scoped CSS keys off `[data-astro-cid-*]` (which survives the wrapper
  boundary), **not** `.astro-*` — the scope *class* Astro also emits is inert.
  Wrapping an element therefore does not break the consumer's scoped styles.
- `slot="eyebrow"` on the project page comes **back**: the wrapper forwards it via
  `{...rest}` where ticket 07's `layout()` spread swallowed it.

## Deviations

- **Svelte scoped CSS cannot reach inside a wrapper.** `.prompt-echo` and
  `.prompt-bubble` land on elements rendered by `Box.svelte`, so the island's
  scoped selectors were pruned as unused and the `border-radius` / focus-ring
  rules vanished from `dist/`. Fixed with `:global(...)`, matching the existing
  `:global([data-*])` pattern in the UI Adapters (ADR 0006). `.face` and `.voice`
  stay scoped — those elements are still the island's own. This is inherent to
  Svelte's scoping, not to the wrappers, and it is the pattern future components
  should copy.
- **`Combobox.svelte`'s pre-existing error fixed here**, because `svelte-check`
  cannot join the gate otherwise. `input` and `content` were declared as direct
  children of bits-ui's `Combobox.Root`, which does not declare them, so they were
  passed as props and landed in its `...restProps`. They are now declared *inside*
  the Root's children. The built DOM is unchanged, so this is type-level only —
  but it is a latent bug, and it is worth checking against the separate
  ask-button defect (ticket 09 flagged the possible shared root cause).
- **`data-prompt-echo` renders `="true"` instead of `=""`** where it is a bare
  prop on a wrapper. `[data-prompt-echo]` matches either; it is a test hook
  (`tests/hero-thoughts.test.ts`), not a style hook. Left alone to keep the diff
  to the nesting.
- **Two ADR writes are pending confirmation** (see below).

## Pending: ADR writes

Per the working agreement, `docs/adr/` is not written without an explicit
decision. Two amendments are owed:

1. **ADR 0007** — its "ships no framework components" clause is superseded. The
   Manifest + Attribute Helper remain the contract; the wrappers are *generated
   consumers* of it, shipped as optional subpaths.
2. **ADR 0003** — the Mechanical Quality Gates list should gain `svelte-check`
   (with `--fail-on-warnings`) and `bun run wrappers --check`.
