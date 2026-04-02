---
name: frontend-performance-optimization
description: "USE FOR: frontend performance — lazy loading, React.memo, useMemo, useCallback, code splitting, bundle optimization, virtual lists, debouncing."
---

## Performance Optimization

### Rendering

- **Memoization (`React.memo`, `useMemo`, `useCallback`):**
  - **Do NOT** apply prematurely.
  - **Apply WHEN:**
    - Passing functions/objects to `useEffect` dependencies.
    - Passing props to memoized children (`React.memo`).
    - Performing expensive calculations (filtering large lists).
- **Virtualization:** Implement virtual scrolling (e.g., `react-window`) for large lists to maintain performance.
- **Concurrent Features (React 18):**
  - Use `startTransition` for non-urgent updates (e.g., filtering a list based on input) to keep the UI responsive.
  - Use `useDeferredValue` for deferring UI updates based on fast-changing values.

### Code Splitting & Loading

- **Dynamic Imports:** Use `next/dynamic` for heavy components (modals, charts) or components below the fold.
- **CMS Component Mapping:**
  - **Lazy Loading:** When mapping CMS content types to React components (e.g., in a `CmsRenderer`), always use `next/dynamic` to lazy load the components.
  - **Benefit:** This prevents the main bundle from bloating with code for components that might not be present on the current page.
- **Lazy Loading:** Use `React.lazy` and `Suspense` where appropriate (within Client-side boundaries).
- **Images:** Use `next/image` for automatic optimization (ensure domain config is correct).
- **Cost Efficiency:** Optimize for bandwidth and compute resources (e.g., proper image sizing, avoiding unnecessary polling).
