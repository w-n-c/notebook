# Agent environment — retro 2026-11 slices

Source: the hero-drum retro (first drum shipped wrong, a `pkill` that killed its
own shell, CSS changing under the agent, stale timings, a 701-line component).
Tickets 03–08 here, plus hero-thoughts #10 and design-system-architecture #08/#09.

| Retro item | Slice |
| --- | --- |
| 701-line component, no size rule | hero-thoughts #10 → agent-environment #03 |
| `pkill` killed the run; five ad hoc probes | agent-environment #04 |
| Layout by hand-written `position:` / JS geometry | design-system-architecture #08 → agent-environment #08; #05 (standard) |
| Duplicate styling | agent-environment #06; design-system-architecture #09 |
| Prototype pixels in CSS (432px) | agent-environment #07 |
| Stale timings in docs | agent-environment #05 |

Dropped on purpose: a global `tdd` skill edit (done by hand), extending
`domDuplication` to CSS, a focus-ring token, and a 432px pin test (the height is
fluid, not documented).
