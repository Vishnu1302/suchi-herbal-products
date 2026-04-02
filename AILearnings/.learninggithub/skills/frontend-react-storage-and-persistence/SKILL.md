---
name: frontend-react-storage-and-persistence
description: "USE FOR: localStorage/sessionStorage patterns (safeSessionStorage), persistence strategies, client-side caching, storage key conventions, data serialization."
---

## 3. React Architecture & Component Design

### Storage & Persistence

- **❌ Anti-Pattern:** Do NOT use `window.localStorage` or `window.sessionStorage` directly.
- **✅ Best Practice:** Use the project's safe storage wrappers to handle SSR compatibility and security.
  - Import: `import { safeSessionStorage } from '#helpers/safeSessionStorage';`
  - Usage: `safeSessionStorage.getItem(KEY)`
