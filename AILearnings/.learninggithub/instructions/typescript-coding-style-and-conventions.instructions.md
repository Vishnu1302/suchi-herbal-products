---
name: typescript-coding-style-and-conventions
description: "USE FOR: TypeScript coding style — boolean naming (is/has/should/can), guard clauses, strict equality, destructuring, const assertions, template literals. ALWAYS RELEVANT."
applyTo: "**"
---

## Coding Style & Conventions

- **Boolean Naming:** Boolean variables must use prefixes: `is`, `has`, `should`, `can` (e.g., `isLoading`, not `loading`).
- **Guard Clauses:** Prefer early returns over `else` blocks to keep nesting flat.
  ```typescript
  // ✅ Good
  if (!user) return null;
  return <Component />;
  ```
- **Async/Await:** Always use `async/await`. Avoid `.then()` chains.
- **Destructuring:** Destructure props and objects immediately.
- **Equality:** Always use strict equality `===`.
- **Magic Numbers:** Extract numbers and string literals to named constants.
- **Console:** No `console.log` allowed. Use `#logger`.
- **Conditionals:** Avoid nested ternary operators. If logic is complex, use `if/else` or extract to a function/variable.
- **Spacing:** Use vertical spacing (blank lines) to group related logic blocks within functions.
- Run the repository's lint/format scripts (e.g., `npm run lint`) before submitting.
- Match the project's indentation, quote style, and trailing comma rules.
- Keep functions focused; extract helpers when logic branches grow.
- Favor immutable data and pure functions when practical.
