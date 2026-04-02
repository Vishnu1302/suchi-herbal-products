---
name: frontend-standards-naming-and-exports
description: "USE FOR: file naming conventions, export rules (named exports, no default except pages), component naming, hook naming, constant naming, directory naming."
applyTo: "**"
---

## Coding Standards & Style

- **Naming:**
  - **Components:** `PascalCase` (e.g., `UserProfile.tsx`).
  - **Hooks:** `camelCase` (e.g., `useAuth.ts`).
  - **Folders:** `kebab-case` (e.g., `user-profile/`).
  - **Assets:** `kebab-case` or `snake_case` (e.g., `logo-dark.svg`).
  - **Context Providers:** `PascalCase` with 'Provider' suffix (e.g., `ThemeProvider`).
  - **Constants:** `UPPER_SNAKE_CASE`.
- **Exports:** Prefer **Named Exports** (`export const Component = ...`) to enforce consistent naming.
