---
name: frontend-project-structure-and-organization
description: "USE FOR: folder structure rules, feature slicing, module boundaries, NX library pattern, where to place new files, directory conventions."
---

## Project Structure & Organization

- **Library-First Architecture (NX Conventions):**

  - **Rule:** Organize code using NX library conventions within `src/libs/` (domain-specific) and `src/shared/` (cross-domain).
  - **Anti-Pattern:** Stop creating new components in `atoms/molecules/organisms`. This Atomic Design structure is legacy.
  - **Colocation:** Colocate tests, styles, and types within the library folder.
  - **Shared UI:** Only truly generic, reusable UI elements (Buttons, Inputs) belong in `src/shared/` libraries.

- **NX Library Subpaths:**
  Each library in `src/libs/{domain}/` or `src/shared/{domain}/` contains these subpaths:

  - **`util/`:** Pure functions, helpers, utilities. No side effects.
  - **`data-access/`:** Hooks for GraphQL, stores, services. Contains `useQuery`/`useMutation` wrappers.
  - **`ui/`:** Presentational (dumb) components. Pure UI, receives data via props.
  - **`feature-*/`:** Smart components combining UI + data access (e.g., `feature-products-list/`).

- **Import Rules:**

  - **Inside a library:** Use relative imports (`./`, `../`).
  - **Outside a library:** Use path aliases (`#libs/...`, `#shared/...`).
  - **NEVER** import from root barrel (e.g., `#libs/products` is FORBIDDEN).
  - **ALWAYS** import from explicit subpath (e.g., `#libs/products/util`, `#shared/products/ui`).

- **Dependency Direction:**

  - `src/libs/` → `src/shared/` ✅ (libs can import from shared)
  - `src/shared/` → `src/libs/` ❌ (shared CANNOT import from libs)

- **Directory Roles:**
  - `pages/`: **Routing & Data Fetching ONLY.** Contains `getServerSideProps`/`getStaticProps`. No complex UI logic.
  - `src/libs/`: Domain-specific libraries (single domain usage).
  - `src/shared/`: Cross-domain shared libraries (multi-domain usage).
  - `src/components/`: Legacy reusable UI components (do not add new).
  - `src/hooks/`: Shared custom hooks (legacy, prefer `data-access/` in libs).
  - `src/lib/`: Utilities, API clients, helpers (legacy).
  - `public/`: Static assets.
- **Clean Code:**
  - Avoid "kitchen sink" folders.
  - Use `index.ts` barrel files only at subpath level (e.g., `src/libs/products/util/index.ts`). Do NOT create root barrel files.
