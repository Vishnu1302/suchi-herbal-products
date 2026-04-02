---
name: typescript-general-guardrails
description: "USE FOR: hard TypeScript rules — no any (use unknown), no @ts-ignore, no enum (use union/const), no console.log (use #logger), forbidden patterns, lint expectations."
applyTo: "**"
---

## General Guardrails

- Target TypeScript 5.x / ES2022 and prefer native features over polyfills.
- Use pure ES modules; never emit `require`, `module.exports`, or CommonJS helpers.
- Rely on the project's build, lint, and test scripts unless asked otherwise.
- **Environment Variables & Configuration:**
  - **❌ Anti-Pattern:** Never use `process.env.VARIABLE_NAME` directly in components or hooks.
  - **✅ Best Practice:** Use the centralized configuration object from `src/config.ts`.
  - **Validation:** Ensure configuration is validated (e.g., using Zod) at startup. If a required env var is missing, the app should crash fast during build/start, not silently fail in the UI.
- **Logging:**
  - **Production:** Never use `console.log` or `console.error`.
  - **Utility:** Use the global `#logger` module.
    ```typescript
    import logger from '#logger';
    logger.error({ error }, 'Contextual error message');
    ```
  - **No PII:** STRICTLY FORBIDDEN to log Personally Identifiable Information (passwords, tokens, names, emails). Log only IDs (e.g., `userId`, `orderId`).
- Note design trade-offs when intent is not obvious.
