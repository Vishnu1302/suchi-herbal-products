# SUCHIHERBALPRODUCTS — Global Copilot Instructions

You are an expert Angular 17+ developer and full-stack engineer working on
**SUCHIHERBALPRODUCTS**, a kids clothing ecommerce platform.

Read this entire file before responding to any request.

---

## Project Overview

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Frontend | Angular 17+ standalone components, SCSS          |
| State    | Angular signals (`signal`, `computed`, `effect`) |
| Auth     | Firebase v9 modular SDK (`firebase/auth`)        |
| Backend  | Node.js + Express + TypeScript                   |
| Database | MongoDB Atlas + Mongoose                         |
| Images   | Cloudinary (upload-on-submit via Multer)         |
| Hosting  | (TBD – Azure/Firebase Hosting)                   |

---

## Repository Structure

```
SuchiECommerce/
├── frontend/                        # Angular app
│   └── src/
│       ├── app/
│       │   ├── app.routes.ts        # Root: /  /admin  /auth  /products
│       │   ├── app.config.ts
│       │   ├── core/
│       │   │   ├── guards/
│       │   │   │   └── admin.guard.ts      # Async guard — awaits Firebase auth
│       │   │   ├── models/                 # product, order, inventory models
│       │   │   └── services/
│       │   │       ├── auth.service.ts     # Firebase auth, signals
│       │   │       └── firebase.service.ts # FirebaseAuthToken InjectionToken
│       │   ├── domains/
│       │   │   ├── admin/                  # Admin shell + dashboard/products/inventory/orders
│       │   │   ├── auth/                   # /auth/login  /auth/register
│       │   │   └── shop/                   # Home, catalog, detail, cart, checkout, order-success
│       │   └── shared/                     # navbar, footer, not-found
│       ├── environments/
│       │   └── environment.ts              # apiUrl, firebase config, adminEmails[]
│       └── styles.scss                     # Global CSS variables + utility classes
├── backend/                         # Express API
│   └── src/
│       ├── routes/                  # products, orders, inventory, uploads
│       ├── models/                  # Mongoose schemas
│       └── config/
│           └── cloudinary.ts
└── .github/
    ├── copilot-instructions.md      # ← You are here
    └── agents/                      # Specialised agent definitions
```

---

## Frontend Conventions

### Components

- **Always** use standalone components (`standalone: true`)
- **Never** use NgModules
- Use `inject()` for dependency injection (never constructor injection)
- One component per folder; folder name = component name kebab-case
- Every component has its own `.scss` file via `styleUrl:` (NOT inline `styles: []`)
- Templates should be in a separate `.html` file

### State Management

- Use Angular **signals** for local state: `signal()`, `computed()`, `effect()`
- Use `toSignal()` from `@angular/core/rxjs-interop` to bridge observables
- No NgRx — keep it signals + services

### Routing

- All routes are **lazy-loaded** using `loadChildren` or `loadComponent`
- Route guards are `CanActivateFn` (functional, async-capable)

### Forms

- Use **Reactive Forms** (`FormBuilder`, `FormGroup`, `Validators`)

---

## Design System — SCSS

### Theme: Dark Gold Luxury

Aurea uses a **dark herbal-ash + metallic gold** theme. All colours, spacing, and component styles derive from tokens in `styles.scss`.

### CSS Custom Properties (defined in `styles.scss` `:root`)

```scss
/* Backgrounds */
--bg-main: #0a0f0d /* page base */ --bg-surface: #0f1710 /* cards / panels */
  --bg-elevated: #182018 /* inputs, dropdowns */ /* Gold palette */
  --gold-primary: #d4af37 --gold-secondary: #e6c76a --gold-soft: #f5e6a8
  --gold-dark: #b8860b --gold-glow: rgba(212, 175, 55, 0.35)
  /* Semantic aliases */ --color-primary: #d4af37 /* = gold-primary */
  --color-primary-alt: #e6c76a --color-primary-dark: #b8860b
  --color-text: #f0edd8 --color-text-muted: #9e9470
  --color-border: rgba(212, 175, 55, 0.22) --color-accent: #6bae75
  /* success green */ /* Header */ --header-bg: #0b0f0d
  --header-border: rgba(212, 175, 55, 0.12) /* Radii */ --radius-sm: 8px |
  --radius-md: 14px | --radius-lg: 22px | --radius-full: 9999px /* Shadows */
  --shadow-sm / --shadow-md / --shadow-lg / --shadow-gold;
```

### SCSS Variables (`$var` — use in mixins/functions only)

All tokens also exist as SCSS `$variables` at the top of `styles.scss`:
`$gold-primary`, `$gold-secondary`, `$gold-soft`, `$gold-dark`, `$bg-main`, `$bg-surface`, `$bg-elevated`, `$color-text`, `$color-text-muted`, `$color-border`, `$radius-*`, `$shadow-*`, `$bp-sm/md/lg/xl`

### Global Mixins (use these — do NOT re-implement)

```scss
@include btn-gold($padding, $font-size) // gold gradient CTA button
  @include btn-gold-pill($padding) // rounded pill sign-in button
  @include input-dark // dark form input with gold focus ring
  @include card-dark($hover: true) // dark surface card with optional lift hover
  @include respond-to(sm|md|lg|xl) // max-width media query shorthand
  @include page-section($pad-y); // page wrapper with max-width + padding
```

### Breakpoints (mobile-first — default styles target mobile, override up)

| Name | Value  | Use for       |
| ---- | ------ | ------------- |
| `sm` | 480px  | phones        |
| `md` | 768px  | tablets       |
| `lg` | 1024px | small desktop |
| `xl` | 1280px | wide desktop  |

```scss
/* Mobile-first pattern */
.my-layout {
  grid-template-columns: 1fr; /* mobile default */

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; /* tablet+ */
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); /* desktop */
  }
}

/* Or use the mixin for max-width overrides */
@include respond-to(md) {
  /* ≤ 768px */
}
```

### SCSS Rules

- **Never hardcode** colour hex values — always use `var(--token-name)` in component SCSS
- **Never hardcode** spacing / radius / shadow values that match a token — use `var()`
- Use `@include input-dark` for every form input (login, checkout, catalog filters)
- Use `@include card-dark` for every card surface
- Use `@include btn-gold` for every primary CTA button
- Use `@include btn-gold-pill` for header sign-in / pill buttons
- Responsive: write mobile styles first, then use `@media (min-width: …)` to override up
- Use `box-sizing: border-box` on any component that controls its own width
- The `@forward 'styles'` is **not** set up — to use mixins in a component SCSS, use `@use '../../../styles' as s` and call `s.btn-gold()`, or rely on the global CSS vars

---

## Authentication

- Firebase **Google** + **Email/Password** sign-in
- After email/password register → `sendEmailVerification()` is called
- `AuthService` exposes:
  - `currentUser` — signal `<User | null>`
  - `loading` — signal `<boolean>` (true until Firebase resolves)
  - `isLoggedIn` — getter
  - `isEmailVerified` — getter (Google users always return `true`)
  - `displayName`, `photoURL` — getters
- Admin guard (`admin.guard.ts`) is **async** — it awaits `auth.loading` before checking
- Admin emails are in `environment.ts → adminEmails[]`

---

## Backend Conventions

- TypeScript throughout (`ts-node-dev` for dev, compiled for prod)
- Every route file exports an Express `Router`
- Mongoose models in `src/models/`
- Environment variables via `dotenv` (`.env` file, never committed)
- Cloudinary upload: `POST /api/uploads/image` (Multer memory → upload_stream)
- CORS is enabled for `http://localhost:4200` in development

---

## Key Gotchas (Read These!)

1. **Component SCSS specificity**: Angular scopes component styles with higher specificity than `styles.scss`. A component rule like `.foo { padding: 0 }` will override a global `.container { padding: 0 24px }`. Always declare horizontal padding inside the component SCSS when you want side spacing.

2. **Admin guard race condition**: The guard is `async` and awaits `auth.loading` becoming `false` before checking `currentUser()`. If you refactor this guard, preserve that wait.

3. **Image upload flow**: File is selected (preview shown) → uploaded to Cloudinary ONLY on form submit → product is saved only if upload succeeds. Do not change this flow.

4. **Firebase auth timing**: `onAuthStateChanged` resolves asynchronously on page load. Never check `currentUser()` synchronously at app start — always check `loading()` first.

5. **Mock data flag**: `environment.useMockData` toggles between live backend and in-memory mocks. Services should check this.

---

## Code Style

- TypeScript: strict mode, no `any` unless unavoidable (comment why)
- 2-space indentation
- Single quotes for TypeScript strings, double quotes in templates
- `async/await` over `.then()` chains
- Named exports, not default exports (exception: route files)
- Keep component files under ~300 lines; split if larger

---

## What NOT To Do

- ❌ Do not add NgModules
- ❌ Do not use inline `styles: [...]` in component decorators — always use `styleUrl:`
- ❌ Do not hardcode colour hex values in SCSS — use CSS variables
- ❌ Do not use `localStorage` for auth state — Firebase handles persistence
- ❌ Do not synchronously check `currentUser()` in guards without awaiting auth loading
- ❌ Do not use constructor injection — use `inject()`
