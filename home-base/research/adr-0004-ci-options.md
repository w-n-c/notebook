# ADR 0004 — CI Options Research (static Astro site, forge undecided)

**Status:** research input for a grilling session. Does **not** decide anything.
**Date:** 2026-11-15
**Scope:** the CI half of ADR 0004 only. Does not choose forge, does not choose hosting product.

## The gate that must run in CI

From `package.json` + ADR 0003:

| Step | Command | Notes |
| --- | --- | --- |
| Typecheck | `bun run typecheck` | `astro sync && tsc --noEmit` |
| Tests | `bun test` | single-flight build, then asserts against `dist/` |
| Build | `bun run build` | `astro build` → `dist/` |

The guardrail engine (`src/lib/guardrails.ts`) is **pure and forge-agnostic**: it takes
`{ files, diff }` and returns violations. `scripts/check-guardrails.ts` is the adapter. So
*what* runs is already portable; the only open question is *what invokes it*.

---

## TL;DR — candidate paths

| Path | What it is | One-line cost | Data ownership |
| --- | --- | --- | --- |
| **A. Forgejo Actions, self-hosted runner** | Forgejo instance + `forgejo-runner` on a box you own; reuse a near-GitHub YAML | medium setup, needs a always-on host + Docker/Podman | ✅ fully yours |
| **B. Tangled (spindle)** | AT-Protocol forge with first-class CI (`spindle`), node/bun via nixpkgs, hosted or self-hosted | low if hosted (free), medium if self-hosted (needs KVM for microVM) | ✅ yours (knot is your PDS) — best AT-Protocol fit |
| **C. Cloudflare build-on-CF / build-in-CI** | Deploy target. Build-on-CF runs only one build command (no test step); build-anywhere + `wrangler` upload is forge-neutral | ~free; CF account | ❌ corporate (Cloudflare) but *deploy*, not *identity* |
| **D. Forge-neutral `scripts/ci.sh` + any trigger** | One script (`typecheck && test && build`); invoked by GitHub Actions now, Forgejo/Tangled/local timer later | ~zero, lowest regret | ✅ no lock-in; identity stays wherever the remote is |

**Recommendation to grill around:** do **D immediately** (it's pure gain and pre-empts lock-in),
then pick between **A** and **B** for the forge/runner when you're ready to leave GitHub.
**C** is orthogonal — it's where the *output* goes, not where CI runs.

---

## 1. Forgejo Actions

- **Maturity (2025–26):** shipped, `Actions` enabled by default since Forgejo v1.21. Forgejo ships the *server*; jobs actually run on a separately-installed **Forgejo Runner**. Source: [admin guide](https://forgejo.org/docs/latest/admin/actions/), [runner config](https://forgejo.org/docs/latest/admin/actions/configuration/).
- **Config semantics:** workflows live in `.forgejo/workflows/*.yml`. The docs are explicit: *"designed to be familiar to users of GitHub Actions, but it is not designed to be compatible."* Many workflows port one-to-one with "minimal changes." Known differences: default runner image is a small Debian+node image (not the big `ubuntu` image); some `github` context keys missing; `permissions:`/`continue-on-error` ignored; OIDC uses `enable-openid-connect`. Source: [GitHub Actions vs Forgejo Actions](https://forgejo.org/docs/latest/user/actions/github-actions/).
- **Runners:** required; label-based (`runs-on`). Three containerization types: `docker`, `lxc`, `host`. **`host` has no isolation** ("a single job can permanently destroy the host"). Source: [runner config](https://forgejo.org/docs/latest/admin/actions/configuration/).
- **bun/node:** works — the runner image is configurable per label (e.g. `docker://node:22-bookworm`), and node actions need Node present in the image. A real-world guide ports a `bun run build` gate + Cloudflare deploy to Forgejo Actions. Source: [Erfi porting guide](https://erfi.dev/guides/porting-github-actions-to-forgejo/), [Using Actions](https://forgejo.org/docs/latest/user/actions/actions/).
- **Hosted option (no self-host):** **Codeberg** runs hosted Forgejo Actions. Caveats: *strict resource/time limits* (tiny=2min, small=5min, medium=10min, "fair use") and jobs queue with others (can wait *hours*), Docker-in-runner unsupported. Source: [Codeberg hosted actions/meta](https://codeberg.org/actions/meta), [runner guide](https://marcduiker.dev/articles/setting-up-a-local-forgejo-runner-for-codeberg/).
- **Relationship to Gitea/Codeberg:** Forgejo is a *soft fork* of Gitea (governed as a commons); Codeberg is the flagship hosted instance. Forgejo keeps Gitea API compatibility, so Forgejo/Gitea bridge tooling is shared.

**Read for your situation:** the honest cost is **running a runner** — a small always-on host with Docker/Podman. Codeberg's hosted runners are too tight for a real Astro test+build (which alone may exceed 5–10 min, and queuing is hours). So "Forgejo" in practice means "self-host a runner."

## 2. Tangled / AT Protocol CI

- **Shipped, not vaporware.** Tangled has a real CI runner called **spindle**, announced 2025-08-06 and documented. Source: [spindle blog](https://tangled.org/blog/ci/), [spindle docs](https://tangled.org/docs/spindles/).
- **What a "knot" is:** the git hosting server — a single Rust binary (`knot-server`) that serves git over SSH/HTTPS **and acts as the atproto PDS for every repo it hosts**. So repo data (issues, pulls, comments, patches) live in *your* repo DID on *your* knot. Source: [knot docs](https://tangled.org/docs/knots/).
- **CI model:** push → knot emits a pipeline event → **spindle** watches the knot, reads `.tangled/workflows/*.yml`, runs steps in parallel workflows. Two engines: `nixery` (fresh Docker/Podman container per step, image built from nixpkgs) and `microvm` (whole workflow in a NixOS microVM, can run services like Postgres). Source: [spindle docs](https://tangled.org/docs/spindles/).
- **bun/node:** yes — dependencies (Node, etc.) come from `nixpkgs`; the docs use Go/Node/Python examples. Source: [spindle blog](https://tangled.org/blog/ci/).
- **Hosted free, or self-host:** *"All Tangled users have access to our hosted spindle instance, free of charge."* Self-hosting a spindle needs Linux+KVM (for microVM) or Docker (for nixery) + a public TLS hostname. Source: [self-hosting spindle](https://tangled.org/docs/spindles/self-hosting/).
- **Secrets:** AT Protocol has no private data; secrets are pushed from appview to spindle over service-auth and stored in the spindle's secret manager (SQLite by default; OpenBao on hosted). Source: [spindle blog](https://tangled.org/blog/ci/).
- **Uncertainty:** Tangled is young (2025-era). Ecosystem/tooling maturity and long-term hosted guarantees are **unproven** vs Forgejo/GitHub. Mark as *early*.

**Read for your situation:** Tangled is the **philosophically cleanest match** (AT Protocol, data ownership, federated, CI included) and has a **free hosted CI** that runs node/bun. The risks are maturity and reliance on a young project, plus the hosted spindle is operated by someone else (though self-hostable).

## 3. Cloudflare CI for a static Astro site

- **Pages vs Workers direction:** Cloudflare's active development is on **Workers** (with static assets); Pages is *"aren't going away, it's just the development going forward will be focused on Workers."* Migration guide exists (`wrangler pages deploy` → `wrangler deploy`). Source: [migrate Pages→Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [Elthevoypra writeup](https://elthevoypra.dev/blog/2025-06-26-publish-static-site-to-cloudflare-workers/).
- **Build-on-Cloudflare (Workers Builds):** runs a two-step process: *(1) Build command* (e.g. `npm run build` / `astro build`) then *(2) Deploy command* (`wrangler deploy`). It runs a **build command**, not a test command — you *could* chain tests into the build command, but that conflates gate and artifact. Source: [Workers Builds config](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
- **Forge-neutral deploy path:** **Direct Upload** with `wrangler pages deploy <dir>` / `wrangler deploy` from *any* CI. **Caveat:** a Pages project created with Direct Upload **cannot switch to Git integration later** (would need a new project). Source: [direct upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [direct upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).
- **Cost/privacy:** static asset serving is free on both; Cloudflare is a large corporate platform (your stated dislike), but it's *deployment*, not *identity* — you can build in a sovereign forge and only push bytes.

**Read for your situation:** use Cloudflare as the **deploy target only**. Build+test in a forge-neutral CI (or locally), then `wrangler` upload. This keeps the corporate dependency to "hosting a static bundle."

## 4. Issues-as-files / forge-independent CI

- **`git-issue` (dspinellis):** minimalist decentralised issue tracker; issues stored as **plain text files under `.issues/`** (which is itself a nested git repo), no server, no DB, optional bidirectional GitHub/GitLab import/export. Source: [dspinellis/git-issue](https://github.com/dspinellis/git-issue/).
- **The broader landscape** (good survey, 2026-08): issues-in-repo approaches span (a) working-tree files (Bugs Everywhere, ditz, GitRoot), (b) nested `.issues/` git repo (git-issue), (c) orphan branches (ticgit, haxy), (d) refs outside `refs/heads/` (git-bug `refs/bugs/*`). Because issues are tracked files/refs, `git clone`, `grep`, `git log`, `git bundle` and **any dumb git host** all work with no extra config. Source: [Nesbitt, "Issues in the Repo"](https://nesbitt.io/2026/08/20/issues-in-the-repo.html).
- **Forgejo/GitHub bridges:** there's now a `git-native-issue` tool with Gitea/Forgejo and GitHub import/export/sync, storing issues under `refs/issues/`. Source: [git-native-issue](https://github.com/remenoscodes/git-native-issue).
- **"CI without a forge":** a bare git remote accepts arbitrary refs; a lightweight runner can poll a branch or be triggered by a pre-push/pre-receive hook. This is essentially "run the gate yourself on a schedule or on push."

**Read for your situation:** your `.scratch/<feature>/issues/*.md` is **already this pattern** — files in (an ignored dir of) a repo. The notebook backup you just built is the natural home. ADR 0004's CI question does not require adopting a forge issue tracker at all.

## 5. Interim / lowest-regret

Given the forge is undecided, the lowest-regret move is to **make the gate a single forge-neutral script** and change only its *trigger* over time:

```
scripts/ci.sh   →   bun run typecheck && bun test && bun run build
```

Then:
- **Now:** a GitHub Actions workflow that just calls `bash scripts/ci.sh` (thin, disposable).
- **Later:** replace that workflow with `.forgejo/workflows/*.yml` or `.tangled/workflows/*.yml`, or a local systemd timer — **the gate script itself never changes.**
- **Deploy:** a separate step (`wrangler deploy`) that any of the above can call.

---

## What stays true regardless of forge choice

1. **One `scripts/ci.sh`** running `typecheck && test && build` is the whole gate; every CI or a local timer just calls it.
2. **`src/lib/guardrails.ts` is already pure** — no adaptation needed to run under any runner.
3. **The Anthropic-ish secret/violation rules are forge-neutral** — they reason over files+diff, not over a forge API.
4. **Deploy is decoupled from CI** via `wrangler` upload; the CI system need not be the deploy system.
5. **Issues stay as files** (your current model); no forge issue tracker is required by CI.

---

## Open items for the grilling

- Accept the "one `scripts/ci.sh`" move now, or wait for the forge decision?
- Forge: Forgejo (mature, self-host a runner) vs Tangled (AT-Protocol fit, young, hosted CI free)?
- Is the *always-on box* needed for either a Forgejo runner or a self-hosted spindle something you want to run?
- Cloudflare as deploy-only (accept the corporate hosting for bytes) — yes/no?
- Do you want the *deploy* automated at all in this phase, or just the *gate*?

## Uncertainty log

- Tangled/spindle maturity and hosted guarantees: **early / unproven** (2025-era project).
- Codeberg hosted-runner queue times: reports of "hours"; limits tiny/small/medium (2/5/10 min).
- Cloudflare Pages long-term: dev focus is Workers; Pages remains but slows.
