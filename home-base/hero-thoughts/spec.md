# Specification: HeroThoughts — Warm Thought Stream (Phase 2)

**Status**: `in-progress` — core (Ticket 01) landed on the old "conversational
head" premise; re-scoped after design exploration. Tickets 02–03 are the
current work. ADR 0010 (Thought Stream, not a conversation or a mind map) and
ADR 0011 (warm theme) now govern the direction; the earlier voice-line /
echo / floating-chip language in this file has been replaced.

## Problem Statement

The home page is a static text header followed by Featured Projects and Recent
Notes. ADR 0002 defines the real product — queries resolved into Dynamic,
Assembled, and Synthesized views — but there is no entry point to it. Phase 2
builds that entry point: **HeroThoughts**, a stateless search surface whose
prompt settles a drifting column of thoughts onto the best-fit views, and which
navigates to URL-addressed views. The two tiers with no backend yet are honest
client-side affordances; their real backends arrive in Phase 3 (Orama) and Phase
5 (the LLM endpoint).

## Solution

1. **The Silhouette.** A single unbroken, left-facing side-profile stroke — a
   boundary, never a container. It is `aria-hidden` decoration; nothing
   interactive lives inside it.
2. **The Thought Stream.** A vertically drifting column of thoughts and results
   on the Silhouette's open right side. At rest it drifts slowly through ambient
   subjects; a prompt settles it onto the best-fit views.
3. **The resolution ladder.** A three-tier resolution ladder,
   rendered as stream content rather than spoken turns:
   - **Dynamic View** — a cached, direct match appears as an ordinary stream
     entry.
   - **Assembled View** — no cached match, but a plausible plan: a *generated*
     stream entry carrying a visible "drafted for you" tag (the "build the
     view?" proposal); persisted once built.
   - **Synthesized View** — no plan: the Silhouette's speech cue answers beside
     the mouth, with a "a guess — not from my notes" disclaimer tag.
   - **Open Question** — a confident miss is handed to the author; the site
     states this honestly.
4. **Real navigation + cinematic motion.** Selecting an entry navigates for real
   to a URL-addressed page; the title→`<h1>` morph and the Silhouette/Stream
   pan-out and pan-in are cinematic motion over that real navigation:
   cross-document View Transitions where supported, a no-router fallback in
   Firefox (ADR 0010 decision 4).

## Implementation Decisions

### Visual & interaction
- Side-by-side composition: prompt (left) · Silhouette (center-left) · Thought
  Stream (right). The Silhouette faces left, so the Stream is "behind the head"
  in the open space. No enclosure; no node-link map.
- The prompt is composed from `src/components/ui/` adapters: the input is the
  bits-ui `Combobox` adapter and the submit control the bits-ui `Button`
  adapter, so the island hand-rolls no widget ARIA.
- The speech cue is plain text in a status region aligned toward the mouth; it
  is never baked into the SVG.
- Copy: all entry/label/callout strings live in one module so they can be
  edited by hand without hunting through markup. Labels are placeholders.
- Motion uses the `duration`/`easing` tokens; `prefers-reduced-motion` is
  honoured globally.

### Theme
- One warm identity, light and dark, declared by the site in `src/theme.ts` and
  applied through the library's `layoutTokens({ theme })` hook (ADR 0011).
  Terracotta is the accent role; sage, ochre, blueprint and ink-stroke are
  `--site-*` roles. No theme toggle. UI rules live in `docs/ui-guide.md`.

### Resolution ladder & coordinator
- Pure client module `src/lib/resolution.ts`: `resolvePrompt(prompt, catalog)` →
  `{ tier, suggestions, voiceLine? }`. No DOM, `node:*`, or `astro:content`
  imports; unit-testable in `bun test`.
- The seed catalog is injectable; Phase 3 replaces it with the Orama-backed
  source without touching the UI.
- `src/lib/navigation.ts` owns the URL rules (`?from=hero`, home detection).

### Static by default, SSR allowed
The site is static by default, but **static-only is not a goal** — ADR 0004
retires the "static Astro site" framing; adapters, endpoints, and SSR are
permitted when a workload actually needs them (Phase 3/5).
- Phase 2 adds no backend: tiers 2/3 are honest client-side affordances ("wired
  in Phase 3/5"), not fake network calls. Front-end code never holds a provider
  key.

### Navigation, motion & continuity
- Selecting an entry performs a **real navigation** to a URL-addressed page
  (RESTful; cacheable/bakeable; no-JS degrades to a plain link). The hero is an
  entry point, not a persistent app shell.
- Any page reached from the hero carries `?from=hero` and renders a return CTA;
  pages without the param don't.
- **Cinematic navigation, no router** (ADR 0010 decision 4): real links, real
  URL/back-forward/deep-links. Cross-document View Transitions
  (`@view-transition { navigation: auto }` + `view-transition-name`) where
  supported — the destination `<h1>` named statically, the clicked title named
  in `pageswap`, the home hero named so its `::view-transition-old/new(hero)`
  pan out and back. Where unsupported (Firefox), a `sessionStorage`-flagged
  entrance/exit: a short exit before `location.assign`, then a parser-blocking
  inline `<head>` script flies the `<h1>`/hero in from the source rect before
  first paint. Both guarded by `prefers-reduced-motion`; the two paths never
  both run. `.scratch/pwa-loading` tracks the offline/instant-load work that
  closes the fallback's seam.

### Motion vocabulary
- **Idle drift**: slow (~20px/s) vertical loop; pauses on hover/focus; freezes
  under reduced-motion.
- **Settle**: default is a fast, confident snap in place (~250–350ms, spring) —
  the stream simply becomes the answer. The longer "searching" spin (with
  vertical motion blur) is reserved for low-confidence queries, and spins only
  through **real adjacent index entries** — never invented filler titles.

### Responsive
- **Wide**: three-zone row — prompt | Silhouette | Thought Stream.
- **Narrow**: collapse to a stack — Shrunk Silhouette as a top rule, prompt
  below, Stream as a scrollable list (44px targets, real combobox a11y).
- The Silhouette is the face-line separator at desktop widths; on mobile it
  shrinks rather than disappears.

### Nav auto-hide
- Home-only: nav visible on land, then hidden; reveals on hover and keyboard
  focus-within. Never `display:none` (stays in the a11y tree).

### Identity placement
- Role/bio/social lead into the Latest/Featured sections below the fold.

## Out of Scope

- Orama search index, entity ingestion, real three-tier resolution (Phase 3/5).
- Server endpoints / SSR — deferred to the phases that need them (3/5); Phase 2 adds none.
- Promoting motion to a Design System layer (component-local for now).
- Delivering an Open Question to the author (the handoff endpoint is Phase 5);
  Phase 2 keeps the four lifecycle copy states in the copy module but does not
  render the accept/decline UI.
- A combined "Feeds" page.

## Ticket Map

| Ticket | Title | Status |
| --- | --- | --- |
| 01 | HeroThoughts core (head, swarm, ladder, seed, routes, CTA, nav, responsive) | done |
| 02 | Retire the conversation vocabulary (shared seam: `?from=hero`, no echo, speech cue, renames) | open |
| 03 | Warm design & composition (Silhouette + Thought Stream, theme, callouts) | open |
| 04 | Cinematic navigation (drift, settle, view transitions + Firefox fallback) | open |
| 05 | Theme override hook in `@w-n-c/layout` (shared seam, blocks 03) | open |

The former conversation-restore ticket is **deleted** — the surface is
stateless (ADR 0010).

## Verification

- `bun test`, `bun run build`, and `bun run typecheck` green.
- `src/lib/resolution.ts` unit-tested for all three tiers + ranking.
- axe-core WCAG 2.1 AA on built routes remains 0 violations; combobox semantics
  covered by component tests.
- Contrast verified for both color-schemes against ADR 0011's table.
- No inline styles or `<style>`/bespoke classes in `src/pages/` or
  `src/layouts/` (ADR 0003 holds).
- Reduced-motion, keyboard, and touch behavior verified for input, stream, and
  nav reveal. No-JS: entries are plain links; navigation works without JS.
