# Spindle hosting options for a self-hosted Tangled knot

**Verdict**
1. A free hosted spindle exists: Tangled operates it for all users and promises "always a free tier", but with no published SLA, quotas or concurrency. Try it first, because it costs nothing and needs no setup.
2. Your Cloudflare idea works, but as **Cloudflare Tunnel**, not as Containers or Workers Builds. Under knot2 the knot POSTs to the spindle over HTTPS, so a home spindle needs a stable public HTTPS hostname. A tunnel gives you that without dynamic DNS or open ports.
3. Cloudflare **Workers Builds** is a poor fit. It builds only from GitHub, GitLab or Artifacts, never from a Tangled knot, and it doesn't run `.tangled/workflows`.
4. A sleeping desktop is survivable for short gaps. knot2 keeps a persistent outbox, retries with backoff and keeps events for up to 3 days. Its hard-failure cap is ambiguous (see §5).
5. The most robust setup is a spindle on the same VPS as the knot, with the desktop optionally added later as an outbound-dialing executor.

Several cited docs pages describe the new knot2 / `org.tangled.*` generation (the Go knot is deprecated). Confirm your knot runs ≥ v1.20; older knots behaved differently (§2).

---

## 1. Hosted spindle: operator and terms

- **Operator and cost.** Tangled itself runs it.
  - Quote: "All Tangled users have access to our hosted spindle instance, free of charge. … We can't promise we won't charge for it at some point but there will always be a free tier." (https://tangled.org/blog/ci/, footnote 3.)
  - The docs say the same: "You can use Tangled's hosted spindle or run your own." (https://tangled.org/docs/spindles/)
- **Selection.** A repo picks its spindle under Settings → Pipelines. "The repository's `org.tangled.repo.manifest` record names its spindle. When you pick a spindle in Settings → Pipelines, the manifest changes, and that spindle starts to serve the repository." (https://tangled.org/docs/spindles/)
- **Secrets are supported.**
  - Added in Settings → Pipelines → Secrets and stored on the spindle: "Secrets are stored on the repository's spindle." (https://tangled.org/docs/spindles/secrets/)
  - Every secret becomes an env var in every step. The docs' own example is `CLOUDFLARE_API_TOKEN` with `wrangler deploy`.
  - Caveats:
    - "The spindle operator can read secrets."
    - "Secrets live on one spindle and are non-transferrable" (re-add them if you switch spindles).
    - Names are 1–50 characters; values are up to 4096.
    - Fork and PR runs from non-collaborators get no secrets.
  - The hosted instance stores secrets in OpenBao: "The hosted, flagship instance … uses OpenBao" (https://tangled.org/blog/ci/).
- **Engines.** The docs list `nixery`, `microvm` and `namespace`. They add: "Which engines and images exist depends on the spindle operator." (https://tangled.org/docs/spindles/engines/)
  - That `engine: nixery` runs on the hosted spindle is evidenced only by the 2025 blog and by the public infra config (`SPINDLE_NIXERY_*`). Tangled doesn't state the current hosted engine list.
  - That `microvm` runs on hosted is likely but **not confirmed**. Hosted runs as `role = "mill"` with executors (https://tangled.org/tangled.org/infra/raw/master/hosts/spindle-hel/services/spindle.nix).
- **Limits, from the defaults and the old hosted config (the current hosted values are unpublished).**
  - Workflow timeout: default `5m` ("The whole workflow, including time spent waiting for a free slot, must finish within the spindle's workflow timeout", https://tangled.org/docs/spindles/workflows/). The old hosted config set `workflowTimeout = "15m"`, `maxJobCount = 4`, `maxConcurrentWorkflows = 8` (https://tangled.org/tangled.org/infra/blob/10b6803d6293bbd702a901ea73073e3a52a17dac/hosts/spindle-hel/services/spindle.nix).
  - Per-container memory: default 6144 MiB. Pipelines at once: default 2. (https://tangled.org/docs/reference/spindle-config/)
  - Per-user and per-repo quotas exist for concurrent workflows, vCPU, memory, disk, cache (default 5120 MiB/user) and `CI_MINUTES_MONTHLY`. Hosted values aren't published.
  - Users have hit timeouts on the hosted spindle. One issue says "almost every CI run takes 15+ mins … gets cancelled due to time limits … The time limits have been increased" (https://tangled.org/matrixfurry.com/homebrew-xr/issues/20).
  - Your gate (bun install, build and Playwright) will probably need more than 5 minutes. Check the hosted timeout empirically.
- **Hosted spindle with a self-hosted knot.** Not explicitly documented; plausible from the design.
  - The spindle fetches over the knot's public HTTPS clone URL: "The fetch uses the repository's HTTPS clone URL on its knot." (https://tangled.org/docs/spindles/workflows/)
  - Tangled's blog says you can "host code on your own servers and still collaborate seamlessly" (https://tangled.org/blog/forge/).
  - The spindle refuses private or special-purpose addresses for user-influenced fetches (https://tangled.org/pnm.tf/tangled/blob/84a848decd60d3f0f1a6b96a4f0b642e389c5bfb/spindle/netguard/netguard.go). Your VPS knot has a public IP, so that's fine.
  - Admission on the flagship instance isn't stated. It can be `closed` (allow-list) or `open`: "`closed` serves admins and the allow-list, `open` serves anyone who is not banned." Test it by selecting it in Settings.

## 2. Home spindle: what must be reachable

**Inbound (knot2, current).**
- "Pushes and manual runs reach the spindle as an `org.tangled.event.notifyEvent` call. Only the repository's own knot can send a push." (https://tangled.org/docs/spindles/)
- The endpoint is `POST https://<hostname>/xrpc/org.tangled.event.notifyEvent` (https://tangled.org/docs/api/spindle/).
- The spindle's identity is a DID derived from its hostname: "Public hostname. The spindle DID is `did:web:<hostname>`." (https://tangled.org/docs/reference/spindle-config/)
- Third-party behaviour doc (tack, a custom spindle for knot2): "knot2 fetches `/.well-known/did.json` from that host before every push delivery", it must be "reachable at `https://<hostname>` with no redirects", and "the Tangled web app follows no redirects on spindle requests" (https://tangled.org/mitchellh.com/tack). This is inferred to apply to the stock spindle too.
- **The browser also calls the spindle.** "The Tangled web app calls tack's `org.tangled.ci.*` methods from the browser", and logs stream "over a WebSocket" (https://tangled.org/docs/spindles/). Stock spindle CORS defaults to `*`.
- **Port is configurable, but only locally.** `SPINDLE_SERVER_LISTEN_ADDR` defaults to `0.0.0.0:6555`. Docs: "The proxy terminates TLS and forwards requests to port 6555. It must pass websocket upgrades." (https://tangled.org/docs/spindles/self-hosting/)
- **Requirements, verbatim:** "Linux with KVM for the `microvm` engine, or Docker for the `nixery` engine. A recent `git`. A public hostname with TLS." No container image is published ("There is no container image").
- **Jetstream.** The spindle also polls: "The spindle watches the Jetstream for changes to repositories, collaborators, pull requests and patches", via `SPINDLE_SERVER_JETSTREAM_ENDPOINT`. This is an outbound connection only.
  - It carries record changes, not pushes. Pushes arrive only via the knot's POST.
  - A backfill (embedded hydrant) catches up on records "written before it started following an owner" (https://tangled.org/docs/reference/spindle-config/).
- **Legacy (Go knot, ≤ v1.16).** Spindle subscribed outbound to the knot's websocket event stream, so a home spindle needed no inbound port (https://tangled.org/blog/ci/; tack README above). The Go knot is deprecated, and the tree has dropped it ("The Go knot is gone from the tree", https://tangled.org/blog/namespace-engine/). Don't plan on it.
- **Private addresses are blocked at the knot.** `http.block_private_addresses`: "Refuse outbound requests to loopback, private and other non-public addresses. Default: true" (https://tangled.org/docs/reference/knot-config/).
  - A spindle at a LAN IP, or at a Tailscale address (CGNAT 100.64/10), will be refused by default.
  - A public name that resolves to a Cloudflare edge IP is fine.

## 3. Cloudflare Tunnel as the exposure path

- **Inbound HTTP and WebSocket work.** Quote: "Does Cloudflare Tunnel support Websockets? Yes. Cloudflare Tunnel has full support for Websockets." (https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/)
  - A published application maps a public hostname to `http://localhost:6555`. TLS terminates at Cloudflare with a valid public cert, and a CNAME to `<id>.cfargotunnel.com` is created. No paid plan is needed (https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/).
  - This is outbound-only from the desktop, so no dynamic DNS and no router changes.
  - Your hostname must be on a zone you control in Cloudflare (you already have one).
- **Timeouts the knot's client might hit** (https://developers.cloudflare.com/fundamentals/reference/connection-limits/):
  - Proxy read timeout 125s (524), proxy write timeout 30s, proxy idle timeout 900s, TCP keep-alive 30s.
  - Knot-side: outbound request timeout is 60s by default (`http.request_timeout_ms`, 60000), and the outbox `delivery_timeout` is 120s (https://tangled.org/tangled.org/core/raw/master/knot2/crates/knot-xrpc/src/outbox.rs).
  - Each notify call "waits on the spindle syncing the push" (knot-config `outbox_max_in_flight_per_spindle`). Your repo syncs quickly, so this should fit, but I haven't tested it with a tunnel.
  - Cloudflare's WebSocket idle timeout: "implement a client-side heartbeat (ping/pong)" and "removing or extending timeout settings" (https://developers.cloudflare.com/network/websockets/). The spindle log stream may drop on idle; the browser reconnects.
- **ToS.** Pipeline traffic is small JSON and log streams. The only restriction found on public hostname routes concerns video and large files: "On Free, Pro, and Business plans, the service-specific terms require you to use a specific paid service to serve video and other large files." (https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/, and https://www.cloudflare.com/service-specific-terms-application-services/). This shouldn't affect CI JSON and logs. The old §2.8 "non-HTML" clause was removed in 2023 (https://blog.cloudflare.com/updated-tos/). Free-plan request bodies are capped at 100 MB (https://developers.cloudflare.com/workers/platform/limits/), which is far above anything a spindle receives.
- **Does the hostname need to be stable and verifiable?** Yes.
  - The spindle's DID is `did:web:<hostname>`. "Service DID … changes when its hostname changes" (https://tangled.org/docs/reference/identifiers/).
  - The repo manifest names the spindle by this DID, so a hostname change means re-selecting the spindle and re-adding secrets.
  - The knot resolves the DID by fetching `/.well-known/did.json` over HTTPS from that host. A tunnel to a stable name satisfies this. Avoid ephemeral `trycloudflare.com` quick tunnels.
- **Operations.** The spindle needs a signing key, `SPINDLE_SERVER_OWNER`, `SPINDLE_SERVER_HOSTNAME` and a contact email. The key never regenerates: "back it up and keep it" (https://tangled.org/guid.foo/core/blob/bb2fc41a5caddf537e01f52006694f4262c536a9/docs/src/content/docs/reference/spindle-config.md).

## 4. Dynamic DNS without a tunnel

- The spindle's public side is **hostname-only**: `SPINDLE_SERVER_HOSTNAME` is "Public hostname. The spindle DID is `did:web:<hostname>`", and all docs show `https://<hostname>/…`. No documented setting for a public port. Behind-NAT guidance is not documented anywhere I found.
- **Non-standard port.** The `did:web` spec has a port encoding, but Tangled's support is **undocumented**. The tack docs say "reachable at `https://<hostname>` with no redirects". Plan on **443**.
- **Dynamic DNS plus port forward.**
  - Forward 443 to a reverse proxy (the docs give Caddy and Nginx examples) that forwards to :6555 with websocket upgrades.
  - Use Caddy with the Cloudflare DNS-01 challenge to get a certificate, with a dynamic DNS updater (for example ddclient) on the Cloudflare zone.
  - It fails behind CGNAT, and on a dynamic IP the knot's calls fail until DNS refreshes. It also exposes your home IP and a Docker-socket host to the internet.
  - Prefer the tunnel.

## 5. Uptime: what happens when the desktop sleeps

- **The knot queues and retries.** knot2 has a persistent per-spindle outbox, written to `spindle-outbox.json` (https://tangled.org/tangled.org/core/raw/master/knot2/crates/knot-xrpc/src/outbox.rs). The defaults:
  - Backoff 1s doubling to a 60s cap.
  - `max_age` = **3 days** (events older than that are dropped with a warning).
  - `max_per_spindle` 200, `max_per_repo` 100, `max_entries` 1000.
  - `give_up_after` = 60. The code comment says: "about an hour at the backoff cap, and only if the spindle takes other repos' events meanwhile."
  - Delivery timeout 120s. Events for one repo go out in order.
- **Reading of the retry semantics (inferred).** A commit titled "only pause a spindle's pushes when the spindle can't be reached" (https://tangled.org/tangled.org/core/commit/bfcad100bede0a3d6ac352937ed00218d73528a1) suggests a fully unreachable spindle is paused and its events kept up to 3 days. The give-up counter applies to per-event failures while the spindle is otherwise reachable. I read the full diff only partially, so treat this as likely but unconfirmed.
- **Spindle side.**
  - A spindle that is up but busy returns 503 and the knot's outbox retries: "A knot past its share gets a 503 and its outbox retries." (https://tangled.org/guid.foo/core/blob/bb2fc41a5caddf537e01f52006694f4262c536a9/docs/src/content/docs/reference/spindle-config.md)
  - Pull-request and record events have a spindle-side retry store (`retryPulls`, `repoRetries`).
  - There is no documented polling of the knot for missed pushes. Recovery from a long outage is therefore the knot's outbox only.
- **Practical effect.** Close the laptop overnight and push in the morning: the desktop must be up. If the desktop sleeps for less than 3 days and wakes, queued pushes are delivered, subject to the ~1-hour caveat above. After a long outage, re-run through the pipeline's retry (`org.tangled.ci.retryPipeline` exists), or manually trigger a run (https://tangled.org/docs/api/spindle/).
- **A deploy from CI is the real risk.** If the desktop is asleep when you push, nothing deploys until it wakes.

## 6. Cloudflare Workers Builds

- **Repo hosts.** "The Cloudflare Git integration lets you connect a new or existing Worker to a repository hosted by Artifacts, GitHub, or GitLab" (https://developers.cloudflare.com/workers/ci-cd/builds/). No generic git remote. A Tangled knot is not supported. Mirroring to GitHub could work, but CI status and logs wouldn't appear in Tangled.
- **Environment.** Ubuntu 24.04, x86_64; Bun 1.4.4 default (`BUN_VERSION`); Node 24; `build-essential`, `libgbm1` and `git` preinstalled (https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).
- **Limits.** Free plan: 3,000 build minutes/month, 1 concurrent build, 20 minute timeout, 2 vCPU, 8 GB RAM, 20 GB disk. Paid: 6,000 min, 6 concurrent, 4 vCPU (https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/).
- **Build command.** Arbitrary command; the output is deployed as a Worker. Running `bash scripts/ci.sh` as the build command is possible, but I couldn't confirm it.
- **Playwright.** No Chromium preinstalled and no root/`apt` documented. Whether `playwright install --with-deps` works is **unverified**.
- **Bottom line.** It's a deploy mechanism, not a test runner. Use it only if you move the repo to GitHub.

## 7. Recommendation

| Option | Cost | Uptime | Setup effort | Survives laptop closing? | Verdict |
|---|---|---|---|---|---|
| Hosted spindle (Tangled) | Free ("always a free tier") | Operated by Tangled | ~2 min: pick it in Settings → Pipelines | Yes | **Try first.** Unverified: timeout (default 5 min), engines, admission, self-hosted knot. |
| Home desktop + Cloudflare Tunnel | Free (Cloudflare + your electricity) | Only while desktop is awake | Medium: Nix/Docker, key, DID, `cloudflared`, systemd | Yes (the laptop isn't involved), but not if the desktop sleeps | **Good fallback.** Keep the desktop awake or accept the ≤ 3-day queue. |
| Home desktop + port forward + DDNS | Free | Only while awake and IP current | Higher: router, DDNS, TLS, CGNAT-dependent | Same | **Avoid.** Needs 443 inbound and a public IP; tunnel is strictly easier. |
| Spindle on the VPS next to the knot | VPS cost (extra CPU/RAM for Playwright) | Same as the knot | Medium: same as home, but a public IP and no tunnel | Yes | **Best for reliability.** Docker + `nixery` needs no KVM. Needs enough RAM (6 GiB default container cap). |
| Cloudflare Workers Builds | Free tier: 3,000 min/month | Cloudflare | Needs GitHub/GitLab mirror | Yes | **Not suitable** as the Tangled CI. Only useful as a deploy step. |

**Suggested path:**
1. Pick the hosted spindle; push a test and confirm the nixery timeout and that Playwright fits.
2. If it works, add `CLOUDFLARE_API_TOKEN` as a secret and deploy via `wrangler` in the workflow.
3. If limits bite, run a spindle on the VPS. Add the desktop later as an `executor` (see below).

**Optional later:** the config docs describe `SPINDLE_ROLE=executor` ("dials a mill and runs jobs"; the VPS spindle is the `mill`). The desktop dials out, so it needs no tunnel. The executor buffers events in an outbox and replays on reconnect (https://tangled.org/willdot.net/core/blob/b61aa17914a218636fbf6dc6ee13a47f0e360865/spindle/mill/executor/outbox.go). Behaviour when the executor is offline is not documented.

## Gaps / uncertain
- Current hosted-spindle limits (timeout, concurrency, quotas, CI minutes) and whether it offers `microvm` are not published. The infra config I saw was old (6 months).
- Whether the hosted spindle accepts repos from any self-hosted knot (admission policy) was not found documented.
- Exact `give_up_after` versus `max_age` semantics when the spindle is wholly unreachable. I read only part of the outbox patch.
- Whether non-standard ports are supported for the spindle's public address (no docs).
- Whether a tunnel's 125s read timeout is a problem for a slow `notifyEvent` sync. Not tested.
- Whether Playwright browsers install on the Workers Builds image without root, and whether the Tangled `nixery` image can run Playwright at all (browser deps through nixpkgs).
- Whether the `give_up_after` window in the knot2 outbox matches the build deployed on your VPS.

