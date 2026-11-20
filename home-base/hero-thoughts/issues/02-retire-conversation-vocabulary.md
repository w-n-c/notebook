# 02 — Retire the Conversation Vocabulary (Shared Seam)

**What to build:** Remove the "conversation / chat / swarm / echo / voice" vocabulary from `src/` and its tests so tickets 03 and 04 build on the Silhouette + Thought Stream model (ADR 0010) instead of the first-build one. Behaviour-preserving apart from the removed echo; no visual redesign (that is #03).

**Blocking Edges:** Blocked By #01.
**Blocks:** #03, #04.

**Acceptance Criteria:**

- [ ] The `?from=chat` marker becomes `?from=hero`: `FROM_CHAT_PARAM/VALUE`, `isFromChat`, `withFromChat` in `src/lib/navigation.ts` are renamed to the hero equivalents; `ReturnToChat.astro` becomes `ReturnToHero.astro` (and its `.return-to-chat` class and doc comment); `Layout.astro` imports it under the new name. The marker stays the JS-free, shareable trigger for the return CTA.
- [ ] `HeroConversation.svelte` is renamed so "Conversation" is gone from the island's name, import, and doc comments (`HeroThoughts.astro` already owns that name; the island's name is chosen at implementation).
- [ ] The prompt echo (`data-prompt-echo`, `.prompt-echo`, the `submitted` state) is removed; a Clear control replaces it (ADR 0010 decision 1).
- [ ] `voiceLine` / `VOICE_LINES` / `.voice` become the speech cue (`speechCue`, `SPEECH_CUES`), and the cue strings move into the single editable copy module (see #03).
- [ ] The `thought-swarm` listbox id and every "swarm" name/comment/aria-label become "thought stream"; the `HeroThoughts.astro` SVG label no longer says "Hollow … face holding the thought swarm", and the SVG is `aria-hidden` decoration (the speech cue and stream carry the meaning).
- [ ] `tests/hero-thoughts.test.ts` and `tests/resolution.test.ts` are updated to assert the new names and the absence of the echo; no assertion is deleted without a replacement.
- [ ] `bun test`, `bun run build`, `bun run typecheck` green; guardrails and axe pass.

**Status:** `open`
