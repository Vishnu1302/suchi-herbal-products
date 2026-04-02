---
name: project-project-structure-rules
description: "USE FOR: directory placement rules — where new files go, NX library structure rules, feature vs shared vs libs boundaries, file co-location requirements."
applyTo: "**"
---

### Project Structure Rules

- **NX Library Architecture:**
  - **Import Aliases:**
    - Use `#libs/{domain}/{subpath}` for domain-specific imports (e.g., `#libs/products/util`).
    - Use `#shared/{domain}/{subpath}` for shared imports (e.g., `#shared/products/ui`).
  - **Import Rules:**
    - **Inside a library:** Use relative imports (`./`, `../`).
    - **Outside a library:** Use path aliases (`#libs/...`, `#shared/...`).
    - **NEVER** import from root barrel (e.g., `#libs/products` is FORBIDDEN).
    - **ALWAYS** import from explicit subpath (e.g., `#libs/products/util`, `#shared/products/ui`).
  - **Dependency Direction:**
    - `src/libs/` → `src/shared/` ✅ (libs can import from shared)
    - `src/shared/` → `src/libs/` ❌ (shared CANNOT import from libs)
    - This ensures shared code remains domain-agnostic.
- **Utils vs. Helpers (Consolidation Strategy):**
  - **Current State:** The distinction between `src/utils` and `src/helpers` is ambiguous.
  - **Rule:**
    - **`src/utils`:** Only for PURE, generic functions (e.g., date formatting, math, string manipulation) that know NOTHING about the business domain.
    - **Domain Logic:** Anything containing business logic (e.g., `getOfferShortDescription`) must go into `src/libs/...` or `src/shared/...`.
    - **Deprecation:** Treat `src/helpers` as a legacy folder. Do not add new files there. Move logic to `libs/`, `shared/`, or `utils/` when refactoring.
- **`data-modules` vs. `libs`:**
  - **Current State:** `src/data-modules` is a legacy attempt at modularization.
  - **Rule:**
    - **New Code:** Create new modules in `src/libs/` or `src/shared/` following NX conventions.
    - **Existing Code:** If you are heavily refactoring a module in `src/data-modules`, consider migrating it to `src/libs/` or `src/shared/`.
    - **Do NOT** add new folders to `src/data-modules`.
