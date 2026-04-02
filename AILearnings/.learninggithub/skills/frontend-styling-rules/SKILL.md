---
name: frontend-styling-rules
description: "USE FOR: CSS/SCSS rules, CSS Modules conventions, className patterns with classnames library, theming approach, responsive design, SCSS variables/mixins."
---

## Styling Rules

- **File Naming:** Always use CSS Modules: `ComponentName.module.scss`.
- **Nesting Depth:** Maximum nesting level is **3**. Deeper nesting causes performance issues and specificity wars.
- **Variables:** Do NOT use hardcoded hex codes (`#ff0000`). Use SCSS variables (`$color-primary`) for consistency.
- **UI Library Overrides:** When overriding `@eazle_team/ui_components`, use `className` or `style` props. Do NOT use global CSS selectors that might affect other instances.
- **Reset CSS:** Do NOT add custom resets. Rely on `the-new-css-reset` (already included).
- **Z-Index:** Do not use magic numbers (`z-index: 9999`). Use a centralized SCSS variable map.
- **Layout Stability:** Use `aspect-ratio` for media containers to prevent CLS.
