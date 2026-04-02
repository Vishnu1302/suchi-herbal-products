---
name: frontend-library-standards
description: "USE FOR: approved/forbidden npm packages, library version rules, when to use which library, dependency governance, package selection criteria."
applyTo: "**"
---

## Library Standards (Strict)

- **Dates:** Use **`dayjs`** (from dependencies). Do NOT use `date-fns` or native `Date` manipulation.
- **Toasts:** Use **`sonner`** for notifications.
  ```typescript
  import { toast } from 'sonner';
  toast.success('Saved successfully');
  ```
- **Class Names:** Use the **`classnames`** library. Do not concatenate strings manually.
  ```typescript
  // ✅ Good
  className={classNames(styles.btn, { [styles.active]: isActive })}
  ```
- **State Updates:** For complex nested state, use **`immer`**.
- **Legacy Ban:** Do NOT use `pubsub-js`. Use React Context or Zustand.
- **I18n:**
  - Use `react-i18next` hooks (`useTranslation`) instead of hardcoded strings.
  - **No Dynamic Keys:** Avoid `t('status.' + status)`. Use a map object instead to allow static analysis.
  - **Interpolation:** Use `{{value}}` in translation files, do not concatenate strings in code.
