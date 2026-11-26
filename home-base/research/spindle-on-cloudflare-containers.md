# Spindle on Cloudflare Containers

**Researched 2026-11-26.** Every claim links to a primary source. Pricing arithmetic is marked as arithmetic, not a Cloudflare quote.

## Verdict

1. **Not viable as a drop-in.** Spindle ships no container image, needs a public TLS hostname on port 6555, and holds state in `/var/lib/spindle`; Containers give you an ephemeral disk and a lifecycle you drive from a Durable Object.
2. **`microvm` engine: fails outright.** It requires `/dev/kvm`, `/dev/vsock`, `/dev/vhost-vsock`, `/dev/net/tun` and `unshare`; Cloudflare documents no device passthrough or privileged mode, and each Container is itself a Firecracker guest.
3. **`nixery` engine: plausible but unproven.** Docker-in-Docker is now *documented* as supported (`docker:dind`, root, `durable_object` policy), but the guidance has flip-flopped and an open-then-closed bug report says the published repro never produced a socket.
4. **Daemon survival: fails by default.** Disk is ephemeral, containers stop when idle, and "code that runs inside the instance does not count as activity" — a polling/eventing daemon cannot keep itself alive from the inside.
5. **Network: mostly fine.** Outbound to any host/port (SSH clone, Jetstream `wss`, R2/S3) works with `enableInternet: true`; inbound must be proxied through a Worker + Durable Object, which is compatible with spindle's XRPC + WebSocket surface.
6. **Cheapest Cloudflare-native path: don't orchestrate spindle at all.** Tangled's hosted spindle is free for all Tangled users; Cloudflare's job is `wrangler deploy`, or Workers Builds if you want CF to run `scripts/ci.sh`. An always-on Container costs roughly $10–25/month — more than the VPS it was meant to replace.

---

## 1. What Cloudflare Containers actually is today

| Property | Documented behaviour | Source |
| --- | --- | --- |
| Trigger model | Instances are started by Durable Object code (`ctx.container.start()`); "a Container can only be accessed through its Durable Object"; billing starts "when a request is sent to the container or when it is manually started" | [Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Pricing](https://developers.cloudflare.com/containers/pricing/) |
| Idle → stop | `setInactivityTimeout(ms)` stops the container after the DO goes inactive; without it, "Cloudflare stops the instance shortly after the Durable Object becomes inactive" | [Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Scaling](https://developers.cloudflare.com/containers/configuration/scaling-and-routing/) |
| Max size per instance | 4 vCPU, 12 GiB RAM, 20 GB disk (per-instance limits are defaults and *can be raised* on request); `standard-4` = 4/12 GiB/20 GB, `lite` = 1/16 vCPU/256 MiB/2 GB; custom sizes allowed (min 1/16 vCPU, 256 MiB, 2 GB) | [Limits](https://developers.cloudflare.com/containers/platform-details/limits/) |
| Disk | "All disk is ephemeral by default… the next time it starts, it uses a fresh disk from the container image." Snapshots (beta) capture filesystem state, max 20 GB, 30-day retention, `durable_object` policy only. FUSE-to-R2 is mentioned as a slow alternative | [Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Limits](https://developers.cloudflare.com/containers/platform-details/limits/) |
| Outbound | `enableInternet` (defaults to **false** on the DO API). When true, "all other connections reach the Internet directly, including connections on other ports" — i.e. arbitrary destinations/ports, not just 80/443 | [Outbound traffic](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/), [DO Container API](https://developers.cloudflare.com/containers/api/durable-object-container/) |
| Inbound | "The Worker receives inbound HTTP requests and routes them to the Container, so the Container is not exposed directly to end users." WebSocket upgrades forward through the DO (`getTcpPort(port).fetch()`); raw TCP requires Spectrum (public beta) | [Concepts](https://developers.cloudflare.com/containers/concepts/), [WebSocket example](https://developers.cloudflare.com/containers/examples/websocket/) |
| Arbitrary ports | Yes *inside* the VM — the DO proxies any port via `getTcpPort(n)` — but no port is publicly reachable; there is no per-container public IP/port. `wrangler containers ssh` is account-authenticated only and "does not expose a publicly accessible port" | [SSH guide](https://developers.cloudflare.com/containers/guides/ssh/), [Concepts](https://developers.cloudflare.com/containers/concepts/) |
| Runtime | "Each container instance runs in a microVM with its own kernel and network"; Cloudflare's own incident write-up states each container "lives inside a dedicated virtual machine powered by the Firecracker virtual machine monitor", disk presented as `/dev/vdc` over dm-thin | [Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Cloudflare blog](https://blog.cloudflare.com/containers-cross-tenant-vulnerability/) |
| Billing granularity | "billed for every 10ms that they are actively running"; Workers Paid includes 25 GiB-h RAM, 375 vCPU-min, 200 GB-h disk per month; then $0.0000025/GiB-s, $0.000020/vCPU-s, $0.00000007/GB-s; egress $0.025/GB (NA/EU, 1 TB included) | [Pricing](https://developers.cloudflare.com/containers/pricing/) |

**Arithmetic (mine, from the rates above), 730 h/month always-on:**

| Size | RAM | Disk | CPU @20% avg | Total + $5 Workers Paid |
| --- | --- | --- | --- | --- |
| `basic` (1 GiB, 1/4 vCPU, 4 GB) | ~$6.35 | ~$0.69 | ~$10.06 (≈$2.18 if ~5% busy) | **~$14–22/month** |
| `standard-1` (4 GiB, 1/2 vCPU, 8 GB) | ~$26.06 | ~$1.42 | ~$10.06 | **~$42/month** |

A 10-minute job on `standard-1` instead costs cents — the daemon, not the CI, is the expensive part.

## 2. Can it run a long-lived polling daemon?

Spindle is *not* poll-only, and that matters: the knot pushes `org.tangled.event.notifyEvent` **into** the spindle, and the spindle separately watches Jetstream (`wss://jetstream1.us-west.bsky.network/subscribe`) outbound ([How CI works](https://tangled.org/docs/spindles/), [spindle config](https://tangled.org/docs/reference/spindle-config/)). It listens on `0.0.0.0:6555` behind a TLS proxy that "must pass websocket upgrades" ([self-hosting](https://tangled.org/docs/spindles/self-hosting/)).

Mechanisms to keep a Container alive, and their documented limits:

- **No inbound request needed to start it.** A DO alarm can call `ctx.container.start()`; the API page's own example does exactly that ([DO Container API](https://developers.cloudflare.com/containers/api/durable-object-container/)). A Cron Trigger's `scheduled()` handler can also start a container ([Cron example](https://developers.cloudflare.com/containers/examples/cron/)).
- **Alarms**: at-least-once, retried "with exponential backoff, starting at 2 second delays for up to 6 retries"; only one `alarm()` runs per DO at a time ([DO alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)). Cron: 1,000 triggers/account on paid, expense capped at 5 min CPU per invocation ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/)).
- **`sleepAfter` / inactivity timeout cannot be disabled into infinity**: "After the Durable Object becomes inactive, the instance keeps running for the time set with `setInactivityTimeout()`, **up to 6 hours**" ([Sandbox lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/), and the same cap restated in the [API map](https://developers.cloudflare.com/sandbox/sdk/migrate/api-map/)).
- **The blocker**: "Code that runs inside the instance does not count as activity. If no requests arrive, the instance stops when the inactivity timeout ends, even while a build, a test suite, or an agent task still runs inside it." The documented workaround is a DO alarm that fires more often than the timeout and pokes the container ([Sandbox lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/)). That is a heartbeat you must write, and it means the DO is always active — billed continuously.
- **No uptime guarantee**: "Cloudflare does not stop a container instance after a fixed maximum runtime… Another platform event can stop an active container… Cloudflare does not guarantee that any container instance will run for a set period" ([FAQ](https://developers.cloudflare.com/containers/faq/)).

**Consequence for spindle**: with ephemeral disk, every stop/restart is a cold boot of a stateful daemon (`/var/lib/spindle`: sqlite DB, sealed key, cache index) with no state. A `notifyEvent` POST arriving at a sleeping spindle has to survive a Worker → DO → container-boot window; nothing in Cloudflare's docs lets a Worker hold or durably queue that inbound request while the container boots.

## 3. Docker-in-container (the `nixery` engine)

Spindle's `nixery` engine runs "a fresh Docker or Podman container for each step, with the image built from your Nix packages by Nixery" ([Engines](https://tangled.org/docs/spindles/engines/)); the launch post says the engine "supports just the Docker backend… Podman is known to work with the Docker socket feature enabled", and spindle itself persists `/tangled/workspace` and `/nix` volumes across steps ([Tangled blog](https://tangled.org/blog/ci/)).

Cloudflare's current FAQ answers **yes**:

> "Yes. With the `durable_object` scheduling policy, Docker can use bridge networking, iptables, and IP forwarding. Use the `docker:dind` image… Run the Docker daemon as `root` for this setup." — [Containers FAQ](https://developers.cloudflare.com/containers/faq/)

An earlier revision of the same page said the opposite in spirit — "Containers run without root privileges", use `docker:dind-rootless`, and disable iptables with `--iptables=false --ip6tables=false` (still visible in indexed copies of the [FAQ](https://2abdbd9f.previews.developers.cloudflare.com/containers/faq/index.md)). Cloudflare's public bug tracker has a now-**closed** report, "Docker-in-Docker guide repro has no Docker socket", in which `docker version` never connects to `/var/run/docker.sock` ([cloudflare/sandbox-sdk#662](https://github.com/cloudflare/sandbox-sdk/issues/662)). A third-party field test reports DinD, Buildah and BuildKit all dying on `unshare(CLONE_NEWUSER): Operation not permitted`, with only Kaniko (which spawns no nested containers) working on a live deployment — that is *not* a primary source and is reasoning-by-analogy about the sandbox, so treat it as a signal, not proof.

**Net**: there is no `/var/run/docker.sock` handed to you; you would ship `dockerd` inside the image and start it yourself. Nothing in the docs explains how spindle's `/nix` and `/tangled/workspace` volume mounts behave under DinD on Cloudflare, and nobody has published a spindle-on-Containers run.

## 4. KVM / the `microvm` engine

Spindle's microvm engine needs, at launch time, "the QEMU binary for the spec's arch, `/dev/vhost-vsock`, `/dev/vsock`, `/dev/kvm` (if KVM is enabled), `/dev/net/tun`, and the `ip`, `mount`, `slirp4netns`, `unshare` toolchain"; it also `unshare`s into fresh user/net/mount namespaces and runs per-workflow cgroups ([microvm README](https://tangled.org/tangled.org/core/blob/master/spindle/engines/microvm/README.md), [self-hosting](https://tangled.org/docs/spindles/self-hosting/)).

Cloudflare's side: every container already *is* a Firecracker guest with "its own kernel and network" ([Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Cloudflare blog](https://blog.cloudflare.com/containers-cross-tenant-vulnerability/)). Getting KVM inside would require the hypervisor to expose nested virtualisation plus device passthrough with the capability to open `/dev/kvm` — and Cloudflare's Containers documentation contains **no mention of `/dev/kvm`, nested virtualisation, `--device`, or privileged mode** anywhere in the product docs ([Containers docs index](https://developers.cloudflare.com/containers/llms.txt)). The only capability statements are negative or scoped: no iptables manipulation in the older DinD guidance, and device/privilege questions resolved by "run the daemon as root" under the DO policy ([FAQ](https://developers.cloudflare.com/containers/faq/)).

**Verdict: the `microvm` engine cannot run here.** Also dead under this constraint: `SPINDLE_MICROVM_PIPELINES_ENABLE_KVM` has no useful setting, and the engine's network hardening (`unshare`, `slirp4netns`, `/dev/net/tun`) assumes host-level privileges a Container VM does not grant.

Note also that spindle's mill/executor split does not rescue you: a `mill` places jobs, but the **executor** is the process that needs Docker or KVM, so moving the mill to Cloudflare still leaves you owning a KVM host somewhere ([spindle config](https://tangled.org/docs/reference/spindle-config/)).

## 5. Ephemeral disk, image size, and what you can pull mid-run

- **Per-instance disk**: 2 GB (`lite`) → 20 GB (`standard-4`); 20 GB is the documented per-instance cap and is a *default* that support can raise ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
- **Image size** is bounded by instance disk ("Image size | Same as instance disk space"), and total image storage per account is 50 GB ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
- **Disk resets on stop**: fresh disk from the image each start ([Lifecycle](https://developers.cloudflare.com/containers/platform-details/)). Snapshots are the only documented carve-out, are public beta, immutable, max 20 GB, 30-day retention, and are tied to the image version ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/), [Snapshots guide](https://developers.cloudflare.com/containers/guides/snapshots/)).
- **Mid-run pulls are fine capacity-wise**: `bun install`, a nix store fetch, and Playwright's Chromium+Firefox are comfortably inside 20 GB — but every pull is re-done each cold start unless you bake it into the image or restore a snapshot. Your own workflow already downloads browsers rather than depending on them (`.tangled/workflows/ci.yml`, step `bun run setup`), which is exactly the pattern that pays this cost every run.
- **No persistent volume product exists** for Containers. The documented persistence options are DO SQLite storage (for coordination state, not a build workspace) and FUSE to R2, which Cloudflare explicitly says you "should not expect native SSD-like performance" from ([Lifecycle](https://developers.cloudflare.com/containers/platform-details/)).

## 6. Outbound patterns spindle needs

| Need | Works? | Evidence |
| --- | --- | --- |
| Git clone/fetch over SSH from the knot (port 22, host keys, deploy keys) | Yes, with `enableInternet: true`; outbound is not limited to 80/443 | [Outbound traffic](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/) |
| Jetstream firehose over `wss://` | Yes — same rule; WebSockets outbound are plain egress | [Outbound traffic](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/) |
| Long-lived tokens / secrets | Yes — Worker Secrets / Secrets Store, injected as env at `start()` | [FAQ](https://developers.cloudflare.com/containers/faq/), [DO API](https://developers.cloudflare.com/containers/api/durable-object-container/) |
| Artifact + log upload to S3-compatible storage | Yes via R2's S3 API, but **each outbound request body is capped at 100 MiB by default**; larger objects need multipart or a limit increase from support | [Limits](https://developers.cloudflare.com/containers/platform-details/limits/), [R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/) |
| Inbound `notifyEvent` from the knot + WebSocket log streaming to clients | Yes, proxied: Worker `fetch()` → DO → `getTcpPort(6555).fetch()`, WebSocket upgrade preserved | [WebSocket example](https://developers.cloudflare.com/containers/examples/websocket/), [Concepts](https://developers.cloudflare.com/containers/concepts/) |
| Inbound SSH (spindle's optional `cilogs`) | No public port; `wrangler containers ssh` only | [SSH guide](https://developers.cloudflare.com/containers/guides/ssh/) |

## 7. Verdict, requirement by requirement

| Spindle requirement | Fails on Containers? | Why |
| --- | --- | --- |
| Ship spindle as a container | **Fails** | Tangled: "Build with `nix build .#spindle`, set the environment, and run `spindle`. **There is no container image.**" ([self-hosting](https://tangled.org/docs/spindles/self-hosting/)) You'd author and maintain the image (Go binary + git + docker or qemu stack) yourself. |
| Always-on daemon with a live inbound endpoint | **Fails in practice** | Inactivity timeout ≤ 6 h, in-container work is not activity, no uptime guarantee, forced cold starts ([Sandbox lifetime](https://developers.cloudflare.com/sandbox/concepts/lifetime/), [FAQ](https://developers.cloudflare.com/containers/faq/)). |
| Persistent state (sqlite DB, secrets, cache index, logs) | **Fails** | Ephemeral disk reset on every stop; snapshots are beta, immutable, 30-day TTL, image-version-bound ([Lifecycle](https://developers.cloudflare.com/containers/platform-details/), [Limits](https://developers.cloudflare.com/containers/platform-details/limits/)). |
| `microvm` engine (KVM + vsock + tun + namespaces) | **Fails hard** | No `/dev/kvm`, `/dev/vsock`, `/dev/net/tun` or device passthrough documented; the container is already a Firecracker guest ([microvm README](https://tangled.org/tangled.org/core/blob/master/spindle/engines/microvm/README.md), [Cloudflare blog](https://blog.cloudflare.com/containers-cross-tenant-vulnerability/)). |
| `nixery` engine (Docker per step) | **Uncertain** | Documented as supported (docker:dind, root, DO policy) but contradicted by an earlier rootless-only revision and a closed "no Docker socket" bug report ([FAQ](https://developers.cloudflare.com/containers/faq/), [sandbox-sdk#662](https://github.com/cloudflare/sandbox-sdk/issues/662)). |
| Public TLS hostname + `did:web` + WebSocket | **Passes** | Worker custom domain + DO proxy; WebSocket upgrade supported ([WebSocket example](https://developers.cloudflare.com/containers/examples/websocket/)). |
| Outbound SSH clone, Jetstream, S3 artifacts | **Passes, with the 100 MiB body cap** | ([Outbound](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/), [Limits](https://developers.cloudflare.com/containers/platform-details/limits/)) |
| Cheaper than a VPS | **Fails** | An always-on `basic` instance is ~$14–22/month on my arithmetic from the published rates, plus $5 Workers Paid ([Pricing](https://developers.cloudflare.com/containers/pricing/)). |

**Overall: not viable as "run spindle on a Container Worker".** It becomes *viable with caveats* only if you accept a bespoke project: build your own spindle+dockerd image, drop the `microvm` engine permanently, keep the DO awake with a heartbeat alarm, and stripe state to R2/S3 or snapshots. That is a re-implementation of a hosting model, not a deployment.

**Cheapest Cloudflare-native alternatives, in order of effort:**

1. **Free hosted spindle + Cloudflare only for deploy (recommended).** "All Tangled users have access to our hosted spindle instance, free of charge" ([Tangled blog](https://tangled.org/blog/ci/)); your `.tangled/workflows/ci.yml` already runs `engine: nixery` there, and deploy stays a `wrangler` step from the workflow — zero VPS, zero Cloudflare compute for CI.
2. **Workers Builds as the runner.** Build command can chain `bash scripts/ci.sh`; 6,000 min/month on paid (3,000 free), 20-min timeout, 8 GB RAM, 20 GB disk, 2 vCPU free / 4 paid ([Limits & pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)). Caveat: it is a build product wired to a connected git repo, not a Tangled knot, and 20 minutes is the hard ceiling.
3. **A small VPS running spindle** (KVM or Docker) — the option the Containers route was meant to avoid, but at ~$4–6/month it is cheaper than the Container arithmetic above and is the only path that keeps the `microvm` engine.

---

## Gaps / uncertain

- **No primary source on `/dev/kvm`, device passthrough, or privileged mode in Containers.** My "not supported" conclusion is *absence of documentation plus the Firecracker-guest architecture*, not a Cloudflare statement. If this matters, ask Cloudflare Support directly rather than trusting this section.
- **DinD guidance is contradictory across doc revisions.** The live FAQ says `docker:dind` as root works under the `durable_object` policy; an earlier indexed revision insisted on rootless + `--iptables=false`. I have not run DinD on Containers, and the only non-Cloudflare hands-on report I found says DinD fails (`unshare(CLONE_NEWUSER): EPERM`). Treat section 3 as "must be proven on your account".
- **`sandbox-sdk#662` is closed; I did not read the resolution**, so I do not know whether it was fixed, worked-as-intended, or a Sandboxes-only bug that never applied to Containers.
- **The 6-hour `setInactivityTimeout` cap** comes from Sandboxes docs (same underlying API), not from a statement I could find on the Containers API page.
- **Inbound request durability during cold start is undocumented.** I could not find a Cloudflare statement about how long a Worker→DO→container request may be held, nor any knot-side timeout for `notifyEvent`, so "events may be lost while the container sleeps" is inference.
- **Minimum billing charge:** pricing is "every 10 ms of active time" with monthly included allotments; I found no documented minimum charge, but I did not find an explicit "no minimum" either.
- **Playwright sizes and Chromium sandboxing** inside Cloudflare Containers are unverified. "Several hundred MB" for browsers is my estimate, not a cited figure; Chromium may need `--no-sandbox` flags that I have not validated there.
- **Snapshot restore + a live sqlite database** (WAL, mmap) is untested and is not something the snapshots guide promises to make safe.
- **Hosted spindle's free tier is a promise, not a contract**: "We can't promise we won't charge for it at some point but there will always be a free tier" ([Tangled blog](https://tangled.org/blog/ci/)).
- **Image build path for a spindle image** (nix-based build inside `wrangler deploy`, or a prebuilt binary + `FROM debian`) is untested; Wrangler needs Docker locally to build images ([Get started](https://developers.cloudflare.com/containers/get-started/)).
