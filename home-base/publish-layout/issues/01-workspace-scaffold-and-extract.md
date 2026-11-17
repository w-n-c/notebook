# 01 — Workspace Scaffold & Extract `@w-n-c/layout`

**What to build:** Create the bun workspace and extract the framework-agnostic layer into `packages/layout/` (`@w-n-c/layout`): the tokens module, the generator (`generateCss`, `viteLayoutTokens`), and the `.astro` Layout Primitive wrappers. Rewire this site (pages, layouts, components, `astro.config.mjs`, tests, guardrails) to consume the package through the workspace link. One atomic ticket so trunk stays green.

**Blocking Edges:** Blocks #02, #03, #04, #05.

**Acceptance Criteria:**

- [ ] Root `package.json` declares `workspaces: ["packages/*"]`; `packages/layout/package.json` declares `name: "@w-n-c/layout"`, `type: "module"`, `exports` (root, `/astro`, and the CSS entry), and `files`.
- [ ] `src/lib/tokens.ts` and `src/plugins/layout-integration.ts` move into `packages/layout/src/`; no copy remains under the site's `src/`.
- [ ] `src/components/layout/*.astro` move into `packages/layout/src/astro/` and are reachable as `@w-n-c/layout/astro`.
- [ ] The framework-agnostic entry points import no `astro/*`; only `/astro` may.
- [ ] `astro.config.mjs` composes the package's `layoutTokens()`; site pages/layouts import primitives from `@w-n-c/layout/astro` and data from `@w-n-c/layout`.
- [ ] `tests/layout-integration.test.ts`, `tests/home-a11y.test.ts`, and `tests/guardrails.test.ts` resolve the library through the workspace package; no test imports `../src/lib/tokens` or `../src/plugins/layout-integration`.
- [ ] `scripts/lib/guardrails.ts`'s `isLayoutPrimitive` predicate points at the new package location.
- [ ] `bun test` and `bun run build` green; `scripts/git-guardrails.sh` clean; built routes unchanged.

**Status:** `open`
