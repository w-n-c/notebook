# 03 — Warm Design & Composition (Silhouette + Thought Stream)

**What to build:** Declare the warm hand-crafted Theme (light + dark) in `src/theme.ts` and apply it through the library's theme hook (#05), then compose the HeroThoughts surface as a left-facing Silhouette beside a drifting Thought Stream, with the generated and synthesized callouts — replacing the current enclosed-head / chip-swarm rendition. (ADR 0010, ADR 0011.)

**Blocking Edges:** Blocked By #01, #02, #05.
**Blocks:** #04.

**Acceptance Criteria:**

- [ ] `src/theme.ts` declares the semantic roles and `--site-*` extras with exactly ADR 0011's values and is passed to `layoutTokens({ theme })`; `packages/layout/src/tokens.ts` is untouched by the warm palette.
- [ ] The contrast gate passes over the applied theme in both variants (ADR 0011 minimums: text 4.5:1, `--border-strong` 3:1 on every surface); every foreground/background pairing the hero, Combobox adapter and Button adapter actually use is covered by the gate.
- [ ] Controls (prompt input, buttons) take their boundary from `--border-strong`; `--border-subtle` appears only as decoration; the Silhouette stroke is `--site-ink-stroke` and ~0.25px thinner in dark; grain is `multiply` in light and `soft-light` at 2–3% in dark; the stream's edge fade is a `mask-image`, not an overlay (`docs/ui-guide.md`).
- [ ] State is a text tag: the generated / guess / cached cues each carry words, never only color or a dashed border.
- [ ] The hero composes `prompt | Silhouette | Thought Stream`; the Silhouette is `aria-hidden` decoration, never a container; the responsive collapse matches the prototype (mobile shrinks the Silhouette, the stream stacks below the prompt).
- [ ] A generated Assembled View entry carries a visible "generated" tag; a Synthesized View carries a disclaimer tag in the speech zone; both are token-styled and easy to restyle.
- [ ] All entry labels and callout copy live in one module so they are editable without hunting through markup (placeholder strings are fine), including the **Open Question** lifecycle copy: asking ("let's see if I can get an answer"), accepted ("awaiting response"), deferred ("leave it with me"), and a failure line. Those four states are unit-tested in the module but **not rendered** until a real handoff endpoint exists (Phase 5); until then a low-confidence answer shows only the "a guess — not from my notes" tag.
- [ ] None of the prototype's architecture-voice filler (the eyebrow header and tag strings such as "Open Index Live Drift", `[SSR · GENERATE VIEW →]`) is ported; every visible string is real copy from the copy module.
- [ ] Reduced-motion honoured; axe WCAG 2.1 AA 0 violations; guardrails green; no inline styles or bespoke classes in `src/pages/` or `src/layouts/`.

**Status:** `open`
