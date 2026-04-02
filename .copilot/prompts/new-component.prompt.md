# New Component Prompt — Suchi Kids Fashion

## How to Use

Open Copilot Chat, type:

```
/new-component [name] in [domain] — [what it does]
```

Example:

```
/new-component wishlist-card in shop — displays a saved product with a remove button
```

---

## What Copilot Will Generate

Using this prompt, Copilot will create:

1. `frontend/src/app/domains/[domain]/[name]/[name].component.ts`
2. `frontend/src/app/domains/[domain]/[name]/[name].component.scss`
3. A suggested route entry to paste into the relevant `*.routes.ts`

---

## Prompt Template (Copilot reads this)

You are working on **Suchi Kids Fashion** — an Angular 17+ standalone component app.

Create a new Angular standalone component following ALL of these rules:

### Component Rules

- `standalone: true` — no NgModules
- All injections via `inject()` — no constructor parameters
- Separate `styleUrl: './[name].component.scss'` file
- Template inline in the `.ts` file
- Signals for local reactive state: `signal()`, `computed()`
- Reactive Forms if the component has inputs
- Lazy-loaded — suggest a route entry using `loadComponent`

### SCSS Rules

- Declare explicit horizontal padding in the component (not relying on `.container`)
- Use only CSS variables: `var(--color-primary)`, `var(--color-primary-alt)`, etc.
- Include breakpoints: `@media (max-width: 768px)` and `@media (max-width: 480px)`

### File Header Comment

Add a one-line comment at the top of the `.ts` file explaining the component's purpose.

---

## Component Request

{{COMPONENT_NAME}} — {{COMPONENT_DESCRIPTION}}

Domain folder: `frontend/src/app/domains/{{DOMAIN}}/`

Additional context:

- It should interact with: {{SERVICES_OR_SIGNALS}}
- It should display: {{DATA}}
- User interactions: {{INTERACTIONS}}
