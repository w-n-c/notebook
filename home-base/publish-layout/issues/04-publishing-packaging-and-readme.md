# 04 — Publishing: Prepack Literal CSS, README, Browser-Floor Doc, Publish Metadata

**What to build:** Make the package installable outside Vite and self-explanatory. At `prepack`, emit a literal stylesheet from `generateCss()` so non-Vite ecosystems import a real file; write the README; document the browser floor and theming; finalize publish metadata.

**Blocked by:** 01: Workspace Scaffold & Extract `@w-n-c/layout`; 02: Split Library-Owned Base Styles (both done).

**Blocks:** None.

**Status:** `open (backlog)` — **deferred by decision (2026-11-18).** The library stays
in this repo as a workspace package until there is an actual second consumer. The
user's words: *"we'll publish the lib once we actually need it somewhere else, so
until then we can keep it here."* `bgabriel.co` is a finished site and is not that
consumer.

Nothing in this ticket is blocked by the deferral — the workspace package already
works for this site. What the deferral *does* mean is that the two things that only
matter to an outside consumer stay undone, and should stay undone rather than
half-done:

- `prepack` → literal `dist/layout-tokens.css` (today the `./layout-tokens.css`
  export points at a `dist/` that does not exist — harmless while nothing imports it).
- Publish metadata, LICENSE, browser-floor doc, and a consumer-facing README.

Revisit when a second consumer appears.

## Acceptance Criteria

- [ ] `prepack` runs `generateCss()` and writes `packages/layout/dist/layout-tokens.css`, exposed as `@w-n-c/layout/layout-tokens.css`.
- [ ] `bun publish --dry-run` (or equivalent) lists the expected files: entry points, the generated `.css`, README, LICENSE; no `src/` leak of site code.
- [ ] README covers: what the library is (Layout Primitive Contract), install, the three entry points, Vite virtual-module usage, the literal-CSS fallback, the neutral default Theme + how to override `:root`, the class/`data-*` API with an example, and the **Baseline 2024** browser floor with the `light-dark()` dependency called out.
- [ ] Version starts at `0.1.0` (pre-stable; animations/themes still uncemented).
- [ ] A LICENSE is present (decide the license; if none chosen, flag it as an open question rather than inventing one).
- [ ] `bun test` + `bun run build` + guardrails green.
