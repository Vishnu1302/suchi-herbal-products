---
name: frontend-architectural-anti-patterns-and-refactoring-guide
description: "USE FOR: identifying code anti-patterns to avoid, refactoring strategies, migration patterns, technical debt identification, code smell detection and remediation."
---

## Architectural Anti-Patterns & Refactoring Guide

### ❌ Anti-Pattern: God Components & Orchestration Hell

**Problem:** Components managing multiple data sources (Cart, User, Products) and coordinating complex async flows in `useEffect`.
**Example (Bad):**

```tsx
// ❌ Bad: UI component acting as a controller
function CartSheet() {
  const { cart } = useCart();
  const { user } = useUser();
  const { offers } = useOffers();

  useEffect(() => {
    if (user && cart) {
      validateCart(cart);
    } // Orchestration logic in UI
  }, [user, cart]);

  return <div>...</div>;
}
```

**✅ Solution: Orchestration Hooks**
Extract coordination logic into a dedicated hook. The UI should only receive "ready-to-render" data.

```tsx
// ✅ Good: Logic extracted
function useCartSheetLogic() {
  // ... orchestration logic ...
  return { viewState, handlers };
}

function CartSheet() {
  const { viewState } = useCartSheetLogic();
  return <CartView data={viewState} />;
}
```

### ❌ Anti-Pattern: Implicit Layout Logic

**Problem:** Using conditional logic inside a generic layout to shift/hide elements based on props (e.g., `shift/pop` in arrays).
**Example (Bad):**

```tsx
// ❌ Bad: Layout guessing structure based on props
function BasicPageTemplate({ children, hasHero }) {
  const elements = React.Children.toArray(children);
  const hero = hasHero ? elements.shift() : null; // Magic shifting
  return (
    <div>
      {hero}
      <main>{elements}</main>
    </div>
  );
}
```

**✅ Solution: Explicit Composition**
Create specific layouts (`ContentOnlyLayout`, `HeroLayout`) and compose them explicitly.

```tsx
// ✅ Good: Explicit slots
function HeroLayout({ hero, children }) {
  return (
    <div>
      {hero}
      <main>{children}</main>
    </div>
  );
}
```

### ❌ Anti-Pattern: Boolean State Hell

**Problem:** Managing complex flows (Checkout) with multiple boolean flags (`isLoading`, `isError`, `isSuccess`).
**Example (Bad):**

```tsx
// ❌ Bad: Impossible states (loading=true AND error=true)
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
```

**✅ Solution: State Machines / Status Enum**
Use a single `status` field or a reducer to prevent impossible states.

```tsx
// ✅ Good
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');
```

### ❌ Anti-Pattern: False DRY (Coupling Business Flows)

**Problem:** Reusing a single component for distinct business flows (e.g., `ResetPassword` and `Registration`) just because they look similar. This leads to `if (mode === 'reset')` spaghetti.
**Example (Bad):**

```tsx
// ❌ Bad: Coupling distinct flows
function AuthStep({ mode }) {
  return (
    <div>
      {mode === 'reset' ? <ResetForm /> : <RegisterForm />}
      {mode === 'update' && <OldPasswordInput />}
    </div>
  );
}
```

**✅ Solution: AHA (Avoid Hasty Abstractions)**
Create separate components (`RegistrationStep`, `ResetPasswordStep`). Duplicate the UI markup if necessary, but keep the business logic decoupled.

### ❌ Anti-Pattern: God Hooks

**Problem:** Hooks that handle unrelated concerns (e.g., Auth + Routing + Analytics in `usePage`).
**Example (Bad):**

```ts
// ❌ Bad: Too many responsibilities
function usePage() {
  useAuthRedirect();
  useAnalytics();
  usePasswordValidation();
  // ... 200 lines of mixed logic
}
```

**✅ Solution: Hook Segmentation**
Split into atomic hooks: `useAuthRedirect`, `usePageTracking`. Compose them in a `usePageLogic` hook if needed, but keep implementations separate.

### ❌ Anti-Pattern: Dual State Management

**Problem:** Trying to sync URL parameters with local state using `useEffect`. This leads to infinite loops and inconsistent UI.
**Example (Bad):**

```tsx
// ❌ Bad: Syncing two sources of truth
const [search, setSearch] = useState(router.query.q);
useEffect(() => {
  setSearch(router.query.q);
}, [router.query.q]);
```

**✅ Solution: Derived State**
Treat the URL as the only source of truth.

```tsx
// ✅ Good: Derived state
const search = router.query.q as string;
const handleSearch = (val) => router.push({ query: { q: val } });
```

### ❌ Anti-Pattern: Async Race Conditions

**Problem:** Ignoring the order of async responses. If a user types "A", then "AB", the "A" response might arrive _after_ "AB", overwriting the correct result.
**Example (Bad):**

```tsx
// ❌ Bad: No cancellation
useEffect(() => {
  fetchResults(query).then(setResults);
}, [query]);
```

**✅ Solution: AbortController**
Always cancel stale requests.

```tsx
// ✅ Good: Cleanup with AbortController
useEffect(() => {
  const abortController = new AbortController();
  fetchResults(query, { signal: abortController.signal }).then(setResults);
  return () => abortController.abort();
}, [query]);
```
