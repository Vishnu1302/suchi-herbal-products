# Write Tests Prompt — Suchi Kids Fashion

## How to Use

Open Copilot Chat, type:

```
/write-tests [component or service name]
```

Example:

```
/write-tests CartService
/write-tests CheckoutComponent
```

---

## What Copilot Will Generate

- A complete `*.spec.ts` file
- Covers: component creation, input/signal state, user interactions, service calls
- Mocks all external dependencies (Firebase, HttpClient, Router, services)

---

## Prompt Template (Copilot reads this)

You are writing unit tests for **Suchi Kids Fashion** — Angular 17+ with Jasmine + TestBed.

### Target

**Name:** {{TARGET_NAME}}  
**Type:** {{component | service | guard | pipe}}  
**File:** {{FILE_PATH}}

Paste the code to test below:

```
{{PASTE_CODE_HERE}}
```

### Test Rules

1. **Mock everything external**
   - HttpClient → use `HttpClientTestingModule`
   - Firebase → mock `AuthService` with signals
   - Router → `RouterTestingModule` or `jasmine.createSpyObj`
   - Other services → `jasmine.createSpyObj` or manual mock object

2. **Signal state** — Set signal values directly to simulate state:

   ```typescript
   component.loading.set(true);
   fixture.detectChanges();
   ```

3. **Cover these scenarios minimum:**
   - ✅ Happy path (data loads, form submits, navigation happens)
   - ❌ Error path (service throws, form invalid, network fail)
   - 🔲 Edge cases (empty array, null user, 0 quantity)

4. **Async operations** — Use `fakeAsync` + `tick()` or `async/await` with `fixture.whenStable()`

5. **Auth-dependent components** — Always provide both:
   - Logged-in state: `currentUser: signal({ email: 'test@test.com', emailVerified: true })`
   - Logged-out state: `currentUser: signal(null)`

### Standard AuthService Mock

```typescript
const mockAuth = {
  currentUser: signal(null as any),
  loading: signal(false),
  isLoggedIn: false,
  isEmailVerified: true,
  displayName: "Test",
  photoURL: null,
  loginWithGoogle: jasmine.createSpy().and.resolveTo(),
  loginWithEmail: jasmine.createSpy().and.resolveTo(),
  register: jasmine.createSpy().and.resolveTo(),
  logout: jasmine.createSpy().and.resolveTo(),
};
```

### Standard CartService Mock

```typescript
const mockCart = {
  cartItems: signal([]),
  cartCount: signal(0),
  cartTotal: signal(0),
  addToCart: jasmine.createSpy(),
  removeFromCart: jasmine.createSpy(),
  clearCart: jasmine.createSpy(),
  updateQuantity: jasmine.createSpy(),
};
```

### Output Format

Produce a complete `{{target}}.spec.ts` file with:

- All imports
- `describe` block with `beforeEach`
- Minimum 5 `it` blocks covering the scenarios above
- Comments explaining what each test verifies
