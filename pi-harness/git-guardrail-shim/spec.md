# Git guardrail shim: argv-accurate blocking

## Context

The Layer 2 `git` PATH shim (`agent/guardrails-bin/git`) matched the bare word `push`
anywhere in its arguments, so `git stash push -m wip` was hard-blocked with exit 126 and no
user confirmation path. Meanwhile `git stash drop` and `git stash clear` passed. The two
guardrail layers also disagreed, and one approved command leaked the shim bypass into the
rest of the session.

## Requirements

1. **Anchor to subcommand position.** Only a real `git push` (including after global options
   such as `-C`, `-c`, `--git-dir=`) is blocked as a remote push. False positives are gone:
   `git stash push`, `git branch push`, `git commit -m push`.
2. **Gate the lossy stash operations.** `git stash drop` and `git stash clear` are gated in
   both layers, so Layer 1 shows a confirmation dialog instead of Layer 2 hard-exiting.
3. **Keep recoverable stash allowed.** `git stash`, `git stash push`, `git stash pop`,
   `git stash list`, `git stash show`.
4. **Scope the shim bypass.** `PI_ALLOW_DANGEROUS_GIT=1` applies only to the single approved
   command, not the persistent shell, and a leaked bypass must not survive into a
   non-approved command.
5. **Cover the long flag forms.** `git clean --force` and `git branch --delete --force`
   (and `git branch -d --force`) are gated in both layers; the old short-flag matcher
   missed them. Safe forms still pass: `git clean -n`, `git branch -d`.
6. **Block without ending the turn.** A declined destructive command refuses that command
   but leaves the turn alive so the agent can adapt. Secret-write and circuit-breaker
   blocks keep terminating.

## Out of scope

Reworking unrelated guardrail patterns (`rm -rf`, `sudo`, credential paths, find/grep/jq
performance rules) and the circuit breaker.

Explicitly rejected: making the shim bypass non-defeatable. Any escape hatch the Layer 1
hook can set, the agent can set too (env var or token file), because the agent shares the
hook's filesystem and environment. That needs a privilege boundary this harness does not
have, so the bypass stays an env var rather than growing a cosmetic token file.

Out of scope: the Layer 1 regex heuristic for git commands that place global options
between `git` and the subcommand (shim-only by design).
