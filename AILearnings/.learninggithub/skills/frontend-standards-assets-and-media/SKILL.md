---
name: frontend-standards-assets-and-media
description: "USE FOR: image optimization, icon usage (SVG, sprite), static asset conventions, public/ directory rules, media file handling, lazy loading images."
---

## Coding Standards & Style

### Assets & Media

- **Images & Illustrations:**
  - **Pattern:** Do not hardcode image paths. Use the centralized registry.
  - **Usage:**
    ```typescript
    import { ILLUSTRATIONS_PATHS, ILLUSTRATION_NAMES } from '#assets/illustrations';
    // ...
    <img src={ILLUSTRATIONS_PATHS[ILLUSTRATION_NAMES.EMPTY_CART]} alt="Empty cart" />
    ```
