# 05: Headless UI Adapter Seam

**What to build:** A `src/components/ui/` UI Adapter for every interactive widget that bits-ui provides, so no component outside the seam hand-rolls interactive-widget ARIA (ADR 0001 decision 5, ADR 0003). `Combobox` and `Button` already exist for the hero; this ticket tracks the remainder: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Tabs`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Slider`, `DropdownMenu`, `Menubar`, `Accordion`, `Toggle`, `Toolbar`, `Progress`, `ScrollArea`, and any others a feature needs. Each adapter is a small, typed wrapper over its `bits-ui` namespace and leaves layout arrangement to the consumer's Layout Primitive composition (`class` + `data-*`, ADR 0005).

**Blocked by:** None — the seam and its `adapterSeam` guardrail already exist.

**Blocks:** Any feature that needs one of these widgets.

**Status:** open

## Acceptance Criteria

- [ ] Each listed widget has one adapter file under `src/components/ui/`, wrapping the corresponding `bits-ui` primitive with typed props/snippets.
- [ ] Adapters import only from `bits-ui`; no component outside `src/components/ui/` imports `bits-ui` (`bitsUiIsolation`).
- [ ] No component outside `src/components/ui/` renders an interactive-widget role (`adapterSeam`).
- [ ] Adapters expose composition through `class` + `data-*` and contain no viewport `@media` (ADR 0005).
- [ ] `bun run check`, `bun test`, and `bun run build` stay green.
