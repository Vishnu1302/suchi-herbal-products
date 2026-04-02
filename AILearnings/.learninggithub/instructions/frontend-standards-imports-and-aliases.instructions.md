---
name: frontend-standards-imports-and-aliases
description: "USE FOR: import order rules, # path alias conventions (#libs/, #shared/, #components/), barrel exports (explicit named only), circular dependency prevention."
applyTo: "**"
---

## Coding Standards & Style

- **Imports:**
  - No need to `import React from 'react'` (JSX Transform is enabled).
  - **Aliases:** Use `#` prefix for internal modules as defined in `tsconfig.json` paths (e.g., `#helpers/...`, `#components/...`, `#logger`). Avoid deep relative imports (e.g., `../../../../utils`).
