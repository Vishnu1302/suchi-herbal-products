---
name: frontend-forms-and-validation
description: "USE FOR: form implementation (React Hook Form, TanStack Form), validation patterns (Zod schemas), form state management, field validation, error display, form submission handling."
---

## Forms & Validation

- **Architecture:**
  - **Controlled vs Uncontrolled:** Both are allowed. Use Uncontrolled (refs) for performance-critical forms.
  - **Validation:** Use **Zod** for schema validation.
  - **Libraries:** Prefer **React Hook Form** or **TanStack Form** over custom solutions or the legacy DS `useForm` hook.
- **UX:**
  - Debounce validation for better user experience.
  - Handle loading and error states explicitly.
