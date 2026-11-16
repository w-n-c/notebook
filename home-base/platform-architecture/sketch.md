# Platform Architecture Sketch

**Status:** `open` — working sketch, to be deepened per-slice.
**Date:** 2026-11-15 (updated 2026-11-16: Cloudflare ceilings corrected, IaC decided)
**Context:** Home Base is not a static site. It is a personal platform integrating
AT Protocol identity, dynamic search/views, data extraction pipelines, AI
workflows, cross-device sync, smart home, social bridges, and a dev portfolio,
spanning half a dozen+ languages with an unbounded runtime surface.

## Principles (ordered by priority)

1. **Cloudflare default.** Every workload starts on Cloudflare unless it hits a
   hard technical ceiling. Cloudflare's edge model is closest to zero-egress,
   zero-idle-cost for the kind of personal-scale, bursty workloads this platform
   runs.
2. **Egress-aware.** Data gravity matters. Compute and storage for a given
   workload must be co-located on the same provider; cross-provider data
   pipelines pay egress tax at personal scale. This is the single biggest
   architectural constraint.
3. **Open source over managed.** Prefer open source tooling (Redpanda over
   Confluent, self-hosted PostgreSQL over Cloud SQL, Tangled over GitHub) unless
   the managed offering is genuinely cheaper in money + time.
4. **Scale to near-zero.** Every workload must be able to idle at $0/mo.
   Serverless containers, edge functions, and commodity VPS with suspend
   semantics; no always-warm clusters unless the workload demands it.
5. **Multi-language by design.** The platform does not prescribe a runtime.
   Cloudflare catches JS/TS/Wasm workloads; everything else lands on Cloudflare
   Containers or a commodity VPS.

## Provider boundaries (what lands where)

### Cloudflare (default — the "edge platform")

| Capability | Service | Limits that matter |
|---|---|---|
| Static assets + SSR | Workers + Static Assets, or Pages | JS/TS/Wasm runtimes only |
| Dynamic compute (JS/TS) | Workers | CPU time 10 ms free / 5 min paid; 128 MB per isolate; HTTP wall-time unlimited, cron/queue 15 min |
| Any-language compute | Containers (GA 2026) | Any Docker image, full Linux, scale-to-zero, active-CPU pricing |
| Durable compute (JS/TS) | Durable Objects | Stateful, single-threaded, JS/TS only |
| Durable orchestration | Workflows | Unlimited wall-time per step, sleep up to 1 yr, 1 GB state |
| Object storage | R2 | S3-compatible, zero egress |
| Relational DB (light) | D1 | SQLite at edge, 10 GB per DB, single-threaded |
| Relational DB (heavy) | Hyperdrive → external Postgres | Pools + caches an external Postgres/MySQL (VPS, Neon, Supabase) |
| Queue / event bus | Queues | At-least-once delivery, pull-based consumers |
| Pub/sub | Workers Pub/Sub (or Queues for fan-out) | |
| AI inference | Workers AI | Pre-trained + LoRA-adapted serving; no training |
| Cron / scheduled | Workers Cron Triggers | 15 min wall / 5 min CPU |
| DNS + CDN | Cloudflare DNS + CDN | The one non-negotiable Cloudflare service |

**Hard ceilings that push a workload off Cloudflare:**
- Needs a relational store beyond D1's 10 GB / single-threaded ceiling → external
  PostgreSQL (VPS or Neon/Supabase) fronted by Hyperdrive
- Needs GPU training or full fine-tuning (LoRA *serving* stays on Cloudflare) →
  GCP or rented GPU — the one real GCP trigger
- Needs inbound raw TCP / custom protocols (IRC, Matrix, PDS) → VPS
- Workers CPU/memory limits are *not* a ceiling: Workflows (unlimited wall per
  step) and Containers (any language, real RAM/CPU) absorb those workloads

### Google Cloud (dormant — "wake on GPU training")

No current slice needs GCP. The only workload that wakes it is GPU training /
full fine-tuning (LoRA serving is on Cloudflare). If woken:

| Capability | Service | Why not Cloudflare |
|---|---|---|
| GPU / ML training | Vertex AI or GCE + GPU | Not available on Cloudflare |

What used to imply GCP is now covered on Cloudflare: any-language containers and
long/batch jobs → **Containers** + **Workflows**; full relational → **D1** or
**Hyperdrive → external Postgres (VPS/Neon)**; LLM inference and fine-tuned
serving → **Workers AI + LoRA adapters**.

**Egress guard (if GCP is woken):** a service on GCP should only talk to Cloudflare via the user
(HTTP request/response, not background data pumping). If two services both live
on GCP, they talk over internal networking (no egress). If a GCP workload needs
to push data regularly to Cloudflare (R2/D1), the egress cost must be calculated
and may force the workload onto Cloudflare or self-hosted.

### Self-hosted / commodity VPS (the "platform sovereignty" layer)

| Capability | Service | Why not GCP/Cloudflare |
|---|---|---|
| AT Protocol PDS | Tangled knot, or raw PDS binary | Identity sovereignty; runs anywhere with a port |
| Kafka-compatible streaming | Redpanda (single-node) | Egress-free if co-located with producers/consumers |
| Bespoke services (any lang) | systemd units, Docker Compose, or k3s | Full control, egress-free, any runtime |
| Matrix / IRC / Discord bridges | maubot, matterbridge, etc. | Long-lived connections, custom protocols |
| Smart home hub | Home Assistant or similar | Local-network access |

This layer exists for three reasons:
1. **Egress economics:** if data needs to move between services at volume, a
   single VPS with all of them co-located is cheaper than cross-cloud egress.
2. **Protocol constraints:** long-lived TCP connections (IRC, Matrix bridges),
   custom protocols, and local-network access (smart home) don't fit serverless.
3. **Sovereignty:** the PDS, forge, and identity surface should run on
   infrastructure you own, not a corporate cloud.

## Service map (current + planned, by slice)

```
Slice 1 (done): static Astro site
Slice 2 (next):  Brain Hero SVG + speech bubble
Slice 3:         Hybrid search (Orama BM25 + vectors)
                 Dynamic Views (Svelte on Astro server)
                 Entity record ingestion (Deezer, GCal, Letterboxd)
Slice 4:         Obsidian staging → content pipeline
                 Agent scrubbing scripts
Slice 5:         LLM synthesis endpoints
                 Private notes authentication

─────────────── Cloudflare (default) ───────────────
  Astro server (Workers or Pages Functions)
  Brain Hero (static SVG, no compute)
  Search index (D1 or R2 + Workers for query)
  Dynamic Views (Workers rendering Svelte SSR?)
  Static assets, DNS, CDN
  Workers AI (inference + LoRA serving for lightweight LLM tasks)
  Queues (event triggers for ingestion pipelines)
  Workflows (durable orchestration for Slice 4/5 pipelines)
  Containers (any-language fallback, replaces Cloud Run)
  Hyperdrive → external Postgres (if D1 is outgrown)

─────────────── Google Cloud (dormant) ───────────────
  (nothing today; only GPU/fine-tuning training would land here —
   not in the current slice map)

─────────────── Self-hosted / VPS ───────────────
  AT Protocol PDS (Tangled knot or standalone)
  Redpanda: event-driven ingestion pipeline backbone
  Data extraction workers (Deezer/GCal/Letterboxd → internal events)
  Matrix/IRC/Discord bridges
  Smart home hub
```

## Open questions (to resolve per-slice, not now)

- Can Astro run SSR on Cloudflare Workers, or does it need a container?
- Orama search index: fits in D1 or needs a dedicated service?
- Dynamic views: prerendered + hydrated for the predictable set; query-time Assembled Views (generate-and-bake cache, promote popular ones) for novel queries, or SSR on Workers?
- PDS hosting: Tangled knot on a VPS, or a managed PDS provider, or self-built?
- Egress cost modeling: at what data volume does GCP → Cloudflare egress become
  a meaningful line item? (Answer: probably never at personal scale — R2 egress
  is free, GCP egress for a few GB/month is negligible. The constraint is
  architecture hygiene, not cost panic.)
- Secrets: resolved in ADR 0004 — sops-nix in repo is the source of truth; provider stores are runtime copies.

## IaC / deploy tooling

**Decided (ADR 0004, 2026-11-16): Nix-native.**
- Cloud seams provisioned with **Terranix → OpenTofu**; state in **R2** (tofu ≥ 1.10 lockfile), encrypted.
- VPS managed with **NixOS + deploy-rs**, bootstrapped via `nixos-anywhere`.
- One flake-parts `flake.nix` in `home-base/infra/`; secrets via **sops-nix** (age) in the repo.
- **Provision/manage from the desktop**; **artifact deploy** (`rclone`, later `wrangler`) in spindle CI.

Rejected: Terraform (BSL 1.1), Pulumi (single vendor, bridged Cloudflare
provider), SST (Cloudflare-ergonomic but a Pulumi layer with second-class
GCP/VPS), Wing / Nitric / Encore / Serverless (no Cloudflare or VPS coverage;
uniform app-runtime abstraction). Research:
`.scratch/research/adr-0004-deploy-tooling.md` + `-pass-2.md`.