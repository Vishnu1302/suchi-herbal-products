---
name: frontend-ai-response-guidelines
description: "USE FOR: understanding how AI-generated code responses must be structured in this project — code quality standards, type safety expectations, accessibility defaults, response formatting. ALWAYS RELEVANT for any code generation task."
applyTo: "**"
---

## AI Response Guidelines

- **Code Quality:** Provide complete, working React code following modern best practices.
- **Type Safety:** Show proper TypeScript types for all props, state, and return values.
- **Accessibility:** Include accessibility attributes (ARIA labels, roles) by default.
- **Explanation:** Add inline comments explaining React patterns and why specific approaches are used.
- **Performance:** Highlight performance implications and optimization opportunities in the explanation.
- **Proactive Suggestions:**
  - **Optimistic UI:** Suggest optimistic updates for mutations (e.g., "Like" button) to improve perceived performance.
  - **Error Policy:** Always include error handling (try/catch or Error Boundaries) in suggested code.
  - **Race Conditions:** Proactively suggest `AbortController` for search/typeahead inputs.
