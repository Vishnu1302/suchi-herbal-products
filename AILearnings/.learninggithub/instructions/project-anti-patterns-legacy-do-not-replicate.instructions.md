---
name: project-anti-patterns-legacy-do-not-replicate
description: "USE FOR: identifying legacy code patterns that MUST NOT be copied or replicated — God Objects, PubSub, old data-modules, class components, direct process.env access."
applyTo: "**"
---

## 4. Anti-Patterns & Refactoring (Legacy - Do Not Replicate)

The following patterns exist in the codebase but are considered technical debt. **Do not introduce new instances of these patterns.**

1.  **Atomic Design (`atoms`, `molecules`, `organisms`):** Do not add new components here. Use Library-First Architecture with NX conventions.
2.  **CMS Coupling (`cms-elements`):** Do not create new components that depend on `sys` or `fields` props.
3.  **Global Helpers Dump (`src/helpers`):** Do not add domain-specific logic to the global `helpers` folder. Move it to the relevant `src/libs/` or `src/shared/` library.
4.  **Defensive Coding in UI:** Do not use `props?.data?.fields?.items?.[0]?.title ?? ''`. Validate data at the boundary (Mapper/Hook).
5.  **Direct Apollo Usage:** Do not use `useQuery` directly in UI components. Wrap it in a custom hook.
6.  **Root Barrel Imports:** Do not import from `#libs/products` or `#shared/products` (root barrel). Always use explicit subpath imports like `#libs/products/util` or `#shared/products/ui`.

### Refactoring Thresholds & Legacy Code

- **Coupling Thresholds:**
  - **Warning Sign:** If a component has **> 20 imports** or **> 300 lines**, it is a candidate for immediate refactoring.
  - **Action:** Split into sub-components (visual) or extract hooks (logical).
- **Legacy Module Containment:**
  - **Target:** `src/data-modules` (e.g., `products.module.ts`).
  - **Problem:** These are "God Objects" that mix business logic, UI state, and API calls in a single file. They are hard to test and maintain.
  - **Rule:** Treat these modules as **"Read-Only"**. Do NOT extend them.
  - **New Features:** Implement new logic in `src/libs/` or `src/shared/` using modern patterns (Hooks/Context). Bridge data if needed, but do not add to the "God Module".
- **Service Layer:**
  - **Rule:** Extract business logic (validation, transformation, calculations) out of UI components into a Service Layer (`src/libs/<domain>/util/` or `src/shared/<domain>/util/`).
  - **Example:** `OrderService.validate(order)` or `PriceService.calculateTotal(items)` instead of inline logic in `OrderDetailsPage`.
- **Helper Purity:**
  - **Rule:** Helpers in `src/utils` or `src/helpers` must be **Pure Functions**. They should receive input and return output without side effects or dependency on global app state structure.
  - **Refactoring:** If a helper imports a Store or Context, it is NOT a helper. It is a Hook or a Service and belongs in `src/libs/` or `src/shared/`.
- **Explicit Data Freshness:**
  - **Context:** When using Apollo Client or any async data (e.g., `DistributorSelect`).
  - **Rule:** Explicitly define cache policies (`cache-first`, `network-only`) based on business needs.
  - **Invalidation:** When performing a mutation, explicitly trigger `refetchQueries` or cache updates. Do not rely on local state to "patch" the UI.
