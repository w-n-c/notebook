#!/usr/bin/env bash
# Aggregate every tracked project's `.scratch/` (and future `writing/` raw
# material) into one private backup repo, then commit and push.
#
# `.scratch/` stays gitignored inside each source repo (so it can never leak
# into a public code repo). This script copies it into a single private
# "notebook" repo, giving one backup target + one push that scales to any
# number of projects. Replace the remote later (Forgejo/Tangled/etc.) without
# touching the source repos.
set -euo pipefail

# Where the aggregating repo lives and where each project's source scratch is.
NOTEBOOK_DIR="${NOTEBOOK_DIR:-$HOME/.notebook}"

# A project is:  source-scratch-dir  ->  subdir-name-in-the-notebook
# Add a line per project. Use absolute paths so this runs from anywhere.
PROJECTS=(
  "$HOME/code/home-base/.scratch:home-base"
  "$HOME/.pi/.scratch:pi-harness"
)

cd "$NOTEBOOK_DIR"

for entry in "${PROJECTS[@]}"; do
  src="${entry%%:*}"
  name="${entry##*:}"
  dest="$NOTEBOOK_DIR/$name"

  if [[ -d "$src" ]]; then
    # Mirror: delete stale files in dest that no longer exist in src.
    mkdir -p "$dest"
    rsync -a --delete "$src/" "$dest/"
    echo "synced: $name <- $src"
  else
    echo "skipped (no .scratch yet): $name"
  fi
done

# Only commit when something changed.
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -q -m "backup: sync scratch for $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "committed: $(git log -1 --format=%h)"
fi

# Push happens only if a remote is configured and reachable; don't fail the
# whole backup if offline.
if git remote get-url origin >/dev/null 2>&1 && git ls-remote origin >/dev/null 2>&1; then
  git push -q origin HEAD 2>&1 || echo "WARN: push failed (offline or remote missing) — local commit is saved."
else
  echo "note: no reachable remote; local commit saved only."
fi

echo "done."