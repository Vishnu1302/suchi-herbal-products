---
name: typescript-naming-and-style
description: "USE FOR: TypeScript naming conventions — variables, types (PascalCase), type keyword (not interface), constants (UPPER_SNAKE), function naming, generic type parameter naming."
applyTo: "**"
---

## Naming & Style

- **Exports:** Prefer **Named Exports** (`export const foo = ...`) over Default Exports. This ensures consistent naming across the codebase and aids refactoring.
- Use PascalCase for classes, types, and enums; camelCase for everything else.
- Don't use prefixes like `I` or `T`; rely on descriptive names.
- Name things for their behavior or domain meaning, not implementation.
- **Component Props Naming:**
  - **Internal (Non-Exported):** Use `type Props = { ... }` if the props are not exported.
  - **External (Exported):** If exporting, name the type explicitly as `ComponentNameProps` (e.g., `export type ProductCardProps = { ... }`).
  - **Preference:** Use simple `type Props` for internal components. Rename definitions to `ComponentNameProps` only when exporting is required for reuse.
