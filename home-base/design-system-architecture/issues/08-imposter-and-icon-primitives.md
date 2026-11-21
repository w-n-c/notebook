# 08 — Imposter and Icon Primitives (Blocking)

**What to build:** the two missing Every Layout primitives, so `@w-n-c/layout` is
complete before it is published, and the hero grain stops hand-writing
`position:` (`HeroThoughts.astro:30,59`). Container has no reference component
and is out of scope.

**Reference:** `.scratch/every-layout/imposter.md`, `.scratch/every-layout/imposter/Imposter.{css,js}`,
`.scratch/every-layout/icon.md`, `.scratch/every-layout/icon/Icon.{css,js}` —
behaviour only, not conventions.

**Blocking Edges:** none.
**Blocks:** agent-environment #08, hero-thoughts #07, #08, data-feeds #02, paper-texture #01.
**Status:** `open`

**Acceptance Criteria:**

- [ ] **Imposter** in `packages/layout/src/primitives.ts`: `breakout` (flag),
      `margin` (spacing scale, default none), `fixed` (flag). Base CSS centres at
      `inset-block-start/inline-start: 50%` with `translate(-50%, -50%)`; unless
      `breakout`, `max-inline-size` and `max-block-size` are
      `calc(100% - margin * 2)` with `overflow: auto`; `fixed` sets `position: fixed`.
- [ ] **Icon**: `space` (spacing scale, default `2xs`); `inline-flex`,
      `align-items: baseline`, `> svg { margin-inline-end }`. The manifest gains an
      optional `element` field so the generated wrapper's default element is
      `span` for Icon (every other primitive stays `div`). The accessible label is
      the consumer's `role="img"` / `aria-label`, not a param.
- [ ] **Positioned** utility (`class="positioned"` and `data-positioned`,
      `position: relative`) in `@layer utilities`, declaring an Imposter's
      positioning container, so a component never writes `position:` itself.
- [ ] `bun run wrappers` regenerates Astro and Svelte wrappers for both;
      `bun run wrappers -- --check` exits **0**.
- [ ] Tests in `packages/layout/tests/` cover each param's CSS (one assertion per
      param, one at a non-default value) and the `span` default element.
- [ ] **Grain migrated.** In `HeroThoughts.astro` the grain overlay is an Imposter
      sized `inline-size: 100%; block-size: 100%` inside a `positioned` hero
      surface; `rg 'position:' src` finds **0** matches; `bun run smoke` passes and
      `bun run shot / '[data-hero]'` shows the same paper tooth as before.
- [ ] `GLOSSARY.md` has entries for **Icon**, **Imposter** and **Positioned**, and
      the ADR 0005 manifest list names the two new primitives.
