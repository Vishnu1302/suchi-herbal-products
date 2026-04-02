---
name: project-strategic-vision-to-be
description: "USE FOR: target architecture vision — where the project is heading, migration end-state, desired patterns, long-term technical direction."
applyTo: "**"
---

## 2. Strategic Vision (The "To-Be")

We are moving towards a more scalable, maintainable, and domain-driven architecture.

- **Library-First Architecture (NX Conventions):** Shift from Atomic Design to a **Library-First Architecture** following NX monorepo conventions. Code should be organized by business domain within `src/libs/` (domain-specific) and `src/shared/` (cross-domain shared).
- **NX Library Structure:**
  - **`src/libs/{domain}/`:** Domain-specific libraries (e.g., `src/libs/products/`). Contains code used only by one domain.
  - **`src/shared/{domain}/`:** Shared libraries for cross-domain code (e.g., `src/shared/products/`). Contains code reused across multiple domains.
  - **Subpath Types:** Each library is divided into 4 subpath types:
    - **`util/`:** Pure functions, helpers, and utilities.
    - **`data-access/`:** Hooks for GraphQL queries/mutations, stores, services.
    - **`ui/`:** Presentational components (dumb components).
    - **`feature-*/`:** Smart components combining UI + data access (e.g., `feature-products-list/`, `feature-product-card/`).
- **Decoupling:**
  - **CMS:** Move towards a "Headless" approach where the frontend is agnostic of the specific CMS (Contentful). Prepare for a potential migration to a TMS (Translation Management System) or different content provider.
  - **Strict CMS Decoupling:**
    - **UI Components must be CMS-agnostic.** A `ProductCard` component should expect `title: string`, NOT `fields: { title: { 'en-US': string } }`.
    - **Transformation Layer:** All CMS data transformation must happen in `src/mappers` BEFORE reaching the component.
    - **Ban `sys` and `fields`:** Strictly forbid passing raw CMS objects (`sys`, `fields`) into UI components.
  - **Logic:** Extract business logic into pure functions and custom hooks, separated from UI components.
- **Micro-Frontends:** The long-term goal is to enable a micro-frontend architecture. The current refactoring towards library-based modules is a prerequisite for this.
- **Strict Standards:** Enforce strict TypeScript usage, named exports, and CSS-first styling to improve maintainability and performance.
