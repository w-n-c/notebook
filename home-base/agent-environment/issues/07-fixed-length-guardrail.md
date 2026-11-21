# 07 — `fixed-length` Guardrail

**What to build:** a guardrail against hardcoded `px` in component CSS (a 432px
stream height was matched from a prototype; the design height is fluid:
`clamp(18rem, 48vh, 28rem)`). Rule id `fixed-length`.

**Honest limit:** it does not catch a layout primitive's rule beating a
component's (`.stack:only-child { block-size: 100% }` beat the clamp: 317px).
`bun run look` printing the hero height is the check for that.

**Blocking Edges:** none.
**Status:** `open`

**Acceptance Criteria:**

- [ ] Flags `\d+(\.\d+)?px` in `.astro` and `.svelte` `<style>` content, comments
      stripped.
- [ ] Allowed: `0`; any value inside `var(--x, <fallback>)`; values **< 1px**
      (e.g. `blur(0.4px)`); `999px`.
- [ ] `tests/guardrails.test.ts` has one passing fixture per allowed form and a
      failing fixture with `block-size: 432px`.
- [ ] The live-tree scan passes on the real tree with **0** edits to allowed
      values.
