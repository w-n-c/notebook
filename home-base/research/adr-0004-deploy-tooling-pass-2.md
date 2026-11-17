# ADR 0004 §4 — Deploy/IaC tooling, research pass 2 (full landscape)

**Status:** research input for the grilling. Does **not** decide anything.
**Date:** 2026-11-16
**Scope:** the IaC half of ADR 0004, this time across the *whole* landscape.
**Supersedes the scope of** `.scratch/research/adr-0004-deploy-tooling.md`
(which only surveyed the Terraform lineage). That file's static-upload notes
(rclone, bxSites, wrangler) remain accurate and are not repeated here.

---

## Reframing: one "IaC tool" question is really three seams

The earlier pass asked "what deploys the static site?" That conflated three
distinct problems:

1. **Provision** — create/update the cloud resources themselves (R2 bucket, D1
   database, Worker, DNS records, Cloud Run service, GCP project) and keep their
   drift in a state file.
2. **Manage** — configure the self-hosted VPS (what's installed, what services
   run, how they're wired) at the sovereignty layer.
3. **Deploy** — upload built artifacts (`dist/`, a Worker bundle, a container
   image) and cut over. One command, runs after the CI gate.

Most tools do one or two of these well. Forcing one tool to do all three is the
most common way this decision goes wrong.

---

## The landscape, categorized

### A. State-based multi-cloud IaC engines (provision any cloud surface + reach a VPS)

| Tool | License / governance | Language | Cloudflare coverage | GCP | VPS reach | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| **Terraform** | BSL 1.1 (IBM/HashiCorp) | HCL | Mature (provider v5) | Mature | SSH/cloud-init | Skip — license + "off corporate" |
| **OpenTofu** | MPL 2.0, Linux Foundation (+ CNCF sandbox 2025) | HCL | Same v5 provider; first-class | Mature | SSH/cloud-init | **Finalist** |
| **Pulumi** | Apache 2.0, Pulumi Corp | TS, Python, Go, C#, Java, YAML, HCL | Bridged from the Terraform provider (works; "feels like a workaround" per reviews) | Native provider, strong | `command`/`docker`/`kubernetes` providers | **Finalist** |
| **Terranix** | GPL-3.0; ~553★ community | Nix → Terraform JSON | Via Tofu/Cloudflare provider | Via Tofu | NixOS/deploy path in same ecosystem | **Finalist if Nix-native** |
| **Crossplane** | Apache 2.0 | K8s CRDs (YAML) | Provider exists | Provider exists | Needs a K8s cluster | Skip — runs a control-plane cluster to idle, contradicts scale-to-zero |

Key facts:

- **Cloudflare provider v5** is shipped by Cloudflare itself, releases every
  2–3 weeks (v5.20 in June 2026), and covers Workers, Pages, KV, D1, R2,
  Queues, Cron, DNS, Zero Trust, AI Gateway, Pipelines — the whole default
  surface. The `terraform-cf-modules/workers` registry module exists precisely
  because binding wiring (Worker ↔ D1/R2/Queue/KV) is painful in raw HCL.
  It lists `OpenTofu >= 1.12` as a prerequisite, so the Tofu path is real.
- **OpenTofu** is at 1.8–1.12.x, has built-in state encryption, and consumes the
  same ~4,800-provider registry as Terraform.
- **Pulumi** is at 3.x with ~150 native + bridged providers. Its Cloudflare
  provider is a maintained bridge over the Terraform provider (so effectively
  the same resources, wrapped). GCP is a *native* provider (stronger than
  bridged). Individual tier is free; self-managed state backends supported.
- **Terranix** is at 2.9.0 (May 2026), actively maintained, supports OpenTofu,
  and gives the full Nix module system + reproducible builds. Its costs are
  GPL-3.0, a small community, Nix-only, and `${}` string-escaping friction
  (both Nix and Terraform use `${}`).

### B. Infrastructure-from-code / cloud-app frameworks (assume a runtime model; miss the VPS and/or Cloudflare)

| Tool | License | Lang | Targets | The catch |
| --- | --- | --- | --- | --- |
| **SST (ion/v3)** | MIT | TypeScript | Built-in high-level components for **AWS + Cloudflare only**; GCP/VPS = raw Pulumi providers | Engine is Pulumi underneath; small startup; GCP fallback is second-class |
| **Winglang** | MIT, 0.x | Wing (`.w`) | AWS/GCP/Azure via Terraform/CDK; **no Cloudflare** (open issue since 2023) | Vendor (Wing Cloud) shut down Apr 2025, ~$20m raised; ~1-person maintainer |
| **Nitric** | Apache 2.0 | TS, Python, Go, Dart | AWS/GCP/Azure via Pulumi or Terraform-gen; **no Cloudflare** (needs custom provider) | You build apps inside its SDK; resource-import is limited |
| **Encore** | MPL 2.0 | TS, Go (Python "soon") | AWS/GCP only (Azure roadmap); `encore build docker` for self-host; **no Cloudflare** | Encore Cloud is commercial; TS/Go-only |
| **Serverless Framework** | MIT | YAML + JS/TS | AWS-centric; plugin ecosystem elsewhere | Aged; AWS-first with plugins for the rest |

The decisive shared fact: **none of these covers Cloudflare, and none covers the
VPS layer.** They are built around a portable app-runtime abstraction (function/
container + bucket + queue + postgres), which is exactly the abstraction this
platform *doesn't* want — the whole point of the sketch is that placement
(Cloudflare vs GCP vs VPS) is per-workload and is the architecture, not an
incidental. They'd only solve the GCP fallback phase, i.e. the worst-fit corner.

**SST is the one exception worth a look** because it has genuinely good
Cloudflare components (`Worker`, `D1`, `R2`, `Kv`, `Queue`, `Cron`, `Ai`,
`Workflow`, and `Astro`), a `home: "cloudflare"` state option, and TypeScript.
But it *is* a Pulumi layer: adopting SST means adopting Pulumi's engine with a
framework on top, and its GCP/VPS story is "use the raw provider."

### C. VPS / config management (the sovereignty layer)

| Tool | Model | Fit |
| --- | --- | --- |
| **NixOS + `nixos-rebuild --target-host` / `deploy-rs` / `colmena`** (+ `nixos-anywhere` to bootstrap) | Declarative, reproducible, rollback (`deploy-rs` magic rollback); secrets via agenix/sops-nix | Best reproducibility; pairs naturally with Terranix; requires NixOS on the box |
| **Ansible** | Imperative, biggest community, any Linux | Flexible; no rollback semantics; drift-prone |
| **Docker Compose / systemd units / k3s** | Workload-runner | Not IaC — it's *what runs*, to be driven by one of the above |

Scale guidance: `nixos-rebuild --target-host` for 1–2 boxes, `deploy-rs` for
2–5 with rollback, `colmena` for fleets. A personal single-VPS layer is in the
first bucket.

### D. The deploy step (orthogonal, near-term)

`rclone sync` (vendor-agnostic), `wrangler deploy` (Cloudflare bytes),
`gcloud` (GCP). Any IaC choice keeps this decoupled — already covered in pass 1.

---

## Synthetic read (what I'll grill you toward)

For a Cloudflare-default, multi-language, scale-to-zero, egress-aware platform
where placement *is* the architecture:

1. **Category B is out.** Wing (dead vendor), Nitric (no CF), Encore (no CF,
   TS/Go-only), Serverless (AWS-first) all fail on the two surfaces that define
   the platform. SST is the lone partial exception.
2. **The real fork is category A**: OpenTofu (foundation-governed HCL) vs
   Pulumi (permissive, real-language) vs Terranix (Nix, only if you go
   Nix-native). Each covers Cloudflare + GCP + can reach a VPS via
   SSH/cloud-init/docker/command providers.
3. **The VPS half is a separate decision** (NixOS-native vs Ansible vs Compose),
   and it does *not* have to use the same tool as the cloud half.
4. **SST is the temptress**: best Cloudflare ergonomics today (has an `Astro`
   component), but it's a Pulumi layer whose GCP/VPS story is "raw provider" —
   you'd still need the engine decision underneath it.

## Uncertainty log

- Pulumi `cloudflare` provider: officially listed in the registry; every 2026
  comparison describes it as *bridged* from Terraform. Treat as "same resources,
  less native ergonomics."
- SST `home: "cloudflare"` state backend internals (what service stores it)
  not verified — confirm before relying on it.
- OpenTofu's Cloudflare provider release parity with Terraform v5 assumed from
  the cf-modules `OpenTofu >= 1.12` requirement; verify at adoption time.