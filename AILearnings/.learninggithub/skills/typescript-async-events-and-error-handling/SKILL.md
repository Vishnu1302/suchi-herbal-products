---
name: typescript-async-events-and-error-handling
description: "USE FOR: async/await patterns, Promise handling (no .then chains), error handling strategy, custom error types, event patterns, AbortController usage."
---

## Async, Events & Error Handling

- Use `async/await`; wrap awaits in try/catch with structured errors.
- Guard edge cases early to avoid deep nesting.
- Send errors through the project's logging/telemetry utilities.
- Surface user-facing errors via the repository's notification pattern.
- Debounce configuration-driven updates and dispose resources deterministically.
