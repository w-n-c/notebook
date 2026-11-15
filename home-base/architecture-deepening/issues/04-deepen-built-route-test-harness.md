# 04: Deepen the Built-Route & Accessibility Test Harness

**What to build:** Deepen the built-route/accessibility test harness so `ensureBuilt()` can no longer be accidentally skipped, `dist/` path plumbing and attribute-order-insensitive HTML matchers are shared, and `happy-dom` windows are always closed.

**Blocked by:** None.

**Blocks:** None.

**Status:** done

**Deferred:** Pulled forward from the architecture-review backlog and implemented after Tickets 01–03.

## Context

`ensureBuilt()` in `tests/helpers/build.ts` is a single-flight build helper, but it is a temporal ordering constraint: every `describe` block that reads `dist/` must remember to `await ensureBuilt()` in `beforeAll`, and two blocks in the current suite forgot. Route tests (`tests/home-a11y.test.ts`, `tests/notes.test.ts`, `tests/projects.test.ts`, `tests/page-shell.test.ts`) also duplicate `dist/` path resolution, instantiate `happy-dom` `Window`s that are not always closed, and repeat attribute-order-dependent regexes (e.g. asserting `class="..." data-...` order).

## Acceptance Criteria

- [x] `ensureBuilt()` is triggered automatically for every `dist/`-reading test: `tests/helpers/routes.ts` (`builtHtml`, `routeExists`, `builtHtmlFiles`, `builtRouteNames`) awaits the single-flight build, removing the manual ordering footgun.
- [x] A shared helper resolves `dist/` route paths so tests stop hand-building `resolve(ROOT, 'dist/.../index.html')` strings.
- [x] Shared HTML assertion helpers (`hasElement`, `hasElementWithText`) match attributes order-independently (no regex depends on attribute ordering).
- [x] All `happy-dom` `Window` instances are closed via `withWindow` (`tests/helpers/dom.ts`, `try/finally`); no leaked windows.
- [x] Existing route/a11y assertions are preserved; `bun test` and `bun run build` pass.
