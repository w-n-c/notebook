# 01 — HeroThoughts Core

**What to build:** The interactive conversational hero (Slice 2): hollow side-profile head SVG (outline only), prompt input (accessible combobox), thought swarm, three-tier resolution coordinator, seed catalog, `/view/[category]` placeholder route, `?from=chat` return CTA, home-only nav auto-hide, and below-fold identity strip.

**Blocking Edges:** Blocks #02, #03.

**Acceptance Criteria:**

- [ ] `src/lib/resolution.ts` is a pure module (no DOM/`node:*`/`astro:content`) exporting `resolvePrompt(prompt, catalog)` → `{ tier, suggestions, voiceLine? }`.
- [ ] Unit tests cover: Tier 1 direct match → ranked suggestions and no voice line; no match → Tier 2 + "I think I can make that for you…"; Tier 3 branch + "I'm not sure — let me guess…".
- [ ] `HeroThoughts.svelte` (hydrated `client:load`) renders the head SVG (`role="img"` + accessible name), an always-visible `input`, a suggestion `listbox`, typed-prompt echo, and a voice-line region.
- [ ] Idle chips are `music books films projects notes`; music seeds are the four sketch labels; `projects`/`notes` chips navigate to real routes.
- [ ] `/view/[category].astro` renders "indexed in Slice 3" for music/books/films.
- [ ] Any page with `?from=chat` shows a return-to-chat CTA (`<a href="/">`); pages without it show none.
- [ ] Home nav visible-then-hidden on `/` only, reveal on hover + focus-within; other pages keep a fixed nav.
- [ ] Role/bio/social render below the fold in `main` (home-a11y test relocated, not deleted).
- [ ] `bun test` + `bun run build` green; `tests/guardrails.test.ts` and axe WCAG AA pass; reduced-motion honored.

**Status:** `open`