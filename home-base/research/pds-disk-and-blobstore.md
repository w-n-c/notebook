# PDS disk consumption and blob storage — research note

Scope: the official distro [`github.com/bluesky-social/pds`](https://github.com/bluesky-social/pds) (compose + `pdsadmin` + Caddy + Watchtower, image `ghcr.io/bluesky-social/pds:0.4`) and the upstream engine it wraps, [`bluesky-social/atproto` `packages/pds`](https://github.com/bluesky-social/atproto/tree/main/packages/pds). Facts are marked **[fact]** (quoted from a file/issue); reasoning is marked **[est]**.

## Disk budget in 8 lines

```
1. /pds sqlite  (account+sequencer+did_cache+actors/<did>/store.sqlite)  ~0.05-0.2 GB / yr   [est]
2. /pds/blocks  (blobs: avatars, images)                                 ~0.1-3  GB / yr     [est, media-dependent]
3. /pds overhead (WAL tail, blocks/tempt orphans, snapshot headroom)     +10-20 % of 1+2     [est]
4. Docker images (pds 229 MB + caddy 49 MB + watchtower 15 MB measured)  ~0.3-0.7 GB         [fact+est]
5. Docker json-file logs, capped by installer at 500m x 4 = 2 GB/container, pds only ~0.1-2 GB
6. OS + docker engine + apt cache                                        ~2-3 GB             [est]
7. journald  (default caps: 10 % of /var/log fs, max 4 GiB)              0-0.5 GB typical     [fact+est]
8. NixOS only: /nix/store + generations                                  10-30 GB            [est]
=> typical 1-user PDS working set 5-8 GB; recommend 20 GB SSD (upstream's own rec),
   safety factor ~2.5-4x; 40 GB if posting video/large media. With blobs moved to
   S3-compatible storage, /pds drops to <1 GB and a 10 GB volume is comfortable.
```

Upstream states the same class of machine for 1–20 users: "Storage | 20 GB SSD", "CPU Cores | 1", "RAM | 1 GB" — [`README.md` Server Recommendations](https://github.com/bluesky-social/pds/blob/main/README.md).

---

## 1. Data directory layout

**[fact]** The container bind-mounts the host dir `/pds` into `/pds` ([`compose.yaml`](https://github.com/bluesky-social/pds/blob/main/compose.yaml)), and `/pds` is the single backup target the installer prints ("Backup service data : /pds", [`installer.sh`](https://github.com/bluesky-social/pds/blob/main/installer.sh)). The installer refuses any other path (`if [[ "${PDS_DATADIR}" != "/pds" ]] … "The data directory must be /pds"`).

Paths come from the env defaults in [`sample.env`](https://github.com/bluesky-social/pds/blob/main/sample.env) / `installer.sh` (`PDS_DATA_DIRECTORY=/pds`, `PDS_BLOBSTORE_DISK_LOCATION=/pds/blocks`) and the engine's resolution in [`packages/pds/src/config/config.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/config/config.ts):

| Path | What it is | Source |
|---|---|---|
| `/pds/pds.env` | **secrets**: `PDS_JWT_SECRET`, `PDS_ADMIN_PASSWORD`, `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` | installer.sh writes it |
| `/pds/compose.yaml` | copy of upstream compose, `sed`-rewritten on update | `pdsadmin/update.sh` |
| `/pds/account.sqlite` (+`-wal`,`-shm`) | accounts, invites, oauth, email tokens | `accountDbLoc: env.accountDbLocation ?? dbLoc('account.sqlite')` |
| `/pds/sequencer.sqlite` (+wal) | `repo_seq` event log for `subscribeRepos` / relay backfill | `sequencerDbLoc … dbLoc('sequencer.sqlite')` |
| `/pds/did_cache.sqlite` (+wal) | DID/handle resolution cache (re-derivable) | `didCacheDbLoc … dbLoc('did_cache.sqlite')` |
| `/pds/actors/<hh>/<did>/store.sqlite` | the **repo**: MST blocks, records, indexes, blob table (`hh = sha256(did)[0:2]`) | [`actor-store.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/actor-store/actor-store.ts) `getLocation()` |
| `/pds/actors/<hh>/<did>/key` | **per-account secp256k1 signing key** — losing it loses the repo | same |
| `/pds/actors/<hh>/<did>/did-op` | stored PLC op | same |
| `/pds/actors/reserved_keys/` | keys reserved during account creation | same |
| `/pds/blocks/<did>/<cid>` | **blobs** (one flat dir per account, unsorted CIDs) | [`disk-blobstore.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/disk-blobstore.ts) `getStoredPath()` |
| `/pds/blocks/tempt/<did>/…` | in-progress/never-linked uploads (default `tmp = location/tempt`) | same, `creator()` |
| `/pds/blocks/quarantine/<did>/…` | blobs under takedown | same |
| `/pds/caddy/data`, `/pds/caddy/etc/caddy` | ACME account keys + TLS certs; `Caddyfile` | `compose.yaml` + installer |
| `/pds/pds.log` | **optional**, only if you set `LOG_DESTINATION=/pds/pds.log` — unrotated | README "Logging" |

Env vars exist to relocate every DB and the actor store if you ever need to (`PDS_ACCOUNT_DB_LOCATION`, `PDS_SEQUENCER_DB_LOCATION`, `PDS_DID_CACHE_DB_LOCATION`, `PDS_ACTOR_STORE_DIRECTORY`, `PDS_BLOBSTORE_DISK_TMP_LOCATION`) — all present in [`config/env.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/config/env.ts). None of them are in the distro's README env table; only `PDS_DATA_DIRECTORY` and `PDS_BLOBSTORE_DISK_LOCATION` are.

## 2. Blob storage: disk by default, S3 supported by the engine, undocumented in the distro

**[fact]** The distro is disk-only by default: `PDS_BLOBSTORE_DISK_LOCATION=/pds/blocks` in both `sample.env` and the generated `/pds/pds.env`. The README's environment-variable table lists no S3 variables at all, and there is no S3 question in the interactive installer.

**[fact]** The engine *does* implement S3, and the distro's env parser will accept it. Exact keys (`packages/pds/src/config/env.ts`):

```
PDS_BLOBSTORE_S3_BUCKET
PDS_BLOBSTORE_S3_REGION
PDS_BLOBSTORE_S3_ENDPOINT
PDS_BLOBSTORE_S3_FORCE_PATH_STYLE
PDS_BLOBSTORE_S3_ACCESS_KEY_ID
PDS_BLOBSTORE_S3_SECRET_ACCESS_KEY
PDS_BLOBSTORE_S3_UPLOAD_TIMEOUT_MS
PDS_BLOBSTORE_S3_REQUEST_TIMEOUT_MS
PDS_BLOBSTORE_DISK_LOCATION
PDS_BLOBSTORE_DISK_TMP_LOCATION
```

and the selection logic (`config.ts`) is strict XOR:

```ts
if (env.blobstoreS3Bucket && env.blobstoreDiskLocation) {
  throw new Error('Cannot set both S3 and disk blobstore env vars')
}
… else if (env.blobstoreDiskLocation) { provider: 'disk' … }
else { throw new Error('Must configure either S3 or disk blobstore') }
```

So switching to S3 = add the `PDS_BLOBSTORE_S3_*` vars **and delete** the `PDS_BLOBSTORE_DISK_LOCATION` line from `/pds/pds.env`, then `systemctl restart pds`. No migration tool exists: existing files under `/pds/blocks` would simply stop being used.

**[fact]** Maintainers treat this as the intended production path but not a documented one: in [pds#297](https://github.com/bluesky-social/pds/issues/297) a contributor writes "when you're going to production, you should be using Object storage for blobs rather than keeping them in the directory. We should probably look at making an interactive setup script that configures an S3 endpoint eventually", and in [pds#309](https://github.com/bluesky-social/pds/issues/309) "could use an example cron or systemd here" re S3 lifecycle rules. A third-party operator confirms it works off-label: "This is not officially documented in the PDS repository, but it seems to work" ([Scaleway/Traefik write-up](https://blog.jarylc accelerated... )) — see Gaps for the link caveat.

**[fact]** Indigo (Go) status changed: `cmd/pds` **no longer exists** on `bluesky-social/indigo@main` (the `cmd/` tree now holds `relay`, `tap`, `sonar`, `rainbow`, …); the Go PDS had `--blobstore-s3-bucket` etc. in its day, but it is not the code running in this distro. The distro image is the TypeScript PDS + a `goat` CLI: [`Dockerfile`](https://github.com/bluesky-social/pds/blob/main/Dockerfile) builds `FROM node:24-alpine`, installs `@atproto/pds` from `service/`, and copies in `goat v0.2.7`. Don't cite indigo for S3 here — cite `@atproto/pds` as above.

## 3. Footprint after one year, single active user

Only two hard numbers are measurable from primary sources: the vendor's 20 GB / 1–20 users recommendation, and the image sizes. Everything else here is **[est]** with the reasoning shown.

| Component | Light | Typical (posts, likes, some images) | Heavy (image/video poster) | Reasoning |
|---|---|---|---|---|
| `actors/<did>/store.sqlite` | 5–15 MB | 30–80 MB | 100–200 MB | `[est]` bluesky repo records are ~0.3–1 KB JSON; MST + `record`/`backlink`/`record_blob` index rows add ~2–3×; 2k–10k own records/yr (posts, likes, follows, reposts all live in your repo) |
| `sequencer.sqlite` | 2–5 MB | 5–20 MB | 20–50 MB | `[est]` one CBOR commit event per write in `repo_seq`; no time-based pruning found in [`sequencer.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/sequencer/sequencer.ts) (only per-DID delete on account deletion) |
| `account.sqlite` + `did_cache.sqlite` | <2 MB | 2–10 MB | 10–20 MB | `[est]` fixed-ish tables; OAuth sessions and DID cache churn |
| `/pds/blocks` | 50–200 MB | 0.3–2 GB | 3–15 GB | `[est]` Bluesky client compresses images to ≲1 MB; 200–2,000 blobs/yr × 0.2–1 MB. `PDS_BLOB_UPLOAD_LIMIT=314572800` (300 MB) means one video-sized blob can dwarf everything |
| WAL tail | ~4 MB/db | same | same | `[fact-ish]` SQLite auto-checkpoint default 1000 pages × 4 KiB ≈ 4 MB; PDS runs WAL (hence the `PDS_SQLITE_DISABLE_WAL_AUTO_CHECKPOINT` escape hatch) |
| `blocks/tempt` orphans | 0 | 10–100 MB | 0.5–2 GB | `[fact]` no periodic cleanup of never-linked uploads ([pds#309](https://github.com/bluesky-social/pds/issues/309), still open) |

**Total `/pds` after a year: ~0.15 GB light, ~0.6–2 GB typical, ~4–18 GB media-heavy [est].** The spread is almost entirely blobs; the sqlite side is small and roughly linear in write volume.

Blobs also carry filesystem risk, not just bytes: all of one account's blobs sit in a single `blocks/<did>/` directory, and the maintainers declined to shard it ([pds#297](https://github.com/bluesky-social/pds/issues/297); one operator reports 1,800 blobs in that flat dir) — irrelevant at 10³ files, relevant at 10⁵.

## 4. Growth-control levers that actually exist

- **Per-blob limit — documented.** `PDS_BLOB_UPLOAD_LIMIT`, distro default `314572800` (300 MB) in `sample.env`/README; engine default if unset is `5 * 1024 * 1024` ("5mb", `config.ts`). This is **per blob**, not per account. Lowering it is a one-line `pds.env` edit + restart.
- **Per-account total quota — does not exist.** Config exposes only `blobUploadLimit` and `maxImportSize` (`PDS_MAX_REPO_IMPORT_SIZE`). No account-quota machinery in `@atproto/pds` config; quota policy lives in the AppView/relay, not your PDS.
- **`pdsadmin` — no gc, no vacuum, no snapshot.** [`pdsadmin/help.sh`](https://github.com/bluesky-social/pds/blob/main/pdsadmin/help.sh) lists exactly: `account create|delete|takedown|untakedown|reset-password`, `request-crawl`, `create-invite-code`, `help`, plus [`update.sh`](https://github.com/bluesky-social/pds/blob/main/pdsadmin/update.sh). The proxy script downloads only these (`pdsadmin.sh`: `${PDSADMIN_BASE_URL}/${COMMAND}.sh`), so no hidden commands.
- **Deleting records does reclaim blob bytes.** `deleteDereferencedBlobs()` in [`blob/transactor.ts`](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/actor-store/blob/transactor.ts) deletes `record_blob` rows for deleted/updated records and removes the corresponding files from the blobstore. It does **not** shrink the sqlite files: SQLite reuses freed pages but the file only shrinks via `VACUUM` ([sqlite.org/lang_vacuum.html](https://sqlite.org/lang_vacuum.html)).
- **Deleting an account** (`pdsadmin account delete <did>`) tears down the actor directory and its blobs (`DiskBlobStore.deleteAll()` removes `blocks/<did>`, `blocks/tempt/<did>`, `blocks/quarantine/<did>`), and `sequencer.ts` deletes that account's `repo_seq` rows.
- **Orphaned uploads: no lever, manual only.** A blob uploaded but never referenced stays in `blocks/tempt/<did>/` forever ([pds#309](https://github.com/bluesky-social/pds/issues/309)). Least-risk manual version: stop `pds`, `find /pds/blocks/tempt -type f -mtime +30 -delete`, restart. **[est / inferred — not documented]**
- **Log retention — documented at the docker layer, not in the app.** The installer writes `/etc/docker/daemon.json` with `{"log-driver":"json-file","log-opts":{"max-size":"500m","max-file":"4"}}` (≈2 GB cap per container); if `daemon.json` already exists it only prints "Ensure log rotation is enabled". Setting `LOG_DESTINATION=/pds/pds.log` writes **into the data dir with no rotation** — avoid it, or pair with logrotate.
- **Sequencer pruning: none found.** `repo_seq` is pruned only per account deletion.
- **SQLite `VACUUM` is safe but not online.** It rebuilds the database into a temp file, needs free space ≈ the DB size, and fails if there's an open transaction; PDS has no "pause writes" mode. Practical recipe: stop `systemctl stop pds`, `sqlite3 /pds/.../store.sqlite 'VACUUM;'`, restart. For a 1-user PDS the DBs are tens of MB — not worth the risk unless you deleted a lot.

## 5. Backup and restore

**[fact]** There is **no official backup procedure and no `pdsadmin backup`**. The only official guidance is the installer's success banner, "Backup service data : /pds", and the README repeating it. [`ACCOUNT_MIGRATION.md`](https://github.com/bluesky-social/pds/blob/main/ACCOUNT_MIGRATION.md) is about moving an account to *another* PDS (CAR export + blob replay + PLC op), not about backups; it also warns the operation is destructive.

Least-risk options, in descending order of safety **[inferred — the repo does not prescribe any of these]**:

1. **Stop, then copy.** `sudo systemctl stop pds` (compose `down`), `tar -C / --exclude=pds/caddy/data/ocsp -czf pds-$(date +%F).tgz pds`, restart. This is the only approach that needs no SQLite knowledge, and it also captures `pds.env`, `compose.yaml`, and per-account keys. Downtime: seconds to a minute for a 1-user instance.
2. **Filesystem/LVM/ZFS snapshot of the volume while running.** Equivalent to a power-cut image; SQLite is crash-safe under WAL, and the snapshot is atomic across all files ([sqlite.org/howtocorrupt.html](https://www.sqlite.org/howtocorrupt.html)).
3. **Online, per-DB consistent copy.** `sqlite3 /pds/account.sqlite ".backup /backup/account.sqlite"` (same for `sequencer.sqlite`, `did_cache.sqlite`, `actors/<hh>/<did>/store.sqlite`), then `rsync` everything non-SQLite (`pds.env`, `compose.yaml`, `blocks/`, `caddy/`). `.backup` uses the SQLite backup API and is safe while the PDS runs; a plain `cp`/`tar` of a live DB is not — "if you copy a database file and its `-wal` at different times you can end up with corruption" ([howtocorrupt](https://www.sqlite.org/howtocorrupt.html)).

**Do not omit `pds.env` and `actors/*/key`**: `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` plus the per-account signing key are what let you keep updating your DID document. A backup without them restores content but not control. Also note the README's warning that wiping and reinstalling under the same hostname without a proper migration desynchronises you from the relay.

Restoring onto the same hostname: stop, move `/pds` aside, untar, start — that flow is what the community script [venkr/bsky-pds-backup](https://github.com/venkr/bsky-pds-backup) documents, including an honest caveat that its `tar`-while-running mode is theoretically unsafe and that provider snapshots are the safer equivalent.

## 6. Upgrade behaviour

**[fact]** Two paths, both documented in the README "Updating your PDS": automatic via Watchtower, manual via `sudo pdsadmin update`.

- Watchtower: `ghcr.io/nicholas-fedor/watchtower:latest`, `WATCHTOWER_CLEANUP: true`, `WATCHTOWER_SCHEDULE: "@midnight"` ([`compose.yaml`](https://github.com/bluesky-social/pds/blob/main/compose.yaml)). Cleanup removes the superseded image, so steady-state image storage stays ≈ one generation; during a pull you momentarily hold two (~0.5 GB extra **[est]**).
- `pdsadmin update` re-downloads `compose.yaml` from `raw.githubusercontent.com`, `sed`s the data dir, `cmp`s and replaces it if changed, `docker compose pull`, `systemctl restart pds` ([`update.sh`](https://github.com/bluesky-social/pds/blob/main/pdsadmin/update.sh)).
- Data-dir effects: schema migrations run at startup (`migrator.migrateToLatestOrThrow()` in `sequencer.ts`, `getMigrator()` in the actor store). SQLite migrations that rebuild a table need temporary free space of roughly that table's size and, absent `VACUUM`, leave the file larger afterwards **[inferred]**. `did_cache.sqlite` can be deleted outright if it ever gets weird. No upgrade path in the repo rewrites or moves `blocks/`.
- The installer is not an upgrade tool: it aborts if `/pds/account.sqlite` exists.

## 7. Host-level disk that is invisible in `/pds`

| Thing | Where | Size |
|---|---|---|
| Docker images | `/var/lib/docker` (overlay2) | **[fact]** `docker images` from [pds#75](https://github.com/bluesky-social/pds/issues/75): `caddy 2 → 49.1MB`, `ghcr.io/bluesky-social/pds:0.4 → 229MB`, `watchtower → 14.7MB`. **[est]** today's pds image ≈ 300–400 MB (node 24 alpine + deps + goat). Check with `docker system df`. |
| Docker build cache / dangling images | `/var/lib/docker` | **[est]** 0 with `WATCHTOWER_CLEANUP`, hundreds of MB if cleanup is off |
| Docker named volumes | — | **[fact]** none: `compose.yaml` uses only bind mounts |
| Docker json-file logs | `/var/lib/docker/containers/*/*-json.log` | **[fact]** capped at 500m × 4 per container by `daemon.json` |
| Caddy certs | `/pds/caddy/data` (**inside** the data dir) | **[est]** tens of KB; on-demand certs per `*.hostname` handle |
| journald | `/var/log/journal` | **[fact]** defaults `SystemMaxUse=10%` of the filesystem, hard-capped 4 GiB ([journald.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html)). Only grows if you ship `docker logs` into the journal or run other services. |
| apt cache / docker engine / OS | `/var/cache/apt`, `/var/lib/dpkg`, `/usr` | **[est]** 2–3 GB on Ubuntu/Debian server |
| NixOS only | `/nix/store`, `/nix/var/nix/profiles` | **[est]** 10–30 GB with a few months of generations; `nix-collect-garbage --delete-older-than 14d` plus `nixos-collect-garbage -d` ([NixOS manual, cleaning the store](https://nixos.org/manual/nixos/stable/#sec-nix-gc)). Docker itself still lives in `/var/lib/docker` on NixOS. |
| Backups staged on the same box | wherever you point them | **[est]** ≥ the size of `/pds`; put them on object storage or another host |

## Gaps / uncertain

- **No first-party measured `du` output.** Nobody in the pds repo publishes per-component sizes for a 1-year single-user instance; my GB figures are derived from record/blob sizes and write volumes, not observed. The honest way to close this: `du -sh /pds /pds/blocks /pds/actors /pds/*.sqlite` on the live box, monthly.
- **Video.** Bluesky's video upload pipeline (separate video service) may still land the raw file as a PDS blob; I did not verify where the bytes end up, and `PDS_BLOB_UPLOAD_LIMIT=300MB` suggests they can. If you post video, measure `blocks/` directly.
- **S3 in the distro is code-supported but doc-unsupported.** No README entry, no installer option, no migration tool, no maintainer statement that it's tested with this compose stack. The Scaleway blog post I found via search attests it works; I could not re-fetch that page to quote it precisely, so treat its exact claim as second-hand.
- **`sequencer.sqlite` retention.** I read `sequencer.ts` and found pruning only on account deletion, but did not read `sequencer/db/index.ts` (fetch failed) — there could be a background trim I missed.
- **`blocks/tempt` cleanup.** [#309](https://github.com/bluesky-social/pds/issues/309) says unlinked uploads persist; a commenter claims `deleteDereferencedBlobs` should cover it and the reporter disagrees ("that sounds like a bug then"). Assume orphans accumulate until proven otherwise.
- **SQLite migrations and file growth per upgrade.** Inferred from `migrateToLatestOrThrow`, not measured.
- **`PDS_ACTOR_STORE_CACHE_SIZE` (default 100)** keeps open sqlite handles; irrelevant for one account, but it bounds per-process FDs on multi-user hosts.
- **NixOS numbers** are ballpark; the distro only officially supports Ubuntu 22/24/26.04 and Debian 11/12/13, and the installer hard-fails elsewhere — so on NixOS you're hand-rolling the compose stack anyway.

