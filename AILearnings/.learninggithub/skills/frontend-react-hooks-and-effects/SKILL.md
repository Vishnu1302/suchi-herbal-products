---
name: frontend-react-hooks-and-effects
description: "USE FOR: custom hooks design, useEffect rules (cleanup, dependencies, AbortController), hook composition, when to extract hooks, hook naming conventions."
---

## React Architecture & Component Design

### Hooks & Effects Best Practices

- **`useEffect` Discipline:**
  - **No Business Logic:** `useEffect` should NOT contain business logic. Extract logic to custom hooks or event handlers.
  - **Avoid "useEffect Hell":** Do not chain effects. Do not use effects for derived state (calculate it during render).
  - **Dependencies:** Always include ALL dependencies. If you think you need to omit one, you likely need `useRef` or to restructure your logic.
  - **Cleanup:** Always return a cleanup function for subscriptions/listeners.
- **`useRef`:** Use for accessing DOM elements and storing mutable values that don't trigger re-renders.
- **`forwardRef`:** REQUIRED when passing refs to child components in React 18.
