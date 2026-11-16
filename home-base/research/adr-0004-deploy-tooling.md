# Deploy tooling research: vendor-agnostic static site IaC

**Status:** superseded for the IaC landscape by
`.scratch/research/adr-0004-deploy-tooling-pass-2.md`. This file's
static-upload notes (rclone, bxSites, wrangler) remain accurate.

**Status (original):** incomplete — scoped too narrowly. Needs a second pass.
**Date:** 2026-11-15 (initial pass)
**Context:** ADR 0004 deploy half. The user does not want Wrangler/Cloudflare
lock-in, is skeptical of Terraform downsides, and wants something vendor-agnostic.

**Caveat:** This initial pass only surveyed the Terraform lineage (Terraform,
OpenTofu, Pulumi, SST, CDKTF). It missed Terranix, Winglang, Nitric, and other
tools outside that ecosystem. A second research pass covering the full
landscape is required before the IaC decision can be made. Do not treat the
options listed here as exhaustive.

---

## The real question, sharpened

For a **static Astro site** (a folder of `.html`/`.css`/`.js`/assets), the
deploy step is literally "upload `dist/` to object storage + invalidate CDN."
The question is whether you also need **infrastructure-as-code** for the
resources *around* that folder: DNS records, the S3 bucket itself, the CDN
config, TLS certs.

These are two different problems. Most tools conflate them. Your situation is
the minimum case: a single static folder, no backend, no database, no functions.

---

## TL;DR — recommendation

**The deploy step itself: `rclone sync dist/ <remote>:<bucket>/`.** It's
vendor-agnostic (works with AWS S3, Cloudflare R2, Backblaze B2, Google Cloud
Storage, any S3-compatible API, FTP, SFTP, local…), one command, no lock-in,
zero configuration beyond a single `rclone.conf`. If you switch hosts, you
change one line in the config.

**For IaC (DNS, bucket creation, CDN config): you don't need it yet.** A static
site with a single bucket/domain is a one-time setup, not something that needs
code to provision repeatedly. But if you *want* IaC for reproducibility, the
two non-Terraform options are Pulumi (TypeScript) or OpenTofu (HCL).

**Longer-term, the Tangled-native deploy path is still unfolding.** Tangled
has no built-in static-site deploy yet; spindle handles CI, but where the
build output goes is still your decision. AT Protocol PDS could theoretically
serve static content, but this is speculative today.

---

## What's actually available (the landscape, 2026)

### The IaC tools

| Tool | License | Language | Static site fit | Verdict |
| --- | --- | --- | --- | --- |
| **Terraform** | BSL 1.1 (IBM) | HCL | ✅ works, but BSL license + IBM ownership contradicts "off corporate" | Skip |
| **OpenTofu** | MPL 2.0 (Linux Foundation) | HCL | ✅ same providers, drop-in Terraform replacement | Viable if you prefer HCL |
| **Pulumi** | Apache 2.0 | TypeScript, Go, Python, C#, Java, YAML, HCL | ✅ works, TS-native, runs any Terraform provider | Viable (TS matches your stack) |
| **SST** | Open source | TypeScript (Pulumi engine) | Leans AWS; v3+ has Cloudflare but still AWS-centric | Overkill for static |
| **CDKTF** | Dead — archived Dec 2025 by HashiCorp | — | — | Don't touch |

Sources: [Pulumi blog on Terraform alternatives](https://www.pulumi.com/blog/best-terraform-alternatives/),
[Terraform vs OpenTofu vs Pulumi 2026](https://techiarvind.com/blog/terraform-vs-opentofu-vs-pulumi/),
[CDKTF deprecation notice](https://www.pulumi.com/blog/cdktf-is-deprecated-whats-next-for-your-team/).

### The static-upload tools (the "deploy step" itself, no IaC)

| Tool | What it does | Vendor-agnostic? | Notes |
| --- | --- | --- | --- |
| **rclone** | `rclone sync dist/ remote:bucket/` — S3, R2, B2, GCS, SFTP, FTP, local, 40+ backends | ✅ yes, fully | Your best option. One binary, one config, no lock-in. |
| **s3cmd / awscli** | `aws s3 sync dist/ s3://bucket/ --delete` | ⚠️ S3-API-only (covers R2, B2 with endpoint flag) | Works, but rclone is better for multi-provider |
| **wrangler** | Cloudflare CLI (Pages or Workers deploy) | ❌ Cloudflare-locked | You explicitly don't want this |
| **bxSites** | `bxSites deploy` — S3, R2, B2, Spaces, GCS, FTP, SFTP, Cloudflare Pages, local, GitHub Pages | ✅ yes, very broad | Interesting but JVM-based (Java dependency) |
| **Shipyard** | `shipyard deploy` — aims at Fly.io Machines + S3 artifacts | ⚠️ Fly.io-centric | Overkill; targets app servers, not static |
| **self-hosted (hostedat, Servebolt)** | Run your own static server binary | ✅ full ownership | "Own your infra" approach; needs a VPS + maintenance |

Sources: [bxSites deployment docs](https://bxsites.io/guides/deployment/index.html),
[filelift — S3-compatible upload CLI](https://github.com/EaveLuo/filelift),
[hostedat — self-hosted static hosting](https://docs.hostedat.ditto.moe/).

### The honest answer: you probably don't need an IaC tool

Your infrastructure is: one S3 bucket (or R2 bucket), one domain with DNS
pointing at it, maybe a CDN in front. That's **three resources**, set up once.
You could configure them through a web dashboard, or write a 30-line Pulumi
TypeScript file to codify them. Either works. You don't need Terraform,
OpenTofu, SST, or any multi-cloud orchestration framework for this.

**The deploy step itself** (what runs in CI after `scripts/ci.sh` passes):
`rclone sync dist/ <target>`. That's it. Change `target` when you change hosts.

---

## Recommendation structure

```
                    ┌─────────────────────┐
                    │  scripts/ci.sh       │  ← typecheck + test + build
                    │  (Tangled spindle)   │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  rclone sync dist/   │  ← vendor-agnostic upload
                    │  → <s3-compatible>   │     one binary, any cloud
                    └────────┬────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │  Object storage + CDN    │  ← R2, S3, B2, Spaces...
              │  (configured once,       │     setup once, no IaC needed yet
              │   optionally via Pulumi) │
              └──────────────────────────┘
```

**The Tangled-native piece:** spindle has no deploy built-in (yet). The workflow
you just wrote (`ci.yml`) handles the gate; the deploy step after it is `rclone`
for now. Tangled may add static-site hosting later — when it does, swap the
`rclone` line for whatever they expose. The gate script never changes.

---

## Open questions for the grilling

- **Do you want IaC at all right now**, or is "configure S3 bucket once through
  the web dashboard, `rclone` on every deploy" enough? (Recommendation: start
  with dashboard + rclone; add Pulumi/OpenTofu later if you ever need to
  recreate or replicate the stack.)
- **Deploy target:** which object storage? R2 (Cloudflare, free egress, but
  Cloudflare corporate), Backblaze B2 (cheap, indie), or something else?
- **CDN:** do you need one for a personal site, or is direct object-storage
  serving (with a domain) sufficient?
- **Do you want the deploy automated in CI**, or just the gate (manual deploy)?
  The Tangled workflow you have today is gate-only; adding `rclone sync` as a
  final step makes it CI+deploy.

## Uncertainty log

- Tangled static-site hosting: no native feature yet; spindle is CI-only today.
  This may change.
- bxSites: actively maintained (2026 releases) but JVM dependency is unusual for
  a JS/TS project.
- AT Protocol PDS as static host: speculative; no documentation or reference.