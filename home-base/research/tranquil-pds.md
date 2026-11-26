# Tranquil PDS: research for a single-user NixOS PDS

Fetched about 2026-11-26. Pages are on Tangled, so most links are `tangled.org`. Facts come from the repo and docs; **[inferred]** marks my reasoning.

## Verdict for a single-user NixOS PDS
- **Identity:** `tranquil` here is [Tranquil PDS](https://tranquil.farm), a Rust, AGPL-3.0-or-later atproto PDS (v0.9.1). Its repo is at [tangled.org/tranquil.farm/tranquil-pds](https://tangled.org/tranquil.farm/tranquil-pds). It is not the official Bluesky distro.
- **Fit:** it has a first-class NixOS module and a Cachix cache of its own builds, so the Nix story is better than the official docker distro's. R2 blobs fit through `storage.backend = "s3"`, as a config option rather than a workaround.
- **Cost:** it needs PostgreSQL by default (`database.createLocally = true` handles that). The embedded `tranquil-store` is called not battle-tested by its own docs. Use Postgres.
- **Hobby project:** self-described, with three core maintainers and v0.x breaking changes plus security fixes landing every few weeks. Releases are not yet 1.0-stable.
- **Hosting dependency:** the flake input is `git+https://tangled.org/...`, so builds depend on Tangled being up. Pin the rev and keep the cache.
- **Verify before adopting:** no explicit statement that Tranquil works with Tangled or bsky.app; I found no stated incompatibility either. Test a migration with a throwaway account first (see Gaps).

## 1. Identity
- **Canonical repo:** [tangled.org/tranquil.farm/tranquil-pds](https://tangled.org/tranquil.farm/tranquil-pds); site [tranquil.farm](https://tranquil.farm). Forks under other Tangled handles show up in search, but the canonical one is `tranquil.farm`.
- **Language:** Rust. It is a Cargo workspace of about 40 crates under [crates/](https://tangled.org/tranquil.farm/tranquil-pds/tree/main/crates). It builds to a single binary with a Deno-built frontend, and the README says "no nodejs runtime".
- **License:** [LICENSE](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/LICENSE): "Tranquil PDS itself … is under AGPLv3 or later"; docs are CC BY-SA 4.0.
- **Version:** v0.9.1, tagged 3 days before fetch ([commits](https://tangled.org/tranquil.farm/tranquil-pds/commits/main), [CHANGELOG](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/CHANGELOG.md)). v0.9.0 was announced 2026-11-22 ([Skyverse mirror of @tranquil.farm](https://skyverse.social/users/oyster.cafe)).
- **First release:** not found. Indicators put the start around early 2026:
  - The embedded-DB RFC is dated 2026-03-22 ([RFC](https://tangled.org/dsx.sh/tranquil-pds/blob/main/TRANQUIL_OWN_DB_RFC.txt)).
  - The "Beta" post on [@tranquil.farm](https://bsky.app/profile/tranquil.farm) is dated about 9 months before fetch.
  - Tagged releases I saw: 0.7.0, 0.7.1, 0.8.0, 0.9.0, 0.9.1 ([tags](https://tangled.org/tranquil.farm/tranquil-pds/tags)).
- **Maintainers:** the [README](https://tangled.org/tranquil.farm/tranquil-pds) lists the core team as @oyster.cafe (Lewis), @nel.pet and @jola.dev, plus about a dozen contributors.
- **Activity:** the last commit was about 6 hours before fetch (`fix(oauth): clean up old DPoP entries`, jola.dev). There were dozens of commits in the preceding week.
- **In production:** the README lists "instances in the wild": Tranquil Farm, ao.oyster.cafe, Cove Town, ebil pds, File Orbit. A public example NixOS config is [starhaven.dev/infra](https://tangled.org/starhaven.dev/infra/blob/dcbb6773556bbd0c7cf6edbb41ccc4f103e513fa/servers/kuribo/tranquil-pds.nix). The embedded-DB doc says "Mr Oyster has been running his just fine for about half a year" ([docs](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/5_INSTALL_USING_EMBEDDED_DB.md)).

## 2. Feature surface
Evidence is the router in `tranquil-api` (a fork snapshot from about 5 months ago, [lib.rs](https://tangled.org/jola.dev/tranquil-pds/blob/ebf5af49223675980f78df92fdd750d21f6bcd54/crates/tranquil-api/src/lib.rs)). The project's [TODO.md](https://tangled.org/tranquil.farm/tranquil-pds/blob/240f24718e1d92a0f94e8edd1d50fcc18fcd8d1b/TODO.md) lists these as completed: "Health, describeServer, all session endpoints, full repo CRUD, applyWrites, blob upload, importRepo, firehose with cursor replay, CAR export, blob sync, crawler notifications, handle resolution, PLC operations, full admin API, moderation reports."

| Need | Status |
|---|---|
| `com.atproto.server.describeServer` | Routed (`/xrpc/com.atproto.server.describeServer`). |
| `repo.createRecord` / `putRecord` / `getRecord` / `deleteRecord` / `applyWrites` | Routed. |
| `repo.listRecords`, `describeRepo` | Routed. The route table shows no auth layer, and the tests hit sync endpoints unauthenticated. I did not verify unauthenticated `listRecords` against a live instance. |
| `repo.uploadBlob`, `listMissingBlobs`, `importRepo` | Routed. |
| `server.createSession` / `refreshSession` | "All session endpoints" per TODO. The 0.9.0 changelog covers refresh-token behaviour (reuse revokes the session; password sessions return email on `getSession`). |
| `com.atproto.identity.*` | `resolveHandle`, `updateHandle`, `getRecommendedDidCredentials`, `requestPlcOperationSignature`, `signPlcOperation`, `submitPlcOperation`. |
| `sync.subscribeRepos` | Yes. CHANGELOG 0.7.0: "`subscribeRepos` is now rate limited, allowing 1 request per minute per IP, with a burst of 5". Config `[firehose]` has `buffer_size` and `backfill_hours = 72`. |
| Relay crawl notification | `[firehose] crawlers` / env `CRAWLERS`. Defaults include `https://bsky.network` and several community relays ([example.toml](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/example.toml)). |
| `sync.*` (`listRepos`, `getRepoStatus`, `getRepo`, `getRecord`, `notifyOfUpdate`) | Tested in [sync_repo.rs](https://tangled.org/tranquil.farm/tranquil-pds/blob/aca78bb8d3b8927e087f68ba4fa8bec250bcbae5/crates/tranquil-pds/tests/sync_repo.rs). |

- **Relay and Jetstream:** the firehose is what relays and AppViews consume, so bsky.app and Tangled see the account through the same relay path as any PDS. **[inferred]**
- **No default AppView:** requests without an `atproto-proxy` header are not forwarded anywhere ([Welcome doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/1_WELCOME_TO_TRANQUIL_PDS.md)). Apps that rely on the ref PDS's implicit AppView fall-through will break.
- **OAuth is stricter than the ref PDS:** it refuses to mix transitional and granular scopes. CHANGELOG 0.9.0 also rejects `rpc:*`, bare `repo` and `repo:app.bsky.*`. Third-party clients that request those scopes fail.

## 3. Storage
- **Database:** PostgreSQL by default. `[database] url` / env `DATABASE_URL`; pool settings `max_connections = 100`, `min_connections = 10`.
- **Embedded alternative:** `[storage] repo_backend = "tranquil-store"` / env `REPO_BACKEND`.
  - It stores everything in `[tranquil_store] data_dir` / `TRANQUIL_STORE_DATA_DIR` (default `/var/lib/tranquil-pds/store`): a metastore (Fjall LSM), an eventlog and a blockstore.
  - example.toml warns: "`tranquil-store` is our own solution, not a tried-and-tested out-of-box database. If you're not feeling brave, don't choose this."
  - The Welcome doc says: "the answer is most definitely postgres - … please don't complain if you have data loss".
  - There is no PG-to-embedded conversion ([embedded-DB doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/5_INSTALL_USING_EMBEDDED_DB.md)).
- **Cache:** default `[cache] backend = "ripple"` (in-process gossip). Valkey is optional (`backend = "valkey"`, `VALKEY_URL`).
- **S3-compatible blobstore: yes.** Keys, quoted from [example.toml](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/example.toml):
  - `[storage] backend = "filesystem"` or `"s3"` (env `BLOB_STORAGE_BACKEND`).
  - `s3_bucket` (`S3_BUCKET`).
  - `s3_endpoint` (`S3_ENDPOINT`, "Custom S3 endpoint URL").
  - `s3_path` (`S3_PATH`, default `""`).
  - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: required when using `s3`. CHANGELOG 0.7.0 says it now uses a pure S3 crate, so these must be passed in the environment.
  - `AWS_REGION` comes from the environment file in a [real config](https://tangled.org/starhaven.dev/infra/blob/dcbb6773556bbd0c7cf6edbb41ccc4f103e513fa/servers/kuribo/tranquil-pds.nix) using Hetzner Object Storage.
  - A local Garage dev setup (`docker-compose.garage.yaml`) exists, per CHANGELOG 0.8.0.
  - **Cloudflare R2 is not documented.** It is plausible, since `s3_endpoint` takes `https://<acct>.r2.cloudflarestorage.com` and R2 usually wants region `auto`, but untested by the docs.
- **Blob rules** (CHANGELOG 0.8.0):
  - Unreferenced blobs are not served.
  - Blobs are garbage-collected after a 6-hour grace period, on a schedule set by `[scheduled] blob_gc_interval_secs` (default 3600, 0 disables).
  - `max_blob_size` defaults to 10 GiB.
- **Disk profile:** docs say "plan for ~1GB per active user as a baseline" and a VPS "with at least 2GB RAM" ([Nix doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_NIX.md), [Containers doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_CONTAINERS.md)). That is a floor, not a measurement. With S3 blobs, local disk is just Postgres plus the OS.
- **Filesystem default path:** `[storage] path` / `BLOB_STORAGE_PATH` = `/var/lib/tranquil-pds/blobs`.

## 4. Identity / PLC / migration
- **Rotation keys:** `[secrets] plc_rotation_key` / `PLC_ROTATION_KEY` is an "optional operator-held PLC recovery key, as a public `did:key`".
  - The PDS "continues to sign PLC operations with the per-account signing key, which always remains in `rotationKeys`".
  - The docs tell you to add your own rotation key first via boat or `goat` and "keep the private key safe" ([Welcome doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/1_WELCOME_TO_TRANQUIL_PDS.md)).
- **Standard migration endpoints exist:** `importRepo`, `activateAccount`, `deactivateAccount`, `checkAccountStatus`, `getServiceAuth`, `listMissingBlobs`, `getRecommendedDidCredentials`, `requestPlcOperationSignature`, `signPlcOperation`, `submitPlcOperation`.
  - These are the same endpoints the official `goat` and PDS-moover flows use. I found no doc line saying `goat account migrate` works, so treat that as likely but unverified.
- **Documented procedure:** the Welcome doc's "Account migration" section describes:
  - an in-house web-UI migrator (OAuth-based inbound migration with a PLC token flow);
  - [PDSMoover](https://pdsmoover.com), whose last step requires you to verify the new account first, via the email, Discord, Telegram or Signal link the PDS sent.
- **Known migration wart:** their own migrator can't deactivate the source account, because the ref PDS disallows OAuth for that. The AppView may then show JWT-issuer errors for hours. The author's workaround is to deactivate on the source via curl and then do a no-op `updateHandle` on Tranquil.
- **Bootstrap invite:** on first start with no users, the logs print `No users exist and invite codes are required. Bootstrap invite code: <invite_code_here>` ([Nix doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_NIX.md)).
- **Import knobs:** `[import] accepting` / `ACCEPTING_REPO_IMPORTS` (default `true`), `max_size` (1 GiB), `max_blocks` (500000).
- **Reference-PDS import:** CHANGELOG 0.9.0 added "Import an entire reference PDS into Tranquil using `import-reference`". This is relevant if you ever leave the official distro with its SQLite files.
- **Other DIDs:** `did:web` is supported (`enable_pds_hosted_did_web`, default false).

## 5. Admin / ops
- **Accounts:** there is no admin CLI. The roadmap lists "admin CLI for manipulating PDS data without having to dip into pg or raw files".
  - Admin is a web UI at `/app/`, which the docs call "quite barebones", plus `com.atproto.admin.*` XRPC routes and the `pdsls` tool.
  - Accounts are created via `createAccount` and invite codes (`invite_code_required`).
  - The binary has `--config <file> validate` and the `import-reference` subcommand.
- **Config precedence:** env vars, then `--config`, then `/etc/tranquil-pds/config.toml`, then defaults. `TRANQUIL_PDS_CONFIG` sets the path.
- **Secrets:** `JWT_SECRET`, `DPOP_SECRET` and `MASTER_KEY` ("key-encryption and HKDF derivation"), each at least 32 characters. Generate with `openssl rand -base64 48`.
- **Notifications:** with no channel configured you have to read the `comms_queue` table in Postgres ([Nix doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_NIX.md)). `[email]` is disabled when `from_address` is unset.
- **Upgrades:**
  - The Nix path is `nix flake update` and rebuild.
  - Containers: pull the image and restart.
  - SQL migrations live in [migrations/](https://tangled.org/tranquil.farm/tranquil-pds/tree/main/migrations).
  - CHANGELOG 0.8.0 says data is "migrated on the first startup after upgrade", so migrations run in-place. An older guide ran `sqlx migrate run` by hand. I could not confirm the current auto-migrate behaviour.
- **Backups:**
  - The only documented command is `podman exec tranquil-pds-db pg_dump -U tranquil_pds pds > /var/backups/pds-$(date +%Y%m%d).sql` ([Containers doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_CONTAINERS.md)).
  - Targets are the Postgres DB, the blob directory if `filesystem`, the secrets/env file, and your own PLC rotation key.
  - With `tranquil-store`, back up `data_dir`. The doc also says to take "all users' CAR files daily".
  - The old built-in scheduled-backup concept was removed (commit "remove useless backups concept").
  - `MASTER_KEY` loss: the name suggests it encrypts per-account signing keys, so losing it likely means you can't sign. **[inferred]**
- **Health:** `GET /xrpc/_health` ([older Containers doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/a18be8c6fd20f047ba82ddcd651639d2da2e1f67/docs/install-containers.md?download=1)). There is also `/metrics`, and the `observability/` dir has dashboards.
- **Event retention:** `event_retention_max_age_secs` defaults to 604800 (7 days) for the tranquil-store eventlog.

## 6. Packaging
- **Flake:** [flake.nix](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/flake.nix).
  - `nixpkgs-unstable` is the only input.
  - Outputs: `packages.<system>.{tranquil-pds, tranquil-frontend, default}`, `devShells.{default,full}`, `nixosModules.{default,tranquil-pds}`, and a NixOS integration check for x86_64 and aarch64.
  - [pkgs.nix](https://tangled.org/tranquil.farm/tranquil-pds/tree/main), [default.nix](https://tangled.org/tranquil.farm/tranquil-pds/tree/main) and `frontend.nix` sit alongside it.
- **NixOS module:** `services.tranquil-pds` with `enable`, `database.createLocally`, `settings` (mirrors the example.toml tree), `environmentFiles` and `package`. The module sets `settings.frontend.dir` to the built frontend ([Nix guide](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_NIX.md)).
- **Binary cache: Cachix, `tranquil.cachix.org`.** From the Nix guide: "Flake artifacts, package, frontend, and devshell, are built in CI and pushed to [tranquil.cachix.org](https://tranquil.cachix.org)".
  ```nix
  nix.settings = {
    substituters = [ "https://tranquil.cachix.org" ];
    trusted-public-keys = [ "tranquil.cachix.org-1:PoO+mGL6a6LcJiPakMDHN4E218/ei/7v2sxeDtNkSRg=" ];
  };
  ```
  So yes, it distributes this project's own builds. The Cachix page itself didn't render when fetched, so I could not independently see its contents. No Attic or garnix is mentioned.
- **aarch64:** cross-compiled on x86_64 and published as `packages.x86_64-linux.tranquil-pds-aarch64` ("Due to a current spindle limitation"). Set `services.tranquil-pds.package` to it yourself.
- **Containers:** the image is `atcr.io/tranquil.farm/tranquil-pds:latest`, and you must `podman login atcr.io`. Per-revision tags and a `main` tag appear in CHANGELOG 0.7.0. The image is distroless.
- **Files:** `Dockerfile`, `docker-compose.prod.yaml` and `deploy/{quadlets,nginx,openrc,jack.is}`. Install guides cover Nix, Alpine and Debian/containers. A systemd unit is in the older Debian doc and the NixOS module.
- **No raw-binary releases yet** ([Welcome doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/1_WELCOME_TO_TRANQUIL_PDS.md): "no simple 'deploy raw binary'").

## 7. TLS / hosting
- **One port serves everything:** API, OAuth and the web UI, default `SERVER_HOST = [::1]`, `SERVER_PORT = 3000` ([Containers doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/2_INSTALL_CONTAINERS.md)). Any reverse proxy works once it forwards to it.
- **Reverse-proxy paths:** an older NixOS-nginx snippet proxies `/xrpc/` (with websockets and long timeouts, no buffering), `/oauth/`, `/.well-known/`, `/webhook/`, `= /metrics`, `= /health`, `= /robots.txt`, `= /logo` and `~ ^/u/[^/]+/did\.json$` ([module.nix, fork snapshot](https://tangled.org/madoka.systems/tranquil-pds/blob/a7840e2ac50461429926cf9f85eeee1c26eedc61/module.nix)). The simplest approach is to proxy the whole host (Caddy `reverse_proxy` to `127.0.0.1:3000`).
- **Built-in TLS option:** set `[server.tls] cert_path` and `key_path`, or `TLS_CERT_PATH` and `TLS_KEY_PATH`. SIGHUP reloads the certs, `http3 = true` enables QUIC, and there is no ACME in Tranquil.
- **`TRUSTED_PROXY_COUNT`:** unset means 1 when a proxy terminates TLS and 0 when Tranquil does. Set it, or every client rate-limits as one.
- **Hostname form:** `PDS_HOSTNAME` is required and ports in it are validated (0.9.0). The guides require a wildcard cert for `*.pds.example.com` because "user handles are served as subdomains". `PDS_USER_HANDLE_DOMAINS` sets handle domains.
  - `ENABLE_CADDY_ON_DEMAND_TLS` (default true) serves `/.well-known/caddy/ask` so Caddy can issue per-host certs without a wildcard.
  - For a single user whose handle is your own domain, a wildcard is probably unnecessary. **[inferred]** Confirm on a test instance.
- **No documented requirement for unproxied connections.** The WebSocket upgrade must pass through for `subscribeRepos`, and nginx needs the long timeouts above.

## 8. Risk
- **Maturity:** sub-1.0 and self-described beta ("Beta … if you're feeling brave (and have backed up your rotation key)", [@tranquil.farm](https://bsky.app/profile/tranquil.farm)).
  - 0.8.0 and 0.9.0 each shipped breaking changes plus several security fixes, mostly OAuth and scopes.
  - Expect to read each changelog before upgrading. On the positive side, the fixes are being found and shipped fast.
- **People risk:** three core maintainers, and Lewis and jola.dev dominate commits. It is a stated hobby: "we don't have plans for it to ever be more than that."
- **If abandoned:** nothing proprietary locks you in. Your repo, blobs and PLC identity are standard. Exit routes:
  - a standard `importRepo` migration to another PDS (the official `bluesky-social/pds` or another);
  - restoring from a CAR plus your rotation key (an "offline restore from CAR file + rotation key" feature is listed in TODO.md).
  - Keep your own PLC rotation key and a periodic CAR and blob export, as the docs insist.
  - The AGPL code, a pinned flake rev and the Cachix cache keep a frozen build working. Security fixes would stop.
- **Hosting dependency:** the source, flake input and docs live on Tangled (itself an atproto app), and container images on `atcr.io`. Pin and mirror.
- **Missing or different vs the official PDS:**
  - No raw-binary releases and no admin CLI. The admin UI is barebones.
  - Moderation is only an external report service (`[moderation] report_service_url`, `report_service_did`).
  - No default AppView proxy and no "talk to Bluesky by default" behaviour.
  - Stricter OAuth scope policy, so some third-party apps and clients break.
  - Email is optional, but the account-verification flow in migration needs some comms channel (email, Discord, Telegram or Signal).
  - The embedded DB is not recommended and has no conversion path to or from Postgres.
  - Operators must read the `seq` troubleshooting section in the [debugging doc](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/docs/3_DEBUGGING_YOUR_SETUP.md). If the PDS `seq` falls behind the relays', changes stop propagating until you reset `firehose_seq` with `setval`.
- **Stated incompatibilities** ([KNOWN_ISSUES.md](https://tangled.org/tranquil.farm/tranquil-pds/raw/main/KNOWN_ISSUES.md)): only the stream.place iOS app OAuth flow fails with `ASWebAuthenticationSession`. Nothing is stated about Tangled, bsky.app or relays; the core team has Tangled ties (a "guest" channel in the Tangled Discord).
- **Rate limit:** `subscribeRepos` allows 1 request per minute per IP with a burst of 5. Many relays on distinct IPs are fine. Heavy reconnect loops from one IP would not be.

## Gaps / uncertain
- **First release date:** not found. The Tangled tags page shows 0.7.0 as its oldest entry, and the start-of-project dates above are estimates from other posts.
- **R2:** not documented. Test `S3_ENDPOINT`, `AWS_REGION=auto` and path-style access on a scratch bucket.
- **Unauthenticated `listRecords` and `goat` migration:** not tested live. I only read the route table (from an old fork snapshot) and docs. Run `curl https://<pds>/xrpc/com.atproto.repo.listRecords?repo=<did>&collection=...` and a goat dry run on a throwaway account.
- **Migrations on upgrade:** whether they run automatically at startup in 0.9.x is not confirmed. The NixOS guide says nothing about `sqlx`.
- **NixOS module option names:** I did not read the current `module.nix` in full (the nginx snippet above is from a fork), so verify options like `nginx.enable` against the main branch.
- **Cachix:** the page did not render, so contents and retention are unverified. Trust is based on the docs.
- **Tangled and bsky.app interop:** no first-party statement either way. Sample a real instance such as [tranquil.farm](https://tranquil.farm) to see how apps behave.

