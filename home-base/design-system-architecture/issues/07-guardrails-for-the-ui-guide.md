# 07 — Guardrails for `docs/ui-guide.md` (Blocking)

**What to build:** `docs/ui-guide.md` was written without deterministic checks, so
every rule in it is enforced only by a reviewer reading a diff, which is how a
`26s` literal and a `90`ms interval shipped against the rule "durations come from
`--duration-*`". Turn each *mechanical* rule into a check in
`scripts/lib/guardrails.ts` (unit-tested in `tests/guardrails.test.ts`, wired into
the pre-commit scan). Rules that need judgement stay in the doc, labelled as such.

**Blocking Edges:** Blocks every further UI ticket (hero #08, #09).
**Status:** `open`

**Steps for the implementing agent:**

1. Read `docs/ui-guide.md` end to end and list every rule as *mechanical*
   (a pattern a regex or the CSS/HTML parser can find) or *judgement*.
   Write the list into the PR/commit description.
2. For each mechanical rule add a guardrail with a rule id, a message that names
   the rule and the doc heading, and a fixture test with one passing and one
   failing example. Candidates (verify against the doc; do not invent):
   - a duration literal (`\d+(\.\d+)?m?s`) in a component `<style>` outside
     `var(--duration-*)`, and a numeric delay/interval in Svelte/TS animation code;
   - a hex colour outside the library palette and `src/theme.ts` (exists in
     `tests/site-theme.test.ts`: move it into the guardrail so the hook runs it);
   - accent-coloured text over `--surface-subtle`;
   - a background-coloured gradient overlay used as an edge fade (must be `mask`);
   - `unload` / `beforeunload` listeners;
   - a decorative SVG without `aria-hidden`;
   - `prefers-reduced-motion` missing next to any `animation:`/`transition:` of
     non-token duration.
3. Anything you cannot make deterministic: leave it in the doc under a "Judgement
   — checked in review" heading so `code-review` knows to look.
4. Run the full gate once; every existing violation the new rules find is fixed
   or recorded as a follow-up ticket, never silenced.
