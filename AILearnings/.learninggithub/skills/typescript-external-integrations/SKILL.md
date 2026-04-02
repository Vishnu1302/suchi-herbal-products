---
name: typescript-external-integrations
description: "USE FOR: API call patterns, third-party service integration, GraphQL client usage (Apollo), REST API calls, webhook handling, external SDK usage."
---

## External Integrations

- Instantiate clients outside hot paths and inject them for testability.
- Never hardcode secrets; load them from secure sources.
- Apply retries, backoff, and cancellation to network or IO calls.
- Normalize external responses and map errors to domain shapes.
- **REST API Calls (if applicable):**
  - If `src/api` contains REST clients:
    - **Validation:** Responses must be validated with Zod schemas, just like CMS data. Do not trust `any` or generic `T` from `fetch/axios`.
    - **Typed Returns:** Functions should return parsed, typed data, not the raw `Response` object.
