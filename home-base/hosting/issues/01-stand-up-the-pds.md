# 01 — Stand Up the PDS

**What to build:** a self-hosted AT Protocol PDS at the owner's domain. The owner
performs the setup; this ticket is the tracker and the blocking edge, not a spec
for the install.

**Why now:** the PDS is the source of truth for entity records (films, books,
music), and it is also required by the self-hosted Tangled deploy, so it blocks
site deployment itself, not only the feeds.

**Context to pull into the development session** (do not re-derive; read first):

- `docs/adr/0004-deployment-forge-and-cloud-strategy.md` — forge, cloud split,
  NixOS + deploy-rs, sops-nix, OpenTofu state in R2. Its open questions include
  "PDS hosting: Tangled knot on a VPS, managed provider, or self-built?".
- `.scratch/platform-architecture/sketch.md` — the sovereignty layer, the
  multi-use VPS, the single `flake-parts` `flake.nix` in `home-base/infra/`.
- `.scratch/research/adr-0004-deploy-tooling.md` and `-pass-2.md`.
- **The owner's earlier Nix-flake / multi-use-VPS discussion and the PDS data
  backup policy.** The repo contains no written backup policy for the PDS; the
  owner will point to where that discussion lives and it is to be linked here
  before work starts.

**Decision left to the owner (not a criterion):** migrate the existing
bsky.social account (official `goat` flow; reversible in principle, "potentially
destructive" if PLC keys are lost) or start a fresh identity. The site needs only
the account's DID as one config value.

**Blocking Edges:** Blocks data-feeds/04, data-feeds/05, data-feeds/06,
data-feeds/07, and site deployment.

**Acceptance Criteria:**

- [ ] `GET https://<pds-domain>/xrpc/com.atproto.server.describeServer` returns
      HTTP 200 over HTTPS with a `did` field (checked with `curl`).
- [ ] The owner's account can write a record (`com.atproto.repo.createRecord`)
      and read it back with the unauthenticated `com.atproto.repo.listRecords`
      (checked with `curl` or `goat`).
- [ ] The host is declared in the repo's Nix flake (`infra/`), per ADR 0004.
- [ ] A backup of the PDS data exists and a restore has been exercised once on
      a scratch machine; the policy is written down and linked from this ticket.

**Status:** `open`
