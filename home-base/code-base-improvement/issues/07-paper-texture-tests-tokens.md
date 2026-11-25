# 07 — `paper-texture` Tests the Tokens

**What to build:** `tests/paper-texture.test.ts` holds **3** text assertions on the
texture tokens. Smallest of the set: confirm each asserts on a token or an emitted
rule, and leave it alone if it does.

**Blocked by:** #01
**Status:** `open`

**Acceptance Criteria:**

- [ ] Each of the 3 assertions asserts on a token declaration or on built CSS, not
      on a component's source.
- [ ] `bun test ./tests` and `bash scripts/ci.sh` are green.
