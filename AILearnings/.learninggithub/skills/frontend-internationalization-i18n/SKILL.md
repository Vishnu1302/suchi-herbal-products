---
name: frontend-internationalization-i18n
description: "USE FOR: i18n implementation with i18next, translation key patterns, locale handling, language switching, pluralization, interpolation, namespace organization."
---

## Internationalization (i18n)

- **Mechanism:** Currently, translations are often passed as props from CMS elements or retrieved via `getTranslation` helper.
- **No Hardcoding:** Do NOT hardcode strings. Always use the translation mechanism provided in the context of the component.
- **Formatting:** Be aware of specific locale requirements (e.g., Myanmar numerals). Check `#helpers/` for existing formatting utilities before using standard JS methods.
