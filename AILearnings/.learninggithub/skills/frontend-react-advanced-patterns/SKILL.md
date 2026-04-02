---
name: frontend-react-advanced-patterns
description: "USE FOR: HOCs, render props, compound components, context composition, advanced React patterns, polymorphic components, controlled/uncontrolled patterns."
---

## React Architecture & Component Design

### Advanced Patterns

- **Component Definition:** NEVER define a component inside another component. This causes state loss and focus issues on every render.
- **Error Boundaries:** Implement Error Boundaries (e.g., using `react-error-boundary`) to handle errors gracefully and provide fallback UIs.
- **Portals:** Use `createPortal` for modals, tooltips, and overlays to manage z-index and DOM hierarchy issues.
- **Context Optimization:** Split Context into separate providers for State and Dispatch to prevent unnecessary re-renders in consuming components.
- **Idle Timer:** Use `react-idle-timer` globally (in `_app` or Layout) for session timeout logic. Do not implement it per-page.
