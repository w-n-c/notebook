# Specification: Agentic Browser Testing

**Status:** `open`

## Problem

Three defects in the HeroThoughts work passed every static check and were only
found by the author looking at the page: the island unmounting at hydration, the
transition flash, and the drift moving ~1px/s. Verification so far is a
hand-rolled 150-line CDP script (`scripts/smoke.ts`) plus four ad hoc copies
written into `/tmp` by an agent that needed to look at the page. Each copy
re-implemented the DevTools protocol, a static server, and screenshot reading.

## Goal

Replace ad hoc browser scripting with one maintained, documented way for an agent
to (a) assert behaviour in a real browser, and (b) look at the page cheaply, with
the page served by the project's real hosting tool.

## Ticket Map

| # | Ticket | Status |
| --- | --- | --- |
| 01 | Research: best practice for agentic browser testing | open |
| 02 | Adopt the tool and port `smoke.ts` | open (blocked by 01) |
