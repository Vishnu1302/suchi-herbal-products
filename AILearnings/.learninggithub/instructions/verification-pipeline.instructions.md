---
name: verification-pipeline
description: "USE FOR: Knowing what to run after code changes (pnpm verify:all, typecheck, lint, test, build), app startup validation (pnpm validate-startup), which verification command to run for each type of change. Mandatory before completing any coding task. DO NOT USE FOR: writing test cases or CI/CD pipeline configuration."
applyTo: "**"
---

# Verification Pipeline

## Full Verification

```bash
pnpm verify:all
```

Runs: lint → typecheck → test → generate-graphql-types → build → validate-app-startup

## Individual Commands

| Command                 | Purpose               |
| ----------------------- | --------------------- |
| `pnpm lint`             | ESLint                |
| `pnpm typecheck`        | TypeScript            |
| `pnpm test`             | Vitest                |
| `pnpm build`            | Production build      |
| `pnpm validate-startup` | App startup E2E check |

## When to Verify

| Change           | Run                                        |
| ---------------- | ------------------------------------------ |
| Single file edit | `pnpm typecheck`                           |
| Component change | `pnpm typecheck && pnpm test`              |
| Refactoring      | `pnpm verify:all`                          |
| Before commit    | `pnpm lint && pnpm typecheck && pnpm test` |

## App Startup Validation

Automated check that app loads correctly:

```bash
pnpm validate-startup           # Normal
node scripts/validate-app-startup.mjs --debug  # Verbose
```

**Success:** Login page loads with password input visible.

**Failure modes:**

- `INFINITE_SPINNER` - API issue or hydration stuck
- `BLANK_PAGE_OR_UNKNOWN` - JS crash
- `CRITICAL_ERROR` - Server failed to start

## Port Conflict

```bash
lsof -i :3000       # Find process
kill -9 <PID>       # Kill it
```
