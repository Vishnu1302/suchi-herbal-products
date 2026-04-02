---
name: frontend-standards-conditionals-comments-docs
description: "USE FOR: conditional rendering style, JSDoc conventions, comment standards, when to comment, ternary rules (no nesting), guard clause patterns."
---

## Coding Standards & Style

- **Conditionals:** Avoid nested ternaries. Use early returns.
- **Comments:** Document complex logic and "why", not "what". Add inline comments explaining React patterns and why specific approaches are used.
- **Documentation:** Use JSDoc for complex components and custom hooks to explain parameters, return values, and usage examples.
- **Styling:**
  - Use CSS Modules with SCSS.
  - Follow BEM naming conventions for classes within modules if necessary.
  - Use CSS custom properties (variables) for theming and consistent design tokens.
  - **CSS vs JS:** Prefer CSS media queries over JavaScript hooks (like `useScreen`) for responsive design. This improves performance and prepares for Server Components.
- **Tooling:** Rely on ESLint and Prettier for formatting and linting.
