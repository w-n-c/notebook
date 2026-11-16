# Platform Architecture Sketch

**Status:** `open` — working sketch, to be deepened per-slice.
**Date:** 2026-11-15
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
   Cloudflare catches JS/TS/Wasm workloads; everything else lands on containers
   (Cloud Run) or commodity VPS.

## Provider boundaries (what lands where)

### Cloudflare (default — the "edge platform")

| Capability | Service | Limits that matter |
|---|---|---|
| Static assets + SSR | Workers + Static Assets, or Pages | JS/TS/Wasm runtimes only |
| Dynamic compute (JS/TS) | Workers | 30s wall-clock (non-request), 128MB memory |
| Durable compute (JS/TS) | Durable Objects | Stateful, single-threaded, JS/TS only |
| Object storage | R2 | S3-compatible, zero egress |
| Relational DB (light) | D1 | SQLite at edge, 10GB per database |
| Queue / event bus | Queues | At-least-once delivery, pull-based consumers |
| Pub/sub | Workers Pub/Sub (or Queues for fan-out) | |
| AI inference | Workers AI | Pre-trained models, no fine-tuning |
| Cron / scheduled | Workers Cron Triggers | |
| DNS + CDN | Cloudflare DNS + CDN | The one non-negotiable Cloudflare service |

**Hard ceilings that push a workload to fallback:**
- Needs a runtime other than JS/TS/Wasm → falls back
- Needs >30s execution (non-request path) → falls back
- Needs a real relational database (transactions, joins, extensions) → falls back
- Needs GPU training or fine-tuning → falls back
- Needs persistent TCP connections or custom protocols → falls back

### Google Cloud (fallback — the "heavy compute" layer)

| Capability | Service | Why not Cloudflare |
|---|---|---|
| General containers (any lang) | Cloud Run | Scale-to-zero, any runtime |
| Batch / long-running jobs | Cloud Run Jobs | Multi-hour, any runtime |
| Full PostgreSQL | Cloud SQL or AlloyDB | Transactions, extensions, joins |
| GPU / ML training | Vertex AI or GCE + GPU | Not edge-inference |
| Big durable storage | Cloud Storage | Alternative to R2, egress costs apply |

**Egress guard:** a service on GCP should only talk to Cloudflare via the user
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
  Workers AI (inference for lightweight LLM tasks)
  Queues (event triggers for ingestion pipelines)

─────────────── Google Cloud (fallback) ───────────────
  Cloud Run: LLM synthesis endpoints (Slice 5, long requests)
  Cloud Run Jobs: agent scrubbing scripts (Slice 4)
  Cloud SQL: if D1 proves insufficient for search index
  Vertex AI: if fine-tuning or heavy models needed

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
- Svelte Dynamic Views: compiled to static + hydrated client-side, or SSR on Workers?
- PDS hosting: Tangled knot on a VPS, or a managed PDS provider, or self-built?
- Egress cost modeling: at what data volume does GCP → Cloudflare egress become
  a meaningful line item? (Answer: probably never at personal scale — R2 egress
  is free, GCP egress for a few GB/month is negligible. The constraint is
  architecture hygiene, not cost panic.)
- Secrets management across 3 providers: where does the source of truth live?

## IaC / deploy tooling

**Open — not yet decided.** The landscape is broader than the Terraform lineage
and includes at least:
- Pulumi (TypeScript, Apache 2.0, multi-cloud, imperative)
- OpenTofu (HCL, MPL 2.0, Linux Foundation, declarative)
- Terranix (Nix expression → Terraform JSON config)
- Winglang (cloud-oriented programming language with built-in infra semantics)
- Nitric (cloud-agnostic application framework, code defines infra)
- and others not yet researched.

Initial research at `.scratch/research/adr-0004-deploy-tooling.md` is incomplete
(scoped too narrowly to Terraform alternatives). A second research pass is
needed before this decision can be made. Deferred to a dedicated
grill-with-docs session.