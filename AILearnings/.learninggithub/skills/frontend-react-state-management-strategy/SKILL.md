---
name: frontend-react-state-management-strategy
description: "USE FOR: state management decisions — Apollo Client for server state, React Context for UI state, useState/useReducer patterns, when NOT to use global state. Zustand/PubSub are BANNED for new code."
---

## React Architecture & Component Design

### State Management Strategy

- **Server State (Apollo Client):**
  - **Primary Source:** Apollo Client is the single source of truth for all server data.
  - **Custom Hooks for Data Access:**
    - **Encapsulation:** Components should never import `useQuery` or `gql` directly.
    - **Codegen:** Use generated hooks (e.g., `useGetCartQuery`) from the generated file, NOT manual `useQuery`.
    - **Pattern:** Create a domain-specific custom hook (e.g., `useCartData()`) that wraps the generated hook to map/transform data.
    - **Return Values:** The hook should return clean, mapped data ready for the UI, not the raw GraphQL response structure.
  - **Cost Efficiency & Caching:**
    - **Cache Policy:** Prefer `cache-first` (default) to minimize network requests and reduce costs. Use `network-only` sparingly.
    - **Fragments:** Use GraphQL Fragments to request ONLY the data needed by a component. Avoid over-fetching.
  - Do NOT sync server data into local `useState` (causes "two sources of truth").
  - Use `optimisticResponse` for better UX.
- **Local State:** `useState` for simple UI state, `useReducer` for complex state transitions.
- **URL State (Single Source of Truth):**
  - **Rule:** For filterable lists, search results, or any shareable view state, the URL Query Parameters are the Single Source of Truth.
  - **Pattern:** Derive UI state from `useRouter().query`. Do NOT sync URL state into a local `useState`.
  - **Why:** Prevents "Dual State" bugs where the URL and internal state get out of sync.
- **Global State:**
  - **Zoov/Zustand (Legacy/Deprecated):**
    - **Status:** Do NOT use `zoov` or `zustand` for new features.
    - **Preferred Alternative:** Use **Apollo Client** (it serves as the primary state manager for both Server and Client side).
    - **Codegen:** Always use **generated hooks** from GraphQL Code Generator.
    - **Atomic Selectors:** If modifying existing legacy code, NEVER subscribe to the whole store. Select specific values: `useStore(state => state.value)`.
  - Use **React Context** for low-frequency updates (Theme, User Session).
  - Avoid Prop Drilling (>2 levels). Use Composition or Context.
  - **PubSub:** STRICTLY BANNED. Use React Context or explicit props.
