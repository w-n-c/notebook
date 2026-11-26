# Knot + PDS on one NixOS host (OVH 4 GB), with Cloudflare

Researched 2026-11-26. I read the Tangled docs at `tangled.org/docs/…` (the Rust knot, "knot 2"), the `bluesky-social/pds` README, and Cloudflare's docs.

- **Which knot this covers.** Only the Rust knot (`knot-server`, NixOS module `services.tangled.knot-rs`) is covered. The old Go knot used `KNOT_SERVER_*` env vars and the `knotserver` unit, and is out of scope.
- **What I verified and what I inferred.** Inferences are tagged *(inference)*. They are not documented anywhere I found.

## Port / service table (single host)

| Port | Proto | Process | Bind | Public? | Notes |
|---|---|---|---|---|---|
| 22 | TCP | sshd (deploy-rs, admin) | `0.0.0.0` | Restrict to your IP or tailnet | Must not collide with the knot (see §1) |
| 80 | TCP | Caddy | `0.0.0.0` | Yes | ACME HTTP-01 and redirects |
| 443 | TCP | Caddy | `0.0.0.0` | Yes | TLS for `pds.`, `knot.`, `spindle.newell.codes` and the handle host |
| 443 | UDP | Caddy (optional HTTP/3) | `0.0.0.0` | Optional | The knot's own HTTP/3 only works if the knot terminates TLS ([self-hosting](https://tangled.org/docs/knots/self-hosting/)); skip it |
| 3000 | TCP | PDS (`PDS_PORT`) | `127.0.0.1` | No | Official Caddyfile proxies `http://localhost:3000` ([installer.sh](https://github.com/bluesky-social/pds/blob/main/installer.sh)) |
| 5555 | TCP | `knot-server` HTTP | `127.0.0.1` | No (via Caddy) | NixOS module default `"127.0.0.1:5555"` |
| 2222 | TCP | `knot-server` built-in SSH | `[::]` | **Yes, direct** | Default `[::]:2222`; `openFirewall = true` opens it |
| 5444 | TCP | knot mTLS admin | `[::1]` | No | Only active if `tls.mtls_enabled` |
| 6555 | TCP | spindle HTTP | `127.0.0.1` (set it) | No (via Caddy) | Doc default is `0.0.0.0:6555`, so override it on a shared host |

DNS (Cloudflare):
- `pds.newell.codes` A → VPS: grey cloud, per your constraint.
- `knot.newell.codes` A → VPS: **grey cloud if you want SSH on the same name** (§7).
- `spindle.newell.codes`: only if the spindle is on this host. Orange or grey both work, since it is HTTP and WebSocket only.

## 1. Knot ports and listeners

Source: [Knot configuration](https://tangled.org/docs/reference/knot-config/), [Self-hosting](https://tangled.org/docs/knots/self-hosting/).

- **Two listeners.** "A knot has two listeners where HTTP defaults to `[::]:5555`, SSH defaults to `[::]:2222`."
  - `server.listen_addr` (`KNOT_LISTEN_ADDR`): "HTTP listen address for XRPC, smart HTTP git, LFS and the homepage." Default `[::]:5555`.
  - `server.ssh_listen_addr` (`KNOT_SSH_LISTEN_ADDR`): "built-in SSH server for git and LFS." Default `[::]:2222`.
  - `server.internal_listen_addr` (`KNOT_INTERNAL_LISTEN_ADDR`): mTLS admin, default `[::1]:5444`, "used only when `tls.mtls_enabled` is set."
- **NixOS module defaults.**
  - `listen_addr` defaults to `"127.0.0.1:5555"`.
  - `ssh_listen_addr` defaults to `"[::]:2222"` and "must not be a port `services.openssh` listens on."
  - `openFirewall` defaults to `true` and opens "the TCP port of each non-loopback listen address."
  - State goes in `/var/lib/knot` (repos at `${stateDir}/repos`, sealed keys at `${stateDir}/sealed-keys`).
- **No "future API port".** XRPC (`/xrpc/*`, the `com.atproto.sync.subscribeRepos` firehose, `/xrpc/_health`) and git smart-HTTP all share the single HTTP listener. The firehose is a WebSocket on that same port.
- **No external-URL key.** Identity is `server.hostname` only. `server.appview_endpoint` just builds links in push messages and defaults to `https://tangled.org`.
- **No `git` user, no root needed.** "The SSH server is built in: there is no `sshd`, `AuthorizedKeysCommand` or `git` unix user to configure" ([Knot](https://tangled.org/docs/knots/)). The systemd unit's `CAP_NET_BIND_SERVICE` lines "can both go when SSH stays on 2222 and HTTP on 5555."
- **Port 22 vs 2222.** 2222 works, but the docs push for 22:
  - The Tangled client builds clone URLs with no port: "it always assumes 22."
  - On another port, users must write `ssh://git@host:2222/did:plc:…` or add a `~/.ssh/config` Host block.
  - Three ways to get 22: (a) move sshd (the docs give a lock-out-safe procedure), (b) give the knot a second IP (`sshd ListenAddress` on one IP, `ssh_listen_addr = ":22"` on the other, knot DNS on the second IP), or (c) accept 2222.
  - I think (c) is right for a single user. A one-line `Host knot.newell.codes / Port 2222 / IdentitiesOnly yes` is enough, and deploy-rs keeps sshd on 22.
  - Caveat: a third-party deployment says it "owns port 22, and that is not negotiable" because "a CI runner taking its URL from the appview could not" work around a custom port ([igav.ink README](https://tangled.org/kjaanson.eurosky.social/igav.ink)). The knot docs say the spindle "clones over HTTPS" ([Knot](https://tangled.org/docs/knots/)), which suggests this no longer applies. See Gaps.

## 2. Knot TLS

- **Either works.** "TLS, from a reverse proxy or from the knot itself" ([Self-hosting](https://tangled.org/docs/knots/self-hosting/)). The documented default is a reverse proxy forwarding to `127.0.0.1:5555`.
- **Caddy** (the whole config, since Caddy passes WebSocket upgrades): `knot.example.com { reverse_proxy 127.0.0.1:5555 }`
- **nginx** needs `proxy_http_version 1.1` plus `Upgrade`/`Connection` headers for WebSocket ([Run a knot](https://tangled.org/docs/self-hosting/knot/)).
- **Proxy rules.**
  - "Do not add CORS headers at the proxy."
  - Set request body limits high enough for large pushes and LFS uploads.
  - Set `xrpc.trusted_proxy_header = "x-forwarded-for"` and `xrpc.trusted_proxies = ["127.0.0.1","::1"]`. Without them every user shares one rate-limit bucket, and the knot warns at every start.
- **Built-in TLS.** `tls.cert_path`/`key_path`, or `tls.acme_enabled` with `acme_cache_dir` and `acme_contact`.
  - It uses TLS-ALPN-01, so the knot must itself answer on 443 for its hostname.
  - NixOS asserts ACME "requires a non-loopback `listen_addr`".
  - Leave `trusted_proxy_header` unset in this mode.
  - This **cannot coexist with a Caddy that owns 443** on a single IP.
- **Recommendation:** one Caddy owns 80 and 443 for everything, and the knot stays on loopback `:5555`.

## 3. Knot identity (`did:web`)

- **Served by the knot, not by you.** `server.hostname` is "Public hostname. The knot's identity is `did:web:<hostname>`", and the DID document is served at `https://knot.example.com/.well-known/did.json` ([Identifiers](https://tangled.org/docs/reference/identifiers/), [Knot](https://tangled.org/docs/knots/)).
- **Hostname only.** There is no port or path segment, so the hostname must be reachable on 443 (§2).
- **Caddy must forward it.** Proxy all paths on `knot.newell.codes`, including `/.well-known/did.json`, to `:5555`. No static `respond` blocks.
- **Verification endpoints** (the appview reads the first one when you register the knot):
  ```
  curl https://knot.example.com/xrpc/_health
  curl https://knot.example.com/xrpc/sh.tangled.owner     # first server.admins DID
  curl https://knot.example.com/.well-known/did.json
  ```
  Source: [knot2 README](https://tangled.org/tangled.org/core/blob/f0d3a1a643f5c14c8f3cd1640e982a8b71b3dfef/knot2/README.md).
- **Registration.** Settings → Knots on tangled.org writes a knot record to the owner's PDS, and "Admission is closed by default."
- **Cloudflare proxying.**
  - Orange or grey cloud both serve `did.json` fine over HTTPS. A third-party knot runs "home IP hidden behind a Cloudflare proxy" with this same endpoint ([prox-knot](https://tangled.org/makecomputers.work/prox-knot)).
  - Keep Bot Fight Mode, Browser Integrity Check and WAF challenges off for this hostname, so relays, the appview and spindles can fetch it *(inference)*.
- **Hostname is permanent.** Changing it changes the identity, which is a stated risk ("choose one you'll keep").
- **Back up the master key.** The knot is the sole rotation key for every repo DID it hosts. Lose `KNOT_MASTER_KEY` or the sealed store and you lose control of every repo DID.

## 4. Knot and PDS on the same host

What the knot needs from the PDS ([Knot](https://tangled.org/docs/knots/), [config](https://tangled.org/docs/reference/knot-config/)):
- It reads identities and SSH keys from "User PDSes" over the network. Keys come from `org.tangled.key.sshKey` records in the user's PDS.
- It finds the PDS via the owner's DID document, which comes from `atproto.plc_directory`. This is a required key and must be `https`. The knot submits repo-DID operations there too.
- It caches keys (`keyfill.ttl_secs` = 3600). If a refresh fails, cached keys stay usable for `keyfill.reprieve_budget_secs` = 21600 (retry every 300).
- A new key can take up to an hour to be honoured. The docs' fix is to wait, or to use `<handle>@knot.host` as the SSH user so the lookup goes direct ([igav.ink](https://tangled.org/kjaanson.eurosky.social/igav.ink)).

**No Tangled doc covers same-host deployment**, hairpin, or self-resolution. The only same-host reference is a third-party README. It runs a Tranquil PDS and a knot behind one nginx and says "only one process can hold :443" ([igav.ink](https://tangled.org/kjaanson.eurosky.social/igav.ink)).

*(inference)* Consequences:
- **No special handling needed.** The knot reaches `https://pds.newell.codes` via public DNS. On an OVH VPS the public IPv4 sits on the NIC, so connecting to your own public IP is local routing, not NAT hairpin.
- **Cloudflare Tunnel is the exception.** A tunnel has no inbound public IP, but you won't use one for the PDS anyway.
- **Do not add `/etc/hosts` overrides or split-horizon DNS.** The knot's TLS and DID checks assume the public view.
- **Order of failure.** A PDS outage doesn't break pushes for hours, thanks to the key cache (1 h TTL plus 6 h reprieve). It does block registration, Tangled OAuth login, and any new key.
- **A knot outage doesn't affect the PDS.** Use separate `systemd` units.
- **Wildcard trap.** The official PDS Caddyfile is `*.${PDS_HOSTNAME}, ${PDS_HOSTNAME} { tls { on_demand } reverse_proxy http://localhost:3000 }` with `ask http://localhost:3000/tls-check`.
  - If `PDS_HOSTNAME=newell.codes`, the wildcard also claims `knot.newell.codes`, unless an explicit `knot.newell.codes` site block exists. Caddy picks the more specific block, but it is an easy footgun.
  - Single user: don't use the wildcard. Use an explicit `pds.newell.codes` block (`PDS_HOSTNAME=pds.newell.codes`) and a handle on the apex (`newell.codes`), via a `_atproto.newell.codes` TXT record or `/.well-known/atproto-did` served by Caddy. No `*.pds` DNS or on-demand TLS is needed, and Cloudflare Free's cert wouldn't cover `*.pds.newell.codes` anyway ([lukeacl/bsky-pds](https://github.com/lukeacl/bsky-pds)).
- **Don't use the PDS installer or its compose Caddy.** The README: "If you intend to run a PDS alongside an existing webserver on the same VPS, you will not want to use this install script." Its Caddy also uses `network_mode: host` on 80 and 443. Run the PDS bare on `:3000` behind your own Caddy.
- **Official PDS requirement.** Inbound 80/tcp and 443/tcp, public IPv4, public DNS ([PDS README](https://github.com/bluesky-social/pds/blob/main/README.md)).
- **PDS rate limits behind a proxy.** `PDS_DISABLE_IP_RATE_LIMITS` was added in `@atproto/pds` 0.5.57 for a PDS behind a proxy that enforces per-IP limits ([CHANGELOG](https://github.com/bluesky-social/atproto/blob/main/packages/pds/CHANGELOG.md)). It is only relevant if you proxy through Cloudflare.

## 5. Knot disk footprint

Docs on state ([Knot](https://tangled.org/docs/knots/), [Self-hosting](https://tangled.org/docs/knots/self-hosting/)):
- "The knot has no SQL database. All state lives under `repo.scan_path`", plus a sealed key store.
- Each repo is a bare git repo sharded by DID. COBs for issues, pulls and ACLs live in `refs/cobs/*`. A meta-repo holds members, the blocklist and the repo registry.
- Backups: master key, `secrets/sealed.bin`, `repos/` ("that one directory is the knot's entire state"), `lfs/`, and the SSH host key.
- `lfs.store_path` is required, must be outside `scan_path`, and holds "LFS objects and atproto record attachments." It is fine on the same disk "if you don't plan to have actual git repos using this for massive files."
- Limits and floors (config reference):
  - `lfs.free_space_floor_bytes` = 1 GiB: uploads are refused below this free space.
  - `lfs.max_object_bytes` = 5 GiB.
  - `lfs.gc_grace_secs` = 14 days.
  - `ssh_max_pack_bytes` = 8 GiB.
- Maintenance (commit-graph, multi-pack index, bitmaps, geometric repack) runs every 6 hours.
- **No size figure is published.** Estimate for ~10 small repos:
  - Repos: roughly 1–50 MB each, so 10–500 MB total, plus tens of KB per repo for COB and atproto refs.
  - Meta-repo, sealed keys, SSH host key: under 1 MB.
  - LFS: ~0 unless you use LFS or attachments.
  - Total: **under ~1 GB** of knot state, typically a few hundred MB.
  - Add the PDS (SQLite plus blobs, which scale with media) and the NixOS store.
- **The 40 GB disk is not the constraint for the knot.** Keep the `lfs.free_space_floor_bytes` 1 GiB reserve in mind, and give `/var/lib/knot` a backup path.
- **Build cost.** A third-party README says the Rust knot has no binary cache and "~1,450 packages compile from source" (suggesting 8 GB RAM to build) ([prox-knot](https://tangled.org/makecomputers.work/prox-knot)). Build on your workstation or CI and ship via deploy-rs, not on the 4 GB box. This is one third-party claim and I have not verified it.
- **Knot memory.** `pack_cache.max_total_bytes` defaults to 2 GiB but is "clamped to a share of the memory budget". On 4 GB shared with the PDS, set it explicitly (say 256 MiB) *(inference)*.

## 6. Coexistence layout

One Caddy (`services.caddy`) on 80/443 with explicit site blocks:

```
pds.newell.codes     { reverse_proxy 127.0.0.1:3000 }   # WebSocket works automatically
knot.newell.codes    { reverse_proxy 127.0.0.1:5555 }   # all paths incl. /.well-known/did.json
spindle.newell.codes { reverse_proxy 127.0.0.1:6555 }   # only if local; long read timeout for log streams
newell.codes         { handle /.well-known/atproto-did { respond "did:plc:…" 200 } }  # handle on apex, no wildcard
```

- **Must be public:**
  - 80 and 443 (Caddy).
  - 2222 (knot SSH, direct).
  - The PDS hostname (`wss://…/xrpc/com.atproto.sync.subscribeRepos`, `/xrpc/_health`) and the knot hostname (relays crawl it, and `index.tangled.network` runs `requestCrawl`).
- **Must be internal:** 3000, 5555, 5444, 6555, and sshd 22 (restrict to your IP).
- **Firewall on NixOS:**
  - `networking.firewall.allowedTCPPorts = [ 80 443 ]`, plus 2222 (`openFirewall` does this for the knot).
  - Rate-limit sshd on 22.
  - Don't open 3000, 5555 or 6555.
- **Spindle elsewhere.** If the spindle runs on another box, it needs the knot's public HTTPS and firehose, and the spindle's own HTTPS, so no change on this host. A spindle on the same host needs KVM (or Docker for the `nixery` engine) ([Run a spindle](https://tangled.org/docs/self-hosting/spindle/)). On a 4 GB VPS, run it elsewhere.
- **Spindle identity.** `SPINDLE_SERVER_HOSTNAME` also becomes `did:web:<hostname>`, with a P-256 key behind `/.well-known/did.json` (`SPINDLE_SERVER_KEY_PATH`). The same Caddy-must-forward-`.well-known` rule applies.

## 7. Cloudflare specifics

Tangled docs say little. There is no Tangled page on Cloudflare, Tunnel or Spectrum. The only Cloudflare-related hits are:
- The `trusted_proxies` example `["173.245.48.0/20"]` ("covers a whole provider's edge"). That is a Cloudflare range, so Cloudflare as a proxy is anticipated for HTTP.
- A third-party NixOS knot behind the orange cloud that keeps SSH off Cloudflare entirely (below).

Verified facts:
- **HTTP and WebSocket through the orange cloud work.** The knot's `/events` and firehose are WebSocket, and Cloudflare supports WebSockets on all plans without extra setup ([Cloudflare WebSockets](https://developers.cloudflare.com/network/websockets/)).
  - There is an idle timeout. A third-party nginx config sets `proxy_read_timeout 86400s` for `/events` ([prox-knot](https://tangled.org/makecomputers.work/prox-knot)).
  - Cloudflare may drop long-lived sockets during its own deploys.
- **SSH through the orange cloud does not work.** Cloudflare proxies only listed HTTP/HTTPS ports. For SSH: "gray-cloud the subdomain … or configure a Spectrum application" ([Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/)).
  - Tangled's own `knot1.tangled.sh` "SSH port is Cloudflare-blocked; only HTTPS/443 works there", so pushes go through the `git@tangled.org` SSH proxy ([source](https://tangled.org/notplants-bot.bsky.social/p-lichen-orchestrator/blob/e0bba908048de342f36f655adcc06ccd29be6011/machine-docs/tangled-repo-creation.md)).
  - A knot operator behind Cloudflare Tunnel: "impossible to have SSH connections via the tunnel without having the warp client installed" ([issue #607](https://tangled.org/tangled.org/core/issues/607)). That is the open proposal for HTTPS/OAuth push.
- **Tunnel SSH.** Tunnel TCP/SSH routes need `cloudflared access` on every client ([protocols](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/protocols/)). Git's `ssh://git@host` can't use that without per-client setup, and the Tangled UI generates plain `git@host:` URLs. **Tunnel is a poor fit for knot SSH.**
- **Spectrum.** Pro and Business get SSH only as a paid add-on and "one app allowed", with the edge port set by the app type (22), so it can't forward to 2222. Arbitrary TCP is Enterprise-only ([Protocols per plan](https://developers.cloudflare.com/spectrum/protocols-per-plan/)). **Not viable here.**
- **Practical answer.** SSH git push must be a direct, DNS-only port on the VPS.
  - Grey-cloud `knot.newell.codes` entirely, which is what I'd do. Because the knot identity is the hostname, SSH and HTTPS share the name, so you can't orange-cloud HTTP and grey-cloud SSH separately.
  - Alternatively, orange-cloud the knot and use HTTPS push via a credential helper. That is a "service-auth token" flow with no polished client yet ([Knot](https://tangled.org/docs/knots/)).
  - Alternatively, grey-cloud only SSH using a `Host` alias to an origin IP, e.g. `ssh://git@<vps-ip>:2222/did:plc:…`, as prox-knot does with its LAN IP. Then orange-cloud HTTP on the same name.
- **Orange cloud effects on HTTP:**
  - Free and Pro upload limit is 100 MB (Business 200 MB) → `413` ([Error 413](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/4xx-client-error/error-413/)). This hits git HTTP push, LFS and PDS blobs (`PDS_BLOB_UPLOAD_LIMIT` default 300 MB per the PDS README).
  - Cloudflare doesn't support HTTP/3 to the origin.
  - Set `trusted_proxy_header` and `trusted_proxies` to the right chain, or the knot rate-limits everyone as one client.
  - Use DNS-01 for Caddy certs (needs a Cloudflare API token with `Zone.DNS:Edit`), as prox-knot does. HTTP-01 and TLS-ALPN-01 are brittle through the proxy.
  - Cloudflare Universal SSL covers `newell.codes` and `*.newell.codes` (one level), enough for `pds.`, `knot.`, `spindle.`.
- **Recommendation.** Everything on one VPS, all grey cloud, or grey cloud for `pds.` and `knot.` and optional orange for `spindle.`. A single-user box doesn't need the DDoS shield, and it avoids `413`s.

## Gaps / uncertain

- **No documented same-host guidance** (hairpin, self-resolution, shared Caddy) in either the Tangled or PDS docs. §4 is inference, backed by one third-party deployment.
- **Spindle clone path.** The knot docs say the spindle "clones over HTTPS", while the igav.ink README says a CI runner uses the appview's port-less SSH URL. I couldn't tell which applies to your spindle. Test a push-triggered pipeline with the knot on 2222.
- **Disk numbers are my estimate.** The docs give no size figure.
- **Knot memory use** at idle and under push isn't documented, so I can't confirm it fits alongside the PDS, Caddy and the OS on 4 GB.
- **Cloudflare behaviour I haven't tested:** whether Bot Fight Mode or WAF challenges block the `did.json` fetch from relays, the appview and spindles; the WebSocket idle timeout on `/events`; and `Zone.DNS:Edit` DNS-01 setup with Caddy.
- **`services.pds`.** I haven't confirmed that a nixpkgs module `services.pds` exists. If it doesn't, you must package `@atproto/pds` yourself or run the container. Check with `nixos-option` before designing around it.
- **Tangled docs shifted recently.** The old `docs.tangled.org/knot-self-hosting-guide` URL no longer resolves, and old `KNOT_SERVER_*` guidance conflicts with the new `KNOT_*` keys. Re-read the [knot config reference](https://tangled.org/docs/reference/knot-config/) when you write the Nix module.
- **The PDS README states a 1 GB RAM recommendation** for 1–20 users. I found no official figure for PDS plus knot together on 4 GB.