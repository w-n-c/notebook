# 02: Unify the Guardrail Verification Module

**What to build:** Extract a pure `src/lib/guardrails.ts` verifier that evaluates all ADR 0003 rules (secret scanning + the six architectural invariants) over an explicit `{ files, diff }` input and returns structured violations. Drive it from two thin adapters: the pre-commit bash script (over staged index contents) and `tests/guardrails.test.ts` (in-memory fixtures + repo tree).

**Blocked by:** None (can start immediately).

**Blocks:** None. Independent of 01 and 03.

**Status:** done

## Context

`scripts/git-guardrails.sh` checks only 2 of the ADR 0003 architectural rules on staged index contents (and its secret regex is untested), while `tests/page-shell.test.ts` checks all of them against working-tree files and spawns temp git repos to exercise the bash script. There is no single place that defines "what the guardrails are". See `docs/adr/0003-ai-coding-agent-guardrails-and-verification.md` §1–§2.

## Acceptance Criteria

- [x] New pure module `src/lib/guardrails.ts` exposes the whole rule definition and no I/O:
  ```ts
  export interface GuardrailFile { path: string; content: string }
  export interface GuardrailViolation { rule: GuardrailRule; path: string; message: string }
  export function verifyGuardrails(input: { files: GuardrailFile[]; diff?: string }): GuardrailViolation[]
  export const GUARDRAIL_RULES
  export const ALLOWED_UTILITY_CLASSES
  export function extractLayerBlock(css: string, layer: string): string | null
  export function extractSubtreeFingerprints(astroSource: string, minDepth?: number): string[]
  ```
  It imports no `node:fs`, no `node:child_process`, and no Astro modules. Repo/staged file collection lives in the two adapters (the script and the test), both of which pass `{ files, diff }` into the pure function.
- [x] `verifyGuardrails` implements these rules with stable `rule` ids:
  1. `secret-pattern` — `AIzaSy…` (Gemini), `sk-…` (OpenAI/Anthropic), `AKIA…` (AWS), and generic `bearer` token patterns found in `diff` (fall back to file contents when `diff` is omitted).
  2. `inline-style` — inline `style="…"` in `src/components/layout/**/*.astro`, `src/layouts/**/*.astro`, `src/pages/**/*.astro`.
  3. `style-block` — `<style>` blocks in `src/layouts/**/*.astro` and `src/pages/**/*.astro`.
  4. `utility-class` — non-allow-listed `class="…"` values (allow-list: `split-bottom`, `split-top`, `split-right`, `split-left`, `no-measure`, `visually-hidden`, `sr-only`, `theme-light`, `theme-dark`) and dynamic `class={…}` / `class:list={…}` in `src/layouts/**/*.astro` and `src/pages/**/*.astro`.
  5. `global-css-layer` — `src/styles/global.css` contains no `@layer components` block and no `.class` selectors inside `@layer base`.
  6. `bits-ui-isolation` — `bits-ui` imports only under `src/components/ui/`.
  7. `dom-duplication` — no multi-element DOM skeleton (≥ 4 nested tags) repeated ≥ 3 times across `src/pages/**/*.astro` (move/reuse the existing fingerprint walker).
- [x] `scripts/git-guardrails.sh` collects staged index contents via `git show ":$file"` for changed `src/**` files, passes them plus `git diff --cached` to the verifier via a small `bun` entry point, exits non-zero on any violation with the rule id + path, then runs `bun test` as today. All seven rules now run at commit time.
- [x] `tests/guardrails.test.ts` unit-tests every rule with in-memory fixtures, including secret detection (which has no coverage today), and collects the live `src/` tree (`collectFiles` + `readFileSync`) to assert `verifyGuardrails({ files })` is clean.
- [x] `tests/page-shell.test.ts` is slimmed to the layout shell only (`global.css` semantic axioms + built `Layout.astro` output); the temp-git-repo subprocess tests and the architectural-invariant assertions move to/are covered by `tests/guardrails.test.ts`.
- [x] `scripts/git-guardrails.sh` exits non-zero for a staged violation of each rule and zero for the clean tree.
- [x] `bun test` and `bun run build` pass with 100% green assertions.
