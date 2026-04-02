---
name: frontend-tech-stack-and-context
description: "USE FOR: understanding the complete tech stack, all dependencies with versions, project context, high-level architecture overview. READ THIS for any new feature or significant change."
applyTo: "**"
---

## Tech Stack & Context (CRITICAL)

- **React:** Version 18.3.1.
  - **ALLOWED:** Concurrent features (`startTransition`, `useDeferredValue`), Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useId`, `useTransition`).
  - **FORBIDDEN (React 19+):** `use()` hook, `<Activity>`, `useEffectEvent`, `cacheSignal`, `useFormStatus`, `useOptimistic`, `useActionState`, Actions API, `ref` as a prop (must use `forwardRef`), Context without Provider.
- **Next.js:** Version 14.2 (Pages Router architecture).
  - **Primary Directory:** `pages/` for routes.
  - **FORBIDDEN:** App Router patterns (`app/` directory, `layout.tsx`, Server Components) unless explicitly working on a migration task.
- **State Management:**
  - **Server State:** Apollo Client (GraphQL) connecting to **Apollo Federation (BFF)**.
  - **Code Generation:** We use GraphQL Code Generator. Always use generated hooks (`useGet...Query`) and types.
  - **UI State:** React Context (for dependency injection/global config), Local State.
  - **Legacy:** Zustand & Zoov (DEPRECATED - do not use for new state), PubSub (BANNED).
  - **Single Source of Truth:** Avoid duplicating server data (Apollo) into local state.
- **Styling:** SCSS / CSS Modules.
- **Testing:** Vitest / React Testing Library.
