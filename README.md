# Notebook

Private backup aggregator for every project's `.scratch/` directory (issue
trackers, specs, grilling outcomes, and `writing/fragments.md` raw material).
Owned and backed up independently of the source repositories, which keep
`.scratch/` gitignored so it can never leak into public code.

## Layout

Each project gets a subdirectory mirroring its `.scratch/`:

```
.notebook/
├── home-base/      <- ~/code/home-base/.scratch
├── pi-harness/     <- ~/.pi/.scratch
└── sync.sh         <- the aggregation + commit + push script
```

## Adding a project

Edit `sync.sh` and append a `source-scratch-dir:subdir-name` line to the
`PROJECTS` array. Absolute paths, one per project. Then run `bash sync.sh`.

## Usage

```bash
bash ~/.notebook/sync.sh
```

Runs `rsync --delete` per project, commits if changed, and pushes if the
remote is reachable. Safe to run on a schedule (no-op when nothing changed).

## Remote / forge

The remote is disposable: point it at GitHub now, and later at
Forgejo/Tangled/a VPS, without changing anything in the source repos — they
stay gitignored and this repo is the only backup surface.