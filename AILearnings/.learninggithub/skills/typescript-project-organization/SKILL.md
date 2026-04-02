---
name: typescript-project-organization
description: "USE FOR: TypeScript module organization — barrel files, NX library layering (util/data-access/ui/feature-*), co-location rules, index.ts export patterns."
---

## Project Organization

- Follow the repository's folder and responsibility layout for new code.
- Use kebab-case filenames (e.g., `user-session.ts`, `data-service.ts`) unless told otherwise.
- Keep tests, types, and helpers near their implementation when it aids discovery.
- Reuse or extend shared utilities before adding new ones.
- **Barrel Files (index.ts):**
  - **Usage:** Use `index.ts` ONLY to define the public API of a feature/module.
  - **Restriction:** Do NOT use `export *` blindly. Explicitly export what is needed: `export { CartView } from './CartView';`.
  - **Internal Imports:** Inside a feature folder, import files directly (e.g., `import { Helper } from './utils'`) rather than going through the parent `index.ts` to avoid circular dependencies.
- **No Global Helpers Dump:**
  - **Contextual Helpers:** If a helper is specific to a domain (e.g., `getOfferShortDescription`), move it to that domain's folder (e.g., `features/offers/utils.ts`).
  - **Generic Utils:** Only truly generic, app-agnostic functions (like `formatDate` or `safeLocalStorage`) remain in `src/utils` or `src/helpers`.
  - **Refactor on sight:** When touching a file using a global helper, consider moving the helper closer to its usage.
- **Import Aliases (Strict):**
  - Always use `#` prefixed aliases defined in `tsconfig.json` instead of relative paths for: `#components/...`, `#helpers/...`, `#hooks/...`, `#logger`, `#mappers/...`.
  - **❌ Bad:** `import logger from '../../../../logger';`
  - **✅ Good:** `import logger from '#logger';`
