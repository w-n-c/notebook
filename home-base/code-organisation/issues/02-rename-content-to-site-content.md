# 02 — Rename `content.ts` to `site-content.ts`

**What to build:** the shared Content & Site Metadata module is renamed so its
name matches the glossary: **Content** is the markdown entries, **Site Metadata**
is the identity facts, and the module holds both. Pure rename; no behaviour or
shape change. This is also the prefactor for the Hero and shell moves, which edit
the same importers. See ADR 0013 decision 8.

**Blocked by:** None (can start immediately).
**Status:** `done`

**Acceptance Criteria:**

- [ ] `src/lib/site-content.ts` exists and `src/lib/content.ts` does not
      (`fd content.ts src/lib` lists only `site-content.ts`).
- [ ] No importer still names the old path: `rg -n 'lib/content\b' src tests e2e scripts packages README.md docs/agents CODING_STANDARDS.md AGENTS.md` returns **0** hits. (Accepted ADRs are historical and are not edited.)
- [ ] `src/content/` (the Astro collections directory) and `src/content.config.ts`
      keep their names; Astro requires both.
- [ ] Test assertions are unchanged: every changed line under `tests/` mentions
      `content` (`git diff -U0 tests | rg '^[+-]' | rg -v '^(\+\+\+|---)' | rg -vi 'content'` returns **0** lines).
- [ ] `README.md`'s description of the module names `src/lib/site-content.ts`.
- [ ] `bun test`, `bun run typecheck` and `bun run build` all exit **0**.
