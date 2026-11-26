# Tangled architecture: what a single-user self-hosted setup actually needs

**Status:** research input. Does **not** decide anything.
**Date:** 2026-11-26 (all docs fetched live from tangled.org this day).
**Scope:** components, PDS obligations, per-component VPS demands, hosted-vs-self-hosted options.

**Minimum viable self-hosted Tangled for one user (5 lines)**

1. Two services: your **existing self-hosted PDS** (account, identity, `org.tangled.*` records) and one **knot** (git + everything about a repo). The docs say the knot is "typically what you want" to self-host ([Choosing what to run](https://tangled.org/docs/self-hosting/)).
2. The knot is one Rust binary, no database — git is the store — needing a DNS name, TLS, and an HTTP + SSH listener ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).
3. **Spindle (CI) is optional** ("You do not need your own spindle to use CI" — [Run a spindle](https://tangled.org/docs/self-hosting/spindle/)); the index/frontend ("appview") is optional too, because tangled.org's works with your knot ([What is Tangled](https://tangled.org/docs/introduction/)).
4. Nothing Tangled-specific is installed on the PDS: it is a normal atproto PDS that happens to hold `org.tangled.*` records — **not** `sh.tangled.*`, renamed in Oct 2026 ([The federated code forge](https://tangled.org/blog/forge/)).
5. The knot must be publicly reachable (HTTPS + SSH) and crawled by the index, otherwise the web app never shows your repos ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).

## 1. The component model

| Component | What it is | Primary source |
| --- | --- | --- |
| **PDS** | "Keeps your account, your identity and your social data." Holds profile, follows, stars, SSH keys, one declaration per repo. | [Choosing what to run](https://tangled.org/docs/self-hosting/), [What is Tangled](https://tangled.org/docs/introduction/) |
| **Knot** | "The server that hosts your git repositories. It is a single Rust binary, `knot-server`, that serves git over SSH and HTTPS and also acts as the atproto PDS **for every repository it hosts**." | [Knot](https://tangled.org/docs/knots/) |
| **Spindle** | "Tangled's CI runner. It watches the knots of the repositories it serves, runs their `.tangled/workflows/*.yml` in microVMs or containers, and serves status and logs over XRPC." | [Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/) |
| **Index ("appview")** | "The index is `bobbin`, the service behind the Tangled API. It keeps everything in memory and rebuilds it from a hydrant stream on every start, so it needs no database." | [Run an index](https://tangled.org/docs/self-hosting/indexer/) |
| **Client** | "Shows repositories, issues, and pull requests in a web browser." | [Choosing what to run](https://tangled.org/docs/self-hosting/) |

Relationship to a PDS: a knot *is* a PDS — but only for the per-repo `did:plc` accounts it mints, and its DID document lists the knot as both `#atproto_pds` and `#tangled_knot` ([Identifiers and Git URLs](https://tangled.org/docs/reference/identifiers/)). Your own account is a separate account on a separate PDS ([What is Tangled](https://tangled.org/docs/introduction/)).

The word "appview" is the *old* architecture: "Until now, Tangled's web UI and backend were a single Go monolith called the `appview`." It is now bobbin (read-only, in-memory index) + a Svelte frontend + "a new set of supporting services" ([The federated code forge](https://tangled.org/blog/forge/); bobbin described as "a read-only, API-only AppView" in [Introducing Bobbin](https://tangled.org/blog/bobbin/)).

**Needed for one user.** Self-host the PDS (you already do) + one knot. Provided by tangled.org's hosted instance: the client at `tangled.org`, the index (`api.tangled.org`, per [Bobbin API docs](https://tangled.org/docs/api/bobbin/)), a default knot, and a default spindle ([What is Tangled](https://tangled.org/docs/introduction/)). Self-hosting the frontend is not yet documented at all — the page reads "Coming soon." ([Run a frontend](https://tangled.org/docs/self-hosting/frontend/)).

## 2. Where the account lives; what the PDS must serve

Your account lives in **your PDS**, not in the knot or the index: "Your account lives with an account provider (a PDS…). It holds your profile, follows, stars, SSH public keys, and a small entry for each repository you own" ([What is Tangled](https://tangled.org/docs/introduction/)). Tangled's own table: Account (PDS) — "Any atproto PDS works" ([same page](https://tangled.org/docs/introduction/)).

What Tangled requires the PDS to serve — only ordinary atproto surface:

- **Records in `org.tangled.*`**, written by the web app/CLI, not by the knot: `org.tangled.actor.profile`, `org.tangled.key.sshKey`, `org.tangled.feed.star`, `org.tangled.graph.follow`, `org.tangled.graph.attestation`, and `org.tangled.repo.declaration` (the owner's half of a repo claim) ([Records](https://tangled.org/docs/reference/records/)).
- **Identity/SSH-key reads**: SSH push works by matching the offered key against `org.tangled.key.sshKey` records "in your PDS", cached for an hour ([Knot](https://tangled.org/docs/knots/)). The knot's outbound table lists `User PDSes | out | Reads identities and SSH keys` ([Knot](https://tangled.org/docs/knots/)).
- **Nothing else.** A PDS is a schema-agnostic record store keyed by `NSID/rkey`; Lexicon is a client-side schema language, not a PDS plugin ([atproto Repository spec](https://atproto.com/specs/repository), [atproto Lexicon spec](https://atproto.com/specs/lexicon)). So a PDS serving your books/films/music lexicons needs no Tangled configuration either.

**Public reachability: yes, effectively required.** The docs never say "your PDS must be on the public internet" in one sentence, but the knot fails without it: the error `knot: couldn't read the account records needed to check your ssh key` is explained as "The knot couldn't reach an account provider" ([Troubleshooting](https://tangled.org/docs/troubleshooting/)), and the fix for a rejected push is "publish the key on the user's PDS" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)). Sign-in is atproto OAuth straight from the browser to your PDS ([Troubleshooting](https://tangled.org/docs/troubleshooting/)), which also needs it reachable. Flagged as inference in *Gaps*.

**Namespace warning:** the lexicons are now `org.tangled.*`; `sh.tangled.*` is legacy. "We have a new set of lexicons, and everything now lives under `org.tangled.*`, replacing the old `sh.tangled.*` records" ([The federated code forge](https://tangled.org/blog/forge/)); the monorepo commit history shows "*: remove unused `sh.tangled.*` lexicons" ([lexicons/org/tangled](https://tangled.org/tangled.org/core/tree/master/lexicons/org/tangled)). Do not design around `sh.tangled.repo`.

## 3. Knot ↔ PDS: same host? who writes what?

**A self-hosted knot does not write to your PDS, and does not need it co-located.** Its complete outbound/inbound peer table is ([Knot](https://tangled.org/docs/knots/)):

| Peer | Direction | What |
| --- | --- | --- |
| User PDSes | out | Reads identities and SSH keys |
| Hydrant | out | Follows `subscribeRepos` |
| PLC directory | out | Submits genesis/update ops for repo DIDs |
| Web | in | `org.tangled.repo.createRepo`, ACLs, `com.atproto.repo.*` writes audienced to the **repo DID** |
| Spindle | out | Follows `org.tangled.git.refs`; clones over HTTPS |
| Knotmirror | in/out | Packs, merges, branch deletes |

No row writes to a user PDS. Your PDS is a *read* dependency for identity and keys, wherever it is hosted, as long as the knot can reach it — the docs treat "user PDSes" as remote peers by definition.

**Where repo records actually live:** on the knot, in the repo DID's account — "Issues, pull requests, comments, reactions and labels are stored next to the code on the knot" ([What is Tangled](https://tangled.org/docs/introduction/)); "Each record is stored either in a user's PDS … or in the repository DID's account on its knot" ([Records](https://tangled.org/docs/reference/records/)). Physically: "The knot has no SQL database. All state lives under `repo.scan_path`" — bare git repos sharded by DID, COBs under `refs/cobs/`, the atproto commit chain at `refs/atproto/commit`, plus a meta-repo holding members, blocklist, repo registry and the firehose cursor ([Knot](https://tangled.org/docs/knots/)).

Anti-forgery mechanism, which is why the PDS matters at all: "Every time you create or edit a record on a knot, the web app also writes an `org.tangled.graph.attestation` record to your own PDS" ([The federated code forge](https://tangled.org/blog/forge/)).

Consequence for you: **repo records are not in your PDS and are not covered by your PDS backups.** Back up instead: master key, `secrets/sealed.bin`, `repos/`, `lfs/` — "git is the database after all, so that one directory is the knot's entire state" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).

## 4. Per-component VPS demands

### Knot

Stated requirements: "A Linux machine that stays online. A DNS name… It becomes the knot's identity, `did:web:`… Your DID, which becomes the first admin. TLS, from a reverse proxy or from the knot itself" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).

- **Ports:** HTTP defaults to `[::]:5555`, SSH to `[::]:2222`. Tangled's client builds clone URLs assuming SSH port 22, so "give the knot port 22 if one can" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)). HTTP can stay on 5555 behind a proxy or move to 443; self-terminating TLS is also supported, and is "the only way to get its HTTP3 support" (open 443/udp) ([same](https://tangled.org/docs/knots/self-hosting/)).
- **TLS:** reverse proxy to `127.0.0.1:5555`, no CORS headers at the proxy, websocket upgrade passed, request-body limits raised for pushes/LFS; set `xrpc.trusted_proxy_header` or every client is rate-limited as one ([Run a knot](https://tangled.org/docs/self-hosting/knot/)). Caddy/Nginx examples and an ACME (TLS-ALPN-01) mode exist ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).
- **Disk:** git repos under `repo.scan_path` plus an LFS store (`lfs.store_path`, "now-required") also used for "atproto record attachments… and soon LOPs objects"; "if you do plan to have massive files, consider putting the LFS folder on a different disk entirely" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).
- **Memory/CPU:** no sizing guidance anywhere in the docs. Only knobs: `[resources] max_threads` (default `0` = available parallelism) and `max_memory_bytes` (default `0` = derived from the cgroup limit or available memory) ([Knot configuration](https://tangled.org/docs/reference/knot-config/)). A Tangled co-founder describes the knot as "headless… super light on resources to run" ([HN thread, 2026-10-30](https://www.betterhackernews.com/item/50305573)).
- **Inbound from the wider network:** relays and the index must crawl it — `knot-server doctor` "checks that relays can crawl the knot", with `POST https://index.tangled.network/xrpc/com.atproto.sync.requestCrawl`, then "add the knot under Settings → Knots" ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)).
- **Outbound:** user PDSes, PLC directory (`atproto.plc_directory`, default `https://plc.directory`), a hydrant for `subscribeRepos` ([Knot](https://tangled.org/docs/knots/)).
- **Deployment:** NixOS module `knot-rs`, or container `atcr.io/tangled.org/knot:2` running as uid 1000 (the `latest` tag is the Go knot — "do not use it") ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/), [Run a knot](https://tangled.org/docs/self-hosting/knot/)).

### Spindle

- **Requirements, verbatim:** "Linux with KVM for the `microvm` engine, or Docker for the `nixery` engine. A recent `git`. A public hostname with TLS." ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)). The quick-start repeats "A Linux machine with KVM that stays online" plus a DNS name and reverse proxy ([Run a spindle](https://tangled.org/docs/self-hosting/spindle/)).
- **KVM is for microvm:** NixOS module "enables the `vhost`, `vsock` and `vhost_vsock` kernel modules and puts `qemu`, `e2fsprogs`, `slirp4netns`, `iproute2` and `util-linux` on the service's `PATH`" ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)). The `nixery` engine instead needs "A fresh Docker or Podman container for each step" ([Engines](https://tangled.org/docs/spindles/engines/)). Note `SPINDLE_SERVER_DOCKER_SOCKET` mounts the host docker socket into nixery containers and "Gives authors root on the host" ([Spindle configuration](https://tangled.org/docs/reference/spindle-config/)) — do not set it on a box you care about.
- **Sizing:** each workflow is bounded by `WORKFLOW_VCPUS`/`WORKFLOW_MEMORY_MIB`/`WORKFLOW_DISK_MIB`, with the shipped images described as "2 vCPU, 4 GiB" and a "`SPINDLE_MICROVM_PIPELINES_MAX_TOTAL_MEMORY_MIB`" cap on the runner ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)). Per-user/per-repo caps and CI-minute quotas exist ([same](https://tangled.org/docs/spindles/self-hosting/)).
- **Inbound or polling? Both.** Outbound: "The spindle watches the Jetstream for changes to repositories, collaborators, pull requests and patches" and reads records from the knot, with `SPINDLE_SERVER_JETSTREAM_ENDPOINT` defaulting to `wss://jetstream1.us-west.bsky.network/subscribe` ([How CI works](https://tangled.org/docs/spindles/), [Spindle configuration](https://tangled.org/docs/reference/spindle-config/)). Inbound: "Pushes and manual runs reach the spindle as an `org.tangled.event.notifyEvent` call. Only the repository's own knot can send a push." ([How CI works](https://tangled.org/docs/spindles/)). That inbound call is why it needs a public TLS hostname; the repo's `org.tangled.repo.manifest` names the spindle ([same](https://tangled.org/docs/spindles/)).
- **State:** SQLite (`spindle.db`), `repos/`, `/var/log/spindle`, repo checkouts, an embedded hydrant dir (`SPINDLE_SERVER_HYDRANT_DIR`, default `hydrant`), optional S3 artifact store / attic cache ([Spindle configuration](https://tangled.org/docs/reference/spindle-config/), [Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)).
- **Deployment:** NixOS module, or `nix build .#spindle` — "**There is no container image.**" ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)).

### Index / appview

Can it be tangled.org's? **Yes.** The introduction's table lists "Web app and index — The website at `tangled.org`" as what they run, and "you can run all of it, some of it, or none of it" ([What is Tangled](https://tangled.org/docs/introduction/)). Self-hosting it is the heaviest option: bobbin needs `BOBBIN_SERVICE_DID`, `BOBBIN_HYDRANT_URL`, `BOBBIN_SLINGSHOT_URL`, and `BOBBIN_MIRROR_URL` ("Without it, repository pages have no code"), is rebuilt from the stream on every start, and needs a reverse proxy for TLS ([Run an index](https://tangled.org/docs/self-hosting/indexer/)). There is no documented way to self-host only the *client* yet ([Run a frontend](https://tangled.org/docs/self-hosting/frontend/)).

## 5. Hosted knot / hosted spindle + your own PDS

Yes, this is the documented normal case, not a hack: "You don't need to run a knot to use Tangled: host with Tangled on the knots we run, or self-host your own" ([Knot](https://tangled.org/docs/knots/)); repos default to "hosted with Tangled", with CI "Run it with Tangled, or on a spindle you self-host" ([Quick start](https://tangled.org/docs/quick-start/)). Accounts: sign in with an existing atproto handle, "there is nothing to link" ([Comparison with GitHub](https://tangled.org/docs/comparison-with-github/)).

Any combination therefore works with your own PDS: hosted knot + no spindle; hosted knot + own spindle; own knot + hosted spindle (selection is per-repo via Settings → Pipelines, which rewrites the manifest — [How CI works](https://tangled.org/docs/spindles/)).

**Limits/pricing:** the only public statement is "By default, Tangled provides managed knots where you can host your repositories **for free**" ([Introducing Tangled, 2025-03-02](https://tangled.org/blog/intro/)) and "Don't want to self-host? All are welcome on our hosted instances" ([tangled.org](https://tangled.org/)). No quota table, storage cap, or price list exists in the docs I could reach — see *Gaps*. The only constraint language is behavioural ("Misuse shared resources, for example by running cryptocurrency mining… on our hosted CI") ([Tangled Terms of Service](https://tangled.org/terms)).

## 6. Maturity, and the source of truth for schemas

- **Lexicons: declared stable.** "We've stabilized our AT Protocol lexicons" (co-founder, [HN thread, 2026-10-30](https://www.betterhackernews.com/item/50305573)); the release post frames the `org.tangled.*` set as "a new set of lexicons" ([The federated code forge, 2026-10-30](https://tangled.org/blog/forge/)).
- **Knot: knot2 (Rust) is current, migration still in flight.** "Knot2 is our aptly named, second implementation of the knot server, this time rewritten in Rust… bundles in an SSH server in the same binary" ([blog](https://tangled.org/blog/forge/)); "Self-hosters will have to upgrade their knots to the v1.20.0 by following the upgrade guide" ([same](https://tangled.org/blog/forge/)). Docs still warn that the image's `latest` tag is the *Go* knot ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)), and a Golang→Rust migration guide exists — i.e. two implementations are live at once.
- **Spindle: GA since Aug 2025, microVM engine since Jun 2026.** "Introducing spindle — Tangled's new CI runner is now generally available" ([blog index, 2025-08-06](https://tangled.org/blog)); "How we built spindle's new QEMU-based microVM engine" ([2026-06-16](https://tangled.org/blog/spindle-microvm/)).
- **Index/frontend: new (Oct 2026) and the least self-hostable piece.** bobbin "deployed globally in over 11+ regions" ([blog](https://tangled.org/blog/forge/)); self-hosting the frontend is "Coming soon." ([Run a frontend](https://tangled.org/docs/self-hosting/frontend/)).
- **Source of truth for schemas:** the monorepo `tangled.org/core`, path `lexicons/org/tangled/` — "Schemas are in `lexicons/org/tangled/`" ([Records](https://tangled.org/docs/reference/records/)); browse the tree at [tangled.org/tangled.org/core/tree/master/lexicons/org/tangled](https://tangled.org/tangled.org/core/tree/master/lexicons/org/tangled). The human-readable record→storage mapping is [Records](https://tangled.org/docs/reference/records/), and the XRPC surface is under [/docs/api/](https://tangled.org/docs/api/bobbin/) (bobbin) and [/docs/api/knot/](https://tangled.org/docs/api/knot/) (knot).
- **Unsigned/alpha signals:** the community Docker repo for the knot is "community maintained, support is not guaranteed" ([knot-docker](https://tangled.org/tangled.org/knot-docker)); the spindle has no container image at all ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)).

## Gaps / uncertain

- **No sizing numbers for the knot.** Nothing in the docs gives RAM/CPU/disk figures; `[resources] max_memory_bytes` merely defaults to the cgroup limit ([Knot configuration](https://tangled.org/docs/reference/knot-config/)). The "super light" remark is a 2026-10-30 HN comment ([link](https://www.betterhackernews.com/item/50305573)), not documentation.
- **No explicit doc sentence that your PDS must be internet-reachable.** Stated only indirectly (knot "couldn't reach an account provider", key caching, browser OAuth) — see §2.
- **No nested-virtualisation guidance.** Docs say "Linux with KVM" for the microvm engine ([Spindle self-hosting](https://tangled.org/docs/spindles/self-hosting/)) but never mention cloud VPS nested-virt support; whether a given provider exposes `/dev/kvm` is undocumented. The `nixery` fallback needs only Docker/Podman ([Engines](https://tangled.org/docs/spindles/engines/)).
- **No published quotas or pricing** for hosted knot, hosted spindle, or `.tngl.sh` account hosting. Only "free" (2025) and the ToS acceptable-use clause. Treat capacity as a support question, not a documented contract.
- **Whether a knot can be fully private** (LAN-only, no public crawl) and still show up in the tangled.org client: docs assume `requestCrawl` + Settings → Knots ([Knot self-hosting](https://tangled.org/docs/knots/self-hosting/)); the failure mode is not described.
- **Stale text in live docs:** the [Bobbin API page](https://tangled.org/docs/api/bobbin/) still says "the sh.tangled.actor.profile record" in places, and the July [bobbin post](https://tangled.org/blog/bobbin/) predates the rename. Code is ahead of prose: the `lexicons/org/tangled` tree and [The federated code forge](https://tangled.org/blog/forge/) are the current truth.
- **Repository transfers / moving a repo between knots** (relevant if you start on the hosted knot and later move to your own) are not described in the docs I could reach.
- **The [Terms of Service](https://tangled.org/terms) link was located via a search snippet**, not fetched page-by-page; verify the acceptable-use wording before relying on it.
