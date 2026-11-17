# Specification: HeroThoughts — Interactive Conversational Hero (Slice 2)

**Status**: `done` — core (Ticket 01) landed; Tickets 02–03 remain deferred backlog.

## Problem Statement

The home page is a static text header (role, bio, social links) followed by Featured Projects and Recent Notes. ADR 0002 defines the real product — queries resolved into Dynamic, Assembled, and Synthesized views — but there is no entry point to it, and no client-side code exists anywhere in the tree (`astro.config.mjs` has no adapter; the site is static HTML). Slice 2 builds that entry point: **HeroThoughts**, a conversational hero whose hollow, side-profile head holds the visitor's prompt and a floating swarm of suggestions, and which navigates to URL-addressed views. It ships static-only, with honest client-side stubs for the two tiers whose real backends arrive in Slice 3 (Orama) and Slice 5 (the LLM endpoint).

## Solution

1. **The head.** A side-profile, hollow head silhouette. The SVG draws *only* the outline; every interactive element (prompt bubble, suggestion swarm, voice lines) is real HTML layered over it.
2. **The swarm.** A prompt (e.g. "music") makes suggestion chips enter and settle into best-fit order inside the head.
3. **The conversation.** A three-tier resolution ladder, spoken in the head's voice:
   - **Dynamic View** — direct match → ranked suggestions, no filler line.
   - **Assembled View** — no direct match → *"I think I can make that for you…"*
   - **Synthesized View** — assembly won't help → *"I'm not sure — let me guess…"*

## Implementation Decisions

### Visual & interaction
- Side-profile head, hollow interior, facing the prompt. SVG outline only; chips are HTML (`role="listbox"` overlay), not SVG text. Static idle chips on load; submitted prompt echoes inside the head near the mouth.
- Prompt is composed from the `src/components/ui/` Combobox and Button adapters (bits-ui): the always-visible prompt + suggestion list render through the Combobox adapter, the submit control through the Button adapter. Keyboard navigation and the live region for results stay.
- Voice lines (Tiers 2/3) are plain text in a status region, never baked into the SVG.
- Motion in core uses the existing `duration`/`easing` tokens only; `prefers-reduced-motion` is already neutralized globally in `global.css`.

### Resolution ladder & coordinator
- New pure client module `src/lib/resolution.ts`: `resolvePrompt(prompt, catalog)` → `{ tier: 'dynamic' | 'assembled' | 'synthesized', suggestions, voiceLine? }`. No DOM, `node:*`, or `astro:content` imports; unit-testable in `bun test`.
- The injectable seed catalog lives beside the coordinator (a `catalog` argument). Slice 3 replaces it with the Orama-backed source without touching the UI.

### Static-only boundary
- No server adapter, no `/api` route in Slice 2. Tiers 2/3 are honest client-side affordances ("wired in Slice 3/5"), not fake network calls. The future endpoint seam is documented in the spec; front-end code will never hold a provider key.

### Seed catalog
- Idle chips (5): `music`, `books`, `films`, `projects`, `notes`.
- `music` suggestions (from the sketch): *"What I've been listening to", "Most played", "Fav albums", "etc."* — aspirational; selecting navigates to a placeholder.
- `projects` / `notes`: real entries, navigate to `/projects` / `/notes` (or `/projects/[slug]` / `/notes/[slug]`).
- `books` / `films`: idle-only now; selecting navigates to `/view/[category]`.
- Placeholder route `src/pages/view/[category].astro` renders *"indexed in Slice 3."*

### Navigation & continuity
- Selecting a suggestion performs a **real navigation** to a URL-addressed page (RESTful; cacheable/bakeable; no-JS degrades to a plain link). The hero is an entry point, not a persistent chat shell.
- Any page reached from chat carries `?from=chat` and renders a **return-to-chat** CTA linking back to `/`. Pages without the param don't.
- The pan-into-selection / zoom-out continuity is a **View Transition**, deferred to the animation pass (backlog).
- Return restores an **idle** hero for now; conversation restore is a separate backlog ticket.

### Responsive
- **Wide**: `Sidebar` — prompt bubble left (speech-bubble tail to bottom-left, the off-frame speaker), head right, swarm inside.
- **Narrow**: collapse to `Stack` — shrunk head on top (mascot, outline + idle chips), prompt bubble below, suggestions render as a normal scrollable list under the input (44px targets, real combobox a11y).

### Nav auto-hide
- Home-only: nav visible on land, then hidden; reveals on hover **and** keyboard focus-within at the top edge. Never `display:none` (stays in the a11y tree). Functional hide/reveal is core; the fade/slide polish is the animation pass.

### Identity placement
- Role/bio/social move **below the fold** as a compact identity strip leading into the Latest/Featured sections. (Home a11y test moves with them; content stays in `main`.)

## Out of Scope

- Orama search index, entity ingestion, real Dynamic/Assembled/Synthesized resolution (Slice 3/5).
- Any serverless endpoint or adapter (`astro.config.mjs` stays adapterless).
- Cinematic animation: pan-in swarm-coalesce, view-transition zoom, nav fade/slide (animation pass).
- Conversation state restore on return-to-chat (backlog ticket).
- A combined "Feeds" page (revisit after the hero lands).

## Ticket Map

| Ticket | Title | Status |
| --- | --- | --- |
| 01 | HeroThoughts core (head, swarm, ladder, seed, routes, CTA, nav, responsive) | done |
| 02 | HeroThoughts animation pass (pan-in/zoom-out transitions, swarm-coalesce, nav fade/slide) | open (backlog) |
| 03 | Conversation restore on return-to-chat | open (backlog) |

## Verification

- `bun test` and `bun run build` green; `scripts/git-guardrails.sh` clean.
- `src/lib/resolution.ts` unit-tested for all three tiers + ranking.
- axe-core WCAG 2.1 AA on built routes remains 0 violations; combobox semantics covered by component tests.
- No inline styles or `<style>`/bespoke classes added to `src/pages/` or `src/layouts/` (ADR 0003 holds).
- Reduced-motion, keyboard, and touch behavior verified for input, swarm, and nav reveal.