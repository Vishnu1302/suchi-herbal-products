---
name: frontend-react-component-patterns
description: "USE FOR: React component structure — functional components, props patterns, composition, children patterns, component splitting, presentational vs container."
---

## React Architecture & Component Design

### Component Patterns

- **Functional Components:** Always use functional components. Class components are legacy.
- **Composition over Inheritance:** Use `children` prop and render props to compose UI.
- **Compound Components:** Use the Compound Component pattern for complex UI elements (e.g., Tabs, Accordions) to provide a flexible and expressive API.
- **Container/Presentational Pattern:**
  - **Container:** Handles data fetching (Apollo), state, and logic.
  - **Presentational:** Pure UI, receives data via props.
- **Single Responsibility:**
  - Break down large components (>300 lines).
  - Extract business logic into custom hooks (e.g., `useProductLogic`).
- **Custom Hooks:**
  - Encapsulate reusable stateful logic.
  - Naming: Always start with `use`.
  - Return objects `{ data, handlers }` rather than arrays `[data, handlers]` for better extensibility.
  - **Global vs. Feature Hooks:**
    - **Global Hooks (`src/hooks`):** Only for truly generic hooks (e.g., `useDebounce`, `useOnClickOutside`, `useWindowSize`).
    - **Domain Hooks:** Business-logic hooks (e.g., `useCart`, `useAuth`, `usePayment`) must be located in their respective `src/libs/{domain}/data-access/` or `src/shared/{domain}/data-access/` directory.
    - **Refactoring:** If you modify a business hook currently located in `src/hooks`, move it to the appropriate `data-access/` library.
