---
name: project-immediate-refactoring-goals
description: "USE FOR: active refactoring priorities — what is currently being migrated, which modules are targeted for cleanup, immediate technical debt items."
applyTo: "**"
---

## 3. Immediate Refactoring Goals

When working on tasks, prioritize the following improvements (following the "Boy Scout Rule"):

1.  **Refactor Large Components:** Break down "God components" into smaller, single-responsibility units.
2.  **Extract Logic:** Move logic out of components into testable custom hooks.
3.  **Remove Legacy Patterns:**
    - Replace **PubSub** with explicit props or Context.
    - Replace **Zustand** with Context (for UI state) or Apollo (for Server state).
    - Replace **`useScreen`** with CSS Media Queries.
4.  **Fix TypeScript:**
    - Remove defensive coding (`?.`, `??`) inside UI components.
    - **Action:** Validate CMS data at the boundary (mapper level) using Zod or strict type guards BEFORE passing it to components. The UI should trust its props.
5.  **Clean Up Structure:** Move components from `cms-elements` or generic folders into specific `src/libs/` or `src/shared/` directories when touching them, following NX library conventions.
