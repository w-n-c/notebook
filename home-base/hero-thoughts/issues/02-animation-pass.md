# 02 — HeroThoughts Animation Pass (backlog)

**What to build:** The deferred cinematic motion: view-transition pan-in on suggestion select and zoom-out on return, the prompt-triggered pan-in-and-swarm-order coalesce, and the nav fade-out/slide-in.

**Blocking Edges:** Blocked By #01.

**Acceptance Criteria:**

- [ ] Selecting a suggestion runs a View Transition that zooms from the selected chip into the destination view; the return CTA runs the reverse zoom-out onto `/`.
- [ ] Prompt submit animates chips entering and coalescing into best-fit order (desktop swarm).
- [ ] Nav fade-out after landing and slide-in on reveal use motion tokens.
- [ ] All three honor `prefers-reduced-motion` (fall back to instant); no-JS still degrades to plain navigation.

**Status:** `open` (backlog)