---
name: terminal-commands
description: "USE FOR: Moving, renaming, or deleting git-tracked files (git mv vs mv), refactoring folder structure, any file operation on tracked files. Critical for preserving git history. USE WHEN: planning to use rm, mv, cp on tracked files, relocating components. DO NOT USE FOR: application logic."
applyTo: "**"
---

# Terminal Commands

## File Operations: Use Git Commands

| Task                | Command                                           |
| ------------------- | ------------------------------------------------- |
| Move tracked file   | `git mv src/old.tsx src/new.tsx`                  |
| Delete tracked file | `git rm src/obsolete.tsx`                         |
| Delete directory    | `git rm -r src/old-folder/`                       |
| Untracked files     | Use plain `rm`/`mv` (build artifacts, temp files) |

**Why?** `git mv`/`git rm` preserve file history. Plain `mv`/`rm` lose it.

## After File Operations

```bash
ls -la target-dir/       # Verify result
git status --short       # Confirm git tracking
pnpm typecheck           # Check for broken imports
```

## If Gatekeeper Blocks

```
⛔ git mv BLOCKED by Gatekeeper
To unlock, run: sudo gatekeeper allow
```

Tell user: **"Run `sudo gatekeeper allow` to unlock, then I can retry."**

## Batch Operations

```bash
# Move multiple files
for f in src/old/*.tsx; do git mv "$f" src/new/; done

# Delete pattern
git rm src/legacy/*.deprecated.ts
```

## Verification Commands

```bash
pnpm typecheck          # TypeScript check
pnpm test --run         # Run tests
pnpm verify:all         # Full pipeline
```
