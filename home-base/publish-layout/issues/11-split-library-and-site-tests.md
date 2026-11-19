# 11 — Split Library Tests from Site Tests

**What to build:** Move the tests that verify the library's own behaviour into `packages/layout/tests/`, leaving `tests/` for assertions about how *this site* uses the library. Run the library's suite with the package as its working directory, so a library test that reaches back into the site fails instead of passing by accident.

**Blocked by:** — (raised mid-ticket-03).

**Blocks:** —

**Status:** `done`

## Why

The user's framing: *"if those tests are testing just library functionality they
should be in the library. we wouldn't do a whole sweep of tests to see if tailwind
is actually applying properly when we import it, we would just test if we are
applying it to our code properly."*

Two concrete symptoms, both found while doing ticket 03:

1. `tests/layout-integration.test.ts` — the library's stylesheet test — had a
   "Base Styles delivery (site ↔ library split)" block reading
   `src/styles/global.css`. A library test reaching into the host repo is exactly
   the coupling that makes an extraction painful, and it would have broken the day
   the package moved.
2. The reverse: `tests/page-shell.test.ts` was asserting the *library's* Base
   Styles contents (body tokens, the measure-cap exemption, `pre` overflow) because
   that's where they used to live. Those assertions belong to the library.

## What moved

`tests/` → `packages/layout/tests/`:

| File | What it covers |
| --- | --- |
| `layout-integration.test.ts` | Token emission, Base Styles, primitive rules, contract utilities, Manifest↔CSS parity, the Astro/Vite integration |
| `layout-helper.test.ts` | `layout()` — the Attribute Helper's runtime shape and its compile-time `@ts-expect-error` fixtures |
| `wrappers.test.ts` | The Wrapper Generator — one wrapper per primitive per framework, parameters derived from the Manifest, Reel enhancement wiring |
| `reel.test.ts` | The Reel overflow state machine and its observers |
| `helpers/dom.ts` | A **copy** of the `happy-dom` harness — deliberately not shared with the site's, because these tests must run with no knowledge of the repo containing them |

The library half of the split assertions moved into the library's Base Styles
block; the site half stayed in `tests/page-shell.test.ts`, renamed
`Global Styles (src/styles/global.css)`, and now asks only whether the site
duplicates the library or owns things that are its own.

## The working-directory rule

`bun test <arg>` treats the argument as a **substring filter**, not a path — so
`bun test tests` matched `packages/layout/tests/` too and re-merged the two suites
from the root. Both suites therefore run explicitly:

- `packages/layout/package.json`: `"test": "bun test"` — the library alone.
- root `package.json`: `"test": "bun --cwd packages/layout test && bun test ./tests"`.
- `scripts/ci.sh` and `scripts/git-guardrails.sh` run the two steps separately.

The library's step uses `--cwd packages/layout` **on purpose**: from the root, a
library test that reads `src/styles/global.css` passes; from the package
directory it fails. Probed and confirmed both ways.

**This is a speed bump, not a wall.** A library test could still write
`../../src/...` and pass from either directory. A guardrail rule — *"library tests
reference no path outside the package"* — would be the hard version. Not built;
noted in case the package ever gains a second consumer.

## Acceptance Criteria

- [x] Library-behaviour tests live in `packages/layout/tests/`; site-behaviour tests stay in `tests/`.
- [x] No library test reads a path outside `packages/layout/`.
- [x] `packages/layout/package.json` has a `test` script and declares `happy-dom` (its only test dependency) rather than borrowing the site's.
- [x] The library suite runs standalone: `cd packages/layout && bun test` → 51 pass.
- [x] The gate runs both suites separately and stays green: 51 library + 92 site tests, `astro check` 0 errors, `tsc` clean, `svelte-check` 0/0, 10 pages built.
- [x] README documents the split and why the working directory matters.
