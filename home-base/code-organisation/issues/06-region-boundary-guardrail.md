# 06 — Region Boundary Guardrail

**What to build:** a new guardrail rule, `region-boundary`, that rejects a commit
whose code reaches into a Region's internals. Outside a Region, the only legal
import is its `index.ts`. Tests are exempt, because they test internals by design.
The import-resolution step is its own tested function so ticket #07 can reuse it.
See ADR 0013 decision 3.

**Blocked by:** #01, #04, #05
**Status:** `done` — 2026-11-24.

**Acceptance Criteria:**

- [ ] `region-boundary` is added to `GUARDRAIL_RULES` with severity **error**, and
      its message names the offending import and the fix ("import from the
      Region's `index.ts`, or promote the file out of the Region, ADR 0013").
- [ ] Fixtures in `tests/guardrails.test.ts`:
      `src/layouts/Layout.astro` importing `../regions/hero` → **0** violations;
      importing `../regions/hero/drum` → **1** error;
      a file inside `src/regions/hero/` importing `./drum` → **0**;
      a file inside `src/regions/shell/` importing `../hero/drum` → **1** error;
      `../regions/hero/index` → **0**;
      `tests/drum.test.ts` importing `../src/regions/hero/drum` → **0** (exempt).
- [ ] Turning a specifier into a repo-relative path is one exported function with
      its own unit tests, and the rule calls it (no inline path arithmetic).
- [ ] The live-tree scan in `bun test` reports **0** `region-boundary` violations.
- [ ] A staged probe file `src/pages/__probe.astro` importing
      `../regions/hero/drum` makes the pre-commit guardrail step print `❌` and exit
      **1**; the probe is removed afterwards.

**Notes (implementation):**

- `resolveImportPath(fromPath, specifier)` is exported from
  `scripts/lib/guardrails.ts` and is the only specifier→path implementation; it
  drops a module extension, so `./drum` and `./drum.ts` are one file, and returns
  `null` for a bare specifier, an `astro:` module, a URL, or a path that climbs
  above the repository root.
- `regionOf` is internal: `src/regions/<name>` and `src/regions/<name>/index` are
  the entry point, every other path under the Region is an internal. A file may
  reach its own Region's internals; a page or another Region may not.
- The probe printed, verbatim:
  `❌ [region-boundary] src/pages/__probe.astro: Imports "../regions/hero/drum", which reaches inside the hero Region. Import from the Region's index.ts, or promote the file out of the Region (ADR 0013).`
  — then `1 guardrail error(s). Commit rejected.` and exit **1**.
- The rule reads only the importing file, so the staged-only pre-commit adapter
  sees everything it needs; no tree access was added.
