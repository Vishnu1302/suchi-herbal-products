---
name: typescript-architecture-and-patterns
description: "USE FOR: code architecture decisions, design patterns (SOLID, DI, strategy, observer), module design, dependency inversion, separation of concerns in TypeScript."
applyTo: "**"
---

## Architecture & Patterns

- **No Enums:** Prefer `const object` with `as const` or Union Types (`type Status = 'active' | 'inactive'`) over TypeScript `enum`.
- **Return Types:** All exported functions and hooks MUST have explicit return types defined.
- **No `@ts-ignore`:** Strictly banned. Use `@ts-expect-error` with a comment if absolutely necessary.
- **Circular Dependencies:** Do not import from the `index.ts` of the current folder. Import directly from the file.
- Follow the repository's dependency injection or composition pattern; keep modules single-purpose.
- Observe existing initialization and disposal sequences when wiring into lifecycles.
- Keep transport, domain, and presentation layers decoupled with clear interfaces.
- Supply lifecycle hooks (e.g., `initialize`, `dispose`) and targeted tests when adding services.
