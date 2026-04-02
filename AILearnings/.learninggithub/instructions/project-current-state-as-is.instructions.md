---
name: project-current-state-as-is
description: "USE FOR: understanding current architecture state, known tech debt, legacy module locations, migration status, what exists today and why."
applyTo: "**"
---

## 1. Current State (The "As-Is")

The project is currently dealing with significant technical debt and a structure that has outgrown its initial design.

- **Architecture:** A mix of Atomic Design and a monolithic `cms-elements` folder. The structure is chaotic, making it difficult to distinguish between pages, reusable components, and CMS-specific logic.
- **CMS Coupling:** Strong, direct coupling with Contentful. Business logic is often intertwined with CMS data structures.
  - **Technical Debt (Mappers):** The current pattern of complex mappers (e.g., `createMapperObjectFromMultipleMappers`) is considered technical debt. It is painful to maintain, but if you must touch it, use the existing helpers in `src/mappers/` and `src/helpers/`. Do not invent new mapping patterns inline.
- **Code Quality Issues:**
  - **Large Files:** Key components (e.g., Product List Page) exceed 700 lines, mixing UI, complex business logic, and side effects.
  - **Spaghetti Code:** Logic is hard to follow, with "useEffect hell" causing circular dependencies and difficult debugging.
  - **State Management:** Fragmented across Apollo Client (Server State), Context, Local State, Zustand (Legacy), and PubSub (Legacy). Data is often duplicated.
  - **TypeScript:** "False safety" patterns are common (e.g., defensive checks for types guaranteed to exist, fallback to empty objects hiding errors).
  - **Styling:** Over-reliance on JavaScript for responsiveness (`useScreen`) instead of CSS.
