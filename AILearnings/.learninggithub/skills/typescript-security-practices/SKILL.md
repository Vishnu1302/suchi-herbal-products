---
name: typescript-security-practices
description: "USE FOR: input validation (Zod), XSS prevention (DOMPurify), CSRF protection, secure coding patterns, URL validation, sanitization, rel=noopener noreferrer."
---

## Security Practices

- **Content Sanitization (XSS Prevention):**
  - **Rich Text:** When rendering HTML from CMS or external sources, NEVER use `dangerouslySetInnerHTML` directly with raw strings.
  - **Sanitization:** Always use a sanitization library (e.g., `dompurify`) before rendering.
  - **Wrapper:** Prefer using a dedicated `SafeHtml` component that handles sanitization centrally.
- **Links:** Any link with `target="_blank"` MUST have `rel="noopener noreferrer"`.
- **URL Params:** Do not trust `useRouter().query` blindly. Validate/parse all URL parameters (e.g., with Zod) before using them in logic.
- Validate and sanitize external input with schema validators or type guards.
- Avoid dynamic code execution and untrusted template rendering.
- Encode untrusted content before rendering HTML; use framework escaping or trusted types.
- Use parameterized queries or prepared statements to block injection.
- Keep secrets in secure storage, rotate them regularly, and request least-privilege scopes.
- Favor immutable flows and defensive copies for sensitive data.
- Use vetted crypto libraries only.
- Patch dependencies promptly and monitor advisories.
