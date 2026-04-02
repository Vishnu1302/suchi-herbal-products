---
name: frontend-analytics-and-gtm
description: "USE FOR: Google Tag Manager integration, analytics event tracking, dataLayer pushes, GTM container configuration, tracking implementation patterns."
---

## Analytics & GTM

- **Event Tracking:** Interactive elements often require GTM tracking. Check for existing GTM wrappers (e.g., `InputGTMWrapper`) before using standard HTML elements.
- **Separation:** Try to keep GTM logic inside custom hooks or specific handlers, avoiding clutter in the main render function.
- **Implementation:**
  - **❌ Anti-Pattern:** Do NOT use `window.dataLayer.push` directly in components.
  - **✅ Best Practice:** Use dedicated hooks located in `src/hooks/gtm/` (e.g., `useGenericGTMEvent`).
  - **Events:** Import event names from `#helpers/constants/gtmEvents`.
