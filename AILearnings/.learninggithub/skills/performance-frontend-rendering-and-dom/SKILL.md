---
name: performance-frontend-rendering-and-dom
description: "USE FOR: DOM/rendering performance — layout thrashing, reflow/repaint, virtual DOM diffing, CSS containment, will-change, compositor layers."
---

## Frontend Performance

### Rendering and DOM

- **Minimize DOM Manipulations:** Batch updates where possible. Frequent DOM changes are expensive.
  - _Anti-pattern:_ Updating the DOM in a loop. Instead, build a document fragment and append it once.
- **Virtual DOM Frameworks:** Use React, Vue, or similar efficiently—avoid unnecessary re-renders.
  - _React Example:_ Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary renders.
- **Keys in Lists:** Always use stable keys in lists to help virtual DOM diffing. Avoid using array indices as keys unless the list is static.
- **Avoid Inline Styles:** Inline styles can trigger layout thrashing. Prefer CSS classes.
- **CSS Animations:** Use CSS transitions/animations over JavaScript for smoother, GPU-accelerated effects.
- **Defer Non-Critical Rendering:** Use `requestIdleCallback` or similar to defer work until the browser is idle.
