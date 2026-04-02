# Suchi Kids Fashion — Global Copilot Instructions

You are an expert Angular 17+ developer and full-stack engineer working on
**Suchi Kids Fashion**, a kids clothing ecommerce platform.

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

### CSS Custom Properties (defined in `styles.scss`)

```scss
--color-primary: #7412bf /* Main purple */ --color-primary-alt: #b66af1
  /* Lighter purple */ --color-primary-dark: #5a0f93 /* Darker purple */
  --color-secondary: #fbbf24 /* Amber / gold */ --color-accent: #22c55e
  /* Green (success) */ --color-bg: #f9fafb --color-surface: #ffffff
  --color-text: #2d2d2d --color-text-muted: #888888 --color-border: #f0e0d6;
```

### SCSS Rules

- Always use CSS variables (`var(--color-primary)`) — never hardcode colours
- Exception: third-party overrides or one-off dark backgrounds
- Component SCSS overrides global `.container` specificity — **always add horizontal padding explicitly** in component SCSS when you rely on max-width centering
- Responsive breakpoints: `480px` (mobile), `768px` (tablet), `1024px` (desktop)
- Use `box-sizing: border-box` on any component that controls its own width

### Responsive Pattern

```scss
/* Default: desktop */
.my-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  .my-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  /* phone tweaks */
}
```

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
