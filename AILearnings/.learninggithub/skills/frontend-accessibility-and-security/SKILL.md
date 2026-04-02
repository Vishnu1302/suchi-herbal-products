---
name: frontend-accessibility-and-security
description: "USE FOR: a11y requirements (ARIA, roles, focus management, screen readers), security practices for frontend (XSS prevention, CSP, sanitization, rel=noopener). DO NOT USE FOR: backend security, API auth."
---

## Accessibility (a11y) & Security

- **Standards:** Build inclusive interfaces following **WCAG 2.1 AA** standards.
- **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<ul>`/`<ol>`. Avoid `div` soup.
- **Visuals vs Semantics:** Do not use HTML elements (like empty `<div>`s) for purely visual effects (e.g., dividers). Use CSS borders or pseudo-elements to avoid polluting the accessibility tree.
- **Keyboard Navigation:** Ensure all interactive elements are focusable and usable via keyboard.
- **ARIA:** Use ARIA attributes only when semantic HTML is insufficient. Note: Design System components may enforce specific ARIA patterns.
- **Security:**
  - **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
  - Sanitize `dangerouslySetInnerHTML` (use a library like `dompurify`).
  - Validate all inputs.
  - **Storage:** Avoid storing sensitive data (tokens, PII) in `localStorage` or `sessionStorage`. Use secure cookies or memory.
