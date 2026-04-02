---
name: typescript-configuration-and-secrets
description: "USE FOR: environment variables (via src/config.ts, NEVER process.env directly), config file patterns, secrets handling, feature flag configuration."
---

## Configuration & Secrets

- Reach configuration through shared helpers and validate with schemas or dedicated validators.
- Handle secrets via the project's secure storage; guard `undefined` and error states.
- Document new configuration keys and update related tests.
