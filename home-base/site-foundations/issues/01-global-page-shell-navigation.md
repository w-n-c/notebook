# 01: Global Page Shell, Navigation, and Theme Container

**What to build:** A unified, responsive application shell across all pages with a persistent header navigation bar (`<Cluster>` with branding and active link states), a minimal footer, and automatic dark/light color-scheme support using semantic tokens.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Rewrite `src/layouts/Layout.astro` to wrap arbitrary page content in `<header>`, `<main>`, `<footer>`, import `src/styles/global.css` at the layout root, and remove the existing unlayered `<style>` block.
- [x] Navigation connects Home (`/`), Notes (`/notes`), and Projects (`/projects`) with accessible links and active route styling.
- [x] Header uses `<Cluster>` with auto-margin splitters (`split-right`) to cleanly distribute branding and navigation items.
- [x] Apply `background-color: var(--bg-canvas); color: var(--text-main);` to `body` in `src/styles/global.css` for automatic dark/light system theme switching.
- [x] Exempt `section, article, aside, ul, ol` from the `65ch` universal measure cap in `src/styles/global.css`, add prose vertical rhythm for rendered markdown, and add `pre { overflow-x: auto; max-inline-size: 100%; }`.
- [x] Update `scripts/git-guardrails.sh` to inspect staged index contents (`git show ":$file"`) rather than working-tree files, and verify `bun test` passes cleanly.
