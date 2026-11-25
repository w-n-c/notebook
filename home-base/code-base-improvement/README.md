# Code Base Improvement

Work that makes the codebase itself easier to change, rather than shipping a
feature. Tickets live in `issues/`.

## Why this feature exists

`CODING_STANDARDS.md` says a test may assert on a file's text only when that text
**is** the artefact. The suite grew before that rule existed, so a lot of it
asserts on the *source* of components — `expect(island).toContain('createDrum(')`
— which means any refactor that keeps behaviour identical but moves a call into a
helper turns the suite red. That is a test that punishes the change it should
protect, and it is what blocked `code-organisation/10`.

This page is the inventory the standard does not carry: which files assert on
text, what each assertion is standing in for, and where the work is tracked.

## The inventory

Counted on 2026-11-24: **146** text assertions in **8** test files, all of them
reading files under `src/` with `readFileSync`/`read`.

| File | Text assertions | What it asserts on | Verdict |
| --- | --- | --- | --- |
| `tests/view-transition.test.ts` | 56 | `dist/` CSS and HTML (fine), `Layout.astro`'s inline script (fine — the script *is* the artefact), `HeroSearch.svelte`'s script (brittle) | **mixed** — ticket 01 |
| `tests/hero-thoughts.test.ts` | 35 | built HTML (fine), `HeroSearch.svelte` markup and CSS (brittle), `PromptField.svelte` markup (brittle) | **mixed** — ticket 01 |
| `tests/page-shell.test.ts` | 14 | `Layout.astro` and the shell Region's markup | ticket 02 |
| `tests/site-theme.test.ts` | 11 | `src/theme.ts` declarations | ticket 03 |
| `tests/copy.test.ts` | 10 | Copy module contents | ticket 04 |
| `tests/fonts.test.ts` | 9 | font declarations and `@font-face` | ticket 05 |
| `tests/recipes.test.ts` | 8 | `src/styles/recipes.ts` classes | ticket 06 |
| `tests/paper-texture.test.ts` | 3 | texture tokens in CSS | ticket 07 |

Tickets 01 is the practice change plus the two Hero files, because
`code-organisation/10` is blocked on it. Tickets 02–07 are the remainder: created,
not started, one file each so they can be picked up independently.

## The rule the inventory serves

A test may assert on a file's text only when that text **is the artefact** — a
token, a declaration, a stylesheet rule, an inline script whose bytes are the
behaviour. It may not assert on text that stands in for behaviour: a call, an
attribute, a guard clause, a piece of state, a DOM effect. Assert those on the
module that exports them, or on the built output, or in a real browser.

The standard itself is in `CODING_STANDARDS.md` ("Test the Artefact, Not the
Text"). The classification of individual files is this page, because a ticket
closes and a file stops being brittle — a list inside the standards would go
stale in place, where nobody would notice.
