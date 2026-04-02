---
name: devcontainer-and-gatekeeper
description: "USE FOR: Gatekeeper security layer, blocked terminal commands (⛔ BLOCKED by Gatekeeper), DevContainer setup, protected commands (rm, mv, git push/commit/checkout/reset/rebase). Explains sudo gatekeeper allow/block unlock workflow. DO NOT USE FOR: application code, CI/CD configuration."
applyTo: "**"
---

# DevContainer & Gatekeeper

## Gatekeeper = Security for AI Agents

Blocks destructive commands by default. Container starts **LOCKED**.

### Protected Commands

- **Filesystem:** `rm`, `mv`
- **Git:** `push`, `commit`, `checkout`, `merge`, `reset`, `rebase`, `clean`, `mv`, `rm`

### Quick Commands

```bash
gatekeeper status       # Check lock state
sudo gatekeeper allow   # Unlock (password: 1234 default)
sudo gatekeeper block   # Lock again
```

### If Command Blocked

```
⛔ rm BLOCKED by Gatekeeper
To unlock, run: sudo gatekeeper allow
```

**Tell user to run `sudo gatekeeper allow`** - don't try to bypass.

## File Operations

**Always use git commands for tracked files:**

```bash
git mv src/old.tsx src/new.tsx   # ✅ Preserves history
git rm src/obsolete.tsx          # ✅ Preserves history
mv src/old.tsx src/new.tsx       # ❌ Loses history
```

## Customizing Protected Commands

1. Edit `.devcontainer/scripts/git-wrapper` → `PROTECTED_COMMANDS` variable
2. Run: `bash .devcontainer/scripts/setup-gatekeeper.sh`

## Technical: `.real` Pattern

Gatekeeper replaces system binaries:

- `/bin/rm` → wrapper (checks lock)
- `/bin/rm.real` → original binary

Wrapper calls `.real` when unlocked. Gatekeeper itself uses `.real` directly to avoid circular dependency.
