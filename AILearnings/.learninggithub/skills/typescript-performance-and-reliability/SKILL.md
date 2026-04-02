---
name: typescript-performance-and-reliability
description: "USE FOR: TypeScript performance patterns — avoiding unnecessary re-renders, memo patterns, lazy initialization, tree-shakeable exports, memory leak prevention."
---

## Performance & Reliability

- Lazy-load heavy dependencies and dispose them when done.
- Defer expensive work until users need it.
- Batch or debounce high-frequency events to reduce thrash.
- Track resource lifetimes to prevent leaks.
